import 'server-only';
import { cache } from 'react';
import { auth } from '@/auth';
import { db } from './db/client';

// React cache deduplicates this lookup within one server render, not across requests.
// The session supplies identity; current role and preferences come from the database.
export const getLayoutUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      profile: { select: { currency: true, areaUnit: true, arabicIndicDigits: true } },
    },
  });
});
