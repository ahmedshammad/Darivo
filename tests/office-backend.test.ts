import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { consult, saveTurn } from '../src/server/ai/consultant';
import { db } from '../src/server/db/client';
import { resolveOfficeEntity, resolveStory } from '../src/server/db/story';
import {
  createPortfolio,
  changePortfolioItems,
  getPortfolio,
  getDossierData,
  deletePortfolio,
  compareOfficeEntities,
  sendThreadMessage,
  readThread,
  requestUnitViewing,
  requestProjectEnquiry,
  cancelProjectEnquiry,
  cancelViewing,
} from '../src/server/db/office';
import {
  getClientPrivacy,
  restrictClientPrivacy,
  replaceClientPrivacy,
  officePrivacyBlocks,
} from '../src/server/office/privacy';
import { executeTool } from '../src/server/ai/tools';
import {
  loadConciergeSession,
  reserveConciergeTurn,
  persistConciergeTurn,
  deleteConciergeHistory,
} from '../src/server/concierge/persistence';
import { confirmConciergeProposal } from '../src/server/concierge/confirm';
import type { WriteProposal } from '../src/lib/concierge';

afterAll(() => db.$disconnect());
const req = () => randomUUID();
async function fixture(run: (user: Awaited<ReturnType<typeof db.user.create>>) => Promise<void>) {
  const id = `office-test-${req()}`;
  const user = await db.user.create({
    data: { id, email: `${id}@darivo.example`, role: 'CLIENT' },
  });
  try {
    await run(user);
  } finally {
    await db.user.delete({ where: { id } });
  }
}
async function assignment(clientId: string) {
  const advisor = await db.advisor.upsert({
    where: { userId: 'demo-advisor' },
    update: {},
    create: { userId: 'demo-advisor' },
  });
  return db.advisorAssignment.create({
    data: { clientId, advisorId: advisor.id, thread: { create: {} } },
    include: { thread: true },
  });
}

describe('Stage 4 authorized stories and mixed office workflows', () => {
  it('legacy chat cannot use an external planner or persist a turn under durable restrictions', () =>
    fixture(async (user) => {
      await restrictClientPrivacy(user.id, { doNotShare: true, doNotSave: true });
      const external = {
        plan: vi.fn(async () => {
          throw new Error('external_provider_must_not_run');
        }),
      };
      const reply = await consult('Explain Dubai', user, 'en', { filters: {} }, external);
      expect(external.plan).not.toHaveBeenCalled();
      expect(await saveTurn(user.id, 'Private question', reply)).toBe(false);
      expect(await db.consultantConversation.count({ where: { userId: user.id } })).toBe(0);
      expect(await db.clientBrief.count({ where: { userId: user.id } })).toBe(0);
    }));

  it('projects every public project through the strict DTO without exposing raw records', () =>
    fixture(async (user) => {
      const projects = await db.project.findMany({ select: { slug: true, kind: true } });
      for (const project of projects) {
        const story = await resolveStory(`project-${project.slug}`, user);
        expect(story, project.slug).not.toBeNull();
        expect(JSON.stringify(story)).not.toContain('rawReference');
        if (project.kind === 'DEMO') {
          expect(story!.capabilities.find((c) => c.action === 'ADD_TO_PORTFOLIO')?.allowed).toBe(
            false,
          );
          expect(story!.residences?.length).toBeGreaterThan(0);
        } else {
          expect(story!.availability).toBe('ON_REQUEST');
          for (const source of story!.sources)
            expect(source.retrieved).toEqual({ value: null, precision: 'UNKNOWN' });
        }
      }
    }));
  it('rolls back a mixed authorized/forbidden save and keeps rejected confirmation pending', () =>
    fixture(async (user) => {
      const board = await createPortfolio({ name: 'Atomic', clientRequestId: req() }, user);
      const privateUnit = await db.property.findFirstOrThrow({
        where: { visibility: 'PRIVATE_INVITE' },
      });
      await expect(
        changePortfolioItems(
          board!.id,
          {
            version: board!.version,
            refs: [
              { kind: 'reference-project', id: 'southmed' },
              { kind: 'demo-unit', id: privateUnit.id },
            ],
            clientRequestId: req(),
          },
          user,
        ),
      ).rejects.toThrow('not_found');
      expect((await getPortfolio(board!.id, user))?.items).toHaveLength(0);
      expect((await getPortfolio(board!.id, user))?.version).toBe(board!.version);
    }));
  it('a simultaneous repeated create never duplicates the board or mutation receipt', () =>
    fixture(async (user) => {
      const input = { name: 'Concurrent', clientRequestId: req() };
      const results = await Promise.allSettled([
        createPortfolio(input, user),
        createPortfolio(input, user),
      ]);
      expect(results.some((result) => result.status === 'fulfilled')).toBe(true);
      const final = await createPortfolio(input, user);
      expect(final?.name).toBe('Concurrent');
      expect(await db.shortlist.count({ where: { userId: user.id } })).toBe(1);
      expect(
        await db.workflowMutation.count({
          where: { userId: user.id, clientRequestId: input.clientRequestId },
        }),
      ).toBe(1);
    }));

  it('keeps real references on request, derives exact unit metrics, and returns all display currencies', () =>
    fixture(async (user) => {
      const real = await resolveOfficeEntity(
        { kind: 'reference-project', id: 'orla-palm-jumeirah' },
        user,
      );
      expect(real?.kind).toBe('REAL_REFERENCE_PROJECT');
      expect(real?.availability).toBe('ON_REQUEST');
      expect(real?.residences).toBeNull();
      expect(real?.sources.length).toBeGreaterThan(0);
      expect(real?.facts.some((f) => f.key === 'price')).toBe(true);
      expect(real?.capabilities.find((c) => c.action === 'REQUEST_UNIT_VIEWING')?.allowed).toBe(
        false,
      );
      const unit = await resolveOfficeEntity({ kind: 'demo-unit', id: 'property-001' }, user);
      expect(unit?.kind).toBe('DEMO_UNIT');
      expect(
        new Set([
          unit?.price?.native.currency,
          ...unit!.price!.converted.map((c) => c.money.currency),
        ]).size,
      ).toBe(6);
      expect(unit?.timeline.status).toBe('AVAILABLE');
      if (unit?.timeline.status === 'AVAILABLE')
        expect(unit.timeline.component.subjectName).toEqual(unit.name);
      expect(unit?.metrics.some((m) => m.status === 'AVAILABLE' && m.basis === 'DEMO')).toBe(true);
      expect(JSON.stringify(real)).not.toContain('rawReference');
    }));
  it('does not expose a revoked unit through stories, portfolios, comparison or default dossier; explicit visible export remains available', () =>
    fixture(async (user) => {
      const privateUnit = await db.property.findFirstOrThrow({
        where: { visibility: 'PRIVATE_INVITE' },
      });
      await db.offMarketGrant.create({
        data: { userId: user.id, propertyId: privateUnit.id, grantedBy: 'demo-admin' },
      });
      const board = await createPortfolio({ name: 'Mixed', clientRequestId: req() }, user);
      const input = {
        version: board!.version,
        refs: [
          { kind: 'reference-project', id: 'orla-palm-jumeirah' },
          { kind: 'demo-unit', id: privateUnit.id },
        ],
        clientRequestId: req(),
      };
      const saved = await changePortfolioItems(board!.id, input, user);
      expect(saved?.items).toHaveLength(2);
      await db.offMarketGrant.deleteMany({ where: { userId: user.id } });
      expect(await resolveStory(`unit-${privateUnit.slug}`, user)).toBeNull();
      expect(await resolveStory('unit-does-not-exist', user)).toBeNull();
      const visible = await getPortfolio(board!.id, user);
      expect(visible?.items).toHaveLength(1);
      expect(JSON.stringify(visible)).not.toContain(privateUnit.id);
      await expect(
        compareOfficeEntities(input.refs as Parameters<typeof compareOfficeEntities>[0], user),
      ).rejects.toThrow('not_found');
      await expect(getDossierData(board!.id, user)).rejects.toThrow('portfolio_changed');
      const dossier = await getDossierData(board!.id, user, {}, { reviewVisible: true });
      expect(dossier?.stories).toHaveLength(1);
      await restrictClientPrivacy(user.id, { doNotSave: true, doNotShare: true });
      expect(
        (await getDossierData(board!.id, user, {}, { reviewVisible: true }))?.stories,
      ).toHaveLength(1);
      await deletePortfolio(board!.id, user);
    }));
  it('preserves ownership, version checks, request idempotency and reference-only project targets', () =>
    fixture(async (user) => {
      const input = { name: 'Stable', clientRequestId: req() };
      const board = await createPortfolio(input, user);
      expect((await createPortfolio(input, user))?.id).toBe(board?.id);
      await expect(createPortfolio({ ...input, name: 'Changed' }, user)).rejects.toThrow(
        'idempotency_conflict',
      );
      const demo = await db.project.findFirstOrThrow({ where: { kind: 'DEMO' } });
      await expect(
        changePortfolioItems(
          board!.id,
          {
            version: board!.version,
            refs: [{ kind: 'reference-project', id: demo.id }],
            clientRequestId: req(),
          },
          user,
        ),
      ).rejects.toThrow('not_found');
      const saved = await changePortfolioItems(
        board!.id,
        {
          version: board!.version,
          refs: [{ kind: 'reference-project', id: 'southmed' }],
          clientRequestId: req(),
        },
        user,
      );
      expect(saved!.version).toBeGreaterThan(board!.version);
      await expect(
        changePortfolioItems(
          board!.id,
          {
            version: board!.version,
            refs: [{ kind: 'reference-project', id: 'orla-palm-jumeirah' }],
            clientRequestId: req(),
          },
          user,
        ),
      ).rejects.toThrow('stale_version');
      await fixture(async (other) => expect(await getPortfolio(board!.id, other)).toBeNull());
      await expect(
        db.shortlistProjectItem.create({ data: { shortlistId: board!.id, projectId: demo.id } }),
      ).rejects.toThrow();
    }));
  it('retains restrictive policy through cancelled/unsaved/deleted history and blocks legacy bypass; only versioned settings clear it', () =>
    fixture(async (user) => {
      const { snapshot } = await loadConciergeSession(user.id);
      const lease = await reserveConciergeTurn(
        user.id,
        snapshot.conversationId,
        req(),
        snapshot.brief,
      );
      const policy = await restrictClientPrivacy(user.id, {
        doNotSave: true,
        doNotShare: true,
        doNotBook: true,
      });
      expect(await persistConciergeTurn({ userId: user.id, ...lease, proposals: [] })).toBe(false);
      await deleteConciergeHistory(user.id);
      expect((await getClientPrivacy(user.id)).doNotShare).toBe(true);
      await expect(
        executeTool(
          {
            name: 'save_to_shortlist',
            arguments: { property_ids: ['property-001'], shortlist_name: 'Bypass' },
          },
          user,
        ),
      ).rejects.toThrow('privacy_restricted');
      await expect(
        executeTool(
          { name: 'handoff_to_advisor', arguments: { reason: 'Please contact me' } },
          user,
        ),
      ).rejects.toThrow('privacy_restricted');
      await expect(
        createPortfolio({ name: 'Blocked', clientRequestId: req() }, user),
      ).rejects.toThrow('privacy_restricted');
      expect(officePrivacyBlocks(policy, 'dossier')).toBe(false);
      expect(officePrivacyBlocks(policy, 'delete')).toBe(false);
      const cleared = await replaceClientPrivacy(user.id, {
        version: policy.version,
        doNotSave: false,
        doNotShare: false,
        doNotBook: false,
      });
      await expect(
        replaceClientPrivacy(user.id, {
          version: policy.version,
          doNotSave: false,
          doNotShare: false,
          doNotBook: false,
        }),
      ).rejects.toThrow('stale_version');
      expect((await restrictClientPrivacy(user.id, {})).version).toBe(cleared.version);
      expect((await createPortfolio({ name: 'Allowed', clientRequestId: req() }, user))?.name).toBe(
        'Allowed',
      );
    }));
  it('uses the assigned advisor only and re-authorizes attachment visibility; no assignment grants private access', () =>
    fixture(async (user) => {
      const assigned = await assignment(user.id);
      const advisor = await db.user.findUniqueOrThrow({ where: { id: 'demo-advisor' } });
      const privateUnit = await db.property.findFirstOrThrow({
        where: { visibility: 'PRIVATE_INVITE' },
      });
      const message = {
        body: 'Exact reviewed message',
        attachments: [{ kind: 'reference-project', id: 'orla-palm-jumeirah' }],
        clientRequestId: req(),
      };
      await sendThreadMessage(assigned.thread!.id, message, user);
      await sendThreadMessage(assigned.thread!.id, message, user);
      expect((await readThread(assigned.thread!.id, advisor)).messages).toHaveLength(1);
      await expect(
        sendThreadMessage(
          assigned.thread!.id,
          {
            ...message,
            clientRequestId: req(),
            attachments: [{ kind: 'demo-unit', id: privateUnit.id }],
          },
          advisor,
        ),
      ).rejects.toThrow('not_found');
      await fixture(async (other) => {
        await expect(readThread(assigned.thread!.id, other)).rejects.toThrow('not_found');
      });
      await db.advisorAssignment.update({
        where: { id: assigned.id },
        data: { endedAt: new Date() },
      });
      await expect(readThread(assigned.thread!.id, advisor)).rejects.toThrow('not_found');
      expect((await readThread(assigned.thread!.id, user)).archived).toBe(true);
      await expect(
        sendThreadMessage(assigned.thread!.id, { ...message, clientRequestId: req() }, user),
      ).rejects.toThrow('thread_archived');
    }));
  it('keeps reference enquiries separate from unit viewing and rejects DST gaps and folds', () =>
    fixture(async (user) => {
      await assignment(user.id);
      const enquiry = await requestProjectEnquiry(
        {
          projectId: 'southmed',
          message: 'Please confirm current availability.',
          clientRequestId: req(),
        },
        user,
      );
      expect(enquiry.subject.kind).toBe('REAL_REFERENCE_PROJECT');
      expect(await db.viewingRequest.count({ where: { userId: user.id } })).toBe(0);
      await expect(
        requestUnitViewing(
          {
            unitId: 'southmed',
            localSlots: ['2027-06-01T12:00'],
            timezone: 'Asia/Dubai',
            mode: 'video',
            clientRequestId: req(),
          },
          user,
        ),
      ).rejects.toThrow('not_found');
      for (const local of ['2027-03-28T01:30', '2026-10-25T01:30'])
        await expect(
          requestUnitViewing(
            {
              unitId: 'property-001',
              localSlots: [local],
              timezone: 'Europe/London',
              mode: 'video',
              clientRequestId: req(),
            },
            user,
          ),
        ).rejects.toThrow();
      const viewing = await requestUnitViewing(
        {
          unitId: 'property-001',
          localSlots: ['2027-06-01T12:00'],
          timezone: 'Africa/Cairo',
          mode: 'video',
          clientRequestId: req(),
        },
        user,
      );
      expect(viewing.slots[0]).toBe('2027-06-01T09:00:00.000Z');
      await restrictClientPrivacy(user.id, { doNotBook: true, doNotSave: true });
      await cancelViewing(viewing.id, user);
      await cancelProjectEnquiry(enquiry.id, user);
    }));
  it('confirms reference interests and exact demo units atomically without synthetic stock', () =>
    fixture(async (user) => {
      const { snapshot } = await loadConciergeSession(user.id);
      const lease = await reserveConciergeTurn(
        user.id,
        snapshot.conversationId,
        req(),
        snapshot.brief,
      );
      const entities = [
        { kind: 'project' as const, id: 'southmed' },
        { kind: 'unit' as const, id: 'property-001' },
      ];
      const proposal: WriteProposal = {
        id: req(),
        turnId: req(),
        kind: 'save_to_portfolio',
        summary: { en: 'Review interests', ar: 'مراجعة الاهتمامات' },
        entities,
        details: { mode: 'propose', name: 'Mixed confirmed', entities },
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      };
      await persistConciergeTurn({ userId: user.id, ...lease, proposals: [proposal] });
      const result = await confirmConciergeProposal(user.id, {
        proposalId: proposal.id,
        requestId: req(),
        decision: 'confirm',
      });
      expect(result.status).toBe('CONFIRMED');
      const board = await db.shortlist.findUniqueOrThrow({
        where: { userId_name: { userId: user.id, name: 'Mixed confirmed' } },
        include: { items: true, projectItems: true },
      });
      expect(board.items.map((i) => i.propertyId)).toEqual(['property-001']);
      expect(board.projectItems.map((i) => i.projectId)).toEqual(['southmed']);
    }));
});
