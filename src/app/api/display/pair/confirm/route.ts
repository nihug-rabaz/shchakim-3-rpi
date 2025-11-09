import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { pairingCode?: string; boardId?: string } | null;
  if (!body?.pairingCode || !body?.boardId) {
    return NextResponse.json({ error: 'pairingCode and boardId required' }, { status: 400 });
  }

  // TODO: validate pairingCode and issue deviceKey bound to boardId. Stub for now.
  const deviceKey = `DK_${crypto.randomUUID()}`;
  return NextResponse.json({ deviceKey, boardId: body.boardId });
}



