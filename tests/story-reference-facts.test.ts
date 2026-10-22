import { describe, expect, it } from 'vitest';
import dataset from '../data/reference/darivo_reference_dataset.json';
import { storyReferenceFactsAr } from '../messages/story-reference-facts';

const sources = dataset.projects.flatMap((project) => [
  ...project.headline_facts,
  ...('price_note' in project && project.price_note ? [project.price_note] : []),
]);

// H2 is a period label, translated semantically as “the second half”, not a quantity.
const numericTokens = (text: string) =>
  (text.replace(/\bH2\b/g, '').match(/\d+(?:[,.]\d+)*/g) ?? []).sort();

describe('exact supplied Story reference display translations', () => {
  it('covers every supplied headline and price note with no invented source keys', () => {
    expect(Object.keys(storyReferenceFactsAr).sort()).toEqual([...new Set(sources)].sort());
    for (const source of sources) {
      const translated = storyReferenceFactsAr[source];
      expect(translated, source).toMatch(/[\u0600-\u06ff]/);
      expect(numericTokens(translated), source).toEqual(numericTokens(source));
      expect((translated.match(/%/g) ?? []).length, source).toBe((source.match(/%/g) ?? []).length);
    }
  });

  it('retains approximation, units, planned timing and price uncertainty', () => {
    for (const source of sources.filter((value) => /\babout\b/i.test(value)))
      expect(storyReferenceFactsAr[source], source).toContain('نحو');
    expect(storyReferenceFactsAr['First residential phase sales planned for H2 2026']).toBe(
      'من المخطط بدء مبيعات المرحلة السكنية الأولى في النصف الثاني من 2026',
    );
    const resale = storyReferenceFactsAr[sources.find((value) => value.startsWith('Resale'))!];
    for (const qualifier of ['لإعادة البيع', 'تقريبية', 'غير مؤرخ', 'ثقة منخفضة', 'جنيه مصري'])
      expect(resale).toContain(qualifier);
    expect(storyReferenceFactsAr['Sky Palace (shell & core) listed from AED 145M']).toContain(
      'يبدأ من 145 مليون درهم إماراتي',
    );
    expect(storyReferenceFactsAr[sources.find((value) => value.includes('724 acres'))!]).toContain(
      '724 أكر',
    );
    expect(
      storyReferenceFactsAr[sources.find((value) => value.includes('281 feddans'))!],
    ).toContain('281 فداناً');
  });

  it('does not translate changed or unknown source wording', () => {
    expect(storyReferenceFactsAr['Announced 28 August 2026']).toBeUndefined();
    expect(storyReferenceFactsAr['Guaranteed return']).toBeUndefined();
  });
});
