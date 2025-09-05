'use client';

import { useState } from 'react';

export default function AddTrophyClient({
  users,
  onSubmit,
}: {
  users: { id: string; name: string | null; email: string }[];
  onSubmit: (payload: {
    competition: 'UCL' | 'EUROPA';
    userId: string;
  }) => Promise<void>;
}) {
  const [competition, setCompetition] = useState<'UCL' | 'EUROPA'>('UCL');
  const [userId, setUserId] = useState('');

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({ competition, userId });
      }}
      className="space-y-3"
    >
      <div className="rounded-lg border p-3">
        <label className="mb-1 block text-sm">Kompetisi</label>
        <select
          className="w-full rounded-md border bg-black/40 p-2"
          value={competition}
          onChange={(e) => setCompetition(e.target.value as 'UCL' | 'EUROPA')}
        >
          <option value="UCL">UCL</option>
          <option value="EUROPA">Europa</option>
        </select>
      </div>
      <div className="rounded-lg border p-3">
        <label className="mb-1 block text-sm">Untuk User</label>
        <select
          className="w-full rounded-md border bg-black/40 p-2"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        >
          <option value="">— pilih user —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name || u.email}
            </option>
          ))}
        </select>
      </div>
      <button className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black hover:opacity-90">
        Tambahkan
      </button>
    </form>
  );
}
