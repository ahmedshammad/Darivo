import { expect, type Page } from '@playwright/test';
import { conciergeCopy, type ConciergeLocale } from '../../messages/concierge';
import type { ConciergeBrief, ConciergeComponent } from '../../src/lib/concierge';
import {
  installConciergeEvidence,
  conciergeRequestSequence,
  readConciergeEvidence,
} from './concierge-stream-evidence';

type Notice = Extract<ConciergeComponent, { kind: 'notice' }>;
export type DeadlineCheckpoint = {
  name: string;
  locale: ConciergeLocale;
  brief: ConciergeBrief;
  components: ConciergeComponent[];
};

/** Real guest UI and unchanged streamed responses; cancellation explicitly holds one request. */
export async function runDeadlineJourney(
  page: Page,
  options: {
    locale: ConciergeLocale;
    origin?: string;
    theme?: 'dark' | 'light';
    fallback?: boolean;
    cancellation?: boolean;
    checkpoint?: (state: DeadlineCheckpoint) => Promise<void>;
  },
) {
  const { locale } = options;
  const t = conciergeCopy[locale];
  await installConciergeEvidence(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(
    `${options.origin ?? ''}/${locale}/concierge?theme=${options.theme ?? 'dark'}${options.fallback ? '&fallback=1' : ''}`,
  );
  const turns = page.getByTestId('concierge-turn');
  const initialMessage =
    locale === 'ar'
      ? 'بيت صيفي في الساحل الشمالي جاهز بحلول 2028، قارن باستثمار في دبي'
      : 'North Coast summer home ready by 2028, compare with a Dubai investment';
  const scheduleMessage =
    locale === 'ar' ? 'اعرض خطة السداد في ساوث ميد' : 'Show SouthMED payment plan';
  const read = async (sequence: number, count: number): Promise<DeadlineCheckpoint> => {
    await expect(turns).toHaveCount(count + 1);
    await expect(turns.last()).toHaveAttribute('data-status', 'complete', { timeout: 30000 });
    const events = await readConciergeEvidence(page, sequence);
    const update = events.findLast((event) => event.type === 'brief.updated');
    if (!update || update.type !== 'brief.updated') throw new Error('Missing real Brief update');
    const components = new Map<string, ConciergeComponent>();
    for (const event of events)
      if (event.type === 'component.upsert') components.set(event.component.id, event.component);
    return { name: '', locale, brief: update.brief, components: [...components.values()] };
  };
  const send = async (message: string) => {
    const sequence = await conciergeRequestSequence(page);
    const count = await turns.count();
    await page.locator('#concierge-prompt').fill(message);
    await page.getByRole('button', { name: t.send, exact: true }).click();
    return read(sequence, count);
  };
  const deadline = (state: DeadlineCheckpoint): Notice => {
    const notices = state.components.filter(
      (c): c is Notice => c.kind === 'notice' && c.context?.kind === 'deadline-year-boundary',
    );
    expect(notices).toHaveLength(1);
    const notice = notices[0];
    const market = state.brief.markets.find((m) => m.id === notice.context!.marketId)!;
    expect(market).toBeDefined();
    if (market.deadline?.kind !== 'year') throw new Error('Expected scoped year');
    expect(notice.context).toEqual({
      kind: 'deadline-year-boundary',
      marketId: market.id,
      country: market.country,
      year: market.deadline.year,
      boundary: 'by',
      interpretation: 'END_OF_YEAR',
      scope: {
        purpose: market.purpose,
        placeIds: [...new Set(market.placeIds)].sort(),
        placeMatch: market.placeMatch,
        marketMode: state.brief.marketMode,
      },
    });
    const year = market.deadline.year;
    expect(notice.text).toEqual({
      en: `For your ${market.country === 'UAE' ? 'UAE' : 'Egypt'} Brief, I am treating “by ${year}” as the end of ${year}. Edit this if you mean an earlier date.`,
      ar: `في طلبك الخاص بـ${market.country === 'UAE' ? 'الإمارات' : 'مصر'}، أفسّر «بحلول ${year}» على أنه نهاية ${year}. عدّل هذا إذا كنت تقصد موعداً أبكر.`,
    });
    return notice;
  };
  const full = async (state: DeadlineCheckpoint) => {
    const notice = deadline(state);
    await expect(turns.last().getByTestId('concierge-repeated-deadline')).toHaveCount(0);
    const body = turns
      .last()
      .getByTestId('concierge-notice')
      .filter({ hasText: notice.text[locale] });
    await body.scrollIntoViewIfNeeded();
    await expect(body).toBeVisible();
    await expect(body).toHaveText(notice.text[locale]);
    return notice;
  };
  const capture = async (name: string, state: DeadlineCheckpoint) => {
    if (options.checkpoint) await options.checkpoint({ ...state, name });
  };
  let state = await send(initialMessage);
  const first = await full(state);
  await capture('first-full', state);
  const retainedMarkets = structuredClone(state.brief.markets);
  state = await send(scheduleMessage);
  expect(state.brief.markets).toEqual(retainedMarkets);
  const repeated = deadline(state);
  expect(repeated.text).toEqual(first.text);
  expect(repeated.context).toEqual(first.context);
  const unknown = state.components.filter(
    (c): c is Notice => c.kind === 'notice' && c.code === 'UNKNOWN_FACT',
  );
  expect(unknown).toHaveLength(1);
  expect(unknown[0].text.en).toContain('SouthMED');
  expect(unknown[0].text.ar).toContain('SouthMED');
  const unknownBody = turns
    .last()
    .getByTestId('concierge-notice')
    .filter({ hasText: unknown[0].text[locale] });
  await expect(unknownBody).toHaveText(unknown[0].text[locale]);
  expect(await unknownBody.evaluate((el) => Boolean(el.closest('details')))).toBe(false);
  const details = turns.last().getByTestId('concierge-repeated-deadline');
  await expect(details).toHaveCount(1);
  await expect(details).not.toHaveAttribute('open', '');
  const summary = details.locator('summary');
  await expect(summary).toHaveText(
    t.repeatedDeadlineSummary.replace('{country}', t.countryEgypt).replaceAll('{year}', '2028'),
  );
  await summary.scrollIntoViewIfNeeded();
  await expect(unknownBody).toBeInViewport();
  await capture('repeat-compact', state);
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(details).toHaveAttribute('open', '');
  await expect(summary).toBeFocused();
  await expect(details.getByText(repeated.text[locale], { exact: true })).toBeVisible();
  await capture('repeat-keyboard-expanded', state);
  await page.keyboard.press('Enter');
  await expect(details).not.toHaveAttribute('open', '');
  await page.getByRole('button', { name: t.brief, exact: true }).click();
  const brief = page.getByTestId('concierge-brief');
  const note = brief.locator(
    `[data-testid="concierge-deadline-assumption"][data-market-id="${repeated.context!.marketId}"]`,
  );
  await expect(note).toHaveCount(1);
  await expect(note).toHaveText(
    t.scopedDeadlineAssumption.replace('{country}', t.countryEgypt).replaceAll('{year}', '2028'),
  );
  await note.scrollIntoViewIfNeeded();
  await capture('persistent-brief', state);
  const apply = async () => {
    const sequence = await conciergeRequestSequence(page);
    const count = await turns.count();
    await brief.getByRole('button', { name: t.apply, exact: true }).click();
    const next = await read(sequence, count);
    await page.getByRole('button', { name: t.conversation, exact: true }).click();
    return next;
  };
  await brief.getByLabel(t.timeline, { exact: true }).fill('2029');
  state = await apply();
  expect((await full(state)).context!.year).toBe(2029);
  await capture('changed-year-full', state);
  await page.getByRole('button', { name: t.brief, exact: true }).click();
  await brief
    .locator('.cq-market')
    .first()
    .getByRole('combobox', { name: t.purpose, exact: true })
    .selectOption('residence');
  state = await apply();
  expect((await full(state)).context!.scope.purpose).toBe('residence');
  await capture('changed-scope-full', state);
  if (options.cancellation) {
    // Failure-path harness only: hold before server, use real Stop, then real next request.
    let release: (() => void) | undefined;
    let entered: (() => void) | undefined;
    const held = new Promise<void>((resolve) => {
      entered = resolve;
    });
    await page.route(
      '**/api/v1/concierge',
      async (route) => {
        if (route.request().method() !== 'POST') return route.continue();
        entered?.();
        await new Promise<void>((resolve) => {
          release = resolve;
        });
        await route.abort().catch(() => {});
      },
      { times: 1 },
    );
    await page.locator('#concierge-prompt').fill(scheduleMessage);
    await page.getByRole('button', { name: t.send, exact: true }).click();
    await held;
    await page.getByRole('button', { name: t.stop, exact: true }).click();
    release?.();
    await expect(turns.last()).toHaveAttribute('data-status', 'cancelled');
    state = await send(scheduleMessage);
    await full(state);
    await capture('after-cancel-full', state);
  }
  // Guests have no replayed turns after reload. No DOM/history injection is used.
  await page.reload();
  await expect(turns).toHaveCount(0);
  state = await send(initialMessage);
  await full(state);
  await capture('no-history-full', state);
}
