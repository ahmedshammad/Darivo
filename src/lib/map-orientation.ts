/** Screen-space guards supplement symbol collision: deck targets and DOM controls
 * do not participate in MapLibre's symbol placement. Coordinates are CSS pixels. */
export type MapLabelRect = { x: number; y: number; width: number; height: number };
export type MapLabelCandidate = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
export const ORIENTATION_PLACE_IDS = [
  'palm',
  'jebel-ali',
  'jumeirah-bay',
  'downtown',
  'dubai-hills',
  'saadiyat',
] as const;

export function mapLabelIntersects(a: MapLabelRect, b: MapLabelRect, gap = 4) {
  return (
    a.x < b.x + b.width + gap &&
    a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap &&
    a.y + a.height + gap > b.y
  );
}

/** Candidate order is priority. Never force a label into an occupied viewport. */
export function placeMapOrientationLabels({
  candidates,
  obstacles,
  width,
  height,
  limit,
}: {
  candidates: MapLabelCandidate[];
  obstacles: MapLabelRect[];
  width: number;
  height: number;
  limit: number;
}) {
  const placed: { id: string; rect: MapLabelRect; offset: [number, number] }[] = [];
  for (const candidate of candidates) {
    if (placed.length >= limit) break;
    const { x, y, width: w, height: h } = candidate;
    if (
      ![x, y, w, h].every(Number.isFinite) ||
      w <= 0 ||
      h <= 0 ||
      x < 0 ||
      x > width ||
      y < 0 ||
      y > height
    )
      continue;
    // Keep the label's nearest edge beyond a 22px-radius project target.
    const offsets: [number, number][] = [
      [0, -28 - h / 2],
      [0, 28 + h / 2],
      [28 + w / 2, 0],
      [-28 - w / 2, 0],
    ];
    for (const offset of offsets) {
      const rect = { x: x + offset[0] - w / 2, y: y + offset[1] - h / 2, width: w, height: h };
      if (
        rect.x < 8 ||
        rect.y < 8 ||
        rect.x + w > width - 8 ||
        rect.y + h > height - 8 ||
        obstacles.some((obstacle) => mapLabelIntersects(rect, obstacle)) ||
        placed.some((other) => mapLabelIntersects(rect, other.rect))
      )
        continue;
      placed.push({ id: candidate.id, rect, offset });
      break;
    }
  }
  return placed;
}
