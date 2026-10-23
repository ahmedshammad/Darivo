import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { storyCopy } from '../messages/story';
import type { StoryDTO } from '../src/lib/story';

for (const locale of ['en', 'ar'] as const)
  test(`Story cover and source metadata are readable before JavaScript: ${locale}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      const slug = locale === 'ar' ? 'unit-the-courtyard-001' : 'project-orla-palm-jumeirah';
      const response = await page.goto(`/${locale}/p/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('#story-title')).toBeVisible();
      await expect(page.locator('head meta[name="description"]')).toHaveAttribute('content', /\S/);
      const canonical = await page.locator('head link[rel="canonical"]').getAttribute('href');
      expect(new URL(canonical!).pathname).toBe(`/${locale}/p/${slug}`);
      if (locale === 'ar')
        await expect(page.locator('head meta[name="robots"]')).toHaveAttribute(
          'content',
          /noindex/,
        );
      const missing = await page.goto(`/${locale}/p/unit-not-a-stored-residence`);
      expect(missing?.status()).toBe(404);
      await expect(page.locator('#story-title')).toHaveCount(0);
    } finally {
      await context.close();
    }
  });

for (const locale of ['en', 'ar'] as const) {
  test(`Story reference keeps source identity and enquiry semantics on phone: ${locale}`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const slug = 'project-orla-palm-jumeirah';
    const response = await request.get(`/api/v1/stories/${slug}`);
    expect(response.ok()).toBe(true);
    const story = (await response.json()) as StoryDTO;
    expect(story.kind).toBe('REAL_REFERENCE_PROJECT');
    const writes: string[] = [];
    page.on('request', (event) => {
      if (event.method() === 'POST') writes.push(event.url());
    });
    await page.goto(`/${locale}/p/${slug}?fallback=1&theme=light`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(story.name[locale]);
    await expect(page.locator('.story-kind')).toHaveText(storyCopy[locale].reference);
    await expect(page.locator('main>section, .story-editorial>section')).toHaveCount(8);
    await expect(
      page.getByRole('link', { name: storyCopy[locale].viewing, exact: true }),
    ).toHaveCount(0);
    await page.locator('.story-chapters a[href="#story-place"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#story-place')).toBeFocused();
    await expect(page.locator('.living-map')).toHaveAttribute('data-map-mode', 'fallback');
    await expect(page.locator('.living-map')).toHaveAttribute('data-map-ready', 'true');
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await page.locator('.story-chapters a[href="#story-next"]').click();
    const enquiry = page
      .locator('#story-next')
      .getByRole('link', { name: storyCopy[locale].enquire, exact: true });
    const href = await enquiry.getAttribute('href');
    expect(href).toContain('action=enquire');
    expect(href).toContain('kind=reference-project');
    expect(href).toContain(`id=${story.entity.id}`);
    expect(writes).toEqual([]);
    const unknown = story.metrics.find((metric) => metric.status === 'UNAVAILABLE');
    expect(unknown).toBeDefined();
    await page.locator('.story-chapters a[href="#story-numbers"]').click();
    const metric = page.locator('article[data-metric-status="UNAVAILABLE"]').filter({
      has: page.getByRole('heading', { name: unknown!.label[locale], exact: true }),
    });
    await expect(metric.locator('.story-metric-status')).toBeVisible();
    await expect(metric.getByText(unknown!.explanation[locale], { exact: true })).toBeHidden();
    await metric.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(metric.getByText(unknown!.explanation[locale], { exact: true })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations).toEqual([]);
  });

  test(`Story unit timeline preserves exact subject and typed Concierge entry: ${locale}`, async ({
    page,
    request,
  }) => {
    const slug = 'unit-the-courtyard-001';
    const response = await request.get(`/api/v1/stories/${slug}`);
    expect(response.ok()).toBe(true);
    const story = (await response.json()) as StoryDTO;
    expect(story.kind).toBe('DEMO_UNIT');
    expect(story.timeline.status).toBe('AVAILABLE');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/p/${slug}?fallback=1`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(story.name[locale]);
    await page.locator('.story-chapters a[href="#story-numbers"]').click();
    const timeline = page.getByTestId('story-payment');
    await expect(timeline.locator('header>p')).toHaveText(story.name[locale]);
    if (story.timeline.status === 'AVAILABLE') {
      await expect(timeline.locator('ol>li')).toHaveCount(story.timeline.component.schedule.length);
      for (const row of story.timeline.component.schedule)
        await expect(
          timeline.getByRole('heading', { name: row.label[locale], exact: true }),
        ).toBeVisible();
    }
    const ask = page
      .locator('#story-next')
      .getByRole('link', { name: storyCopy[locale].ask, exact: true });
    const href = new URL((await ask.getAttribute('href'))!, 'http://localhost');
    expect(href.searchParams.get('unit')).toBe(story.entity.id);
    expect(href.searchParams.has('q')).toBe(false);
    expect(href.searchParams.has('project')).toBe(false);
  });
}

test('Story Lenis preserves keyboard anchors, native map interaction and route cleanup', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en/p/unit-the-courtyard-001');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await page.locator('.story-chapters a[href="#story-place"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#story-place')).toBeFocused();
  const map = page.locator('.living-map');
  await expect(map).toHaveAttribute('data-map-ready', 'true');
  await expect(map).toHaveAttribute('data-tiles-ready', 'true');
  const beforeScroll = await page.evaluate(() => scrollY);
  const beforeZoom = Number(await map.getAttribute('data-zoom'));
  if ((await map.getAttribute('data-map-mode')) === 'webgl') {
    const box = (await map.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -220);
    await expect
      .poll(async () => Number(await map.getAttribute('data-zoom')))
      .toBeGreaterThan(beforeZoom);
    expect(Math.abs((await page.evaluate(() => scrollY)) - beforeScroll)).toBeLessThan(3);
  } else {
    await map.getByRole('button', { name: 'Zoom out' }).click();
    await expect
      .poll(async () => Number(await map.getAttribute('data-zoom')))
      .toBeLessThan(beforeZoom);
  }
  await page
    .locator('.story-header')
    .getByRole('link', { name: 'Private Office', exact: true })
    .click();
  await expect(page).toHaveURL(/\/en\/office/);
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
});

for (const locale of ['en', 'ar'] as const)
  test(`Story exact-unit Concierge handoff is read-only until explicit send: ${locale}`, async ({
    page,
    request,
  }) => {
    const dto = (await (
      await request.get('/api/v1/stories/unit-the-courtyard-001')
    ).json()) as StoryDTO;
    const writes: string[] = [];
    page.on('request', (event) => {
      if (event.method() === 'POST' && event.url().endsWith('/api/v1/concierge'))
        writes.push(event.url());
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 500 });
    await page.goto(`/${locale}/p/unit-the-courtyard-001?fallback=1`);
    await page.locator('.story-chapters a[href="#story-next"]').click();
    const ask = page
      .locator('#story-next')
      .getByRole('link', { name: storyCopy[locale].ask, exact: true });
    await expect(ask).toBeInViewport();
    await ask.click();
    await expect(page.locator('#concierge-prompt')).toBeEnabled();
    expect(writes).toEqual([]);
    const languageHref = await page.locator('.cq-header nav a').getAttribute('href');
    const continuation = new URL(languageHref!, 'http://localhost');
    expect(continuation.searchParams.get('unit')).toBe(dto.entity.id);
    expect(continuation.searchParams.has('q')).toBe(false);
    await page
      .locator('#concierge-prompt')
      .fill(
        locale === 'ar' ? 'أظهر خطة سداد هذا المسكن' : 'Show the payment plan for this residence',
      );
    const sent = page.waitForRequest(
      (event) => event.method() === 'POST' && event.url().endsWith('/api/v1/concierge'),
    );
    await page.locator('.cq-send[type="submit"]').click();
    const body = (await sent).postDataJSON();
    expect(body.priorEntities).toEqual([{ kind: 'unit', id: dto.entity.id }]);
    await expect(page.getByTestId('concierge-turn').last()).toHaveAttribute(
      'data-status',
      'complete',
      { timeout: 30000 },
    );
  });

for (const locale of ['en', 'ar'] as const)
  test(`Story Numbers shortcuts move keyboard focus without hiding evidence: ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/p/unit-the-courtyard-001?fallback=1`);
    await page.locator('.story-chapters a[href="#story-numbers"]').click();
    const navigation = page.getByRole('navigation', {
      name: storyCopy[locale].numbersNavigation,
      exact: true,
    });
    const payment = navigation.getByRole('link', {
      name: storyCopy[locale].paymentNavigation,
      exact: true,
    });
    await expect(payment).toBeInViewport({ ratio: 1 });
    await payment.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#story-payment-timeline')).toBeFocused();
    await expect(page.getByTestId('story-payment').locator('header')).toBeInViewport({ ratio: 1 });
    await expect(page.locator('#story-price-metrics')).toBeVisible();
    await navigation
      .getByRole('link', { name: storyCopy[locale].priceMetrics, exact: true })
      .focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#story-price-metrics')).toBeFocused();
    await expect(page.locator('#story-price-metrics > .story-money')).toBeInViewport();
    await expect(page.locator('.story-map-fx-date')).toHaveCSS('white-space', 'nowrap');
  });

for (const locale of ['en', 'ar'] as const)
  test(`Story exposes contextual AI early without duplicate mobile actions or lost focus: ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/p/unit-the-courtyard-001?fallback=1`);
    const ask = page.getByTestId('story-ask-primary');
    await expect(ask).toBeInViewport({ ratio: 1 });
    const url = new URL((await ask.getAttribute('href'))!, 'http://localhost');
    expect(url.searchParams.get('unit')).toBe('property-001');
    expect(url.searchParams.has('q')).toBe(false);
    const mobile = page.getByTestId('story-mobile-actions');
    await expect(mobile).toBeHidden();
    await page.locator('.story-chapters a[href="#story-numbers"]').click();
    await expect(mobile).toBeVisible();
    const focusedAction = mobile.locator('a').first();
    await focusedAction.focus();
    // Returning to the hero must not remove the currently focused sticky action.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.getByTestId('story-hero-actions')).toBeInViewport();
    await expect(mobile).toBeVisible();
    await expect(focusedAction).toBeFocused();
    await ask.focus();
    await expect(mobile).toBeHidden();
    await expect(ask).toBeFocused();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
