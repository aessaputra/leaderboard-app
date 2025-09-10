// TailAdmin-based admin layout wrapper
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { ReactNode } from 'react';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return null;

  return <AdminShell>{children}</AdminShell>;
}
