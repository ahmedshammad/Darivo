'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Copy, Moon, Sun } from 'lucide-react';
import type { StoryAction, StoryDTO } from '@/src/lib/story';
import type { AtlasData } from '@/src/lib/atlas';
import { storyCopy, type StoryLocale } from '@/messages/story';
import { usePreferences } from '@/src/components/preferences';
import { officeIntentHref } from '@/src/components/office/links';
import { formatAmount, formatNumber } from '@/src/lib/format';
import { StoryFact, StoryMoney, StoryPayment, StorySources } from './evidence';
import { StoryMap } from './story-map';
import { StorySmoothScroll } from './smooth-scroll';
import { storyCompletionDate, storyPropertyTypeLabel } from './presentation';
import './story.css';
const chapters = [
  'arrival',
  'idea',
  'place',
  'residences',
  'numbers',
  'developer',
  'service',
  'next',
] as const;
export function StoryClient({
  story,
  data,
  locale,
  initialTheme,
  forceFallback = false,
}: {
  story: StoryDTO;
  data: Pick<AtlasData, 'projects' | 'pois'>;
  locale: StoryLocale;
  initialTheme: 'dark' | 'light';
  forceFallback?: boolean;
}) {
  const t = storyCopy[locale];
  const [theme, setTheme] = useState(initialTheme);
  const [copyState, setCopyState] = useState('');
  const heroActions = useRef<HTMLDivElement>(null);
  const mobileActions = useRef<HTMLElement>(null);
  const heroActionsVisible = useRef(true);
  const [showMobileActions, setShowMobileActions] = useState(false);
  useEffect(() => {
    const target = heroActions.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        heroActionsVisible.current = entry.isIntersecting;
        // Never remove the link that a keyboard user is currently operating.
        if (!entry.isIntersecting) setShowMobileActions(true);
        else if (!mobileActions.current?.contains(document.activeElement))
          setShowMobileActions(false);
      },
      { rootMargin: '-72px 0px 0px 0px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const { currency, setCurrency, arabicIndicDigits, setArabicIndicDigits } = usePreferences();
  const digits = (value: string) =>
    arabicIndicDigits ? value.replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]) : value;
  const isGroup = story.kind === 'DEMO_PROJECT';
  const isReference = story.kind === 'REAL_REFERENCE_PROJECT';
  const badge = isReference ? t.reference : isGroup ? t.demoProject : t.demoUnit;
  const primaryAction: StoryAction = isGroup
    ? 'SELECT_UNIT'
    : isReference
      ? 'ENQUIRE_PROJECT'
      : 'REQUEST_UNIT_VIEWING';
  const primaryLabel = isGroup ? t.select : isReference ? t.enquire : t.viewing;
  function permits(action: StoryAction) {
    const cap = story.capabilities.find((item) => item.action === action);
    return cap?.allowed || cap?.reason === 'SIGN_IN';
  }
  const primaryHref = isGroup
    ? '#story-residences'
    : officeIntentHref(locale, isReference ? 'enquire' : 'viewing', story, theme);
  const firstNarrative =
    story.narrative.find((entry) =>
      story.facts.some(
        (fact) => entry.factIds.includes(fact.id) && fact.key.startsWith('headline_facts.'),
      ),
    ) ?? story.narrative[0];
  const narrative = firstNarrative
    ? [firstNarrative, ...story.narrative.filter((entry) => entry.id !== firstNarrative.id)]
    : [];
  const firstTypeFact =
    !isReference && firstNarrative
      ? story.facts.find((fact) => firstNarrative.factIds.includes(fact.id) && fact.key === 'type')
      : undefined;
  const ideaText =
    storyPropertyTypeLabel(firstTypeFact?.value, locale) ??
    firstNarrative?.text[locale] ??
    t.ideaFallback;
  const blockedActions = story.capabilities.filter(
    (capability) =>
      !capability.allowed &&
      (capability.reason === 'PRIVACY_RESTRICTED' || capability.reason === 'CLIENT_REQUIRED'),
  );
  const actionLabels: Record<StoryAction, string> = {
    ASK_CONCIERGE: t.ask,
    COMPARE: t.compare,
    ADD_TO_PORTFOLIO: t.save,
    REQUEST_UNIT_VIEWING: t.viewing,
    ENQUIRE_PROJECT: t.enquire,
    SELECT_UNIT: t.select,
    COPY_PRIVATE_LINK: t.copy,
  };
  const conciergeHref = `/${locale}/concierge?${new URLSearchParams(story.kind === 'DEMO_UNIT' ? { unit: story.unitId, theme } : { project: story.projectId, theme })}`;
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${locale}${story.storyPath}?theme=${theme}`,
      );
      setCopyState(t.copied);
    } catch {
      setCopyState(t.copyFailed);
    }
  }
  const heading = (index: number) => (
    <div className="story-chapter-heading">
      <span aria-hidden="true">{formatNumber(index + 1, locale, arabicIndicDigits)}</span>
      <h2>{t.chapters[index]}</h2>
    </div>
  );
  return (
    <div className="story" data-theme={theme} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <StorySmoothScroll />
      <a className="story-skip" href="#main">
        {t.skip}
      </a>
      <header className="story-header">
        <Link href={`/${locale}?theme=${theme}`} className="story-wordmark" title={t.home}>
          DARIVO
        </Link>
        <span className="story-header-caption">{t.story}</span>
        <nav aria-label={t.office}>
          <Link href={`/${locale}/office?theme=${theme}`}>{t.office}</Link>
          <Link
            href={`/${locale === 'ar' ? 'en' : 'ar'}${story.storyPath}?theme=${theme}`}
            prefetch={false}
            lang={locale === 'ar' ? 'en' : 'ar'}
          >
            {locale === 'ar' ? 'EN' : 'العربية'}
          </Link>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? t.light : t.dark}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <section
          id="story-arrival"
          tabIndex={-1}
          className="story-hero"
          aria-labelledby="story-title"
        >
          <div className="story-hero-top">
            <span className="story-kind">{badge}</span>
            <span>
              <bdi>{t.countries[story.country]}</bdi> / {story.city[locale]}
            </span>
          </div>
          <div className="story-title-composition">
            <span className="story-overline">{story.community[locale]}</span>
            <h1 id="story-title">
              <bdi>{story.name[locale]}</bdi>
            </h1>
            <div className="story-hero-rule" aria-hidden="true" />
            <div className="story-hero-bottom">
              <p>
                {t.geography}
                <br />
                <span>{t.approximate}</span>
              </p>
              <span className="story-coordinate" dir="ltr">
                {formatNumber(story.center[1], locale, arabicIndicDigits, 3)}° {t.north}
                <br />
                {formatNumber(story.center[0], locale, arabicIndicDigits, 3)}° {t.east}
              </span>
            </div>
          </div>
          <div className="story-hero-footer">
            <StoryMoney
              price={story.price}
              facts={story.facts}
              sources={story.sources}
              locale={locale}
              compact
            />
            <div className="story-hero-actions" ref={heroActions} data-testid="story-hero-actions">
              {permits(primaryAction) ? (
                <a className="story-button" href={primaryHref}>
                  {primaryLabel}
                  <ArrowUpRight size={18} />
                </a>
              ) : (
                <div className="story-support">
                  <p>{t.restricted}</p>
                  <a className="story-text-link" href="#story-recovery">
                    {t.more}
                  </a>
                </div>
              )}
              {permits('ASK_CONCIERGE') && (
                <Link
                  className="story-button story-button--outline"
                  data-testid="story-ask-primary"
                  href={conciergeHref}
                >
                  {t.ask}
                </Link>
              )}
              <a className="story-text-link" href="#story-idea">
                {t.chapters[1]} <ArrowDown size={16} />
              </a>
            </div>
          </div>
        </section>
        <nav className="story-chapters" data-lenis-prevent aria-label={t.story}>
          {chapters.map((chapter, index) => (
            <a key={chapter} href={`#story-${chapter}`}>
              <span>{formatNumber(index + 1, locale, arabicIndicDigits)}</span>
              {t.chapters[index]}
            </a>
          ))}
        </nav>
        <div className="story-editorial">
          <section id="story-idea" tabIndex={-1} className="story-idea">
            {heading(1)}
            <p className="story-display">{ideaText}</p>
            {story.narrative.length ? (
              narrative.map((entry) => (
                <div className="story-narrative" key={entry.id}>
                  {entry !== firstNarrative && <h3>{entry.title[locale]}</h3>}
                  {entry !== firstNarrative && (
                    <p>
                      {story.facts.some(
                        (fact) => entry.factIds.includes(fact.id) && fact.key === 'completion',
                      )
                        ? (storyCompletionDate(entry.text[locale], locale, arabicIndicDigits) ??
                          entry.text[locale])
                        : entry.text[locale]}
                    </p>
                  )}
                  {entry.factIds.length > 0 && (
                    <details>
                      <summary>{t.viewSources}</summary>
                      <dl>
                        {story.facts
                          .filter((fact) => entry.factIds.includes(fact.id))
                          .map((fact) => (
                            <StoryFact
                              key={fact.id}
                              fact={fact}
                              sources={story.sources}
                              locale={locale}
                            />
                          ))}
                      </dl>
                    </details>
                  )}
                </div>
              ))
            ) : (
              <p>{t.missingIdea}</p>
            )}
          </section>
          <section id="story-place" tabIndex={-1} className="story-place">
            {heading(2)}
            <h3>{story.community[locale]}</h3>
            <StoryMap
              story={story}
              data={data}
              locale={locale}
              theme={theme}
              forceFallback={forceFallback}
            />
          </section>
          <section id="story-residences" tabIndex={-1} className="story-residences">
            {heading(3)}
            <p className="story-lead">
              {isReference ? t.residencesReference : isGroup ? t.residencesDemo : t.demoUnit}
            </p>
            {isGroup ? (
              <div className="story-residence-list">
                {story.residences.map((unit, index) => (
                  <article key={unit.entity.id}>
                    <span className="story-label">
                      {t.demo} / {formatNumber(index + 1, locale, arabicIndicDigits)}
                    </span>
                    <h3>{unit.name[locale]}</h3>
                    <StoryMoney
                      price={unit.price}
                      facts={unit.facts}
                      sources={unit.sources}
                      locale={locale}
                      compact
                    />
                    <Link
                      className="story-text-link"
                      href={`/${locale}${unit.storyPath}?theme=${theme}`}
                    >
                      {t.residence}
                      <ArrowUpRight size={18} />
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <dl className="story-facts">
                {story.facts.map((fact) => (
                  <StoryFact key={fact.id} fact={fact} sources={story.sources} locale={locale} />
                ))}
              </dl>
            )}
            {!story.facts.length && !isGroup && <p>{t.noFacts}</p>}
          </section>
        </div>
        <section id="story-numbers" tabIndex={-1} className="story-numbers story-full">
          {heading(4)}
          <div className="story-numbers-intro">
            <p className="story-display">{t.numbersIntro}</p>
            <div className="story-preferences">
              <label>
                {t.currency}
                <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
                  {['AED', 'EGP', 'USD', 'EUR', 'SAR', 'GBP'].map((code) => (
                    <option key={code}>{code}</option>
                  ))}
                </select>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={arabicIndicDigits}
                  onChange={(event) => setArabicIndicDigits(event.target.checked)}
                />
                {t.digits}
              </label>
            </div>
          </div>
          <nav className="story-number-links" aria-label={t.numbersNavigation}>
            <a href="#story-price-metrics">{t.priceMetrics}</a>
            <a href="#story-payment-timeline">{t.paymentNavigation}</a>
          </nav>
          <div id="story-price-metrics" tabIndex={-1} className="story-ledger story-number-target">
            <StoryMoney
              price={story.price}
              facts={story.facts}
              sources={story.sources}
              locale={locale}
            />
            {story.metrics.map((metric) => (
              <article key={metric.id} data-metric-status={metric.status}>
                <h3>{metric.label[locale]}</h3>
                <p
                  className={
                    metric.status === 'AVAILABLE' ? 'story-metric-value' : 'story-metric-status'
                  }
                >
                  {metric.status === 'AVAILABLE' ? (
                    <>
                      <bdi>
                        {metric.unit === 'boolean'
                          ? metric.value === 1
                            ? t.thresholdMet
                            : t.thresholdNotMet
                          : metric.currency
                            ? `${formatAmount(metric.value, metric.currency, locale, arabicIndicDigits)}${locale !== 'ar' && (metric.unit === 'sqm' || metric.unit === 'sqft') ? ` / ${t[metric.unit]}` : ''}`
                            : `${formatNumber(metric.value, locale, arabicIndicDigits, 2)} ${metric.unit === 'sqm' || metric.unit === 'sqft' ? t[metric.unit] : metric.unit}`}
                      </bdi>
                      {locale === 'ar' &&
                        metric.currency &&
                        (metric.unit === 'sqm' || metric.unit === 'sqft') && (
                          <span className="story-metric-unit">
                            {metric.unit === 'sqm' ? t.perSqm : t.perSqft}
                          </span>
                        )}
                    </>
                  ) : (
                    t.metricReasons[metric.reason]
                  )}
                </p>
                {metric.status === 'AVAILABLE' && (
                  <>
                    <p>{metric.explanation[locale]}</p>
                    <small>
                      {t.asOf} <bdi>{digits(metric.asOf.value ?? t.unknown)}</bdi>
                    </small>
                  </>
                )}
                {(metric.status !== 'AVAILABLE' || metric.sourceIds.length > 0) && (
                  <details>
                    <summary>{metric.status === 'AVAILABLE' ? t.sources : t.metricContext}</summary>
                    {metric.status !== 'AVAILABLE' && (
                      <>
                        <p>{metric.explanation[locale]}</p>
                        <small>
                          {t.asOf} <bdi>{digits(metric.asOf.value ?? t.unknown)}</bdi>
                        </small>
                      </>
                    )}
                    {metric.factIds.length > 0 && (
                      <dl>
                        {story.facts
                          .filter((fact) => metric.factIds.includes(fact.id))
                          .map((fact) => (
                            <StoryFact
                              key={fact.id}
                              fact={fact}
                              sources={story.sources}
                              locale={locale}
                            />
                          ))}
                      </dl>
                    )}
                    {metric.sourceIds.length > 0 && (
                      <StorySources
                        sources={story.sources.filter((source) =>
                          metric.sourceIds.includes(source.id),
                        )}
                        locale={locale}
                      />
                    )}
                  </details>
                )}
              </article>
            ))}
          </div>
          <div id="story-payment-timeline" tabIndex={-1} className="story-number-target">
            <StoryPayment timeline={story.timeline} locale={locale} />
          </div>
          <p className="story-support" role="note">
            {t.indicative}
          </p>
        </section>
        <section id="story-developer" tabIndex={-1} className="story-full story-developer">
          {heading(5)}
          <div>
            <p className="story-label">
              {t.developerIntro} {story.developer.kind === 'DEMO' ? t.demo : ''}
            </p>
            <h3 className="story-display">{story.developer.name[locale]}</h3>
            {story.developer.facts.length ? (
              <dl className="story-facts">
                {story.developer.facts.map((fact) => (
                  <StoryFact
                    key={fact.id}
                    fact={fact}
                    sources={story.developer.sources}
                    locale={locale}
                  />
                ))}
              </dl>
            ) : (
              <p>{t.developerMissing}</p>
            )}
          </div>
        </section>
        <section id="story-service" tabIndex={-1} className="story-full story-service">
          {heading(6)}
          <div>
            <h3 className="story-display">{t.serviceTitle}</h3>
            <p className="story-lead">
              {isReference ? t.serviceReference : isGroup ? t.serviceGroup : t.serviceDemo}
            </p>
            <p>{t.noPresence}</p>
            <Link className="story-text-link" href={`/${locale}/office?theme=${theme}`}>
              {t.office}
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>
        <section id="story-next" tabIndex={-1} className="story-full story-next">
          {heading(7)}
          <h3 className="story-display">{t.next}</h3>
          <div className="story-next-actions">
            {permits(primaryAction) && (
              <a className="story-button" href={primaryHref}>
                {primaryLabel}
                <ArrowUpRight size={18} />
              </a>
            )}
            {permits('ASK_CONCIERGE') && (
              <Link className="story-button story-button--outline" href={conciergeHref}>
                {t.ask}
              </Link>
            )}
            {!isGroup && permits('ADD_TO_PORTFOLIO') && (
              <Link
                className="story-button story-button--outline"
                href={officeIntentHref(locale, 'save', story, theme)}
              >
                {t.save}
              </Link>
            )}
            {!isGroup && permits('COMPARE') && (
              <Link
                className="story-text-link"
                href={officeIntentHref(locale, 'compare', story, theme)}
              >
                {t.compare}
              </Link>
            )}
          </div>
          <p className="story-support">{t.reviewFirst}</p>
          {blockedActions.length > 0 && (
            <div id="story-recovery" tabIndex={-1} className="story-recovery">
              {blockedActions.map((capability) => (
                <div key={capability.action} role="note">
                  <h4>{actionLabels[capability.action]}</h4>
                  <p>
                    {capability.reason === 'PRIVACY_RESTRICTED'
                      ? t.privacyRecovery
                      : t.clientRecovery}
                  </p>
                  <Link
                    className="story-text-link"
                    href={`/${locale}/office${capability.reason === 'PRIVACY_RESTRICTED' ? '/privacy' : ''}?theme=${theme}`}
                  >
                    {capability.reason === 'PRIVACY_RESTRICTED'
                      ? t.privacySettings
                      : t.accountAccess}
                  </Link>
                </div>
              ))}
            </div>
          )}
          <div className="story-share">
            {permits('COPY_PRIVATE_LINK') && (
              <button onClick={() => void copyLink()}>
                <Copy size={16} />
                {t.copy}
              </button>
            )}
            <p>{t.shareNote}</p>
            <p role="status">{copyState}</p>
          </div>
          <details className="story-all-sources">
            <summary>{t.sources}</summary>
            <StorySources sources={story.sources} locale={locale} />
          </details>
        </section>
      </main>
      <footer className="story-footer">
        <span>DARIVO</span>
        <Link href={`/${locale}/explore?theme=${theme}`}>{t.back}</Link>
      </footer>
      <nav
        className="story-mobile-action"
        aria-label={t.more}
        ref={mobileActions}
        hidden={!showMobileActions}
        data-testid="story-mobile-actions"
        onBlurCapture={() => {
          queueMicrotask(() => {
            const current = mobileActions.current;
            if (current && heroActionsVisible.current && !current.contains(document.activeElement))
              setShowMobileActions(false);
          });
        }}
      >
        {permits(primaryAction) ? (
          <a href={primaryHref}>
            {primaryLabel}
            <ArrowUpRight size={18} />
          </a>
        ) : (
          <a href="#story-next">{t.more}</a>
        )}
        <a href="#story-next">{t.more}</a>
      </nav>
    </div>
  );
}
