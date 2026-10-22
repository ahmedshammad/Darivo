import type { ReferenceDataset } from '../src/lib/reference-data';
import { AREAS } from '../src/lib/catalog';

export const DEMO_UNIT_COUNT = 250;
export function demoVisibility(index: number) {
  return index % 20 === 19
    ? ('PRIVATE_INVITE' as const)
    : index % 20 >= 16 || index >= 248
      ? ('VERIFIED_ONLY' as const)
      : ('PUBLIC' as const);
}
export function demoProjectId(areaId: string) {
  return `demo-project-${areaId}`;
}

/** Fictional ranges, anchored to supplied public reference prices, never a valuation of a real community. */
export function demoPrice(
  index: number,
  area: (typeof AREAS)[number],
  type: string,
  dataset: ReferenceDataset,
) {
  const referenceId =
    area[0] === 'palm-jumeirah' || area[0] === 'jumeirah-bay'
      ? 'orla-palm-jumeirah'
      : area[1] === 'Abu Dhabi'
        ? type === 'apartment'
          ? 'sei-saadiyat'
          : 'saadiyat-lagoons'
        : area[0] === 'north-coast'
          ? type === 'mansion'
            ? 'southmed'
            : 'june-sodic'
          : area[7] === 'EG'
            ? 'marassi-red-sea'
            : 'palm-central-private-residences';
  const reference = dataset.projects.find((item) => item.id === referenceId)!;
  const anchor = reference.price_from!.amount;
  const ratio = 0.75 + (index % 11) * 0.065;
  const typeFactor = type === 'mansion' ? 1.9 : type === 'villa' ? 1.45 : type === 'plot' ? 0.7 : 1;
  const marketFactor = area[7] === 'EG' && area[0] !== 'north-coast' ? 0.7 : 1;
  // Preserve the stable bilingual acceptance villa from the original prototype.
  const amount =
    index === 1
      ? 8_800_000
      : Math.round((anchor * ratio * typeFactor * marketFactor) / 10_000) * 10_000;
  return {
    amount,
    currency: area[7] === 'AE' ? 'AED' : 'EGP',
    referenceId,
    disclosure:
      'Demo estimate; type/size-adjusted range using a supplied country reference, not a real community valuation.',
  };
}
