'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, ListOrdered, SquarePlus, UserRound } from 'lucide-react';

const items = [
  { href: '/', label: 'Home', Icon: House },
  { href: '/leaderboard', label: 'Leaderboard', Icon: ListOrdered },
  { href: '/trophies/new', label: 'Ajukan', Icon: SquarePlus },
  { href: '/me', label: 'Profil', Icon: UserRound },
];

export default function SiteBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto w-full max-w-md sm:max-w-3xl flex items-center justify-evenly py-3 px-6 sm:px-8 safe-px">
      {items.map(({ href, label, Icon }) => {
        const active =
          href === '/'
            ? pathname === '/'
            : pathname === href || pathname.startsWith(href + '/');
        const cls =
          'flex h-12 w-14 sm:w-16 shrink-0 items-center justify-center rounded-xl border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ' +
          (active
            ? 'border-white/20 bg-white/15 text-white ring-1 ring-sky-400/40'
            : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10');
        return (
          <Link key={href} href={href} className={cls} aria-label={label} aria-current={active ? 'page' : undefined}>
            <Icon className="h-5 w-5" />
            <span className="sr-only">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
