'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm
                 bg-brand-500 text-white hover:bg-brand-600
                 dark:bg-brand-500/20 dark:text-brand-300 dark:border dark:border-brand-400/30 dark:hover:bg-brand-500/25
                 disabled:opacity-60 disabled:cursor-not-allowed"
      aria-busy={pending}
    >
      {pending ? 'Mengirim…' : label}
    </button>
  );
}
