'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun, ArrowUpRight, ArrowRight, Check } from 'lucide-react';
import { designCopy, type DesignLocale } from '@/messages/design';
import { FX, FX_DATE } from '@/src/lib/catalog';
import {
  DigitsContext,
  formatDesignDigits,
  BottomSheet,
  BriefPanel,
  CommandPalette,
  ComparisonTable,
  ConciergeComposer,
  EmptyState,
  ErrorState,
  LayerChip,
  LightColumn,
  LoadingState,
  PaymentTimeline,
  Price,
  ProjectCard,
  SourceChip,
  StatBlock,
  TrustBadge,
  Command,
  type BriefValue,
  type ProjectSpecimen,
} from './index';
import '@/src/styles/design-system.css';

export function DesignGuide({
  locale,
  initialTheme,
}: {
  locale: DesignLocale;
  initialTheme: 'dark' | 'light';
}) {
  const t = designCopy[locale];
  const [digits, setDigits] = useState(false);
  const [currency, setCurrency] = useState<'AED' | 'USD' | 'EGP'>('AED');
  const rates = FX;
  const [theme, setTheme] = useState(initialTheme);
  const [reply, setReply] = useState('');
  const [sheet, setSheet] = useState(false);
  const [palette, setPalette] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const [layer, setLayer] = useState('beaches');
  const [brief, setBrief] = useState<BriefValue>({
    purpose: t.purposeValue,
    place: t.placeValue,
    budget: t.budgetValue,
    timeline: t.timelineValue,
    priority: t.priorityValue,
    dealbreakers: t.dealbreakersValue,
  });
  const chapters = [
    { id: 'conversation', label: t.conversationTitle },
    { id: 'recommendation', label: t.recommendationTitle },
    { id: 'spatial', label: t.spatialTitle },
    { id: 'evidence', label: t.evidenceTitle },
    { id: 'states', label: t.statesTitle },
  ];
  function scroll(id: string) {
    const section = document.getElementById(id);
    section?.querySelector<HTMLHeadingElement>('h2')?.focus({ preventScroll: true });
    section?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }
  useEffect(() => {
    const listener = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPalette((open) => !open);
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
  const project: ProjectSpecimen = {
    id: 'design-tidal-house',
    name: t.projectName,
    location: t.projectLocation,
    basis: 'demo',
    amount: 20000000,
    currency: 'AED',
    reason: t.reason,
    tradeoff: t.tradeoff,
  };
  return (
    <DigitsContext.Provider value={digits}>
      <div className="dv-system" data-theme={theme} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <a className="dv-skip" href="#main">
          {t.system}
        </a>
        <header className="dv-header">
          <a className="dv-wordmark" href={`/${locale}/design`}>
            DARIVO
          </a>
          <span className="dv-header-label">
            {t.system} <i /> 01
          </span>
          <div className="dv-header-actions">
            <button
              id="design-command-trigger"
              className="dv-command-trigger"
              onClick={() => setPalette(true)}
              aria-label={t.openCommands}
            >
              <Command aria-hidden="true" />
              <kbd> K</kbd>
            </button>
            <a
              className="dv-locale"
              href={`/${locale === 'en' ? 'ar' : 'en'}/design?theme=${theme}`}
              lang={locale === 'en' ? 'ar' : 'en'}
            >
              {t.language}
            </a>
            <label className="dv-digits" title={t.digitsControl}>
              <input
                id="design-digits"
                type="checkbox"
                checked={digits}
                onChange={(event) => setDigits(event.target.checked)}
                aria-label={t.digitsControl}
              />
              <bdi>١٢٣</bdi>
            </label>
            <button
              id="design-theme"
              className="dv-icon"
              aria-label={t.theme}
              onClick={() => {
                const next = theme === 'dark' ? 'light' : 'dark';
                setTheme(next);
                history.replaceState(null, '', `?theme=${next}`);
              }}
            >
              {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
          </div>
        </header>
        <main id="main">
          <section className="dv-intro">
            <div className="dv-intro-copy">
              <p className="dv-eyebrow">{t.eyebrow}</p>
              <h1>{t.title}</h1>
              <p className="dv-lede">{t.intro}</p>
              <a className="dv-text-button" href="#conversation">
                {t.jump}
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
            <aside className="dv-foundation" aria-label={t.tokens}>
              <span className="dv-eyebrow">{t.colourTitle}</span>
              <div className="dv-palette-swatches">
                <span style={{ background: '#0B0B0C', color: '#F7F4EE' }}>
                  <b>Noir</b>
                  <small>#0B0B0C</small>
                </span>
                <span style={{ background: '#E9E2D6', color: '#16171A' }}>
                  <b>Sand</b>
                  <small>#E9E2D6</small>
                </span>
                <span style={{ background: '#B08D57', color: '#16171A' }}>
                  <b>Bronze</b>
                  <small>#B08D57</small>
                </span>
              </div>
              <div className="dv-type-specimen">
                <span aria-hidden="true">Aa</span>
                <span lang="ar" aria-hidden="true">
                  أب
                </span>
              </div>
              <p>{t.typography}</p>
              <span className="dv-foundation-rule" />
              <small>{t.motif}</small>
            </aside>
          </section>
          <nav className="dv-index" aria-label={t.jump}>
            {chapters.map((chapter, index) => (
              <a key={chapter.id} href={`#${chapter.id}`}>
                <bdi>0{index + 1}</bdi>
                <span>{chapter.label}</span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            ))}
          </nav>
          <section id="conversation" className="dv-chapter">
            <div className="dv-chapter-heading">
              <p className="dv-eyebrow">{t.chapter1}</p>
              <h2 tabIndex={-1}>{t.conversationTitle}</h2>
              <p>{t.conversationBody}</p>
            </div>
            <div className="dv-conversation-stage">
              <div className="dv-conversation-main">
                <span className="dv-marginal">01 / 16</span>
                <p className="dv-composer-question">{t.composerQuestion}</p>
                <ConciergeComposer id="design-composer" locale={locale} onSubmit={setReply} />
                {reply ? (
                  <div className="dv-demo-response" role="status">
                    <TrustBadge basis="demo" locale={locale} />
                    <p>{t.demoReply}</p>
                    <blockquote>{reply}</blockquote>
                  </div>
                ) : (
                  <p className="dv-fine">{t.smallPrint}</p>
                )}
              </div>
              <BriefPanel id="design-brief" locale={locale} value={brief} onChange={setBrief} />
            </div>
          </section>
          <section id="recommendation" className="dv-chapter">
            <div className="dv-chapter-heading">
              <p className="dv-eyebrow">{t.chapter2}</p>
              <h2 tabIndex={-1}>{t.recommendationTitle}</h2>
              <p>{t.recommendationBody}</p>
            </div>
            <div className="dv-card-composition">
              <div>
                <span className="dv-specimen-label">A / {t.large}</span>
                <ProjectCard
                  project={project}
                  size="large"
                  locale={locale}
                  onSelect={() => setSheet(true)}
                />
              </div>
              <div className="dv-card-secondary">
                <span className="dv-specimen-label">B / {t.medium}</span>
                <ProjectCard
                  project={{ ...project, amount: undefined }}
                  locale={locale}
                  onSelect={() => setSheet(true)}
                />
                <span className="dv-specimen-label dv-gap">C / {t.small}</span>
                <ProjectCard
                  project={{ ...project, amount: undefined }}
                  size="small"
                  locale={locale}
                  onSelect={() => setSheet(true)}
                />
              </div>
            </div>
          </section>
          <section id="spatial" className="dv-chapter">
            <div className="dv-chapter-heading">
              <p className="dv-eyebrow">{t.chapter3}</p>
              <h2 tabIndex={-1}>{t.spatialTitle}</h2>
              <p>{t.spatialBody}</p>
            </div>
            <div className="dv-spatial-composition">
              <LightColumn height={74} match={82} locale={locale} />
              <div className="dv-layer-specimen">
                <span className="dv-specimen-label">{t.layerStatus}</span>
                <div className="dv-layer-row">
                  {(['beaches', 'schools', 'culture'] as const).map((key) => (
                    <LayerChip key={key} active={layer === key} onChange={() => setLayer(key)}>
                      {t[key]}
                    </LayerChip>
                  ))}
                </div>
                <p className="dv-layer-active" role="status">
                  {t[layer as 'beaches' | 'schools' | 'culture']}
                </p>
                <button
                  id="design-sheet-trigger"
                  className="dv-button"
                  onClick={() => setSheet(true)}
                >
                  {t.openSheet}
                  <ArrowUpRight aria-hidden="true" />
                </button>
                <p className="dv-fine">{t.smallPrint}</p>
              </div>
            </div>
          </section>
          <section id="evidence" className="dv-chapter">
            <div className="dv-chapter-heading">
              <p className="dv-eyebrow">{t.chapter4}</p>
              <h2 tabIndex={-1}>{t.evidenceTitle}</h2>
              <p>{t.evidenceBody}</p>
            </div>
            <ComparisonTable
              locale={locale}
              columns={[t.conceptA, t.conceptB]}
              rows={[
                {
                  label: t.priceLabel,
                  values: [
                    <Price key="a" amount={20000000} currency="AED" locale={locale} />,
                    <Price key="b" amount={18000000} currency="AED" locale={locale} />,
                  ],
                },
                {
                  label: t.size,
                  values: [
                    <bdi key="a">
                      {formatDesignDigits(520, digits)} {t.areaUnit}
                    </bdi>,
                    <bdi key="b">
                      {formatDesignDigits(460, digits)} {t.areaUnit}
                    </bdi>,
                  ],
                },
                {
                  label: t.handover,
                  values: [
                    <bdi key="a">{formatDesignDigits(2028, digits)}</bdi>,
                    <bdi key="b">{formatDesignDigits(2029, digits)}</bdi>,
                  ],
                },
                { label: t.nextStep, values: [t.request, t.request] },
              ]}
            />
            <div className="dv-currency-control">
              <label htmlFor="design-currency">{t.currencyControl}</label>
              <select
                id="design-currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value as typeof currency)}
              >
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EGP">EGP</option>
              </select>
              <Price amount={20000000 * rates[currency]} currency={currency} locale={locale} />
              <p>
                {formatDesignDigits(
                  t.fxNote
                    .replace('{date}', '\u2066' + FX_DATE + '\u2069')
                    .replace('{usd}', String(FX.USD))
                    .replace('{egp}', String(FX.EGP)),
                  digits,
                )}
              </p>
            </div>
            <div className="dv-evidence-lower">
              <PaymentTimeline
                locale={locale}
                amount={20000000 * rates[currency]}
                currency={currency}
                milestones={[
                  { label: t.booking, percent: 20, timing: '2026' },
                  { label: t.construction, percent: 60, timing: '2026–2028' },
                  { label: t.completion, percent: 20, timing: '2028' },
                ]}
              />
              <aside className="dv-evidence-aside">
                <StatBlock
                  value={new Intl.NumberFormat(locale, {
                    numberingSystem: digits ? 'arab' : 'latn',
                  }).format(3)}
                  label={t.statLabel}
                  note={t.statNote}
                />
                <div className="dv-badge-specimen">
                  {(['demo', 'developer', 'press', 'listing'] as const).map((basis) => (
                    <TrustBadge key={basis} basis={basis} locale={locale} />
                  ))}
                </div>
                <SourceChip
                  locale={locale}
                  source={{
                    title: 'Nest Seekers · ORLA',
                    url: 'https://www.nestseekers.com/5589481/orla-20260624032650',
                    asOf: '2026-06',
                  }}
                />
                <p className="dv-fine">{t.sourceNote}</p>
              </aside>
            </div>
            <div className="dv-currency-strip">
              <span>{t.currencyNote}</span>
              <Price amount={20000000} currency="AED" locale={locale} />
              <Price amount={91200000} currency="EGP" locale={locale} />
              <Price amount={5200000} currency="USD" locale={locale} />
            </div>
          </section>
          <section id="states" className="dv-chapter">
            <div className="dv-chapter-heading">
              <p className="dv-eyebrow">{t.chapter5}</p>
              <h2 tabIndex={-1}>{t.statesTitle}</h2>
              <p>{t.statesBody}</p>
            </div>
            <div className="dv-states-composition">
              <EmptyState locale={locale} onAction={() => scroll('conversation')} />
              <div className="dv-transient-states">
                <LoadingState locale={locale} />
                {recovered ? (
                  <div className="dv-recovered" role="status">
                    <Check aria-hidden="true" />
                    {t.recovered}
                  </div>
                ) : (
                  <ErrorState locale={locale} onRetry={() => setRecovered(true)} />
                )}
              </div>
            </div>
          </section>
        </main>
        <footer className="dv-footer">
          <a className="dv-wordmark" href="#main">
            DARIVO
          </a>
          <div>
            <p>{t.footer}</p>
            <span>{t.footnote}</span>
          </div>
        </footer>
        <BottomSheet open={sheet} onClose={() => setSheet(false)} locale={locale}>
          <ProjectCard project={project} locale={locale} />
          <p className="dv-fine">{t.sheetContent}</p>
        </BottomSheet>
        <CommandPalette
          open={palette}
          onClose={() => setPalette(false)}
          locale={locale}
          commands={chapters.map((chapter) => ({ ...chapter, onSelect: () => scroll(chapter.id) }))}
        />
      </div>
    </DigitsContext.Provider>
  );
}
