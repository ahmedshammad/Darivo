import type { StoryLocale } from '@/messages/story';
/** Format only an exact timestamp; never turn a reported year/quarter into a guessed date. */
export function storyCompletionDate(
  value: unknown,
  locale: StoryLocale,
  arabicIndicDigits = false,
): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value))
    return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value.slice(0, 10))
    return null;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
    numberingSystem: arabicIndicDigits ? 'arab' : 'latn',
  }).format(date);
}
