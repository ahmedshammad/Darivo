import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { conciergeCopy } from '../messages/concierge';
import { storyCopy } from '../messages/story';
import { officeCopy } from '../messages/office';
import type { PortfolioDTO, ViewingDTO } from '../src/lib/office';

test.use({ video: 'on', viewport: { width: 1440, height: 1000 } });

for (const locale of ['en', 'ar'] as const) {
  test(`recorded Concierge → map → Story → portfolio → dossier → viewing: ${locale}`, async ({
    page,
  }, info) => {
    test.setTimeout(210000);
    const c = conciergeCopy[locale],
      s = storyCopy[locale],
      o = officeCopy[locale];
    const directory = process.env.STAGE4_CAPTURE_DIR;
    if (directory) await mkdir(directory, { recursive: true });
    const moments: { name: string; elapsedMs: number }[] = [];
    let boardId: string | undefined, viewingId: string | undefined;
    let started = 0;
    const mark = async (name: string) => {
      moments.push({ name, elapsedMs: Date.now() - started });
      if (directory) await page.screenshot({ path: `${directory}/${locale}-${name}.png` });
      // The signature recording holds each checkpoint briefly at normal playback speed.
      if (directory) await page.waitForTimeout(1500);
    };
    try {
      // A fresh guest starts the timed flow. Authentication is included when saving.
      await page.goto(`/${locale}/concierge`);
      await expect(page.locator('#concierge-prompt')).toBeVisible();
      started = Date.now();
      await page
        .locator('#concierge-prompt')
        .fill(locale === 'ar' ? 'اعرض وحدات تجريبية في دبي' : 'Show demo units in Dubai');
      await page.getByRole('button', { name: c.send, exact: true }).click();
      const turn = page.getByTestId('concierge-turn').last();
      await expect(turn).toHaveAttribute('data-status', 'complete', { timeout: 30000 });
      const card = turn
        .getByTestId('concierge-project')
        .filter({ has: page.locator('a[href*="/p/unit-"]') })
        .first();
      await expect(card).toBeVisible();
      await mark('01-concierge');
      await card.getByRole('button', { name: c.showMap, exact: false }).click();
      const map = page.locator('.living-map');
      await expect(map).toHaveAttribute('data-map-ready', 'true');
      await expect(map).toHaveAttribute('data-tiles-ready', 'true', { timeout: 30000 });
      await expect(map).toHaveAttribute('data-moving', 'false', { timeout: 30000 });
      await mark('02-map');
      const reopen = page.getByRole('button', { name: c.expand, exact: true });
      if (await reopen.isVisible()) await reopen.click();
      await card.getByRole('link', { name: c.readStory, exact: false }).click();
      await expect(page.locator('#story-title')).toBeVisible();
      await mark('03-story');
      await page.getByRole('link', { name: s.save, exact: true }).first().click();
      await page
        .getByRole('button', { name: locale === 'ar' ? 'عميل خاص' : 'Private client', exact: true })
        .click();
      const chooser = page.getByTestId('office-save-intent');
      await expect(chooser).toBeVisible({ timeout: 20000 });
      const name =
        locale === 'ar' ? `اختيارات دبي ${Date.now()}` : `Dubai considerations ${Date.now()}`;
      await chooser.getByLabel(o.name, { exact: true }).fill(name);
      const created = page.waitForResponse(
        (r) =>
          r.request().method() === 'POST' && new URL(r.url()).pathname === '/api/v1/portfolios',
      );
      await chooser.getByRole('button', { name: o.save, exact: true }).click();
      const response = await created;
      expect(response.status()).toBe(201);
      boardId = ((await response.json()) as PortfolioDTO).id;
      await expect(chooser).toHaveCount(0);
      const board = page
        .getByTestId('office-portfolio')
        .filter({ has: page.getByRole('heading', { name, exact: true }) });
      await expect(board.getByTestId('office-entry')).toHaveCount(1);
      await mark('04-portfolio');
      const download = page.waitForEvent('download');
      await board.getByRole('button', { name: o.export, exact: false }).click();
      const dossier = await download;
      expect(await dossier.failure()).toBeNull();
      await dossier.saveAs(
        directory ? `${directory}/${locale}-dossier.pdf` : info.outputPath(`${locale}-dossier.pdf`),
      );
      await mark('05-dossier');
      await board.getByRole('link', { name: o.requestViewing, exact: true }).click();
      await page
        .getByRole('combobox', { name: o.timezone, exact: true })
        .selectOption('Europe/London');
      await page
        .locator('input[name="slot"]')
        .fill(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10) + 'T14:00');
      await page.getByRole('button', { name: o.reviewTimes, exact: true }).click();
      const review = page.getByRole('region', { name: o.timeReview, exact: true });
      for (const city of Object.values(o.zones)) await expect(review).toContainText(city);
      await mark('06-three-city-review');
      const requested = page.waitForResponse(
        (r) =>
          r.request().method() === 'POST' &&
          new URL(r.url()).pathname === '/api/v1/office/viewings',
      );
      await review.getByRole('button', { name: o.confirmTimes, exact: true }).click();
      const result = await requested;
      expect(result.status()).toBe(201);
      const viewing = (await result.json()) as ViewingDTO;
      viewingId = viewing.id;
      expect(viewing.status).toBe('REQUESTED');
      expect(viewing.confirmedSlot).toBeNull();
      await expect(page.locator('.of-agenda')).toContainText(o.statuses.REQUESTED);
      await mark('07-viewing-requested');
      expect(moments.at(-1)!.elapsedMs).toBeLessThan(180000);
    } finally {
      const report = {
        locale,
        startedAt: new Date(started || Date.now()).toISOString(),
        moments,
        includesGuestSignIn: true,
        provider: 'deterministic MockProvider',
        viewport: '1440 × 1000',
        video: 'Playwright test output',
        status: info.status,
      };
      await writeFile(
        directory ? `${directory}/${locale}-timing.json` : info.outputPath('timing.json'),
        JSON.stringify(report, null, 2),
      );
      const headers = { Origin: new URL(page.url()).origin };
      if (viewingId) await page.request.delete(`/api/v1/office/viewings/${viewingId}`, { headers });
      if (boardId) await page.request.delete(`/api/v1/portfolios/${boardId}`, { headers });
    }
  });
}
