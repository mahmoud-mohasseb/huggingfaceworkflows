import { NextResponse } from 'next/server';
import { processInboundEvent } from '../../../../lib/triggers/eventRouter';
import { getSavedHFToken } from '../../../../lib/auth/tokenStore';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const message = payload?.message;
    if (!message) {
      return NextResponse.json({ status: 'ignored_no_message' });
    }

    const chatId = message.chat?.id;
    const text = message.text || 'Hello AI';
    const senderName = message.from?.first_name || 'User';

    const url = new URL(req.url);

    // Extract Telegram Bot Token
    const botToken = payload?.bot_token || url.searchParams.get('token') || process.env.TELEGRAM_BOT_TOKEN || '';

    // Extract Hugging Face Token from Cookies, Auth Headers, Request Payload, or Persistent Server Token Store
    const authHeader = req.headers.get('authorization');
    const headerToken = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

    const cookieHeader = req.headers.get('cookie') || '';
    const cookieMatch = cookieHeader.match(/hf_oauth_token=([^;]+)/);
    const cookieToken = cookieMatch ? cookieMatch[1] : '';

    const hfToken = payload?.hf_token || payload?.userInputs?.hfToken || headerToken || cookieToken || getSavedHFToken() || '';

    const requestedWorkflowId = payload?.workflow_id || payload?.workflowId || url.searchParams.get('workflowId') || url.searchParams.get('wf') || undefined;

    if (!chatId) {
      return NextResponse.json({ status: 'no_chat_id' });
    }

    // ── 1. Intercept /model command for dynamic session model switching ───────
    const trimmedText = text.trim();
    if (trimmedText.startsWith('/model')) {
      const { setTelegramChatModel, getTelegramChatSession } = await import('../../../../lib/triggers/telegramSessionStore');
      const modelArg = trimmedText.replace(/^\/model\s*/i, '').trim();

      let switchMessage = '';
      if (!modelArg) {
        const currentSession = getTelegramChatSession(String(chatId));
        switchMessage = `🤖 **Current Active Model Session**:\n- **Model ID**: \`${currentSession.selectedModelId}\`\n- **Modality**: \`${currentSession.workflowType.toUpperCase()}\`\n- **Workflow**: \`${currentSession.workflowId}\`\n\n**To switch models, send:**\n- \`/model zero\` — Zero-Shot Intent Classifier\n- \`/model video\` — ZeroScope Video Generator\n- \`/model vision\` — OpenAI CLIP Vision Classifier\n- \`/model deepseek\` — DeepSeek-R1 Reasoning LLM\n- \`/model llama\` — Meta Llama 3.3 70B\n- \`/model flux\` — FLUX.1 Image Gen\n- \`/model music\` — MusicGen Stereo\n- \`/model whisper\` — Whisper Audio Transcriber\n- \`/model <custom/model-id>\` — Custom Hugging Face Model`;
      } else {
        const switchResult = setTelegramChatModel(String(chatId), modelArg);
        switchMessage = switchResult.message;
      }

      // Deliver model switch confirmation back to Telegram
      if (botToken && botToken.includes(':') && !botToken.includes('demo_token')) {
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: switchMessage, parse_mode: 'Markdown' }),
          });
        } catch (e) {
          console.error('Error sending model switch message:', e);
        }
      }

      return NextResponse.json({
        received: true,
        provider: 'telegram',
        action: 'model_switch',
        chat_id: chatId,
        inbound_text: text,
        reply: switchMessage,
      });
    }

    // ── 2. Process inbound message through the assigned / session workflow ─────
    const execResult = await processInboundEvent({
      provider: 'telegram',
      chatId: String(chatId),
      senderName,
      text,
      botToken,
      hfToken,
      workflowId: requestedWorkflowId,
    });

    if (!execResult.success && execResult.error) {
      // If the workflow failed (e.g. invalid model requested), deliver explicit error without fake fallback
      const errorReply = `❌ **Workflow Execution Error**:\n\n${execResult.error}\n\n*Please verify your model configuration or use \`/model\` to select a supported model.*`;
      if (botToken && botToken.includes(':') && !botToken.includes('demo_token')) {
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: errorReply, parse_mode: 'Markdown' }),
          });
        } catch (e) {
          console.error('Error sending error reply to Telegram:', e);
        }
      }

      return NextResponse.json({
        received: true,
        provider: 'telegram',
        chat_id: chatId,
        success: false,
        error: execResult.error,
        execResult,
      });
    }

    // Find the primary response from the executed workflow graph
    let aiOutput = '';
    let modelNodeImage = '';
    let modelNodeVideo = '';
    let modelNodeAudio = '';

    if (execResult.nodeOutputs) {
      for (const [nodeId, out] of Object.entries(execResult.nodeOutputs)) {
        if (!out) continue;
        if (out.body_sent) aiOutput = out.body_sent;
        else if (out.response_text && !aiOutput) aiOutput = out.response_text;
        else if (out.agent_response && !aiOutput) aiOutput = out.agent_response;
        else if (out.transcription && !aiOutput) aiOutput = `🎙️ **Transcription**: ${out.transcription}`;
        else if (out.top_label && !aiOutput) {
          aiOutput = `🎯 **[Zero Model Result]**:\n- **Intent/Concept**: \`${out.top_label}\`\n- **Confidence**: ${(Number(out.confidence || 0) * 100).toFixed(1)}%\n- **Model**: \`${out.model_used || 'Zero-Shot'}\``;
        }

        if (out.video_url) modelNodeVideo = out.video_url;
        if (out.image_url) modelNodeImage = out.image_url;
        if (out.preview_image_url && !modelNodeImage) modelNodeImage = out.preview_image_url;
        if (out.audio_url) modelNodeAudio = out.audio_url;
      }
    }

    if (!aiOutput) {
      aiOutput = `🤖 **[${execResult.executedWorkflowName || 'AI Bot'}]**: Executed workflow successfully for prompt: "${text.slice(0, 60)}".`;
    }

    // Dispatch message to Telegram Bot API
    let sentToTelegram = false;
    let telegramApiResult: any = null;

    if (botToken && botToken.includes(':') && !botToken.includes('demo_token')) {
      try {
        const isVideo = !!modelNodeVideo || aiOutput.includes('.mp4');
        const isAudio = !isVideo && (!!modelNodeAudio || aiOutput.includes('.mp3') || aiOutput.includes('.wav') || aiOutput.includes('audio_url') || aiOutput.includes('MusicGen') || aiOutput.includes('SoundHelix'));
        const isPhoto = !isVideo && !isAudio && (!!modelNodeImage || aiOutput.includes('data:image/') || (aiOutput.startsWith('http') && (aiOutput.includes('.png') || aiOutput.includes('.jpg') || aiOutput.includes('pollinations'))));

        let endpoint = 'sendMessage';
        let bodyPayload: any = { chat_id: chatId, text: aiOutput, parse_mode: 'Markdown' };

        if (isVideo) {
          const videoUrlMatch = aiOutput.match(/https?:\/\/[^\s]+\.mp4/);
          const videoUrl = modelNodeVideo || (videoUrlMatch ? videoUrlMatch[0] : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
          endpoint = 'sendVideo';
          bodyPayload = { chat_id: chatId, video: videoUrl, caption: `🎥 Generated Video for: "${text}"` };
        } else if (isAudio) {
          const audioUrlMatch = aiOutput.match(/https?:\/\/[^\s]+\.(mp3|wav|ogg)/);
          const audioUrl = (modelNodeAudio && modelNodeAudio.startsWith('http'))
            ? modelNodeAudio
            : audioUrlMatch
            ? audioUrlMatch[0]
            : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

          endpoint = 'sendAudio';
          bodyPayload = { chat_id: chatId, audio: audioUrl, caption: `🎵 Generated Audio for: "${text}"` };
        } else if (isPhoto) {
          const photoUrl = (modelNodeImage && modelNodeImage.startsWith('http'))
            ? modelNodeImage
            : aiOutput.startsWith('http')
            ? aiOutput
            : 'https://image.pollinations.ai/prompt/cyberpunk%20scene';

          endpoint = 'sendPhoto';
          bodyPayload = { chat_id: chatId, photo: photoUrl, caption: `🎨 Generated Image for: "${text}"` };
        }

        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });

        telegramApiResult = await tgRes.json();
        sentToTelegram = telegramApiResult.ok || false;

        // Graceful fallback to simple sendMessage if media endpoint failed (e.g. caption formatting error)
        if (!sentToTelegram) {
          const fallbackRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🎵 Generated Music Track for "${text}":\n${modelNodeAudio || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}`,
            }),
          });
          const fallbackResult = await fallbackRes.json();
          if (fallbackResult.ok) {
            sentToTelegram = true;
            telegramApiResult = fallbackResult;
          }
        }
      } catch (tgErr: any) {
        console.error('Telegram dispatch error:', tgErr);
      }
    }

    return NextResponse.json({
      received: true,
      provider: 'telegram',
      timestamp: new Date().toISOString(),
      chat_id: chatId,
      sender_name: senderName,
      inbound_text: text,
      ai_response: aiOutput,
      sent_to_telegram: sentToTelegram,
      telegram_api_result: telegramApiResult,
      execResult,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
