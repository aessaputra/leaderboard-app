'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Suspense, useState } from 'react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md mx-auto p-5" />}> 
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const callbackUrl = sp.get('callbackUrl') ?? '/';
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') ?? '');
    const password = String(fd.get('password') ?? '');
    const res = await signIn('credentials', {
      redirect: false,
      callbackUrl,
      email,
      password,
    });
    setLoading(false);

    if (res?.ok) {
      router.push(callbackUrl);
    } else {
      setError('Login gagal. Periksa email/username dan password Anda.');
    }
  }

  return (
    <section aria-labelledby="auth-title" className="w-full">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_1px_1px_rgba(255,255,255,0.08)_inset,0_20px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-white/10 grid place-items-center">
            ⚽️
          </div>
          <h1 id="auth-title" className="text-2xl font-bold">
            Masuk
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Akses PES Trophy Leaderboard
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-3"
          aria-describedby="login-help"
        >
          <label className="block">
            <span className="sr-only">Email atau Username</span>
            <input
              name="email"
              type="text"
              inputMode="email"
              autoComplete="username"
              required
              placeholder="Email / Username"
              className="w-full rounded-xl border border-white/15 bg-black/10 px-3 py-3 outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-white"
            />
          </label>

          <label className="block">
            <span className="sr-only">Password</span>
            <div className="relative">
              <input
                name="password"
                type={visible ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="Password"
                className="w-full rounded-xl border border-white/15 bg-black/10 px-3 py-3 pr-12 outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-white"
              />
              <button
                type="button"
                aria-label={
                  visible ? 'Sembunyikan password' : 'Tampilkan password'
                }
                onClick={() => setVisible((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-gray-300 hover:bg-white/10"
              >
                {visible ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white text-black px-4 py-3 text-sm font-semibold hover:bg-white/90 disabled:opacity-60"
          >
            {loading ? 'Memproses…' : 'Masuk'}
          </button>
        </form>

        <p id="login-help" className="mt-4 text-center text-sm text-gray-400">
          Belum punya akun?{' '}
          <Link
            className="underline"
            href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          >
            Daftar
          </Link>
        </p>
      </div>
    </section>
  );
}
