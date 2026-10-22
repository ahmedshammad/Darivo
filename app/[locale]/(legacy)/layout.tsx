import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Shell } from '@/src/components/shell';
import { getLayoutUser } from '@/src/server/layout-user';
import '../../globals.css';

export default async function LegacyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== 'en' && locale !== 'ar') notFound();
  const [messages, user] = await Promise.all([getMessages({ locale }), getLayoutUser()]);
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Shell email={user?.email} role={user?.role}>
        {children}
      </Shell>
    </NextIntlClientProvider>
  );
}
