"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ClaimPageContent() {
  const searchParams = useSearchParams();
  const boardId = searchParams.get('id') || '';
  const [boards, setBoards] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const mockBoards = [
      { id: 15, name: 'לוח פיקוד דרום' },
      { id: 16, name: 'לוח פיקוד צפון' },
      { id: 17, name: 'לוח פיקוד מרכז' }
    ];
    setBoards(mockBoards);
  }, []);

  const handleClaim = async () => {
    if (!selectedBoardId || !boardId) {
      setError('נא לבחור לוח');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board_id: boardId,
          logical_board_id: selectedBoardId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'שיוך נכשל');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'שגיאה בשיוך הלוח');
    } finally {
      setIsLoading(false);
    }
  };

  if (!boardId) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        color: '#fff',
        fontSize: '24px',
        direction: 'rtl'
      }}>
        מזהה לוח חסר
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        color: '#fff',
        fontSize: '24px',
        direction: 'rtl'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '48px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>✓</div>
          <div style={{ fontSize: '24px' }}>הלוח שויך בהצלחה!</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      color: '#fff',
      padding: '40px',
      direction: 'rtl'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '48px',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h1 style={{ fontSize: '36px', marginBottom: '24px', fontWeight: '700' }}>
          שיוך לוח
        </h1>

        <div style={{
          fontSize: '18px',
          marginBottom: '32px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          fontFamily: 'monospace'
        }}>
          מזהה לוח: <strong>{boardId}</strong>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            fontSize: '20px',
            marginBottom: '16px',
            textAlign: 'right'
          }}>
            בחר לוח לשיוך:
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
              cursor: 'pointer'
            }}
          >
            <option value="">-- בחר לוח --</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name} (#{board.id})
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: 'rgba(255, 0, 0, 0.2)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '16px'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleClaim}
          disabled={isLoading || !selectedBoardId}
          style={{
            width: '100%',
            padding: '20px',
            fontSize: '20px',
            fontWeight: '700',
            borderRadius: '12px',
            border: 'none',
            background: isLoading || !selectedBoardId ? 'rgba(255, 255, 255, 0.3)' : '#145a43',
            color: '#fff',
            cursor: isLoading || !selectedBoardId ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {isLoading ? 'משיוך...' : 'שיוך לוח'}
        </button>
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
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
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

