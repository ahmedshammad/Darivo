import { optionalUser } from '@/src/server/security';
import { AccessGate } from '@/src/components/access-gate';
import { Advisor, type Inbox } from '@/src/components/staff';
import { advisorInbox } from '@/src/server/advisor';
import { getTranslations } from 'next-intl/server';
export default async function Page() {
  const user = await optionalUser(),
    t = await getTranslations();
  if (!user) return <AccessGate />;
  if (!['ADVISOR', 'ADMIN'].includes(user.role))
    return <div className="shell page empty">{t('accessDenied')}</div>;
  return <Advisor inbox={JSON.parse(JSON.stringify(await advisorInbox())) as Inbox} />;
}
