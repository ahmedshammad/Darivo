import { conciergeCopy, type ConciergeLocale } from '../../messages/concierge';

/** UTC is explicit and stable across server/browser; the original instant stays in dateTime. */
export function formatConciergeExpiry(
  value: string,
  locale: ConciergeLocale,
  arabicIndicDigits = false,
): string {
  // Reject missing offsets rather than silently interpreting a browser-local time.
  if (!/(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) return conciergeCopy[locale].unknown;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return conciergeCopy[locale].unknown;
  return (
    new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE' : 'en-GB', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
      numberingSystem: arabicIndicDigits ? 'arab' : 'latn',
    }).format(date) + ' UTC'
  );
}
