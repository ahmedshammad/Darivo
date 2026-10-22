import { Prisma } from '@prisma/client';
import { db } from './client';
import { freshnessRange } from '../../lib/reference-data';

const facts = { include: { sources: true }, orderBy: { key: 'asc' as const } };
const projectInclude = { facts, developer: { include: { facts } } } satisfies Prisma.ProjectInclude;
type Fact = Prisma.ReferenceFactGetPayload<{ include: { sources: true } }>;
function serializeFact(fact: Fact) {
  return {
    ...fact,
    sources: fact.sources.map((source) => ({
      ...source,
      retrievedAt: source.retrievedAt?.toISOString() ?? null,
    })),
  };
}
function serializeProject(project: Prisma.ProjectGetPayload<{ include: typeof projectInclude }>) {
  return {
    ...project,
    priceFromAmount: project.priceFromAmount?.toString() ?? null,
    facts: project.facts.map(serializeFact),
    developer: { ...project.developer, facts: project.developer.facts.map(serializeFact) },
    availability: 'ON_REQUEST' as const,
    indicative: true,
    priceDisplayKind: ['LISTING', 'AGENT_LISTING'].includes(project.priceBasis)
      ? ('RECENT_LISTING' as const)
      : ('PUBLIC_REPORT' as const),
    freshness: freshnessRange(project.asOf, new Date()),
  };
}

/** Public reference records only. This module never queries or returns unit inventory. */
export async function listReferenceProjects(country?: 'UAE' | 'Egypt') {
  const projects = await db.project.findMany({
    where: { kind: 'REAL_REFERENCE', ...(country ? { country } : {}) },
    include: projectInclude,
    orderBy: { nameEn: 'asc' },
  });
  return projects.map(serializeProject);
}
export async function getReferenceProject(id: string) {
  if (!id || id.length > 150) return null;
  const project = await db.project.findFirst({
    where: { id, kind: 'REAL_REFERENCE' },
    include: projectInclude,
  });
  return project ? serializeProject(project) : null;
}
export async function listReferenceDevelopers() {
  const developers = await db.developer.findMany({
    where: { kind: 'REAL_REFERENCE' },
    include: {
      facts,
      projects: {
        where: { kind: 'REAL_REFERENCE' },
        select: { id: true, slug: true, nameEn: true },
      },
    },
    orderBy: { nameEn: 'asc' },
  });
  return developers.map((developer) => ({
    ...developer,
    facts: developer.facts.map(serializeFact),
  }));
}
export async function listMarketPulse() {
  const stats = await db.marketStat.findMany({ include: { facts }, orderBy: { id: 'asc' } });
  return stats.map((stat) => ({
    ...stat,
    facts: stat.facts.map(serializeFact),
    freshness: freshnessRange(stat.asOf, new Date()),
  }));
}
