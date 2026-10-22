import { afterAll, expect, it } from 'vitest';
import { db } from '../src/server/db/client';
import { emptyConciergeBrief } from '../src/lib/concierge';
import { buildAreaGuide } from '../src/server/concierge/area-guide';

afterAll(() => db.$disconnect());
it('teaches three Dubai locations with scoped fictional examples and exact Demo community figures', async () => {
  const result = await buildAreaGuide('dubai', {
    brief: emptyConciergeBrief(),
    viewer: null,
    turnId: 'guide-turn',
    requestId: 'guide-request',
    callId: 'guide-call',
    message: 'Explain Dubai neighbourhoods near a British school',
  });
  expect(result.components[0].kind).toBe('mini-map');
  const qualification = result.components.find((component) => component.kind === 'notice');
  expect(qualification?.text.en).toContain('Dubai Hills inland to the south');
  expect(qualification?.text.ar).toContain('دبي هيلز إلى الداخل جنوباً');
  expect(result.components.filter((component) => component.kind === 'notice')).toHaveLength(1);
  expect(
    result.components
      .filter((component) => component.kind === 'mini-map')
      .flatMap((component) => component.entities.map((entity) => entity.id)),
  ).toEqual(['palm', 'dubai-hills', 'downtown']);
  const component = result.components.find((component) => component.kind === 'project-cards');
  expect(component?.cards).toHaveLength(3);
  for (const card of component?.cards ?? []) {
    expect(card.kind).toBe('demo-unit');
    if (card.kind !== 'demo-unit') throw new Error('unit_required');
    const unit = await db.property.findUniqueOrThrow({
      where: { id: card.unitId },
      include: { community: { include: { insight: true } } },
    });
    expect(unit.visibility).toBe('PUBLIC');
    expect(card.facts.find((fact) => fact.key === 'area-average-aed-sqm')?.value).toBe(
      unit.community.insight?.averageAedSqm,
    );
    expect(card.facts.find((fact) => fact.key === 'area-yield-high')?.value).toBe(
      unit.community.insight?.yieldHigh,
    );
    expect(card.sources.find((source) => source.id === `${unit.communityId}:area-demo`)?.kind).toBe(
      'demo',
    );
    expect(card.tradeoff.text.en).toContain('unverified');
  }
  expect(result.proposals).toEqual([]);
});
