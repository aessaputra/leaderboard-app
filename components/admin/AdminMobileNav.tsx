'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Clock, Users2 } from 'lucide-react';

const items = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/trophies/requests', label: 'Requests', Icon: Clock },
  { href: '/admin/users', label: 'Users', Icon: Users2 },
];

export default function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-black/70 backdrop-blur sm:hidden toolbar-safe">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 safe-px">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={
                  'flex flex-col items-center gap-1 py-2.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ' +
                  (active ? 'text-white' : 'text-gray-300')
                }
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={'h-5 w-5 ' + (active ? '' : 'opacity-80')} />
                <span className={active ? 'font-medium' : ''}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
