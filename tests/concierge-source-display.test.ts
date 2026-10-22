import { describe, expect, it } from 'vitest';
import { createFact } from '@/src/server/concierge/grounding';

const exactMappings = [
  ['community', 'Saadiyat Island', 'جزيرة السعديات'],
  ['type.0', 'Masterplanned district incl. luxury villas', 'منطقة ذات مخطط شامل تضم فللاً فاخرة'],
  ['type.0', 'Beachfront apartments (1–5 bed)', 'شقق على الشاطئ من غرفة إلى خمس غرف نوم'],
  ['type.0', 'Apartments (studio–3 bed)', 'شقق من استوديو إلى ثلاث غرف نوم'],
  ['type.0', 'Beach apartments', 'شقق شاطئية'],
  ['type.0', 'Sky Palace', 'سكاي بالاس'],
  ['type.0', 'Lodges', 'وحدات لودج'],
] as const;

describe('Faithful Arabic source display', () => {
  it.each(exactMappings)(
    'preserves evidence while displaying %s / %s in Arabic',
    (key, value, ar) => {
      const sourceIds = ['published:fixture'];
      const asOf = { value: '2026-07-23', precision: 'DAY' as const };
      const entity = { kind: 'project' as const, id: 'fixture' };
      const fact = createFact(entity, key, value, sourceIds, 'REAL_REFERENCE', asOf);
      expect(fact.displayValue).toEqual({ en: value, ar });
      expect(fact.value).toBe(value);
      expect(fact.originalText).toBe(value);
      expect(fact.sourceIds).toEqual(sourceIds);
      expect(fact.entity).toEqual(entity);
      expect(fact.asOf).toEqual(asOf);
      expect(fact.provenance).toBe('REAL_REFERENCE');
    },
  );

  it('does not extend an exact translation to a different source claim', () => {
    const value = 'Masterplanned district incl. luxury villas and a verified private beach';
    const fact = createFact(
      { kind: 'project', id: 'fixture' },
      'type.0',
      value,
      ['source'],
      'REAL_REFERENCE',
    );
    expect(fact.displayValue).toBeUndefined();
    expect(fact.value).toBe(value);
    expect(fact.originalText).toBe(value);
  });
});
