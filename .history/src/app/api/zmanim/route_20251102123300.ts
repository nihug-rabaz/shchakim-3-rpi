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
  
  const hebrewDay = hebrewDateObj[2];
  const hebrewMonth = hebrewMonths[hebrewDateObj[1] - 1];
  const hebrewYear = hebrewDateObj[0];
  const hebrewYearStr = hebrewYear.toString();
  
  // Format Hebrew year - convert from 5785 to תשפ"ה format
  // Hebrew year format: take last 2 digits, if starts with 0 then תש"X, else תש"XX
  let hebrewYearFormatted;
  if (hebrewYearStr.length === 4) {
    const lastTwoDigits = hebrewYearStr.slice(-2);
    if (lastTwoDigits.startsWith('0')) {
      // Year like 5780 = תש"פ
      hebrewYearFormatted = `תש"${lastTwoDigits[1]}`;
    } else {
      // Year like 5785 = תשפ"ה
      const hundredsDigit = hebrewYearStr.slice(1, 2); // Second digit (e.g., 7 from 5785)
      const tensDigit = lastTwoDigits[0];
      const onesDigit = lastTwoDigits[1];
      
      // Hebrew letters mapping for years
      const hebrewLetters = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
      const tensHebrew = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
      
      // For years like 5785, we use: ת (400) + ש (300) + פ (80) + ה (5)
      // Simplified: take hundreds place and last two digits
      if (tensDigit === '0') {
        hebrewYearFormatted = `תש"${hebrewLetters[parseInt(onesDigit)]}`;
      } else if (tensDigit === '8' && onesDigit <= '9') {
        // 80-89 range
        const letter = tensDigit === '8' ? 'פ' : '';
        hebrewYearFormatted = `תש${letter}"${hebrewLetters[parseInt(onesDigit)]}`;
      } else {
        // More complex conversion - use simple numeric format for now
        hebrewYearFormatted = `תש${tensDigit}${onesDigit}"ה`;
      }
      
      // Simple approach: use the numeric pattern
      const yearSuffix = lastTwoDigits;
      if (yearSuffix.startsWith('0')) {
        hebrewYearFormatted = `תש"${yearSuffix[1]}`;
      } else {
        // For 5785: תשפ"ה (תש = 400+300, פ = 80, ה = 5)
        // Simplified: extract meaningful parts
        if (parseInt(yearSuffix) <= 9) {
          hebrewYearFormatted = `תש"${yearSuffix}`;
        } else {
          // Complex year format - use library helper or manual conversion
          hebrewYearFormatted = formatHebrewYear(parseInt(hebrewYear));
        }
      }
    }
  } else {
    hebrewYearFormatted = hebrewYearStr;
  }
  
  // Helper function to format Hebrew year
  function formatHebrewYear(year: number): string {
    // Hebrew year conversion table (simplified)
    const yearMap: Record<number, string> = {
      5785: 'תשפ"ה',
      5786: 'תשפ"ו',
      5784: 'תשפ"ד',
      5783: 'תשפ"ג',
      5782: 'תשפ"ב',
      5781: 'תשפ"א',
      5780: 'תש"פ',
      5779: 'תשע"ט',
      5778: 'תשע"ח'
    };
    
    if (yearMap[year]) {
      return yearMap[year];
    }
    
    // Fallback: try to construct from digits
    const yearStr = year.toString();
    const lastTwo = yearStr.slice(-2);
    const hundreds = yearStr.slice(1, 2);
    
    // Very simplified fallback
    return `תש${lastTwo[0]}${lastTwo[1]}"ה`;
  }
  
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



