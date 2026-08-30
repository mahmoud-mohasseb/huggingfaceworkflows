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

    // Step 2: Send test response to detected Telegram chat
    const responseText = `🤖 **HF Workflow AI Assistant**:\n\nHello! I successfully connected to your Telegram chat (Chat ID: \`${detectedChatId}\`).\n\nI received: "${latestText}" and processed it via Hugging Face.`;

    const tgRes = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: detectedChatId,
        text: responseText,
        parse_mode: 'Markdown',
      }),
    });

    const tgData = await tgRes.json();

    if (tgData.ok) {
      return NextResponse.json({
        ok: true,
        detectedChatId,
        messageId: tgData.result?.message_id,
        sentText: responseText,
        updatesFound,
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
