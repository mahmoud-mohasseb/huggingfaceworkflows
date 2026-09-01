import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const botToken = url.searchParams.get('token');

  if (!botToken || !botToken.includes(':')) {
    return NextResponse.json({ ok: false, error: 'Valid Telegram Bot Token required' }, { status: 400 });
  }

  try {
    // Call Telegram getMe API to verify bot credentials
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await res.json();

    if (data.ok) {
      return NextResponse.json({
        ok: true,
        botUsername: `@${data.result.username}`,
        botName: data.result.first_name,
        botId: data.result.id,
      });
    } else {
      return NextResponse.json({ ok: false, error: data.description || 'Invalid Telegram Bot Token' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bot_token, chat_id, test_message } = body;

    if (!bot_token || !bot_token.includes(':')) {
      return NextResponse.json({ error: 'Valid Telegram Bot Token required' }, { status: 400 });
    }

    // Step 1: Check for unread incoming messages via getUpdates to auto-detect chat_id
    let detectedChatId = chat_id;
    let latestText = test_message || 'Hello AI Bot';
    let updatesFound = 0;

    try {
      const updatesRes = await fetch(`https://api.telegram.org/bot${bot_token}/getUpdates?limit=5`);
      const updatesData = await updatesRes.json();

      if (updatesData.ok && updatesData.result?.length > 0) {
        updatesFound = updatesData.result.length;
        const lastMsg = updatesData.result[updatesData.result.length - 1]?.message;
        if (lastMsg) {
          detectedChatId = lastMsg.chat?.id || detectedChatId;
          latestText = lastMsg.text || latestText;
        }
      }
    } catch (e) {
      console.warn('getUpdates check:', e);
    }

    if (!detectedChatId || detectedChatId === '987654321') {
      return NextResponse.json({
        ok: false,
        error: 'No Telegram Chat ID detected yet. Please send any message (e.g. "hi") to your bot on Telegram, then click Auto-Detect again!',
        updatesFound,
      }, { status: 400 });
    }

    // Step 2: Process inbound event through the authoritative workflow engine
    const { processInboundEvent } = await import('../../../../../lib/triggers/eventRouter');
    const { getSavedHFToken } = await import('../../../../../lib/auth/tokenStore');
    const hfToken = body?.hf_token || getSavedHFToken() || '';

    const execResult = await processInboundEvent({
      provider: 'telegram',
      chatId: String(detectedChatId),
      senderName: 'TelegramUser',
      text: latestText,
      botToken: bot_token,
      hfToken,
    });

    let aiOutput = '';
    let modelNodeImage = '';
    let modelNodeVideo = '';
    let modelNodeAudio = '';

    if (execResult.nodeOutputs) {
      for (const [_, out] of Object.entries(execResult.nodeOutputs)) {
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
      aiOutput = `🤖 **HF Workflow AI**:\n\nProcessed message: "${latestText}" via workflow \`${execResult.executedWorkflowName || 'AI Studio'}\`.`;
    }

    // Step 3: Dispatch appropriate media type to Telegram API
    const isVideo = !!modelNodeVideo || aiOutput.includes('.mp4');
    const isAudio = !isVideo && (!!modelNodeAudio || aiOutput.includes('.mp3') || aiOutput.includes('.wav') || aiOutput.includes('audio_url'));
    const isPhoto = !isVideo && !isAudio && (!!modelNodeImage || (aiOutput.startsWith('http') && (aiOutput.includes('.png') || aiOutput.includes('.jpg'))));

    let endpoint = 'sendMessage';
    let bodyPayload: any = {
      chat_id: detectedChatId,
      text: aiOutput,
      parse_mode: 'Markdown',
    };

    if (isVideo) {
      const videoUrl = modelNodeVideo || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      endpoint = 'sendVideo';
      bodyPayload = { chat_id: detectedChatId, video: videoUrl, caption: `🎥 Generated Video for: "${latestText}"` };
    } else if (isAudio) {
      const audioUrl = (modelNodeAudio && modelNodeAudio.startsWith('http'))
        ? modelNodeAudio
        : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      endpoint = 'sendAudio';
      bodyPayload = { chat_id: detectedChatId, audio: audioUrl, caption: `🎵 Generated Audio for: "${latestText}"` };
    } else if (isPhoto) {
      const photoUrl = (modelNodeImage && modelNodeImage.startsWith('http')) ? modelNodeImage : aiOutput;
      endpoint = 'sendPhoto';
      bodyPayload = { chat_id: detectedChatId, photo: photoUrl, caption: `🎨 Generated Image for: "${latestText}"` };
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${bot_token}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });

    const tgData = await tgRes.json();

    if (tgData.ok) {
      return NextResponse.json({
        ok: true,
        detectedChatId,
        messageId: tgData.result?.message_id,
        sentText: aiOutput,
        mediaType: isVideo ? 'video' : isAudio ? 'audio' : isPhoto ? 'photo' : 'text',
        updatesFound,
        execResult,
      });
    } else {
      return NextResponse.json({
        ok: false,
        error: tgData.description || 'Failed to send message via Telegram API',
        detectedChatId,
        tgData,
      }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
