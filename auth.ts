import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Nodemailer from 'next-auth/providers/nodemailer';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { z } from 'zod';
import { db } from './src/server/db/client';
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  trustHost: true,
  providers: [
    Credentials({
      name: 'Local demo',
      credentials: { email: {} },
      async authorize(input) {
        if (process.env.DEMO_MODE !== 'true' || process.env.NODE_ENV === 'production') return null;
        const result = z
          .object({
            email: z.enum([
              'client@darivo.example',
              'verified@darivo.example',
              'partner@darivo.example',
              'advisor@darivo.example',
              'admin@darivo.example',
            ]),
          })
          .safeParse(input);
        if (!result.success) return null;
        return db.user.findUnique({ where: { email: result.data.email } });
      },
    }),
    Nodemailer({
      server: { host: 'localhost', port: 1025 },
      from: 'concierge@darivo.example',
      async sendVerificationRequest({ identifier, url }) {
        if (process.env.NODE_ENV === 'production')
          throw new Error('Configure a production mail adapter before enabling magic links');
        console.info(JSON.stringify({ event: 'dev_magic_link', email: identifier, url }));
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return !!(user.email && (await db.user.findUnique({ where: { email: user.email } })));
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
