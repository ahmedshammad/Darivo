'use client';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AtlasCamera, AtlasData, AtlasLayer } from '@/src/lib/atlas';
import type { StoryDTO } from '@/src/lib/story';
import { storyCopy, type StoryLocale } from '@/messages/story';
import { formatNumber } from '@/src/lib/format';
import { FX_DATE } from '@/src/lib/catalog';
import { exactStoryMapSubject } from './map-subject';
import { usePreferences } from '@/src/components/preferences';
const LivingMap = dynamic(
  () => import('@/src/components/atlas/living-map').then((module) => module.LivingMap),
  { ssr: false },
);
export function StoryMap({
  story,
  data,
  locale,
  theme,
  forceFallback,
}: {
  story: StoryDTO;
  data: Pick<AtlasData, 'projects' | 'pois'>;
  locale: StoryLocale;
  theme: 'dark' | 'light';
  forceFallback: boolean;
}) {
  const t = storyCopy[locale];
  const { arabicIndicDigits } = usePreferences();
  const region = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [layers, setLayers] = useState<AtlasLayer[]>([]);
  const [sun, setSun] = useState(false);
  const [camera, setCamera] = useState<AtlasCamera>({
    center: story.center,
    zoom: 12.4,
    pitch: 0,
    key: `story-${story.storySlug}`,
  });
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: '160px' },
    );
    if (region.current) observer.observe(region.current);
    return () => observer.disconnect();
  }, []);
  const projects = useMemo(
    () => (story.kind === 'DEMO_UNIT' ? [exactStoryMapSubject(story)] : data.projects),
    [story, data.projects],
  );
  const selected = projects.find((item) => item.id === story.entity.id)?.id ?? null;
  function change(pitch: number) {
    setCamera({ center: story.center, zoom: 12.4, pitch, key: `story-${Date.now()}` });
  }
  return (
    <div className="story-map-block" ref={region}>
      <div className="story-map-toolbar" aria-label={t.map} role="group">
        <button aria-pressed={camera.pitch === 0} onClick={() => change(0)}>
          {t.map2d}
        </button>
        <button aria-pressed={camera.pitch !== 0} onClick={() => change(48)}>
          {t.map3d}
        </button>
        <button onClick={() => change(camera.pitch ?? 0)}>{t.resetMap}</button>
        <button aria-pressed={sun} onClick={() => setSun(!sun)}>
          {t.sun}
        </button>
      </div>
      <div className="story-map" data-lenis-prevent data-testid="story-map">
        {active ? (
          <LivingMap
            projects={projects}
            pois={data.pois}
            locale={locale}
            theme={theme}
            arabicIndicDigits={arabicIndicDigits}
            mode="explore"
            camera={camera}
            selectedId={selected}
            hideSelectedPopup
            highlightedIds={selected ? [selected] : []}
            layers={layers}
            sun={sun}
            forceFallback={forceFallback}
          />
        ) : (
          <p className="story-map-placeholder">{t.mapLoading}</p>
        )}
      </div>
      <p className="story-support story-map-price-note">
        {t.mapPrice}{' '}
        <bdi className="story-map-fx-date">
          {arabicIndicDigits
            ? FX_DATE.replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)])
            : FX_DATE}
        </bdi>
        . {t.mapNoMatch}
      </p>
      <div className="story-map-layers" role="group" aria-label={t.map}>
        {(['beach', 'school', 'culture'] as const).map((layer) => (
          <button
            key={layer}
            aria-pressed={layers.includes(layer)}
            onClick={() =>
              setLayers((current) =>
                current.includes(layer)
                  ? current.filter((item) => item !== layer)
                  : [...current, layer],
              )
            }
          >
            {t[layer]}
          </button>
        ))}
      </div>
      {layers.length > 0 && (
        <p className="story-support" role="note">
          {t.demoLayers}
        </p>
      )}
      <p className="story-support">
        {t.approximate} ·{' '}
        <bdi dir="ltr">
          {formatNumber(story.center[1], locale, arabicIndicDigits, 3)},{' '}
          {formatNumber(story.center[0], locale, arabicIndicDigits, 3)}
        </bdi>
      </p>
      <p className="story-support">{t.mapHint}</p>
    </div>
  );
}
