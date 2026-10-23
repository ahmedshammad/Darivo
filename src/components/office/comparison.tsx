'use client';

import Link from 'next/link';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { officeCopy, type OfficeLocale } from '@/messages/office';
import type { OfficeComparison as ComparisonDTO } from '@/src/lib/office';
import type { StorySummary } from '@/src/lib/story';
import { usePreferences } from '@/src/components/preferences';
import { storyCompletionDate } from '@/src/components/story/presentation';
import { officeRef, officeRefKey } from './links';
import { OfficePrice, OfficeSources } from './shared';

const entryKey = (story: StorySummary) => officeRefKey(officeRef(story));

function Completion({ story, locale }: { story: StorySummary; locale: OfficeLocale }) {
  const t = officeCopy[locale];
  const { arabicIndicDigits } = usePreferences();
  const fact = story.facts.find((candidate) => candidate.key === 'completion');
  if (!fact) return t.unknown;
  const exact = storyCompletionDate(fact.value, locale, arabicIndicDigits);
  if (!exact) return fact.displayValue?.[locale] ?? String(fact.value ?? t.unknown);
  return (
    <>
      <time dateTime={String(fact.value)}>{exact}</time>
      <details className="of-sources">
        <summary>{t.originalDate}</summary>
        <p>
          <bdi>{fact.originalText ?? String(fact.value)}</bdi>
        </p>
      </details>
    </>
  );
}

export function OfficeComparison({
  comparison,
  locale,
  theme,
}: {
  comparison: ComparisonDTO;
  locale: OfficeLocale;
  theme: string;
}) {
  const t = officeCopy[locale];
  const id = useId();
  const [mobile, setMobile] = useState(false);
  // Keep only identity in presentation state. Every rendered value comes from
  // the current authorized response, including after replacement or revocation.
  const [pairKeys, setPairKeys] = useState<[string, string]>(['', '']);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 700px)');
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const entries = comparison.entries;
  const first = entries.find((entry) => entryKey(entry) === pairKeys[0]) ?? entries[0];
  const second =
    entries.find((entry) => entryKey(entry) === pairKeys[1] && entry !== first) ??
    entries.find((entry) => entry !== first);
  if (!first || !second) return null;
  const pair = [first, second];
  const shown = mobile ? pair : entries;
  const fields: { key: string; label: string; render: (story: StorySummary) => ReactNode }[] = [
    {
      key: 'price',
      label: t.price,
      render: (story) => <OfficePrice story={story} locale={locale} compact={mobile} />,
    },
    {
      key: 'location',
      label: t.location,
      render: (story) => (
        <>
          {story.community[locale]} · {story.city[locale]}
        </>
      ),
    },
    {
      key: 'completion',
      label: t.completion,
      render: (story) => <Completion story={story} locale={locale} />,
    },
    {
      key: 'availability',
      label: t.availability,
      render: (story) => (story.availability === 'ON_REQUEST' ? t.onRequest : t.demo),
    },
    {
      key: 'source',
      label: t.source,
      render: (story) => <OfficeSources story={story} locale={locale} />,
    },
  ];

  return (
    <div className="of-comparison-view">
      {mobile && entries.length > 2 && (
        <fieldset className="of-comparison-pair">
          <legend>{t.comparisonPair}</legend>
          <p className="of-fine">{t.comparisonPairHint}</p>
          <div className="of-comparison-choices">
            {pair.map((entry, index) => (
              <label key={index}>
                {index === 0 ? t.comparisonFirst : t.comparisonSecond}
                <select
                  value={entryKey(entry)}
                  onChange={(event) => {
                    const next: [string, string] = [entryKey(first), entryKey(second)];
                    const key = event.target.value;
                    if (
                      !entries.some((candidate) => entryKey(candidate) === key) ||
                      key === next[1 - index]
                    )
                      return;
                    next[index] = key;
                    setPairKeys(next);
                  }}
                >
                  {entries.map((candidate) => (
                    <option
                      key={entryKey(candidate)}
                      value={entryKey(candidate)}
                      disabled={entryKey(candidate) === entryKey(pair[1 - index])}
                    >
                      {candidate.name[locale]}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {!mobile && <p className="of-fine of-comparison-hint">{t.compareScroll}</p>}
      <div
        className="of-comparison-scroll"
        tabIndex={mobile ? undefined : 0}
        role="region"
        aria-label={t.compare}
      >
        <table className="of-comparison" data-layout={mobile ? 'pair' : 'full'}>
          <caption>{t.comparisonCaption}</caption>
          {mobile && (
            <colgroup>
              <col />
              <col />
            </colgroup>
          )}
          <thead>
            <tr>
              {!mobile && <th scope="col">{t.evidence}</th>}
              {shown.map((story, index) => (
                <th
                  scope="col"
                  id={`${id}-subject-${index}`}
                  key={entryKey(story)}
                  data-entity-id={story.entity.id}
                >
                  <Link href={`/${locale}${story.storyPath}?theme=${theme}`}>
                    {story.name[locale]}
                  </Link>
                  <p className="of-fine">
                    {story.kind === 'REAL_REFERENCE_PROJECT' ? t.reference : t.demo}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          {fields.map((field) => (
            <tbody key={field.key} data-comparison-field={field.key}>
              {mobile && (
                <tr>
                  <th id={`${id}-${field.key}`} scope="rowgroup" colSpan={2}>
                    {field.label}
                  </th>
                </tr>
              )}
              <tr>
                {!mobile && (
                  <th id={`${id}-${field.key}`} scope="row">
                    {field.label}
                  </th>
                )}
                {shown.map((story, index) => (
                  <td
                    key={entryKey(story)}
                    data-entity-id={story.entity.id}
                    headers={`${id}-subject-${index} ${id}-${field.key}`}
                  >
                    {field.render(story)}
                  </td>
                ))}
              </tr>
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}
