import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Prisma, type PrismaClient, type SourceBasis, type SourceConfidence } from '@prisma/client';
import { datePrecision, referenceDatasetSchema, sourceBasis } from '../src/lib/reference-data';

const stableId = (...parts: string[]) =>
  createHash('sha256').update(parts.join('\0')).digest('hex').slice(0, 32);
type Owner = { developerId: string } | { projectId: string } | { marketStatId: string };

export async function loadReferenceDataset() {
  return referenceDatasetSchema.parse(
    JSON.parse(
      await readFile(
        new URL('../data/reference/darivo_reference_dataset.json', import.meta.url),
        'utf8',
      ),
    ),
  );
}

export async function seedReference(db: PrismaClient) {
  const dataset = await loadReferenceDataset();
  async function facts(
    owner: Owner,
    record: Record<string, unknown>,
    urls: string[],
    asOf: string | undefined,
    priceBasis: SourceBasis = 'UNKNOWN',
    confidence: SourceConfidence = 'UNASSESSED',
  ) {
    const ownerId = Object.values(owner)[0];
    const entries = Object.entries(record).filter(
      ([key, value]) =>
        !['id', 'source', 'sources', 'as_of', 'confidence'].includes(key) && value !== undefined,
    );
    const factIds: string[] = [];
    for (const [field, value] of entries) {
      const items =
        Array.isArray(value) && field !== 'approx_coords'
          ? value.map((item, index) => [`${field}[${index}]`, item] as const)
          : [[field, value] as const];
      for (const [key, factValue] of items) {
        const basis = field === 'price_from' ? priceBasis : 'UNKNOWN';
        const sourceIds = [];
        for (const url of urls) {
          const id = `source-${stableId(url, basis)}`;
          await db.source.upsert({
            where: { id },
            update: {},
            create: {
              id,
              url,
              publisher: new URL(url).hostname.replace(/^www\./, ''),
              basis,
              retrievedAt: null,
              retrievedDatePrecision: 'UNKNOWN',
              confidence,
            },
          });
          sourceIds.push({ id });
        }
        const id = `fact-${stableId(ownerId, key)}`;
        factIds.push(id);
        const data = {
          key,
          value: factValue === null ? Prisma.JsonNull : (factValue as Prisma.InputJsonValue),
          ...owner,
          asOf: asOf ?? null,
          asOfPrecision: datePrecision(asOf),
          basis,
          confidence,
          citationScope: 'record',
        };
        await db.referenceFact.upsert({
          where: { id },
          create: { id, ...data, sources: { connect: sourceIds } },
          update: { ...data, sources: { set: sourceIds } },
        });
      }
    }
    await db.referenceFact.deleteMany({ where: { ...owner, id: { notIn: factIds } } });
  }
  for (const item of dataset.developers) {
    const data = {
      nameEn: item.name,
      nameAr: item.name,
      descriptionEn: item.positioning,
      // Keep original supplied wording rather than inventing a translated factual claim.
      descriptionAr: item.positioning,
      country: item.country,
      knownFor: item.known_for,
      kind: item.id === 'other-uae-luxury' ? ('AGGREGATE' as const) : ('REAL_REFERENCE' as const),
      rawReference: item as Prisma.InputJsonValue,
    };
    await db.developer.upsert({
      where: { id: item.id },
      create: { id: item.id, ...data },
      update: data,
    });
    await facts({ developerId: item.id }, item, [item.source], undefined);
  }
  for (const item of dataset.projects) {
    const data = {
      slug: item.id,
      kind: 'REAL_REFERENCE' as const,
      developerId: item.developer_id,
      nameEn: item.name,
      nameAr: null,
      country: item.country,
      city: item.city,
      communityName: item.community,
      lat: item.approx_coords[0],
      lng: item.approx_coords[1],
      coordinatesApproximate: true,
      types: item.type,
      status: item.status ?? null,
      completion: item.completion ?? null,
      priceFromAmount: item.price_from?.amount ?? null,
      priceFromCurrency: item.price_from?.currency ?? null,
      priceFromLabel: item.price_from?.label ?? null,
      priceBasis: sourceBasis(item.price_from?.basis),
      priceNote: item.price_note ?? null,
      paymentPlanText: item.payment_plan ?? null,
      asOf: item.as_of ?? null,
      asOfPrecision: datePrecision(item.as_of),
      confidence: item.confidence === 'low' ? ('LOW' as const) : ('UNASSESSED' as const),
      rawReference: item as Prisma.InputJsonValue,
    };
    await db.project.upsert({
      where: { id: item.id },
      create: { id: item.id, ...data },
      update: data,
    });
    await facts(
      { projectId: item.id },
      item,
      item.sources,
      item.as_of,
      data.priceBasis,
      data.confidence,
    );
  }
  for (const item of dataset.market_pulse) {
    const id = `market-${stableId(item.market, item.metric)}`;
    const data = {
      market: item.market,
      metric: item.metric,
      value: item.value,
      detail: item.detail ?? null,
      asOf: item.as_of,
      asOfPrecision: datePrecision(item.as_of),
      rawReference: item as Prisma.InputJsonValue,
    };
    await db.marketStat.upsert({ where: { id }, create: { id, ...data }, update: data });
    await facts({ marketStatId: id }, item, [item.source], item.as_of);
  }
  return dataset;
}
