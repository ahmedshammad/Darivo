'use client';
import { useState } from 'react';
import type { OfficePrivacy, ViewingDTO } from '@/src/lib/office';
import type { StorySummary } from '@/src/lib/story';
import { slotToIso } from '@/src/lib/timezone';
import { usePreferences } from '@/src/components/preferences';
import { officeCopy, type OfficeLocale } from '@/messages/office';
import { officeDate, OfficeRestriction } from './shared';
const zones = ['Asia/Dubai', 'Africa/Cairo', 'Europe/London'] as const;
type Zone = (typeof zones)[number];
export function OfficeCalendar({
  locale,
  requests,
  units,
  intent,
  privacy,
  busy,
  mutate,
  privacyHref,
}: {
  locale: OfficeLocale;
  requests: ViewingDTO[];
  units: StorySummary[];
  intent?: StorySummary | null;
  privacy: OfficePrivacy;
  busy: boolean;
  mutate: (url: string, method: string, body?: Record<string, unknown>) => Promise<boolean>;
  privacyHref: string;
}) {
  const t = officeCopy[locale],
    pref = usePreferences();
  const [zone, setZone] = useState<Zone>('Asia/Dubai'),
    [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7)),
    [date, setDate] = useState('');
  const [preview, setPreview] = useState<{
      unitId: string;
      localSlots: string[];
      timezone: Zone;
      mode: string;
      instants: string[];
    } | null>(null),
    [error, setError] = useState('');
  const candidates = [
    ...new Map(
      [...(intent?.kind === 'DEMO_UNIT' ? [intent] : []), ...units].map((s) => [s.entity.id, s]),
    ).values(),
  ];
  const [year, m] = month.split('-').map(Number),
    days = new Date(Date.UTC(year, m, 0)).getUTCDate(),
    offset = (new Date(Date.UTC(year, m - 1, 1)).getUTCDay() + 6) % 7;
  const dateKey = (instant: string) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(instant));
  const shown = requests.filter((r) => !date || r.slots.some((s) => dateKey(s) === date));
  const blocked = privacy.doNotSave || privacy.doNotShare || privacy.doNotBook;
  return (
    <section className="of-section" aria-labelledby="of-calendar-title">
      <p className="of-eyebrow">{t.viewings}</p>
      <h2 id="of-calendar-title">{t.calendar}</h2>
      <p className="of-muted">{t.calendarIntro}</p>
      <div className="of-calendar-layout">
        <div>
          <label>
            {t.timezone}
            <select
              value={zone}
              onChange={(e) => {
                setZone(e.target.value as Zone);
                setPreview(null);
              }}
            >
              {zones.map((z) => (
                <option key={z} value={z}>
                  {t.zones[z]} · {z}
                </option>
              ))}
            </select>
          </label>
          <div className="of-calendar-head">
            <button
              aria-label={t.previousMonth}
              onClick={() => {
                setMonth(new Date(Date.UTC(year, m - 2, 1)).toISOString().slice(0, 7));
                setDate('');
              }}
            >
              ‹
            </button>
            <h3>
              {new Intl.DateTimeFormat(locale, {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
                numberingSystem: pref.arabicIndicDigits ? 'arab' : 'latn',
              }).format(new Date(`${month}-01T00:00:00Z`))}
            </h3>
            <button
              aria-label={t.nextMonth}
              onClick={() => {
                setMonth(new Date(Date.UTC(year, m, 1)).toISOString().slice(0, 7));
                setDate('');
              }}
            >
              ›
            </button>
          </div>
          <div className="of-calendar-grid">
            {Array.from({ length: 7 }, (_, i) => (
              <span className="of-fine" key={`w${i}`}>
                {new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(
                  new Date(Date.UTC(2024, 0, 1 + i)),
                )}
              </span>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <span key={`blank${i}`} />
            ))}
            {Array.from({ length: days }, (_, i) => {
              const key = `${month}-${String(i + 1).padStart(2, '0')}`,
                count = requests.filter((r) => r.slots.some((s) => dateKey(s) === key)).length;
              return (
                <button
                  key={key}
                  aria-pressed={date === key}
                  onClick={() => setDate(date === key ? '' : key)}
                  aria-label={`${new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${key}T12:00:00Z`))} · ${t.viewings}: ${count}`}
                >
                  <span>
                    {new Intl.NumberFormat(locale, {
                      numberingSystem: pref.arabicIndicDigits ? 'arab' : 'latn',
                    }).format(i + 1)}
                  </span>
                  {count > 0 && <small>{count}</small>}
                </button>
              );
            })}
          </div>
          {date && (
            <button className="of-text-button" onClick={() => setDate('')}>
              {t.allDates}
            </button>
          )}
          <div className="of-agenda">
            {!shown.length ? (
              <p className="of-muted">{t.noViewings}</p>
            ) : (
              shown.map((r) => (
                <article key={r.id}>
                  <h3>{r.subject.name[locale]}</h3>
                  <p className="of-badge">
                    {t.statuses[r.status]} · {t.modes[r.mode]}
                  </p>
                  <ul>
                    {r.slots.map((s) => (
                      <li key={s}>
                        <time dateTime={s}>
                          {officeDate(s, locale, zone, pref.arabicIndicDigits)}
                        </time>{' '}
                        · {t.zones[zone]}
                      </li>
                    ))}
                  </ul>
                  {r.confirmedSlot && (
                    <p>
                      {t.confirmedTime}:{' '}
                      {officeDate(r.confirmedSlot, locale, zone, pref.arabicIndicDigits)}
                    </p>
                  )}
                  {['REQUESTED', 'CONFIRMED'].includes(r.status) && (
                    <button
                      disabled={busy}
                      onClick={() => void mutate(`/api/v1/office/viewings/${r.id}`, 'DELETE')}
                    >
                      {t.cancelRequest}
                    </button>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
        <div className="of-panel">
          <h3>{t.requestViewing}</h3>
          {blocked && <OfficeRestriction locale={locale} href={privacyHref} />}
          {candidates.length ? (
            <form
              onChange={() => {
                setPreview(null);
                setError('');
              }}
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  const f = new FormData(e.currentTarget),
                    localSlots = ['slot', 'slot2', 'slot3']
                      .map((k) => String(f.get(k) ?? ''))
                      .filter(Boolean),
                    instants = localSlots.map((s) => slotToIso(s, zone));
                  if (
                    instants.some(
                      (s) =>
                        Date.parse(s) <= Date.now() || Date.parse(s) > Date.now() + 366 * 86400000,
                    )
                  )
                    throw Error();
                  setPreview({
                    unitId: String(f.get('unit')),
                    localSlots,
                    timezone: zone,
                    mode: String(f.get('mode')),
                    instants,
                  });
                } catch {
                  setError(t.timeError);
                }
              }}
            >
              <label>
                {t.unit}
                <select name="unit" defaultValue={intent?.entity.id}>
                  {candidates.map((s) => (
                    <option key={s.entity.id} value={s.entity.id}>
                      {s.name[locale]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t.mode}
                <select name="mode">
                  <option value="in_person">{t.modes.in_person}</option>
                  <option value="video">{t.modes.video}</option>
                </select>
              </label>
              {['slot', 'slot2', 'slot3'].map((name, i) => (
                <label key={name}>
                  {i ? t.alternative : t.preferred}
                  <input name={name} type="datetime-local" required={i === 0} />
                </label>
              ))}
              <p className="of-fine">
                {t.timezone}: {t.zones[zone]} · <bdi>{zone}</bdi>
              </p>
              <button className="of-primary" disabled={busy || blocked}>
                {t.reviewTimes}
              </button>
            </form>
          ) : (
            <p>{t.emptyBody}</p>
          )}
          {error && <p role="alert">{error}</p>}
          {preview && (
            <section className="of-time-review" aria-label={t.timeReview}>
              <h4>{t.timeReview}</h4>
              {preview.instants.map((s) => (
                <ul key={s}>
                  {zones.map((z) => (
                    <li key={z}>
                      {t.zones[z]}:{' '}
                      <time dateTime={s}>{officeDate(s, locale, z, pref.arabicIndicDigits)}</time>
                    </li>
                  ))}
                </ul>
              ))}
              <p>{t.calendarIntro}</p>
              <button
                className="of-primary"
                disabled={busy || blocked}
                onClick={async () => {
                  const { instants, ...body } = preview;
                  void instants;
                  if (await mutate('/api/v1/office/viewings', 'POST', body)) setPreview(null);
                }}
              >
                {t.confirmTimes}
              </button>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
