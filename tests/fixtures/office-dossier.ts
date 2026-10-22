import { dossierDTOSchema, type DossierDTO } from '@/src/lib/office';

export function documentFixture(): DossierDTO {
  const date = { value: '2025-10', precision: 'MONTH' as const };
  const noDate = { value: null, precision: 'UNKNOWN' as const };
  const name = { en: 'Reference <script>alert(1)</script>', ar: 'مرجع المشروع' };
  const source = {
    id: 'source-1',
    kind: 'published' as const,
    url: 'https://example.com/research?a=1&b=2',
    publisher: 'Research & Co',
    basis: 'DEVELOPER' as const,
    title: null,
    asOf: date,
    retrieved: noDate,
    confidence: 'UNASSESSED' as const,
  };
  const fact = {
    id: 'project:price',
    entity: { kind: 'project' as const, id: 'project-1' },
    key: 'price',
    label: { en: 'Starting price', ar: 'السعر يبدأ من' },
    value: 91200000,
    currency: 'EGP' as const,
    unit: null,
    sourceIds: [source.id],
    asOf: date,
    provenance: 'REAL_REFERENCE' as const,
    qualifier: { en: 'From; reference only', ar: 'يبدأ من؛ للمرجعية فقط' },
    originalText: null,
  };
  const summary = {
    kind: 'REAL_REFERENCE_PROJECT' as const,
    entity: fact.entity,
    name,
    storySlug: 'project-reference',
    storyPath: '/p/project-reference',
    country: 'Egypt' as const,
    city: { en: 'North Coast', ar: 'الساحل الشمالي' },
    community: { en: 'North Coast', ar: 'الساحل الشمالي' },
    center: [28.95, 30.84],
    coordinatesApproximate: true,
    price: {
      native: { amount: 91200000, currency: 'EGP' },
      qualifier: fact.qualifier,
      factId: fact.id,
      converted: [
        {
          money: { amount: 1848448.89, currency: 'USD' },
          rate: 0.02026808,
          asOf: { value: '2026-10-01', precision: 'DAY' },
          method: 'STATIC_DEMO_FX',
        },
      ],
      paymentCurrency: 'EGP',
    },
    availability: 'ON_REQUEST' as const,
    facts: [fact],
    sources: [source],
    media: [],
  };
  const story = {
    ...summary,
    version: 1,
    projectId: 'project-1',
    residences: null,
    narrative: [],
    developer: {
      id: 'developer-1',
      name: { en: 'Reference developer', ar: 'المطوّر المرجعي' },
      kind: 'REAL_REFERENCE',
      facts: [],
      sources: [],
    },
    metrics: [
      {
        id: 'yield',
        label: { en: 'Yield', ar: 'العائد' },
        status: 'UNAVAILABLE',
        reason: 'UNKNOWN_FACT',
        factIds: [],
        sourceIds: [],
        asOf: noDate,
        explanation: {
          en: 'No sourced rent for this subject.',
          ar: 'لا تتوفر بيانات إيجار موثقة لهذا الخيار.',
        },
      },
    ],
    timeline: {
      status: 'UNAVAILABLE',
      subjectName: name,
      reason: { en: 'No complete sourced schedule.', ar: 'لا تتوفر خطة سداد كاملة موثقة.' },
    },
    capabilities: [],
  };
  return dossierDTOSchema.parse({
    version: 1,
    portfolio: {
      id: 'board-1',
      name: '<img src=x onerror=alert(1)>',
      version: 1,
      createdAt: '2026-10-23T00:00:00Z',
      updatedAt: '2026-10-23T00:00:00Z',
      items: [{ itemId: 'entry-1', ref: { kind: 'reference-project', id: 'project-1' }, summary }],
      visibleCount: 1,
    },
    stories: [story],
    generatedAt: '2026-10-23T00:00:00Z',
    preferences: { locale: 'ar', currency: 'USD', areaUnit: 'sqm', arabicIndicDigits: true },
  });
}
