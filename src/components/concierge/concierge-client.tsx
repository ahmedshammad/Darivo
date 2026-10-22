'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Mic,
  Moon,
  Square,
  Sun,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import { conciergeCopy, type ConciergeLocale } from '@/messages/concierge';
import type {
  AtlasCamera,
  AtlasData,
  AtlasIsochrone,
  AtlasLayer,
  AtlasTheme,
} from '@/src/lib/atlas';
import type { ConciergeAction, GroundedCard } from '@/src/lib/concierge';
import { isRepeatedDeadlineAssumption } from '@/src/lib/concierge-context';
import { ATLAS_PLACES, ATLAS_STORIES, projectInPlace } from '@/src/lib/atlas-intent';
import { openTileProvider } from '@/src/lib/tiles';
import { usePreferences } from '@/src/components/preferences';
import { useConcierge } from './use-concierge';
import { BriefEditor } from './brief-editor';
import './concierge.css';

// Evidence and confirmation details are needed only after a turn returns.
const ResponseComponent = dynamic(() =>
  import('./response-renderer').then((module) => module.ResponseComponent),
);
const ProposalDetails = dynamic(() =>
  import('./proposal-details').then((module) => module.ProposalDetails),
);

const LivingMap = dynamic(
  () => import('@/src/components/atlas/living-map').then((module) => module.LivingMap),
  { ssr: false },
);
type SpeechSession = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

export function ConciergeClient({
  locale,
  data,
  guest,
  initialDraft = '',
  initialTheme = 'dark',
  forceFallback = false,
}: {
  locale: ConciergeLocale;
  data: Pick<AtlasData, 'projects' | 'pois'>;
  guest: boolean;
  initialDraft?: string;
  initialTheme?: AtlasTheme;
  forceFallback?: boolean;
}) {
  const t = conciergeCopy[locale];
  const [theme, setTheme] = useState(initialTheme);
  const [draft, setDraft] = useState(initialDraft);
  const [tab, setTab] = useState<'conversation' | 'brief'>('conversation');
  const [expanded, setExpanded] = useState(true);
  const [camera, setCamera] = useState<AtlasCamera>({
    center: [42, 27],
    zoom: 3.3,
    pitch: 0,
    key: 'concierge-initial',
  });
  const [highlighted, setHighlighted] = useState<string[]>([]);
  const [layers, setLayers] = useState<AtlasLayer[]>([]);
  const [isochrone, setIsochrone] = useState<AtlasIsochrone | null>(null);
  const [comparison, setComparison] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [requestedComponent, setRequestedComponent] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState('loading');
  const [voicePrompt, setVoicePrompt] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [deletePrompt, setDeletePrompt] = useState(false);
  const [clearEpoch, setClearEpoch] = useState(0);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [dismissedProposals, setDismissedProposals] = useState<string[]>([]);
  const [localError, setLocalError] = useState('');
  const [actionReceipt, setActionReceipt] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [geometry, setGeometry] = useState({ width: 1440, height: 900 });
  const frame = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const reading = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const speech = useRef<SpeechSession | null>(null);
  const voiceBaseline = useRef('');
  const activeRequest = useRef<string | null>(null);
  const sendTicket = useRef(0);
  const ignoredRequest = useRef<string | null>(null);
  const dragStart = useRef<number | null>(null);
  const { arabicIndicDigits, setArabicIndicDigits } = usePreferences();
  const onAction = useCallback(
    (action: ConciergeAction) => {
      activeRequest.current = action.requestId;
      if (ignoredRequest.current === action.requestId) return;
      switch (action.type) {
        case 'map.flyTo':
          setCamera({ ...action.camera, key: action.id });
          break;
        case 'map.highlight':
          setHighlighted(action.entities.map((entity) => entity.id));
          break;
        case 'map.showLayer':
          setLayers((previous) =>
            action.visible
              ? [...new Set([...previous, action.layer])]
              : previous.filter((layer) => layer !== action.layer),
          );
          break;
        case 'map.drawIsochrone':
          setIsochrone({
            center: action.center,
            minutes: action.minutes,
            label: conciergeCopy[locale].map,
          });
          break;
        case 'ui.showComparison':
        case 'ui.showTimeline':
          setRequestedComponent(action.componentId);
          break;
        case 'map.story': {
          const story = ATLAS_STORIES.find((item) => item.id === action.storyId);
          if (story) setStoryId(story.id);
          break;
        }
        case 'brief.update':
          break;
      }
    },
    [locale],
  );
  const concierge = useConcierge({ locale, guest, initialDraft, onAction });
  const busy = concierge.status === 'submitted' || concierge.status === 'streaming';
  const components = concierge.turns.flatMap((turn) => turn.components);
  const cards = [
    ...new Map(
      components
        .flatMap((component) => ('cards' in component ? component.cards : []))
        .map((card) => [card.projectId, card]),
    ).values(),
  ];
  const mapHighlighted = [
    ...new Set(
      highlighted.flatMap((id) => {
        if (data.projects.some((project) => project.id === id)) return [id];
        const card = cards.find((item) => item.kind === 'demo-unit' && item.unitId === id);
        if (card) return [card.projectId];
        const place = ATLAS_PLACES.find((item) => item.id === id);
        return place
          ? data.projects
              .filter((project) => projectInPlace(project, place))
              .map((project) => project.id)
          : [];
      }),
    ),
  ];
  const requested = components.find((component) => component.id === requestedComponent);
  const effectiveComparison = comparison.length
    ? comparison
    : requested?.kind === 'comparison'
      ? requested.cards.map((card) => card.projectId)
      : [];
  const mobile = geometry.width <= 760;
  const signInHref = `/${locale}/login?returnTo=${encodeURIComponent(`/${locale}/concierge?${new URLSearchParams({ q: draft || concierge.brief.rawRequest, theme })}`)}`;
  const bottomPadding = mobile
    ? (expanded ? geometry.height * 0.74 : Math.max(geometry.height * 0.25, 206)) + 90
    : 120;
  const paddedCamera = {
    ...camera,
    padding: { top: mobile ? 110 : 64, bottom: bottomPadding, left: 48, right: 64 },
  };
  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) =>
      setGeometry({ width: window.innerWidth, height: entry.contentRect.height }),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(
    () => () => {
      speech.current?.abort();
      window.speechSynthesis?.cancel();
    },
    [],
  );
  const interruptMap = () => {
    ignoredRequest.current = concierge.turns.at(-1)?.requestId ?? activeRequest.current;
  };
  function selectCard(card: GroundedCard) {
    ignoredRequest.current = concierge.turns.at(-1)?.requestId ?? activeRequest.current;
    setSelectedId(card.projectId);
    setHighlighted([card.projectId]);
    setComparison([]);
    setRequestedComponent(null);
    if (card.center)
      setCamera({ center: card.center, zoom: 12.5, pitch: 45, key: `select-${Date.now()}` });
    setExpanded(false);
  }
  function compareCards(next: GroundedCard[]) {
    ignoredRequest.current = concierge.turns.at(-1)?.requestId ?? activeRequest.current;
    setComparison(next.slice(0, 4).map((card) => card.projectId));
    setRequestedComponent(null);
    setExpanded(false);
  }
  function toggleCompare(card: GroundedCard) {
    ignoredRequest.current = concierge.turns.at(-1)?.requestId ?? activeRequest.current;
    setRequestedComponent(null);
    setComparison((previous) =>
      previous.includes(card.projectId)
        ? previous.filter((id) => id !== card.projectId)
        : previous.length < 4
          ? [...previous, card.projectId]
          : previous,
    );
  }
  function focusReadingTarget(
    target: HTMLElement | null | undefined,
    align: 'start' | 'end' = 'start',
  ) {
    const container = reading.current;
    if (!container || !target) return;
    const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollTo({
      top: align === 'end' ? container.scrollHeight : container.scrollTop + offset,
      behavior: 'instant',
    });
    target.focus({ preventScroll: true });
  }
  async function send(text = draft) {
    if (!text.trim() || busy) return;
    speech.current?.stop();
    setTab('conversation');
    setExpanded(true);
    setRequestedComponent(null);
    setComparison([]);
    setLocalError('');
    const ticket = ++sendTicket.current;
    try {
      await concierge.submit(text.trim());
      if (ticket === sendTicket.current)
        setDraft((current) => (current.trim() === text.trim() ? '' : current));
    } catch {
      if (ticket === sendTicket.current) setLocalError(t.error);
    }
  }
  async function retry() {
    const ticket = ++sendTicket.current;
    const previousText = concierge.turns.at(-1)?.userText;
    setLocalError('');
    try {
      await concierge.retry();
      if (ticket === sendTicket.current)
        setDraft((current) => (current.trim() === previousText?.trim() ? '' : current));
    } catch {
      if (ticket === sendTicket.current) setLocalError(t.error);
    }
  }
  function stop() {
    sendTicket.current += 1;
    ignoredRequest.current = concierge.turns.at(-1)?.requestId ?? activeRequest.current;
    void concierge.stop().catch(() => setLocalError(t.error));
    input.current?.focus({ preventScroll: true });
    const root = frame.current?.querySelector<HTMLElement>('.living-map');
    if (root?.dataset.center) {
      try {
        setCamera({
          center: JSON.parse(root.dataset.center),
          zoom: Number(root.dataset.zoom) || camera.zoom,
          pitch: Number(root.dataset.pitch) || 0,
          key: `stop-${Date.now()}`,
        });
      } catch {
        /* The renderer may not have initialized. */
      }
    }
  }
  function startVoice() {
    setVoicePrompt(false);
    const browser = window as Window & {
      SpeechRecognition?: new () => SpeechSession;
      webkitSpeechRecognition?: new () => SpeechSession;
    };
    const Recognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceStatus(t.voiceUnavailable);
      input.current?.focus({ preventScroll: true });
      return;
    }
    speech.current?.abort();
    voiceBaseline.current = draft.trim();
    const recognition = new Recognition();
    speech.current = recognition;
    recognition.lang = locale === 'ar' ? 'ar-AE' : 'en-AE';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ');
      setDraft([voiceBaseline.current, transcript].filter(Boolean).join('\n').slice(0, 4000));
      setVoiceStatus(t.voiceDone);
    };
    recognition.onerror = (event) => {
      setListening(false);
      setVoiceStatus(event.error === 'not-allowed' ? t.voiceDenied : t.voiceFailed);
    };
    recognition.onend = () => setListening(false);
    try {
      recognition.start();
      setListening(true);
      setVoiceStatus(t.listening);
      input.current?.focus({ preventScroll: true });
    } catch {
      setVoiceStatus(t.voiceFailed);
    }
  }
  function readAloud(text: string) {
    if (!window.speechSynthesis) {
      setVoiceStatus(t.speechUnavailable);
      return;
    }
    window.speechSynthesis.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = /[\u0600-\u06ff]/.test(text) ? 'ar-AE' : 'en-GB';
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }
  const statusText =
    concierge.status === 'loading-history'
      ? t.loadingHistory
      : busy
        ? concierge.status === 'submitted'
          ? t.submitted
          : t.streaming
        : concierge.error
          ? t.error
          : concierge.turns.length
            ? concierge.turns.at(-1)?.status === 'cancelled'
              ? t.cancelled
              : t.complete
            : t.idle;
  return (
    <main
      id="main"
      className="concierge"
      data-theme={theme}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      data-sheet={expanded ? 'expanded' : 'collapsed'}
      data-testid="concierge"
    >
      <a href="#concierge-prompt" className="cq-skip">
        {t.prompt}
      </a>
      <header className="cq-header">
        <Link href={`/${locale}`} className="cq-wordmark" title={t.home}>
          DARIVO <span>PRIVATE PROPERTY OFFICE</span>
        </Link>
        <Link className="cq-atlas-link" href={`/${locale}/explore`}>
          {t.explore}
          <ArrowUpRight aria-hidden="true" />
        </Link>
        <nav aria-label={t.conversation}>
          <Link
            href={`/${locale === 'en' ? 'ar' : 'en'}/concierge?${new URLSearchParams({ q: draft || concierge.brief.rawRequest, theme })}`}
          >
            {t.language}
          </Link>
          <button
            className="cq-icon"
            aria-label={t.theme}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
        </nav>
      </header>
      <div
        className="cq-map"
        ref={frame}
        onPointerDownCapture={interruptMap}
        onKeyDownCapture={(event) => {
          if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '+', '-'].includes(event.key))
            interruptMap();
        }}
        role="region"
        aria-label={t.map}
        inert={mobile && expanded}
        aria-hidden={mobile && expanded}
      >
        <LivingMap
          projects={data.projects}
          pois={data.pois}
          locale={locale}
          theme={theme}
          mode="explore"
          camera={paddedCamera}
          highlightedIds={mapHighlighted}
          compareIds={effectiveComparison}
          layers={layers}
          isochrone={isochrone}
          selectedId={selectedId}
          hideSelectedPopup={mobile && expanded}
          arabicIndicDigits={arabicIndicDigits}
          forceFallback={forceFallback}
          onSelect={(id) => {
            const card = cards.find((item) => item.projectId === id);
            if (card) {
              setSelectedId(id);
              setTab('conversation');
              setExpanded(true);
              requestAnimationFrame(() =>
                focusReadingTarget(
                  reading.current?.querySelector<HTMLElement>(
                    `[data-project-id="${CSS.escape(id)}"] h3 button`,
                  ),
                ),
              );
            } else {
              const project = data.projects.find((item) => item.id === id);
              if (project) {
                setDraft(`${t.askProject} ${locale === 'ar' ? project.nameAr : project.nameEn}`);
                setTab('conversation');
                setExpanded(true);
                requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
              }
            }
          }}
          onReady={setMapMode}
        />
        <span className="cq-sr" role="status">
          {mapMode === 'loading' ? t.loadingHistory : t.map}
        </span>
      </div>
      <section className="cq-panel" ref={sheet} aria-label={t.conversation}>
        <button
          className="cq-sheet-handle"
          aria-expanded={expanded}
          aria-controls="concierge-reading"
          aria-label={expanded ? t.collapse : t.expand}
          onClick={() => {
            if (dragStart.current === -1) {
              dragStart.current = null;
              return;
            }
            setExpanded(!expanded);
          }}
          onPointerDown={(event) => {
            dragStart.current = event.clientY;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={(event) => {
            if (dragStart.current !== null && Math.abs(event.clientY - dragStart.current) > 40) {
              setExpanded(event.clientY < dragStart.current);
              event.preventDefault();
              dragStart.current = -1;
              return;
            }
            dragStart.current = null;
          }}
        >
          <span />
          {expanded ? <ChevronDown /> : <ChevronUp />}
        </button>
        <div className="cq-panel-toolbar">
          <div className="cq-tabs" role="group" aria-label={t.conversation}>
            <button
              aria-pressed={tab === 'conversation'}
              onClick={() => {
                setTab('conversation');
                setExpanded(true);
              }}
            >
              {t.conversation}
            </button>
            <button
              aria-pressed={tab === 'brief'}
              onClick={() => {
                setTab('brief');
                setExpanded(true);
              }}
            >
              {t.brief}
              {concierge.brief.markets.length > 0 && <span className="cq-dot" />}
            </button>
          </div>
          <button
            className="cq-icon"
            aria-label={`١٢٣ · ${t.digits}`}
            aria-pressed={arabicIndicDigits}
            onClick={() => setArabicIndicDigits(!arabicIndicDigits)}
          >
            <span aria-hidden="true">١٢٣</span>
          </button>
          <button
            className="cq-icon"
            aria-label={t.clear}
            onClick={() => setDeletePrompt(!deletePrompt)}
            disabled={busy}
          >
            <Trash2 />
          </button>
        </div>
        {deletePrompt && (
          <div className="cq-inline-confirm">
            <p>{t.clearQuestion}</p>
            <button
              onClick={async () => {
                try {
                  await concierge.clearHistory();
                  setDeletePrompt(false);
                  setClearEpoch((value) => value + 1);
                  setSelectedId(null);
                  setHighlighted([]);
                  setComparison([]);
                  setRequestedComponent(null);
                  setLayers([]);
                  setIsochrone(null);
                  setStoryId(null);
                  setDismissedProposals([]);
                  setActionReceipt('');
                  setLocalError('');
                  setCamera({ center: [42, 27], zoom: 3.3, pitch: 0, key: `clear-${Date.now()}` });
                } catch {
                  setLocalError(t.error);
                }
              }}
            >
              {t.confirm}
            </button>
            <button onClick={() => setDeletePrompt(false)}>{t.reject}</button>
          </div>
        )}
        <div className="cq-reading" id="concierge-reading" ref={reading} tabIndex={-1}>
          <h1 className="cq-sr">{t.title}</h1>
          <details className="cq-inline-map-sources">
            <summary>{t.mapReading}</summary>
            <p className="cq-fine">
              {mapMode === 'fallback' && `${t.mapFallback} `}
              {t.mapLimits}
            </p>
            <div className="cq-sources">
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
                  <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                    {source.label}
                  </a>
                ))
              )}
            </div>
          </details>
          <div hidden={tab !== 'conversation'}>
            {!concierge.turns.length && (
              <div className="cq-introduction">
                <p className="cq-eyebrow">{t.eyebrow}</p>
                <h2 className="cq-page-title">{t.title}</h2>
                <p>{t.intro}</p>
              </div>
            )}
            {!concierge.turns.length && (
              <div className="cq-examples">
                {t.examples.map((example, index) => (
                  <button
                    key={example.name}
                    disabled={busy || concierge.status === 'loading-history'}
                    onClick={() => {
                      setDraft(example.text);
                      void send(example.text);
                    }}
                  >
                    <span className="cq-example-number">0{index + 1}</span>
                    <span>
                      <strong>{example.name}</strong>
                      <small>{example.text}</small>
                    </span>
                    <ArrowUpRight aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
            <div className="cq-turns" role="log" aria-live="off" aria-label={t.conversation}>
              {concierge.turns.map((turn, turnIndex) => (
                <article
                  className="cq-turn"
                  key={turn.id}
                  data-testid="concierge-turn"
                  data-status={turn.status}
                >
                  <details className="cq-user-request">
                    <summary>
                      <span>{t.yourRequest}</span>
                      <span className="cq-request-preview" dir="auto">
                        {turn.userText}
                      </span>
                      <ChevronDown aria-hidden="true" />
                    </summary>
                    <p className="cq-user-message" dir="auto">
                      {turn.userText}
                    </p>
                  </details>
                  <div className="cq-assistant">
                    <h2 className="cq-sr">
                      {t.responseHeading.replace(
                        '{number}',
                        new Intl.NumberFormat(locale, {
                          useGrouping: false,
                          numberingSystem: arabicIndicDigits ? 'arab' : 'latn',
                        }).format(turnIndex + 1),
                      )}
                    </h2>
                    {turn.assistantText && (
                      <p className="cq-answer" dir="auto">
                        {turn.assistantText}
                      </p>
                    )}
                    {turn.components.map((component) => (
                      <div id={`component-${component.id}`} key={component.id}>
                        <ResponseComponent
                          component={component}
                          repeatedDeadlineAssumption={isRepeatedDeadlineAssumption(
                            component,
                            concierge.turns,
                            turnIndex,
                          )}
                          projects={data.projects}
                          locale={locale}
                          comparison={effectiveComparison}
                          onSelect={selectCard}
                          onToggleCompare={toggleCompare}
                          onCompare={compareCards}
                          onReviewRequirements={() => {
                            setTab('brief');
                            setExpanded(true);
                            requestAnimationFrame(() => {
                              const target =
                                reading.current?.querySelector<HTMLElement>('#concierge-mustHaves');
                              target?.parentElement
                                ?.querySelectorAll<HTMLDetailsElement>(
                                  '.cq-constraint-editor details',
                                )
                                .forEach((details) => {
                                  details.open = true;
                                });
                              focusReadingTarget(target);
                            });
                          }}
                          onMap={(next, ids) => {
                            ignoredRequest.current =
                              concierge.turns.at(-1)?.requestId ?? activeRequest.current;
                            setComparison([]);
                            setRequestedComponent(null);
                            setSelectedId(null);
                            setCamera({ ...next, key: `preview-${Date.now()}` });
                            setHighlighted(ids);
                            setExpanded(false);
                          }}
                        />
                      </div>
                    ))}
                    {turn.status === 'cancelled' && <p className="cq-fine">{t.cancelled}</p>}
                    {turn.status === 'cancelled' &&
                      turn.id === concierge.turns.at(-1)?.id &&
                      !busy && (
                        <button className="cq-action" onClick={() => void retry()}>
                          {t.retry}
                        </button>
                      )}
                    {turn.status === 'failed' && <p className="cq-fine">{t.failed}</p>}
                    {turn.assistantText && (
                      <button
                        className="cq-text-button"
                        onClick={() => readAloud(turn.assistantText)}
                      >
                        <Volume2 aria-hidden="true" />
                        {speaking ? t.stopSpeaking : t.speak}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
            {storyId && (
              <p className="cq-story-invitation">
                <Link href={`/${locale}/explore?${new URLSearchParams({ story: storyId, theme })}`}>
                  {t.marketStory} <ArrowUpRight aria-hidden="true" />
                </Link>
              </p>
            )}
            {concierge.proposals.some((proposal) => !dismissedProposals.includes(proposal.id)) && (
              <section className="cq-proposals">
                <h2>{t.proposals}</h2>
                <p>{t.proposalNote}</p>
                {concierge.proposals
                  .filter((proposal) => !dismissedProposals.includes(proposal.id))
                  .map((proposal) => (
                    <div key={proposal.id}>
                      <p>{proposal.summary[locale]}</p>
                      <ProposalDetails proposal={proposal} cards={cards} locale={locale} />
                      {guest ? (
                        <Link className="cq-action" href={signInHref}>
                          {t.signIn}
                          <ArrowUpRight aria-hidden="true" />
                        </Link>
                      ) : (
                        <button
                          className="cq-action"
                          disabled={busy || confirming}
                          onClick={async () => {
                            setConfirming(true);
                            setLocalError('');
                            try {
                              const { status } = await concierge.confirmProposal(
                                proposal.id,
                                'confirm',
                              );
                              setActionReceipt(
                                status === 'CONFIRMED'
                                  ? t.actionReceipts[proposal.kind]
                                  : t.actionRejected,
                              );
                              input.current?.focus({ preventScroll: true });
                            } catch {
                              setLocalError(t.actionFailed);
                            } finally {
                              setConfirming(false);
                            }
                          }}
                        >
                          <Check aria-hidden="true" />
                          {t.confirm}
                        </button>
                      )}
                      <button
                        className="cq-text-button"
                        disabled={busy || confirming}
                        onClick={async () => {
                          if (guest) {
                            setDismissedProposals((previous) => [...previous, proposal.id]);
                            setActionReceipt(t.actionRejected);
                            input.current?.focus({ preventScroll: true });
                            return;
                          }
                          setConfirming(true);
                          setLocalError('');
                          try {
                            const { status } = await concierge.confirmProposal(
                              proposal.id,
                              'reject',
                            );
                            setActionReceipt(
                              status === 'CONFIRMED'
                                ? t.actionReceipts[proposal.kind]
                                : t.actionRejected,
                            );
                            input.current?.focus({ preventScroll: true });
                          } catch {
                            setLocalError(t.actionFailed);
                          } finally {
                            setConfirming(false);
                          }
                        }}
                      >
                        {t.reject}
                      </button>
                    </div>
                  ))}
              </section>
            )}
            <p
              className="cq-status"
              role="status"
              aria-atomic="true"
              data-testid="concierge-action-receipt"
            >
              {actionReceipt}
            </p>
            {(concierge.error || localError) && (
              <div className="cq-error" role="alert">
                <p>{localError || t.error}</p>
                {concierge.error?.retryable && (
                  <button className="cq-action" onClick={() => void retry()}>
                    {t.retry}
                  </button>
                )}
              </div>
            )}
            <div ref={end} tabIndex={-1} />
          </div>
          <div hidden={tab !== 'brief'}>
            <BriefEditor
              key={clearEpoch}
              brief={concierge.brief}
              locale={locale}
              busy={busy}
              guest={guest}
              signInHref={signInHref}
              onApply={concierge.applyBriefPatch}
            />
          </div>
        </div>
        <div className="cq-compose-zone">
          {effectiveComparison.length > 0 && (
            <button
              className="cq-text-button cq-comparison-action"
              onClick={() =>
                compareCards(cards.filter((card) => effectiveComparison.includes(card.projectId)))
              }
              disabled={effectiveComparison.length < 2}
            >
              <MapPin aria-hidden="true" />
              {t.compareMap} · {effectiveComparison.length}
            </button>
          )}
          {concierge.turns.length > 0 && expanded && (
            <button
              className="cq-latest"
              onClick={() => {
                setTab('conversation');
                requestAnimationFrame(() => {
                  focusReadingTarget(end.current, 'end');
                });
              }}
            >
              {t.newReply}
              <ChevronDown aria-hidden="true" />
            </button>
          )}
          <form
            className="cq-composer"
            data-empty={!draft.trim()}
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <label className="cq-sr" htmlFor="concierge-prompt">
              {t.prompt}
            </label>
            <textarea
              id="concierge-prompt"
              ref={input}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={4000}
              rows={2}
              placeholder={t.placeholder}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing &&
                  event.keyCode !== 229
                ) {
                  event.preventDefault();
                  void send();
                }
              }}
            />
            <div className="cq-composer-actions">
              <button
                type="button"
                className="cq-icon"
                aria-label={listening ? t.stopVoice : t.voice}
                aria-pressed={listening}
                onClick={() => {
                  if (listening) speech.current?.stop();
                  else setVoicePrompt(!voicePrompt);
                }}
              >
                <Mic />
              </button>
              {busy ? (
                <button
                  key="stop"
                  type="button"
                  className="cq-send"
                  aria-label={t.stop}
                  onClick={(event) => {
                    event.preventDefault();
                    stop();
                  }}
                >
                  <Square />
                </button>
              ) : (
                <button
                  key="send"
                  type="submit"
                  className="cq-send"
                  aria-label={t.send}
                  disabled={!draft.trim() || concierge.status === 'loading-history'}
                >
                  <ArrowUp />
                </button>
              )}
            </div>
          </form>
          {voicePrompt && (
            <div className="cq-inline-confirm">
              <p>{t.voicePrivacy}</p>
              <button onClick={startVoice}>{t.startVoice}</button>
              <button aria-label={t.reject} onClick={() => setVoicePrompt(false)}>
                <X />
              </button>
            </div>
          )}
          <p className="cq-status" role="status" aria-atomic="true">
            {voiceStatus || statusText}
          </p>
          <div className="cq-privacy-line">
            <span>
              {concierge.brief.privacy.doNotSave ? t.notSaving : guest ? t.guest : t.signedIn}
            </span>
            {guest && (
              <Link href={signInHref}>
                {t.signIn}
                <ArrowUpRight aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
