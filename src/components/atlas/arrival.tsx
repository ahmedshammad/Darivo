'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  LockKeyhole,
  Mic,
  Moon,
  Sparkles,
  Square,
  Sun,
} from 'lucide-react';
import { arrivalCopy } from '@/messages/arrival';
import { usePreferences } from '@/src/components/preferences';
import { ATLAS_PLACES, ATLAS_STORIES, parseAtlasIntent } from '@/src/lib/atlas-intent';
import type {
  AtlasCamera,
  AtlasData,
  AtlasLocale,
  AtlasTheme,
  LivingMapProps,
} from '@/src/lib/atlas';
import './arrival.css';

const LivingMap = dynamic<LivingMapProps>(() => import('./living-map').then((m) => m.LivingMap), {
  ssr: false,
});
const wideCamera: AtlasCamera = {
  center: [42, 27],
  zoom: 2.3,
  pitch: 0,
  bearing: 0,
  key: 'arrival-world',
};
type SpeechInstance = {
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
type SpeechConstructor = new () => SpeechInstance;

export function Arrival({
  data,
  locale,
  initialTheme = 'dark',
  signedIn = false,
  viewerRole,
}: {
  data: AtlasData;
  locale: AtlasLocale;
  initialTheme?: AtlasTheme;
  signedIn?: boolean;
  viewerRole?: string;
}) {
  const t = arrivalCopy[locale];
  const { arabicIndicDigits } = usePreferences();
  const digits = (text: string) => {
    const latin = text.replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
    return arabicIndicDigits
      ? latin.replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)])
      : latin;
  };
  const router = useRouter();
  const [theme, setTheme] = useState(initialTheme);
  const [value, setValue] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [camera, setCamera] = useState<AtlasCamera>(wideCamera);
  const [mapStatus, setMapStatus] = useState<'loading' | 'webgl' | 'fallback'>('loading');
  const [voiceStatus, setVoiceStatus] = useState('');
  const [listening, setListening] = useState(false);
  const speech = useRef<SpeechInstance | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const approached = useRef(false);
  const intent = useMemo(() => parseAtlasIntent(value, data.projects), [value, data.projects]);
  const places = intent.places
    .map((id) => ATLAS_PLACES.find((p) => p.id === id))
    .filter((p) => !!p);
  const query = useCallback(
    (parameters: Record<string, string> = {}) =>
      new URLSearchParams({ theme, ...parameters }).toString(),
    [theme],
  );
  const ready = useCallback((mode: 'webgl' | 'fallback') => setMapStatus(mode), []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const mobile = window.innerWidth < 700;
      setCamera(
        intent.camera
          ? {
              ...intent.camera,
              key: `arrival-${intent.camera.key}`,
              padding: mobile
                ? { top: 320, bottom: 340, left: 20, right: 20 }
                : { top: 220, bottom: 230, left: 20, right: 20 },
            }
          : {
              ...wideCamera,
              key: mobile ? 'arrival-world-mobile' : 'arrival-world',
              zoom: mobile ? 1.35 : wideCamera.zoom,
              padding: { top: 0, bottom: 0, left: 0, right: 0 },
            },
      );
    }, 400);
    return () => window.clearTimeout(timer);
  }, [intent.camera]);
  useEffect(() => {
    if (mapStatus !== 'webgl' || value || approached.current) return;
    const timer = window.setTimeout(() => {
      approached.current = true;
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const center: [number, number] =
        zone === 'Africa/Cairo' ? [32, 29] : zone === 'Asia/Dubai' ? [48, 26] : [42, 27];
      setCamera({
        center,
        zoom: window.innerWidth < 700 ? 1.5 : 2.5,
        pitch: 0,
        bearing: 0,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        key: `arrival-approach-${zone}`,
      });
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [mapStatus, value]);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches || focused || value) return;
    const timer = window.setInterval(() => {
      if (!motion.matches && document.visibilityState === 'visible')
        setPromptIndex((n) => (n + 1) % t.prompts.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [focused, value, t.prompts.length]);
  useEffect(
    () => () => {
      speech.current?.abort();
    },
    [],
  );
  function explore(text = value) {
    if (text.trim()) router.push(`/${locale}/explore?${query({ q: text.trim() })}`);
    else input.current?.focus();
  }
  function voice() {
    if (listening) {
      speech.current?.stop();
      return;
    }
    const browser = window as Window & {
      SpeechRecognition?: SpeechConstructor;
      webkitSpeechRecognition?: SpeechConstructor;
    };
    const Recognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceStatus(t.voiceUnavailable);
      input.current?.focus();
      return;
    }
    const recognition = new Recognition();
    speech.current = recognition;
    recognition.lang = locale === 'ar' ? 'ar-AE' : 'en-AE';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ');
      setValue(transcript.slice(0, 1500));
      setVoiceStatus(t.voiceDone);
    };
    recognition.onerror = (event) => {
      setVoiceStatus(event.error === 'not-allowed' ? t.voiceDenied : t.voiceFailed);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    try {
      recognition.start();
      setListening(true);
      setVoiceStatus(t.listening);
    } catch {
      setVoiceStatus(t.voiceFailed);
      setListening(false);
    }
  }
  function basisLabel(value: string) {
    return /PRESS/i.test(value)
      ? t.press
      : /LISTING/i.test(value)
        ? t.listing
        : /DEVELOPER/i.test(value)
          ? t.developer
          : /DEMO/i.test(value)
            ? t.demo
            : t.reference;
  }
  return (
    <div className="arrival-system" data-theme={theme} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <a className="arrival-skip" href="#main">
        {t.skip}
      </a>
      <section
        className="arrival-stage"
        aria-labelledby="arrival-title"
        data-active-intent={intent.recognized || undefined}
      >
        <div className="arrival-map">
          <LivingMap
            projects={data.projects}
            pois={data.pois}
            locale={locale}
            theme={theme}
            arabicIndicDigits={arabicIndicDigits}
            mode="arrival"
            camera={camera}
            highlightedIds={intent.projectIds}
            layers={intent.layers}
            isochrone={
              intent.isochroneMinutes && intent.camera
                ? { center: intent.camera.center, minutes: intent.isochroneMinutes, label: value }
                : null
            }
            onReady={ready}
            onSelect={(id) => router.push(`/${locale}/explore?${query({ project: id })}`)}
          />
        </div>
        <header className="arrival-header">
          <Link className="arrival-wordmark" href={`/${locale}?${query()}`} lang="en">
            DARIVO
          </Link>
          <Link className="arrival-nav" href={`/${locale}/explore?${query()}`}>
            {t.explore}
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <div className="arrival-utilities">
            <Link
              href={`/${signedIn ? locale + '/profile' : locale + '/login'}?${query()}`}
              className="arrival-access"
              aria-label={signedIn ? t.profile : t.private}
            >
              <LockKeyhole aria-hidden="true" />
              <span>{signedIn ? t.profile : t.private}</span>
            </Link>
            <Link
              className="arrival-language"
              href={`/${locale === 'en' ? 'ar' : 'en'}?${query()}`}
              lang={locale === 'en' ? 'ar' : 'en'}
            >
              {t.language}
            </Link>
            <button
              type="button"
              className="arrival-icon"
              aria-label={t.theme}
              onClick={() => {
                const next = theme === 'dark' ? 'light' : 'dark';
                setTheme(next);
                history.replaceState(null, '', `?theme=${next}`);
              }}
            >
              {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
            {signedIn && (
              <button
                type="button"
                className="arrival-signout"
                onClick={() => signOut({ callbackUrl: `/${locale}?${query()}` })}
              >
                {t.signOut}
              </button>
            )}
          </div>
        </header>
        <main id="main" className="arrival-content">
          <div className="arrival-heading">
            <p className="arrival-eyebrow">{t.eyebrow}</p>
            <h1 id="arrival-title">
              {t.title} <em>{t.emphasis}</em>
            </h1>
            <p>
              {t.intro}
              <br />
              {t.invitation}
            </p>
          </div>
          <div className="arrival-shores">
            {[
              { id: 'north-coast', title: t.egypt, detail: t.egyptPlaces, number: '01' },
              { id: 'dubai', title: t.uae, detail: t.uaePlaces, number: '02' },
            ].map((shore) => (
              <Link
                key={shore.id}
                href={`/${locale}/explore?${query({ place: shore.id })}`}
                className="arrival-shore"
              >
                <span className="arrival-eyebrow">
                  <bdi>{digits(shore.number)}</bdi> /{' '}
                  {shore.id === 'dubai'
                    ? locale === 'ar'
                      ? 'الإمارات'
                      : 'UAE'
                    : locale === 'ar'
                      ? 'مصر'
                      : 'EGYPT'}
                </span>
                <h2>{shore.title}</h2>
                <p>{shore.detail}</p>
                <span className="arrival-shore-action">
                  {t.marketCta}
                  <ArrowUpRight aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
          <div className="arrival-conversation">
            <div className="arrival-suggestions">
              {t.suggestions.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setValue(digits(t.suggestionPrompts[i]));
                    input.current?.focus();
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <form
              className="arrival-composer"
              onSubmit={(event) => {
                event.preventDefault();
                explore();
              }}
            >
              <Sparkles className="arrival-spark" aria-hidden="true" />
              <label className="arrival-sr" htmlFor="arrival-intent">
                {t.request}
              </label>
              <input
                id="arrival-intent"
                ref={input}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                maxLength={1500}
                autoComplete="off"
                placeholder={digits(t.prompts[promptIndex])}
              />
              <button
                className={`arrival-icon ${listening ? 'is-listening' : ''}`}
                type="button"
                onClick={voice}
                aria-label={listening ? t.stopVoice : t.voice}
                title={t.voicePrivacy}
                aria-pressed={listening}
              >
                {listening ? <Square aria-hidden="true" /> : <Mic aria-hidden="true" />}
              </button>
              <button
                type="submit"
                className="arrival-submit"
                aria-label={t.send}
                disabled={!value.trim()}
              >
                <ArrowRight aria-hidden="true" />
              </button>
            </form>
            <div className="arrival-composer-caption">
              <span>{t.conversation}</span>
              <span>{t.preview}</span>
            </div>
            <p className="arrival-feedback" role="status">
              {voiceStatus ||
                (value.trim()
                  ? places.length
                    ? places.map((p) => (locale === 'ar' ? p.nameAr : p.nameEn)).join(' · ')
                    : t.unknown
                  : '')}
            </p>
          </div>
        </main>
        <p className="arrival-map-status" role="status">
          {mapStatus === 'loading' ? t.mapLoading : mapStatus === 'fallback' ? t.mapFallback : ''}
        </p>
        <a className="arrival-down" href="#arrival-pulse">
          {t.scroll}
          <ArrowDown aria-hidden="true" />
        </a>
      </section>
      <div className="arrival-editorial">
        <section id="arrival-pulse" className="arrival-section" aria-labelledby="pulse-title">
          <div className="arrival-section-heading">
            <div>
              <p className="arrival-eyebrow">{t.pulse}</p>
              <h2 id="pulse-title">{t.pulseIntro}</h2>
            </div>
            <p>{t.reported}</p>
          </div>
          <div className="arrival-pulse-grid">
            {data.stats.map((stat, i) => (
              <article className="arrival-stat" key={stat.id}>
                <span className="arrival-stat-index">
                  <bdi>{digits(`0${i + 1}`)}</bdi>
                </span>
                <h3>{digits(locale === 'ar' ? (stat.metricAr ?? stat.metric) : stat.metric)}</h3>
                <p
                  className="arrival-stat-value"
                  lang={locale === 'ar' && stat.valueAr ? 'ar' : 'en'}
                  dir={locale === 'ar' && stat.valueAr ? 'rtl' : 'ltr'}
                >
                  {digits(locale === 'ar' ? (stat.valueAr ?? stat.value) : stat.value)}
                </p>
                {stat.detail && (
                  <p
                    className="arrival-stat-detail"
                    lang={locale === 'ar' && stat.detailAr ? 'ar' : 'en'}
                    dir={locale === 'ar' && stat.detailAr ? 'rtl' : 'ltr'}
                  >
                    {digits(locale === 'ar' ? (stat.detailAr ?? stat.detail) : stat.detail)}
                  </p>
                )}
                <div className="arrival-stat-meta">
                  <span>
                    {t.asOf} <bdi dir="ltr">{digits(stat.asOf ?? t.dateUnknown)}</bdi>
                  </span>
                  <span>
                    {t.basis}: {basisLabel(stat.sources[0]?.basis ?? '')}
                  </span>
                </div>
                <div className="arrival-source-links">
                  {stat.sources
                    .filter((source) => source.url.startsWith('https://'))
                    .map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t.source} · <bdi>{source.publisher || new URL(source.url).hostname}</bdi>
                        <ArrowUpRight aria-hidden="true" />
                      </a>
                    ))}
                </div>
              </article>
            ))}
          </div>
          <p className="arrival-fine">{t.indicative}</p>
        </section>
        <section className="arrival-section" aria-labelledby="collections-title">
          <div className="arrival-section-heading">
            <div>
              <p className="arrival-eyebrow">{t.collectionKicker}</p>
              <h2 id="collections-title">{t.collections}</h2>
            </div>
          </div>
          <div className="arrival-collections">
            {ATLAS_STORIES.map((story, i) => (
              <Link
                key={story.id}
                href={`/${locale}/explore?${query({ story: story.id })}`}
                className={`arrival-collection arrival-collection-${story.id}`}
              >
                <span className="arrival-eyebrow">
                  <bdi>{digits(`0${i + 1}`)}</bdi>
                </span>
                <h3>{digits(locale === 'ar' ? story.nameAr : story.nameEn)}</h3>
                <p>{digits(locale === 'ar' ? story.captionAr : story.captionEn)}</p>
                <span className="arrival-collection-action">
                  {t.story}
                  <ArrowUpRight aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="arrival-section" aria-labelledby="developers-title">
          <div className="arrival-section-heading">
            <div>
              <p className="arrival-eyebrow">{t.developerKicker}</p>
              <h2 id="developers-title">{t.developers}</h2>
            </div>
            <p>{t.developerNote}</p>
          </div>
          <div className="arrival-developers">
            {data.developers.map((developer) => (
              <Link
                href={`/${locale}/explore?${query({ developer: developer.id })}`}
                key={developer.id}
                aria-label={`${locale === 'ar' ? developer.nameAr : developer.nameEn} · ${t.developerAction}`}
              >
                <bdi>{locale === 'ar' ? developer.nameAr : developer.nameEn}</bdi>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
        <section className="arrival-office" aria-labelledby="office-title">
          <LockKeyhole aria-hidden="true" />
          <p className="arrival-eyebrow">{t.officeKicker}</p>
          <h2 id="office-title">{t.officeTitle}</h2>
          <p>{t.officeBody}</p>
          <Link
            href={`/${locale}/${signedIn ? 'shortlists' : 'login'}?${query()}`}
            className="arrival-office-action"
          >
            {t.officeAction}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </section>
        <footer className="arrival-footer">
          <Link className="arrival-wordmark" href={`/${locale}?${query()}`} lang="en">
            DARIVO
          </Link>
          <div>
            <p>{t.footer}</p>
            <p>{t.disclosure}</p>
          </div>
          <nav aria-label={t.private}>
            <Link href={`/${locale}/privacy`}>{t.privacy}</Link>
            <Link href={`/${locale}/search`}>{t.legacyCollection}</Link>
            <Link href={`/${locale}/consultant`}>{t.consultant}</Link>
            {(viewerRole === 'ADVISOR' || viewerRole === 'ADMIN') && (
              <Link href={`/${locale}/advisor`}>{t.advisor}</Link>
            )}
            {viewerRole === 'ADMIN' && <Link href={`/${locale}/admin`}>{t.admin}</Link>}
          </nav>
        </footer>
      </div>
    </div>
  );
}
