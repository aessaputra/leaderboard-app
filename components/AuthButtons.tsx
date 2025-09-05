'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div
        className="h-8 w-28 animate-pulse rounded-xl bg-white/10"
        aria-hidden
      />
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/me"
          className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {session.user.name?.split(' ')[0] ?? 'Me'}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Register
      </Link>
    </div>
  );
}
