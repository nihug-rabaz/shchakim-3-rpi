import { NextResponse } from 'next/server';
import { HDate } from '@hebcal/core';
import { calculateZmanInputs } from '@/lib/zmanim/utils/zmanCalculator';
import { getIsraelOffsetHours } from '@/lib/zmanim/utils/timezone';
import { getParashaSpecial } from '@/lib/zmanim/utils/parasha';

type Req = { latitude: number; longitude: number; date?: string };

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as Partial<Req> | null;
  if (!body?.latitude || !body?.longitude) {
    return NextResponse.json({ error: 'latitude and longitude required' }, { status: 400 });
  }

  const dateStr = body.date;
  const day = dateStr ? new Date(dateStr + "T00:00:00.000Z") : new Date();
  const shift = getIsraelOffsetHours(day);
  const israelMidnight = dateStr ? new Date(dateStr) : new Date();
  israelMidnight.setHours(0, 0, 0, 0);

  const hdate = new HDate(israelMidnight);
  const parasha = getParashaSpecial(israelMidnight);

  const dow = israelMidnight.getDay();
  
  let daysToFriday;
  if (dow === 5) {
    daysToFriday = 0;
  } else if (dow === 6) {
    daysToFriday = 6;
  } else {
    daysToFriday = 5 - dow;
  }

  let daysToMotzash;
  if (dow === 6) {
    daysToMotzash = 0;
  } else {
    daysToMotzash = 6 - dow;
  }

  const fridayDate = new Date(dateStr ? dateStr + "T00:00:00.000Z" : day.toISOString().slice(0, 10) + "T00:00:00.000Z");
  fridayDate.setDate(fridayDate.getDate() + daysToFriday);
  const fridayShift = getIsraelOffsetHours(fridayDate);
  const { shkiya: shkiyaFri } = calculateZmanInputs(fridayDate, fridayShift, body.latitude, body.longitude);
  
  const MotzashDate = new Date(dateStr ? dateStr + "T00:00:00.000Z" : day.toISOString().slice(0, 10) + "T00:00:00.000Z");
  MotzashDate.setDate(MotzashDate.getDate() + daysToMotzash);
  const MotzashShift = getIsraelOffsetHours(MotzashDate);
  const { shkiya: shkiyaMotzash } = calculateZmanInputs(MotzashDate, MotzashShift, body.latitude, body.longitude);

  const kenisatShabbat22 = new Date(shkiyaFri.getTime() - 22 * 60_000);
  const kenisatShabbat30 = new Date(shkiyaFri.getTime() - 30 * 60_000);
  const kenisatShabbat40 = new Date(shkiyaFri.getTime() - 40 * 60_000);
  const yetziatShabbat = new Date(shkiyaMotzash.getTime() + 35 * 60_000);

  const { 
    alot90,
    alot72,
    talitTefillin,
    zricha,
    musafGRA,
    startOfTenthHourGRA,
    startOfTenthHourMGA,
    fourthHourGRA,
    fourthHourMGA,
    fifthHourGRA,
    fifthHourMGA,
    minchaGedola,
    minchaKetana,
    shkiya,
    plagMincha,
    chatzot,
    tzait,
    tzait90,
    chatzotHaLayla,
    sofZmanShemaMGA,
    sofZmanShemaGRA,
    sofZmanTefilaMGA,
    sofZmanTefilaGRA,
  } = calculateZmanInputs(day, shift, body.latitude, body.longitude);

  const hebrewDate = new HDate(israelMidnight);
  const hebrewDay = hebrewDate.getDate();
  const hebrewMonth = hebrewDate.getMonth();
  const hebrewYear = hebrewDate.getFullYear();

  const hebrewMonthsMap: Record<number, string> = {
    0: 'ניסן', 1: 'אייר', 2: 'סיון', 3: 'תמוז', 4: 'אב', 5: 'אלול',
    6: 'תשרי', 7: 'חשוון', 8: 'כסלו', 9: 'טבת', 10: 'שבט', 11: 'אדר',
    12: 'אדר א', 13: 'אדר ב'
  };

  function dayToHebrew(day: number): string {
    const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    if (day < 1) return '';
    if (day === 15) return 'טו';
    if (day === 16) return 'טז';
    if (day < 10) return ones[day];
    const tensDigit = Math.floor(day / 10);
    const onesDigit = day % 10;
    if (onesDigit === 0) return tens[tensDigit];
    return tens[tensDigit] + ones[onesDigit];
  }

  function yearToHebrew(year: number): string {
    const yearMap: Record<number, string> = {
      5785: 'תשפ"ה', 5786: 'תשפ"ו', 5787: 'תשפ"ז', 5788: 'תשפ"ח', 5789: 'תשפ"ט',
      5784: 'תשפ"ד', 5783: 'תשפ"ג', 5782: 'תשפ"ב', 5781: 'תשפ"א', 5780: 'תש"פ'
    };
    if (yearMap[year]) return yearMap[year];
    const yearStr = year.toString();
    const lastTwo = parseInt(yearStr.slice(-2));
    const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    if (lastTwo < 10) return `תש"${ones[lastTwo]}`;
    const tensDigit = Math.floor(lastTwo / 10);
    const onesDigit = lastTwo % 10;
    if (tensDigit === 8) return `תש${tens[8]}"${ones[onesDigit]}`;
    return `תש${tens[tensDigit]}${ones[onesDigit]}"ה`;
  }

  const hebrewDayStr = dayToHebrew(hebrewDay);
  let hebrewMonthStr: string;
  try {
    const monthName = hebrewDate.getMonthName();
    const monthNameMap: Record<string, string> = {
      'Nisan': 'ניסן', 'Iyar': 'אייר', 'Sivan': 'סיון', 'Tamuz': 'תמוז',
      'Av': 'אב', 'Elul': 'אלול', 'Tishrei': 'תשרי', 'Cheshvan': 'חשוון',
      'Kislev': 'כסלו', 'Teves': 'טבת', 'Shevat': 'שבט', 'Adar': 'אדר',
      'Adar I': 'אדר א', 'Adar II': 'אדר ב'
    };
    hebrewMonthStr = monthNameMap[monthName] || hebrewMonthsMap[hebrewMonth] || 'חודש';
  } catch {
    hebrewMonthStr = hebrewMonthsMap[hebrewMonth] || 'חודש';
  }
  const hebrewYearStr = yearToHebrew(hebrewYear);
  const hebrewDateFormatted = `${hebrewDayStr} ${hebrewMonthStr} ${hebrewYearStr}`;

  return NextResponse.json({
    date: dateStr ?? day.toISOString().slice(0, 10),
    location: { lat: body.latitude, lng: body.longitude },
    hebrew: {
      day: hebrewDay,
      month: hebrewMonth + 1,
      year: hebrewYear,
      formatted: hebrewDateFormatted,
      date: hebrewDateFormatted
    },
    parasha: parasha,
    times: {
      alot90: alot90.toISOString(),
      alot72: alot72.toISOString(),
      talitTefillin: talitTefillin.toISOString(),
      zricha: zricha.toISOString(),
      musafGRA: musafGRA.toISOString(),
      startOfTenthHourGRA: startOfTenthHourGRA.toISOString(),
      startOfTenthHourMGA: startOfTenthHourMGA.toISOString(),
      fourthHourGRA: fourthHourGRA.toISOString(),
      fourthHourMGA: fourthHourMGA.toISOString(),
      fifthHourGRA: fifthHourGRA.toISOString(),
      fifthHourMGA: fifthHourMGA.toISOString(),
      minchaGedola: minchaGedola.toISOString(),
      minchaKetana: minchaKetana.toISOString(),
      shkiya: shkiya.toISOString(),
      chatzot: chatzot.toISOString(),
      plagMincha: plagMincha.toISOString(),
      tzait: tzait.toISOString(),
      tzait90: tzait90.toISOString(),
      chatzotHaLayla: chatzotHaLayla.toISOString(),
      kenisatShabbat22: kenisatShabbat22.toISOString(),
      kenisatShabbat30: kenisatShabbat30.toISOString(),
      kenisatShabbat40: kenisatShabbat40.toISOString(),
      sofZmanShemaMGA: sofZmanShemaMGA.toISOString(),
      sofZmanShemaGRA: sofZmanShemaGRA.toISOString(),
      sofZmanTefilaMGA: sofZmanTefilaMGA.toISOString(),
      sofZmanTefilaGRA: sofZmanTefilaGRA.toISOString(),
      yetziatShabbat: yetziatShabbat.toISOString()
    }
  });
}
