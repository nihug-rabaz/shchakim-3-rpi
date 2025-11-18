import { NextResponse } from 'next/server';
import { getHalachaDaily } from '@/lib/halacha/csvReader';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date');
    const boardIdParam = url.searchParams.get('boardId') || 'default';
    const date = dateParam || new Date().toISOString().slice(0, 10);

    // Load halachot from local CSV file
    const data = await getHalachaDaily(date, boardIdParam);
    
    // Normalize shape - ensure items array
    const items = Array.isArray(data?.items) ? data.items.slice(0, 4) : [];
    
    return NextResponse.json({ 
      date: data.date || date, 
      date_hebrew: data.date_hebrew, 
      items 
    });
  } catch (e) {
    console.error('[HALACHA] Error fetching halacha:', e);
    return NextResponse.json({ 
      error: 'Failed to fetch halacha', 
      details: e instanceof Error ? e.message : 'Unknown error' 
    }, { status: 500 });
  }
}


