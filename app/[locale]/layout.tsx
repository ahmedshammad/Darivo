import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/src/server/db/client';
import { PreferencesProvider } from '@/src/components/preferences';
import { Shell } from '@/src/components/shell';
import '../globals.css';
export const metadata = {
  title: { default: 'Darivo · A considered address', template: '%s · Darivo' },
  description: 'A private, bilingual property collection. Synthetic demonstration.',
};
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!['en', 'ar'].includes(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages({ locale });
  const session = await auth();
  const user = session?.user?.email
    ? await db.user.findUnique({ where: { email: session.user.email }, include: { profile: true } })
    : null;
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <link
          rel="preload"
          href={locale === 'ar' ? '/fonts/arabic.woff2' : '/fonts/display.woff2'}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/ui.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PreferencesProvider currency={user?.profile?.currency} unit={user?.profile?.areaUnit}>
            <Shell email={user?.email} role={user?.role}>
              {children}
            </Shell>
          </PreferencesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
