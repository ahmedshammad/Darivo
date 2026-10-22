'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ArrowUpRight, FileDown, Heart, ShieldCheck } from 'lucide-react';
import type { PropertyDTO } from '@/src/server/db/properties';
import { FX, size } from '@/src/lib/catalog';
import { slotToIso } from '@/src/lib/timezone';
import { PropertyCard } from './property-card';
import { DisplayPreferences, usePreferences } from './preferences';
import { Price } from './price';
type Shortlist = { id: string; name: string; properties: PropertyDTO[] };
export function Shortlists({
  initial,
  selection,
}: {
  initial: Shortlist[];
  selection: PropertyDTO[];
}) {
  const t = useTranslations(),
    locale = useLocale();
  const [lists, setLists] = useState(initial),
    [selected, setSelected] = useState<string[]>([]),
    [error, setError] = useState(''),
    [saved, setSaved] = useState(false);
  async function refresh() {
    const r = await fetch('/api/v1/shortlists');
    if (r.ok) setLists(await r.json());
  }
  return (
    <div className="shell page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t('shortlists')}</p>
          <h1 className="search-title">{t('shortlistTitle')}</h1>
          <p className="muted">{t('shortlistIntro')}</p>
        </div>
        <DisplayPreferences />
      </div>
      {!!selection.length && (
        <form
          className="panel row save-selection"
          onSubmit={async (e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const r = await fetch('/api/v1/shortlists', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                shortlist_name: data.get('name'),
                property_ids: selection.map((p) => p.id),
              }),
            });
            if (r.ok) {
              await refresh();
              setSaved(true);
            } else setError(t('errorBody'));
          }}
        >
          <Heart size={22} />
          <label>
            {t('shortlistName')}
            <input name="name" defaultValue={t('defaultShortlist')} required maxLength={80} />
          </label>
          <p className="small muted">
            {selection
              .map((p) => p.translations.find((x) => x.locale === locale)?.title)
              .join(' · ')}
          </p>
          <button className="button button-primary">{t('addSelection')}</button>
          {saved && <span role="status">{t('saved')}</span>}
        </form>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {!lists.length ? (
        <div className="empty panel stack">
          <h2>{t('noShortlists')}</h2>
          <p>{t('noShortlistsBody')}</p>
          <Link className="button button-primary" href={`/${locale}/consultant`}>
            {t('consultant')}
          </Link>
        </div>
      ) : (
        lists.map((list) => (
          <section className="shortlist-section" key={list.id}>
            <div className="section-head">
              <h2>{list.name}</h2>
              <div className="row">
                <a className="button button-outline" href={`/api/v1/shortlists/${list.id}/pdf`}>
                  <FileDown size={16} />
                  {t('exportPdf')}
                </a>
                <button
                  className="button button-ghost"
                  onClick={async () => {
                    const r = await fetch(`/api/v1/shortlists/${list.id}`, { method: 'DELETE' });
                    if (r.ok) await refresh();
                    else setError(t('errorBody'));
                  }}
                >
                  {t('delete')}
                </button>
              </div>
            </div>
            <form
              className="row"
              onSubmit={async (e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const r = await fetch(`/api/v1/shortlists/${list.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: data.get('name') }),
                });
                if (r.ok) await refresh();
                else setError(t('errorBody'));
              }}
            >
              <label className="sr-only" htmlFor={`rename-${list.id}`}>
                {t('rename')}
              </label>
              <input
                id={`rename-${list.id}`}
                name="name"
                defaultValue={list.name}
                maxLength={80}
                required
              />
              <button className="button button-ghost">{t('rename')}</button>
            </form>
            <div className="grid" style={{ marginTop: 25 }}>
              {list.properties.map((p) => (
                <div key={p.id}>
                  <PropertyCard property={p} />
                  <div className="row">
                    <label className="row">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        disabled={!selected.includes(p.id) && selected.length >= 4}
                        onChange={(e) =>
                          setSelected((prev) =>
                            e.target.checked ? [...prev, p.id] : prev.filter((id) => id !== p.id),
                          )
                        }
                      />
                      {t('selectCompare')}
                    </label>
                    <button
                      className="button button-ghost small"
                      onClick={async () => {
                        await fetch(`/api/v1/shortlists/${list.id}?property=${p.id}`, {
                          method: 'DELETE',
                        });
                        await refresh();
                      }}
                    >
                      {t('remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
      {!!selected.length && (
        <div className="compare-bar">
          <span>{selected.length} / 4</span>
          <Link
            className="button button-primary"
            href={`/${locale}/compare?ids=${selected.join(',')}`}
          >
            {t('compareSelected')}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
export function Comparison({ properties }: { properties: PropertyDTO[] }) {
  const t = useTranslations(),
    locale = useLocale(),
    pref = usePreferences();
  const rows: [string, (p: PropertyDTO) => React.ReactNode][] = [
    ['community', (p) => (locale === 'ar' ? p.community.nameAr : p.community.nameEn)],
    ['type', (p) => t(p.type)],
    ['maxPrice', (p) => <Price property={p} />],
    ['bedrooms', (p) => p.bedrooms],
    [
      'areaUnit',
      (p) => `${size(p.areaSqm, pref.unit, locale, pref.arabicIndicDigits)} ${t(pref.unit)}`,
    ],
    ['status', (p) => t(p.status)],
    ['view', (p) => t(p.view)],
    ['grossYield', (p) => `${p.community.insight?.yieldLow}–${p.community.insight?.yieldHigh}%`],
    ['amenities', (p) => p.amenities.map((a) => t(a)).join(' · ')],
  ];
  return (
    <div className="shell page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t('compare')}</p>
          <h1 className="search-title">{t('compareTitle')}</h1>
          <p className="muted">{t('compareIntro')}</p>
        </div>
        <DisplayPreferences />
      </div>
      {!properties.length ? (
        <div className="empty panel">{t('compareEmpty')}</div>
      ) : (
        <div className="comparison-scroll">
          <table className="comparison">
            <thead>
              <tr>
                <th>{t('propertyFacts')}</th>
                {properties.map((p) => (
                  <th key={p.id}>
                    <Link href={`/${locale}/properties/${p.id}`}>
                      {p.translations.find((tr) => tr.locale === locale)?.title}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([key, value]) => (
                <tr key={key}>
                  <th>{t(key)}</th>
                  {properties.map((p) => (
                    <td key={p.id}>{value(p)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th>{t('viewing')}</th>
                {properties.map((p) => (
                  <td key={p.id}>
                    <Link
                      className="button button-outline"
                      href={`/${locale}/viewings?property=${p.id}`}
                    >
                      {t('viewing')}
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <p className="small muted" style={{ marginTop: 20 }}>
        {t('estimate')}
      </p>
    </div>
  );
}
export function Viewing({
  property,
  timezone = 'Asia/Dubai',
  requests,
}: {
  property: PropertyDTO | null;
  timezone?: string;
  requests: {
    id: string;
    mode: string;
    status: string;
    slots: string[];
    timezone: string;
    title: string;
  }[];
}) {
  const t = useTranslations(),
    locale = useLocale();
  const [status, setStatus] = useState(''),
    [busy, setBusy] = useState(false);
  return (
    <div className="shell page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t('viewing')}</p>
          <h1 className="search-title">{t('viewingTitle')}</h1>
          <p className="muted">{t('viewingIntro')}</p>
        </div>
      </div>
      <div className="workflow-grid">
        {property ? (
          <>
            <PropertyCard property={property} />
            <form
              className="panel stack"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                const form = new FormData(e.currentTarget);
                try {
                  const zone = String(form.get('timezone'));
                  const slots = ['slot', 'slot2', 'slot3']
                    .map((k) => String(form.get(k) ?? ''))
                    .filter(Boolean)
                    .map((s) => slotToIso(s, zone));
                  if (
                    slots.some(
                      (s) =>
                        new Date(s).getTime() <= Date.now() ||
                        new Date(s).getTime() > Date.now() + 366 * 86400000,
                    )
                  )
                    throw new Error();
                  const r = await fetch('/api/v1/viewings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      property_id: property.id,
                      preferred_slots: slots,
                      mode: form.get('mode'),
                      timezone: zone,
                    }),
                  });
                  setStatus(r.ok ? 'viewingSuccess' : 'errorBody');
                } catch {
                  setStatus('invalidSlots');
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label>
                {t('viewingMode')}
                <select name="mode">
                  <option value="in_person">{t('in_person')}</option>
                  <option value="video">{t('video')}</option>
                </select>
              </label>
              <label>
                {t('timezone')}
                <select name="timezone" defaultValue={timezone}>
                  <option>Asia/Dubai</option>
                  <option>Africa/Cairo</option>
                  <option>Europe/London</option>
                </select>
              </label>
              {['slot', 'slot2', 'slot3'].map((name, i) => (
                <label key={name}>
                  {t(i ? 'alternativeSlot' : 'preferredSlot')}
                  <input name={name} type="datetime-local" required={!i} />
                </label>
              ))}
              <button className="button button-primary" disabled={busy}>
                {t('submitViewing')}
              </button>
              {status && <p role="status">{t(status)}</p>}
            </form>
          </>
        ) : (
          <p>{t('noSelection')}</p>
        )}
      </div>
      <section className="section">
        <h2>{t('yourViewings')}</h2>
        <div className="stack" style={{ marginTop: 25 }}>
          {requests.length ? (
            requests.map((r) => (
              <article className="panel row" key={r.id}>
                <h3>{r.title}</h3>
                <span className="tag">{t(r.status)}</span>
                <span>{t(r.mode)}</span>
                <span className="small">
                  {r.slots
                    .map((s) => new Date(s).toLocaleString(locale, { timeZone: r.timezone }))
                    .join(' · ')}{' '}
                  ({r.timezone})
                </span>
              </article>
            ))
          ) : (
            <p className="muted">{t('noViewings')}</p>
          )}
        </div>
      </section>
    </div>
  );
}
type ProfileData = {
  language: string;
  currency: string;
  areaUnit: string;
  timezone: string;
  notifications: boolean;
  arabicIndicDigits?: boolean;
};
export function Profile({ profile, verification }: { profile: ProfileData; verification: string }) {
  const t = useTranslations(),
    locale = useLocale(),
    router = useRouter(),
    pref = usePreferences();
  const [status, setStatus] = useState(''),
    [verify, setVerify] = useState(verification),
    [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div className="shell page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t('profile')}</p>
          <h1 className="search-title">{t('profileTitle')}</h1>
          <p className="muted">{t('profileIntro')}</p>
        </div>
      </div>
      <div className="workflow-grid">
        <form
          className="panel stack"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const data = {
              language: String(form.get('language')),
              currency: String(form.get('currency')),
              areaUnit: String(form.get('areaUnit')),
              timezone: String(form.get('timezone')),
              notifications: form.get('notifications') === 'on',
              arabicIndicDigits: form.get('arabicIndicDigits') === 'on',
              consent: form.get('consent') === 'on',
            };
            await pref.flush();
            const r = await fetch('/api/v1/profile', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            if (r.ok) {
              pref.applySavedPreferences({
                currency: data.currency,
                unit: data.areaUnit,
                arabicIndicDigits: data.arabicIndicDigits,
              });
              setStatus('profileSaved');
              if (data.language !== locale) router.push(`/${data.language}/profile`);
            } else setStatus('errorBody');
          }}
        >
          <div className="form-grid">
            <label>
              {t('preferredLanguage')}
              <select name="language" defaultValue={profile.language}>
                <option value="en">{t('english')}</option>
                <option value="ar">{t('arabic')}</option>
              </select>
            </label>
            <label>
              {t('currency')}
              <select name="currency" defaultValue={profile.currency}>
                {Object.keys(FX).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              {t('areaUnit')}
              <select name="areaUnit" defaultValue={profile.areaUnit}>
                <option value="sqm">{t('sqm')}</option>
                <option value="sqft">{t('sqft')}</option>
              </select>
            </label>
            <label>
              {t('timezone')}
              <select name="timezone" defaultValue={profile.timezone}>
                <option>Asia/Dubai</option>
                <option>Africa/Cairo</option>
                <option>Europe/London</option>
              </select>
            </label>
          </div>
          <label className="row">
            <input
              type="checkbox"
              name="arabicIndicDigits"
              defaultChecked={profile.arabicIndicDigits ?? false}
            />
            {t('arabicIndicDigits')} <bdi>١٢٣٤٥٦٧٨٩٠</bdi>
          </label>
          <label className="row">
            <input type="checkbox" name="notifications" defaultChecked={profile.notifications} />
            {t('notifications')}
          </label>
          <label className="row">
            <input type="checkbox" name="consent" required defaultChecked />
            {t('consent')}
          </label>
          <button className="button button-primary">{t('save')}</button>
          {status && <p role="status">{t(status)}</p>}
        </form>
        <section className="panel stack">
          <ShieldCheck size={30} />
          <p className="eyebrow">{t('verification')}</p>
          <h3>{t('mockKyc')}</h3>
          <span className="tag">{t(verify)}</span>
          <p className="muted">{t('mockKycBody')}</p>
          {verify === 'UNVERIFIED' ? (
            <button
              className="button button-outline"
              onClick={async () => {
                const r = await fetch('/api/v1/verification', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ placeholder: 'synthetic-placeholder', consent: true }),
                });
                if (r.ok) {
                  setVerify('PENDING');
                  setStatus('verificationSubmitted');
                } else setStatus('errorBody');
              }}
            >
              {t('uploadPlaceholder')}
            </button>
          ) : (
            <p className="small muted">
              {t(verify === 'PENDING' ? 'pendingBody' : 'verifiedBody')}
            </p>
          )}
          <Link href={`/${locale}/viewings`}>{t('yourViewings')}</Link>
        </section>
      </div>
      <section className="panel stack" style={{ marginTop: 35 }}>
        <h3>{t('deleteAccount')}</h3>
        <p className="small muted">{t('deleteAccountBody')}</p>
        {confirmDelete ? (
          <div className="row">
            <button
              className="button button-outline"
              onClick={async () => {
                await pref.flush();
                const r = await fetch('/api/v1/profile', { method: 'DELETE' });
                if (r.ok) await signOut({ callbackUrl: `/${locale}` });
                else setStatus('errorBody');
              }}
            >
              {t('confirmDelete')}
            </button>
            <button className="button button-ghost" onClick={() => setConfirmDelete(false)}>
              {t('cancel')}
            </button>
          </div>
        ) : (
          <button
            className="button button-ghost"
            style={{ justifySelf: 'start' }}
            onClick={() => setConfirmDelete(true)}
          >
            {t('deleteAccount')}
          </button>
        )}
      </section>
    </div>
  );
}
