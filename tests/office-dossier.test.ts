import { describe, expect, it } from 'vitest';
import { officeDossierHtml } from '@/src/server/pdf/office-dossier';
import { documentFixture } from './fixtures/office-dossier';

describe('source-bearing bilingual dossier', () => {
  it('presents localized fact labels while retaining the unmodified source wording', async () => {
    const data = documentFixture();
    data.stories[0].facts.push({
      ...data.stories[0].facts[0],
      id: 'fixture:amenities',
      key: 'amenities',
      value: 'private_pool, garden',
      originalText: 'private_pool, garden',
      currency: null,
      unit: null,
      displayValue: { en: 'Private pool, garden', ar: 'مسبح خاص، حديقة' },
    });
    const html = await officeDossierHtml(data);
    expect(html).toContain('<bdi>مسبح خاص، حديقة</bdi>');
    expect(html).toContain('النص الأصلي للمصدر: <span dir="auto">private_pool, garden</span>');
  });
  it('keeps project and developer citation dates separate when their source IDs match', async () => {
    const data = documentFixture();
    data.preferences = { ...data.preferences, locale: 'en', arabicIndicDigits: false };
    const story = data.stories[0];
    const source = story.sources[0];
    story.developer.sources = [{ ...source, asOf: { value: null, precision: 'UNKNOWN' } }];
    story.developer.facts = [
      {
        ...story.facts[0],
        id: 'developer:track-record',
        entity: { kind: 'developer', id: story.developer.id },
        label: { en: 'Developer context', ar: 'بيانات المطوّر' },
        value: 'Reported developer context',
        currency: null,
        asOf: { value: null, precision: 'UNKNOWN' },
      },
    ];
    const html = await officeDossierHtml(data);
    expect(html).toContain('Starting price <span class="refs">[1]</span>');
    expect(html).toContain('Developer context <span class="refs">[2]</span>');
    const englishAppendix = html.match(/<ol class="sources">([\s\S]*?)<\/ol>/)?.[1];
    expect(englishAppendix).toContain('As of <bdi>2025-10</bdi>');
    expect(englishAppendix).toContain('As of Date not supplied');
    expect(englishAppendix?.match(/<li>/g)).toHaveLength(2);
  });
  it('escapes authored text and preserves native amounts, source precision and unknowns in both scripts', async () => {
    const html = await officeDossierHtml(documentFixture());
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('lang="ar" dir="rtl"');
    expect(html).toContain('lang="en" dir="ltr"');
    expect(html).toContain('٩١٬٢٠٠٬٠٠٠');
    expect(html).toContain('EGP');
    expect(html).toContain('USD');
    expect(html).toContain('٢٠٢٥-١٠');
    expect(html).not.toContain('٢٠٢٥-١٠-٠١');
    expect(html).toContain('No complete sourced schedule.');
    expect(html).toContain('لا تتوفر خطة سداد كاملة موثقة.');
    expect(html).toContain('No sourced rent for this subject.');
    expect(html).toContain('https://example.com/research?a=1&amp;b=2');
    expect(html).toContain('Date not supplied');
    expect(html).toContain('data:font/woff2;base64,');
    expect(html).not.toContain('overflow:hidden');
  });
});
