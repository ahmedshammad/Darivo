import type { ConciergeBrief } from '@/src/lib/concierge';

const preferences = [
  {
    id: 'prefers-contemporary',
    pattern:
      /\bI (?:prefer|like|want) (?:a |the )?(?:contemporary|modern) (?:architecture|design)\b|(?:أفضل|احب|أحب|ابي|أبي|عايز) (?:التصميم|تصميم|عمارة) (?:العصري|عصري|حديث|الحديث)/i,
  },
  {
    id: 'dislikes-high-rise',
    pattern:
      /\bI (?:dislike|do not want|don't want|do not like|don't like) (?:a |the )?(?:high[- ]rise(?: buildings)?|towers)\b|(?:ما أحب|ما احب|ما أبي|ما ابي|لا أريد|مش بحب) (?:الأبراج|الابراج|السكن في أبراج)/i,
  },
  {
    id: 'prefers-low-rise',
    pattern:
      /\bI (?:prefer|like|want) (?:a |the )?low[- ]rise(?: buildings)?\b|(?:أفضل|أحب|احب) (?:المباني المنخفضة|مباني منخفضة)/i,
  },
] as const;

/** Deliberately narrow: explicit preference statements only, never model inferences. */
export function captureConsentedTaste(
  brief: ConciergeBrief,
  message: string,
  now = new Date().toISOString(),
): ConciergeBrief {
  if (brief.tasteMemory.consent !== 'granted' || brief.privacy.doNotSave) return brief;
  const items = new Map(brief.tasteMemory.items.map((item) => [item.id, item]));
  for (const preference of preferences) {
    const match = message.match(preference.pattern);
    if (!match || message.slice(0, match.index).trim().endsWith('?')) continue;
    items.set(preference.id, { id: preference.id, text: match[0], recordedAt: now });
  }
  return { ...brief, tasteMemory: { ...brief.tasteMemory, items: [...items.values()].slice(-30) } };
}
