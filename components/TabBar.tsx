'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Home' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/me', label: 'Profil' },
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-40 border-t border-white/10 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/30 toolbar-safe">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 safe-px">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={`block rounded-xl py-3 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  active ? 'font-semibold text-white' : 'text-gray-300'
                }`}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
