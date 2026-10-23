import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';
import type { DossierDTO, OfficePreferences } from '@/src/lib/office';
import type { StoryDTO } from '@/src/lib/story';
import type { GroundedFact, GroundedSource } from '@/src/lib/concierge';
import { conciergeCopy } from '@/messages/concierge';
import { storyCompletionDate } from '@/src/components/story/presentation';

type Locale = 'en' | 'ar';
const copy = {
  en: {
    dossier: 'Private portfolio dossier',
    confidential: 'Prepared for your private review',
    introduction: 'A considered collection, with the evidence kept in view.',
    summary: 'Your collection',
    entry: 'Entry',
    native: 'Original price',
    conversion: 'Indicative display conversion',
    basis: 'Evidence basis',
    reference: 'Project reference',
    demo: 'Fictional demo unit',
    onRequest: 'Residences available on request. No individual unit or availability is confirmed.',
    demoNote:
      'Fictional demonstration inventory. Prices, permits, schedules and estimates are not real offers.',
    limits:
      'Indicative - confirm with your advisor. Source dates are not a statement of current availability. Reference starting prices and exact demo-unit prices have different bases; they are not added into a portfolio total.',
    privacy:
      'This document is a private download, not a public link. It may contain restricted information. Share only by an explicit decision; a downloaded copy cannot be remotely revoked.',
    generated: 'Generated',
    unknown: 'Not provided',
    notApplicable: 'Not applicable',
    incompatible: 'Evidence is not comparable',
    facts: 'Facts and qualifications',
    numbers: 'The numbers',
    plan: 'Payment plan',
    milestone: 'Milestone',
    percent: 'Share',
    amount: 'Original amount',
    timing: 'Timing in source',
    planLimits:
      'Amounts are calculated from the stated price and schedule percentages. The underlying native currency remains the payment basis; display conversions are indicative static demo FX.',
    sources: 'Sources and dates',
    asOf: 'As of',
    retrieved: 'Retrieved',
    developer: 'Developer',
    original: 'Original source wording',
    fx: 'Static demo FX',
    rate: 'Conversion rate',
    unknownDate: 'Date not supplied',
    formula: 'Calculation / evidence',
    indicative: 'Indicative configuration',
    page: 'Page',
    noEntries: 'No entries in this portfolio.',
  },
  ar: {
    dossier: 'ملف المحفظة الخاص',
    confidential: 'أُعدّ لمراجعتك الخاصة',
    introduction: 'خيارات مدروسة، والأدلة واضحة أمامك.',
    summary: 'خياراتك المحفوظة',
    entry: 'الخيار',
    native: 'السعر الأصلي',
    conversion: 'تحويل استرشادي للعرض',
    basis: 'أساس البيانات',
    reference: 'مرجع لمشروع',
    demo: 'وحدة تجريبية خيالية',
    onRequest: 'تفاصيل الوحدات متاحة عند الطلب. لم يتم تأكيد وحدة محددة أو توافرها.',
    demoNote: 'مخزون تجريبي خيالي. الأسعار والتصاريح وخطط السداد والتقديرات ليست عروضاً حقيقية.',
    limits:
      'بيانات استرشادية - يرجى التأكيد مع مستشارك. تواريخ المصادر لا تؤكد التوافر الحالي. تختلف أسس أسعار المشاريع التي تبدأ من مبلغ معين عن أسعار الوحدات التجريبية المحددة؛ لذلك لا نجمعها في قيمة إجمالية للمحفظة.',
    privacy:
      'هذا ملف للتنزيل الخاص، وليس رابطاً عاماً. قد يتضمن معلومات مقيّدة. مشاركته قرار صريح منك؛ ولا يمكن سحب نسخة تم تنزيلها عن بُعد.',
    generated: 'تاريخ إعداد الملف',
    unknown: 'غير متوفر',
    notApplicable: 'لا ينطبق',
    incompatible: 'البيانات غير قابلة للمقارنة',
    facts: 'البيانات وتوضيحاتها',
    numbers: 'الأرقام',
    plan: 'خطة السداد',
    milestone: 'المرحلة',
    percent: 'النسبة',
    amount: 'المبلغ الأصلي',
    timing: 'التوقيت الوارد في المصدر',
    planLimits:
      'تُحسب المبالغ من السعر المذكور ونسب السداد. تظل العملة الأصلية أساس السداد؛ والتحويلات للعرض استرشادية بأسعار صرف تجريبية ثابتة.',
    sources: 'المصادر والتواريخ',
    asOf: 'بتاريخ',
    retrieved: 'تاريخ الاطلاع',
    developer: 'المطوّر',
    original: 'النص الأصلي للمصدر',
    fx: 'سعر صرف تجريبي ثابت',
    rate: 'سعر التحويل',
    unknownDate: 'التاريخ غير مذكور',
    formula: 'الحساب / الدليل',
    indicative: 'إعداد استرشادي',
    page: 'صفحة',
    noEntries: 'لا توجد خيارات في هذه المحفظة.',
  },
} as const;
const escape = (value: unknown) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char]!,
  );
const direction = (locale: Locale) => (locale === 'ar' ? 'rtl' : 'ltr');
function digits(value: string, preferences: OfficePreferences) {
  return preferences.arabicIndicDigits
    ? value.replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)])
    : value;
}
function number(
  value: number,
  locale: Locale,
  preferences: OfficePreferences,
  currency?: string,
  precision = 2,
) {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    numberingSystem: preferences.arabicIndicDigits ? 'arab' : 'latn',
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
    ...(currency ? ({ style: 'currency', currency, currencyDisplay: 'code' } as const) : {}),
  }).format(value);
}
const bdi = (value: unknown) => `<bdi>${escape(value)}</bdi>`;
function safeLink(url: string) {
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) ? escape(parsed.href) : null;
  } catch {
    return null;
  }
}
function sourceDate(value: GroundedFact['asOf'], locale: Locale, preferences: OfficePreferences) {
  return value.value ? bdi(digits(value.value, preferences)) : escape(copy[locale].unknownDate);
}
function sourceMap(story: StoryDTO) {
  const items = new Map<string, GroundedSource>();
  for (const source of [
    ...story.sources,
    ...story.developer.sources,
    ...(story.timeline.status === 'AVAILABLE' ? story.timeline.component.sources : []),
  ])
    items.set(sourceKey(source), source);
  return [...items.values()];
}
// A URL/basis ID may be shared by project and developer records with distinct dates.
// Keep each evidence context rather than overwriting or borrowing another record's date.
function sourceKey(source: GroundedSource) {
  return JSON.stringify(source);
}
function refs(ids: string[], sources: GroundedSource[], context = sources) {
  const indices = [
    ...new Set(
      ids
        .flatMap((id) => context.filter((source) => source.id === id))
        .map(
          (source) =>
            sources.findIndex((candidate) => sourceKey(candidate) === sourceKey(source)) + 1,
        )
        .filter(Boolean),
    ),
  ];
  return indices.length ? `<span class="refs">[${indices.join(', ')}]</span>` : '';
}
function factValue(fact: GroundedFact, locale: Locale, preferences: OfficePreferences) {
  const value = fact.value;
  const completion =
    fact.key === 'completion'
      ? storyCompletionDate(value, locale, preferences.arabicIndicDigits)
      : null;
  let formatted: string;
  if (value === null) formatted = copy[locale].unknown;
  else if (typeof value === 'number')
    formatted = number(value, locale, preferences, fact.currency ?? undefined);
  else if (typeof value === 'boolean')
    formatted = value ? conciergeCopy[locale].yes : conciergeCopy[locale].no;
  else formatted = completion ?? digits(fact.displayValue?.[locale] ?? value, preferences);
  return `<div class="fact-value">${bdi(formatted)}${fact.unit && !fact.currency ? ` ${bdi(fact.unit)}` : ''}</div>
    ${fact.qualifier ? `<p class="small">${escape(fact.qualifier[locale])}</p>` : ''}
    ${
      typeof value === 'string' &&
      (completion ||
        (fact.displayValue?.[locale] && fact.displayValue[locale] !== (fact.originalText ?? value)))
        ? `<p class="original">${copy[locale].original}: <span dir="auto">${escape(fact.originalText ?? value)}</span></p>`
        : ''
    }`;
}
function priceEvidence(story: StoryDTO, locale: Locale, preferences: OfficePreferences) {
  const fact = story.facts.find((item) => item.id === story.price?.factId);
  const bases = [
    ...new Set(
      story.sources
        .filter((source) => fact?.sourceIds.includes(source.id))
        .map((source) => conciergeCopy[locale].basis[source.basis]),
    ),
  ];
  return `<p class="meta">${bases.map(escape).join(' / ')} · ${copy[locale].asOf} ${sourceDate(fact?.asOf ?? { value: null, precision: 'UNKNOWN' }, locale, preferences)}</p>`;
}
function priceHtml(story: StoryDTO, locale: Locale, preferences: OfficePreferences) {
  const t = copy[locale];
  const price = story.price;
  if (!price) return `<p class="price">${t.unknown}</p>`;
  return `<p class="kicker">${t.native}</p><p class="price">${bdi(number(price.native.amount, locale, preferences, price.native.currency))}</p>
    ${price.qualifier ? `<p class="price-qualifier">${escape(price.qualifier[locale])}</p>` : ''}
    ${priceEvidence(story, locale, preferences)}
    ${price.converted
      .filter((conversion) => conversion.money.currency === preferences.currency)
      .map(
        (
          conversion,
        ) => `<div class="conversion"><strong>${bdi(number(conversion.money.amount, locale, preferences, conversion.money.currency))}</strong>
      <span>${t.conversion} · ${t.fx}</span><span>${t.asOf} ${sourceDate(conversion.asOf, locale, preferences)}</span>
      <span>${t.rate}: ${bdi(`${number(1, locale, preferences)} ${price.native.currency} = ${number(conversion.rate, locale, preferences, undefined, 8)} ${conversion.money.currency}`)}</span></div>`,
      )
      .join('')}`;
}
function factsHtml(
  story: StoryDTO,
  locale: Locale,
  preferences: OfficePreferences,
  sources: GroundedSource[],
) {
  const t = copy[locale];
  return `<h3>${t.facts}</h3><div class="facts">${story.facts
    .map(
      (fact) => `<div class="fact">
    <h4>${escape(fact.label[locale])} ${refs(fact.sourceIds, sources, story.sources)}</h4>${factValue(fact, locale, preferences)}
    <p class="meta">${fact.provenance === 'DEMO' ? conciergeCopy[locale].demo : ''}${fact.provenance === 'DEMO' ? ' · ' : ''}${t.asOf} ${sourceDate(fact.asOf, locale, preferences)}</p>
  </div>`,
    )
    .join('')}</div>`;
}
function metricsHtml(
  story: StoryDTO,
  locale: Locale,
  preferences: OfficePreferences,
  sources: GroundedSource[],
) {
  const t = copy[locale];
  return `<h3>${t.numbers}</h3><div class="metrics">${story.metrics
    .filter((metric) => metric.status === 'AVAILABLE')
    .map(
      (metric) => `<div class="metric">
    <h4>${escape(metric.label[locale])} ${refs(metric.sourceIds, sources, story.sources)}</h4>
    <p class="metric-number">${metric.status === 'AVAILABLE' ? (metric.unit === 'boolean' ? escape(metric.value ? conciergeCopy[locale].yes : conciergeCopy[locale].no) : bdi(number(metric.value, locale, preferences, metric.currency ?? undefined)) + (locale === 'ar' && metric.currency && ['sqm', 'sqft'].includes(metric.unit) ? `<small>${metric.unit === 'sqm' ? 'لكل متر مربع' : 'لكل قدم مربعة'}</small>` : ` ${bdi(metric.currency && ['sqm', 'sqft'].includes(metric.unit) ? '/ ' + (metric.unit === 'sqm' ? 'm²' : 'ft²') : metric.unit)}`)) : t.unknown}</p>
    ${metric.status === 'AVAILABLE' ? `<p class="badge">${metric.basis === 'DEMO' ? conciergeCopy[locale].demo : metric.basis === 'INDICATIVE_CONFIG' ? t.indicative : t.basis}</p>` : ''}
    <p>${escape(metric.explanation[locale])}</p><p class="meta">${t.asOf} ${sourceDate(metric.asOf, locale, preferences)}</p>
  </div>`,
    )
    .join('')}</div><table class="payment unknown-metrics"><tbody>${story.metrics
    .filter((metric) => metric.status === 'UNAVAILABLE')
    .map(
      (metric) =>
        `<tr><th>${escape(metric.label[locale])}</th><td><strong>${metric.status === 'UNAVAILABLE' && metric.reason === 'NOT_APPLICABLE' ? t.notApplicable : metric.status === 'UNAVAILABLE' && metric.reason === 'INCOMPATIBLE_BASIS' ? t.incompatible : t.unknown}</strong><small>${escape(metric.explanation[locale])}</small></td></tr>`,
    )
    .join('')}</tbody></table>`;
}
function timelineHtml(
  story: StoryDTO,
  locale: Locale,
  preferences: OfficePreferences,
  sources: GroundedSource[],
) {
  const t = copy[locale];
  if (story.timeline.status !== 'AVAILABLE')
    return `<h3>${t.plan}</h3><p>${escape(story.timeline.reason[locale])}</p>`;
  const timeline = story.timeline.component;
  const price = timeline.price.native;
  return `<h3>${t.plan}</h3>
    <table class="payment"><thead><tr><th colspan="3">${escape(timeline.subjectName?.[locale] ?? story.name[locale])} · ${timeline.mode === 'DEMO_ESTIMATE' ? conciergeCopy[locale].demo : t.basis}</th></tr><tr><th>${t.milestone}</th><th>${t.percent}</th><th>${t.amount}</th></tr></thead><tbody>
    ${timeline.schedule
      .map(
        (step) => `<tr><td>${escape(step.label[locale])}${refs(
          timeline.facts
            .filter((fact) => step.factIds.includes(fact.id))
            .flatMap((fact) => fact.sourceIds),
          sources,
          timeline.sources,
        )}
    <small>${t.timing}: <span dir="auto">${escape(step.timing)}</span></small></td><td>${bdi(number(step.percent, locale, preferences))}%</td><td>${bdi(number((price.amount * step.percent) / 100, locale, preferences, price.currency))}
    ${timeline.price.converted
      .filter((conversion) => conversion.money.currency === preferences.currency)
      .map(
        (conversion) =>
          `<small>${bdi(number((conversion.money.amount * step.percent) / 100, locale, preferences, conversion.money.currency))} · ${t.fx} · ${sourceDate(conversion.asOf, locale, preferences)}</small>`,
      )
      .join('')}</td></tr>`,
      )
      .join('')}
    </tbody></table><p class="small">${t.planLimits}</p>`;
}
function sourcesHtml(sources: GroundedSource[], locale: Locale, preferences: OfficePreferences) {
  const t = copy[locale];
  return `<h3>${t.sources}</h3><ol class="sources">${sources
    .map((source) => {
      const href = source.kind === 'published' ? safeLink(source.url) : null;
      return `<li><strong>${source.kind === 'published' ? bdi(source.publisher) : escape(conciergeCopy[locale].basis[source.basis])}</strong>
      <p>${escape(conciergeCopy[locale].basis[source.basis])} · ${t.asOf} ${sourceDate(source.asOf, locale, preferences)} · ${t.retrieved} ${sourceDate(source.retrieved, locale, preferences)}</p>
      ${source.title ? `<p dir="auto">${escape(source.title)}</p>` : ''}${href ? `<a href="${href}" dir="ltr">${escape(source.kind === 'published' ? source.url : '')}</a>` : ''}</li>`;
    })
    .join('')}</ol>`;
}

/** Pure document composition; accepts only the current owner's authorized DTO. No remote assets. */
export async function officeDossierHtml(data: DossierDTO) {
  const asset = async (name: string) =>
    `data:font/woff2;base64,${(await readFile(join(process.cwd(), 'public/fonts', name))).toString('base64')}`;
  const [ui, display, arabic, arabicDisplay] = await Promise.all(
    ['ui.woff2', 'display.woff2', 'arabic.woff2', 'arabic-display.woff2'].map(asset),
  );
  const preferences = data.preferences;
  const first = preferences.locale;
  const second: Locale = first === 'en' ? 'ar' : 'en';
  const languages = [first, second];
  const t = copy[first];
  const cover = `<section class="cover"><div class="wordmark">DARIVO <span lang="ar" dir="rtl">داريفو</span></div>
    <div class="cover-body"><p class="kicker">${t.confidential}</p><h1 dir="auto">${escape(data.portfolio.name)}</h1>
    ${languages.map((locale) => `<div lang="${locale}" dir="${direction(locale)}"><h2>${copy[locale].dossier}</h2><p class="deck">${copy[locale].introduction}</p></div>`).join('')}
    <div class="cover-rule"></div><p class="meta">${t.generated} ${bdi(digits(data.generatedAt.replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC'), preferences))}</p></div>
    <div class="cover-notes">${languages.map((locale) => `<p lang="${locale}" dir="${direction(locale)}">${copy[locale].privacy}</p>`).join('')}</div></section>`;
  const summary = `<section class="summary"><p class="kicker">DARIVO / PRIVATE OFFICE</p>${languages.map((locale) => `<div lang="${locale}" dir="${direction(locale)}"><h2>${copy[locale].summary}</h2><p class="small">${copy[locale].limits}</p></div>`).join('')}
    ${data.stories.length ? data.stories.map((story, index) => `<div class="summary-entry"><span class="entry-index">${bdi(digits(String(index + 1).padStart(2, '0'), preferences))}</span><div>${languages.map((locale) => `<div lang="${locale}" dir="${direction(locale)}"><h3>${escape(story.name[locale])}</h3><p>${story.kind === 'REAL_REFERENCE_PROJECT' ? copy[locale].reference : copy[locale].demo} · ${escape(story.community[locale])}</p></div>`).join('')}</div><div class="summary-price">${story.price ? bdi(number(story.price.native.amount, first, preferences, story.price.native.currency)) : t.unknown}${story.price?.qualifier ? `<small>${escape(story.price.qualifier[first])}</small>` : ''}${priceEvidence(story, first, preferences)}</div></div>`).join('') : `<p>${t.noEntries}</p>`}</section>`;
  const stories = data.stories
    .map((story, index) => {
      const sources = sourceMap(story);
      return languages
        .map(
          (
            locale,
          ) => `<section class="story ${locale === first ? 'new-subject' : 'translation'}" lang="${locale}" dir="${direction(locale)}"><div class="story-lead">
      <p class="kicker">${copy[locale].entry} ${bdi(digits(String(index + 1).padStart(2, '0'), preferences))} / ${story.kind === 'REAL_REFERENCE_PROJECT' ? copy[locale].reference : copy[locale].demo}</p>
      <h2 class="story-title">${escape(story.name[locale])}</h2><p class="place">${escape(story.community[locale])} · ${escape(story.city[locale])}</p>
      <div class="price-block">${priceHtml(story, locale, preferences)}</div>
      </div>
      <p class="notice">${story.kind === 'REAL_REFERENCE_PROJECT' ? copy[locale].onRequest : copy[locale].demoNote}</p>
      ${factsHtml(story, locale, preferences, sources)}${metricsHtml(story, locale, preferences, sources)}${timelineHtml(story, locale, preferences, sources)}
      <h3>${copy[locale].developer}</h3><p>${escape(story.developer.name[locale])}</p>
      <div class="facts">${story.developer.facts.map((fact) => `<div class="fact"><h4>${escape(fact.label[locale])} ${refs(fact.sourceIds, sources, story.developer.sources)}</h4>${factValue(fact, locale, preferences)}</div>`).join('')}</div>
      ${sourcesHtml(sources, locale, preferences)}<p class="closing-note">${copy[locale].limits}</p></section>`,
        )
        .join('');
    })
    .join('');
  return `<!doctype html><html lang="${first}" dir="${direction(first)}"><head><meta charset="utf-8"><title>${escape(data.portfolio.name)} - Darivo</title><style>
    @font-face{font-family:UI;src:url(${ui})}@font-face{font-family:Display;src:url(${display})}@font-face{font-family:Arabic;src:url(${arabic})}@font-face{font-family:ArabicDisplay;src:url(${arabicDisplay})}
    @page{size:A4;margin:18mm 17mm 20mm}*{box-sizing:border-box}html{print-color-adjust:exact;-webkit-print-color-adjust:exact}body{margin:0;background:#f7f4ee;color:#16171a;font:12px/1.6 UI,Arial,sans-serif}bdi{unicode-bidi:isolate}p{margin:0 0 8px}h1,h2,h3,h4{break-after:avoid}h1,h2{font-family:Display,serif;font-weight:400;line-height:1.15}h1{font-size:52px;overflow-wrap:anywhere;margin:16px 0 22px}h2{font-size:32px;margin:0 0 14px}h3{font:23px/1.2 Display,serif;margin:26px 0 12px}h4{font-size:12px;margin:0 0 5px;font-weight:600}a{color:#71582f;text-decoration:underline;overflow-wrap:anywhere}small{display:block;font-size:9.5px;line-height:1.6}.kicker{font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:#71582f}.small{font-size:10.5px}.meta,.original{font-size:9.5px;color:#55565b}.original{margin-top:5px}.refs{font:9px UI,sans-serif;color:#71582f;white-space:nowrap}.badge{font-size:9.5px;color:#71582f}.cover{min-height:252mm;display:flex;flex-direction:column;break-after:page}.wordmark{font:30px Display,serif;letter-spacing:5px;border-bottom:1px solid #b08d57;padding-bottom:14px;display:flex;justify-content:space-between;direction:ltr}.wordmark span{font:25px ArabicDisplay,serif;letter-spacing:0}.cover-body{margin-top:43mm}.cover h2{font-size:27px}.deck{font-size:12px;max-width:130mm}.cover-rule{width:27mm;height:2px;background:#b08d57;margin:20px 0}.cover-notes{margin-top:auto;padding-top:24px;font-size:10.5px;display:grid;grid-template-columns:1fr 1fr;gap:9mm}.summary{break-after:page}.summary-entry{display:grid;grid-template-columns:12mm 1fr 43mm;gap:5mm;border-top:1px solid #d4cabc;padding:17px 0;break-inside:avoid}.entry-index{font:23px Display,serif;color:#71582f}.summary-entry h3{font-size:20px;margin:0 0 5px}.summary-entry p{font-size:9.5px;color:#55565b}.summary-price{font-size:12px;font-variant-numeric:tabular-nums;padding-top:5px}.story.new-subject{break-before:page}.story.translation{margin-top:28px;padding-top:20px;border-top:1px solid #b08d57}.story-lead{break-inside:avoid}.story h3{margin:18px 0 10px}.story p{margin-bottom:6px}.story-title{font-size:39px}.place{font-size:12px;color:#55565b}.price-block{border-block:1px solid #d4cabc;padding:15px 0;margin:16px 0;break-inside:avoid}.price{font:30px/1.2 Display,serif;font-variant-numeric:tabular-nums;margin:5px 0 10px}.price-qualifier{font-size:10.5px}.conversion{display:flex;flex-wrap:wrap;gap:3px 12px;font-size:9.5px;margin-top:8px}.conversion strong{font-size:12px;flex-basis:100%;font-weight:400}.notice{background:#e9e2d6;padding:10px 12px;font-size:10.5px;border-inline-start:2px solid #b08d57;break-inside:avoid}.facts{display:grid;grid-template-columns:1fr 1fr;column-gap:8mm}.fact{border-top:1px solid #ded7cd;padding:7px 0;break-inside:avoid;overflow-wrap:anywhere}.fact-value{font-size:12px}.metrics{display:grid;grid-template-columns:1fr 1fr;gap:9px 8mm}.metric{padding:10px;background:#efe9df;break-inside:avoid;font-size:10.5px}.metric-number{font-size:18px;margin:6px 0;font-variant-numeric:tabular-nums}.payment{width:100%;border-collapse:collapse;margin:12px 0;font-size:10.5px}.payment th{text-align:start;font-weight:500;border-bottom:1px solid #b08d57;padding:8px}.payment td{border-bottom:1px solid #d4cabc;padding:10px 8px;vertical-align:top}.payment tr{break-inside:avoid}.payment thead{display:table-header-group}.sources{display:grid;grid-template-columns:1fr 1fr;column-gap:8mm;padding-inline-start:18px;font-size:9.5px}.sources li{padding-inline-start:5px;margin:4px 0;break-inside:avoid}.sources p{margin:2px 0}.sources a{font-size:9px}.closing-note{border-top:1px solid #b08d57;padding-top:6px;margin-top:8px;font-size:9.5px}p{orphans:3;widows:3}[lang=ar]{font-family:Arabic,Arial,sans-serif;letter-spacing:0;line-height:1.85}[lang=ar] h1,[lang=ar] h2,[lang=ar] h3{font-family:ArabicDisplay,serif;line-height:1.5}[lang=ar] h1{font-size:44px}[lang=ar] .story-title{font-size:32px}[lang=ar] h3{font-size:22px}[lang=ar] .price{font-family:Arabic,Arial,sans-serif;font-size:23px}[lang=ar] .kicker{letter-spacing:0}[lang=ar] .summary-entry h3{font-size:19px}
  </style></head><body>${cover}${summary}${stories}</body></html>`;
}

export async function renderOfficeDossier(data: DossierDTO) {
  const html = await officeDossierHtml(data);
  const browser = await chromium.launch({
    channel: process.env.PDF_BROWSER_CHANNEL ?? 'chrome',
    headless: true,
  });
  try {
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.route('**/*', (route) =>
      route.request().url().startsWith('data:') ? route.continue() : route.abort(),
    );
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    return await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
      outline: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate:
        '<div style="font:8px Arial,sans-serif;color:#55565b;width:100%;margin:0 17mm;display:flex;justify-content:space-between"><span>DARIVO · PRIVATE DOSSIER</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
    });
  } finally {
    await browser.close();
  }
}
