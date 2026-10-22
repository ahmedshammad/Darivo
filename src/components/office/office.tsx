'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { OfficeDTO, OfficeComparison, OfficePrivacy, PortfolioDTO } from '@/src/lib/office';
import type { StorySummary } from '@/src/lib/story';
import { officeCopy, type OfficeLocale } from '@/messages/office';
import { usePreferences } from '@/src/components/preferences';
import { storyCompletionDate } from '@/src/components/story/presentation';
import { OfficeCalendar } from './calendar';
import { OfficeAdvisor } from './advisor';
import {
  OfficeCard,
  OfficePrice,
  OfficeRestriction,
  OfficeSources,
  errorCopy,
  officeRequest,
} from './shared';
import { officeRef, officeRefKey, officeIntentHref } from './links';
import './office.css';
export type OfficeView =
  'portfolios' | 'comparison' | 'advisor' | 'viewings' | 'private-collection' | 'privacy';
export type OfficeQuery = { action?: string; kind?: string; id?: string; theme?: string };
export function Office({
  locale,
  access,
  initialView = 'portfolios',
  query = {},
  initialData = null,
}: {
  locale: OfficeLocale;
  access: 'client' | 'guest' | 'denied';
  initialView?: OfficeView;
  query?: OfficeQuery;
  initialData?: OfficeDTO | null;
}) {
  const t = officeCopy[locale],
    pref = usePreferences(),
    [theme, setTheme] = useState(query.theme === 'light' ? 'light' : 'dark'),
    [view, setView] = useState(initialView),
    [data, setData] = useState<OfficeDTO | null>(initialData),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [intent, setIntent] = useState<StorySummary | null>(null),
    [intentAction, setIntentAction] = useState(query.action),
    [selected, setSelected] = useState<StorySummary[]>([]),
    [comparison, setComparison] = useState<OfficeComparison | null>(null),
    [privateItems, setPrivateItems] = useState<StorySummary[] | null>(null),
    [deleteBoard, setDeleteBoard] = useState<string | null>(null),
    [reviewBoard, setReviewBoard] = useState<string | null>(null),
    [exporting, setExporting] = useState<string | null>(null);
  const intentActivated = useRef(false),
    pending = useRef(false),
    keys = useRef(new Map<string, string>()),
    [newName, setNewName] = useState(''),
    [destination, setDestination] = useState('');
  const href = (section = '') => `/${locale}/office${section ? `/${section}` : ''}?theme=${theme}`;
  const preferences = useCallback(
    () =>
      new URLSearchParams({
        currency: pref.currency,
        areaUnit: pref.unit,
        locale,
        arabicIndicDigits: pref.arabicIndicDigits ? '1' : '0',
      }).toString(),
    [pref.currency, pref.unit, pref.arabicIndicDigits, locale],
  );
  const refresh = useCallback(async () => {
    const next = await officeRequest<OfficeDTO>(`/api/v1/office?${preferences()}`);
    setData(next);
    return next;
  }, [preferences]);
  useEffect(() => {
    if (access !== 'client') return;
    const controller = new AbortController();
    officeRequest<OfficeDTO>(`/api/v1/office?${preferences()}`, 'GET', undefined, controller.signal)
      .then(setData)
      .catch((e) => {
        if (!controller.signal.aborted) {
          if (
            e instanceof Error &&
            ['unauthorized', 'forbidden', 'client_required'].includes(e.message)
          ) {
            setData(null);
            setSelected([]);
            setComparison(null);
            setIntent(null);
            setPrivateItems(null);
          }
          setError(errorCopy(e, locale));
        }
      });
    return () => controller.abort();
  }, [access, preferences, locale]);
  useEffect(() => {
    if (
      access !== 'client' ||
      !query.id ||
      !['reference-project', 'demo-unit'].includes(query.kind ?? '') ||
      !['save', 'viewing', 'enquire', 'compare'].includes(query.action ?? '')
    )
      return;
    const controller = new AbortController();
    officeRequest<StorySummary>(
      `/api/v1/office/entity?${preferences()}&${new URLSearchParams({ kind: query.kind!, id: query.id })}`,
      'GET',
      undefined,
      controller.signal,
    )
      .then((s) => {
        setIntent(s);
        // Projection refreshes may update money, but never replay a completed draft action.
        if (!intentActivated.current) {
          intentActivated.current = true;
          setIntentAction(query.action);
          if (query.action === 'save') setView('portfolios');
          if (query.action === 'compare') {
            setSelected([s]);
            setView('comparison');
          }
          if (query.action === 'viewing') setView('viewings');
          if (query.action === 'enquire') setView('advisor');
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(errorCopy(e, locale));
      });
    return () => controller.abort();
  }, [access, query.id, query.kind, query.action, preferences, locale]);
  useEffect(() => {
    if (view !== 'private-collection' || access !== 'client') return;
    const controller = new AbortController();
    officeRequest<StorySummary[]>(
      `/api/v1/office/private-collection?${preferences()}`,
      'GET',
      undefined,
      controller.signal,
    )
      .then(setPrivateItems)
      .catch((e) => {
        if (!controller.signal.aborted) {
          setPrivateItems([]);
          setError(errorCopy(e, locale));
        }
      });
    return () => controller.abort();
  }, [view, access, preferences, locale]);
  useEffect(() => {
    if (view !== 'comparison' || selected.length < 2) return;
    const controller = new AbortController();
    officeRequest<OfficeComparison>(
      `/api/v1/office/comparison?${preferences()}`,
      'POST',
      { refs: selected.map(officeRef) },
      controller.signal,
    )
      .then(setComparison)
      .catch((e) => {
        if (!controller.signal.aborted) {
          setComparison(null);
          setSelected([]);
          setError(errorCopy(e, locale));
        }
      });
    return () => controller.abort();
  }, [view, selected, preferences, locale]);
  const mutate = async (url: string, method: string, body?: Record<string, unknown>) => {
    if (pending.current) return false;
    pending.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    const signature = JSON.stringify([url, method, body]);
    let requestId = keys.current.get(signature);
    if (!requestId) {
      requestId = crypto.randomUUID();
      keys.current.set(signature, requestId);
    }
    try {
      await officeRequest(url, method, body ? { ...body, clientRequestId: requestId } : undefined);
      keys.current.delete(signature);
      // The write is confirmed even if refreshing the read model fails.
      // Do not invite a second write with a new idempotency key.
      await refresh().catch((e) => setError(errorCopy(e, locale)));
      setNotice(t.done);
      return true;
    } catch (e) {
      setError(errorCopy(e, locale));
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  const toggle = (story: StorySummary) =>
    setSelected((current) => {
      const exists = current.some(
        (s) => officeRefKey(officeRef(s)) === officeRefKey(officeRef(story)),
      );
      return exists
        ? current.filter((s) => officeRefKey(officeRef(s)) !== officeRefKey(officeRef(story)))
        : current.length < 4
          ? [...current, story]
          : current;
    });
  const selectedKey = new Set(selected.map((s) => officeRefKey(officeRef(s))));
  const currentComparison =
    comparison &&
    selected.length >= 2 &&
    comparison.entries.length === selected.length &&
    comparison.entries.every((s) => selectedKey.has(officeRefKey(officeRef(s))))
      ? comparison
      : null;
  const download = async (board: PortfolioDTO, reviewVisible = false) => {
    if (exporting) return;
    setExporting(board.id);
    setError('');
    try {
      const res = await fetch(
        `/api/v1/portfolios/${board.id}/dossier?${preferences()}${reviewVisible ? '&reviewVisible=true' : ''}`,
        { cache: 'no-store' },
      );
      if (!res.ok) {
        const body = await res.json();
        if (['portfolio_changed', 'dossier_review_required'].includes(body.error)) {
          await refresh();
          setReviewBoard(board.id);
          return;
        }
        throw new Error(body.error);
      }
      const url = URL.createObjectURL(await res.blob()),
        anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'darivo-private-dossier.pdf';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setReviewBoard(null);
    } catch (e) {
      setError(
        e instanceof Error && e.message === 'portfolio_empty'
          ? t.emptyBoard
          : e instanceof Error && e.message === 'dossier_limit'
            ? t.dossierLimit
            : t.downloadError,
      );
    } finally {
      setExporting(null);
    }
  };
  const nav: [OfficeView, string][] = [
    ['portfolios', t.portfolios],
    ['comparison', t.compare],
    ['viewings', t.viewings],
    ['advisor', t.advisor],
    ['private-collection', t.private],
    ['privacy', t.privacy],
  ];
  const units =
    data?.portfolios
      .flatMap((p) => p.items.map((i) => i.summary))
      .filter((s) => s.kind === 'DEMO_UNIT') ?? [];
  const privacyHref = href('privacy');
  const card = (story: StorySummary, board?: PortfolioDTO) => (
    <OfficeCard
      key={`${board?.id ?? ''}${story.entity.id}`}
      story={story}
      locale={locale}
      theme={theme}
    >
      <div className="of-card-actions">
        <label>
          <input
            type="checkbox"
            checked={selectedKey.has(officeRefKey(officeRef(story)))}
            disabled={!selectedKey.has(officeRefKey(officeRef(story))) && selected.length >= 4}
            onChange={() => toggle(story)}
          />
          {t.selectCompare}
        </label>
        <Link
          href={officeIntentHref(
            locale,
            story.kind === 'DEMO_UNIT' ? 'viewing' : 'enquire',
            story,
            theme,
          )}
        >
          {story.kind === 'DEMO_UNIT' ? t.requestViewing : t.enquiry}
        </Link>
        {board ? (
          <button
            disabled={busy}
            onClick={() =>
              void mutate(`/api/v1/portfolios/${board.id}/items`, 'DELETE', {
                refs: [officeRef(story)],
                version: board.version,
              })
            }
          >
            {t.remove}
          </button>
        ) : (
          <Link href={officeIntentHref(locale, 'save', story, theme)}>{t.save}</Link>
        )}
      </div>
    </OfficeCard>
  );
  return (
    <div
      className="office"
      data-testid="office"
      data-office-view={view}
      data-theme={theme}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <a className="of-skip" href="#office-main">
        {t.title}
      </a>
      <header className="of-header">
        <Link className="of-wordmark" href={`/${locale}?theme=${theme}`} lang="en">
          DARIVO<span>PRIVATE PROPERTY OFFICE</span>
        </Link>
        <nav aria-label={t.siteNavigation}>
          <Link href={`/${locale}/explore?theme=${theme}`}>{t.atlas}</Link>
          <Link href={`/${locale}/concierge?theme=${theme}`}>{t.concierge}</Link>
          <Link
            href={`/${locale === 'en' ? 'ar' : 'en'}/office${view === 'portfolios' ? '' : `/${view}`}?${new URLSearchParams({ ...query, theme })}`}
            lang={locale === 'en' ? 'ar' : 'en'}
          >
            {locale === 'en' ? 'العربية' : 'English'}
          </Link>
          <button
            onClick={() => setTheme((v) => (v === 'dark' ? 'light' : 'dark'))}
            aria-label={theme === 'dark' ? t.light : t.dark}
          >
            {theme === 'dark' ? '☼' : '☾'}
          </button>
          {access === 'client' && (
            <button
              onClick={async () => {
                const { signOut } = await import('next-auth/react');
                await signOut({ callbackUrl: `/${locale}` });
              }}
            >
              {t.signOut}
            </button>
          )}
        </nav>
      </header>
      <main id="office-main" className="of-main">
        <div className="of-intro">
          <p className="of-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
        {access !== 'client' ? (
          <section className="of-gate">
            <h2>{access === 'guest' ? t.gate : t.clientOnly}</h2>
            {access === 'guest' && (
              <>
                <p>{t.gateBody}</p>
                <Link
                  className="of-button of-primary"
                  href={`/${locale}/login?returnTo=${encodeURIComponent(`/${locale}/office?${new URLSearchParams({ ...query, theme })}`)}`}
                >
                  {t.signIn}
                </Link>
              </>
            )}
          </section>
        ) : (
          <>
            <nav className="of-tabs" aria-label={t.officeNavigation}>
              {nav.map(([id, label]) => (
                <button
                  key={id}
                  aria-current={view === id ? 'page' : undefined}
                  onClick={() => {
                    setView(id);
                    setError('');
                  }}
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="of-preferences">
              <label>
                {t.display}
                <select value={pref.currency} onChange={(e) => pref.setCurrency(e.target.value)}>
                  {['AED', 'EGP', 'USD', 'GBP', 'EUR', 'SAR'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="of-check">
                <input
                  type="checkbox"
                  checked={pref.arabicIndicDigits}
                  onChange={(e) => pref.setArabicIndicDigits(e.target.checked)}
                />
                {t.digits}
              </label>
            </div>
            {error && (
              <div className="of-error" role="alert">
                <p>{error}</p>
                <button
                  onClick={() => {
                    setError('');
                    void refresh().catch((e) => setError(errorCopy(e, locale)));
                  }}
                >
                  {t.refresh}
                </button>
              </div>
            )}
            {notice && (
              <p role="status" className="of-status">
                {notice}
              </p>
            )}
            {!data ? (
              <p role="status">{t.loading}</p>
            ) : (
              <>
                {intent && intentAction === 'save' && (
                  <section className="of-intent of-panel" data-testid="office-save-intent">
                    <p className="of-eyebrow">{t.intent}</p>
                    <h2>{intent.name[locale]}</h2>
                    <p>{intent.availability === 'ON_REQUEST' ? t.onRequest : t.demo}</p>
                    {data.privacy.doNotSave && (
                      <OfficeRestriction locale={locale} href={privacyHref} />
                    )}
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (pending.current || data.privacy.doNotSave) return;
                        let board = data.portfolios.find((p) => p.id === destination);
                        if (!board) {
                          const signature = `create:${newName.trim()}`;
                          let id = keys.current.get(signature);
                          if (!id) {
                            id = crypto.randomUUID();
                            keys.current.set(signature, id);
                          }
                          setBusy(true);
                          pending.current = true;
                          try {
                            board = await officeRequest<PortfolioDTO>(
                              '/api/v1/portfolios',
                              'POST',
                              { name: newName.trim(), clientRequestId: id },
                            );
                            setDestination(board.id);
                            await refresh();
                          } catch (error) {
                            setError(errorCopy(error, locale));
                            return;
                          } finally {
                            pending.current = false;
                            setBusy(false);
                          }
                        }
                        if (
                          await mutate(`/api/v1/portfolios/${board.id}/items`, 'POST', {
                            refs: [officeRef(intent)],
                            version: board.version,
                          })
                        ) {
                          setNotice(t.saved);
                          setIntentAction(undefined);
                        }
                      }}
                    >
                      <label>
                        {t.destination}
                        <select
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                        >
                          <option value="">{t.newBoard}</option>
                          {data.portfolios.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      {!destination && (
                        <label>
                          {t.name}
                          <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                            maxLength={80}
                          />
                        </label>
                      )}
                      <div className="of-actions">
                        <button className="of-primary" disabled={busy || data.privacy.doNotSave}>
                          {t.save}
                        </button>
                        <button type="button" onClick={() => setIntentAction(undefined)}>
                          {t.dismiss}
                        </button>
                      </div>
                    </form>
                  </section>
                )}
                {view === 'portfolios' && (
                  <section>
                    <div className="of-section-head">
                      <h2>{t.portfolios}</h2>
                      <details className="of-create">
                        <summary>{t.create}</summary>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const f = new FormData(form);
                            if (await mutate('/api/v1/portfolios', 'POST', { name: f.get('name') }))
                              form.reset();
                          }}
                        >
                          <label>
                            {t.name}
                            <input name="name" required maxLength={80} />
                          </label>
                          <button disabled={busy || data.privacy.doNotSave}>{t.create}</button>
                          {data.privacy.doNotSave && (
                            <OfficeRestriction locale={locale} href={privacyHref} />
                          )}
                        </form>
                      </details>
                    </div>
                    {!data.portfolios.length && (
                      <div className="of-empty">
                        <h3>{t.empty}</h3>
                        <p>{t.emptyBody}</p>
                        <Link href={`/${locale}/explore?theme=${theme}`}>{t.more} ↗</Link>
                      </div>
                    )}
                    {data.portfolios.map((board) => (
                      <section className="of-board" key={board.id} data-testid="office-portfolio">
                        <div className="of-board-heading">
                          <div>
                            <p className="of-eyebrow">
                              {new Intl.NumberFormat(locale, {
                                numberingSystem: pref.arabicIndicDigits ? 'arab' : 'latn',
                              }).format(board.visibleCount)}{' '}
                              · {t.selected}
                            </p>
                            <h3>{board.name}</h3>
                          </div>
                          <div className="of-actions">
                            <button
                              disabled={busy || exporting !== null || !board.items.length}
                              onClick={() => void download(board)}
                            >
                              {t.export} ↓
                            </button>
                            <details>
                              <summary>{t.rename}</summary>
                              <form
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  await mutate(`/api/v1/portfolios/${board.id}`, 'PATCH', {
                                    name: new FormData(e.currentTarget).get('name'),
                                    version: board.version,
                                  });
                                }}
                              >
                                <label>
                                  {t.name}
                                  <input
                                    name="name"
                                    defaultValue={board.name}
                                    required
                                    maxLength={80}
                                  />
                                </label>
                                <button disabled={busy || data.privacy.doNotSave}>
                                  {t.confirm}
                                </button>
                              </form>
                            </details>
                            <button onClick={() => setDeleteBoard(board.id)}>{t.delete}</button>
                          </div>
                        </div>
                        <p className="of-fine">{t.exportNote}</p>
                        {reviewBoard === board.id && (
                          <div className="of-notice" role="status">
                            <p>{t.reviewVisible}</p>
                            <button
                              disabled={exporting !== null || !board.items.length}
                              onClick={() => void download(board, true)}
                            >
                              {t.exportVisible}
                            </button>
                            <button onClick={() => setReviewBoard(null)}>{t.cancel}</button>
                          </div>
                        )}
                        {deleteBoard === board.id && (
                          <div className="of-notice">
                            <p>
                              {t.confirmDelete} <strong>{board.name}</strong>
                            </p>
                            <button
                              disabled={busy}
                              onClick={async () => {
                                if (await mutate(`/api/v1/portfolios/${board.id}`, 'DELETE'))
                                  setDeleteBoard(null);
                              }}
                            >
                              {t.confirm}
                            </button>
                            <button onClick={() => setDeleteBoard(null)}>{t.cancel}</button>
                          </div>
                        )}
                        <div className="of-board-grid">
                          {board.items.map((i) => card(i.summary, board))}
                        </div>
                        {!board.items.length && <p>{t.emptyBoard}</p>}
                      </section>
                    ))}
                  </section>
                )}
                {view === 'comparison' && (
                  <section className="of-section">
                    <h2>{t.compare}</h2>
                    <p>{t.limit}</p>
                    {selected.length >= 2 && (
                      <p className="of-fine of-comparison-hint">{t.compareScroll}</p>
                    )}
                    {selected.length < 2 && (
                      <div className="of-empty">
                        <p>{t.limit}</p>
                        <button onClick={() => setView('portfolios')}>{t.back}</button>
                        <Link href={`/${locale}/explore?theme=${theme}`}>{t.more} ↗</Link>
                      </div>
                    )}
                    {currentComparison && (
                      <div
                        className="of-comparison-scroll"
                        tabIndex={0}
                        role="region"
                        aria-label={t.compare}
                      >
                        <table className="of-comparison">
                          <caption>{t.limit}</caption>
                          <thead>
                            <tr>
                              <th scope="col">{t.evidence}</th>
                              {currentComparison.entries.map((s) => (
                                <th scope="col" key={s.entity.id}>
                                  <Link href={`/${locale}${s.storyPath}?theme=${theme}`}>
                                    {s.name[locale]}
                                  </Link>
                                  <p className="of-fine">
                                    {s.kind === 'REAL_REFERENCE_PROJECT' ? t.reference : t.demo}
                                  </p>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th scope="row">{t.price}</th>
                              {currentComparison.entries.map((s) => (
                                <td key={s.entity.id}>
                                  <OfficePrice story={s} locale={locale} />
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th scope="row">{t.location}</th>
                              {currentComparison.entries.map((s) => (
                                <td key={s.entity.id}>
                                  {s.community[locale]} · {s.city[locale]}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th scope="row">{t.completion}</th>
                              {currentComparison.entries.map((s) => (
                                <td key={s.entity.id}>
                                  {(() => {
                                    const f = s.facts.find((f) => f.key === 'completion');
                                    if (!f) return t.unknown;
                                    const exact = storyCompletionDate(
                                      f.value,
                                      locale,
                                      pref.arabicIndicDigits,
                                    );
                                    if (!exact)
                                      return (
                                        f.displayValue?.[locale] ?? String(f.value ?? t.unknown)
                                      );
                                    return (
                                      <>
                                        <time dateTime={String(f.value)}>{exact}</time>
                                        <details className="of-sources">
                                          <summary>{t.originalDate}</summary>
                                          <p>
                                            <bdi>{f.originalText ?? String(f.value)}</bdi>
                                          </p>
                                        </details>
                                      </>
                                    );
                                  })()}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th scope="row">{t.availability}</th>
                              {currentComparison.entries.map((s) => (
                                <td key={s.entity.id}>
                                  {s.availability === 'ON_REQUEST' ? t.onRequest : t.demo}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th scope="row">{t.source}</th>
                              {currentComparison.entries.map((s) => (
                                <td key={s.entity.id}>
                                  <OfficeSources story={s} locale={locale} />
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                )}
                {view === 'viewings' && (
                  <OfficeCalendar
                    locale={locale}
                    requests={data.viewings}
                    units={units}
                    intent={intentAction === 'viewing' ? intent : null}
                    privacy={data.privacy}
                    busy={busy}
                    mutate={mutate}
                    privacyHref={privacyHref}
                  />
                )}
                {view === 'advisor' && (
                  <OfficeAdvisor
                    key={`${data.advisor?.threadId ?? 'none'}:${intent?.entity.id ?? ''}`}
                    advisor={data.advisor}
                    locale={locale}
                    theme={theme}
                    privacy={data.privacy}
                    privacyHref={privacyHref}
                    intent={intentAction === 'enquire' ? intent : null}
                    busy={busy}
                    mutate={mutate}
                  />
                )}
                {view === 'private-collection' && (
                  <section className="of-section">
                    <h2>{t.private}</h2>
                    <p>{t.privateIntro}</p>
                    {privateItems === null ? (
                      <p role="status">{t.loading}</p>
                    ) : privateItems.length ? (
                      <div className="of-board-grid">{privateItems.map((s) => card(s))}</div>
                    ) : (
                      <div className="of-empty">
                        <p>{t.privateEmpty}</p>
                        <Link href={`/${locale}/profile`}>{t.verification}</Link>
                      </div>
                    )}
                  </section>
                )}
                {view === 'privacy' && (
                  <PrivacySettings
                    key={data.privacy.version}
                    value={data.privacy}
                    locale={locale}
                    onSaved={(p) => {
                      setData({ ...data, privacy: p });
                      setNotice(t.done);
                    }}
                  />
                )}
              </>
            )}
            {selected.length > 0 && (
              <aside className="of-selection" aria-label={t.selected}>
                <div>
                  <strong>
                    <bdi dir="ltr">
                      {new Intl.NumberFormat(locale, {
                        numberingSystem: pref.arabicIndicDigits ? 'arab' : 'latn',
                      }).format(selected.length)}{' '}
                      /{' '}
                      {new Intl.NumberFormat(locale, {
                        numberingSystem: pref.arabicIndicDigits ? 'arab' : 'latn',
                      }).format(4)}
                    </bdi>
                  </strong>
                  <ul>
                    {selected.map((s) => (
                      <li key={s.entity.id}>
                        <span>{s.name[locale]}</span>
                        <button
                          aria-label={`${t.removeCompare}: ${s.name[locale]}`}
                          onClick={() => toggle(s)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="of-actions">
                  <button
                    className="of-primary"
                    disabled={selected.length < 2}
                    onClick={() => setView('comparison')}
                  >
                    {t.compareNow}
                  </button>
                  <button onClick={() => setSelected([])}>{t.clear}</button>
                </div>
              </aside>
            )}
          </>
        )}
      </main>
      <footer className="of-footer">
        <span>DARIVO</span>
        <Link href={`/${locale}/privacy`}>{t.privacy}</Link>
      </footer>
    </div>
  );
}
function PrivacySettings({
  value,
  locale,
  onSaved,
}: {
  value: OfficePrivacy;
  locale: OfficeLocale;
  onSaved: (p: OfficePrivacy) => void;
}) {
  const t = officeCopy[locale],
    [draft, setDraft] = useState(value),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  return (
    <section className="of-panel of-privacy">
      <h2>{t.privacy}</h2>
      <p>{t.privacyIntro}</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          try {
            const { updatedAt, ...body } = draft;
            void updatedAt;
            const next = await officeRequest<OfficePrivacy>(
              '/api/v1/office/privacy',
              'PATCH',
              body,
            );
            setDraft(next);
            onSaved(next);
          } catch (e) {
            setError(errorCopy(e, locale));
          } finally {
            setBusy(false);
          }
        }}
      >
        {(
          [
            ['doNotSave', t.noSave],
            ['doNotShare', t.noShare],
            ['doNotBook', t.noBook],
          ] as const
        ).map(([key, label]) => (
          <label className="of-check" key={key}>
            <input
              type="checkbox"
              checked={draft[key]}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
        <button className="of-primary" disabled={busy}>
          {t.privacySave}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
    </section>
  );
}
