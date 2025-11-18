import { promises as fs } from 'fs';
import path from 'path';

export type HalachaItem = {
  board_id: string;
  date: string;
  date_hebrew: string;
  context: string;
  part: string;
  chapter: number;
  halacha_id: string;
  title: string;
  summary: string;
  credit: string;
  url: string;
  halacha_key: string;
};

let csvCache: HalachaItem[] | null = null;
let csvCacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function loadCSV(): Promise<HalachaItem[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (csvCache && (now - csvCacheTimestamp) < CACHE_TTL) {
    return csvCache;
  }

  try {
    const csvPath = path.join(process.cwd(), 'data', 'two_halachot_schedule_2035.csv');
    const fileContent = await fs.readFile(csvPath, 'utf-8');
    
    const lines = fileContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Parse data rows
    const items: HalachaItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Improved CSV parsing (handles quoted fields with commas and escaped quotes)
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        const nextChar = j < line.length - 1 ? line[j + 1] : '';
        
        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Escaped quote (double quote)
            current += '"';
            j++; // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // Field separator
          values.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current); // Last value
      
      if (values.length >= headers.length) {
        const item: any = {};
        headers.forEach((header, index) => {
          let value = (values[index] || '').trim();
          // Remove surrounding quotes if present
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          // Unescape double quotes
          value = value.replace(/""/g, '"');
          // Convert chapter to number if it's a number
          if (header === 'chapter') {
            item[header] = parseFloat(value) || 0;
          } else {
            item[header] = value;
          }
        });
        items.push(item as HalachaItem);
      }
    }

    // Cache the result
    csvCache = items;
    csvCacheTimestamp = now;
    
    return items;
  } catch (error) {
    console.error('[HALACHA] Error loading CSV:', error);
    // Return cached data if available, even if expired
    if (csvCache) {
      console.warn('[HALACHA] Using expired cache due to error');
      return csvCache;
    }
    throw error;
  }
}

export async function getHalachotForDate(date: string, boardId: string = 'default'): Promise<HalachaItem[]> {
  const items = await loadCSV();
  
  // Filter by date and board_id
  const dateStr = date.slice(0, 10); // YYYY-MM-DD format
  const filtered = items.filter(item => 
    item.date === dateStr && item.board_id === boardId
  );
  
  // If we found items for this date, return them (up to 4)
  if (filtered.length > 0) {
    return filtered.slice(0, 4);
  }
  
  // If no items found for this date (date is beyond the CSV range), 
  // return random items from the entire decade
  console.log(`[HALACHA] No halachot found for date ${dateStr}, using random fallback`);
  const allItems = items.filter(item => item.board_id === boardId);
  
  if (allItems.length === 0) {
    return [];
  }
  
  // Get random items (2-4 items, similar to daily schedule)
  const numItems = Math.min(4, Math.max(2, Math.floor(Math.random() * 3) + 2));
  const shuffled = [...allItems].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, numItems);
}

export async function getHalachaDaily(date?: string, boardId: string = 'default'): Promise<{
  date: string;
  date_hebrew?: string;
  items: Array<{
    title: string;
    summary: string;
    credit?: string;
    url?: string;
    halacha_id?: string;
    chapter?: number;
    part?: string;
  }>;
}> {
  const targetDate = date || new Date().toISOString().slice(0, 10);
  const items = await getHalachotForDate(targetDate, boardId);
  
  // Get date_hebrew from first item if available (only if it's for the exact date)
  // For random fallback items, we'll calculate Hebrew date using @hebcal/core
  let date_hebrew: string | undefined = undefined;
  if (items.length > 0) {
    // Check if first item is for the exact date (not random fallback)
    if (items[0].date === targetDate) {
      date_hebrew = items[0].date_hebrew;
    } else {
      // For random fallback, calculate Hebrew date for the requested date
      try {
        const { HDate } = await import('@hebcal/core');
        const targetDateObj = new Date(targetDate + 'T00:00:00');
        const hdate = new HDate(targetDateObj);
        const day = hdate.getDate();
        const month = hdate.getMonth();
        const year = hdate.getFullYear();
        
        // Convert day to Hebrew
        const dayToHebrew = (d: number): string => {
          const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
          const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
          if (d < 1) return '';
          if (d === 15) return 'טו';
          if (d === 16) return 'טז';
          if (d < 10) return ones[d];
          const tensDigit = Math.floor(d / 10);
          const onesDigit = d % 10;
          if (onesDigit === 0) return tens[tensDigit];
          return tens[tensDigit] + ones[onesDigit];
        };
        
        // Convert year to Hebrew
        const yearToHebrew = (y: number): string => {
          const yearMap: Record<number, string> = {
            5785: 'תשפ"ה', 5786: 'תשפ"ו', 5787: 'תשפ"ז', 5788: 'תשפ"ח', 5789: 'תשפ"ט',
            5784: 'תשפ"ד', 5783: 'תשפ"ג', 5782: 'תשפ"ב', 5781: 'תשפ"א', 5780: 'תש"פ'
          };
          if (yearMap[y]) return yearMap[y];
          const yearStr = y.toString();
          const lastTwo = parseInt(yearStr.slice(-2));
          const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
          const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
          if (lastTwo < 10) return `תש"${ones[lastTwo]}`;
          const tensDigit = Math.floor(lastTwo / 10);
          const onesDigit = lastTwo % 10;
          if (tensDigit === 8) return `תש${tens[8]}"${ones[onesDigit]}`;
          return `תש${tens[tensDigit]}${ones[onesDigit]}"ה`;
        };
        
        const dayStr = dayToHebrew(day);
        let monthName: string;
        try {
          const monthNameEng = hdate.getMonthName();
          const monthNameMap: Record<string, string> = {
            'Nisan': 'ניסן', 'Iyar': 'אייר', 'Sivan': 'סיון', 'Tamuz': 'תמוז',
            'Av': 'אב', 'Elul': 'אלול', 'Tishrei': 'תשרי', 'Cheshvan': 'חשוון',
            'Kislev': 'כסלו', 'Teves': 'טבת', 'Shevat': 'שבט', 'Adar': 'אדר',
            'Adar I': 'אדר א', 'Adar II': 'אדר ב'
          };
          monthName = monthNameMap[monthNameEng] || 'חודש';
        } catch {
          const hebrewMonthsMap: Record<number, string> = {
            0: 'ניסן', 1: 'אייר', 2: 'סיון', 3: 'תמוז', 4: 'אב', 5: 'אלול',
            6: 'תשרי', 7: 'חשוון', 8: 'כסלו', 9: 'טבת', 10: 'שבט', 11: 'אדר',
            12: 'אדר א', 13: 'אדר ב'
          };
          monthName = hebrewMonthsMap[month] || 'חודש';
        }
        const yearStr = yearToHebrew(year);
        
        date_hebrew = `${dayStr} ${monthName} ${yearStr}`;
      } catch (e) {
        console.warn('[HALACHA] Failed to calculate Hebrew date for fallback:', e);
      }
    }
  }
  
  // Transform to API format
  const transformedItems = items.map(item => ({
    title: item.title,
    summary: item.summary,
    credit: item.credit || undefined,
    url: item.url || undefined,
    halacha_id: item.halacha_id || undefined,
    chapter: item.chapter || undefined,
    part: item.part || undefined,
  }));
  
  return {
    date: targetDate,
    date_hebrew,
    items: transformedItems,
  };
}

