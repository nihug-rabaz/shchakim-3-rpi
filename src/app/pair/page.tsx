"use client";
import { useEffect, useState } from 'react';

export default function PairPage() {
  const [deviceId, setDeviceId] = useState<string>("");
  const [pairingCode, setPairingCode] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const id = crypto.randomUUID();
    setDeviceId(id);
  }, []);

  async function requestPairing() {
    setError("");
    try {
      const res = await fetch('/api/display/pair/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPairingCode(data.pairingCode);
    } catch (e: any) {
      setError(e.message ?? 'Pairing failed');
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>שיוך מכשיר</h1>
      <p>Device ID: {deviceId}</p>
      <button onClick={requestPairing}>בקשת קוד שיוך</button>
      {pairingCode && (
        <p>Pairing Code: <strong>{pairingCode}</strong></p>
      )}
      {error && <p style={{ color: 'tomato' }}>{error}</p>}
    </main>
  );
}



