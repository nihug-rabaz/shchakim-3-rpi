import { NextResponse } from 'next/server';
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
  
  // Helper function to format Hebrew year (e.g., 5785 -> תשפ"ה)
  function formatHebrewYear(year: number): string {
    // Hebrew year conversion table for common years
    const yearMap: Record<number, string> = {
      5785: 'תשפ"ה',
      5786: 'תשפ"ו',
      5787: 'תשפ"ז',
      5788: 'תשפ"ח',
      5789: 'תשפ"ט',
      5784: 'תשפ"ד',
      5783: 'תשפ"ג',
      5782: 'תשפ"ב',
      5781: 'תשפ"א',
      5780: 'תש"פ',
      5779: 'תשע"ט',
      5778: 'תשע"ח',
      5777: 'תשע"ז',
      5776: 'תשע"ו',
      5775: 'תשע"ה'
    };
    
    if (yearMap[year]) {
      return yearMap[year];
    }
    
    // Fallback: approximate conversion for other years
    const yearStr = year.toString();
    const lastTwo = yearStr.slice(-2);
    const yearNum = parseInt(lastTwo);
    
    // Hebrew letters for numbers
    const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    
    if (yearNum < 10) {
      return `תש"${ones[yearNum]}`;
    } else {
      const tensDigit = Math.floor(yearNum / 10);
      const onesDigit = yearNum % 10;
      if (tensDigit === 8) {
        return `תש${tens[8]}"${ones[onesDigit]}`;
      } else {
        // For other cases, use approximate format
        return `תש${tens[tensDigit]}${ones[onesDigit]}"ה`;
      }
    }
  }
  
  const hebrewDay = hebrewDateObj[2];
  const hebrewMonth = hebrewMonths[hebrewDateObj[1] - 1];
  const hebrewYear = hebrewDateObj[0];
  
  // Format Hebrew date string with proper year
  const hebrewYearFinal = formatHebrewYear(parseInt(hebrewYear));
  const hebrewDateFormatted = `${hebrewDay} ${hebrewMonth} ${hebrewYearFinal}`;

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



