"use client";
import React from "react";

type Letter = { id: string; title: string; parasha?: string; html: string; signature?: string };
type Props = {
  prayers: Array<{ id: string; title: string; fixedTime?: string }>;
  letter: Letter | null;
  themeColor: string;
};

export default function PagesSlider({ prayers, letter, themeColor }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={{ padding: 16, borderRadius: 12, background: themeColor }}>
        <h3 dir="rtl" style={{ marginTop: 0 }}>תפילות חג</h3>
        <ul dir="rtl" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {prayers.map(p => (
            <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
              <span>{p.title}</span>
              <span>{p.fixedTime ?? '--:--'}</span>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ padding: 16, borderRadius: 12, background: themeColor }}>
        <h3 dir="rtl" style={{ marginTop: 0 }}>אגרת הרבצ"ר</h3>
        {letter ? (
          <div dir="rtl" dangerouslySetInnerHTML={{ __html: letter.html }} />
        ) : (
          <div dir="rtl">אין אגרת להצגה</div>
        )}
      </div>
    </div>
  );
}



