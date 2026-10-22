import { notFound } from 'next/navigation';
import { Arrival } from '@/src/components/atlas/arrival';
import { getAtlasData } from '@/src/server/db/atlas';
import { optionalUser } from '@/src/server/security';

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ theme?: string }>;
}) {
  const [{ locale }, { theme }, viewer, data] = await Promise.all([
    params,
    searchParams,
    optionalUser(),
    getAtlasData(null),
  ]);
  if (locale !== 'en' && locale !== 'ar') notFound();
  return (
    <Arrival
      data={data}
      locale={locale}
      initialTheme={theme === 'light' ? 'light' : 'dark'}
      signedIn={!!viewer}
      viewerRole={viewer?.role}
    />
  );
}
