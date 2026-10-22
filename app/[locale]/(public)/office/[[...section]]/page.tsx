import { notFound, redirect } from 'next/navigation';
import { getOfficeOverview } from '@/src/server/db/office';
import { optionalUser } from '@/src/server/security';
import { Office, type OfficeQuery, type OfficeView } from '@/src/components/office/office';
export const metadata = {
  title: 'Private Office · Darivo',
  robots: { index: false, follow: false },
};
export default async function OfficePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; section?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, section = [] } = await params;
  if (locale !== 'en' && locale !== 'ar') notFound();
  const allowed: OfficeView[] = [
    'portfolios',
    'comparison',
    'advisor',
    'viewings',
    'private-collection',
    'privacy',
  ];
  if (section.length > 1 || (section[0] && !allowed.includes(section[0] as OfficeView))) notFound();
  const raw = await searchParams,
    query: OfficeQuery = {};
  for (const key of ['action', 'kind', 'id', 'theme'] as const)
    if (typeof raw[key] === 'string' && raw[key].length <= 200) query[key] = raw[key];
  const user = await optionalUser();
  if (!user) {
    const suffix = new URLSearchParams(Object.entries(query)).toString();
    const returnTo = `/${locale}/office${section.length ? `/${section[0]}` : ''}${suffix ? `?${suffix}` : ''}`;
    redirect(`/${locale}/login?returnTo=${encodeURIComponent(returnTo)}`);
  }
  const client = ['CLIENT', 'VERIFIED_CLIENT'].includes(user.role);
  const initialData = client ? await getOfficeOverview(user, { locale }) : null;
  return (
    <Office
      key={`${locale}:${section.join('/')}:${query.action ?? ''}:${query.kind ?? ''}:${query.id ?? ''}`}
      locale={locale}
      access={client ? 'client' : 'denied'}
      initialData={initialData}
      initialView={(section[0] ?? 'portfolios') as OfficeView}
      query={query}
    />
  );
}
