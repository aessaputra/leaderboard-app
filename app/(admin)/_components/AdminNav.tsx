// app/(site)/admin/_components/AdminNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UsersRound, Trophy, SquarePlus } from 'lucide-react';

const items = [
  { href: '/admin/users', label: 'Users', icon: UsersRound },
  { href: '/admin/trophies/requests', label: 'Pengajuan', icon: Trophy },
  { href: '/admin/trophies/new', label: 'Tambah', icon: SquarePlus },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-t border-white/10 bg-black/60 px-2">
      <ul className="mx-auto flex max-w-3xl gap-2 overflow-x-auto py-2 safe-px">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                  active
                    ? 'bg-white/15 ring-1 ring-red-400/40'
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
