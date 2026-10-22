import { Prisma } from '@prisma/client';
import { db } from '@/src/server/db/client';
import { visibilityWhere } from '@/src/server/db/properties';
import { HttpError } from '@/src/server/errors';
import {
  conciergeReplaySchema,
  writeConfirmationSchema,
  writeProposalSchema,
} from '@/src/lib/concierge';

/** The proposal claim and the requested write commit together, exactly once. */
export async function confirmConciergeProposal(userId: string, value: unknown) {
  const input = writeConfirmationSchema.parse(value);
  return db.$transaction(
    async (tx) => {
      const record = await tx.conciergeProposal.findFirst({
        where: { id: input.proposalId, session: { userId } },
        include: { session: true },
      });
      if (!record) throw new HttpError(404, 'not_found');
      if (record.status === 'CONFIRMED') return { status: record.status, result: record.result };
      if (record.status === 'REJECTED') return { status: record.status };
      if (record.expiresAt.getTime() <= Date.now()) throw new HttpError(409, 'proposal_expired');
      const locked = await tx.conciergeSession.updateMany({
        where: { id: record.sessionId, userId, version: record.session.version },
        data: { version: { increment: 1 } },
      });
      if (!locked.count) throw new HttpError(409, 'context_changed');
      const claimed = await tx.conciergeProposal.updateMany({
        where: { id: record.id, status: 'PENDING' },
        data: { status: input.decision === 'reject' ? 'REJECTED' : 'CONFIRMED' },
      });
      if (!claimed.count) throw new HttpError(409, 'proposal_changed');
      if (input.decision === 'reject') return { status: 'REJECTED' };
      const proposal = writeProposalSchema.parse(record.data);
      const { privacy } = conciergeReplaySchema.parse(record.session.snapshot).brief;
      if (
        privacy.doNotSave ||
        (privacy.doNotShare && proposal.kind !== 'save_to_portfolio') ||
        (privacy.doNotBook && proposal.kind === 'request_viewing')
      )
        throw new HttpError(409, 'privacy_restricted');
      const viewer = await tx.user.findUnique({ where: { id: userId } });
      if (!viewer) throw new HttpError(401, 'unauthorized');
      let result: Prisma.InputJsonObject;
      if (proposal.kind === 'handoff_to_advisor') {
        const handoff = await tx.handoff.create({
          data: { userId, reason: proposal.details.reason },
        });
        result = { handoffId: handoff.id };
      } else {
        const entities = proposal.details.entities;
        if (!entities.length || entities.some((entity) => entity.kind !== 'unit'))
          throw new HttpError(400, 'unit_required');
        const ids = [...new Set(entities.map((entity) => entity.id))];
        if (
          JSON.stringify([...proposal.entities.map((entity) => entity.id)].sort()) !==
          JSON.stringify([...ids].sort())
        )
          throw new HttpError(400, 'proposal_mismatch');
        const properties = await tx.property.findMany({
          where: { AND: [{ id: { in: ids } }, visibilityWhere(viewer)] },
          select: { id: true },
        });
        if (properties.length !== ids.length) throw new HttpError(404, 'not_found');
        if (proposal.kind === 'save_to_portfolio') {
          const shortlist = await tx.shortlist.upsert({
            where: { userId_name: { userId, name: proposal.details.name } },
            update: {},
            create: { userId, name: proposal.details.name },
          });
          await tx.shortlistItem.createMany({
            data: ids.map((propertyId) => ({ propertyId, shortlistId: shortlist.id })),
            skipDuplicates: true,
          });
          result = { shortlistId: shortlist.id };
        } else {
          const slots = proposal.details.preferredSlots.map((slot) => new Date(slot));
          if (
            ids.length !== 1 ||
            !slots.length ||
            slots.some(
              (slot) =>
                slot.getTime() <= Date.now() || slot.getTime() > Date.now() + 366 * 86400000,
            )
          )
            throw new HttpError(400, 'invalid_slots');
          const viewing = await tx.viewingRequest.create({
            data: {
              userId,
              propertyId: ids[0],
              slots,
              timezone: proposal.details.timezone,
              mode: proposal.details.modeOfViewing,
            },
          });
          result = { viewingId: viewing.id };
        }
      }
      await tx.conciergeProposal.update({ where: { id: record.id }, data: { result } });
      return { status: 'CONFIRMED', result };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
