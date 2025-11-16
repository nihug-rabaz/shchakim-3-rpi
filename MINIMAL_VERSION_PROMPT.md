# פרומט ליצירת גרסה מינימליסטית - מסך כניסה ושיוך לוח

## מטרה
ליצור גרסה מינימליסטית של המערכת שתכיל רק:
1. **מסך כניסה/שיוך** - מסך שבו המשתמש משייך את הלוח
2. **לוגיקה של שמירת נתונים** - שמירת מזהה הלוח ומידע השיוך
3. **לוגיקה של שיוך** - שליחת בקשות שיוך לשרת

## קבצים נדרשים

### 1. מסך הכניסה/שיוך
**קובץ:** `src/app/claim/page.tsx`
- מסך React עם טופס שיוך לוח
- טוען רשימת לוחות מהשרת
- מאפשר בחירת לוח לשיוך
- שולח בקשה ל-`/api/claim`
- משתמש ב-`BoardManager` לשמירת נתונים

### 2. לוגיקה של שמירת נתונים
**קובץ:** `src/utils/BoardManager.ts`
- מחלקה סטטית לניהול מזהה הלוח ומידע השיוך
- שמירה ב-`localStorage`:
  - `shchakim_board_id` - מזהה הלוח
  - `shchakim_board_info` - מידע השיוך (linked, user_id, name, logical_board_id)
- פונקציות:
  - `getBoardId()` - קבלת/יצירת מזהה לוח
  - `setBoardId(id)` - שמירת מזהה לוח
  - `getBoardInfo()` - קבלת מידע שיוך
  - `setBoardInfo(info)` - שמירת מידע שיוך
  - `clearBoardInfo()` - מחיקת מידע שיוך

### 3. API של שיוך
**קובץ:** `src/app/api/claim/route.ts`
- Endpoint: `POST /api/claim`
- מקבל: `{ board_id: string, logical_board_id: number }`
- שולח לשרת החיצוני: `https://shchakim.rabaz.co.il/api/claim`
- מחזיר תשובה מהשרת

### 4. API של מידע לוח
**קובץ:** `src/app/api/board-info/route.ts`
- Endpoint: `GET /api/board-info?id={boardId}`
- Endpoint: `POST /api/board-info`
- שולח לשרת החיצוני: `https://shchakim.rabaz.co.il/api/board-info`
- מחזיר מידע על הלוח (linked, user_id, name, logical_board_id)

## עיצוב עם תמונות

### תמונות זמינות ב-`public/frame-18_files/`:
- `--------------5-1@2x.png` - תמונת רקע/דקורציה
- `--------------5-2@2x.png` - תמונת רקע/דקורציה
- `-----------1@2x.png` - תמונת רקע/דקורציה
- `1853632d-c27c-419d-9ae9-ef8c151659c2-5.png` - תמונת רקע/דקורציה
- `link04-1.png` - תמונת קישור/QR
- `rectangle-11.png` - תמונת רקע מלבנית
- SVG files: `alot-ha-shachar-2.svg`, `mincha-ktana-*.svg`, `rectangle-*.svg`, `tzut-2.svg`

### שימוש בתמונות בעיצוב:
```tsx
// דוגמה לשימוש בתמונות ברקע
<div style={{
  backgroundImage: 'url(/frame-18_files/rectangle-11.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  // ... סגנונות נוספים
}}>
  {/* תוכן המסך */}
</div>

// או שימוש בתמונות כרקע עם overlay
<div style={{
  position: 'relative',
  backgroundImage: 'url(/frame-18_files/--------------5-1@2x.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}}>
  <div style={{
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)', // overlay כהה
  }} />
  {/* תוכן המסך */}
</div>
```

## מבנה הגרסה המינימליסטית

```
minimal-version/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── claim/
│   │   │   │   └── route.ts          # API שיוך
│   │   │   └── board-info/
│   │   │       └── route.ts          # API מידע לוח
│   │   ├── claim/
│   │   │   └── page.tsx              # מסך שיוך
│   │   └── layout.tsx                # Layout בסיסי
│   └── utils/
│       └── BoardManager.ts           # לוגיקה שמירת נתונים
├── public/
│   └── frame-18_files/               # תמונות לעיצוב
│       ├── *.png
│       └── *.svg
└── package.json
```

## תכונות נדרשות במסך הכניסה

1. **QR Code** - הצגת QR code עם קישור לשיוך
2. **טופס שיוך** - בחירת לוח מהרשימה
3. **מזהה לוח** - הצגת מזהה הלוח הנוכחי
4. **סטטוס שיוך** - הצגת סטטוס השיוך (משויך/לא משויך)
5. **עיצוב מותאם** - שימוש בתמונות מ-`frame-18_files`

## דוגמת קוד למסך כניסה מינימליסטי

```tsx
"use client";
import { useEffect, useState } from 'react';
import BoardManager from '@/utils/BoardManager';

export default function MinimalClaimPage() {
  const [boardId, setBoardId] = useState<string>('');
  const [boardInfo, setBoardInfo] = useState<any>(null);
  const [boards, setBoards] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // קבלת מזהה לוח
    const id = BoardManager.getBoardId();
    setBoardId(id);
    
    // טעינת מידע שיוך
    const info = BoardManager.getBoardInfo();
    setBoardInfo(info);
    
    // טעינת רשימת לוחות (מהשרת או mock)
    // TODO: טעינה מהשרת
    setBoards([
      { id: 15, name: 'לוח פיקוד דרום' },
      { id: 16, name: 'לוח פיקוד צפון' },
      { id: 17, name: 'לוח פיקוד מרכז' }
    ]);
  }, []);

  const handleClaim = async () => {
    if (!selectedBoardId || !boardId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_id: boardId,
          logical_board_id: selectedBoardId
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        BoardManager.setBoardInfo({ linked: true, ...data });
        setBoardInfo({ linked: true, ...data });
      }
    } catch (error) {
      console.error('Claim error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundImage: 'url(/frame-18_files/rectangle-11.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      direction: 'rtl'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <h1>שיוך לוח</h1>
        <p>מזהה לוח: <strong>{boardId}</strong></p>
        {boardInfo?.linked && <p>✓ משויך ללוח: {boardInfo.name}</p>}
        
        {!boardInfo?.linked && (
          <>
            <select
              value={selectedBoardId || ''}
              onChange={(e) => setSelectedBoardId(Number(e.target.value))}
            >
              <option value="">-- בחר לוח --</option>
              {boards.map(board => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
            <button onClick={handleClaim} disabled={isLoading}>
              {isLoading ? 'משיוך...' : 'שיוך לוח'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

## שלבי יצירת הגרסה המינימליסטית

1. **יצירת תיקייה חדשה** - `minimal-version/`
2. **העתקת קבצים נדרשים:**
   - `src/utils/BoardManager.ts`
   - `src/app/api/claim/route.ts`
   - `src/app/api/board-info/route.ts`
   - `src/app/claim/page.tsx` (עם התאמות)
   - `public/frame-18_files/` (תמונות)
3. **יצירת `package.json` מינימלי** עם תלויות בסיסיות
4. **יצירת `layout.tsx`** בסיסי
5. **עיצוב המסך** עם תמונות מ-`frame-18_files`
6. **הסרת קבצים לא נדרשים** (display, pair, וכו')

## הערות חשובות

- **localStorage** - כל הנתונים נשמרים ב-localStorage של הדפדפן
- **API Base** - השרת החיצוני: `https://shchakim.rabaz.co.il`
- **עיצוב** - להשתמש בתמונות מ-`frame-18_files` לרקע ועיצוב
- **QR Code** - ניתן ליצור QR code עם: `https://api.qrserver.com/v1/create-qr-code/?data={url}&size=200x200`
- **Responsive** - המסך צריך להיות responsive ולהיראות טוב על מסכים שונים

## בדיקות נדרשות

1. ✓ יצירת מזהה לוח אוטומטית
2. ✓ שמירת מזהה לוח ב-localStorage
3. ✓ טעינת רשימת לוחות
4. ✓ שליחת בקשה שיוך
5. ✓ שמירת מידע שיוך
6. ✓ הצגת סטטוס שיוך
7. ✓ עיצוב עם תמונות

## סיכום

הגרסה המינימליסטית תכיל רק את הלוגיקה הבסיסית של:
- יצירת/שמירת מזהה לוח
- שיוך לוח לשרת
- שמירת מידע ב-localStorage
- מסך כניסה מותאם עם תמונות

כל השאר (display, slider, letter, וכו') יוסר מהגרסה המינימליסטית.


