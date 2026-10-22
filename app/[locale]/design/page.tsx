import { notFound } from 'next/navigation';
import { DesignGuide } from '@/src/components/design-system/design-guide';
export const metadata = { title: 'Design Atlas' };
export default async function DesignPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ theme?: string }>;
}) {
  const { locale } = await params;
  if (locale !== 'en' && locale !== 'ar') notFound();
  const { theme } = await searchParams;
  return <DesignGuide locale={locale} initialTheme={theme === 'light' ? 'light' : 'dark'} />;
}
