'use client';
import { useRouter } from 'next/navigation';

export default function BackButton({ fallback = '/' }: { fallback?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1)
          router.back();
        else router.push(fallback);
      }}
      className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      aria-label="Kembali"
    >
      ← Kembali
    </button>
  );
}
