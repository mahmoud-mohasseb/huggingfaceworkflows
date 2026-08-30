import { NextResponse } from 'next/server';
import { processInboundEvent } from '../../../../lib/triggers/eventRouter';

// GET: WhatsApp Webhook Verification Endpoint
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'hf_workflow_verify_secret';

  if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST: WhatsApp Inbound Message Event Endpoint
export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const entry = payload?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: 'ignored_no_message' });
    }

    const chatId = message.from;
    const text = message.text?.body || 'Hello WhatsApp';
    const senderName = value?.contacts?.[0]?.profile?.name || 'WhatsApp User';

    const authHeader = req.headers.get('authorization');
    const headerToken = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

    const execResult = await processInboundEvent({
      provider: 'whatsapp',
      chatId,
      senderName,
      text,
      hfToken: headerToken || process.env.HF_TOKEN,
    });

    return NextResponse.json({
      received: true,
      provider: 'whatsapp',
      chat_id: chatId,
      sender_name: senderName,
      inbound_text: text,
      execResult,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
