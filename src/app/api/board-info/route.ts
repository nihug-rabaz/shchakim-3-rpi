import { NextResponse } from 'next/server';

type BoardInfo = {
  linked: boolean;
  user_id?: number;
  name?: string;
  display_name?: string;
  displayName?: string;
  base_name?: string;
  base_description?: string | null;
  board_bid?: string;
  location?: string;
  logical_board_id?: number;
  prayers?: Array<{
    id: number;
    title: string;
    timeType: 'fixed' | 'relative';
    fixedTime?: string | null;
    relativeBase?: string | null;
    offsetMinutes?: number | null;
    dayOfWeek: 'weekday' | 'shabbat';
    background?: string;
    createdAt?: string;
  }>;
  updates?: Array<any>;
};

const API_BASE = 'https://shchakim.rabaz.co.il';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const boardId = url.searchParams.get('id');

  if (!boardId) {
    return NextResponse.json({ error: 'board id required' }, { status: 400 });
  }

  const targetUrl = `${API_BASE}/api/board-info?id=${encodeURIComponent(boardId)}`;
  console.log(`[PROXY] Board-info GET: proxying request to ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    console.log(`[PROXY] Board-info GET: response status ${response.status} for board ${boardId}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[PROXY] Board-info GET: error response: ${errorText}`);
      
      const displayContentUrl = `${API_BASE}/api/display/content?boardId=${encodeURIComponent(boardId)}`;
      console.log(`[PROXY] Board-info GET: Trying fallback to display-content: ${displayContentUrl}`);
      
      try {
        const displayContentResponse = await fetch(displayContentUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });
        
        if (displayContentResponse.ok) {
          const displayContent = await displayContentResponse.json();
          console.log(`[PROXY] Board-info GET: Got data from display-content fallback`);
          
          const fallbackData: BoardInfo = {
            linked: true,
            user_id: displayContent.boardInfo?.user_id,
            name: displayContent.boardInfo?.name,
            display_name: displayContent.boardInfo?.display_name,
            displayName: displayContent.boardInfo?.displayName,
            base_name: displayContent.boardInfo?.base_name,
            base_description: displayContent.boardInfo?.base_description,
            board_bid: displayContent.boardId,
            location: displayContent.boardInfo?.location,
            prayers: displayContent.prayers || [],
            updates: displayContent.updates || []
          };
          
          return NextResponse.json(fallbackData, {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
              'Pragma': 'no-cache'
            }
          });
        }
      } catch (fallbackError) {
        console.error(`[PROXY] Board-info GET: Fallback to display-content also failed:`, fallbackError);
      }
      
      return NextResponse.json({ linked: false }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache'
        }
      });
    }

    const data: BoardInfo = await response.json();
    console.log(`[PROXY] Board-info GET: success response:`, JSON.stringify(data));
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error(`[PROXY] Board-info GET: error proxying request for board ${boardId}:`, error);
    
    const displayContentUrl = `${API_BASE}/api/display/content?boardId=${encodeURIComponent(boardId)}`;
    console.log(`[PROXY] Board-info GET: Trying fallback to display-content after catch: ${displayContentUrl}`);
    
    try {
      const displayContentResponse = await fetch(displayContentUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      
      if (displayContentResponse.ok) {
        const displayContent = await displayContentResponse.json();
        console.log(`[PROXY] Board-info GET: Got data from display-content fallback (catch)`);
        
        const fallbackData: BoardInfo = {
          linked: true,
          user_id: displayContent.boardInfo?.user_id,
          name: displayContent.boardInfo?.name,
          display_name: displayContent.boardInfo?.display_name,
          displayName: displayContent.boardInfo?.displayName,
          base_name: displayContent.boardInfo?.base_name,
          base_description: displayContent.boardInfo?.base_description,
          board_bid: displayContent.boardId,
          location: displayContent.boardInfo?.location,
          prayers: displayContent.prayers || [],
          updates: displayContent.updates || []
        };
        
        return NextResponse.json(fallbackData, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache'
          }
        });
      }
    } catch (fallbackError) {
      console.error(`[PROXY] Board-info GET: Fallback to display-content also failed (catch):`, fallbackError);
    }
    
    return NextResponse.json({ linked: false }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache'
      }
    });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { board_id?: string; logical_board_id?: number; user_id?: number; name?: string } | null;

  if (!body?.board_id || !body?.logical_board_id || !body?.user_id) {
    return NextResponse.json({ error: 'board_id, logical_board_id and user_id required' }, { status: 400 });
  }

  const targetUrl = `${API_BASE}/api/board-info`;
  console.log(`[PROXY] Board-info POST: proxying request to ${targetUrl}`, JSON.stringify(body));

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    console.log(`[PROXY] Board-info POST: response status ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to claim board' }));
      console.log(`[PROXY] Board-info POST: error response:`, JSON.stringify(errorData));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log(`[PROXY] Board-info POST: success response:`, JSON.stringify(data));
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[PROXY] Board-info POST: error proxying request:`, error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

