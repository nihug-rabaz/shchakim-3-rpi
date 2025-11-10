"use client";
import React from "react";

type Order = { id: string; title: string; summary: string; source_url: string };
type Halacha = { title: string; summary: string; link?: string } | null;
type Additions = { prayerExtras: { shacharit: string[]; mincha: string[]; arvit: string[] }; dayNotes: string[] };

type Props = {
  orders: Order[];
  halacha: Halacha;
  additions: Additions;
  cardBg: string;
};

export default function PromoSlider({ orders, halacha, additions, cardBg }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      <div style={{ padding: 16, borderRadius: 12, background: cardBg }}>
        <h3 dir="rtl" style={{ marginTop: 0 }}>פקודות מטכ"ל</h3>
        <ul dir="rtl" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {orders.map(o => (
            <li key={o.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontWeight: 600 }}>{o.title}</div>
              <div style={{ opacity: .9, fontSize: 14 }}>{o.summary}</div>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ padding: 16, borderRadius: 12, background: cardBg }}>
        <h3 dir="rtl" style={{ marginTop: 0 }}>הלכה יומית</h3>
        {halacha ? (
          <div dir="rtl">
            <div style={{ fontWeight: 600 }}>{halacha.title}</div>
            <div style={{ opacity: .9 }}>{halacha.summary}</div>
          </div>
        ) : (
          <div dir="rtl">אין הלכה להצגה</div>
        )}
      </div>
      <div style={{ padding: 16, borderRadius: 12, background: cardBg }}>
        <h3 dir="rtl" style={{ marginTop: 0 }}>תוספות לתפילה</h3>
        <div dir="rtl" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 600 }}>שחרית</div>
            <ul style={{ paddingInlineStart: 18 }}>
              {additions.prayerExtras.shacharit.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>מנחה</div>
            <ul style={{ paddingInlineStart: 18 }}>
              {additions.prayerExtras.mincha.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>ערבית</div>
            <ul style={{ paddingInlineStart: 18 }}>
              {additions.prayerExtras.arvit.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}



