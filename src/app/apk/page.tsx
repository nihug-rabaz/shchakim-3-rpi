"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApkPage() {
  const router = useRouter();

  useEffect(() => {
    console.log('[APK] Showing emergency GIF, will return to display after 5 seconds');
    const timer = setTimeout(() => {
      console.log('[APK] Returning to display');
      router.push('/display');
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFFFF',
      zIndex: 9999,
      opacity: 1,
      pointerEvents: 'auto'
    }}>
      <img
        src="/load.gif"
        alt="Emergency Loading"
        onError={(e) => {
          console.error('[APK] Emergency GIF error:', e);
        }}
        onLoad={() => {
          console.log('[APK] Emergency GIF loaded successfully');
        }}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          height: '55vh',
          objectFit: 'contain',
          display: 'block'
        }}
      />
    </div>
  );
}

