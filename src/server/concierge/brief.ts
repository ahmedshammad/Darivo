import {
  briefPatchSchema,
  conciergeBriefSchema,
  providerBriefPatchSchema,
  type BriefPatch,
  type ConciergeBrief,
  type ProviderBriefPatch,
} from '@/src/lib/concierge';

export class StaleBriefError extends Error {
  constructor() {
    super('The Brief changed. Apply this edit to its current revision.');
    this.name = 'StaleBriefError';
  }
}

/** Pure reducer. The caller must authenticate user edits; providers can only restrict consent. */
export function applyConciergeBriefPatch(
  input: ConciergeBrief,
  inputPatch: BriefPatch | ProviderBriefPatch,
  origin: 'provider' | 'user' = 'provider',
): ConciergeBrief {
  const brief = structuredClone(conciergeBriefSchema.parse(input));
  const patch = (origin === 'provider' ? providerBriefPatchSchema : briefPatchSchema).parse(
    inputPatch,
  );
  if (patch.baseRevision !== brief.revision) throw new StaleBriefError();
  for (const operation of patch.operations) {
    switch (operation.op) {
      case 'fields.set':
        Object.assign(brief, operation.value);
        break;
      case 'market.upsert': {
        const index = brief.markets.findIndex((row) => row.id === operation.value.id);
        if (index < 0) brief.markets.push(operation.value);
        else brief.markets[index] = operation.value;
        break;
      }
      case 'market.remove':
        brief.markets = brief.markets.filter((row) => row.id !== operation.id);
        for (const list of ['mustHaves', 'exclusions'] as const) {
          // A removed market's last scoped constraint must not silently become global.
          brief[list] = brief[list].flatMap((row) => {
            if (!row.marketIds.includes(operation.id)) return [row];
            const marketIds = row.marketIds.filter((id) => id !== operation.id);
            return marketIds.length ? [{ ...row, marketIds }] : [];
          });
        }
        break;
      case 'constraint.upsert': {
        const rows = brief[operation.list];
        const index = rows.findIndex((row) => row.id === operation.value.id);
        if (index < 0) rows.push(operation.value);
        else rows[index] = operation.value;
        break;
      }
      case 'constraint.remove':
        brief[operation.list] = brief[operation.list].filter((row) => row.id !== operation.id);
        break;
      case 'privacy.restrict':
        for (const flag of operation.flags) {
          if (flag === 'discreet') brief.privacy.mode = 'discreet';
          else brief.privacy[flag] = true;
        }
        break;
      case 'memory.restrict':
        brief.tasteMemory = { consent: operation.consent, consentedAt: null, items: [] };
        break;
      case 'privacy.replace':
        brief.privacy = operation.value;
        break;
      case 'memory.replace':
        brief.tasteMemory = operation.value;
        break;
    }
  }
  brief.revision += 1;
  return conciergeBriefSchema.parse(brief);
}
