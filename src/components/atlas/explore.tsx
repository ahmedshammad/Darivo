'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  Layers,
  MapPin,
  Moon,
  Pause,
  Play,
  Plus,
  SlidersHorizontal,
  Sun,
  X,
} from 'lucide-react';
import { exploreCopy, exploreReferenceArabic } from '@/messages/explore';
import { AREAS, FX_DATE } from '@/src/lib/catalog';
import { openTileProvider } from '@/src/lib/tiles';
import type {
  AtlasCamera,
  AtlasData,
  AtlasIsochrone,
  AtlasLayer,
  AtlasLocale,
  AtlasPoint,
  AtlasProject,
  AtlasTheme,
} from '@/src/lib/atlas';
import {
  ATLAS_PLACES,
  ATLAS_STORIES,
  atlasComparisonMetrics,
  parseAtlasIntent,
  projectInPlace,
} from '@/src/lib/atlas-intent';
import { usePreferences } from '@/src/components/preferences';
import { LivingMap } from './living-map';
import './explore.css';

const layerIds: AtlasLayer[] = ['beach', 'golf', 'school', 'hospital', 'airport', 'culture', 'hex'];
type Origin = 'point' | 'office' | 'school';
const referenceArabic = {
  ...Object.fromEntries(
    AREAS.flatMap((area) => [
      [area[1], area[2]],
      [area[3], area[4]],
    ]),
  ),
  ...exploreReferenceArabic,
};
export function Explore({
  data,
  locale,
  initialTheme = 'dark',
  initialQuery = '',
  initialStory = '',
  developerId = '',
  signedIn = false,
  forceFallback = false,
}: {
  data: AtlasData;
  locale: AtlasLocale;
  initialTheme?: AtlasTheme;
  initialQuery?: string;
  initialStory?: string;
  developerId?: string;
  signedIn?: boolean;
  forceFallback?: boolean;
}) {
  const t = exploreCopy[locale];
  const { arabicIndicDigits, setArabicIndicDigits } = usePreferences();
  const arabic = locale === 'ar';
  const projects = useMemo(
    () =>
      developerId ? data.projects.filter((p) => p.developerId === developerId) : data.projects,
    [data.projects, developerId],
  );
  const initialIntent = useMemo(
    () => parseAtlasIntent(initialQuery, projects),
    [initialQuery, projects],
  );
  const [theme, setTheme] = useState(initialTheme);
  const [query, setQuery] = useState(initialQuery);
  const [brief, setBrief] = useState(initialQuery);
  const [reply, setReply] = useState(
    initialQuery ? (initialIntent.recognized ? t.recognized : t.unrecognized) : '',
  );
  const [camera, setCamera] = useState<AtlasCamera>(
    initialIntent.camera || {
      center: [55.19, 25.15],
      zoom: 10.6,
      pitch: 52,
      bearing: -18,
      key: 'arrival',
    },
  );
  const [highlighted, setHighlighted] = useState<string[]>(initialIntent.projectIds);
  const [locationFiltered, setLocationFiltered] = useState(Boolean(initialIntent.places.length));
  const [layers, setLayers] = useState<AtlasLayer[]>(initialIntent.layers);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isochrone, setIsochrone] = useState<AtlasIsochrone | null>(
    initialIntent.isochroneMinutes
      ? {
          center: initialIntent.camera?.center || [55.19, 25.15],
          minutes: initialIntent.isochroneMinutes,
          label: t.point,
        }
      : null,
  );
  const [origins, setOrigins] = useState<Partial<Record<Origin, AtlasPoint>>>({});
  const [origin, setOrigin] = useState<Origin>('point');
  const [picking, setPicking] = useState(false);
  const [minutes, setMinutes] = useState<10 | 20 | 30>(20);
  const [sun, setSun] = useState(false);
  const [depth, setDepth] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mapMode, setMapMode] = useState<'webgl' | 'fallback'>(
    forceFallback ? 'fallback' : 'webgl',
  );
  const comparisonHeading = useRef<HTMLHeadingElement>(null);
  const sheetContent = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState(t.mapLoading as string);
  const [storyId, setStoryId] = useState(initialStory);
  const [storyStep, setStoryStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(844);
  const evidenceHeading = useRef<HTMLHeadingElement>(null);
  const toolsButton = useRef<HTMLButtonElement>(null);
  const mapSurface = useRef<HTMLDivElement>(null);
  const sheetButton = useRef<HTMLButtonElement>(null);
  const selectionTrigger = useRef<HTMLElement | null>(null);
  const dragStart = useRef<number | null>(null);
  const selected = projects.find((p) => p.id === selectedId);
  const selectedSources = useMemo(() => {
    const grouped = new Map<
      string,
      { url: string; publisher: string; bases: string[]; dates: (string | null)[] }
    >();
    for (const source of selected?.sources || []) {
      const group = grouped.get(source.url) || {
        url: source.url,
        publisher: source.publisher,
        bases: [],
        dates: [],
      };
      if (!group.bases.includes(source.basis)) group.bases.push(source.basis);
      if (!group.dates.includes(source.asOf)) group.dates.push(source.asOf);
      grouped.set(source.url, group);
    }
    return [...grouped.values()].map((group) => ({
      ...group,
      bases: group.bases.some((value) => value !== 'UNKNOWN')
        ? group.bases.filter((value) => value !== 'UNKNOWN')
        : group.bases,
    }));
  }, [selected]);
  const story = ATLAS_STORIES.find((s) => s.id === storyId);
  const place = ATLAS_PLACES.find((p) => p.id === story?.places[storyStep]);
  const storyProjects = useMemo(() => {
    if (!place) return [];
    return projects.filter((project) => {
      if (!projectInPlace(project, place)) return false;
      if (storyId === 'branded')
        return ['orla-palm-jumeirah', 'oasis-palace-ostra'].includes(project.id);
      if (storyId === 'ready') {
        if (project.completion === 'ready') return true;
        const years = project.completion?.match(/20\d{2}/g)?.map(Number) || [];
        return years.length > 0 && Math.max(...years) < 2028;
      }
      if (storyId === 'islands') return /palm|jumeirah bay/i.test(project.community);
      return true;
    });
  }, [projects, place, storyId]);
  const mapHighlights = story ? storyProjects.map((project) => project.id) : highlighted;
  const activeCamera = useMemo(
    () =>
      place && !selectedId
        ? {
            center: place.center,
            zoom: place.zoom,
            pitch: depth ? 50 : 0,
            bearing: -15,
            key: `story-${storyId}-${storyStep}-${depth}`,
          }
        : camera,
    [place, selectedId, depth, storyId, storyStep, camera],
  );
  const curated = useMemo(() => {
    if (story) return storyProjects.slice(0, 12);
    if (locationFiltered) return projects.filter((p) => highlighted.includes(p.id)).slice(0, 12);
    const dubai = ATLAS_PLACES.find((p) => p.id === 'dubai');
    return [...projects]
      .sort(
        (a, b) =>
          Number(Boolean(dubai && projectInPlace(b, dubai))) * 2 +
          Number(b.kind === 'REAL_REFERENCE') -
          (Number(Boolean(dubai && projectInPlace(a, dubai))) * 2 +
            Number(a.kind === 'REAL_REFERENCE')),
      )
      .slice(0, 8);
  }, [projects, highlighted, locationFiltered, story, storyProjects]);
  const comparison = compareIds
    .map((id) => projects.find((p) => p.id === id))
    .filter((p): p is AtlasProject => Boolean(p));
  const n = (value: number, digits = 0) =>
    new Intl.NumberFormat(
      `${arabic ? 'ar-AE' : 'en-GB'}-u-nu-${arabicIndicDigits ? 'arab' : 'latn'}`,
      { maximumFractionDigits: digits },
    ).format(value);
  const digitsText = (value: string) => {
    const latin = value.replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
    return arabicIndicDigits
      ? latin.replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)])
      : latin;
  };
  const name = (p: { nameEn: string; nameAr: string }) => digitsText(arabic ? p.nameAr : p.nameEn);
  const localField = (value: string | null | undefined) => {
    if (!value) return t.unknown;
    const translated = arabic ? referenceArabic[value] || value : value;
    return digitsText(translated);
  };
  const originLabel = origin === 'office' ? t.myOffice : origin === 'school' ? t.mySchool : t.point;
  const basis = (key: string) =>
    t.sourceBasis[key as keyof typeof t.sourceBasis] || t.sourceBasis.UNKNOWN;
  const price = (p: AtlasProject) =>
    p.amount === null ? t.amountUnknown : `${n(p.amount)} ${p.currency}`;
  const cameraWithPadding = useMemo(
    () => ({
      ...activeCamera,
      padding: mobile
        ? {
            top: 140,
            bottom: Math.min(
              viewportHeight - 180,
              Math.round(
                (expanded ? viewportHeight * 0.79 : Math.max(viewportHeight * 0.34, 268)) + 90,
              ),
            ),
            left: 24,
            right: 24,
          }
        : { top: 100, bottom: 100, left: arabic ? 70 : 430, right: arabic ? 430 : 70 },
    }),
    [activeCamera, mobile, expanded, arabic, viewportHeight],
  );

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 760px)');
    const update = () => {
      setReduced(motion.matches);
      setMobile(narrow.matches);
      setViewportHeight(window.innerHeight);
      if (motion.matches) setPlaying(false);
    };
    update();
    motion.addEventListener('change', update);
    narrow.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      motion.removeEventListener('change', update);
      narrow.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  const interpret = useCallback(
    (text: string, submitted = false) => {
      const intent = parseAtlasIntent(text, projects);
      setStoryId('');
      setPlaying(false);
      if (intent.camera) setCamera({ ...intent.camera, key: `${intent.camera.key}-${Date.now()}` });
      if (intent.places.length || intent.projectIds.length) {
        setHighlighted(intent.projectIds);
        setLocationFiltered(true);
      }
      if (intent.layers.length) setLayers(intent.layers);
      if (intent.isochroneMinutes) {
        const center = intent.camera?.center || camera.center;
        setMinutes(intent.isochroneMinutes);
        setIsochrone({ center, minutes: intent.isochroneMinutes, label: t.point });
        setOrigins((previous) => ({ ...previous, point: center }));
      }
      if (submitted) {
        setBrief(text);
        setReply(intent.recognized ? t.recognized : t.unrecognized);
        setExpanded(true);
      }
    },
    [projects, camera.center, t],
  );
  useEffect(() => {
    if (!query.trim() || query === initialQuery) return;
    const timer = setTimeout(() => interpret(query), 650);
    return () => clearTimeout(timer);
    // Interpretation runs when the words change, not when it moves the camera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
  useEffect(() => {
    if (!playing || !story || reduced) return;
    const timer = setTimeout(() => {
      if (storyStep + 1 >= story.places.length) setPlaying(false);
      else setStoryStep((step) => step + 1);
    }, 6500);
    return () => clearTimeout(timer);
  }, [playing, story, storyStep, reduced]);
  useEffect(() => {
    if (selectedId) {
      if (sheetContent.current) sheetContent.current.scrollTop = 0;
      evidenceHeading.current?.focus({ preventScroll: true });
    }
  }, [selectedId]);
  function selectProject(id: string) {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    if (picking) {
      setOriginPoint(project.center);
      return;
    }
    selectionTrigger.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelectedId(id);
    setExpanded(true);
    setPlaying(false);
    setCamera({
      center: project.center,
      zoom: 13.2,
      pitch: depth ? 55 : 0,
      bearing: -20,
      key: `project-${id}-${depth}`,
    });
  }
  function closeEvidence() {
    setSelectedId(null);
    requestAnimationFrame(() => {
      if (selectionTrigger.current?.isConnected) selectionTrigger.current.focus();
      else if (selectedId)
        document
          .querySelector<HTMLButtonElement>(
            `[data-project="${CSS.escape(selectedId)}"] .atlas-project-select`,
          )
          ?.focus();
    });
  }
  function toggleCompare(id: string) {
    const removing = compareIds.includes(id);
    if (!removing && compareIds.length >= 4) {
      setStatus(t.compareLimit);
      return;
    }
    const nextIds = removing ? compareIds.filter((item) => item !== id) : [...compareIds, id];
    setCompareIds(nextIds);
    setStatus(`${t.compareTitle}: ${n(nextIds.length)}`);
    if (!removing && nextIds.length >= 2) {
      setSelectedId(null);
      setExpanded(true);
      requestAnimationFrame(() => {
        if (sheetContent.current) sheetContent.current.scrollTop = 0;
        comparisonHeading.current?.focus({ preventScroll: true });
      });
    }
  }
  function setOriginPoint(point: AtlasPoint) {
    setOrigins((previous) => ({ ...previous, [origin]: point }));
    setIsochrone({ center: point, minutes, label: originLabel });
    setPicking(false);
    setStatus(t.selectedOrigin);
  }
  function changeMinutes(value: 10 | 20 | 30) {
    setMinutes(value);
    if (origin !== 'point' && !origins[origin]) {
      setPicking(true);
      setToolsOpen(false);
      setExpanded(false);
      return;
    }
    const center = origins[origin] || selected?.center || camera.center;
    setOrigins((previous) => ({ ...previous, [origin]: center }));
    setIsochrone({ center, minutes: value, label: originLabel });
  }
  function chooseStory(id: string) {
    setStoryId(id);
    setStoryStep(0);
    setPlaying(false);
    setSelectedId(null);
  }
  const localeParams = new URLSearchParams({
    theme,
    ...(query ? { q: query } : {}),
    ...(storyId ? { story: storyId } : {}),
    ...(developerId ? { developer: developerId } : {}),
  });

  const comparisonPanel = (
    <section className="atlas-comparison" aria-label={t.compareTitle}>
      <div>
        <h2 ref={comparisonHeading} tabIndex={-1}>
          {t.compareTitle}
        </h2>
        <button onClick={() => setCompareIds([])}>{t.clear}</button>
      </div>
      <p>{digitsText(t.compareHint)}</p>
      {comparison.length < 2 && <p>{t.compareEmpty}</p>}
      {comparison.slice(1).map((project) => {
        const { distanceKm, estimatedMinutes } = atlasComparisonMetrics(comparison[0], project);
        return (
          <div className="atlas-connection" key={project.id}>
            <span>
              {name(comparison[0])} <span aria-hidden="true">↔</span> {name(project)}
            </span>
            <strong>
              <bdi>
                {n(distanceKm, 1)} {t.km} ·{' '}
                {estimatedMinutes === null
                  ? t.noDrivingRoute
                  : `~${n(estimatedMinutes)} ${t.minutes}`}
              </bdi>
            </strong>
          </div>
        );
      })}
      {mobile && (
        <button
          className="atlas-action"
          onClick={() => {
            setExpanded(false);
            sheetButton.current?.focus();
          }}
        >
          <Compass />
          {t.viewOnMap}
        </button>
      )}
    </section>
  );
  const inlineMapEvidence = (
    <div className="atlas-inline-map-evidence">
      <details>
        <summary>{t.mapSources}</summary>
        <div className="atlas-inline-map-notes">
          <p>
            {mapMode === 'fallback' ? t.mapFallbackNote : t.mapSourceNote}{' '}
            {mapMode !== 'fallback' && <bdi>{FX_DATE}</bdi>}
          </p>
          <p>{digitsText(t.mapDemoNote)}</p>
          <p>{digitsText(t.compareHint)}</p>
        </div>
      </details>
      <div className="atlas-inline-attribution">
        {mapMode === 'fallback' ? (
          <a
            href="https://www.naturalearthdata.com/about/terms-of-use/"
            target="_blank"
            rel="noreferrer"
          >
            Natural Earth
          </a>
        ) : (
          openTileProvider.attribution.map((source) => (
            <a key={source.label} href={source.url} target="_blank" rel="noreferrer">
              {source.label}
            </a>
          ))
        )}
      </div>
    </div>
  );
  return (
    <div
      className="atlas-explore"
      data-theme={theme}
      data-sheet={expanded ? 'expanded' : 'collapsed'}
      data-comparing={comparison.length > 0}
      dir={arabic ? 'rtl' : 'ltr'}
    >
      <a className="atlas-skip" href="#atlas-conversation">
        {t.skip}
      </a>
      <div ref={mapSurface} className="atlas-map-surface" role="region" aria-label={t.eyebrow}>
        <LivingMap
          projects={projects}
          pois={data.pois}
          locale={locale}
          arabicIndicDigits={arabicIndicDigits}
          theme={theme}
          mode="explore"
          camera={cameraWithPadding}
          selectedId={selectedId}
          highlightedIds={mapHighlights}
          layers={layers}
          compareIds={compareIds}
          isochrone={isochrone}
          sun={sun}
          forceFallback={forceFallback}
          onSelect={selectProject}
          onPoint={(point) => {
            if (picking) setOriginPoint(point);
          }}
          onReady={(mode) => {
            setMapMode(mode);
            setStatus(mode === 'webgl' ? t.mapReady : t.fallback);
          }}
        />
      </div>
      <header className="atlas-header">
        <a href={`/${locale}`} className="atlas-wordmark">
          DARIVO<span>{t.tagline}</span>
        </a>
        <nav aria-label={t.home}>
          <a className="atlas-office-link" href={`/${locale}/${signedIn ? 'shortlists' : 'login'}`}>
            {signedIn ? t.office : t.signIn}
          </a>
          <a href={`/${arabic ? 'en' : 'ar'}/explore?${localeParams}`} lang={arabic ? 'en' : 'ar'}>
            {t.language}
          </a>
          <button
            className="atlas-icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={t.theme}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
        </nav>
      </header>
      <main>
        <aside
          id="atlas-conversation"
          className="atlas-conversation"
          data-testid="explore-sheet"
          aria-label={t.title}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              if (selected) closeEvidence();
              else {
                setExpanded(false);
                sheetButton.current?.focus();
              }
            }
          }}
        >
          <button
            ref={sheetButton}
            className="atlas-sheet-handle"
            aria-label={expanded ? t.collapse : t.expand}
            aria-expanded={expanded}
            aria-controls="atlas-sheet-content"
            onClick={() => {
              if (dragStart.current === -1) {
                dragStart.current = null;
                return;
              }
              setExpanded(!expanded);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
                setExpanded(event.key === 'ArrowUp');
              }
            }}
            onPointerDown={(event) => {
              dragStart.current = event.clientY;
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerUp={(event) => {
              if (dragStart.current !== null && Math.abs(event.clientY - dragStart.current) > 35) {
                setExpanded(event.clientY < dragStart.current);
                event.preventDefault();
                dragStart.current = -1;
              } else dragStart.current = null;
            }}
          >
            <span />
            {expanded ? <ChevronDown /> : <ChevronUp />}
          </button>
          <div className="atlas-conversation-intro">
            <span className="atlas-eyebrow">{t.eyebrow}</span>
            <h1>{t.title}</h1>
            <p>{t.intro}</p>
          </div>
          <form
            className="atlas-composer"
            onSubmit={(event) => {
              event.preventDefault();
              setPlaying(false);
              interpret(query, true);
            }}
          >
            <label className="atlas-sr" htmlFor="atlas-prompt">
              {t.prompt}
            </label>
            <textarea
              id="atlas-prompt"
              data-testid="explore-prompt"
              maxLength={1500}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.placeholder}
              rows={2}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  setPlaying(false);
                  interpret(query, true);
                }
              }}
            />
            <button type="submit" aria-label={t.send} disabled={!query.trim()}>
              <ArrowUp />
            </button>
          </form>
          <p className="atlas-local">{t.local}</p>
          {mobile && expanded && inlineMapEvidence}
          <div id="atlas-sheet-content" className="atlas-sheet-content" ref={sheetContent}>
            {comparison.length > 0 && !selected && comparisonPanel}
            {selected ? (
              <section
                className="atlas-evidence"
                data-testid="project-evidence"
                aria-labelledby="atlas-evidence-title"
              >
                <button className="atlas-text-button" onClick={closeEvidence}>
                  <ChevronLeft />
                  {t.close}
                </button>
                <span className="atlas-eyebrow">{t.evidence}</span>
                <h2 id="atlas-evidence-title" tabIndex={-1} ref={evidenceHeading}>
                  {name(selected)}
                </h2>
                <p>
                  {localField(selected.community)} · {localField(selected.city)}
                </p>
                <div className="atlas-price">
                  <bdi>{price(selected)}</bdi>
                </div>
                <p className="atlas-small">{t.native}</p>
                {selected.priceLabel && (
                  <p className="atlas-small">
                    <bdi>{localField(selected.priceLabel)}</bdi>
                  </p>
                )}
                {selected.priceNote && (
                  <p className="atlas-small">
                    <bdi>{localField(selected.priceNote)}</bdi>
                  </p>
                )}
                {selected.confidence === 'LOW' && <p className="atlas-small">{t.lowConfidence}</p>}
                <span className="atlas-badge">
                  {selected.kind === 'DEMO' ? t.demo : basis(selected.basis)}
                </span>
                <p className="atlas-evidence-note">
                  {selected.kind === 'DEMO' ? t.demoTradeoff : t.indicative}
                </p>
                <dl>
                  <div>
                    <dt>{t.developer}</dt>
                    <dd>
                      <bdi>{selected.developerName}</bdi>
                    </dd>
                  </div>
                  <div>
                    <dt>{t.completion}</dt>
                    <dd>
                      <bdi>{localField(selected.completion)}</bdi>
                    </dd>
                  </div>
                  <div>
                    <dt>{t.asOf}</dt>
                    <dd>
                      <bdi>{selected.asOf || t.unknownDate}</bdi>
                    </dd>
                  </div>
                </dl>
                <p className="atlas-small">
                  <MapPin />
                  {t.approximate}
                </p>
                {arabic && selected.kind === 'REAL_REFERENCE' && (
                  <details className="atlas-original-source">
                    <summary>{t.originalSource}</summary>
                    <div lang="en" dir="ltr">
                      {[
                        selected.community,
                        selected.city,
                        selected.priceLabel,
                        selected.priceNote,
                        selected.completion,
                      ]
                        .filter(Boolean)
                        .map((value, i) => (
                          <p key={i}>{value}</p>
                        ))}
                    </div>
                  </details>
                )}
                <h3>{t.sources}</h3>
                {selected.sources.length ? (
                  selectedSources.map((source, i) => (
                    <a
                      className="atlas-source"
                      key={`${source.url}-${i}`}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>
                        <bdi>{source.publisher}</bdi>
                        <small>
                          {source.bases.map(basis).join(' · ')} ·{' '}
                          <bdi>{source.dates.map((date) => date || t.unknownDate).join(' / ')}</bdi>
                        </small>
                      </span>
                      <ArrowUpRight />
                    </a>
                  ))
                ) : (
                  <p className="atlas-small">{t.noSources}</p>
                )}
                <button className="atlas-action" onClick={() => toggleCompare(selected.id)}>
                  {compareIds.includes(selected.id) ? <Check /> : <Plus />}
                  {compareIds.includes(selected.id) ? t.removeCompare : t.compare}
                </button>
                <p className="atlas-evidence-note">
                  {selected.kind === 'REAL_REFERENCE' ? t.onRequest : t.demoTradeoff}
                </p>
                <a
                  className="atlas-action atlas-action-primary"
                  href={`/${locale}/consultant?${new URLSearchParams({ project: selected.id, brief: brief || query })}`}
                >
                  {t.contextualRequest}
                  <ArrowUpRight />
                </a>
                <p className="atlas-small">{t.handoffSummary}</p>
              </section>
            ) : (
              <>
                {!brief && (
                  <button
                    className="atlas-suggestion"
                    onClick={() => {
                      setQuery(t.suggestion);
                      interpret(t.suggestion, true);
                    }}
                  >
                    {t.suggestion}
                    <ArrowUpRight />
                  </button>
                )}
                {brief && (
                  <section className="atlas-brief">
                    <span className="atlas-eyebrow">{t.brief}</span>
                    <p dir="auto">{brief}</p>
                    <p className="atlas-small" role="status">
                      {reply}
                    </p>
                  </section>
                )}
                <div className="atlas-curation-heading">
                  <div>
                    <h2>{t.curated}</h2>
                    <p>{t.selectionNote}</p>
                  </div>
                  <span>{n(curated.length)}</span>
                </div>
                {developerId && (
                  <p className="atlas-small">
                    {t.filtered}:{' '}
                    <bdi>
                      {name(
                        data.developers.find((d) => d.id === developerId) || {
                          nameEn: developerId,
                          nameAr: developerId,
                        },
                      )}
                    </bdi>{' '}
                    · <a href={`/${locale}/explore?theme=${theme}`}>{t.all}</a>
                  </p>
                )}
                {!curated.length && (
                  <div className="atlas-empty">
                    <p>{t.noMatches}</p>
                    <button
                      onClick={() => {
                        setLocationFiltered(false);
                        setHighlighted([]);
                      }}
                    >
                      {t.reset}
                    </button>
                  </div>
                )}
                <ol className="atlas-projects">
                  {curated.map((project, index) => (
                    <li key={project.id} data-project={project.id}>
                      <div className="atlas-project-top">
                        <span className="atlas-index">{n(index + 1)}</span>
                        <span className="atlas-badge">
                          {project.kind === 'DEMO' ? t.demo : t.reference}
                        </span>
                        <button
                          className="atlas-icon atlas-compare-add"
                          aria-label={`${compareIds.includes(project.id) ? t.removeCompare : t.compare}: ${name(project)}`}
                          aria-pressed={compareIds.includes(project.id)}
                          onClick={() => toggleCompare(project.id)}
                        >
                          {compareIds.includes(project.id) ? <Check /> : <Plus />}
                        </button>
                      </div>
                      <button
                        className="atlas-project-select"
                        onClick={() => selectProject(project.id)}
                      >
                        <h3>{name(project)}</h3>
                        <span>
                          {localField(project.community)} · {localField(project.city)}
                        </span>
                        <ArrowUpRight />
                      </button>
                      <p className="atlas-project-price">
                        <bdi>{price(project)}</bdi>
                      </p>
                      {project.priceLabel && (
                        <p className="atlas-small">
                          <bdi>{localField(project.priceLabel)}</bdi>
                        </p>
                      )}
                      <p className="atlas-card-basis">
                        {basis(project.basis)} · <bdi>{project.asOf || t.unknownDate}</bdi>
                        {project.sources[0] && (
                          <>
                            {' '}
                            ·{' '}
                            <a href={project.sources[0].url} target="_blank" rel="noreferrer">
                              <bdi>{project.sources[0].publisher}</bdi>
                            </a>
                          </>
                        )}
                      </p>
                      <p className="atlas-reason">
                        <strong>{t.reason}</strong>{' '}
                        {t.fitPlace
                          .replace('{community}', localField(project.community))
                          .replace('{place}', place ? name(place) : localField(project.city))}
                      </p>
                      <p className="atlas-tradeoff">
                        <strong>{t.tradeoff}</strong>{' '}
                        {project.kind === 'DEMO' ? t.demoTradeoff : t.referenceTradeoff}
                      </p>
                    </li>
                  ))}
                </ol>
              </>
            )}
            <p className="atlas-privacy">{t.privacy}</p>
          </div>
        </aside>
        <div className="atlas-map-toolbar">
          <button
            ref={toolsButton}
            className="atlas-tool-toggle"
            aria-expanded={toolsOpen}
            aria-controls="atlas-tools"
            onClick={() => setToolsOpen(!toolsOpen)}
          >
            <SlidersHorizontal />
            {t.tools}
            {toolsOpen ? <X /> : <ChevronDown />}
          </button>
          <button
            className="atlas-icon atlas-surface"
            aria-label={depth ? t.flat : t.depth}
            aria-pressed={depth}
            onClick={() => {
              setDepth(!depth);
              setCamera({ ...camera, pitch: depth ? 0 : 52, key: `depth-${Date.now()}` });
            }}
          >
            <Compass />
          </button>
        </div>
        {toolsOpen && (
          <section
            id="atlas-tools"
            className="atlas-tools"
            aria-label={t.tools}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setToolsOpen(false);
                toolsButton.current?.focus();
              }
            }}
          >
            <button
              className="atlas-text-button"
              aria-pressed={arabicIndicDigits}
              onClick={() => setArabicIndicDigits(!arabicIndicDigits)}
            >
              <span aria-hidden="true">١٢٣</span>
              {t.digits}
              {arabicIndicDigits && <Check />}
            </button>
            <h2>
              <Layers />
              {t.layers}
            </h2>
            <div className="atlas-layer-chips">
              {layerIds.map((layer) => (
                <button
                  key={layer}
                  aria-pressed={layers.includes(layer)}
                  onClick={() =>
                    setLayers(
                      layers.includes(layer)
                        ? layers.filter((item) => item !== layer)
                        : [...layers, layer],
                    )
                  }
                >
                  {t[layer]}
                </button>
              ))}
            </div>
            <p className="atlas-small">{t.poiNote}</p>
            <h2>{t.reach}</h2>
            <label htmlFor="atlas-origin">{t.origin}</label>
            <select
              id="atlas-origin"
              value={origin}
              onChange={(event) => {
                const value = event.target.value as Origin;
                setOrigin(value);
                setPicking(false);
                if (origins[value])
                  setIsochrone({
                    center: origins[value]!,
                    minutes,
                    label:
                      value === 'office' ? t.myOffice : value === 'school' ? t.mySchool : t.point,
                  });
                else setIsochrone(null);
              }}
            >
              <option value="point">{t.point}</option>
              <option value="office">{t.myOffice}</option>
              <option value="school">{t.mySchool}</option>
            </select>
            <button
              className="atlas-action"
              onClick={() => {
                setPicking(true);
                setToolsOpen(false);
                setExpanded(false);
                requestAnimationFrame(() =>
                  mapSurface.current
                    ?.querySelector<HTMLElement>('.maplibregl-canvas, .atlas-fallback')
                    ?.focus({ preventScroll: true }),
                );
              }}
            >
              <MapPin />
              {t.pickPoint}
            </button>
            <div className="atlas-minute-options">
              {([10, 20, 30] as const).map((value) => (
                <button
                  key={value}
                  aria-pressed={isochrone?.minutes === value}
                  onClick={() => changeMinutes(value)}
                >
                  {n(value)} {t.minutes}
                </button>
              ))}
            </div>
            <p className="atlas-small">{digitsText(t.reachNote)}</p>
            {isochrone && (
              <button className="atlas-text-button" onClick={() => setIsochrone(null)}>
                {t.removeReach}
              </button>
            )}
            <button className="atlas-action" aria-pressed={sun} onClick={() => setSun(!sun)}>
              <Sun />
              {t.sun}
              {sun && <Check />}
            </button>
            {sun && <p className="atlas-small">{t.sunNote}</p>}
          </section>
        )}
        {picking && (
          <div className="atlas-picking" role="status">
            <MapPin />
            <p>{t.picking}</p>
            <button aria-label={t.cancel} onClick={() => setPicking(false)}>
              <X />
            </button>
          </div>
        )}
        <section className="atlas-stories" aria-label={t.stories}>
          <div className="atlas-story-select">
            <span className="atlas-eyebrow">{t.stories}</span>
            <select
              aria-label={t.stories}
              value={storyId}
              onChange={(event) => chooseStory(event.target.value)}
            >
              <option value="">{t.stories}</option>
              {ATLAS_STORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {name(item)}
                </option>
              ))}
            </select>
          </div>
          {story && place && (
            <div className="atlas-story-active">
              <div>
                <span className="atlas-eyebrow">
                  {t.stop} {n(storyStep + 1)} / {n(story.places.length)}
                </span>
                <h2>{name(place)}</h2>
                <p>
                  {t.storyStops[place.id as keyof typeof t.storyStops] ||
                    (arabic ? story.captionAr : story.captionEn)}
                </p>
              </div>
              <div className="atlas-story-actions">
                <button
                  aria-label={t.previous}
                  disabled={storyStep === 0}
                  onClick={() => {
                    setPlaying(false);
                    setStoryStep(storyStep - 1);
                  }}
                >
                  <ChevronLeft />
                </button>
                <button
                  aria-label={playing ? t.pause : t.play}
                  disabled={reduced || story.places.length < 2}
                  onClick={() => {
                    if (!playing && storyStep === story.places.length - 1) setStoryStep(0);
                    setPlaying(!playing);
                  }}
                >
                  {playing ? <Pause /> : <Play />}
                </button>
                <button
                  aria-label={t.next}
                  disabled={storyStep === story.places.length - 1}
                  onClick={() => {
                    setPlaying(false);
                    setStoryStep(storyStep + 1);
                  }}
                >
                  <ChevronRight />
                </button>
              </div>
              {reduced && <p className="atlas-small">{t.reduced}</p>}
            </div>
          )}
        </section>
        {mobile && !expanded && comparison.length > 0 && (
          <button
            className="atlas-comparison-peek"
            onClick={() => {
              setExpanded(true);
              requestAnimationFrame(() => comparisonHeading.current?.focus());
            }}
          >
            {t.comparisonOpen} · {n(comparison.length)} <ChevronUp />
          </button>
        )}
        <div className="atlas-status atlas-sr" role="status" aria-live="polite">
          {status}
        </div>
      </main>
    </div>
  );
}
