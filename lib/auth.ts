import { prisma } from '@/lib/db';
import type { NextAuthOptions, Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import type { JWT } from 'next-auth/jwt';

type Role = 'USER' | 'ADMIN';
type UserPayload = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  approved: boolean;
};

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
      password: { label: 'Password', type: 'password' },
      },
      authorize: async (creds): Promise<UserPayload | null> => {
        if (!creds?.email || !creds?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: creds.email },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(creds.password, user.password);
        if (!ok) return null;

        if (!user.approved) throw new Error('Akun belum di-approve admin.');

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as Role,
          approved: user.approved,
        };
      },
    }),
  ],
  pages: { signIn: '/login', signOut: '/login' },
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        const u = user as UserPayload;
        token.id = u.id;
        token.role = u.role;
        token.approved = u.approved;
        token.name = u.name ?? null;
        token.email = u.email ?? null;
      }
      return token as JWT;
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        session.user.id = (token as JWT).id;
        session.user.role = (token as JWT).role as Role;
        session.user.approved = (token as JWT).approved;
        session.user.name = (token as JWT).name ?? null;
        session.user.email = (token as JWT).email ?? null;
      }
      return session;
    },
  },
};
