"use client";
import React, { useState } from "react";
import { QRCodeSVG } from 'qrcode.react';

type Props = { url: string };

export default function QrHintButton({ url }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'fixed', bottom: 16, left: 16, zIndex: 50 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: '#111',
          color: '#fff',
          border: 'none',
          borderRadius: 9999,
          padding: '10px 14px',
          cursor: 'pointer'
        }}
      >
        שמור על קשר
      </button>
      {open && (
        <div style={{ position: 'absolute', bottom: 56, left: 0, padding: 12, borderRadius: 12, background: '#fff', color: '#000' }}>
          <QRCodeSVG
            value={url}
            size={160}
            level="M"
            includeMargin={true}
          />
        </div>
      )}
    </div>
  );
}



