import { NextResponse } from 'next/server';
import { HDate } from '@hebcal/core';

type Req = { latitude: number; longitude: number; date?: string };

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as Partial<Req> | null;
  if (!body?.latitude || !body?.longitude) {
    return NextResponse.json({ error: 'latitude and longitude required' }, { status: 400 });
  }

  const dateStr = body.date;
  const gregorianDate = dateStr ? new Date(dateStr) : new Date();
  
  // Calculate Hebrew date using @hebcal/core library
  const hebrewDate = new HDate(gregorianDate);
  
  // Get Hebrew date components
  const hebrewDay = hebrewDate.getDate();
  const hebrewMonth = hebrewDate.getMonth();
  const hebrewYear = hebrewDate.getFullYear();
  
  // Format Hebrew date using the library's built-in formatter
  // The library can format it for us, but we'll format it manually for control
  const hebrewDateFormatted = hebrewDate.toString('h'); // Format like: "כז תמוז תשפ״ה"

  return NextResponse.json({
    date: dateStr ?? date.toISOString().slice(0, 10),
    location: { lat: body.latitude, lng: body.longitude },
    hebrew: {
      day: hebrewDay,
      month: hebrewDateObj[1],
      year: hebrewYear,
      formatted: hebrewDateFormatted,
      date: hebrewDateFormatted
    },
    times: {
      sunrise: '06:30',
      sunset: '18:30',
      tzeit: '18:50'
    }
  });
}



