# תמיכה בזמני עדכון דינמיים (displayTime)

## סקירה כללית

הוספת תמיכה בזמני תצוגה דינמיים לכל עדכון, כך שכל עדכון יכול להיות מוצג למשך זמן שונה (בדקות).

## שינויים בצד הלקוח (Display)

### ✅ כבר בוצע ב-`public/integration.js`

1. **תמיכה ב-`displayTime` בעדכונים:**
   - הקוד בודק אם יש `displayTime` בעדכון
   - שמירת `displayTime` על הסלייד כ-`data-display-time`
   - המרה מדקות למילישניות (1 דקה = 60,000ms)

2. **לוגיקה דינמית:**
   - אם יש `displayTime` - משתמש בו (מינימום 5 שניות, מקסימום 5 דקות)
   - אם אין `displayTime` - משתמש בברירת מחדל (30 שניות)

3. **עדכון בזמן אמת:**
   - כאשר עדכון מתעדכן, גם `displayTime` מתעדכן
   - הסלייד משתמש בזמן החדש בפעם הבאה שהוא מוצג

## שינויים נדרשים בצד השרת

### 1. עדכון Schema של Updates

**קובץ:** `schema` או `migrations` (תלוי במערכת)

הוסף שדה חדש לטבלת `updates`:

```sql
ALTER TABLE updates ADD COLUMN display_time INTEGER DEFAULT NULL;
-- או
ALTER TABLE updates ADD COLUMN display_time DECIMAL(5,2) DEFAULT NULL;
```

**או ב-Prisma Schema:**
```prisma
model Update {
  id          Int      @id @default(autoincrement())
  title       String
  content     String?  @db.Text
  type        String?
  dateFrom    DateTime?
  dateTo      DateTime?
  image       String?
  imageUrl    String?
  displayTime Float?   // זמן תצוגה בדקות (לדוגמה: 0.5 = 30 שניות, 2 = 2 דקות)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  // ... שדות נוספים
}
```

**או ב-TypeScript Type:**
```typescript
type Update = {
  id: number;
  title: string;
  content?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  image?: string;
  imageUrl?: string;
  displayTime?: number; // זמן תצוגה בדקות
  createdAt?: string;
  updatedAt?: string;
};
```

### 2. עדכון טופס יצירת עדכון - `app/add-update/page.tsx`

**קובץ:** `src/app/add-update/page.tsx` (אם קיים) או `app/add-update/page.tsx`

```tsx
"use client";
import { useState } from 'react';

export default function AddUpdatePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [displayTime, setDisplayTime] = useState<number | null>(null); // זמן תצוגה בדקות

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      title,
      content,
      type,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
      displayTime: displayTime || null, // הוסף את displayTime
    };

    // שליחה לשרת...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* שדות קיימים */}
      
      <div>
        <label htmlFor="displayTime">
          זמן תצוגה (דקות):
        </label>
        <input
          type="number"
          id="displayTime"
          min="0.1"
          max="5"
          step="0.1"
          value={displayTime || ''}
          onChange={(e) => setDisplayTime(e.target.value ? parseFloat(e.target.value) : null)}
          placeholder="לדוגמה: 0.5 (30 שניות), 1 (דקה), 2 (2 דקות)"
        />
        <small>
          זמן התצוגה בדקות. אם לא מוגדר, יוצג 30 שניות (ברירת מחדל).
          מינימום: 0.1 דקות (6 שניות), מקסימום: 5 דקות.
        </small>
      </div>

      <button type="submit">יצירת עדכון</button>
    </form>
  );
}
```

### 3. עדכון טופס יצירת עדכון - `app/unit/[id]/add-update/page.tsx`

**קובץ:** `src/app/unit/[id]/add-update/page.tsx` (אם קיים)

אותו קוד כמו למעלה, רק עם `unitId`:

```tsx
"use client";
import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function AddUpdatePage() {
  const params = useParams();
  const unitId = params.id;
  const [displayTime, setDisplayTime] = useState<number | null>(null);

  // ... שאר הקוד זהה
}
```

### 4. עדכון דף העדכונים - תצוגה ועריכה

**קובץ:** `app/unit/[id]/updates/page.tsx` או `app/updates/page.tsx`

```tsx
"use client";
import { useState } from 'react';

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDisplayTime, setEditDisplayTime] = useState<number | null>(null);

  const handleEdit = (update: Update) => {
    setEditingId(update.id);
    setEditDisplayTime(update.displayTime || null);
  };

  const handleSave = async (id: number) => {
    // עדכון השרת עם displayTime החדש
    await fetch(`/api/updates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayTime: editDisplayTime }),
    });
    
    setEditingId(null);
    // רענון רשימת העדכונים
  };

  return (
    <div>
      <h1>עדכונים</h1>
      {updates.map(update => (
        <div key={update.id}>
          <h3>{update.title}</h3>
          <p>{update.content}</p>
          
          {/* תצוגת זמן תצוגה */}
          <div>
            זמן תצוגה: {update.displayTime 
              ? `${update.displayTime} דקות` 
              : '30 שניות (ברירת מחדל)'}
          </div>

          {/* עריכה */}
          {editingId === update.id ? (
            <div>
              <label>זמן תצוגה (דקות):</label>
              <input
                type="number"
                min="0.1"
                max="5"
                step="0.1"
                value={editDisplayTime || ''}
                onChange={(e) => setEditDisplayTime(
                  e.target.value ? parseFloat(e.target.value) : null
                )}
              />
              <button onClick={() => handleSave(update.id)}>שמור</button>
              <button onClick={() => setEditingId(null)}>ביטול</button>
            </div>
          ) : (
            <button onClick={() => handleEdit(update)}>ערוך זמן תצוגה</button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 5. עדכון API Routes

**קובץ:** `app/api/updates/route.ts` (יצירה)

```typescript
export async function POST(req: Request) {
  const body = await req.json();
  const { title, content, type, dateFrom, dateTo, displayTime } = body;

  // שמירה ב-DB עם displayTime
  const update = await db.update.create({
    data: {
      title,
      content,
      type,
      dateFrom,
      dateTo,
      displayTime, // הוסף את displayTime
    },
  });

  return NextResponse.json(update);
}
```

**קובץ:** `app/api/updates/[id]/route.ts` (עדכון)

```typescript
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { displayTime } = body;

  const update = await db.update.update({
    where: { id: parseInt(params.id) },
    data: { displayTime }, // עדכון displayTime
  });

  return NextResponse.json(update);
}
```

### 6. עדכון API של board-info

**קובץ:** `src/app/api/board-info/route.ts` (כבר קיים)

הקוד כבר מעביר את `updates` מהשרת החיצוני, אז אם השרת החיצוני מחזיר `displayTime`, הוא יעבור אוטומטית.

**ודא שהשרת החיצוני מחזיר:**
```json
{
  "updates": [
    {
      "id": 1,
      "title": "עדכון",
      "content": "...",
      "displayTime": 2.5  // 2.5 דקות
    }
  ]
}
```

## דוגמת נתונים

### עדכון עם זמן תצוגה מותאם אישית:
```json
{
  "id": 1,
  "title": "יום עיון",
  "content": "פרטים על יום העיון...",
  "type": "הודעה כללית",
  "displayTime": 3.0,  // 3 דקות
  "dateFrom": "2025-01-15",
  "dateTo": "2025-01-20"
}
```

### עדכון עם זמן תצוגה ברירת מחדל:
```json
{
  "id": 2,
  "title": "שיעור גמרא",
  "content": "פרטים על השיעור...",
  "type": "הודעה כללית",
  "displayTime": null,  // או לא מוגדר - ישתמש ב-30 שניות
  "dateFrom": "2025-01-15",
  "dateTo": "2025-01-20"
}
```

## הגבלות ובדיקות

1. **מינימום:** 5 שניות (0.083 דקות)
2. **מקסימום:** 5 דקות
3. **ברירת מחדל:** 30 שניות (0.5 דקות)
4. **פורמט:** מספר עשרוני (לדוגמה: 0.5, 1, 2.5)

## בדיקות נדרשות

1. ✓ עדכון עם `displayTime` מוצג למשך הזמן הנכון
2. ✓ עדכון ללא `displayTime` מוצג 30 שניות
3. ✓ עריכת `displayTime` מתעדכנת בזמן אמת
4. ✓ ערכים חריגים (מינימום/מקסימום) מטופלים נכון
5. ✓ עדכון `displayTime` בסלייד קיים עובד

## סיכום

**צד הלקוח (Display):** ✅ **הושלם**
- תמיכה ב-`displayTime` ב-`integration.js`
- לוגיקה דינמית לזמן תצוגה
- עדכון בזמן אמת

**צד השרת:** ⚠️ **נדרש עדכון**
- הוספת `displayTime` ל-schema
- עדכון טופסי יצירה
- עדכון דף עריכה
- עדכון API routes

## הערות

- זמן התצוגה נשמר ב-`data-display-time` על הסלייד
- המרה מדקות למילישניות: `minutes * 60 * 1000`
- הגבלות: מינימום 5 שניות, מקסימום 5 דקות
- ברירת מחדל: 30 שניות אם `displayTime` לא מוגדר

