'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import { TYPES, FX } from '@/src/lib/catalog';
import type { PropertyDTO } from '@/src/server/db/properties';
import type { Brief } from '@/src/server/ai/schema';
export type Inbox = {
  clients: {
    id: string;
    email: string;
    verification: string;
    brief: { data: unknown } | null;
    shortlists: { id: string; name: string; items: { propertyId: string }[] }[];
    notes: { id: string; content: string }[];
  }[];
  viewings: {
    id: string;
    status: string;
    mode: string;
    slots: string[];
    timezone: string;
    user: { email: string };
    property: { translations: { locale: string; title: string }[] };
  }[];
  handoffs: { id: string; reason: string; status: string; user: { email: string } }[];
  privateProperties: { id: string; translations: { locale: string; title: string }[] }[];
  grants: { id: string; userId: string; propertyId: string }[];
};
export function Advisor({ inbox }: { inbox: Inbox }) {
  const t = useTranslations(),
    locale = useLocale(),
    router = useRouter(),
    [message, setMessage] = useState('');
  const [clientId, setClientId] = useState(inbox.clients[0]?.id ?? '');
  const client = inbox.clients.find((c) => c.id === clientId);
  async function act(data: unknown, success = 'saved') {
    const r = await fetch('/api/v1/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setMessage(r.ok ? success : 'staffError');
    if (r.ok) router.refresh();
  }
  const brief = client?.brief?.data as Brief | undefined;
  return (
    <div className="shell page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t('advisor')}</p>
          <h1 className="search-title">{t('advisorTitle')}</h1>
          <p className="muted">{t('advisorIntro')}</p>
        </div>
        <ShieldCheck size={32} />
      </div>
      {message && (
        <p className="staff-status" role="status">
          {t(message)}
        </p>
      )}
      <div className="staff-grid">
        <section className="panel stack">
          <h3>{t('clients')}</h3>
          <label>
            {t('clientId')}
            <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {inbox.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.email}
                </option>
              ))}
            </select>
          </label>
          {client && (
            <>
              <span className="tag">{t(client.verification)}</span>
              <h3>{t('brief')}</h3>
              {brief ? (
                <dl className="data-list">
                  {Object.entries(brief.filters ?? {}).map(([k, v]) => (
                    <div key={k}>
                      <dt>
                        {t(k === 'maxPrice' ? 'maxPrice' : k === 'minPrice' ? 'minPrice' : k)}
                      </dt>
                      <dd>
                        {Array.isArray(v) ? v.map((x) => t(String(x))).join(' · ') : String(v)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="small muted">{t('briefEmpty')}</p>
              )}
              <h3>{t('shortlists')}</h3>
              {client.shortlists.map((s) => (
                <p key={s.id} className="small">
                  {s.name} · {s.items.length}
                </p>
              ))}
              <form
                className="stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  void act({ action: 'note', clientId, content: form.get('content') }, 'noteSaved');
                  e.currentTarget.reset();
                }}
              >
                <label>
                  {t('note')}
                  <textarea name="content" required maxLength={2000} rows={3} />
                </label>
                <p className="small muted">{t('privateNoteNotice')}</p>
                <button className="button button-outline">{t('save')}</button>
              </form>
              {client.notes.map((n) => (
                <p className="private-note small" key={n.id}>
                  {n.content}
                </p>
              ))}
              <form
                className="stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  void act(
                    {
                      action: 'suggest',
                      clientId,
                      propertyId: f.get('propertyId'),
                      shortlistName: f.get('name'),
                    },
                    'suggestionSaved',
                  );
                }}
              >
                <h3>{t('suggest')}</h3>
                <label>
                  {t('propertyId')}
                  <input name="propertyId" required placeholder="property-002" />
                </label>
                <label>
                  {t('shortlistName')}
                  <input name="name" required defaultValue={t('suggestedShortlist')} />
                </label>
                <button className="button button-primary">
                  {t('suggest')}
                  <ArrowUpRight size={16} />
                </button>
              </form>
            </>
          )}
        </section>
        <div className="stack">
          <section className="panel stack">
            <h3>{t('viewings')}</h3>
            {inbox.viewings.length ? (
              inbox.viewings.map((v) => (
                <article className="inbox-item stack" key={v.id}>
                  <div>
                    <p>{v.property.translations.find((tr) => tr.locale === locale)?.title}</p>
                    <p className="small muted">{v.user.email}</p>
                  </div>
                  <div className="row">
                    <span className="tag">{t(v.status)}</span>
                    <span className="small">{t(v.mode)}</span>
                  </div>
                  <p className="small">
                    {v.slots
                      .map((s) => new Date(s).toLocaleString(locale, { timeZone: v.timezone }))
                      .join(' · ')}{' '}
                    ({v.timezone})
                  </p>
                  <label>
                    {t('status')}
                    <select
                      value={v.status}
                      onChange={(e) =>
                        void act({ action: 'viewing', id: v.id, status: e.target.value })
                      }
                    >
                      <option value="REQUESTED" disabled>
                        {t('REQUESTED')}
                      </option>
                      {['CONFIRMED', 'DECLINED', 'CANCELLED'].map((s) => (
                        <option value={s} key={s}>
                          {t(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                </article>
              ))
            ) : (
              <p className="muted">{t('noInbox')}</p>
            )}
          </section>
          <section className="panel stack">
            <h3>{t('handoffs')}</h3>
            {inbox.handoffs.length ? (
              inbox.handoffs.map((h) => (
                <article className="inbox-item stack" key={h.id}>
                  <p className="small muted">{h.user.email}</p>
                  <p>{h.reason}</p>
                  <div className="row">
                    <span className="tag">{t(h.status)}</span>
                    {h.status === 'OPEN' && (
                      <button
                        className="button button-outline"
                        onClick={() =>
                          void act({ action: 'handoff', id: h.id, status: 'RESOLVED' })
                        }
                      >
                        {t('resolve')}
                      </button>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <p className="muted">{t('noInbox')}</p>
            )}
          </section>
          <section className="panel stack">
            <h3>{t('privateGrants')}</h3>
            <form
              className="stack"
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const r = await fetch('/api/v1/grants', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: clientId, propertyId: f.get('propertyId') }),
                });
                setMessage(r.ok ? 'grantSaved' : 'staffError');
                if (r.ok) router.refresh();
              }}
            >
              <label>
                {t('propertyId')}
                <select name="propertyId">
                  {inbox.privateProperties.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.translations.find((tr) => tr.locale === locale)?.title} · {p.id}
                    </option>
                  ))}
                </select>
              </label>
              <button className="button button-outline">{t('grant')}</button>
            </form>
            {inbox.grants
              .filter((g) => g.userId === clientId)
              .map((g) => (
                <div className="row" key={g.id}>
                  <span className="small">{g.propertyId}</span>
                  <button
                    className="button button-ghost"
                    onClick={async () => {
                      const r = await fetch('/api/v1/grants', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: g.userId, propertyId: g.propertyId }),
                      });
                      setMessage(r.ok ? 'grantSaved' : 'staffError');
                      if (r.ok) router.refresh();
                    }}
                  >
                    {t('revoke')}
                  </button>
                </div>
              ))}
          </section>
        </div>
      </div>
    </div>
  );
}
export type AdminData = {
  properties: PropertyDTO[];
  developers: Record<string, unknown>[];
  communities: Record<string, unknown>[];
  cities: Record<string, unknown>[];
  media: Record<string, unknown>[];
  users: Record<string, unknown>[];
  audit: Record<string, unknown>[];
  analytics: {
    properties: number;
    users: number;
    events: { kind: string; _count: number }[];
    areas: { areaId: string | null; _count: number }[];
  };
};
type Field = {
  name: string;
  type?: 'number' | 'textarea' | 'checkbox' | 'date';
  options?: { value: string; label: string }[];
  optional?: boolean;
};
export function Admin({ data }: { data: AdminData }) {
  const t = useTranslations(),
    locale = useLocale(),
    router = useRouter();
  const [resource, setResource] = useState('properties'),
    [selected, setSelected] = useState(''),
    [status, setStatus] = useState(''),
    [deleting, setDeleting] = useState(false);
  const resources = [
    'properties',
    'users',
    'developers',
    'communities',
    'media',
    'analytics',
    'audit',
  ];
  const records: Record<string, unknown>[] =
    resource === 'properties'
      ? (data.properties as unknown as Record<string, unknown>[])
      : resource === 'analytics'
        ? []
        : data[resource as 'developers'];
  const record = records.find((r) => r.id === selected);
  const options = (values: readonly string[]) => values.map((v) => ({ value: v, label: t(v) }));
  const names = (rows: Record<string, unknown>[]) =>
    rows.map((r) => ({
      value: String(r.id),
      label: String(r[locale === 'ar' ? 'nameAr' : 'nameEn'] ?? r.id),
    }));
  let fields: Field[] = [];
  let values: Record<string, unknown> = {};
  if (resource === 'properties') {
    const p = data.properties.find((p) => p.id === selected);
    values = p
      ? {
          ...p,
          titleEn: p.translations.find((tr) => tr.locale === 'en')?.title,
          titleAr: p.translations.find((tr) => tr.locale === 'ar')?.title,
          descriptionEn: p.translations.find((tr) => tr.locale === 'en')?.description,
          descriptionAr: p.translations.find((tr) => tr.locale === 'ar')?.description,
          price: Number(p.priceMinor) / 100,
          serviceCharge: p.serviceChargeMinor / 100,
          handoverDate: p.handoverDate?.slice(0, 10),
        }
      : {
          type: 'villa',
          status: 'ready',
          currency: 'AED',
          bedrooms: 3,
          bathrooms: 4,
          areaSqm: 300,
          price: 8000000,
          serviceCharge: 18000,
          view: 'garden',
          furnishing: 'unfurnished',
          visibility: 'PUBLIC',
          verification: 'VERIFIED',
          lat: 25.1,
          lng: 55.2,
        };
    fields = [
      { name: 'titleEn' },
      { name: 'titleAr' },
      { name: 'descriptionEn', type: 'textarea' },
      { name: 'descriptionAr', type: 'textarea' },
      { name: 'communityId', options: names(data.communities) },
      { name: 'developerId', options: names(data.developers) },
      { name: 'type', options: options(TYPES) },
      { name: 'status', options: options(['ready', 'off_plan']) },
      ...['bedrooms', 'bathrooms', 'areaSqm', 'price', 'serviceCharge', 'lat', 'lng'].map(
        (name) => ({ name, type: 'number' as const }),
      ),
      { name: 'currency', options: Object.keys(FX).map((value) => ({ value, label: value })) },
      { name: 'view', options: options(['sea', 'garden', 'city']) },
      { name: 'furnishing', options: options(['furnished', 'unfurnished']) },
      { name: 'visibility', options: options(['PUBLIC', 'VERIFIED_ONLY', 'PRIVATE_INVITE']) },
      { name: 'verification', options: options(['UNVERIFIED', 'PENDING', 'VERIFIED']) },
      { name: 'permitNumber' },
      { name: 'handoverDate', type: 'date', optional: true },
      { name: 'branded', type: 'checkbox' },
    ];
  } else {
    values = record ?? {};
    if (resource === 'developers')
      fields = ['nameEn', 'nameAr', 'descriptionEn', 'descriptionAr'].map((name) => ({
        name,
        type: name.startsWith('description') ? 'textarea' : undefined,
      }));
    if (resource === 'communities')
      fields = [
        { name: 'id' },
        { name: 'nameEn' },
        { name: 'nameAr' },
        { name: 'cityId', options: names(data.cities) },
        { name: 'lat', type: 'number' },
        { name: 'lng', type: 'number' },
      ];
    if (resource === 'media')
      fields = [
        {
          name: 'propertyId',
          options: data.properties.map((p) => ({
            value: p.id,
            label: p.translations.find((tr) => tr.locale === locale)!.title,
          })),
        },
        {
          name: 'url',
          options: [0, 1, 2, 3, 4, 5].map((i) => ({
            value: `/art/property-${i}.svg`,
            label: `${t('illustration')} ${i + 1}`,
          })),
        },
        { name: 'altEn' },
        { name: 'altAr' },
        { name: 'position', type: 'number' },
      ];
    if (resource === 'users')
      fields = [
        {
          name: 'role',
          options: options(['CLIENT', 'VERIFIED_CLIENT', 'ADVISOR', 'DEVELOPER_PARTNER', 'ADMIN']),
        },
        { name: 'verification', options: options(['UNVERIFIED', 'PENDING', 'VERIFIED']) },
      ];
  }
  const recordLabel = (r: Record<string, unknown>) => {
    if (resource === 'properties')
      return (
        (r as unknown as PropertyDTO).translations.find((tr) => tr.locale === locale)?.title ??
        String(r.id)
      );
    return String(r.email ?? r[locale === 'ar' ? 'nameAr' : 'nameEn'] ?? r.altEn ?? r.id);
  };
  return (
    <div className="shell page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t('admin')}</p>
          <h1 className="search-title">{t('adminTitle')}</h1>
          <p className="muted">{t('adminIntro')}</p>
        </div>
      </div>
      <div className="staff-tabs" role="tablist">
        {resources.map((r) => (
          <button
            role="tab"
            aria-selected={r === resource}
            className={`button ${r === resource ? 'button-primary' : 'button-outline'}`}
            key={r}
            onClick={() => {
              setResource(r);
              setSelected('');
              setStatus('');
              setDeleting(false);
            }}
          >
            {t(r)}
          </button>
        ))}
      </div>
      {status && (
        <p className="staff-status" role="status">
          {t(status)}
        </p>
      )}
      {resource === 'analytics' ? (
        <>
          <div className="stats-grid">
            {[
              [t('totalInventory'), data.analytics.properties],
              [t('totalClients'), data.analytics.users],
              ...data.analytics.events.map((e) => [
                t(
                  e.kind === 'search'
                    ? 'searches'
                    : e.kind === 'consultant'
                      ? 'sessions'
                      : 'viewings',
                ),
                e._count,
              ]),
            ].map(([label, value]) => (
              <div className="panel" key={label}>
                <p className="small muted">{label}</p>
                <h2>{value}</h2>
              </div>
            ))}
          </div>
          <section className="panel stack">
            <h3>{t('topAreas')}</h3>
            {data.analytics.areas.map((a) => (
              <p key={a.areaId}>
                {String(
                  data.communities.find((c) => c.id === a.areaId)?.[
                    locale === 'ar' ? 'nameAr' : 'nameEn'
                  ] ?? a.areaId,
                )}{' '}
                · {a._count}
              </p>
            ))}
          </section>
        </>
      ) : resource === 'audit' ? (
        <div className="comparison-scroll">
          <table className="staff-table">
            <thead>
              <tr>
                {['date', 'event', 'actor', 'target'].map((k) => (
                  <th key={k}>{t(k)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.audit.map((r) => (
                <tr key={String(r.id)}>
                  <td>{new Date(String(r.createdAt)).toLocaleString(locale)}</td>
                  <td>{String(r.action)}</td>
                  <td>{String(r.actorId)}</td>
                  <td>{String(r.targetId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="panel stack">
          <div className="row">
            <label style={{ flex: 1 }}>
              {t('selectRecord')}
              <select
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setDeleting(false);
                }}
              >
                <option value="">{t(resource === 'users' ? 'selectRecord' : 'newRecord')}</option>
                {records.map((r) => (
                  <option value={String(r.id)} key={String(r.id)}>
                    {recordLabel(r)} · {String(r.id)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {(resource !== 'users' || record) && (
            <form
              key={`${resource}-${selected}-${JSON.stringify(record)}`}
              className="stack"
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget),
                  body: Record<string, unknown> = {};
                for (const field of fields) {
                  const v = f.get(field.name);
                  if (field.optional && !v) continue;
                  body[field.name] =
                    field.type === 'checkbox'
                      ? v === 'on'
                      : field.type === 'number'
                        ? Number(v)
                        : String(v ?? '');
                }
                if (selected) body.id = selected;
                if (resource === 'properties') body.amenities = f.getAll('amenities');
                const r = await fetch(`/api/v1/admin/${resource}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body),
                });
                setStatus(r.ok ? 'entitySaved' : 'staffError');
                if (r.ok) router.refresh();
              }}
            >
              <div className="form-grid">
                {fields.map((field) => (
                  <label key={field.name} className={field.type === 'checkbox' ? 'row' : ''}>
                    {field.name === 'id' ? t('target') : t(field.name)}
                    {field.options ? (
                      <select
                        name={field.name}
                        defaultValue={String(values[field.name] ?? field.options[0]?.value ?? '')}
                      >
                        {field.options.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        name={field.name}
                        defaultValue={String(values[field.name] ?? '')}
                        required
                        maxLength={3000}
                      />
                    ) : field.type === 'checkbox' ? (
                      <input
                        name={field.name}
                        type="checkbox"
                        defaultChecked={Boolean(values[field.name])}
                      />
                    ) : (
                      <input
                        name={field.name}
                        type={field.type ?? 'text'}
                        defaultValue={String(values[field.name] ?? '')}
                        required={!field.optional}
                        step={field.type === 'number' ? 'any' : undefined}
                        readOnly={field.name === 'id' && !!selected}
                      />
                    )}
                  </label>
                ))}
              </div>
              {resource === 'properties' && (
                <fieldset>
                  <legend>{t('amenities')}</legend>
                  <div className="row">
                    {['concierge', 'security', 'private_pool', 'school', 'gym', 'beach'].map(
                      (a) => (
                        <label className="row" key={a}>
                          <input
                            type="checkbox"
                            name="amenities"
                            value={a}
                            defaultChecked={
                              Array.isArray(values.amenities) && values.amenities.includes(a)
                            }
                          />
                          {t(a)}
                        </label>
                      ),
                    )}
                  </div>
                </fieldset>
              )}
              <div className="row">
                <button className="button button-primary">{t('save')}</button>
                {selected && resource !== 'users' && (
                  <button
                    type="button"
                    className="button button-ghost"
                    onClick={() => setDeleting(!deleting)}
                  >
                    {t('deleteRecord')}
                  </button>
                )}
                {deleting && (
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={async () => {
                      const r = await fetch(
                        `/api/v1/admin/${resource}?id=${encodeURIComponent(selected)}`,
                        { method: 'DELETE' },
                      );
                      setStatus(r.ok ? 'entityDeleted' : 'staffError');
                      if (r.ok) {
                        setSelected('');
                        setDeleting(false);
                        router.refresh();
                      }
                    }}
                  >
                    {t('deleteConfirm')}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
