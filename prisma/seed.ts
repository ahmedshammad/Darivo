import 'dotenv/config';
import { PrismaClient, type Role } from '@prisma/client';
import { seedReference } from './seed-reference';
import { seedOffice } from './seed-office';
import { DEMO_UNIT_COUNT, demoPrice, demoProjectId, demoVisibility } from './demo-data';
import type { ReferenceDataset } from '../src/lib/reference-data';
import { AREAS, TYPES, typeAr, FX, FX_DATE } from '../src/lib/catalog';
import { embed } from '../src/server/search/embedding';
import { embedText, embeddingSource } from '../src/server/search/provider';
const db = new PrismaClient();
async function seed() {
  for (const [id, role, verified] of [
    ['client', 'CLIENT', false],
    ['verified', 'VERIFIED_CLIENT', true],
    ['partner', 'DEVELOPER_PARTNER', true],
    ['advisor', 'ADVISOR', true],
    ['admin', 'ADMIN', true],
  ] as const) {
    await db.user.upsert({
      where: { email: `${id}@darivo.example` },
      update: { role: role as Role, verification: verified ? 'VERIFIED' : 'UNVERIFIED' },
      create: {
        id: `demo-${id}`,
        name: `Demo ${id}`,
        email: `${id}@darivo.example`,
        emailVerified: new Date(),
        role: role as Role,
        verification: verified ? 'VERIFIED' : 'UNVERIFIED',
        profile: { create: { consentAt: new Date() } },
      },
    });
  }
  const dataset = await seedReference(db);
  await seedInventory(dataset);
  await reindex();
  await seedOffice(db);
  console.info(
    'Reference data: 9 organisations, 1 aggregate, 13 projects, 3 market stats; 250 fictional units ready.',
  );
}
async function seedInventory(dataset: ReferenceDataset) {
  for (const [id, nameEn, nameAr] of [
    ['AE', 'United Arab Emirates', 'الإمارات العربية المتحدة'],
    ['EG', 'Egypt', 'مصر'],
  ])
    await db.country.upsert({ where: { id }, update: {}, create: { id, nameEn, nameAr } });
  for (const [id, city, cityAr, nameEn, nameAr, lat, lng, countryId] of AREAS) {
    const cityId = city.toLowerCase().replaceAll(' ', '-');
    await db.city.upsert({
      where: { id: cityId },
      update: {},
      create: { id: cityId, nameEn: city, nameAr: cityAr, countryId },
    });
    await db.community.upsert({
      where: { id },
      update: {},
      create: {
        id,
        cityId,
        nameEn,
        nameAr,
        lat,
        lng,
        insight: {
          create: {
            averageAedSqm: countryId === 'AE' ? 24000 : 6500,
            yieldLow: 4.5,
            yieldHigh: 6.5,
            notesEn:
              'Demo estimate: synthetic area prices and yield ranges, not observed market evidence.',
            notesAr: 'تقدير تجريبي: أسعار مناطق وعوائد افتراضية، وليست بيانات سوق مرصودة.',
          },
        },
      },
    });
    await db.areaInsight.update({
      where: { communityId: id },
      data: {
        notesEn:
          'Demo estimate: synthetic area prices and yield ranges, not observed market evidence.',
        notesAr: 'تقدير تجريبي: أسعار مناطق وعوائد افتراضية، وليست بيانات سوق مرصودة.',
      },
    });
  }
  for (const [i, nameEn, nameAr] of [
    [0, 'Nacre Habitat', 'مساكن الصدف'],
    [1, 'Serein Living', 'سيرين للعيش الراقي'],
    [2, 'Aureline Estates', 'أوريلين العقارية'],
    [3, 'Riwaq Atelier', 'رواق أتولييه'],
  ] as const)
    await db.developer.upsert({
      where: { id: `developer-${i}` },
      update: {},
      create: {
        id: `developer-${i}`,
        nameEn,
        nameAr,
        descriptionEn:
          'A fictional studio of considered homes, created for this Darivo demonstration.',
        descriptionAr: 'استوديو عقاري افتراضي لمساكن مدروسة بعناية، صُمّم لعرض داريفو التجريبي.',
        kind: 'DEMO',
      },
    });
  for (const [currency, perAed] of Object.entries(FX))
    await db.fxRate.upsert({
      where: { currency },
      update: {},
      create: { currency, perAed, asOf: new Date(FX_DATE) },
    });
  for (const [index, area] of AREAS.entries()) {
    const id = demoProjectId(area[0]);
    const priceBasis = demoPrice(index, area, 'villa', dataset);
    const project = {
      slug: id,
      kind: 'DEMO' as const,
      developerId: `developer-${index % 4}`,
      nameEn: `The Quiet Quarter ${String(index + 1).padStart(2, '0')}`,
      nameAr: `حي السكينة ${String(index + 1).padStart(2, '0')}`,
      country: area[7] === 'AE' ? 'UAE' : 'Egypt',
      city: area[1],
      communityName: area[3],
      communityId: area[0],
      lat: area[5],
      lng: area[6],
      coordinatesApproximate: true,
      types: [...TYPES],
      priceBasis: 'DEMO_ESTIMATE' as const,
      demoPriceBasis: {
        ...priceBasis,
        referenceProjectIds: [
          ...new Set(TYPES.map((type) => demoPrice(index, area, type, dataset).referenceId)),
        ],
        method:
          'Reference anchor × 0.75–1.40 × fictional type factor; non-coastal Egypt factor 0.70. Stable acceptance villa AED 8.8M.',
        fxBasis: 'Demo FX',
        fxDate: FX_DATE,
      },
    };
    await db.project.upsert({ where: { id }, create: { id, ...project }, update: project });
    const coastal = [
      'palm-jumeirah',
      'jumeirah-bay',
      'dubai-marina',
      'saadiyat',
      'yas',
      'north-coast',
      'el-gouna',
      'sokhna',
    ].includes(area[0]);
    const kinds = [
      'school',
      'hospital',
      'culture',
      ...(coastal ? ['marina', 'beach'] : []),
      ...(['dubai-hills', 'emirates-hills', 'yas', 'north-coast'].includes(area[0])
        ? ['golf']
        : []),
    ];
    for (const [poiIndex, kind] of kinds.entries()) {
      const poiId = `demo-poi-${area[0]}-${kind}`;
      const poi = {
        communityId: area[0],
        nameEn: `Demo POI · ${kind}`,
        nameAr: `موقع تجريبي · ${{ school: 'مدرسة', hospital: 'مستشفى', culture: 'ثقافة ومطاعم', marina: 'مرسى', beach: 'شاطئ', golf: 'غولف' }[kind as 'school']}`,
        kind,
        lat: area[5] + 0.003 * (poiIndex + 1),
        lng: area[6] + 0.002 * (poiIndex + 1),
        isDemo: true,
      };
      await db.demoPOI.upsert({ where: { id: poiId }, create: { id: poiId, ...poi }, update: poi });
    }
  }
  // Fictional transport markers: approximate regional contexts, never named operating airports.
  for (const [communityId, lat, lng] of [
    ['downtown', 25.25, 55.37],
    ['saadiyat', 24.43, 54.65],
    ['new-cairo', 30.12, 31.41],
    ['north-coast', 30.93, 28.5],
    ['el-gouna', 27.17, 33.81],
  ] as const) {
    const id = `demo-poi-${communityId}-airport`;
    const marker = {
      communityId,
      lat,
      lng,
      kind: 'airport',
      nameEn: 'Demo POI · airport',
      nameAr: 'موقع تجريبي · مطار',
      isDemo: true,
    };
    await db.demoPOI.upsert({ where: { id }, create: { id, ...marker }, update: marker });
  }
  const names = [
    'The Courtyard',
    'The Horizon',
    'The Grove',
    'The Terrace',
    'The Sanctuary',
    'The Dune',
  ];
  const namesAr = [
    'دار الفناء',
    'دار الأفق',
    'دار البستان',
    'دار الشرفة',
    'دار السكينة',
    'دار الكثبان',
  ];
  for (let i = 0; i < DEMO_UNIT_COUNT; i++) {
    const area = AREAS[i % AREAS.length],
      type = i === 1 ? 'villa' : TYPES[i % 6],
      beds = i === 1 ? 3 : type === 'plot' ? 0 : 2 + (i % 5);
    const estimate = demoPrice(i, area, type, dataset);
    const currency = estimate.currency;
    const priceAed = estimate.amount / FX[currency];
    const indicativeAedSqm = ['palm-jumeirah', 'jumeirah-bay'].includes(area[0])
      ? 65000
      : area[7] === 'AE'
        ? 24000
        : 6500;
    const areaSqm = Math.max(
      type === 'mansion' ? 800 : type === 'villa' ? 300 : 120,
      Math.round(priceAed / indicativeAedSqm),
    );
    const status = i % 3 === 0 ? 'off_plan' : 'ready',
      view = i % 2 === 0 ? 'sea' : 'garden';
    const title = `${names[i % 6]} ${String(i + 1).padStart(3, '0')}`,
      titleAr = `${namesAr[i % 6]} ${String(i + 1).padStart(3, '0')}`;
    const description = `An inviting ${type} in ${area[3]}, with ${beds} bedrooms, considered proportions and a ${view} outlook. Quiet interiors open onto generous outdoor living. Fictional property, illustrative design.`;
    const descriptionAr = `${typeAr[type]} في ${area[4]}، تضم ${beds} غرف نوم ومساحات رحبة وإطلالة ${view === 'sea' ? 'بحرية' : 'على الحديقة'}. تنسجم التفاصيل الهادئة مع مساحات خارجية مريحة. عقار افتراضي وتصميم توضيحي.`;
    const id = `property-${String(i + 1).padStart(3, '0')}`;
    await db.property.upsert({
      where: { id },
      update: {
        projectId: demoProjectId(area[0]),
        developerId: `developer-${i % 4}`,
        communityId: area[0],
        areaSqm,
        priceAed,
        priceMinor: BigInt(Math.round(estimate.amount * 100)),
        currency,
        visibility: demoVisibility(i),
      },
      create: {
        id,
        slug: title.toLowerCase().replaceAll(' ', '-'),
        communityId: area[0],
        developerId: `developer-${i % 4}`,
        projectId: demoProjectId(area[0]),
        type,
        status,
        handoverDate: status === 'off_plan' ? new Date('2028-06-30') : null,
        bedrooms: beds,
        bathrooms: Math.max(1, beds + 1),
        areaSqm,
        plotSqm: type === 'villa' || type === 'mansion' ? 700 + i * 5 : null,
        priceMinor: BigInt(Math.round(priceAed * FX[currency] * 100)),
        currency,
        priceAed,
        serviceChargeMinor: Math.round(18000 * FX[currency] * 100),
        view,
        furnishing: i % 2 ? 'furnished' : 'unfurnished',
        amenities: [
          'concierge',
          'security',
          ...(i % 2 ? ['private_pool', 'school'] : ['gym', 'beach']),
        ],
        branded: i % 7 === 0,
        visibility: demoVisibility(i),
        permitNumber: `SYN-${area[7]}-${String(i + 1).padStart(5, '0')}`,
        lastVerifiedAt: new Date('2026-10-01'),
        verification: 'VERIFIED',
        lat: area[5] + (i % 5) * 0.002,
        lng: area[6] + (i % 4) * 0.002,
        translations: {
          create: [
            { locale: 'en', title, description },
            { locale: 'ar', title: titleAr, description: descriptionAr },
          ],
        },
        media: {
          create: [
            {
              url: `/art/property-${i % 6}.svg`,
              altEn: 'Original architectural illustration of a fictional residence',
              altAr: 'رسم معماري أصلي لمسكن افتراضي',
              position: 0,
            },
            {
              url: `/art/property-${(i + 2) % 6}.svg`,
              altEn: 'Illustrative courtyard concept',
              altAr: 'تصوّر توضيحي للفناء',
              position: 1,
            },
          ],
        },
        ...(status === 'off_plan'
          ? {
              paymentPlan: {
                create: { bookingPercent: 20, constructionPercent: 40, handoverPercent: 40 },
              },
            }
          : {}),
      },
    });
    const embedding = JSON.stringify(
      embed(
        `${title} ${description} ${titleAr} ${descriptionAr} ${area[3]} ${area[4]} ${type} ${view}`,
      ),
    );
    await db.$executeRaw`UPDATE "Property" SET embedding=${embedding}::vector WHERE id=${id}`;
  }
  // Remove only migration-created empty bridge collections; all unit identities remain stable.
  await db.project.deleteMany({ where: { id: { startsWith: 'demo-auto-' }, units: { none: {} } } });
}
async function reindex() {
  const source = embeddingSource();
  const rows = await db.property.findMany({
    where: { embeddingSource: { not: source } },
    include: { translations: true, community: true },
  });
  if (!rows.length) return;
  const prepared = [];
  for (const row of rows) {
    const vector = JSON.stringify(
      await embedText(
        row.translations.map((t) => t.title + ' ' + t.description).join(' ') +
          ` ${row.community.nameEn} ${row.community.nameAr} ${row.type} ${row.view}`,
      ),
    );
    prepared.push({ id: row.id, vector });
  }
  await db.$transaction(
    prepared.map(
      (p) =>
        db.$executeRaw`UPDATE "Property" SET embedding=${p.vector}::vector,"embeddingSource"=${source} WHERE id=${p.id}`,
    ),
  );
  console.info(`Reindexed ${prepared.length} fictional properties with ${source}.`);
}
seed().finally(() => db.$disconnect());
