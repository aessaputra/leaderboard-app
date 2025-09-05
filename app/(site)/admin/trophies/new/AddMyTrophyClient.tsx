'use client';

import { useState, useEffect } from 'react';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

export default function AddMyTrophyClient({ userId }: { userId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { enqueue, processQueue, attachOnlineListener } = useOfflineQueue();

  useEffect(() => {
    attachOnlineListener();
    processQueue();
  }, [attachOnlineListener, processQueue]);

  async function submit(formData: FormData) {
    setMessage(null);
    setError(null);

    const payload = {
      userId,
      competition: String(formData.get('competition')) as 'UCL' | 'EUROPA',
      season: String(formData.get('season') || ''),
    };

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await enqueue({
        url: '/api/trophies',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      setMessage('📦 Tersimpan offline. Akan dikirim saat online.');
      return;
    }

    const res = await fetch('/api/trophies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error ?? 'Gagal kirim. Disimpan ke antrean offline.');
      await enqueue({
        url: '/api/trophies',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      return;
    }

    const j = await res.json().catch(() => ({}));
    setMessage(
      j.approved
        ? '✅ Trophy ditambahkan!'
        : '⏳ Berhasil diajukan, menunggu persetujuan admin.'
    );
  }

  return (
    <form action={submit} className="mt-4 space-y-3">
      <label className="block text-sm">
        <span className="mb-1 block">Kompetisi</span>
        <select
          name="competition"
          className="w-full rounded-xl border px-3 py-2"
          required
        >
          <option value="UCL">UCL</option>
          <option value="EUROPA">Europa</option>
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block">Musim (opsional)</span>
        <input
          name="season"
          placeholder="2025/26"
          className="w-full rounded-xl border px-3 py-2"
        />
      </label>

      <button className="w-full rounded-xl bg-black px-3 py-2 text-white">
        Kirim
      </button>

      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
