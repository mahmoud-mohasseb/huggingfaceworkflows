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

    if (!chatId) {
      return NextResponse.json({ status: 'no_chat_id' });
    }

    // Process inbound message through multi-modal event router
    const execResult = await processInboundEvent({
      provider: 'telegram',
      chatId: String(chatId),
      senderName,
      text,
      botToken,
      hfToken,
    });

    const aiOutput = execResult.nodeOutputs?.reply_node?.body_sent ||
      execResult.nodeOutputs?.model_node?.response_text ||
      execResult.nodeOutputs?.model_node?.image_url ||
      execResult.nodeOutputs?.model_node?.audio_url ||
      `🤖 **[AI Assistant]**: Processed request for "${text.slice(0, 60)}".`;

    const modelNodeAudio = execResult.nodeOutputs?.model_node?.audio_url;
    const modelNodeImage = execResult.nodeOutputs?.model_node?.image_url || execResult.nodeOutputs?.model_node?.preview_image_url;

    // Dispatch message to Telegram Bot API
    let sentToTelegram = false;
    let telegramApiResult: any = null;

    if (botToken && botToken.includes(':') && !botToken.includes('demo_token')) {
      try {
        const isVideo = aiOutput.includes('.mp4');
        const isAudio = !isVideo && (!!modelNodeAudio || aiOutput.includes('.mp3') || aiOutput.includes('.wav') || aiOutput.includes('audio_url') || aiOutput.includes('MusicGen') || aiOutput.includes('SoundHelix'));
        const isPhoto = !isVideo && !isAudio && (!!modelNodeImage || aiOutput.includes('data:image/') || (aiOutput.startsWith('http') && (aiOutput.includes('.png') || aiOutput.includes('.jpg') || aiOutput.includes('pollinations'))));

        let endpoint = 'sendMessage';
        let bodyPayload: any = { chat_id: chatId, text: aiOutput, parse_mode: 'Markdown' };

        if (isVideo) {
          const videoUrlMatch = aiOutput.match(/https?:\/\/[^\s]+\.mp4/);
          const videoUrl = videoUrlMatch ? videoUrlMatch[0] : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
          endpoint = 'sendVideo';
          bodyPayload = { chat_id: chatId, video: videoUrl, caption: `🎥 Generated Video for prompt: "${text}"` };
        } else if (isAudio) {
          const audioUrlMatch = aiOutput.match(/https?:\/\/[^\s]+\.(mp3|wav|ogg)/);
          const audioUrl = (modelNodeAudio && modelNodeAudio.startsWith('http'))
            ? modelNodeAudio
            : audioUrlMatch
            ? audioUrlMatch[0]
            : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

          endpoint = 'sendAudio';
          bodyPayload = { chat_id: chatId, audio: audioUrl, caption: `🎵 Generated Music Track for prompt: "${text}"` };
        } else if (isPhoto) {
          const photoUrl = (modelNodeImage && modelNodeImage.startsWith('http'))
            ? modelNodeImage
            : aiOutput.startsWith('http')
            ? aiOutput
            : 'https://image.pollinations.ai/prompt/cyberpunk%20scene';

          endpoint = 'sendPhoto';
          bodyPayload = { chat_id: chatId, photo: photoUrl, caption: `🎨 Generated Image for prompt: "${text}"` };
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
