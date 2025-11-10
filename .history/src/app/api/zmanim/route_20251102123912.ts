import { NextResponse } from 'next/server';
import { HDate, Parasha } from '@hebcal/core';

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
  
  // Hebrew month names (HDate uses 0=Nisan, 1=Iyar, ... 11=Adar2)
  // But we need to map correctly based on actual month returned
  const hebrewMonthsMap: Record<number, string> = {
    0: 'ניסן',
    1: 'אייר',
    2: 'סיון',
    3: 'תמוז',
    4: 'אב',
    5: 'אלול',
    6: 'תשרי',
    7: 'חשוון',
    8: 'כסלו',
    9: 'טבת',
    10: 'שבט',
    11: 'אדר',
    12: 'אדר א', // Adar I in leap years
    13: 'אדר ב'  // Adar II in leap years
  };
  
  // Convert day number to Hebrew letters (for numbers 1-30)
  function dayToHebrew(day: number): string {
    // Hebrew letters for numbers
    const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    
    if (day < 1) return '';
    if (day === 15) return 'טו'; // Special case
    if (day === 16) return 'טז'; // Special case
    if (day < 10) return ones[day];
    
    const tensDigit = Math.floor(day / 10);
    const onesDigit = day % 10;
    
    if (onesDigit === 0) {
      return tens[tensDigit];
    } else {
      return tens[tensDigit] + ones[onesDigit];
    }
  }
  
  // Convert year to Hebrew format (e.g., 5786 -> תשפ"ו)
  function yearToHebrew(year: number): string {
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
    
    // Fallback: construct from year digits
    const yearStr = year.toString();
    const lastTwo = parseInt(yearStr.slice(-2));
    
    const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    
    if (lastTwo < 10) {
      return `תש"${ones[lastTwo]}`;
    } else {
      const tensDigit = Math.floor(lastTwo / 10);
      const onesDigit = lastTwo % 10;
      if (tensDigit === 8) {
        return `תש${tens[8]}"${ones[onesDigit]}`;
      } else {
        return `תש${tens[tensDigit]}${ones[onesDigit]}"ה`;
      }
    }
  }
  
  // Format Hebrew date in Hebrew: "יא חשוון תשפ"ו"
  const hebrewDayStr = dayToHebrew(hebrewDay);
  // Use the month name from the library or fallback to our map
  let hebrewMonthStr: string;
  try {
    // Try to get Hebrew month name from the library
    const monthName = hebrewDate.getMonthName();
    // Convert transliterated name to Hebrew
    const monthNameMap: Record<string, string> = {
      'Nisan': 'ניסן',
      'Iyar': 'אייר',
      'Sivan': 'סיון',
      'Tamuz': 'תמוז',
      'Av': 'אב',
      'Elul': 'אלול',
      'Tishrei': 'תשרי',
      'Cheshvan': 'חשוון',
      'Kislev': 'כסלו',
      'Teves': 'טבת',
      'Shevat': 'שבט',
      'Adar': 'אדר',
      'Adar I': 'אדר א',
      'Adar II': 'אדר ב'
    };
    hebrewMonthStr = monthNameMap[monthName] || hebrewMonthsMap[hebrewMonth] || 'חודש';
  } catch {
    // Fallback to our map
    hebrewMonthStr = hebrewMonthsMap[hebrewMonth] || 'חודש';
  }
  const hebrewYearStr = yearToHebrew(hebrewYear);
  const hebrewDateFormatted = `${hebrewDayStr} ${hebrewMonthStr} ${hebrewYearStr}`;

  // Get Parasha (Torah portion) for this Shabbat
  let parasha = null;
  try {
    const parashaObj = Parasha.getParsha(hebrewDate, true); // true = Israel
    if (parashaObj) {
      parasha = parashaObj.getName('h'); // Hebrew name
    }
  } catch (error) {
    console.error('Error getting parasha:', error);
  }

  return NextResponse.json({
    date: dateStr ?? gregorianDate.toISOString().slice(0, 10),
    location: { lat: body.latitude, lng: body.longitude },
    hebrew: {
      day: hebrewDay,
      month: hebrewMonth + 1, // HDate months are 0-based, we return 1-based
      year: hebrewYear,
      formatted: hebrewDateFormatted,
      date: hebrewDateFormatted
    },
    parasha: parasha,
    times: {
      sunrise: '06:30',
      sunset: '18:30',
      tzeit: '18:50'
    }
  });
}



