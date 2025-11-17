"use client";
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function FabOffPage() {
  const router = useRouter();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (hasNavigatedRef.current) return;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    const timer = setTimeout(() => {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        router.push('/display');
      }
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      document.head.removeChild(style);
    };
  }, [router]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #054a36 0%, #0b3d2e 100%)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        textAlign: 'center',
        color: '#fff'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          margin: '0 auto 24px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid #fff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{
          fontSize: '24px',
          fontWeight: '500'
        }}>
          טוען...
        </div>
      </div>
    </div>
  );
}

