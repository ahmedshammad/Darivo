import { notFound } from 'next/navigation';
import { Explore } from '@/src/components/atlas/explore';
import { getAtlasData } from '@/src/server/db/atlas';
import { optionalUser } from '@/src/server/security';
export const metadata = { title: 'The Living Atlas · Darivo' };
export default async function ExplorePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    theme?: string;
    q?: string;
    story?: string;
    developer?: string;
    fallback?: string;
  }>;
}) {
  const { locale } = await params;
  if (locale !== 'en' && locale !== 'ar') notFound();
  const query = await searchParams;
  const user = await optionalUser();
  const data = await getAtlasData(user);
  return (
    <Explore
      data={data}
      locale={locale}
      initialTheme={query.theme === 'light' ? 'light' : 'dark'}
      initialQuery={(query.q || '').slice(0, 1500)}
      initialStory={query.story || ''}
      developerId={query.developer || ''}
      signedIn={Boolean(user)}
      forceFallback={query.fallback === '1'}
    />
  );
}
