'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email'));
    const password = String(form.get('password'));

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      return;
    }
    window.location.href = '/';
  };

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold">Masuk</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          name="email"
          type="text"
          placeholder="Email"
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full rounded border px-3 py-2"
        />
        <button className="w-full rounded bg-black px-3 py-2 text-white">
          Login
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-4 text-sm">
        Belum punya akun?{' '}
        <Link href="/register" className="underline">
          Daftar
        </Link>
      </p>
    </main>
  );
}
