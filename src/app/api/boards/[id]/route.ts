import { NextResponse, type NextRequest } from 'next/server';

const API_BASE = 'https://shchakim.rabaz.co.il';

type BoardUpdateData = {
  show_fab?: boolean;
  name?: string;
  display_name?: string;
  base_name?: string;
  base_description?: string | null;
  location?: string;
  theme?: {
    primaryHex?: string;
    gradient?: string[];
  };
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boardId } = await params;

  if (!boardId) {
    return NextResponse.json({ error: 'board id required' }, { status: 400 });
  }

  const targetUrl = `${API_BASE}/api/board-info?id=${encodeURIComponent(boardId)}`;
  console.log(`[PROXY] Boards GET: proxying request to ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch board' }, { status: response.status });
    }

    const boardInfo = await response.json();
    
    return NextResponse.json({
      id: boardId,
      name: boardInfo.name,
      display_name: boardInfo.display_name || boardInfo.displayName,
      base_name: boardInfo.base_name,
      base_description: boardInfo.base_description,
      location: boardInfo.location,
      show_fab: boardInfo.show_fab !== false,
      theme: boardInfo.theme,
      user_id: boardInfo.user_id,
      logical_board_id: boardInfo.logical_board_id
    });
  } catch (error) {
    console.error(`[PROXY] Boards GET: error proxying request:`, error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boardId } = await params;

  if (!boardId) {
    return NextResponse.json({ error: 'board id required' }, { status: 400 });
  }

  try {
    const body: BoardUpdateData = await request.json();
    
    const updateData: any = {};
    if (body.show_fab !== undefined) updateData.show_fab = body.show_fab;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.display_name !== undefined) updateData.display_name = body.display_name;
    if (body.base_name !== undefined) updateData.base_name = body.base_name;
    if (body.base_description !== undefined) updateData.base_description = body.base_description;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.theme !== undefined) updateData.theme = body.theme;

    const targetUrl = `${API_BASE}/api/boards/${boardId}`;
    console.log(`[PROXY] Boards PUT: proxying request to ${targetUrl}`, JSON.stringify(updateData));

    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update board' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[PROXY] Boards PUT: error proxying request:`, error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

