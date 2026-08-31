import { NextRequest, NextResponse } from 'next/server';

// Prevent Next.js from attempting to statically pre-render this route at build time.
// This is required for any route that reads dynamic request data (searchParams, body, etc.)
export const dynamic = 'force-dynamic';

// 1. Verification Endpoint l-Meta (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'aqarbot_secret_token_2026';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// 2. Reception dyal les messages (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('WhatsApp Webhook Event:', JSON.stringify(body, null, 2));

    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}