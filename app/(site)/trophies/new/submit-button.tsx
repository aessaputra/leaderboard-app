'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-white text-black px-4 py-3 text-sm font-semibold shadow-sm
                 disabled:opacity-60 disabled:cursor-not-allowed"
      aria-busy={pending}
    >
      {pending ? 'Mengirim…' : label}
    </button>
  );
}
