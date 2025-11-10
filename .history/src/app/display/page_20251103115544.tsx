"use client";
import { useMemo, useState } from 'react';

function buildQrUrl(targetUrl: string, size: number) {
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(targetUrl)}&size=${size}x${size}&margin=0`;
}

export default function DisplayPage() {
  const [open, setOpen] = useState(false);
  const pairUrl = useMemo(() => {
    if (typeof window === 'undefined') return '/pair';
    return `${window.location.origin}/pair`;
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      position: 'relative'
    }}>
      <iframe
        src="/html.html"
        style={{
          width: '200%',
          height: '200%',
          border: 'none',
          display: 'block',
          overflow: 'hidden',
          transform: 'scale(0.5)',
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0
        }}
        title="Shchakim Display"
        scrolling="no"
      />

      <button
        aria-label="help"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          border: 'none',
          background: 'rgba(0,0,0,0.55)',
          color: '#fff',
          fontSize: 28,
          lineHeight: '56px',
          textAlign: 'center',
          cursor: 'pointer',
          zIndex: 2147483647
        }}
      >?
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2147483647
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 420,
              maxWidth: '90vw',
              background: '#0b3d2e',
              color: '#fff',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 16 }}>סרוק להתחברות</div>
            <img
              alt="QR"
              src={buildQrUrl(pairUrl, 240)}
              style={{ width: 240, height: 240, background: '#fff', borderRadius: 8 }}
            />
            <div style={{ fontSize: 14, opacity: 0.9, marginTop: 12, direction: 'rtl' }}>{pairUrl}</div>
            <button
              onClick={() => setOpen(false)}
              style={{
                marginTop: 20,
                width: '100%',
                height: 44,
                borderRadius: 8,
                border: 'none',
                background: '#145a43',
                color: '#fff',
                fontSize: 16,
                cursor: 'pointer'
              }}
            >סגור</button>
          </div>
        </div>
      )}
    </div>
  );
}