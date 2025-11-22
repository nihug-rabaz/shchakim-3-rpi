"use client";
import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BoardManager from '@/utils/BoardManager';

type BoardOption = {
  id: number;
  name: string;
  display_name?: string;
  displayName?: string;
  location?: string;
  logical_board_id?: number;
};

type BoardInfo = {
  linked: boolean;
  user_id?: number;
  name?: string;
  display_name?: string;
  displayName?: string;
  logical_board_id?: number;
};

function ClaimPageContent() {
  const searchParams = useSearchParams();
  const searchBoardId = searchParams.get('id');

  const [boardId, setBoardId] = useState('');
  const [claimUrl, setClaimUrl] = useState('');
  const [boards, setBoards] = useState<BoardOption[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);
  const [isLoadingClaim, setIsLoadingClaim] = useState(false);
  const [isCheckingBoard, setIsCheckingBoard] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [boardInfo, setBoardInfo] = useState<BoardInfo | null>(null);

  const qrImage = useMemo(() => {
    if (!claimUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(claimUrl)}&size=220x220`;
  }, [claimUrl]);

  const loadBoards = useCallback(async () => {
    setIsLoadingBoards(true);
    try {
      const response = await fetch('/api/boards', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('שגיאה בטעינת לוחות');
      }
      const data = await response.json();
      const boardsList: BoardOption[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.boards)
          ? data.boards
          : [];
      setBoards(boardsList);
    } catch (err: any) {
      console.error('[CLAIM] Error loading boards', err);
      setBoards([]);
      setError(err?.message || 'שגיאה בטעינת הלוחות');
    } finally {
      setIsLoadingBoards(false);
    }
  }, []);

  const refreshBoardInfo = useCallback(async (id: string) => {
    if (!id) return;
    setIsCheckingBoard(true);
    setStatusMessage('');
    try {
      const response = await fetch(`/api/board-info?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('שגיאה בטעינת סטטוס הלוח');
      }
      const data: BoardInfo = await response.json();
      setBoardInfo(data);
      BoardManager.setBoardInfo(data);
      if (data.linked) {
        setStatusMessage('הלוח כבר משויך');
      } else {
        setStatusMessage('הלוח לא משויך עדיין');
      }
    } catch (err: any) {
      console.error('[CLAIM] Error checking board', err);
      setStatusMessage('לא ניתן לבדוק סטטוס לוח כרגע');
    } finally {
      setIsCheckingBoard(false);
    }
  }, []);

  const initializeBoardId = useCallback(() => {
    const storedId = BoardManager.getBoardId();
    const finalId = searchBoardId || storedId;

    if (searchBoardId && searchBoardId !== storedId) {
      BoardManager.setBoardId(searchBoardId);
    }

    setBoardId(finalId);
    const storedInfo = BoardManager.getBoardInfo();
    if (storedInfo) {
      setBoardInfo(storedInfo);
    }
    if (typeof window !== 'undefined') {
      setClaimUrl(`${window.location.origin}/claim?id=${finalId}`);
    }
    return finalId;
  }, [searchBoardId]);

  useEffect(() => {
    const finalId = initializeBoardId();
    loadBoards();
    refreshBoardInfo(finalId);
  }, [initializeBoardId, loadBoards, refreshBoardInfo]);

  const handleClaim = async () => {
    if (!selectedBoardId || !boardId) {
      setError('נא לבחור לוח לפני ביצוע שיוך');
      return;
    }

    setIsLoadingClaim(true);
    setError('');
    setStatusMessage('');

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board_id: boardId,
          logical_board_id: selectedBoardId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'שיוך נכשל' }));
        throw new Error(errorData.error || 'שיוך נכשל');
      }

      const data = await response.json();
      const updatedInfo: BoardInfo = {
        linked: true,
        logical_board_id: selectedBoardId,
        ...data
      };
      BoardManager.setBoardInfo(updatedInfo);
      setBoardInfo(updatedInfo);
      setStatusMessage('הלוח שויך בהצלחה');
    } catch (err: any) {
      setError(err?.message || 'שגיאה בשיוך הלוח');
    } finally {
      setIsLoadingClaim(false);
    }
  };

  const handleReset = () => {
    BoardManager.clearBoardInfo();
    setBoardInfo(null);
    setStatusMessage('איפסנו את נתוני השיוך');
  };

  const boardStatus = useMemo(() => {
    if (boardInfo?.linked) {
      return `✓ הלוח משויך למשתמש ${boardInfo.name || boardInfo.display_name || boardInfo.displayName || ''}`;
    }
    if (boardInfo) {
      return 'הלוח לא משויך';
    }
    return 'ממתין לטעינת סטטוס לוח';
  }, [boardInfo]);

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #145a43 0%, #0b3b2d 100%)',
      color: '#fff',
      padding: '32px',
      direction: 'rtl'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '36px',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        maxWidth: '920px',
        width: '100%'
      }}>
        <h1 style={{ fontSize: '36px', marginBottom: '12px', fontWeight: '800' }}>
          שיוך לוח
        </h1>
        <p style={{ opacity: 0.9, marginBottom: '16px' }}>
          חברו את הלוח למשתמש הרצוי ושמרו את סטטוס השיוך
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '28px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.12)',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 700 }}>
              מזהה לוח
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '20px',
              wordBreak: 'break-all'
            }}>
              {boardId || '---'}
            </div>
            <button
              onClick={() => refreshBoardInfo(boardId)}
              disabled={!boardId || isCheckingBoard}
              style={{
                marginTop: '14px',
                padding: '12px 16px',
                width: '100%',
                background: '#1f8b5f',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: isCheckingBoard ? 'not-allowed' : 'pointer'
              }}
            >
              {isCheckingBoard ? 'בודק סטטוס...' : 'בדיקת סטטוס'}
            </button>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.12)',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 700 }}>
              סטטוס שיוך
            </div>
            <div style={{
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              padding: '8px 12px',
              fontSize: '18px'
            }}>
              {boardStatus}
            </div>
            {boardInfo?.linked && (
              <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
                מזהה לוגי: {boardInfo.logical_board_id || 'לא זמין'}
              </div>
            )}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '18px',
              marginBottom: '12px',
              textAlign: 'right',
              fontWeight: 700
            }}>
              בחר לוח לשיוך
            </label>
            <select
              value={selectedBoardId || ''}
              onChange={(e) => setSelectedBoardId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '18px',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#000',
                cursor: isLoadingBoards ? 'not-allowed' : 'pointer'
              }}
              disabled={isLoadingBoards}
            >
              <option value="">
                {isLoadingBoards ? 'טוען לוחות...' : '-- בחר לוח --'}
              </option>
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name || board.display_name || board.displayName || `לוח ${board.id}`}
                  {board.logical_board_id ? ` (#${board.logical_board_id})` : ''}
                  {board.location ? ` — ${board.location}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            {qrImage && (
              <img
                src={qrImage}
                alt="QR code for claim"
                style={{
                  width: '100%',
                  maxWidth: '180px',
                  borderRadius: '12px',
                  background: '#fff',
                  padding: '8px'
                }}
              />
            )}
            <div style={{ fontSize: '14px', opacity: 0.85 }}>
              סרקו את ה-QR לפתיחת עמוד השיוך
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            marginBottom: '16px',
            padding: '14px',
            background: 'rgba(255, 59, 48, 0.25)',
            borderRadius: '12px',
            color: '#ffecec',
            fontSize: '16px'
          }}>
            {error}
          </div>
        )}

        {statusMessage && !error && (
          <div style={{
            marginBottom: '16px',
            padding: '14px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            fontSize: '16px'
          }}>
            {statusMessage}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleClaim}
            disabled={isLoadingClaim || !selectedBoardId}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '16px',
              fontSize: '18px',
              fontWeight: '800',
              borderRadius: '12px',
              border: 'none',
              background: isLoadingClaim || !selectedBoardId ? 'rgba(255, 255, 255, 0.3)' : '#2fb573',
              color: '#fff',
              cursor: isLoadingClaim || !selectedBoardId ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {isLoadingClaim ? 'משייך לוח...' : 'שיוך לוח'}
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '16px',
              minWidth: '160px',
              fontSize: '16px',
              fontWeight: 700,
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            איפוס נתוני שיוך
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #145a43 0%, #0b3b2d 100%)',
        color: '#fff',
        fontSize: '24px',
        direction: 'rtl'
      }}>
        טוען...
      </div>
    }>
      <ClaimPageContent />
    </Suspense>
  );
}
