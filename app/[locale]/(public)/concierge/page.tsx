import { notFound } from 'next/navigation';
import { ConciergeClient } from '@/src/components/concierge/concierge-client';
import { getAtlasData } from '@/src/server/db/atlas';
import { optionalUser } from '@/src/server/security';
import { getProperty } from '@/src/server/db/properties';

export const metadata = { title: 'Your Concierge · Darivo' };
export default async function ConciergePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    brief?: string;
    project?: string;
    unit?: string;
    theme?: string;
    fallback?: string;
  }>;
}) {
  const { locale } = await params;
  if (locale !== 'en' && locale !== 'ar') notFound();
  const [query, user] = await Promise.all([searchParams, optionalUser()]);
  const data = await getAtlasData(user);
  const unit = typeof query.unit === 'string' ? await getProperty(query.unit, user) : null;
  const project = data.projects.find((item) => item.id === query.project);
  const request =
    typeof query.q === 'string' ? query.q : typeof query.brief === 'string' ? query.brief : '';
  const subject = unit
    ? (unit.translations.find((translation) => translation.locale === locale)?.title ?? unit.slug)
    : project
      ? locale === 'ar'
        ? project.nameAr
        : project.nameEn
      : '';
  const initialDraft = [request, subject].filter(Boolean).join('\n').slice(0, 4000);
  return (
    <ConciergeClient
      locale={locale}
      guest={!user}
      data={{ projects: data.projects, pois: data.pois }}
      initialDraft={initialDraft}
      initialSelection={unit ? { kind: 'unit', id: unit.id } : undefined}
      initialTheme={query.theme === 'light' ? 'light' : 'dark'}
      forceFallback={query.fallback === '1'}
    />
  );
}
