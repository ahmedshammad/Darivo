// Human-authored translations of the supplied observations, matched against exact source text.
// Changed source records deliberately fall back to their original wording instead of stale translations.
const translations = [
  {
    metric: 'Home sales above USD 10M, H1 2026',
    value: 'USD 5.1bn across 296 transactions (+14% value YoY, +16% volume YoY)',
    marketAr: 'دبي',
    metricAr: 'مبيعات المساكن بأكثر من 10 ملايين دولار، النصف الأول من 2026',
    valueAr: '5.1 مليار دولار عبر 296 صفقة؛ نمو القيمة 14% وعدد الصفقات 16% مقارنة بالعام السابق',
    detailAr: 'أبرز المناطق: دبي هيلز استيت (51 صفقة)، ونخلة جميرا (50 صفقة)',
  },
  {
    metric: 'Villa capital values, 12 months to June 2026',
    value: '+2% villas overall; Jumeirah Islands +17.9%, Emirates Hills +10.7%',
    marketAr: 'دبي',
    metricAr: 'القيم الرأسمالية للفلل خلال 12 شهراً حتى يونيو 2026',
    valueAr: 'ارتفاع الفلل إجمالاً 2%؛ جزر جميرا 17.9%، وتلال الإمارات 10.7%',
  },
  {
    metric: 'Top-10 developer contracted sales, H1 2026',
    value: '≈EGP 670bn (+2.9% YoY) on ≈39k units; TMG ≈EGP 219bn, Palm Hills ≈EGP 94bn',
    marketAr: 'مصر',
    metricAr: 'المبيعات التعاقدية لأكبر 10 مطورين، النصف الأول من 2026',
    valueAr:
      'نحو 670 مليار جنيه مصري، بزيادة 2.9% سنوياً، لنحو 39 ألف وحدة؛ طلعت مصطفى نحو 219 ملياراً، وبالم هيلز نحو 94 ملياراً',
    detailAr: 'حصة المناطق: شرق القاهرة 47%، الساحل الشمالي 33%، غرب القاهرة 11%، العين السخنة 7%',
  },
];
export function localizeAtlasStat(metric: string, value: string) {
  const translation = translations.find((item) => item.metric === metric && item.value === value);
  if (!translation) return {};
  const { marketAr, metricAr, valueAr, detailAr } = translation;
  return { marketAr, metricAr, valueAr, detailAr };
}
