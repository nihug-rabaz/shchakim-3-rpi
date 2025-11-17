"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type BoardData = {
  id: string;
  name?: string;
  display_name?: string;
  base_name?: string;
  base_description?: string | null;
  location?: string;
  show_fab: boolean;
  theme?: {
    primaryHex?: string;
    gradient?: string[];
  };
};

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;
  
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showFab, setShowFab] = useState(true);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const loadBoardData = async () => {
      if (!boardId) return;

      try {
        const response = await fetch(`/api/boards/${boardId}`);
        if (!response.ok) throw new Error('Failed to load board data');
        
        const data: BoardData = await response.json();
        setBoardData(data);
        setShowFab(data.show_fab);
        setIsLoading(false);
      } catch (error) {
        console.error('[SETTINGS] Error loading board data:', error);
        setIsLoading(false);
      }
    };

    loadBoardData();
  }, [boardId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/display');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleSave = async () => {
    if (!boardId) return;

    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          show_fab: showFab
        })
      });

      if (!response.ok) throw new Error('Failed to save settings');

      const command = showFab ? '/fab-on' : '/fab-off';
      setMessage(`השמירה תשלח את הפקודה ${command} ל-API`);
      
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (error) {
      console.error('[SETTINGS] Error saving settings:', error);
      setMessage('שגיאה בשמירה');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
        טוען...
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      padding: '20px',
      direction: 'rtl'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{
          fontSize: '28px',
          marginBottom: '24px',
          color: '#1f2937'
        }}>
          הגדרות לוח
        </h1>

        {boardData && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px' }}>
              מזהה לוח: {boardId}
            </div>
            {boardData.name && (
              <div style={{ fontSize: '18px', color: '#1f2937', marginBottom: '8px' }}>
                שם: {boardData.name}
              </div>
            )}
            {boardData.display_name && (
              <div style={{ fontSize: '18px', color: '#1f2937', marginBottom: '8px' }}>
                שם תצוגה: {boardData.display_name}
              </div>
            )}
          </div>
        )}

        <div style={{
          padding: '20px',
          background: '#f9fafb',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <label style={{
              fontSize: '18px',
              fontWeight: '500',
              color: '#1f2937',
              cursor: 'pointer'
            }}>
              הצגת כפתור FAB (גלגל השיניים)
            </label>
            <button
              onClick={() => setShowFab(!showFab)}
              style={{
                width: '56px',
                height: '32px',
                borderRadius: '16px',
                border: 'none',
                background: showFab ? '#10b981' : '#d1d5db',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '4px',
                left: showFab ? '28px' : '4px',
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
          
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '8px'
          }}>
            {showFab ? 'הכפתור מוצג במסך' : 'הכפתור מוסתר במסך'}
          </div>
        </div>

        {message && (
          <div style={{
            padding: '12px',
            background: message.includes('שגיאה') ? '#fee2e2' : '#d1fae5',
            color: message.includes('שגיאה') ? '#991b1b' : '#065f46',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '8px',
              border: 'none',
              background: isSaving ? '#9ca3af' : '#3b82f6',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {isSaving ? 'שומר...' : 'שמור'}
          </button>
          
          <button
            onClick={() => router.back()}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '8px',
              border: '2px solid #d1d5db',
              background: '#fff',
              color: '#1f2937',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

