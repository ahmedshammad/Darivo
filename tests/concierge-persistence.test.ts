import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { db } from '../src/server/db/client';
import {
  deleteConciergeHistory,
  loadConciergeSession,
  persistConciergeTurn,
  reserveConciergeTurn,
  updateConciergeMemory,
} from '../src/server/concierge/persistence';
import { confirmConciergeProposal } from '../src/server/concierge/confirm';
import type { WriteProposal } from '../src/lib/concierge';

afterAll(() => db.$disconnect());
async function fixture(run: (userId: string) => Promise<void>) {
  const id = `concierge-test-${randomUUID()}`;
  await db.user.create({ data: { id, email: `${id}@darivo.example` } });
  try {
    await run(id);
  } finally {
    await db.user.delete({ where: { id } });
  }
}
describe('Concierge persistence and explicit writes', () => {
  it('rechecks a revoked grant before confirming a saved draft', () =>
    fixture(async (userId) => {
      const { snapshot } = await loadConciergeSession(userId);
      const lease = await reserveConciergeTurn(
        userId,
        snapshot.conversationId,
        randomUUID(),
        snapshot.brief,
      );
      const property = await db.property.findFirstOrThrow({
        where: { visibility: 'PRIVATE_INVITE' },
      });
      await db.offMarketGrant.create({
        data: { userId, propertyId: property.id, grantedBy: 'demo-admin' },
      });
      const entities = [{ kind: 'unit' as const, id: property.id }];
      const proposal: WriteProposal = {
        id: randomUUID(),
        turnId: randomUUID(),
        kind: 'save_to_portfolio',
        summary: { en: 'Save the reviewed unit', ar: 'حفظ الوحدة التي راجعتها' },
        entities,
        details: { entities, mode: 'propose', name: 'Private review' },
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      };
      await persistConciergeTurn({ userId, ...lease, proposals: [proposal] });
      await db.offMarketGrant.deleteMany({ where: { userId } });
      await expect(
        confirmConciergeProposal(userId, {
          proposalId: proposal.id,
          requestId: randomUUID(),
          decision: 'confirm',
        }),
      ).rejects.toThrow('not_found');
      expect(await db.shortlist.count({ where: { userId } })).toBe(0);
      expect(
        (await db.conciergeProposal.findUniqueOrThrow({ where: { id: proposal.id } })).status,
      ).toBe('PENDING');
    }));
  it('revokes stored taste memory even when the current conversation is not saved', () =>
    fixture(async (userId) => {
      const { snapshot } = await loadConciergeSession(userId);
      const lease = await reserveConciergeTurn(
        userId,
        snapshot.conversationId,
        randomUUID(),
        snapshot.brief,
      );
      await updateConciergeMemory({
        userId,
        ...lease,
        memory: {
          consent: 'granted',
          consentedAt: new Date().toISOString(),
          items: [
            {
              id: 'taste',
              text: 'I prefer low-rise buildings',
              recordedAt: new Date().toISOString(),
            },
          ],
        },
      });
      expect((await loadConciergeSession(userId)).snapshot.brief.tasteMemory.items).toHaveLength(1);
      await updateConciergeMemory({
        userId,
        ...lease,
        memory: { consent: 'revoked', consentedAt: null, items: [] },
      });
      lease.snapshot.brief.privacy.doNotSave = true;
      expect(await persistConciergeTurn({ userId, ...lease, proposals: [] })).toBe(false);
      expect((await loadConciergeSession(userId)).snapshot.brief.tasteMemory.items).toHaveLength(0);
    }));
  it('cannot resurrect history after deletion while a turn is running', () =>
    fixture(async (userId) => {
      const { snapshot } = await loadConciergeSession(userId);
      const lease = await reserveConciergeTurn(
        userId,
        snapshot.conversationId,
        randomUUID(),
        snapshot.brief,
      );
      await deleteConciergeHistory(userId);
      expect(await persistConciergeTurn({ userId, ...lease, proposals: [] })).toBe(false);
      expect(await db.conciergeSession.count({ where: { userId } })).toBe(0);
    }));
  it('rejects stale generation writes and retains no private turn', () =>
    fixture(async (userId) => {
      const { snapshot } = await loadConciergeSession(userId);
      const old = await reserveConciergeTurn(
        userId,
        snapshot.conversationId,
        randomUUID(),
        snapshot.brief,
      );
      const latest = await reserveConciergeTurn(
        userId,
        snapshot.conversationId,
        randomUUID(),
        snapshot.brief,
      );
      expect(await persistConciergeTurn({ userId, ...old, proposals: [] })).toBe(false);
      latest.snapshot.brief.privacy.doNotSave = true;
      latest.snapshot.brief.rawRequest = 'Private words never stored';
      expect(await persistConciergeTurn({ userId, ...latest, proposals: [] })).toBe(false);
      expect(JSON.stringify((await loadConciergeSession(userId)).row.snapshot)).not.toContain(
        'Private words',
      );
    }));
  it('confirms an advisor draft once and prevents another user from reading it', () =>
    fixture(async (userId) => {
      const { snapshot } = await loadConciergeSession(userId);
      const lease = await reserveConciergeTurn(
        userId,
        snapshot.conversationId,
        randomUUID(),
        snapshot.brief,
      );
      const proposal: WriteProposal = {
        id: randomUUID(),
        turnId: randomUUID(),
        kind: 'handoff_to_advisor',
        summary: { en: 'Ask an advisor to contact me', ar: 'أطلب تواصل المستشار' },
        entities: [],
        expiresAt: new Date(Date.now() + 60000).toISOString(),
        details: { mode: 'propose', reason: 'Client requested an introduction.' },
      };
      await persistConciergeTurn({ userId, ...lease, proposals: [proposal] });
      expect(await db.handoff.count({ where: { userId } })).toBe(0);
      await expect(
        confirmConciergeProposal('other-user', {
          proposalId: proposal.id,
          requestId: randomUUID(),
          decision: 'confirm',
        }),
      ).rejects.toThrow('not_found');
      const confirmation = {
        proposalId: proposal.id,
        requestId: randomUUID(),
        decision: 'confirm',
      };
      const first = await confirmConciergeProposal(userId, confirmation);
      expect(await confirmConciergeProposal(userId, confirmation)).toEqual(first);
      expect(await db.handoff.count({ where: { userId } })).toBe(1);
    }));
  it('invalidates pending proposals when a new privacy context begins', () =>
    fixture(async (userId) => {
      const { snapshot } = await loadConciergeSession(userId);
      const lease = await reserveConciergeTurn(
        userId,
        snapshot.conversationId,
        randomUUID(),
        snapshot.brief,
      );
      const proposal: WriteProposal = {
        id: randomUUID(),
        turnId: randomUUID(),
        kind: 'handoff_to_advisor',
        summary: { en: 'Advisor', ar: 'مستشار' },
        entities: [],
        expiresAt: new Date(Date.now() + 60000).toISOString(),
        details: { mode: 'propose', reason: 'Review' },
      };
      await persistConciergeTurn({ userId, ...lease, proposals: [proposal] });
      await reserveConciergeTurn(userId, snapshot.conversationId, randomUUID(), snapshot.brief);
      await expect(
        confirmConciergeProposal(userId, {
          proposalId: proposal.id,
          requestId: randomUUID(),
          decision: 'confirm',
        }),
      ).rejects.toThrow('not_found');
      expect(await db.handoff.count({ where: { userId } })).toBe(0);
    }));
});
