import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { deviceId?: string } | null;
  if (!body?.deviceId) {
    return NextResponse.json({ error: 'deviceId required' }, { status: 400 });
  }

  const pairingCode = Math.random().toString(36).slice(2, 8).toUpperCase();

  // TODO: persist pairingCode->deviceId server-side (Redis/DB). Stub for now.
  return NextResponse.json({ pairingCode });
}



