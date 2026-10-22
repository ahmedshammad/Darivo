import type { StorySummary } from '@/src/lib/story';
import type { OfficeEntityRef } from '@/src/lib/office';
export type OfficeAction = 'save' | 'viewing' | 'enquire' | 'compare';
export function officeRef(story: StorySummary): OfficeEntityRef {
  if (story.kind === 'DEMO_PROJECT') throw new Error('select_unit');
  return {
    kind: story.kind === 'DEMO_UNIT' ? 'demo-unit' : 'reference-project',
    id: story.entity.id,
  };
}
export function officeIntentHref(
  locale: string,
  action: OfficeAction,
  story: StorySummary,
  theme = 'dark',
) {
  const ref = officeRef(story);
  return `/${locale}/office?${new URLSearchParams({ action, kind: ref.kind, id: ref.id, theme })}`;
}
export function officeRefKey(ref: OfficeEntityRef) {
  return `${ref.kind}:${ref.id}`;
}
