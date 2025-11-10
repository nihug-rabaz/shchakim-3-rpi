import { NextResponse } from 'next/server';import { NextResponse } from 'next/server';
import HebrewDate from 'hebrew-date';

type Req = { latitude: number; longitude: number; date?: string };

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as Partial<Req> | null;
  if (!body?.latitude || !body?.longitude) {
    return NextResponse.json({ error: 'latitude and longitude required' }, { status: 400 });
  }

  const dateStr = body.date;
  const date = dateStr ? new Date(dateStr) : new Date();
  
  // Calculate Hebrew date using local library
  const hebrewDateObj = HebrewDate(date);
  
  // Hebrew month names
  const hebrewMonths = [
    'תשרי', 'חשוון', 'כסלו', 'טבת', 'שבט', 'אדר',
    'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול'
  ];
  
  const hebrewDay = hebrewDateObj[2];
  const hebrewMonth = hebrewMonths[hebrewDateObj[1] - 1];
  const hebrewYear = hebrewDateObj[0];
  const hebrewYearShort = hebrewYear.toString().slice(-2);
  
  // Format Hebrew date string
  const hebrewDateFormatted = `${hebrewDay} ${hebrewMonth} תש${hebrewYearShort.slice(-1)}"ה`;

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



