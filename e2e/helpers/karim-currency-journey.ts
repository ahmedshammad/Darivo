import { expect, type Page } from '@playwright/test';
import { conciergeCopy, type ConciergeLocale } from '../../messages/concierge';
import {
  conciergeStreamEventSchema,
  type ConciergeBrief,
  type ConciergeComponent,
  type ConciergeStreamEvent,
  type GroundedCard,
} from '../../src/lib/concierge';

export type KarimCheckpoint = {
  name: string;
  locale: ConciergeLocale;
  brief: ConciergeBrief;
  components: ConciergeComponent[];
  tools: string[];
};

/** Real UI + streamed API evidence; no mocked model/response or direct DB access. */
export async function runKarimCurrencyJourney(
  page: Page,
  options: {
    locale: ConciergeLocale;
    origin?: string;
    fallback?: boolean;
    checkpoint?: (evidence: KarimCheckpoint) => Promise<void>;
  },
) {
  const { locale } = options;
  const t = conciergeCopy[locale];
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(
    `${options.origin ?? ''}/${locale}/concierge${options.fallback ? '?fallback=1' : ''}`,
  );
  const turns = page.getByTestId('concierge-turn');
  const send = async (message: string): Promise<KarimCheckpoint> => {
    const count = await turns.count();
    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === '/api/v1/concierge',
    );
    await page.locator('#concierge-prompt').fill(message);
    await page.getByRole('button', { name: t.send, exact: true }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const events: ConciergeStreamEvent[] = (await response.text())
      .split('\n')
      .filter((line) => line.startsWith('data: ') && !line.includes('[DONE]'))
      .flatMap((line) => {
        const packet = JSON.parse(line.slice(6));
        return packet.type === 'data-concierge'
          ? [conciergeStreamEventSchema.parse(packet.data)]
          : [];
      });
    await expect(turns).toHaveCount(count + 1);
    await expect(turns.last()).toHaveAttribute('data-status', 'complete', { timeout: 30000 });
    const update = events.findLast((event) => event.type === 'brief.updated');
    if (!update || update.type !== 'brief.updated') throw new Error('Missing server Brief update');
    const components = new Map<string, ConciergeComponent>();
    for (const event of events)
      if (event.type === 'component.upsert') components.set(event.component.id, event.component);
    return {
      name: '',
      locale,
      brief: update.brief,
      components: [...components.values()],
      tools: events.flatMap((event) => (event.type === 'tool.started' ? [event.toolName] : [])),
    };
  };
  const record = async (name: string, state: KarimCheckpoint) => {
    if (options.checkpoint) await options.checkpoint({ ...state, name });
  };
  const cardList = (state: KarimCheckpoint) =>
    state.components.flatMap((component) => ('cards' in component ? component.cards : []));
  const format = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
      style: 'currency',
      currency,
      numberingSystem: 'latn',
      maximumFractionDigits: 0,
    }).format(amount);
  const initial = await send(
    locale === 'ar'
      ? 'بيت صيفي في الساحل الشمالي جاهز بحلول 2028، قارن باستثمار في دبي'
      : 'North Coast summer home ready by 2028, compare with a Dubai investment',
  );
  expect(initial.brief.markets).toHaveLength(2);
  expect(initial.components.some((component) => component.kind === 'comparison')).toBe(true);
  expect(initial.brief.markets.find((market) => market.country === 'Egypt')).toMatchObject({
    placeIds: ['north-coast'],
    purpose: 'holiday',
    deadline: { kind: 'year', year: 2028, boundary: 'by' },
  });
  expect(initial.brief.markets.find((market) => market.country === 'UAE')).toMatchObject({
    purpose: 'investment',
  });
  const originalMarkets = structuredClone(initial.brief.markets);
  let latest = initial;
  for (const display of ['USD', 'GBP'] as const) {
    latest = await send(
      locale === 'ar'
        ? `اعرض الأسعار بعملة ${display}${display === 'USD' ? '؛ الدفع بعملة EGP' : ''}`
        : `Display prices in ${display}${display === 'USD' ? '; pay in EGP' : ''}`,
    );
    expect(latest.brief.displayCurrencies).toEqual([display]);
    expect(latest.brief.paymentCurrency).toBe('EGP');
    expect(latest.brief.markets).toEqual(originalMarkets);
    const cards = cardList(latest);
    for (const [projectId, currency, amount] of [
      ['southmed', 'EGP', 91200000],
      ['orla-palm-jumeirah', 'AED', 57300000],
    ] as const) {
      const card = cards.find(
        (item) => item.kind === 'reference-project' && item.projectId === projectId,
      );
      expect(card, `Missing ${projectId} currency evidence`).toBeDefined();
      expect(card!.price!.native).toEqual({ currency, amount });
      expect(card!.price!.paymentCurrency).toBe('EGP');
      expect(card!.price!.converted).toHaveLength(1);
      const conversion = card!.price!.converted[0];
      const rate = (display === 'USD' ? 0.2723 : 0.209) / (currency === 'EGP' ? 13.5 : 1);
      expect(conversion).toMatchObject({
        money: { currency: display, amount: Math.round(amount * rate * 100) / 100 },
        method: 'STATIC_DEMO_FX',
        asOf: { value: '2026-10-01' },
      });
      expect(conversion.rate).toBeCloseTo(rate, 12);
      const article = turns
        .last()
        .locator(`[data-testid="concierge-project"][data-project-id="${projectId}"]`)
        .first();
      const price = article.locator('.cq-card-price');
      await price.locator('strong').first().scrollIntoViewIfNeeded();
      await expect(price.locator('strong').first()).toBeVisible();
      await expect(price.locator('strong').first()).toHaveText(format(amount, currency));
      const displayed = price.locator('.cq-conversion');
      await expect(displayed).toHaveCount(1);
      await displayed.locator('small').first().scrollIntoViewIfNeeded();
      await expect(displayed.locator('small').first()).toBeVisible();
      await expect(displayed.locator('small').first()).toContainText(
        format(conversion.money.amount, display),
      );
      await expect(displayed.locator('small').first()).toContainText(t.fx);
      await expect(displayed.locator('small').nth(1)).toContainText('2026-10-01');
      const details = displayed.locator('details');
      await details.locator('summary').click();
      await expect(details).toHaveAttribute('open', '');
      const rateText = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
        maximumFractionDigits: 8,
        numberingSystem: 'latn',
      }).format(rate);
      await expect(details.locator('p')).toContainText(rateText);
      await expect(details.locator('p')).toContainText(currency);
      await expect(details.locator('p')).toContainText(display);
      await details.locator('summary').click();
    }
    const firstPrice = turns.last().locator('[data-testid="concierge-project"]').first();
    await firstPrice.evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await record(`${display.toLowerCase()}-prices`, latest);
    await page.getByRole('button', { name: t.brief, exact: true }).click();
    const brief = page.getByTestId('concierge-brief');
    const currencies = brief.getByRole('group', { name: t.displayCurrency, exact: true });
    await expect(currencies.getByLabel(display, { exact: true })).toBeChecked();
    await expect(
      currencies.getByLabel(display === 'USD' ? 'GBP' : 'USD', { exact: true }),
    ).not.toBeChecked();
    await expect(brief.getByLabel(t.paymentCurrency, { exact: true })).toHaveValue('EGP');
    await currencies.evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await record(`${display.toLowerCase()}-brief`, latest);
    await page.getByRole('button', { name: t.conversation, exact: true }).click();
  }
  const stableBrief = (brief: ConciergeBrief) => {
    const { rawRequest, revision, provenance, ...rest } = brief;
    void rawRequest;
    void revision;
    void provenance;
    return rest;
  };
  const namedSchedule = async (before: KarimCheckpoint, name: string) => {
    const result = await send(
      locale === 'ar' ? 'اعرض خطة السداد في ساوث ميد' : 'Show SouthMED payment plan',
    );
    expect(result.tools).toEqual(['ui.showTimeline']);
    expect(stableBrief(result.brief)).toEqual(stableBrief(before.brief));
    expect(result.components).toHaveLength(1);
    expect(result.components[0]).toMatchObject({ kind: 'notice', code: 'UNKNOWN_FACT' });
    const notice = result.components[0];
    if (notice.kind !== 'notice') throw new Error('Expected explicit unknown schedule');
    expect(notice.text.en).toContain('SouthMED');
    expect(notice.text.ar).toContain('SouthMED');
    await expect(turns.last().getByTestId('concierge-project')).toHaveCount(0);
    await expect(turns.last()).toContainText('SouthMED');
    await turns.last().evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await record(name, result);
    return result;
  };
  latest = await namedSchedule(latest, 'southmed-after-comparison');
  latest = await send(
    locale === 'ar'
      ? 'اعرض وحدات تجريبية دار الفناء 001 في نخلة جميرا'
      : 'Show demo units The Courtyard 001 in Palm Jumeirah',
  );
  const unit = cardList(latest).find(
    (card): card is Extract<GroundedCard, { kind: 'demo-unit' }> =>
      card.kind === 'demo-unit' && card.unitId === 'property-001',
  );
  expect(unit).toBeDefined();
  expect(unit!.price!.native).toEqual({ currency: 'AED', amount: 42980000 });
  const beforeTimeline = latest;
  latest = await send(
    locale === 'ar' ? 'اعرض خطة السداد للأول' : 'Show payment plan for the first one',
  );
  const timeline = latest.components.find((component) => component.kind === 'payment-timeline');
  expect(timeline).toBeDefined();
  if (!timeline || timeline.kind !== 'payment-timeline')
    throw new Error('Missing exact demo-unit timeline');
  expect(timeline.entity).toEqual({ kind: 'unit', id: 'property-001' });
  expect(timeline.price.native).toEqual({ currency: 'AED', amount: 42980000 });
  expect(timeline.price.paymentCurrency).toBe('EGP');
  expect(timeline.price.converted.map((value) => value.money.currency)).toEqual(['GBP']);
  expect(timeline.mode).toBe('DEMO_ESTIMATE');
  expect(timeline.schedule.map((step) => step.percent)).toEqual([20, 40, 40]);
  expect(stableBrief(latest.brief)).toEqual(stableBrief(beforeTimeline.brief));
  const schedule = turns.last().locator('[data-component-kind="payment-timeline"]');
  await expect(schedule).toContainText(format(8596000, 'AED'));
  await expect(schedule).toContainText(format(17192000, 'AED'));
  await expect(schedule).toContainText(format(42980000, 'AED'));
  await schedule.evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await record('exact-unit-timeline', latest);
  await namedSchedule(latest, 'southmed-after-unit');
}
