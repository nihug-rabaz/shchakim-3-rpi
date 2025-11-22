import { NextResponse } from 'next/server';

const API_BASE = 'https://shchakim.rabaz.co.il';

export async function GET() {
  const targetUrl = `${API_BASE}/api/boards`;
  console.log(`[PROXY] Boards list GET: proxying request to ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    console.log(`[PROXY] Boards list GET: response status ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[PROXY] Boards list GET: error response: ${errorText}`);
      return NextResponse.json({ boards: [] }, { status: response.status });
    }

    const data = await response.json();
    const boards = Array.isArray(data) ? data : Array.isArray(data?.boards) ? data.boards : [];

    return NextResponse.json(boards, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error(`[PROXY] Boards list GET: error proxying request:`, error);
    return NextResponse.json({ boards: [] }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache'
      }
    });
  }
}
