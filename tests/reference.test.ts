import { afterAll, describe, expect, it } from 'vitest';
import { db } from '../src/server/db/client';
import { loadReferenceDataset } from '../prisma/seed-reference';
import {
  getReferenceProject,
  listMarketPulse,
  listReferenceDevelopers,
  listReferenceProjects,
} from '../src/server/db/reference';
import { datePrecision, freshnessRange, referenceDatasetSchema } from '../src/lib/reference-data';

afterAll(() => db.$disconnect());

describe('reference provenance and inventory separation', () => {
  it('imports every supplied record exactly without treating the aggregate as a company', async () => {
    const dataset = await loadReferenceDataset();
    expect(await db.project.count({ where: { kind: 'REAL_REFERENCE' } })).toBe(13);
    expect(await db.developer.count({ where: { kind: 'REAL_REFERENCE' } })).toBe(9);
    expect(await db.developer.count({ where: { kind: 'AGGREGATE' } })).toBe(1);
    expect(await db.marketStat.count()).toBe(3);
    for (const original of dataset.projects) {
      const stored = await db.project.findUniqueOrThrow({ where: { id: original.id } });
      expect(stored.rawReference).toEqual(original);
      expect(stored.asOf).toBe(original.as_of ?? null);
      expect(stored.asOfPrecision).toBe(datePrecision(original.as_of));
    }
    for (const original of dataset.developers) {
      expect(
        (await db.developer.findUniqueOrThrow({ where: { id: original.id } })).rawReference,
      ).toEqual(original);
    }
    expect((await listReferenceDevelopers()).map((developer) => developer.id)).not.toContain(
      'other-uae-luxury',
    );
  });

  it('keeps all 250 units under fictional projects and developers, with scoped visibility', async () => {
    expect(await db.property.count()).toBe(250);
    expect(
      await db.property.count({
        where: {
          OR: [
            { projectId: null },
            { project: { kind: { not: 'DEMO' } } },
            { developer: { kind: { not: 'DEMO' } } },
          ],
        },
      }),
    ).toBe(0);
    const counts = await db.property.groupBy({ by: ['visibility'], _count: true });
    expect(Object.fromEntries(counts.map((row) => [row.visibility, row._count]))).toEqual({
      PUBLIC: 200,
      VERIFIED_ONLY: 38,
      PRIVATE_INVITE: 12,
    });
    expect(await db.demoPOI.count()).toBeGreaterThan(40);
    expect(await db.demoPOI.count({ where: { isDemo: false } })).toBe(0);
  });

  it('blocks direct SQL attachment to real references and provenance reclassification', async () => {
    await expect(
      db.$executeRaw`UPDATE "Property" SET "developerId"='omniyat',"projectId"='orla-palm-jumeirah' WHERE id='property-002'`,
    ).rejects.toThrow();
    await expect(
      db.$executeRaw`UPDATE "Property" SET "projectId"='orla-palm-jumeirah' WHERE id='property-002'`,
    ).rejects.toThrow();
    await expect(
      db.$executeRaw`UPDATE "Developer" SET kind='REAL_REFERENCE' WHERE id='developer-1'`,
    ).rejects.toThrow();
    await expect(
      db.$executeRaw`UPDATE "Project" SET "developerId"='omniyat',kind='REAL_REFERENCE' WHERE id='demo-project-dubai-hills'`,
    ).rejects.toThrow();
    await expect(
      db.$executeRaw`UPDATE "Project" SET "developerId"='other-uae-luxury' WHERE id='orla-palm-jumeirah'`,
    ).rejects.toThrow();
    const unit = await db.property.findUniqueOrThrow({
      where: { id: 'property-002' },
      include: { project: true, developer: true },
    });
    expect(unit.project?.kind).toBe('DEMO');
    expect(unit.developer.kind).toBe('DEMO');
  });

  it('gives every imported fact a record-level citation without invented retrieval dates', async () => {
    expect(await db.referenceFact.count({ where: { sources: { none: {} } } })).toBe(0);
    expect(await db.referenceFact.count()).toBeGreaterThan(200);
    expect(await db.source.count({ where: { retrievedAt: { not: null } } })).toBe(0);
    expect(await db.source.count({ where: { retrievedDatePrecision: { not: 'UNKNOWN' } } })).toBe(
      0,
    );
    const fact = await db.referenceFact.findFirstOrThrow({
      where: { projectId: 'orla-palm-jumeirah', key: 'price_from' },
      include: { sources: true },
    });
    expect(fact.basis).toBe('AGENT_LISTING');
    expect(fact.citationScope).toBe('record');
    expect(fact.sources).toHaveLength(2);
    const unknown = await getReferenceProject('marassi-north-coast');
    expect(unknown?.asOf).toBeNull();
    expect(unknown?.confidence).toBe('LOW');
    expect(unknown?.freshness.status).toBe('unknown');
  });

  it('returns sourced reference DTOs with no unit inventory and no invented availability', async () => {
    const references = await listReferenceProjects();
    expect(references).toHaveLength(13);
    expect(
      references.every((project) => project.availability === 'ON_REQUEST' && !('units' in project)),
    ).toBe(true);
    expect(await getReferenceProject('demo-project-dubai-hills')).toBeNull();
    const orla = await getReferenceProject('orla-palm-jumeirah');
    expect(orla?.priceDisplayKind).toBe('RECENT_LISTING');
    expect(orla?.priceFromAmount).toBe('57300000');
    expect((await listMarketPulse()).every((stat) => stat.facts.length > 0)).toBe(true);
  });
});

describe('reference validation and date precision', () => {
  it('rejects impossible calendar dates while retaining valid leap days and coarse dates', async () => {
    const data = await loadReferenceDataset();
    for (const as_of of ['2026-02-31', '2026-02-29', '2026-04-31']) {
      expect(
        referenceDatasetSchema.safeParse({ ...data, projects: [{ ...data.projects[0], as_of }] })
          .success,
      ).toBe(false);
    }
    for (const as_of of ['2028-02-29', '2026-02', '2026']) {
      expect(
        referenceDatasetSchema.safeParse({ ...data, projects: [{ ...data.projects[0], as_of }] })
          .success,
      ).toBe(true);
    }
  });
  it('rejects an aggregate as a project owner and unsafe source URLs', async () => {
    const data = await loadReferenceDataset();
    expect(
      referenceDatasetSchema.safeParse({
        ...data,
        projects: [{ ...data.projects[0], developer_id: 'other-uae-luxury' }],
      }).success,
    ).toBe(false);
    expect(
      referenceDatasetSchema.safeParse({
        ...data,
        projects: [{ ...data.projects[0], sources: ['javascript:alert(1)'] }],
      }).success,
    ).toBe(false);
  });
  it('represents missing and partial dates honestly when calculating freshness', () => {
    expect(datePrecision(null)).toBe('UNKNOWN');
    expect(datePrecision('2026')).toBe('YEAR');
    expect(datePrecision('2026-06')).toBe('MONTH');
    expect(datePrecision('2026-06-15')).toBe('DAY');
    const now = new Date('2026-10-22T00:00:00Z');
    expect(freshnessRange(null, now).status).toBe('unknown');
    expect(freshnessRange('2026', now).status).toBe('uncertain');
    expect(freshnessRange('2026-06', now).status).toBe('aging');
    expect(freshnessRange('2026-01-01', now).status).toBe('stale');
  });
});
