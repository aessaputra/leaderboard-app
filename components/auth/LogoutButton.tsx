'use client';

import { useTransition } from 'react';
import { signOut } from 'next-auth/react';

export default function LogoutButton({
  label = 'Logout',
  to = '/login?callbackUrl=/',
  className,
}: {
  label?: string;
  to?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      onClick={() => start(() => signOut({ callbackUrl: to }))}
      className={
        className ??
        'rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 disabled:opacity-50'
      }
      aria-label="Logout"
      disabled={pending}
    >
      {pending ? 'Keluar…' : label}
    </button>
  );
}
