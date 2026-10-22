import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getLayoutUser } from '@/src/server/layout-user';
import { PreferencesProvider } from '@/src/components/preferences';
import '../base.css';
import '@/src/styles/tokens.css';
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
  const user = await getLayoutUser();
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
        <PreferencesProvider
          key={user?.id ?? 'anonymous'}
          userId={user?.id}
          currency={user?.profile?.currency}
          unit={user?.profile?.areaUnit}
          arabicIndicDigits={user?.profile?.arabicIndicDigits}
        >
          {children}
        </PreferencesProvider>
      </body>
    </html>
  );
}
