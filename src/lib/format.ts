/** Formatting only: the amount and original currency are never converted here. */
export function formatAmount(
  amount: number,
  currency: string,
  locale = 'en',
  arabicIndicDigits = false,
) {
  return isolate(
    new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
      style: 'currency',
      currency,
      currencyDisplay: 'code',
      numberingSystem: arabicIndicDigits ? 'arab' : 'latn',
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount),
  );
}
export function formatNumber(
  value: number,
  locale = 'en',
  arabicIndicDigits = false,
  maximumFractionDigits = 0,
) {
  return isolate(
    new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
      numberingSystem: arabicIndicDigits ? 'arab' : 'latn',
      maximumFractionDigits,
    }).format(value),
  );
}
/** Unicode first-strong isolate keeps mixed-script amounts intact in text and PDFs. */
function isolate(value: string) {
  return `\u2068${value}\u2069`;
}
