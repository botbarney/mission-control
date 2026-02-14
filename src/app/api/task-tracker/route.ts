import { NextResponse } from 'next/server';
import { getTaskTrackerData } from '@/lib/taskTracker';

export async function GET() {
  const data = await getTaskTrackerData();
  return NextResponse.json(data);
}
