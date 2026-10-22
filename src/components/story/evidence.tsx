'use client';
import type { GroundedFact, GroundedSource } from '@/src/lib/concierge';
import type { StorySummary, StoryTimeline } from '@/src/lib/story';
import { storyCopy, type StoryLocale } from '@/messages/story';
import { formatAmount, formatNumber } from '@/src/lib/format';
import { usePreferences } from '@/src/components/preferences';
import { storyCompletionDate } from './presentation';

function useStoryDigits() {
  const { arabicIndicDigits } = usePreferences();
  return (text: string) =>
    arabicIndicDigits ? text.replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]) : text;
}

export function StorySources({
  sources,
  locale,
}: {
  sources: GroundedSource[];
  locale: StoryLocale;
}) {
  const t = storyCopy[locale];
  const digits = useStoryDigits();
  return (
    <ul className="story-source-list">
      {sources.map((source) => (
        <li key={source.id}>
          {source.kind === 'published' ? (
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              <bdi>{source.publisher}</bdi> ↗
            </a>
          ) : (
            <strong>{t.basis[source.basis]}</strong>
          )}
          <span>
            {t.basis[source.basis]} · {t.asOf} <bdi>{digits(source.asOf.value ?? t.unknown)}</bdi>
          </span>
          <span>
            {t.retrieved} <bdi>{digits(source.retrieved.value ?? t.unknown)}</bdi>
          </span>
          {source.title && <bdi className="story-source-title">{source.title}</bdi>}
        </li>
      ))}
    </ul>
  );
}
export function StoryFact({
  fact,
  sources,
  locale,
}: {
  fact: GroundedFact;
  sources: GroundedSource[];
  locale: StoryLocale;
}) {
  const t = storyCopy[locale];
  const digits = useStoryDigits();
  const { arabicIndicDigits } = usePreferences();
  const completion =
    fact.key === 'completion' ? storyCompletionDate(fact.value, locale, arabicIndicDigits) : null;
  const original = fact.originalText ?? (completion ? String(fact.value) : null);
  const value =
    completion ??
    fact.displayValue?.[locale] ??
    (fact.value === null
      ? t.unknown
      : typeof fact.value === 'boolean'
        ? fact.value
          ? t.yes
          : t.no
        : typeof fact.value === 'number'
          ? fact.currency
            ? formatAmount(fact.value, fact.currency, locale, arabicIndicDigits)
            : formatNumber(fact.value, locale, arabicIndicDigits, 2)
          : fact.value);
  return (
    <div className="story-fact">
      <dt>{fact.label[locale]}</dt>
      <dd>
        <bdi>{value}</bdi>
        {fact.unit && !fact.currency && (
          <small> {fact.unit === 'sqm' || fact.unit === 'sqft' ? t[fact.unit] : fact.unit}</small>
        )}
        {fact.qualifier && <p role="note">{fact.qualifier[locale]}</p>}
        <small>
          {fact.provenance === 'DEMO' ? t.demo : t.sourceFact} · {t.asOf}{' '}
          <bdi>{digits(fact.asOf.value ?? t.unknown)}</bdi>
        </small>
        {(original || fact.sourceIds.length > 0) && (
          <details>
            <summary>{t.sources}</summary>
            {original && (
              <p>
                <bdi>{original}</bdi>
              </p>
            )}
            <StorySources
              sources={sources.filter((source) => fact.sourceIds.includes(source.id))}
              locale={locale}
            />
          </details>
        )}
      </dd>
    </div>
  );
}
export function StoryMoney({
  price,
  facts,
  sources,
  locale,
  compact = false,
}: {
  price: StorySummary['price'];
  facts: GroundedFact[];
  sources: GroundedSource[];
  locale: StoryLocale;
  compact?: boolean;
}) {
  const t = storyCopy[locale];
  const digits = useStoryDigits();
  const { currency, arabicIndicDigits } = usePreferences();
  if (!price) return <p className="story-on-request">{t.onRequest}</p>;
  const fact = facts.find((item) => item.id === price.factId);
  const basis = sources.find((source) => fact?.sourceIds.includes(source.id))?.basis ?? 'UNKNOWN';
  const converted = price.converted.find(
    (item) => item.money.currency === currency && currency !== price.native.currency,
  );
  return (
    <div className={`story-money${compact ? ' story-money--compact' : ''}`}>
      <span className="story-label">{t.native}</span>
      <strong>
        <bdi>
          {formatAmount(price.native.amount, price.native.currency, locale, arabicIndicDigits)}
        </bdi>
      </strong>
      {price.qualifier && <p>{price.qualifier[locale]}</p>}
      <small>
        {t.basis[basis]} · {t.asOf} <bdi>{digits(fact?.asOf.value ?? t.unknown)}</bdi>
      </small>
      {price.paymentCurrency && (
        <small>
          {t.paymentCurrency} <bdi>{price.paymentCurrency}</bdi>
        </small>
      )}
      {converted && (
        <div className="story-converted">
          <span>{t.display}</span>
          <bdi>
            {formatAmount(
              converted.money.amount,
              converted.money.currency,
              locale,
              arabicIndicDigits,
            )}
          </bdi>
          <small>
            {t.fx} · <bdi>{digits(converted.asOf.value ?? t.unknown)}</bdi>
          </small>
          <details>
            <summary>{t.calculation}</summary>
            <p dir="ltr">
              <bdi>
                {formatNumber(price.native.amount, locale, arabicIndicDigits, 2)}{' '}
                {price.native.currency} ×{' '}
                {formatNumber(converted.rate, locale, arabicIndicDigits, 8)} ={' '}
                {formatAmount(
                  converted.money.amount,
                  converted.money.currency,
                  locale,
                  arabicIndicDigits,
                )}
              </bdi>
            </p>
          </details>
        </div>
      )}
    </div>
  );
}
export function StoryPayment({
  timeline,
  locale,
}: {
  timeline: StoryTimeline;
  locale: StoryLocale;
}) {
  const t = storyCopy[locale];
  const { arabicIndicDigits } = usePreferences();
  if (timeline.status === 'UNAVAILABLE')
    return (
      <div className="story-unavailable" role="note">
        <h3>{t.payment}</h3>
        <p>{timeline.subjectName[locale]}</p>
        <p>{timeline.reason[locale]}</p>
      </div>
    );
  const value = timeline.component;
  return (
    <div className="story-payment" data-testid="story-payment">
      <header>
        <h3>{t.payment}</h3>
        <p>
          <bdi>{value.subjectName?.[locale] ?? value.entity.id}</bdi>
        </p>
        <small>{value.mode === 'DEMO_ESTIMATE' ? t.demo : t.sourceFact}</small>
      </header>
      <StoryMoney price={value.price} facts={value.facts} sources={value.sources} locale={locale} />
      <ol>
        {value.schedule.map((step) => (
          <li key={step.id}>
            <span className="story-payment-percent">
              <bdi>{formatNumber(step.percent, locale, arabicIndicDigits)}%</bdi>
            </span>
            <h4>{step.label[locale]}</h4>
            <bdi>
              {formatAmount(
                (value.price.native.amount * step.percent) / 100,
                value.price.native.currency,
                locale,
                arabicIndicDigits,
              )}
            </bdi>
            <details>
              <summary>{t.originalTiming}</summary>
              <p>
                <bdi>{step.timing}</bdi>
              </p>
            </details>
          </li>
        ))}
      </ol>
      <details>
        <summary>{t.sources}</summary>
        <StorySources sources={value.sources} locale={locale} />
      </details>
    </div>
  );
}
