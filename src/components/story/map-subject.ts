import type { AtlasProject } from '@/src/lib/atlas';
import type { StoryDTO } from '@/src/lib/story';
/** The unit Story must not inherit a collection's minimum price or different unit's label. */
export function exactStoryMapSubject(story: StoryDTO): AtlasProject {
  const price = story.price;
  const priceFact = story.facts.find((fact) => fact.id === price?.factId);
  return {
    id: story.entity.id,
    slug: story.storySlug,
    kind: story.kind === 'REAL_REFERENCE_PROJECT' ? 'REAL_REFERENCE' : 'DEMO',
    nameEn: story.name.en,
    nameAr: story.name.ar,
    country: story.country,
    city: story.city.en,
    community: story.community.en,
    developerId: story.developer.id,
    developerName: story.developer.name.en,
    center: story.center,
    approximate: story.coordinatesApproximate,
    amount: price?.native.amount ?? null,
    currency: price?.native.currency ?? (story.country === 'Egypt' ? 'EGP' : 'AED'),
    basis:
      story.kind === 'REAL_REFERENCE_PROJECT'
        ? (story.sources.find((source) => priceFact?.sourceIds.includes(source.id))?.basis ??
          'UNKNOWN')
        : 'DEMO_ESTIMATE',
    priceNote: price?.qualifier?.en ?? null,
    asOf: priceFact?.asOf.value ?? null,
    completion: null,
    sources: story.sources.flatMap((source) =>
      source.kind === 'published'
        ? [
            {
              url: source.url,
              publisher: source.publisher,
              basis: source.basis,
              asOf: source.asOf.value,
            },
          ]
        : [],
    ),
    unitId: story.kind === 'DEMO_UNIT' ? story.unitId : null,
    match: 0,
  };
}
