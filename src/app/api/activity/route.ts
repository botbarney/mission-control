import { NextResponse } from 'next/server';
import { getActivityLog } from '@/lib/taskTracker';

export async function GET() {
  const activity = await getActivityLog();
  return NextResponse.json(activity);
}
