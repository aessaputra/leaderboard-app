'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AuthButtons from './AuthButtons';

export default function MobileHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(
      typeof window !== 'undefined' &&
        window.history.length > 1 &&
        pathname !== '/'
    );
  }, [pathname]);

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1)
      router.back();
    else router.push('/');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {canGoBack ? (
            <button
              onClick={handleBack}
              aria-label="Kembali"
              className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              ←
            </button>
          ) : (
            <Link href="/" className="font-semibold">
              PES Trophy ⚽️
            </Link>
          )}
        </div>
        <AuthButtons />
      </div>
    </header>
  );
}
