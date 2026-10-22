import { notFound } from 'next/navigation';
import { ConciergeClient } from '@/src/components/concierge/concierge-client';
import { getAtlasData } from '@/src/server/db/atlas';
import { optionalUser } from '@/src/server/security';

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
    theme?: string;
    fallback?: string;
  }>;
}) {
  const { locale } = await params;
  if (locale !== 'en' && locale !== 'ar') notFound();
  const [query, user] = await Promise.all([searchParams, optionalUser()]);
  const data = await getAtlasData(user);
  const project = data.projects.find((item) => item.id === query.project);
  const request =
    typeof query.q === 'string' ? query.q : typeof query.brief === 'string' ? query.brief : '';
  const initialDraft = [request, project ? (locale === 'ar' ? project.nameAr : project.nameEn) : '']
    .filter(Boolean)
    .join('\n')
    .slice(0, 4000);
  return (
    <ConciergeClient
      locale={locale}
      guest={!user}
      data={{ projects: data.projects, pois: data.pois }}
      initialDraft={initialDraft}
      initialTheme={query.theme === 'light' ? 'light' : 'dark'}
      forceFallback={query.fallback === '1'}
    />
  );
}
