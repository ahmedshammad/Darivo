import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { conciergeCopy } from '../messages/concierge';
import type { ConciergeRequest } from '../src/lib/concierge-transport';

for (const locale of ['en', 'ar'] as const) {
  for (const fallback of [false, true]) {
    test(`Concierge reading and map controls remain reachable: ${locale}, fallback=${fallback}`, async ({
      page,
    }) => {
      const copy = conciergeCopy[locale];
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/${locale}/concierge${fallback ? '?fallback=1' : ''}`);
      await expect(page.locator('.living-map')).toHaveAttribute('data-map-ready', 'true');
      await page.getByRole('button', { name: new RegExp(copy.examples[1].name) }).click();
      await expect(page.getByTestId('concierge-turn').last()).toHaveAttribute(
        'data-status',
        'complete',
        { timeout: 30000 },
      );
      await expect(page.locator('.cq-introduction')).toHaveCount(0);
      const request = page.getByTestId('concierge-turn').last().locator('.cq-user-request');
      await expect(request).not.toHaveAttribute('open');
      await request.locator('summary').click();
      await expect(request.locator('.cq-user-message')).toHaveText(copy.examples[1].text);
      await request.locator('summary').click();
      const reading = (await page.locator('.cq-reading').boundingBox())!;
      const answer = (await page
        .getByTestId('concierge-turn')
        .last()
        .locator('.cq-answer')
        .boundingBox())!;
      expect(answer.y).toBeGreaterThanOrEqual(reading.y);
      expect(answer.y + answer.height).toBeLessThanOrEqual(reading.y + reading.height);
      await expect(page.locator('.cq-map')).toHaveAttribute('inert', '');
      const controls = page.locator(
        '.cq-map .maplibregl-ctrl-group, .cq-map .atlas-fallback-controls',
      );
      await expect(controls).toBeHidden();
      const placeholderFits = await page.locator('#concierge-prompt').evaluate((node) => {
        const input = node as HTMLTextAreaElement;
        const style = getComputedStyle(input);
        const context = document.createElement('canvas').getContext('2d')!;
        context.font = style.font || `${style.fontSize} ${style.fontFamily}`;
        return (
          context.measureText(input.placeholder).width +
            parseFloat(style.paddingLeft) +
            parseFloat(style.paddingRight) <=
            input.clientWidth &&
          parseFloat(style.lineHeight) +
            parseFloat(style.paddingTop) +
            parseFloat(style.paddingBottom) <=
            input.clientHeight
        );
      });
      expect(placeholderFits).toBe(true);
      const expandedAudit = await new AxeBuilder({ page })
        .include('.concierge')
        .withRules(['target-size', 'label-content-name-mismatch'])
        .analyze();
      expect(expandedAudit.violations).toEqual([]);
      await page.getByRole('button', { name: copy.collapse, exact: true }).click();
      await expect(page.locator('.cq-map')).not.toHaveAttribute('inert');
      await expect(controls).toBeVisible();
      const blocked = await controls.locator('button:not(:disabled)').evaluateAll(
        (buttons) =>
          buttons.filter((button) => {
            const rect = button.getBoundingClientRect();
            const top = document.elementFromPoint(
              rect.x + rect.width / 2,
              rect.y + rect.height / 2,
            );
            return rect.width < 24 || rect.height < 24 || !top || !button.contains(top);
          }).length,
      );
      expect(blocked).toBe(0);
    });
  }

  test(`Concierge exposes scenario result, inputs and qualification in ${locale}`, async ({
    page,
  }) => {
    const copy = conciergeCopy[locale];
    await page.goto(`/${locale}/concierge?fallback=1`);
    await page.getByRole('button', { name: new RegExp(copy.examples[1].name) }).click();
    await expect(page.getByTestId('concierge-turn').last()).toHaveAttribute(
      'data-status',
      'complete',
      { timeout: 30000 },
    );
    await page
      .locator('#concierge-prompt')
      .fill(
        locale === 'ar'
          ? 'احسب للاول: ايجار سنوي ١٠٠٠٠٠ درهم، تكاليف سنوية ١٠٠٠٠ درهم، شغور ٥%'
          : 'Calculate for the first one: annual rent 100000 AED, annual costs 10000 AED, vacancy 5%',
      );
    await page.getByRole('button', { name: copy.send, exact: true }).click();
    const turn = page.getByTestId('concierge-turn').last();
    await expect(turn).toHaveAttribute('data-status', 'complete', { timeout: 30000 });
    const scenario = turn.getByTestId('concierge-scenario-yield');
    await scenario.scrollIntoViewIfNeeded();
    await expect(scenario).toBeVisible();
    await expect(scenario.locator('strong')).toContainText('%');
    await expect(scenario.getByText(copy.annualRent, { exact: true })).toBeVisible();
    await expect(scenario.getByText(copy.annualCosts, { exact: true })).toBeVisible();
    await expect(scenario.getByText(copy.vacancy, { exact: true })).toBeVisible();
    await expect(scenario.locator('.cq-fine')).toContainText(
      locale === 'ar' ? 'ليس توقعاً' : 'not a forecast',
    );
    await expect(scenario.locator('.cq-sources')).toContainText(copy.asOf);
    await expect(scenario.locator('.cq-sources')).toContainText(copy.basis.USER_ASSUMPTION);
    expect(await scenario.locator('details').count()).toBe(0);
  });
}

for (const locale of ['en', 'ar'] as const) {
  test(`No-match recovery opens requirements without changing or submitting them in ${locale}`, async ({
    page,
  }) => {
    const copy = conciergeCopy[locale];
    const posts: ConciergeRequest[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/v1/concierge')
        posts.push(request.postDataJSON());
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/concierge?fallback=1`);
    await page.getByRole('button', { name: new RegExp(copy.examples[2].name) }).click();
    const turn = page.getByTestId('concierge-turn').last();
    await expect(turn).toHaveAttribute('data-status', 'complete', { timeout: 30000 });
    await expect(turn.getByTestId('concierge-project')).toHaveCount(0);
    expect(posts).toHaveLength(1);
    await turn.getByRole('button', { name: copy.reviewRequirements, exact: true }).first().click();
    await expect(page.locator('#concierge-mustHaves')).toBeFocused();
    await expect(page.getByTestId('concierge')).toHaveAttribute('data-sheet', 'expanded');
    const brief = page.getByTestId('concierge-brief');
    const condition = brief
      .getByRole('group', { name: copy.must, exact: true })
      .locator('.cq-constraint-editor')
      .first();
    const textBefore = await condition.getByRole('textbox').inputValue();
    await expect(condition.locator('details')).toHaveAttribute('open', '');
    const strictEvidence = condition.getByRole('checkbox', {
      name: copy.evidenceRequired,
      exact: true,
    });
    await expect(strictEvidence).toBeChecked();
    expect(posts).toHaveLength(1);
    await strictEvidence.uncheck();
    expect(posts).toHaveLength(1);
    await brief.getByRole('button', { name: copy.apply, exact: true }).click();
    await expect.poll(() => posts.length).toBe(2);
    const changed = posts[1].patch?.operations.find(
      (operation) => operation.op === 'constraint.upsert',
    );
    expect(changed?.op).toBe('constraint.upsert');
    if (changed?.op !== 'constraint.upsert')
      throw new Error('Expected explicit evidence preference edit');
    expect(changed.value.text).toBe(textBefore);
    expect(changed.value.verificationRequired).toBe(false);
    await expect(page.getByTestId('concierge-turn').last()).toHaveAttribute(
      'data-status',
      'complete',
      { timeout: 30000 },
    );
    await expect(strictEvidence).not.toBeChecked();
  });
}
