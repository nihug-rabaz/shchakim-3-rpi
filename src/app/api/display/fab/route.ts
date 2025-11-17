import { NextResponse } from 'next/server';

const API_BASE = 'https://shchakim.rabaz.co.il';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const boardId = url.searchParams.get('boardId');

  if (!boardId) {
    return NextResponse.json({ error: 'boardId required' }, { status: 400 });
  }

  try {
    const targetUrl = `${API_BASE}/api/display/content?boardId=${encodeURIComponent(boardId)}`;
    console.log(`[PROXY] Display-fab: proxying to ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.log(`[PROXY] Display-fab: error status ${response.status}`);
      return NextResponse.json({ error: 'Failed to fetch board info' }, { status: response.status });
    }

    const boardInfo = await response.json();
    console.log(`[PROXY] Display-fab: received board info for ${boardId}`, JSON.stringify({ show_fab: boardInfo.show_fab }));

    const showFab = boardInfo.show_fab === true;
    console.log(`[PROXY] Display-fab: show_fab value:`, boardInfo.show_fab, '-> showFab:', showFab);
    
    const fabData = {
      fab: {
        enabled: showFab,
        command: showFab ? '/fab-on' : '/fab-off'
      }
    };
    
    console.log(`[PROXY] Display-fab: returning fab data:`, JSON.stringify(fabData));

    return NextResponse.json(fabData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('[PROXY] Display-fab: error proxying request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

