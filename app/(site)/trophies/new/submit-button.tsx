'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl px-4 py-3 text-sm font-semibold shadow-md transition
                 bg-gradient-to-b from-brand-500 to-brand-600 text-white hover:from-brand-500 hover:to-brand-600/90
                 ring-1 ring-brand-500/20 active:translate-y-px
                 dark:bg-none dark:bg-brand-500/15 dark:text-brand-300 dark:border dark:border-brand-500/25 dark:hover:bg-brand-500/20
                 disabled:opacity-60 disabled:cursor-not-allowed"
      aria-busy={pending}
    >
      {pending ? 'Mengirim…' : label}
    </button>
  );
}
