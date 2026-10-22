import { optionalUser } from '@/src/server/security';
import { AccessGate } from '@/src/components/access-gate';
import { Viewing } from '@/src/components/client-workflows';
import { db } from '@/src/server/db/client';
import { getProperty } from '@/src/server/db/properties';
import { getLocale } from 'next-intl/server';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>;
}) {
  const user = await optionalUser();
  if (!user) return <AccessGate />;
  const locale = await getLocale(),
    id = (await searchParams).property;
  const property = id ? await getProperty(id, user) : null;
  const profile = await db.clientProfile.findUnique({ where: { userId: user.id } }),
    viewings = await db.viewingRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  const requests = [];
  for (const request of viewings) {
    const p = await getProperty(request.propertyId, user);
    if (p)
      requests.push({
        id: request.id,
        slots: request.slots.map((s) => s.toISOString()),
        timezone: request.timezone,
        status: request.status,
        mode: request.mode,
        title: p.translations.find((tr) => tr.locale === locale)!.title,
      });
  }
  return <Viewing property={property} timezone={profile?.timezone} requests={requests} />;
}
