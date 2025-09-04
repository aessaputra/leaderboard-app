'use client';

import { FormEvent, useState } from 'react';

export default function RegisterPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get('name')),
      email: String(form.get('email')),
      password: String(form.get('password')),
    };

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setErr(data?.error || 'Gagal daftar');
      return;
    }
    setMsg('Registrasi berhasil. Tunggu approval admin ya!');
    (e.currentTarget as HTMLFormElement).reset();
  };

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold">Daftar</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          name="name"
          placeholder="Nama lengkap"
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 6)"
          className="w-full rounded border px-3 py-2"
        />
        <button className="w-full rounded bg-black px-3 py-2 text-white">
          Daftar
        </button>
      </form>
      {msg && <p className="mt-2 text-sm text-green-600">{msg}</p>}
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </main>
  );
}
