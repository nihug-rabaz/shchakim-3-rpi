import { NextResponse } from 'next/server';
import BoardManager from '@/utils/BoardManager';

const API_BASE = 'https://shchakim.rabaz.co.il';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const boardId = url.searchParams.get('boardId');
  const emergencyUpdateParam = url.searchParams.get('emergencyUpdate');

  if (!boardId) {
    return NextResponse.json({ error: 'boardId required' }, { status: 400 });
  }

  try {
    const boardInfoUrl = `${API_BASE}/api/board-info?id=${encodeURIComponent(boardId)}`;
    const displayContentUrl = `${API_BASE}/api/display/content?boardId=${encodeURIComponent(boardId)}${emergencyUpdateParam ? `&emergencyUpdate=${encodeURIComponent(emergencyUpdateParam)}` : ''}`;
    
    console.log(`[PROXY] Display-content: fetching board info from ${boardInfoUrl}`);
    console.log(`[PROXY] Display-content: fetching display content from ${displayContentUrl}`);

    const [boardInfoResponse, displayContentResponse] = await Promise.all([
      fetch(boardInfoUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      }),
      fetch(displayContentUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      })
    ]);

    if (!boardInfoResponse.ok) {
      console.log(`[PROXY] Display-content: board-info error status ${boardInfoResponse.status}`);
      return NextResponse.json({ error: 'Failed to fetch board info' }, { status: boardInfoResponse.status });
    }

    const boardInfo = await boardInfoResponse.json();
    console.log(`[PROXY] Display-content: received board info for ${boardId}`);
    console.log(`[PROXY] Display-content: boardInfo.unit_logo:`, boardInfo.unit_logo);
    
    let externalContent = null;
    if (displayContentResponse.ok) {
      externalContent = await displayContentResponse.json();
      console.log(`[PROXY] Display-content: received external display content for ${boardId}`);
      console.log(`[PROXY] Display-content: externalContent.boardInfo?.unit_logo:`, externalContent?.boardInfo?.unit_logo);
    } else {
      console.log(`[PROXY] Display-content: display-content error status ${displayContentResponse.status}`);
    }

    if (!boardInfo.linked) {
      return NextResponse.json({ error: 'Board not linked' }, { status: 404 });
    }

    const themePrimary = boardInfo?.theme?.primaryHex || boardInfo.themeColor || '#0b3d2e';
    const themeGradient = Array.isArray(boardInfo?.theme?.gradient)
      ? boardInfo.theme.gradient
      : [themePrimary, '#145a43'];

    const showFab = boardInfo.show_fab !== false;
    const durations = boardInfo.durations || {};
    
    let emergency = null;
    
    if (externalContent?.emergency && externalContent.emergency.active === true) {
      emergency = externalContent.emergency;
      console.log(`[EMERGENCY] Using emergency from external display content:`, emergency);
    } else if (boardInfo?.emergency && boardInfo.emergency.active === true) {
      emergency = boardInfo.emergency;
      console.log(`[EMERGENCY] Using emergency from boardInfo:`, emergency);
    } else if (emergencyUpdateParam) {
      try {
        const getIsraelTimeNow = () => {
          const now = new Date();
          const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Jerusalem',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          const parts = formatter.formatToParts(now);
          const year = parts.find(p => p.type === 'year')?.value;
          const month = parts.find(p => p.type === 'month')?.value;
          const day = parts.find(p => p.type === 'day')?.value;
          const hour = parts.find(p => p.type === 'hour')?.value;
          const minute = parts.find(p => p.type === 'minute')?.value;
          const second = parts.find(p => p.type === 'second')?.value;
          const israelDateStr = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
          return new Date(israelDateStr).getTime();
        };
        
        const parseEmergencyTime = (timeStr: string) => {
          if (!timeStr) return null;
          const date = new Date(timeStr);
          if (isNaN(date.getTime())) return null;
          
          const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Jerusalem',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          const parts = formatter.formatToParts(date);
          const year = parts.find(p => p.type === 'year')?.value;
          const month = parts.find(p => p.type === 'month')?.value;
          const day = parts.find(p => p.type === 'day')?.value;
          const hour = parts.find(p => p.type === 'hour')?.value;
          const minute = parts.find(p => p.type === 'minute')?.value;
          const second = parts.find(p => p.type === 'second')?.value;
          const israelDateStr = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
          return new Date(israelDateStr).getTime();
        };
        
        const emergencyUpdateTime = parseEmergencyTime(emergencyUpdateParam);
        const nowIsrael = getIsraelTimeNow();
        
        if (emergencyUpdateTime && nowIsrael) {
          const diffMinutes = (nowIsrael - emergencyUpdateTime) / (1000 * 60);
          
          console.log(`[EMERGENCY] emergencyUpdateParam: ${emergencyUpdateParam}`);
          console.log(`[EMERGENCY] emergencyUpdateTime (Israel): ${new Date(emergencyUpdateTime).toISOString()}`);
          console.log(`[EMERGENCY] nowIsrael: ${new Date(nowIsrael).toISOString()}`);
          console.log(`[EMERGENCY] diffMinutes: ${diffMinutes.toFixed(2)}`);
          
          if (diffMinutes < 5 && diffMinutes >= 0) {
            emergency = { 
              active: true, 
              command: '/apk'
            };
            console.log(`[EMERGENCY] Active emergency update detected, ${diffMinutes.toFixed(2)} minutes ago`);
          } else {
            console.log(`[EMERGENCY] Emergency update expired or invalid, ${diffMinutes.toFixed(2)} minutes ago`);
          }
        } else {
          console.warn('[EMERGENCY] Failed to parse times');
        }
      } catch (e) {
        console.warn('[EMERGENCY] Failed to parse emergencyUpdate:', e);
      }
    }
    
    const payload = {
      boardId: boardInfo.board_bid || boardId,
      prayers: boardInfo.prayers || [],
      updates: boardInfo.updates || [],
      letter: boardInfo.letter || null,
      halacha: null,
      orders: [],
      durations: {
        letter: durations.letter || 90,
        halacha: durations.halacha || 30
      },
      emergency: emergency,
      additions: { prayerExtras: { shacharit: [], mincha: [], arvit: [] }, dayNotes: [] },
      assets: [],
      lastUpdatedAt: new Date().toISOString(),
      boardInfo: {
        name: boardInfo.name,
        display_name: boardInfo.display_name || boardInfo.displayName || null,
        base_name: boardInfo.base_name,
        base_description: boardInfo.base_description,
        location: boardInfo.location,
        user_id: boardInfo.user_id,
        theme: { primaryHex: themePrimary, gradient: themeGradient },
        // unit_logo can come from boardInfo or externalContent.boardInfo
        unit_logo: externalContent?.boardInfo?.unit_logo || boardInfo.unit_logo || null
      },
      theme: { primaryHex: themePrimary, gradient: themeGradient },
      background: { type: 'gradient', colors: themeGradient },
      fab: {
        enabled: showFab,
        command: showFab ? '/fab-on' : '/fab-off'
      }
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('[PROXY] Display-content: error proxying request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}


