import NextAuth, { type NextAuthOptions } from 'next-auth';
import Google from 'next-auth/providers/google';
import Email from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
    Email({ server: process.env.EMAIL_SERVER, from: process.env.EMAIL_FROM }),
  ],
  session: { strategy: 'database' },
  cookies: { sessionToken: { name: 'itp_session', options: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' } } },
  callbacks: {
    async session({ session, user }) {
      // expose userId on session
      (session as any).userId = user.id;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
