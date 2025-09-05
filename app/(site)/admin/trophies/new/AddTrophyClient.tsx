'use client';

import { useState, useEffect } from 'react';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

type U = { id: string; name: string; email: string };

export default function AddTrophyClient({ users }: { users: U[] }) {
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
      userId: String(formData.get('userId')),
      competition: String(formData.get('competition')) as 'UCL' | 'EUROPA',
      season: String(formData.get('season') || '2025/26'),
    };

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await enqueue({
        url: '/api/trophies',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      setMessage('📦 Tersimpan offline. Akan dikirim otomatis saat online.');
      return;
    }

    const res = await fetch('/api/trophies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!res.ok) {
      setError('Gagal kirim. Disimpan ke antrean offline untuk dicoba ulang.');
      await enqueue({
        url: '/api/trophies',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      return;
    }

    setMessage('✅ Trophy ditambahkan!');
  }

  return (
    <form
      action={async (fd) => {
        await submit(fd);
      }}
      className="mt-4 space-y-3"
    >
      <label className="block text-sm">
        <span className="mb-1 block">Pemain</span>
        <select
          name="userId"
          className="w-full rounded border px-3 py-2"
          required
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block">Kompetisi</span>
        <select
          name="competition"
          className="w-full rounded border px-3 py-2"
          required
        >
          <option value="UCL">UCL</option>
          <option value="EUROPA">Europa</option>
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block">Musim</span>
        <input
          name="season"
          placeholder="2025/26"
          className="w-full rounded border px-3 py-2"
        />
      </label>

      <button className="w-full rounded bg-black px-3 py-2 text-white">
        Tambah Trophy
      </button>

      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
