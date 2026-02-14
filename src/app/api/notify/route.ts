import { NextResponse } from 'next/server';

const TELEGRAM_CHAT_ID = '6128414881';

export async function POST(request: Request) {
  try {
    const { message, priority } = await request.json();
    
    // Here we would normally call the message tool
    // For now, log the notification and return success
    console.log(`[${priority.toUpperCase()}] Telegram notification to ${TELEGRAM_CHAT_ID}:`, message);
    
    // In production, this would call:
    // message.send({ target: TELEGRAM_CHAT_ID, message })
    
    return NextResponse.json({ success: true, sent: true });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send' }, { status: 500 });
  }
}
