import { NextResponse } from 'next/server';
import { checkAlerts } from '@/lib/taskTracker';

export async function GET() {
  const alerts = await checkAlerts();
  return NextResponse.json(alerts);
}
