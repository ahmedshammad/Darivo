'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePreferences } from '@/src/components/preferences';
import { formatAmount, formatNumber } from '@/src/lib/format';
import type { StorySummary } from '@/src/lib/story';
import { officeCopy, type OfficeLocale } from '@/messages/office';
import { officeMoneyTokens } from './money';

export async function officeRequest<T>(
  url: string,
  method = 'GET',
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, {
    method,
    signal,
    cache: 'no-store',
    ...(body === undefined
      ? {}
      : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'request_failed');
  return data as T;
}
export function errorCopy(error: unknown, locale: OfficeLocale) {
  const t = officeCopy[locale];
  const code = error instanceof Error ? error.message : '';
  if (['stale_version', 'idempotency_conflict', 'context_changed', 'conflict'].includes(code))
    return t.conflict;
  if (code === 'privacy_restricted') return t.restricted;
  if (code === 'advisor_unassigned') return t.noAdvisor;
  if (['not_found', 'forbidden'].includes(code)) return t.unavailable;
  if (['invalid_slots', 'invalid_local_time', 'invalid_timezone'].includes(code))
    return t.timeError;
  return t.error;
}
function OfficeMoney({
  amount,
  currency,
  locale,
  digits,
  compact,
}: {
  amount: number;
  currency: string;
  locale: OfficeLocale;
  digits: boolean;
  compact: boolean;
}) {
  if (!compact) return <bdi>{formatAmount(amount, currency, locale, digits)}</bdi>;
  return (
    <bdi className="of-compact-money">
      {officeMoneyTokens(amount, currency, locale, digits).map((token, index) => (
        <span className={`of-money-${token.kind}`} key={index}>
          {token.value}
        </span>
      ))}
    </bdi>
  );
}
export function OfficePrice({
  story,
  locale,
  compact = false,
}: {
  story: StorySummary;
  locale: OfficeLocale;
  compact?: boolean;
}) {
  const t = officeCopy[locale],
    pref = usePreferences();
  const price = story.price;
  if (!price) return <p className="of-price">{t.priceUnknown}</p>;
  return (
    <div className="of-money">
      <strong className="of-price">
        <OfficeMoney
          amount={price.native.amount}
          currency={price.native.currency}
          locale={locale}
          digits={pref.arabicIndicDigits}
          compact={compact}
        />
      </strong>
      <p className="of-fine">
        {t.native}
        {price.qualifier ? ` · ${price.qualifier[locale]}` : ''}
      </p>
      {price.paymentCurrency && (
        <p className="of-fine">
          {t.paymentCurrency} · <bdi>{price.paymentCurrency}</bdi>
        </p>
      )}
      {price.converted
        .filter(
          (c) => c.money.currency === pref.currency && c.money.currency !== price.native.currency,
        )
        .map((c) => (
          <div className="of-conversion" key={c.money.currency}>
            <OfficeMoney
              amount={c.money.amount}
              currency={c.money.currency}
              locale={locale}
              digits={pref.arabicIndicDigits}
              compact={compact}
            />
            <p className="of-fine">
              {t.fx} · {t.asOf} <bdi>{c.asOf.value ?? t.unknown}</bdi>
            </p>
            <details className="of-sources">
              <summary>{t.calculation}</summary>
              <p dir="ltr">
                <bdi>
                  {formatNumber(price.native.amount, locale, pref.arabicIndicDigits, 2)}{' '}
                  {price.native.currency} ×{' '}
                  {formatNumber(c.rate, locale, pref.arabicIndicDigits, 8)} ={' '}
                  {formatAmount(c.money.amount, c.money.currency, locale, pref.arabicIndicDigits)}
                </bdi>
              </p>
            </details>
          </div>
        ))}
    </div>
  );
}
export function OfficeSources({ story, locale }: { story: StorySummary; locale: OfficeLocale }) {
  const t = officeCopy[locale];
  return (
    <details className="of-sources">
      <summary>{t.source}</summary>
      <ul>
        {story.sources.map((source) => (
          <li key={source.id}>
            {'url' in source && source.url ? (
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.title ?? source.publisher ?? t.unknown}
              </a>
            ) : (
              <span>{source.title ?? source.publisher ?? t.unknown}</span>
            )}
            <p className="of-fine">
              {t.sourceBases[source.basis]} · {t.asOf} <bdi>{source.asOf.value ?? t.unknown}</bdi>
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}
export function OfficeCard({
  story,
  locale,
  theme,
  children,
}: {
  story: StorySummary;
  locale: OfficeLocale;
  theme: string;
  children?: React.ReactNode;
}) {
  const t = officeCopy[locale],
    media = story.media[0];
  return (
    <article className="of-card" data-testid="office-entry" data-entity-id={story.entity.id}>
      {media && (
        <figure>
          <Image
            src={media.url}
            alt={media.alt[locale]}
            loading="lazy"
            width={720}
            height={420}
            unoptimized
          />
          <figcaption>{media.caption[locale] || t.illustrative}</figcaption>
        </figure>
      )}
      <div className="of-card-body">
        <p className="of-eyebrow">
          {story.kind === 'REAL_REFERENCE_PROJECT' ? t.reference : t.demo} ·{' '}
          {story.community[locale]}
        </p>
        <h3>
          <Link href={`/${locale}${story.storyPath}?theme=${theme}`}>{story.name[locale]}</Link>
        </h3>
        <OfficePrice story={story} locale={locale} />
        <p className="of-fine">{story.availability === 'ON_REQUEST' ? t.onRequest : t.demo}</p>
        <OfficeSources story={story} locale={locale} />
        {children}
      </div>
    </article>
  );
}
export function OfficeRestriction({ locale, href }: { locale: OfficeLocale; href: string }) {
  const t = officeCopy[locale];
  return (
    <p className="of-notice" role="note">
      {t.restricted} <Link href={href}>{t.managePrivacy}</Link>
    </p>
  );
}
export function officeDate(
  value: string,
  locale: OfficeLocale,
  zone = 'Asia/Dubai',
  digits = false,
) {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE' : 'en-GB', {
    timeZone: zone,
    dateStyle: 'medium',
    timeStyle: 'short',
    numberingSystem: digits ? 'arab' : 'latn',
  }).format(new Date(value));
}
