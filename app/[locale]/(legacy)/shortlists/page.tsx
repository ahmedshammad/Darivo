import { optionalUser } from '@/src/server/security';
import { AccessGate } from '@/src/components/access-gate';
import { Shortlists } from '@/src/components/client-workflows';
import { scopedShortlists } from '@/src/server/db/workflows';
import { getProperty, type PropertyDTO } from '@/src/server/db/properties';
export default async function Page({ searchParams }: { searchParams: Promise<{ save?: string }> }) {
  const user = await optionalUser();
  if (!user) return <AccessGate />;
  const ids = (await searchParams).save?.split(',').slice(0, 24) ?? [],
    selection: PropertyDTO[] = [];
  for (const id of ids) {
    const p = await getProperty(id, user);
    if (p) selection.push(p);
  }
  return <Shortlists initial={await scopedShortlists(user)} selection={selection} />;
}
