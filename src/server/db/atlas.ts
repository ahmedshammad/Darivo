import { db } from './client';
import { currentViewer, visibilityWhere, type Viewer } from './properties';
import type { AtlasData, AtlasSource } from '@/src/lib/atlas';
import { localizeAtlasStat } from '@/messages/atlas-stats';

type FactSources = {
  asOf: string | null;
  sources: { url: string; publisher: string; basis: string }[];
}[];
function sourceList(facts: FactSources): AtlasSource[] {
  const sources = new Map<string, AtlasSource>();
  for (const fact of facts)
    for (const source of fact.sources) {
      const key = `${source.url}|${source.basis}|${fact.asOf}`;
      sources.set(key, { ...source, asOf: fact.asOf });
    }
  return [...sources.values()];
}

/** The map receives scoped summary records, never raw references or hidden-unit aggregates. */
export async function getAtlasData(viewer: Viewer = null): Promise<AtlasData> {
  const current = await currentViewer(viewer);
  const [projects, pois, stats, developers] = await Promise.all([
    db.project.findMany({
      include: {
        developer: { select: { id: true, nameEn: true } },
        facts: { include: { sources: true } },
        units: {
          where: visibilityWhere(current),
          orderBy: [{ priceAed: 'asc' }, { id: 'asc' }],
          take: 1,
          select: {
            id: true,
            priceMinor: true,
            priceAed: true,
            areaSqm: true,
            currency: true,
            visibility: true,
            handoverDate: true,
            status: true,
          },
        },
      },
      orderBy: [{ kind: 'desc' }, { nameEn: 'asc' }],
    }),
    db.demoPOI.findMany({ where: { isDemo: true }, orderBy: { id: 'asc' } }),
    db.marketStat.findMany({
      include: { facts: { include: { sources: true } } },
      orderBy: { id: 'asc' },
    }),
    db.developer.findMany({
      where: { kind: 'REAL_REFERENCE' },
      include: { projects: { where: { kind: 'REAL_REFERENCE' }, select: { id: true } } },
      orderBy: { nameEn: 'asc' },
    }),
  ]);
  const visible = projects.filter((p) => p.kind === 'REAL_REFERENCE' || p.units.length > 0);
  const privateUnits = visible.flatMap((p) =>
    p.kind === 'DEMO' && p.units[0]?.visibility !== 'PUBLIC' ? p.units : [],
  );
  if (current && privateUnits.length)
    await db.auditLog.createMany({
      data: privateUnits.map((unit) => ({
        actorId: current.id,
        action: 'PRIVATE_PROPERTY_READ',
        targetId: unit.id,
      })),
    });
  return {
    projects: visible.map((project) => {
      const demo = project.kind === 'DEMO';
      const unit = demo ? project.units[0] : undefined;
      return {
        id: project.id,
        slug: project.slug,
        kind: project.kind,
        nameEn: project.nameEn,
        nameAr: project.nameAr || project.nameEn,
        country: project.country,
        city: project.city,
        community: project.communityName,
        developerId: project.developerId,
        developerName: project.developer.nameEn,
        center: [project.lng, project.lat],
        approximate: project.coordinatesApproximate,
        amount: demo
          ? Number(unit!.priceMinor) / 100
          : project.priceFromAmount === null
            ? null
            : Number(project.priceFromAmount),
        currency: demo ? unit!.currency : project.priceFromCurrency || 'AED',
        basis: demo ? 'DEMO_ESTIMATE' : project.priceBasis,
        priceNote: demo ? null : project.priceNote,
        priceLabel: demo ? null : project.priceFromLabel,
        confidence: project.confidence,
        asOf: project.asOf,
        completion: demo
          ? unit?.status === 'ready'
            ? 'ready'
            : unit?.handoverDate?.toISOString().slice(0, 10) || null
          : project.completion,
        sources: demo ? [] : sourceList(project.facts),
        unitId: unit?.id || null,
        match: 0.5,
        ...(unit && unit.areaSqm > 0 ? { demoPricePerSqmAED: unit.priceAed / unit.areaSqm } : {}),
      };
    }),
    pois: pois.map((poi) => ({
      id: poi.id,
      nameEn: poi.nameEn,
      nameAr: poi.nameAr,
      kind: poi.kind,
      center: [poi.lng, poi.lat],
      demo: true,
    })),
    stats: stats.map((stat) => ({
      ...localizeAtlasStat(stat.metric, stat.value),
      id: stat.id,
      market: stat.market,
      metric: stat.metric,
      value: stat.value,
      detail: stat.detail,
      asOf: stat.asOf,
      sources: sourceList(stat.facts),
    })),
    developers: developers.map((dev) => ({
      id: dev.id,
      nameEn: dev.nameEn,
      nameAr: dev.nameAr,
      projectIds: dev.projects.map((p) => p.id),
    })),
  };
}
