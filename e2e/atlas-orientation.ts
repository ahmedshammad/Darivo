import type { Page } from '@playwright/test';

/** Test-only React-ref lookup. Never expose the renderer on a production global.
 * Return serializable measurements, not the MapLibre instance or React objects. */
export async function readOrientationState(page: Page) {
  return page.locator('.living-map').evaluate((element) => {
    type Rect = { x: number; y: number; width: number; height: number };
    type Project = { center: [number, number] };
    type TestMap = {
      getContainer(): HTMLElement;
      isMoving(): boolean;
      areTilesLoaded(): boolean;
      getLayer(id: string): unknown;
      getLayoutProperty(id: string, property: string): unknown;
      project(point: [number, number]): { x: number; y: number };
      queryRenderedFeatures(options: { layers: string[] }): {
        properties: { id?: string; name?: string };
      }[];
    };
    type Hook = {
      memoizedState?: { current?: { map?: TestMap; projects?: Project[] } };
      next?: Hook;
    };
    type Fiber = { memoizedState?: Hook; return?: Fiber };
    const key = Object.keys(element).find((key) => key.startsWith('__reactFiber$'));
    let fiber = key ? (element as unknown as Record<string, Fiber>)[key] : undefined;
    let runtime: { map?: TestMap; projects?: Project[] } | undefined;
    for (let depth = 0; fiber && depth < 30; depth++, fiber = fiber.return) {
      for (
        let hook = fiber.memoizedState, count = 0;
        hook && count < 50;
        count++, hook = hook.next
      ) {
        const candidate = hook.memoizedState?.current;
        if (typeof candidate?.map?.queryRenderedFeatures !== 'function') continue;
        const container = candidate.map.getContainer();
        if (container.closest('.living-map') !== element || !element.contains(container)) continue;
        runtime = candidate;
        break;
      }
      if (runtime) break;
    }
    const map = runtime?.map;
    if (!map || !map.getLayer('atlas-orientation-text')) return null;
    const viewport = map.getContainer().getBoundingClientRect();
    const scope = element.closest('.atlas-explore');
    const controls = [
      ...(scope?.querySelectorAll(
        [
          '.atlas-header',
          '.atlas-conversation',
          '.atlas-map-toolbar',
          '.atlas-tools',
          '.atlas-picking',
          '.atlas-stories',
          '.atlas-comparison-peek',
          '.atlas-map-evidence',
          '.atlas-map-legend',
          '.maplibregl-ctrl',
          '.maplibregl-popup',
        ].join(','),
      ) ?? []),
    ].flatMap((control) => {
      const rect = control.getBoundingClientRect();
      const style = getComputedStyle(control);
      if (!rect.width || !rect.height || style.visibility === 'hidden' || style.display === 'none')
        return [];
      return [
        {
          x: rect.left - viewport.left,
          y: rect.top - viewport.top,
          width: rect.width,
          height: rect.height,
        },
      ];
    });
    return {
      moving: map.isMoving(),
      tilesReady: map.areTilesLoaded(),
      visibility: String(
        map.getLayoutProperty('atlas-orientation-text', 'visibility') ?? 'visible',
      ),
      planned: JSON.parse(element.getAttribute('data-orientation-placements') || '[]') as {
        id: string;
        rect: Rect;
      }[],
      rendered: map
        .queryRenderedFeatures({ layers: ['atlas-orientation-text'] })
        .map((feature) => ({
          id: feature.properties.id,
          name: feature.properties.name,
        })),
      controls,
      targets: (runtime?.projects ?? []).map((project) => {
        const point = map.project(project.center);
        return { x: point.x - 22, y: point.y - 22, width: 44, height: 44 };
      }),
      width: viewport.width,
      height: viewport.height,
    };
  });
}
