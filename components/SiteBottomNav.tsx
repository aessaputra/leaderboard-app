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
          'flex h-12 w-14 sm:w-16 shrink-0 items-center justify-center rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-brand-500/20 ' +
          (active
            ? 'border-brand-300 bg-brand-50 text-brand-600 dark:border-white/20 dark:bg-white/15 dark:text-white'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10');
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
