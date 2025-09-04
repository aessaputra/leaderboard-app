import { prisma } from '@/lib/db';
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (creds) => {
        if (!creds?.email || !creds?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: creds.email },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(creds.password, user.password);
        if (!ok) return null;

        // wajib approved untuk bisa login
        if (!user.approved) {
          throw new Error('Akun belum di-approve admin.');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          approved: user.approved,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // saat login pertama kali, merge properti user
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.approved = (user as any).approved;
        token.name = user.name ?? null;
        token.email = user.email ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token as any).id;
        session.user.role = (token as any).role;
        session.user.approved = (token as any).approved;
        session.user.name = (token as any).name ?? null;
        session.user.email = (token as any).email ?? null;
      }
      return session;
    },
  },
  // untuk dev di docker
  trustHost: true,
};
