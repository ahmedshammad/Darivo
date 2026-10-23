import { test, expect, type Page } from '@playwright/test';
import type { OfficePrivacy, PortfolioDTO, ThreadDTO, AdvisorDTO } from '../src/lib/office';
import type { StoryDTO } from '../src/lib/story';
import { conciergeCopy } from '../messages/concierge';
import { officeCopy } from '../messages/office';
async function login(page: Page, name: string) {
  await page.goto('/en/login');
  await page.getByRole('button', { name, exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
}

test('private Story, mixed portfolio, dossier, thread attachment and AI all lose revoked access', async ({
  browser,
  page: admin,
  request,
}) => {
  test.setTimeout(180000);
  await login(admin, 'Administrator');
  const origin = new URL(admin.url()).origin;
  const headers = { Origin: origin };
  const secret = await (await admin.request.get('/api/v1/properties/property-020')).json();
  const storySlug = `unit-${secret.slug}`;
  const sentinels: string[] = [
    secret.id,
    secret.permitNumber,
    ...secret.translations.map((t: { title: string }) => t.title),
  ];
  const contexts = await Promise.all([
    browser.newContext({ baseURL: origin }),
    browser.newContext({ baseURL: origin }),
    browser.newContext({ baseURL: origin }),
  ]);
  const [client, other, advisor] = await Promise.all(contexts.map((context) => context.newPage()));
  const grant = { userId: 'demo-client', propertyId: secret.id };
  let boardId: string | undefined;
  let originalPolicy: OfficePrivacy | undefined;
  const assertNoFacts = (text: string) => {
    for (const sentinel of sentinels) expect(text).not.toContain(sentinel);
  };
  try {
    await login(client, 'Private client');
    await login(other, 'Verified client');
    await login(advisor, 'Advisor');
    originalPolicy = await (await client.request.get('/api/v1/office/privacy')).json();
    expect(
      (
        await client.request.patch('/api/v1/office/privacy', {
          headers,
          data: {
            version: originalPolicy!.version,
            doNotSave: false,
            doNotShare: false,
            doNotBook: false,
          },
        })
      ).ok(),
    ).toBe(true);
    await admin.request.delete('/api/v1/grants', { headers, data: grant });
    for (const api of [request, client.request, other.request]) {
      const denied = await api.get(`/api/v1/stories/${storySlug}`);
      expect(denied.status()).toBe(404);
      assertNoFacts(await denied.text());
    }
    expect((await admin.request.post('/api/v1/grants', { headers, data: grant })).ok()).toBe(true);
    const authorized = await client.request.get(`/api/v1/stories/${storySlug}`);
    expect(authorized.status()).toBe(200);
    const story = (await authorized.json()) as StoryDTO;
    expect(story.kind).toBe('DEMO_UNIT');
    const created = await client.request.post('/api/v1/portfolios', {
      headers,
      data: { name: `Revocation ${Date.now()}`, clientRequestId: crypto.randomUUID() },
    });
    expect(created.status()).toBe(201);
    const board = (await created.json()) as PortfolioDTO;
    boardId = board.id;
    const saved = await client.request.post(`/api/v1/portfolios/${board.id}/items`, {
      headers,
      data: {
        refs: [
          { kind: 'demo-unit', id: secret.id },
          { kind: 'demo-unit', id: 'property-001' },
        ],
        version: board.version,
        clientRequestId: crypto.randomUUID(),
      },
    });
    expect(saved.ok()).toBe(true);
    const assigned = (await (
      await client.request.get('/api/v1/office/advisor')
    ).json()) as AdvisorDTO;
    expect(assigned.threadId).toBeTruthy();
    const sent = await client.request.post(`/api/v1/office/threads/${assigned.threadId}/messages`, {
      headers,
      data: {
        body: 'Please review the attached option. Automated demonstration test.',
        attachments: [{ kind: 'demo-unit', id: secret.id }],
        clientRequestId: crypto.randomUUID(),
      },
    });
    expect(sent.status()).toBe(201);
    for (const path of [
      `/api/v1/portfolios/${board.id}`,
      `/api/v1/portfolios/${board.id}/dossier`,
      `/api/v1/office/threads/${assigned.threadId}/messages`,
    ]) {
      const denied = await other.request.get(path);
      expect(denied.status()).toBe(404);
      assertNoFacts(await denied.text());
    }
    expect((await admin.request.delete('/api/v1/grants', { headers, data: grant })).ok()).toBe(
      true,
    );
    const fresh = await client.request.get(`/api/v1/portfolios/${board.id}`);
    assertNoFacts(await fresh.text());
    const visible = (await fresh.json()) as PortfolioDTO;
    expect(visible.items.map((entry) => entry.ref.id)).toEqual(['property-001']);
    for (const api of [client.request, advisor.request]) {
      const response = await api.get(`/api/v1/office/threads/${assigned.threadId}/messages`);
      expect(response.status()).toBe(200);
      assertNoFacts(await response.text());
      const thread = (await response.json()) as ThreadDTO;
      expect(thread.messages.at(-1)?.attachments).toEqual([]);
    }
    const comparison = await client.request.post('/api/v1/office/comparison', {
      headers,
      data: {
        refs: [
          { kind: 'demo-unit', id: secret.id },
          { kind: 'demo-unit', id: 'property-001' },
        ],
      },
    });
    expect(comparison.status()).toBe(404);
    assertNoFacts(await comparison.text());
    const dossier = await client.request.get(`/api/v1/portfolios/${board.id}/dossier`);
    expect(dossier.status()).toBe(409);
    expect(dossier.headers()['content-type']).toContain('application/json');
    assertNoFacts(await dossier.text());
    for (const locale of ['en', 'ar'] as const) {
      const html = await client.request.get(`/${locale}/p/${storySlug}`);
      // The requested slug may be echoed in Next's router payload; no resolved subject facts may appear.
      assertNoFacts(await html.text());
      // A development 404 can trigger a late Fast Refresh reload. Inspect each
      // surface in its own page, retaining the same authenticated cookie jar,
      // so that reload cannot abort navigation to the next security assertion.
      for (const path of [`/${locale}/p/${storySlug}`, `/${locale}/office`]) {
        const inspection = await client.context().newPage();
        try {
          await inspection.goto(path);
          await expect(inspection.getByRole('heading').first()).toBeVisible();
          if (path.endsWith('/office'))
            await expect(
              inspection.getByRole('heading', { name: officeCopy[locale].portfolios, exact: true }),
            ).toBeVisible();
          assertNoFacts(await inspection.locator('body').innerText());
        } finally {
          await inspection.close();
        }
      }
    }
    const replay = await (await client.request.get('/api/v1/concierge')).json();
    const ai = await client.request.post('/api/v1/concierge', {
      headers,
      data: {
        conversationId: replay.conversationId,
        requestId: crypto.randomUUID(),
        locale: 'en',
        message: 'Show the payment plan for this residence.',
        brief: replay.brief,
        priorEntities: [{ kind: 'unit', id: secret.id }],
      },
    });
    expect(ai.status()).toBe(200);
    assertNoFacts(await ai.text());
  } finally {
    await admin.request.delete('/api/v1/grants', { headers, data: grant });
    if (boardId) await client.request.delete(`/api/v1/portfolios/${boardId}`, { headers });
    if (originalPolicy) {
      const current = (await (
        await client.request.get('/api/v1/office/privacy')
      ).json()) as OfficePrivacy;
      await client.request.patch('/api/v1/office/privacy', {
        headers,
        data: {
          version: current.version,
          doNotSave: originalPolicy.doNotSave,
          doNotShare: originalPolicy.doNotShare,
          doNotBook: originalPolicy.doNotBook,
        },
      });
    }
    await Promise.all(contexts.map((context) => context.close()));
  }
});

for (const locale of ['en', 'ar'] as const)
  test(`Concierge explains durable restrictions and opens explicit Office recovery: ${locale}`, async ({
    page,
  }) => {
    await login(page, 'Private client');
    const headers = { Origin: new URL(page.url()).origin };
    const original = (await (
      await page.request.get('/api/v1/office/privacy')
    ).json()) as OfficePrivacy;
    try {
      const restricted = await page.request.patch('/api/v1/office/privacy', {
        headers,
        data: { version: original.version, doNotSave: true, doNotShare: true, doNotBook: true },
      });
      expect(restricted.ok()).toBe(true);
      await page.goto(`/${locale}/concierge?fallback=1`);
      const copy = conciergeCopy[locale];
      await page.getByRole('button', { name: copy.brief, exact: true }).click();
      const brief = page.getByTestId('concierge-brief');
      const expectDurableRestrictions = async () => {
        const summary = brief.locator('summary').filter({ hasText: copy.privacy });
        if ((await summary.locator('..').getAttribute('open')) === null) await summary.click();
        for (const name of [copy.doNotSave, copy.doNotShare, copy.doNotBook]) {
          const flag = brief.getByRole('checkbox', { name, exact: true });
          await expect(flag).toBeChecked();
          await expect(flag).toBeDisabled();
        }
        await expect(brief).toContainText(copy.durablePrivacy);
      };
      await expectDurableRestrictions();
      await page.getByRole('button', { name: copy.clear, exact: true }).click();
      const deleted = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === '/api/v1/concierge' &&
          response.request().method() === 'DELETE',
      );
      await page.getByRole('button', { name: copy.confirm, exact: true }).click();
      const response = await deleted;
      expect(response.ok()).toBe(true);
      const cleared = await response.json();
      expect(cleared.turns).toEqual([]);
      expect(cleared.brief.tasteMemory.items).toEqual([]);
      expect(cleared.brief.privacy).toMatchObject({
        doNotSave: true,
        doNotShare: true,
        doNotBook: true,
      });
      await expect(page.getByText(copy.clearQuestion, { exact: true })).toBeHidden();
      await expectDurableRestrictions();
      await page.reload();
      await page.getByRole('button', { name: copy.brief, exact: true }).click();
      await expectDurableRestrictions();
      await brief.getByRole('link', { name: copy.managePrivacy, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/office/privacy`));
      const editable = page.getByRole('checkbox', {
        name: officeCopy[locale].noShare,
        exact: true,
      });
      await expect(editable).toBeChecked();
      await expect(editable).toBeEnabled();
    } finally {
      const current = (await (
        await page.request.get('/api/v1/office/privacy')
      ).json()) as OfficePrivacy;
      await page.request.patch('/api/v1/office/privacy', {
        headers,
        data: {
          version: current.version,
          doNotSave: original.doNotSave,
          doNotShare: original.doNotShare,
          doNotBook: original.doNotBook,
        },
      });
    }
  });
