import { test, expect } from '@playwright/test';
import { conciergeCopy } from '../messages/concierge';
import type { ConciergeRequest } from '../src/lib/concierge-transport';

for (const locale of ['en', 'ar'] as const) {
  const copy = conciergeCopy[locale];
  test(`Concierge retains two objectives, editable deadline and source basis in ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/concierge?fallback=1`);
    await page.getByRole('button', { name: new RegExp(copy.examples[0].name) }).click();
    const turn = page.getByTestId('concierge-turn').last();
    await expect(turn).toHaveAttribute('data-status', 'complete', { timeout: 30000 });
    await expect(turn.locator('[data-component-kind="comparison"]')).toBeAttached();
    const comparison = turn.locator('[data-component-kind="comparison"]');
    await expect(comparison.getByRole('rowheader', { name: copy.price, exact: true })).toHaveCount(
      1,
    );
    await expect(
      comparison.getByRole('rowheader', {
        name: locale === 'ar' ? 'السعر الأصلي' : 'Original price',
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(page.locator('#concierge-prompt')).toHaveValue('');
    await page.getByRole('button', { name: copy.brief, exact: true }).click();
    const brief = page.getByTestId('concierge-brief');
    await expect(brief.locator('.cq-market')).toHaveCount(2);
    const year = brief.getByLabel(copy.timeline, { exact: true });
    await expect(year).toHaveValue('2028');
    const original = await year.elementHandle();
    await year.fill('2027');
    await expect(year).toBeFocused();
    await brief.getByRole('button', { name: copy.apply, exact: true }).click();
    await expect(page.getByTestId('concierge-turn').last()).toHaveAttribute(
      'data-status',
      'complete',
      { timeout: 30000 },
    );
    await expect(year).toHaveValue('2027');
    expect(await original!.evaluate((element) => element.isConnected)).toBe(true);
    await page.getByRole('button', { name: copy.conversation, exact: true }).click();
    const reference = page
      .getByTestId('concierge-project')
      .filter({ hasText: copy.reference })
      .first();
    await expect(reference).toContainText(copy.noAvailability);
    await expect(reference.locator('.cq-sources a').first()).toHaveAttribute(
      'href',
      /^https?:\/\//,
    );
    await expect(reference.locator('.cq-sources').first()).toContainText(copy.asOf);
    await page.getByRole('button', { name: copy.compareMap, exact: true }).first().click();
    await expect(page.getByTestId('concierge')).toHaveAttribute('data-sheet', 'collapsed');
    await expect(page.locator('.living-map')).toHaveAttribute('data-map-ready', 'true');
    await expect
      .poll(
        async () =>
          JSON.parse(
            (await page.locator('.living-map').getAttribute('data-comparison-points')) ?? '[]',
          ).length,
      )
      .toBeGreaterThanOrEqual(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });

  test(`Concierge submits editable condition scope and verification in ${locale}`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/concierge?fallback=1`);
    await page.getByRole('button', { name: new RegExp(copy.examples[0].name) }).click();
    await expect(page.getByTestId('concierge-turn').last()).toHaveAttribute(
      'data-status',
      'complete',
      { timeout: 30000 },
    );
    await page.getByRole('button', { name: copy.brief, exact: true }).click();
    const group = page
      .getByTestId('concierge-brief')
      .getByRole('group', { name: copy.must, exact: true });
    await group.getByRole('button', { name: copy.add, exact: true }).click();
    const condition = group.locator('.cq-constraint-editor').last();
    await condition.getByRole('textbox').fill(locale === 'ar' ? 'شاطئ خاص' : 'private beach');
    await condition.locator('summary').click();
    await condition
      .getByRole('combobox', { name: copy.constraintScope, exact: true })
      .selectOption('selected');
    const scopes = condition.locator('.cq-place-options input');
    await expect(scopes).toHaveCount(2);
    await scopes.nth(1).check();
    await scopes.nth(0).uncheck();
    await condition.getByRole('checkbox', { name: copy.evidenceRequired, exact: true }).uncheck();
    const requestPromise = page.waitForRequest(
      (request) =>
        request.method() === 'POST' && new URL(request.url()).pathname === '/api/v1/concierge',
    );
    await page.getByRole('button', { name: copy.apply, exact: true }).click();
    const submitted: ConciergeRequest = (await requestPromise).postDataJSON();
    const patch = submitted.patch?.operations.find(
      (operation) =>
        operation.op === 'constraint.upsert' &&
        operation.value.text === (locale === 'ar' ? 'شاطئ خاص' : 'private beach'),
    );
    expect(patch?.op).toBe('constraint.upsert');
    if (patch?.op !== 'constraint.upsert') throw new Error('Expected explicit condition patch');
    expect(patch.value.marketIds).toEqual([submitted.brief.markets[1].id]);
    expect(patch.value.verificationRequired).toBe(false);
    await expect(page.getByTestId('concierge-turn').last()).toHaveAttribute(
      'data-status',
      'complete',
      { timeout: 30000 },
    );
    await expect(
      condition.getByRole('combobox', { name: copy.constraintScope, exact: true }),
    ).toHaveValue('selected');
    await expect(scopes.nth(0)).not.toBeChecked();
    await expect(scopes.nth(1)).toBeChecked();
    await expect(
      condition.getByRole('checkbox', { name: copy.evidenceRequired, exact: true }),
    ).not.toBeChecked();
  });

  test(`Concierge preserves school and alternative-island meaning in ${locale}`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/concierge?fallback=1`);
    await page.getByRole('button', { name: new RegExp(copy.examples[1].name) }).click();
    await expect(page.getByTestId('concierge-turn').last()).toHaveAttribute(
      'data-status',
      'complete',
      { timeout: 30000 },
    );
    const preview = page.locator('[data-component-kind="mini-map"]').first();
    await expect(preview.locator('svg[role="img"]')).toBeVisible();
    await expect(preview.locator('.cq-mini-places button')).toHaveCount(3);
    await expect(page.locator('.living-map')).toHaveAttribute('data-map-ready', 'true');
    const labelOverlaps = await page.locator('.living-map').evaluate((map) => {
      const poi = [...map.querySelectorAll('text[data-poi-label]')].map((node) =>
        node.getBoundingClientRect(),
      );
      const cities = [...map.querySelectorAll('.atlas-fallback-city')].map((node) =>
        node.getBoundingClientRect(),
      );
      const intersects = (a: DOMRect, b: DOMRect) =>
        a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      return poi.flatMap((rect, i) =>
        [...poi.slice(i + 1), ...cities].filter((other) => intersects(rect, other)),
      ).length;
    });
    expect(labelOverlaps).toBe(0);
    await preview.locator('.cq-mini-places button').first().focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.living-map')).toHaveCount(1);
    await expect
      .poll(
        async () =>
          JSON.parse((await page.locator('.living-map').getAttribute('data-center')) ?? '[0,0]')[0],
      )
      .toBeGreaterThan(55);
    await page.getByRole('button', { name: copy.brief, exact: true }).click();
    await expect(page.getByLabel(copy.children, { exact: true })).toHaveValue('2');
    await expect(page.getByLabel(copy.curriculum, { exact: true })).not.toHaveValue('');
    await page.locator('#concierge-prompt').fill(copy.examples[2].text);
    await page.getByRole('button', { name: copy.send, exact: true }).click();
    await expect(page.getByTestId('concierge-turn').last()).toHaveAttribute(
      'data-status',
      'complete',
      { timeout: 30000 },
    );
    await page.getByRole('button', { name: copy.brief, exact: true }).click();
    await expect(
      page
        .getByTestId('concierge-brief')
        .getByRole('combobox', { name: copy.markets, exact: true }),
    ).toHaveValue('alternatives');
    const places = page.getByTestId('concierge-brief').locator('.cq-market details').first();
    await places.locator('summary').click();
    await expect(
      places.getByLabel(locale === 'ar' ? 'جزيرة السعديات' : 'Saadiyat Island', { exact: true }),
    ).toBeChecked();
    await expect(
      places.getByLabel(locale === 'ar' ? 'نخلة جميرا' : 'Palm Jumeirah', { exact: true }),
    ).toBeChecked();
    await page.setViewportSize({ width: 375, height: 500 });
    await expect
      .poll(
        async () =>
          (await page.locator('.cq-panel').boundingBox())!.y +
          (await page.locator('.cq-panel').boundingBox())!.height,
      )
      .toBeLessThanOrEqual(500);
    await expect(page.locator('#concierge-prompt')).toBeInViewport({ ratio: 1 });
    expect((await page.locator('.cq-reading').boundingBox())!.height).toBeGreaterThanOrEqual(64);
  });
}

test('Concierge stop keeps draft, supports retry and does not post from a contextual entry', async ({
  page,
}) => {
  let release: (() => void) | undefined;
  let count = 0;
  await page.route('**/api/v1/concierge', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    count++;
    if (count !== 1) return route.continue();
    await new Promise<void>((resolve) => {
      release = resolve;
    });
    await route.abort().catch(() => {});
  });
  await page.goto('/en/concierge?fallback=1&q=A%20family%20home%20on%20the%20Palm');
  await expect(page.locator('#concierge-prompt')).toHaveValue('A family home on the Palm');
  expect(count).toBe(0);
  await page.getByRole('button', { name: conciergeCopy.en.send, exact: true }).click();
  await expect(
    page.getByRole('button', { name: conciergeCopy.en.stop, exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: conciergeCopy.en.stop, exact: true }).click();
  release?.();
  await expect(page.getByTestId('concierge-turn').last()).toHaveAttribute(
    'data-status',
    'cancelled',
  );
  await expect(page.locator('#concierge-prompt')).toHaveValue('A family home on the Palm');
  expect(count).toBe(1);
  await expect(page.locator('#concierge-prompt')).toBeFocused();
  await page.getByRole('button', { name: conciergeCopy.en.retry, exact: true }).click();
  await expect(page.getByTestId('concierge-turn').last()).toHaveAttribute(
    'data-status',
    'complete',
    { timeout: 30000 },
  );
});

test('signed-in Concierge clear history starts a usable new session', async ({ page }) => {
  await page.goto('/en/login');
  await page.getByRole('button', { name: 'Private client', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible({
    timeout: 20000,
  });
  await page.goto('/en/concierge?fallback=1');
  const clear = page.getByRole('button', { name: conciergeCopy.en.clear, exact: true });
  await expect(clear).toBeEnabled();
  await expect(page.getByText(conciergeCopy.en.loadingHistory, { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: conciergeCopy.en.brief, exact: true }).click();
  await page
    .getByTestId('concierge-brief')
    .getByRole('textbox', { name: conciergeCopy.en.raw, exact: true })
    .fill('Unapplied local edit to delete');
  await clear.click();
  await page
    .locator('.cq-inline-confirm')
    .getByRole('button', { name: conciergeCopy.en.confirm, exact: true })
    .click();
  await expect(page.getByTestId('concierge-turn')).toHaveCount(0);
  await expect(
    page
      .getByTestId('concierge-brief')
      .getByRole('textbox', { name: conciergeCopy.en.raw, exact: true }),
  ).toHaveValue('');
  await page.locator('#concierge-prompt').fill('A beachfront villa on Saadiyat or the Palm');
  const response = page.waitForResponse(
    (item) => item.url().endsWith('/api/v1/concierge') && item.request().method() === 'POST',
  );
  await page.getByRole('button', { name: conciergeCopy.en.send, exact: true }).click();
  expect((await response).status()).toBe(200);
  await expect(page.getByTestId('concierge-turn').last()).toHaveAttribute(
    'data-status',
    'complete',
    { timeout: 30000 },
  );
  await page.reload();
  await expect(page.getByTestId('concierge-turn')).toHaveCount(1);
  await expect(page.getByTestId('concierge-turn')).toContainText('Saadiyat');
});

for (const locale of ['en', 'ar'] as const) {
  test(`Atlas continues into Concierge with an unsent scoped draft in ${locale}`, async ({
    page,
  }) => {
    let posts = 0;
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().endsWith('/api/v1/concierge')) posts++;
    });
    const draft = locale === 'ar' ? 'بيت على الساحل الشمالي' : 'A home on the North Coast';
    await page.goto(`/${locale}?theme=light`);
    await page.locator('#arrival-intent').fill(draft);
    await page.locator('.arrival-concierge-link').click();
    // Development navigation also compiles and evaluates the destination bundle.
    // Production loading budgets are measured separately by Lighthouse.
    await expect(page).toHaveURL(new RegExp(`/${locale}/concierge\\?`), { timeout: 20000 });
    await expect(page.locator('#concierge-prompt')).toHaveValue(draft);
    await expect(page.getByTestId('concierge')).toHaveAttribute('data-theme', 'light');
    expect(posts).toBe(0);
    await page.goto(`/${locale}/explore?fallback=1&theme=light&q=ORLA`);
    await page
      .locator('.atlas-project-select')
      .filter({ hasText: /orla|أورلا/i })
      .first()
      .click();
    const entry = page.locator('.atlas-evidence a[href*="/concierge?"]').first();
    await expect(entry).toHaveAttribute('href', /project=orla-palm-jumeirah/);
    await entry.click();
    await expect(page.locator('#concierge-prompt')).toHaveValue(/orla|أورلا/i);
    expect(posts).toBe(0);
    await page.goto(`/${locale}/concierge?q=Draft&project=unavailable-private-id`);
    await expect(page.locator('#concierge-prompt')).toHaveValue('Draft');
    expect(posts).toBe(0);
  });
}

test('signed-in Concierge reports confirmation result and disabled history accurately', async ({
  page,
}) => {
  const copy = conciergeCopy.en;
  await page.goto('/en/login');
  await page.getByRole('button', { name: 'Private client', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible({
    timeout: 20000,
  });
  await page.goto('/en/concierge?fallback=1');
  await expect(page.locator('#concierge-prompt')).toBeEnabled();
  await expect(page.getByRole('button', { name: copy.clear, exact: true })).toBeEnabled();
  await page.locator('#concierge-prompt').fill('Contact an advisor about my property search');
  await page.getByRole('button', { name: copy.send, exact: true }).click();
  await expect(page.getByTestId('concierge-turn').last()).toHaveAttribute(
    'data-status',
    'complete',
    { timeout: 30000 },
  );
  // UI receipt contract only: real proposal generation, simulated successful confirmation,
  // so this test neither contacts an advisor nor claims backend mutation coverage.
  await page.route('**/api/v1/concierge/confirm', (route) =>
    route.fulfill({ json: { status: 'CONFIRMED' } }),
  );
  await page
    .locator('.cq-proposals')
    .getByRole('button', { name: copy.confirm, exact: true })
    .first()
    .click();
  await expect(page.getByTestId('concierge-action-receipt')).toHaveText(
    copy.actionReceipts.handoff_to_advisor,
  );
  await expect(page.locator('#concierge-prompt')).toBeFocused();
  await page.getByRole('button', { name: copy.brief, exact: true }).click();
  const brief = page.getByTestId('concierge-brief');
  await brief.locator('summary').filter({ hasText: copy.privacy }).click();
  await brief.getByRole('checkbox', { name: copy.doNotSave, exact: true }).check();
  await brief.getByRole('button', { name: copy.apply, exact: true }).click();
  await expect(page.locator('.cq-privacy-line')).toContainText(copy.notSaving, { timeout: 30000 });
  await expect(page.locator('.cq-privacy-line')).not.toContainText(copy.signedIn);
});
