import { describe, expect, it } from 'vitest';
import { emptyConciergeBrief, type GroundedCard } from '@/src/lib/concierge';
import { applyConciergeBriefPatch } from '@/src/server/concierge/brief';
import {
  constraintEvidence,
  constraintKindFromText,
  createFact,
} from '@/src/server/concierge/grounding';
import { matchesCardConstraints } from '@/src/server/concierge/tools';

const cardWith = (feature: string) =>
  ({
    facts: [
      createFact({ kind: 'unit', id: 'fixture' }, 'amenities', feature, ['fixture:demo'], 'DEMO'),
    ],
  }) as GroundedCard;
const pool = cardWith('private_pool');
const beach = cardWith('beachfront');

describe('Editable constraint meaning is independent of identity', () => {
  it.each(['beachfront', 'عَلَى البَحر'])(
    'changes private pool to %s with the same row ID and new revision',
    (text) => {
      const brief = emptyConciergeBrief();
      brief.mustHaves = [
        {
          id: 'private-pool',
          text: 'private pool',
          marketIds: [],
          category: 'amenity',
          verificationRequired: true,
        },
      ];
      expect(matchesCardConstraints(pool, [], brief)).toBe(true);
      expect(matchesCardConstraints(beach, [], brief)).toBe(false);
      const edited = applyConciergeBriefPatch(
        brief,
        {
          baseRevision: brief.revision,
          operations: [
            { op: 'constraint.upsert', list: 'mustHaves', value: { ...brief.mustHaves[0], text } },
          ],
        },
        'user',
      );
      expect(edited.mustHaves[0].id).toBe('private-pool');
      expect(edited.revision).toBe(brief.revision + 1);
      expect(matchesCardConstraints(pool, [], edited)).toBe(false);
      expect(matchesCardConstraints(beach, [], edited)).toBe(true);
      expect(constraintEvidence(beach, edited.mustHaves[0]).facts[0].value).toBe('beachfront');
    },
  );
  it('changes exclusion semantics from current text without reusing the old pool meaning', () => {
    const brief = emptyConciergeBrief();
    brief.exclusions = [
      {
        id: 'private-pool',
        text: 'private pool',
        marketIds: [],
        category: 'amenity',
        verificationRequired: false,
      },
    ];
    expect(matchesCardConstraints(pool, [], brief)).toBe(false);
    expect(matchesCardConstraints(beach, [], brief)).toBe(true);
    const edited = applyConciergeBriefPatch(
      brief,
      {
        baseRevision: 0,
        operations: [
          {
            op: 'constraint.upsert',
            list: 'exclusions',
            value: { ...brief.exclusions[0], text: 'beachfront' },
          },
        ],
      },
      'user',
    );
    expect(matchesCardConstraints(pool, [], edited)).toBe(true);
    expect(matchesCardConstraints(beach, [], edited)).toBe(false);
  });
  it.each(['mustHaves', 'exclusions'] as const)(
    'fails closed for unsupported required %s instead of falling back to its old ID',
    (list) => {
      const brief = emptyConciergeBrief();
      brief[list] = [
        {
          id: 'private-pool',
          text: 'quiet music room',
          marketIds: [],
          category: 'amenity',
          verificationRequired: true,
        },
      ];
      expect(constraintEvidence(pool, brief[list][0])).toEqual({ value: null, facts: [] });
      expect(matchesCardConstraints(pool, [], brief)).toBe(false);
      brief[list][0].verificationRequired = false;
      expect(matchesCardConstraints(pool, [], brief)).toBe(true);
    },
  );
  it('normalizes supported English/Arabic wording but leaves negation or compounds unknown', () => {
    expect(constraintKindFromText(' HIGH–RISE ')).toBe('high-rise');
    expect(constraintKindFromText('شَقَّة')).toBe('property-apartment');
    expect(constraintKindFromText('مَسْبَح خاص')).toBe('private-pool');
    expect(constraintKindFromText('not a private pool')).toBeNull();
    expect(constraintKindFromText('private pool or beachfront')).toBeNull();
  });
});
