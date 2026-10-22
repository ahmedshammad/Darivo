import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { officeCopy } from '../messages/office';
import { officeIntentHref } from '../src/components/office/links';
import { storyCompletionDate } from '../src/components/story/presentation';
import { formatAmount } from '../src/lib/format';
import type { OfficeDTO, OfficePrivacy, PortfolioDTO, ViewingDTO } from '../src/lib/office';
import type { StoryDTO } from '../src/lib/story';

async function policy(
  page: Page,
  flags: Pick<OfficePrivacy, 'doNotSave' | 'doNotShare' | 'doNotBook'>,
) {
  const current = (await (
    await page.request.get('/api/v1/office/privacy')
  ).json()) as OfficePrivacy;
  const response = await page.request.patch('/api/v1/office/privacy', {
    headers: { Origin: new URL(page.url()).origin },
    data: { ...flags, version: current.version },
  });
  expect(response.ok()).toBe(true);
}

for (const locale of ['en', 'ar'] as const) {
  test(`Office draft stays unwritten, mixed portfolio preserves evidence, viewing requires three-city confirmation: ${locale}`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    page.setDefaultTimeout(15000);
    const t = officeCopy[locale];
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reference = (await (
      await page.request.get('/api/v1/stories/project-orla-palm-jumeirah')
    ).json()) as StoryDTO;
    const unit = (await (
      await page.request.get('/api/v1/stories/unit-the-courtyard-001')
    ).json()) as StoryDTO;
    expect(reference.kind).toBe('REAL_REFERENCE_PROJECT');
    expect(unit.kind).toBe('DEMO_UNIT');
    await page.goto('/en/login');
    await page.getByRole('button', { name: 'Private client', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible({
      timeout: 20000,
    });
    const original = (await (await page.request.get('/api/v1/office')).json()) as OfficeDTO;
    const profile = (await (await page.request.get('/api/v1/profile')).json()).profile;
    const headers = { Origin: new URL(page.url()).origin };
    let boardId: string | undefined, viewingId: string | undefined;
    const writes: string[] = [];
    page.on('request', (request) => {
      if (
        request.method() === 'POST' &&
        /\/api\/v1\/(portfolios|office\/viewings|project-enquiries)/.test(request.url())
      )
        writes.push(request.url());
    });
    try {
      await policy(page, { doNotSave: false, doNotShare: false, doNotBook: false });
      await page.goto(officeIntentHref(locale, 'save', reference, 'light'));
      const chooser = page.getByTestId('office-save-intent');
      await expect(
        chooser.getByRole('heading', { name: reference.name[locale], exact: true }),
      ).toBeVisible();
      expect(writes).toEqual([]);
      expect(
        ((await (await page.request.get('/api/v1/office')).json()) as OfficeDTO).portfolios.map(
          (p) => p.id,
        ),
      ).toEqual(original.portfolios.map((p) => p.id));
      const name = `Office ${locale} ${Date.now()}`;
      await chooser.getByLabel(t.name, { exact: true }).fill(name);
      const creation = page.waitForResponse(
        (r) =>
          r.request().method() === 'POST' && new URL(r.url()).pathname === '/api/v1/portfolios',
      );
      await chooser.getByRole('button', { name: t.save, exact: true }).click();
      const created = await creation;
      expect(created.ok()).toBe(true);
      boardId = ((await created.json()) as PortfolioDTO).id;
      await expect(page.getByTestId('office-save-intent')).toHaveCount(0);
      await page.goto(officeIntentHref(locale, 'save', unit, 'light'));
      await chooser
        .getByRole('combobox', { name: t.destination, exact: true })
        .selectOption(boardId);
      await chooser.getByRole('button', { name: t.save, exact: true }).click();
      await expect(chooser).toHaveCount(0);
      const board = page
        .getByTestId('office-portfolio')
        .filter({ has: page.getByRole('heading', { name, exact: true }) });
      await expect(board.getByTestId('office-entry')).toHaveCount(2);
      const saved = (await (
        await page.request.get(`/api/v1/portfolios/${boardId}`)
      ).json()) as PortfolioDTO;
      expect(saved.items.map((i) => i.ref.kind).sort()).toEqual(['demo-unit', 'reference-project']);
      expect(saved.items.map((i) => i.ref.id).sort()).toEqual(
        [reference.entity.id, unit.entity.id].sort(),
      );
      const checks = board.getByRole('checkbox', { name: t.selectCompare, exact: true });
      await checks.nth(0).check();
      await checks.nth(1).check();
      await expect(page.locator('.of-selection strong bdi')).toHaveAttribute('dir', 'ltr');
      await page.getByRole('button', { name: t.compareNow, exact: true }).click();
      const comparison = page.getByRole('table');
      await expect(comparison).toBeVisible();
      await page.getByRole('combobox', { name: t.display, exact: true }).selectOption('USD');
      for (const subject of [reference, unit]) {
        expect(subject.price).not.toBeNull();
        await expect(comparison).toContainText(
          formatAmount(
            subject.price!.native.amount,
            subject.price!.native.currency,
            locale,
            profile.arabicIndicDigits,
          ),
        );
      }
      const completionFact = unit.facts.find((f) => f.key === 'completion');
      const exactDate = storyCompletionDate(
        completionFact?.value,
        locale,
        profile.arabicIndicDigits,
      );
      expect(exactDate).not.toBeNull();
      const completionRow = comparison
        .getByRole('row')
        .filter({ has: page.getByRole('rowheader', { name: t.completion, exact: true }) });
      await expect(completionRow).toContainText(exactDate!);
      await completionRow.locator('summary').click();
      await expect(completionRow).toContainText(
        completionFact!.originalText ?? String(completionFact!.value),
      );
      const converted = comparison.locator('.of-conversion').first();
      await expect(converted).toContainText(t.fx);
      await converted.locator('summary').click();
      await expect(converted.locator('details')).toHaveAttribute('open', '');
      const sources = comparison.locator('tbody tr').last().locator('details');
      await sources.first().locator('summary').click();
      await expect(sources.first().locator('li').first()).toBeVisible();
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
        false,
      );
      const beforeViewing = writes.filter((x) => x.includes('/office/viewings')).length;
      await page.goto(officeIntentHref(locale, 'viewing', unit, 'light'));
      await page
        .getByRole('combobox', { name: t.timezone, exact: true })
        .selectOption('Africa/Cairo');
      const local = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10) + 'T14:00';
      await page.locator('input[name="slot"]').fill(local);
      await page.getByRole('button', { name: t.reviewTimes, exact: true }).click();
      const preview = page.getByRole('region', { name: t.timeReview, exact: true });
      for (const city of Object.values(t.zones)) await expect(preview).toContainText(city);
      expect(writes.filter((x) => x.includes('/office/viewings'))).toHaveLength(beforeViewing);
      const viewing = page.waitForResponse(
        (r) =>
          r.request().method() === 'POST' &&
          new URL(r.url()).pathname === '/api/v1/office/viewings',
      );
      await preview.getByRole('button', { name: t.confirmTimes, exact: true }).click();
      const response = await viewing;
      expect(response.ok()).toBe(true);
      const request = (await response.json()) as ViewingDTO;
      viewingId = request.id;
      expect(request.subject.entity.id).toBe(unit.entity.id);
      expect(request.timezone).toBe('Africa/Cairo');
      expect(request.status).toBe('REQUESTED');
      expect(request.confirmedSlot).toBeNull();
      expect(request.slots).toHaveLength(1);
      await expect(page.locator('.of-agenda')).toContainText(t.statuses.REQUESTED);
      expect(writes.filter((x) => x.includes('/office/viewings'))).toHaveLength(beforeViewing + 1);
    } finally {
      if (viewingId)
        expect(
          (await page.request.delete(`/api/v1/office/viewings/${viewingId}`, { headers })).ok(),
        ).toBe(true);
      if (boardId)
        expect((await page.request.delete(`/api/v1/portfolios/${boardId}`, { headers })).ok()).toBe(
          true,
        );
      await policy(page, {
        doNotSave: original.privacy.doNotSave,
        doNotShare: original.privacy.doNotShare,
        doNotBook: original.privacy.doNotBook,
      });
      await page.request.patch('/api/v1/preferences', {
        headers,
        data: {
          currency: profile.currency,
          areaUnit: profile.areaUnit,
          arabicIndicDigits: profile.arabicIndicDigits,
        },
      });
    }
  });

  test(`Office enforces durable privacy in both UI and direct viewing API: ${locale}`, async ({
    page,
  }) => {
    const t = officeCopy[locale];
    await page.goto('/en/login');
    await page.getByRole('button', { name: 'Private client', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible({
      timeout: 20000,
    });
    const original = (await (
      await page.request.get('/api/v1/office/privacy')
    ).json()) as OfficePrivacy;
    const unit = (await (
      await page.request.get('/api/v1/stories/unit-the-courtyard-001')
    ).json()) as StoryDTO;
    try {
      await policy(page, { doNotSave: false, doNotShare: true, doNotBook: false });
      await page.goto(officeIntentHref(locale, 'viewing', unit));
      await expect(page.getByRole('button', { name: t.reviewTimes, exact: true })).toBeDisabled();
      await expect(page.getByText(t.restricted, { exact: false })).toBeVisible();
      const denied = await page.request.post('/api/v1/office/viewings', {
        headers: { Origin: new URL(page.url()).origin },
        data: {
          unitId: unit.entity.id,
          timezone: 'Europe/London',
          mode: 'video',
          localSlots: [new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10) + 'T14:00'],
          clientRequestId: `office-restricted-${locale}-${Date.now()}`,
        },
      });
      expect(denied.status()).toBe(409);
      expect((await denied.json()).error).toBe('privacy_restricted');
      await page.getByRole('link', { name: t.managePrivacy, exact: true }).click();
      await expect(page.getByRole('checkbox', { name: t.noShare, exact: true })).toBeChecked();
      await expect(page.getByRole('button', { name: t.privacySave, exact: true })).toBeVisible();
    } finally {
      await policy(page, {
        doNotSave: original.doNotSave,
        doNotShare: original.doNotShare,
        doNotBook: original.doNotBook,
      });
    }
  });
}
