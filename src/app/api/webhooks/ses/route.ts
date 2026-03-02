import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'SES Webhook temporarily disabled — pending Cloudflare Email Workers migration' });
}
