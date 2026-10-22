import { chromium, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { officeCopy } from '../messages/office';
import { officeIntentHref } from '../src/components/office/links';
import type { OfficePrivacy, PortfolioDTO, ViewingDTO } from '../src/lib/office';
import type { StoryDTO } from '../src/lib/story';

async function main() {
  const dir = process.env.OFFICE_CAPTURE_DIR ?? 'docs/reviews/stage-4/media/office-v1';
  const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
  const selected = process.env.OFFICE_CAPTURE_FILTER?.split(',') ?? [];
  await fs.mkdir(dir, { recursive: false }); // Never overwrite an earlier evidence round.
  const manifest: {
    sourceHead: string;
    dirty: string;
    baseURL: string;
    startedAt: string;
    finishedAt?: string;
    states: unknown[];
    failures: unknown[];
  } = {
    sourceHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    dirty: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
    baseURL,
    startedAt: new Date().toISOString(),
    states: [],
    failures: [],
  };
  const browser = await chromium.launch({ channel: 'chrome' });
  const setup = await browser.newContext({ baseURL });
  const setupPage = await setup.newPage();
  let boardId: string | undefined,
    viewingId: string | undefined,
    original: OfficePrivacy | undefined;
  const headers = { Origin: baseURL };
  async function setPolicy(value: Pick<OfficePrivacy, 'doNotSave' | 'doNotShare' | 'doNotBook'>) {
    const prior = await (await setup.request.get('/api/v1/office/privacy')).json();
    const response = await setup.request.patch('/api/v1/office/privacy', {
      headers,
      data: { ...value, version: prior.version },
    });
    if (!response.ok()) throw new Error(`Privacy fixture ${response.status()}`);
  }
  async function checkpoint(page: Page, name: string, errors: string[]) {
    await page.evaluate('document.fonts.ready');
    await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
    if (name.includes('390')) await page.screenshot({ path: `${dir}/${name}-viewport.png` });
    const axe = await new AxeBuilder({ page }).analyze();
    const overflow = await page.evaluate('document.documentElement.scrollWidth > innerWidth');
    const state = {
      name,
      errors: [...errors],
      overflow,
      violations: axe.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    };
    manifest.states.push(state);
    if (errors.length || overflow || axe.violations.length) manifest.failures.push(state);
    await fs.writeFile(`${dir}/manifest.json`, JSON.stringify(manifest, null, 2));
    console.log(name);
  }
  try {
    await setupPage.goto('/en/login');
    await setupPage.getByRole('button', { name: 'Verified client', exact: true }).click();
    await expect(setupPage.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible({
      timeout: 25000,
    });
    original = await (await setup.request.get('/api/v1/office/privacy')).json();
    await setPolicy({ doNotSave: false, doNotShare: false, doNotBook: false });
    const reference = (await (
      await setup.request.get('/api/v1/stories/project-orla-palm-jumeirah')
    ).json()) as StoryDTO;
    const unit = (await (
      await setup.request.get('/api/v1/stories/unit-the-courtyard-001')
    ).json()) as StoryDTO;
    const creation = await setup.request.post('/api/v1/portfolios', {
      headers,
      data: {
        name: 'A considered collection · مجموعة مختارة',
        clientRequestId: crypto.randomUUID(),
      },
    });
    if (!creation.ok()) throw new Error(`Create fixture ${creation.status()}`);
    const board = (await creation.json()) as PortfolioDTO;
    boardId = board.id;
    const addition = await setup.request.post(`/api/v1/portfolios/${boardId}/items`, {
      headers,
      data: {
        refs: [
          { kind: 'reference-project', id: reference.entity.id },
          { kind: 'demo-unit', id: unit.entity.id },
        ],
        version: board.version,
        clientRequestId: crypto.randomUUID(),
      },
    });
    if (!addition.ok()) throw new Error(`Add fixture ${addition.status()}`);
    const local = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10) + 'T14:00';
    const viewing = await setup.request.post('/api/v1/office/viewings', {
      headers,
      data: {
        unitId: unit.entity.id,
        localSlots: [local],
        timezone: 'Africa/Cairo',
        mode: 'video',
        clientRequestId: crypto.randomUUID(),
      },
    });
    if (!viewing.ok()) throw new Error(`Viewing fixture ${viewing.status()}`);
    viewingId = ((await viewing.json()) as ViewingDTO).id;
    const storageState = await setup.storageState();
    for (const locale of ['en', 'ar'] as const)
      for (const theme of ['light', 'dark'])
        for (const width of [390, 1024, 1440]) {
          const t = officeCopy[locale],
            name = `${locale}-${theme}-${width}`;
          if (selected.length && !selected.includes(name)) continue;
          const context = await browser.newContext({
            baseURL,
            storageState,
            viewport: { width, height: width === 390 ? 844 : 1000 },
            reducedMotion: 'reduce',
          });
          const page = await context.newPage(),
            errors: string[] = [];
          page.on('pageerror', (error) => errors.push(error.message));
          try {
            await page.goto(`/${locale}/office?theme=${theme}`);
            const collection = page
              .getByTestId('office-portfolio')
              .filter({ has: page.getByRole('heading', { name: board.name, exact: true }) });
            await expect(collection.getByTestId('office-entry')).toHaveCount(2);
            await checkpoint(page, `portfolios-${name}`, errors);
            const checks = collection.getByRole('checkbox', { name: t.selectCompare, exact: true });
            await checks.nth(0).check();
            await checks.nth(1).check();
            await page.getByRole('button', { name: t.compareNow, exact: true }).click();
            await expect(page.getByRole('table')).toBeVisible();
            await page.evaluate('window.scrollTo(0,0)');
            await checkpoint(page, `comparison-${name}`, errors);
            await page.goto(officeIntentHref(locale, 'viewing', unit, theme));
            await page
              .getByRole('combobox', { name: t.timezone, exact: true })
              .selectOption('Africa/Cairo');
            await page.locator('input[name="slot"]').fill(local);
            await page.getByRole('button', { name: t.reviewTimes, exact: true }).click();
            await expect(
              page.getByRole('region', { name: t.timeReview, exact: true }),
            ).toBeVisible();
            await page.evaluate('window.scrollTo(0,0)');
            await checkpoint(page, `viewings-${name}`, errors);
            await page.goto(`/${locale}/office/advisor?theme=${theme}`);
            await expect(page.locator('#of-thread-title')).toBeVisible();
            await expect(page.locator('.of-messages')).toBeAttached();
            await expect(page.getByRole('button', { name: t.send, exact: true })).toBeVisible();
            await checkpoint(page, `advisor-${name}`, errors);
            await page.goto(`/${locale}/office/privacy?theme=${theme}`);
            await expect(
              page.getByRole('button', { name: t.privacySave, exact: true }),
            ).toBeVisible();
            await checkpoint(page, `privacy-${name}`, errors);
            await page.goto(`/${locale}/office/private-collection?theme=${theme}`);
            await expect(page.getByTestId('office-entry').first()).toBeVisible();
            await checkpoint(page, `private-${name}`, errors);
          } catch (error) {
            manifest.failures.push({ name, error: String(error), errors });
            await page.screenshot({ path: `${dir}/${name}-failure.png`, fullPage: true });
          } finally {
            await context.close();
          }
        }
  } finally {
    if (viewingId) await setup.request.delete(`/api/v1/office/viewings/${viewingId}`, { headers });
    if (boardId) await setup.request.delete(`/api/v1/portfolios/${boardId}`, { headers });
    if (original)
      await setPolicy({
        doNotSave: original.doNotSave,
        doNotShare: original.doNotShare,
        doNotBook: original.doNotBook,
      });
    await setup.close();
    await browser.close();
    manifest.finishedAt = new Date().toISOString();
    await fs.writeFile(`${dir}/manifest.json`, JSON.stringify(manifest, null, 2));
  }
  if (manifest.failures.length) process.exitCode = 1;
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
