import { describe, expect, it } from 'vitest';
import { emptyConciergeBrief } from '@/src/lib/concierge';
import { groundUnit } from '@/src/server/concierge/grounding';
import type { PropertyDTO } from '@/src/server/db/properties';

function unitFixture(): PropertyDTO {
  return {
    id: 'demo-display-unit',
    slug: 'demo-display-unit',
    projectId: 'demo-display-project',
    communityId: 'demo-community',
    developerId: 'demo-developer',
    type: 'villa',
    status: 'ready',
    handoverDate: null,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 200,
    plotSqm: null,
    priceMinor: '300000000',
    currency: 'AED',
    priceAed: 3000000,
    serviceChargeMinor: 10000,
    view: 'sea',
    furnishing: 'unfurnished',
    amenities: ['concierge', 'security', 'private_pool', 'school', 'gym', 'beach'],
    branded: false,
    visibility: 'PUBLIC',
    verification: 'VERIFIED',
    permitNumber: 'SYN-TEST',
    lastVerifiedAt: '2026-10-01T00:00:00.000Z',
    lat: 25.1,
    lng: 55.1,
    embeddingSource: 'mock-hash-v1',
    goldenVisa: true,
    community: {
      id: 'demo-community',
      cityId: 'dubai',
      nameEn: 'Fictional test community',
      nameAr: 'منطقة اختبار خيالية',
      lat: 25.1,
      lng: 55.1,
      insight: null,
      city: {
        id: 'dubai',
        nameEn: 'Dubai',
        nameAr: 'دبي',
        countryId: 'AE',
        country: { id: 'AE', nameEn: 'UAE', nameAr: 'الإمارات' },
      },
    },
    developer: {
      id: 'demo-developer',
      kind: 'DEMO',
      nameEn: 'Fictional developer',
      nameAr: 'مطوّر خيالي',
      descriptionEn: 'Demo',
      descriptionAr: 'تجريبي',
      country: null,
      knownFor: [],
      rawReference: null,
    },
    translations: [
      {
        id: 'en',
        propertyId: 'demo-display-unit',
        locale: 'en',
        title: 'Demo residence',
        description: 'Demo',
      },
      {
        id: 'ar',
        propertyId: 'demo-display-unit',
        locale: 'ar',
        title: 'مسكن تجريبي',
        description: 'تجريبي',
      },
    ],
    media: [],
    paymentPlan: null,
  };
}

describe('authored demo fact display', () => {
  it('localizes each enum and the stored Arabic community without changing evidence', () => {
    const unit = unitFixture();
    const card = groundUnit(unit, emptyConciergeBrief())!;
    const amenities = card.facts.find((fact) => fact.key === 'amenities')!;
    expect(amenities.displayValue).toEqual({
      en: 'Concierge, Private security, Private pool, Schools nearby, Wellness studio, Beach access',
      ar: 'خدمة كونسيرج، حراسة خاصة، مسبح خاص، مدارس قريبة، نادي صحي، وصول إلى الشاطئ',
    });
    const community = card.facts.find((fact) => fact.key === 'community')!;
    expect(community.displayValue).toEqual({
      en: unit.community.nameEn,
      ar: unit.community.nameAr,
    });
    for (const [key, value] of [
      ['amenities', unit.amenities.join(', ')],
      ['view', unit.view],
      ['community', unit.community.nameEn],
    ]) {
      expect(card.facts.find((fact) => fact.key === key)).toMatchObject({
        id: `${unit.id}:${key}`,
        entity: { kind: 'unit', id: unit.id },
        value,
        originalText: value,
        sourceIds: [`${unit.id}:demo`],
        asOf: { value: null, precision: 'UNKNOWN' },
        provenance: 'DEMO',
        qualifier: null,
      });
    }
    expect(card.sources[0]).toMatchObject({ kind: 'demo', basis: 'DEMO_ESTIMATE', url: null });
    expect(card.price?.native).toEqual({ amount: 3000000, currency: 'AED' });
  });

  it.each([
    ['sea', 'Sea view', 'إطلالة بحرية'],
    ['garden', 'Garden view', 'إطلالة على الحديقة'],
    ['city', 'City view', 'إطلالة على المدينة'],
  ])('displays the known %s view in both languages', (view, en, ar) => {
    const card = groundUnit({ ...unitFixture(), view }, emptyConciergeBrief())!;
    expect(card.facts.find((fact) => fact.key === 'view')?.displayValue).toEqual({ en, ar });
  });

  it('keeps unknown tokens verbatim and does not reinterpret inherited object keys', () => {
    const unit = {
      ...unitFixture(),
      amenities: ['private_pool', 'unmapped_feature'],
      view: 'constructor',
    };
    const card = groundUnit(unit, emptyConciergeBrief())!;
    expect(card.facts.find((fact) => fact.key === 'amenities')).toMatchObject({
      value: 'private_pool, unmapped_feature',
      originalText: 'private_pool, unmapped_feature',
      displayValue: { en: 'Private pool, unmapped_feature', ar: 'مسبح خاص، unmapped_feature' },
    });
    const view = card.facts.find((fact) => fact.key === 'view')!;
    expect(view.value).toBe('constructor');
    expect(view.originalText).toBe('constructor');
    expect(view.displayValue).toBeUndefined();
  });

  it('does not label a real developer record as fictional inventory', () => {
    const unit = unitFixture();
    unit.developer.kind = 'REAL_REFERENCE';
    expect(groundUnit(unit, emptyConciergeBrief())).toBeNull();
  });
});
