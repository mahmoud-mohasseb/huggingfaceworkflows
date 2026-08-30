import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bot_token, webhook_url } = body;

    if (!bot_token || !bot_token.includes(':')) {
      return NextResponse.json({ error: 'Valid Telegram Bot Token required' }, { status: 400 });
    }

    const targetUrl = webhook_url || `https://hfworkflow.app/api/webhooks/telegram?token=${bot_token}`;

    const tgRes = await fetch(`https://api.telegram.org/bot${bot_token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: targetUrl,
        allowed_updates: ['message', 'callback_query'],
      }),
    });

    const result = await tgRes.json();

    if (result.ok) {
      return NextResponse.json({
        success: true,
        message: 'Webhook registered successfully with Telegram API!',
        targetUrl,
        result,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.description || 'Failed to register webhook with Telegram API',
          result,
        },
        { status: 400 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
