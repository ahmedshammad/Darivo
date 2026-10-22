import { Prisma } from '@prisma/client';
import { db } from '@/src/server/db/client';
import { conciergeReplaySchema } from '@/src/lib/concierge';
import {
  officePrivacySchema,
  privacySettingsInputSchema,
  type OfficePrivacy,
} from '@/src/lib/office';
import { HttpError } from '@/src/server/errors';

type Flags = Pick<OfficePrivacy, 'doNotSave' | 'doNotShare' | 'doNotBook'>;
type Database = Prisma.TransactionClient;
const keys = ['doNotSave', 'doNotShare', 'doNotBook'] as const;
export async function getClientPrivacy(userId: string, tx: Database = db): Promise<OfficePrivacy> {
  let row = await tx.clientPrivacyState.findUnique({ where: { userId } });
  if (!row) {
    const old = await tx.conciergeSession.findUnique({
      where: { userId },
      select: { snapshot: true },
    });
    const parsed = old ? conciergeReplaySchema.safeParse(old.snapshot) : null;
    if (parsed && !parsed.success) throw new HttpError(409, 'privacy_context_invalid');
    const flags = parsed?.success
      ? parsed.data.brief.privacy
      : { doNotSave: false, doNotShare: false, doNotBook: false };
    row = await tx.clientPrivacyState.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        doNotSave: flags.doNotSave,
        doNotShare: flags.doNotShare,
        doNotBook: flags.doNotBook,
      },
    });
  }
  return officePrivacySchema.parse({
    doNotSave: row.doNotSave,
    doNotShare: row.doNotShare,
    doNotBook: row.doNotBook,
    version: row.version,
    updatedAt: row.updatedAt.toISOString(),
  });
}
async function invalidateDrafts(userId: string, tx: Database) {
  await tx.conciergeSession.updateMany({ where: { userId }, data: { version: { increment: 1 } } });
  await tx.conciergeProposal.deleteMany({ where: { session: { userId }, status: 'PENDING' } });
}
/** Policy metadata only: no prompt/history is persisted by restrictive preflight. */
export async function restrictClientPrivacy(userId: string, restrictions: Partial<Flags>) {
  return db.$transaction(
    async (tx) => {
      const current = await getClientPrivacy(userId, tx);
      const changed = keys.filter((key) => restrictions[key] === true && !current[key]);
      if (!changed.length) return current;
      const update = Object.fromEntries(changed.map((key) => [key, true]));
      const row = await tx.clientPrivacyState.updateMany({
        where: { userId, version: current.version },
        data: { ...update, version: { increment: 1 } },
      });
      if (!row.count) throw new HttpError(409, 'stale_version');
      await invalidateDrafts(userId, tx);
      return getClientPrivacy(userId, tx);
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
/** Explicit versioned settings are the only path that may relax durable flags. */
export async function replaceClientPrivacy(userId: string, value: unknown) {
  const input = privacySettingsInputSchema.parse(value);
  return db.$transaction(
    async (tx) => {
      await getClientPrivacy(userId, tx);
      const changed = await tx.clientPrivacyState.updateMany({
        where: { userId, version: input.version },
        data: {
          doNotSave: input.doNotSave,
          doNotShare: input.doNotShare,
          doNotBook: input.doNotBook,
          version: { increment: 1 },
        },
      });
      if (!changed.count) throw new HttpError(409, 'stale_version');
      const session = await tx.conciergeSession.findUnique({ where: { userId } });
      if (session) {
        const snapshot = conciergeReplaySchema.parse(session.snapshot);
        snapshot.brief = {
          ...snapshot.brief,
          revision: snapshot.brief.revision + 1,
          privacy: {
            ...snapshot.brief.privacy,
            doNotSave: input.doNotSave,
            doNotShare: input.doNotShare,
            doNotBook: input.doNotBook,
          },
        };
        await tx.conciergeSession.update({
          where: { id: session.id },
          data: { snapshot: JSON.parse(JSON.stringify(snapshot)), version: { increment: 1 } },
        });
        await tx.conciergeProposal.deleteMany({
          where: { sessionId: session.id, status: 'PENDING' },
        });
      }
      return getClientPrivacy(userId, tx);
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
export type OfficePrivacyAction =
  'save' | 'viewing' | 'enquiry' | 'message' | 'share' | 'dossier' | 'delete';
export function officePrivacyBlocks(policy: Flags, action: OfficePrivacyAction) {
  if (action === 'dossier' || action === 'delete') return false;
  if (policy.doNotSave && action !== 'share') return true;
  if (policy.doNotShare && ['viewing', 'enquiry', 'message', 'share'].includes(action)) return true;
  return policy.doNotBook && action === 'viewing';
}
export async function assertOfficePrivacy(
  userId: string,
  action: OfficePrivacyAction,
  tx: Database = db,
) {
  const policy = await getClientPrivacy(userId, tx);
  if (officePrivacyBlocks(policy, action)) throw new HttpError(409, 'privacy_restricted');
  return policy;
}
