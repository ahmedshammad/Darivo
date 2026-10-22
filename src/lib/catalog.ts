export const AREAS = [
  ['palm-jumeirah', 'Dubai', 'دبي', 'Palm Jumeirah', 'نخلة جميرا', 25.112, 55.139, 'AE'],
  ['dubai-hills', 'Dubai', 'دبي', 'Dubai Hills Estate', 'دبي هيلز', 25.111, 55.254, 'AE'],
  ['downtown', 'Dubai', 'دبي', 'Downtown', 'وسط دبي', 25.194, 55.276, 'AE'],
  ['emirates-hills', 'Dubai', 'دبي', 'Emirates Hills', 'تلال الإمارات', 25.068, 55.169, 'AE'],
  ['jumeirah-bay', 'Dubai', 'دبي', 'Jumeirah Bay', 'خليج جميرا', 25.196, 55.23, 'AE'],
  ['dubai-marina', 'Dubai', 'دبي', 'Dubai Marina', 'مرسى دبي', 25.08, 55.14, 'AE'],
  ['business-bay', 'Dubai', 'دبي', 'Business Bay', 'الخليج التجاري', 25.185, 55.266, 'AE'],
  ['saadiyat', 'Abu Dhabi', 'أبوظبي', 'Saadiyat Island', 'جزيرة السعديات', 24.538, 54.434, 'AE'],
  ['al-reem', 'Abu Dhabi', 'أبوظبي', 'Al Reem Island', 'جزيرة الريم', 24.495, 54.408, 'AE'],
  ['yas', 'Abu Dhabi', 'أبوظبي', 'Yas Island', 'جزيرة ياس', 24.494, 54.603, 'AE'],
  ['new-cairo', 'Cairo', 'القاهرة', 'New Cairo', 'القاهرة الجديدة', 30.017, 31.481, 'EG'],
  ['sheikh-zayed', 'Giza', 'الجيزة', 'Sheikh Zayed', 'الشيخ زايد', 30.03, 30.98, 'EG'],
  ['new-capital', 'Cairo', 'القاهرة', 'New Capital', 'العاصمة الإدارية', 30.019, 31.745, 'EG'],
  [
    'north-coast',
    'North Coast',
    'الساحل الشمالي',
    'North Coast',
    'الساحل الشمالي',
    30.84,
    28.95,
    'EG',
  ],
  ['el-gouna', 'Red Sea', 'البحر الأحمر', 'El Gouna', 'الجونة', 27.396, 33.679, 'EG'],
  ['sokhna', 'Suez', 'السويس', 'Sokhna', 'العين السخنة', 29.6, 32.33, 'EG'],
] as const;
export const FX: Record<string, number> = {
  AED: 1,
  EGP: 13.5,
  USD: 0.2723,
  EUR: 0.25,
  SAR: 1.021,
  GBP: 0.209,
};
export const FX_DATE = '2026-10-01';
export const TYPES = ['apartment', 'villa', 'townhouse', 'penthouse', 'plot', 'mansion'] as const;
export const typeAr: Record<string, string> = {
  apartment: 'شقة',
  villa: 'فيلا',
  townhouse: 'تاون هاوس',
  penthouse: 'بنتهاوس',
  plot: 'قطعة أرض',
  mansion: 'قصر',
};
export function money(aed: number, currency = 'AED', locale = 'en') {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(aed * (FX[currency] ?? 1));
}
export function size(sqm: number, unit = 'sqm', locale = 'en') {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    maximumFractionDigits: 0,
  }).format(unit === 'sqft' ? sqm * 10.7639 : sqm);
}
