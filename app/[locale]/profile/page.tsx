import { optionalUser } from '@/src/server/security';
import { AccessGate } from '@/src/components/access-gate';
import { Profile } from '@/src/components/client-workflows';
import { db } from '@/src/server/db/client';
export default async function Page() {
  const user = await optionalUser();
  if (!user) return <AccessGate />;
  const profile = await db.clientProfile.findUnique({ where: { userId: user.id } });
  return (
    <Profile
      verification={user.verification}
      profile={
        profile ?? {
          language: 'en',
          currency: 'AED',
          areaUnit: 'sqm',
          timezone: 'Asia/Dubai',
          notifications: false,
          arabicIndicDigits: false,
        }
      }
    />
  );
}
