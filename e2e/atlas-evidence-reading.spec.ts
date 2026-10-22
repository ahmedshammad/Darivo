import { expect, test } from '@playwright/test';

for (const locale of ['en', 'ar']) {
  test(`mobile evidence keeps the brief editable and restores focus in ${locale}`, async ({
    page,
  }) => {
    const hydrationWarnings: string[] = [];
    page.on('console', (message) => {
      if (/hydration|hydrated|didn't match|server rendered/i.test(message.text()))
        hydrationWarnings.push(message.text());
    });
    const width = locale === 'ar' ? 390 : 375;
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const brief = locale === 'ar' ? 'بيت على النخلة للعائلة' : 'A family home on the Palm';
    await page.goto(`/${locale}/explore?fallback=1&q=${encodeURIComponent(brief)}`);
    const root = page.locator('.atlas-explore');
    const handle = page.locator('.atlas-sheet-handle');
    const prompt = page.locator('#atlas-prompt');
    const intro = page.locator('.atlas-conversation-intro');
    const content = page.locator('.atlas-sheet-content');
    await expect(page.locator('.living-map')).toHaveAttribute('data-map-ready', 'true', {
      timeout: 30000,
    });
    await handle.click();
    await expect(root).toHaveAttribute('data-sheet', 'expanded');
    const readingHeight = (await content.boundingBox())!.height;
    const originalPrompt = await prompt.elementHandle();
    const trigger = page.locator('.atlas-project-select').first();
    await trigger.click();
    await expect(root).toHaveAttribute('data-evidence', 'true');
    await expect(page.locator('#atlas-evidence-title')).toBeFocused();
    // The page heading remains in the accessibility tree, although its wrapper is clipped.
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    expect((await intro.boundingBox())!.height).toBe(1);
    expect((await prompt.boundingBox())!.height).toBe(52);
    expect((await content.boundingBox())!.height - readingHeight).toBeGreaterThan(40);
    expect(await originalPrompt!.evaluate((element) => element.isConnected)).toBe(true);
    await expect(prompt).toHaveValue(brief);

    await prompt.focus();
    expect((await prompt.boundingBox())!.height).toBe(96);
    await prompt.press('End');
    await prompt.press('Shift+Enter');
    await prompt.pressSequentially('2027 AED / EGP');
    await expect(prompt).toHaveValue(`${brief}\n2027 AED / EGP`);
    await prompt.press('Tab');
    const send = page.locator('.atlas-composer > button');
    await expect(send).toBeFocused();
    expect((await prompt.boundingBox())!.height).toBe(96);
    const sendBox = (await send.boundingBox())!;
    expect(sendBox.width).toBeGreaterThanOrEqual(44);
    expect(sendBox.height).toBeGreaterThanOrEqual(44);
    await send.click();
    await expect(prompt).toHaveValue(`${brief}\n2027 AED / EGP`);
    await expect(root).toHaveAttribute('data-composer-editing', 'false');
    expect((await prompt.boundingBox())!.height).toBe(52);
    await page.locator('#atlas-evidence-title').focus();
    expect((await prompt.boundingBox())!.height).toBe(52);

    const sources = page.locator('.atlas-inline-map-evidence summary');
    const selectedTitle = await page.locator('#atlas-evidence-title').textContent();
    await prompt.focus();
    const summaryBefore = (await sources.boundingBox())!;
    await page.mouse.click(
      summaryBefore.x + summaryBefore.width / 2,
      summaryBefore.y + summaryBefore.height / 2,
    );
    await expect(page.locator('.atlas-inline-map-notes')).toBeVisible();
    expect((await sources.boundingBox())!.y).toBe(summaryBefore.y);
    expect((await prompt.boundingBox())!.height).toBe(96);
    await expect(page.locator('#atlas-evidence-title')).toHaveText(selectedTitle!);
    await expect(prompt).toHaveValue(`${brief}\n2027 AED / EGP`);
    expect(await originalPrompt!.evaluate((element) => element.isConnected)).toBe(true);
    const attributionLinks = page.locator('.atlas-inline-attribution a');
    expect(await attributionLinks.count()).toBeGreaterThan(0);
    for (const link of await attributionLinks.all()) await expect(link).toBeVisible();
    await sources.click();

    // A resized layout viewport is not a physical virtual-keyboard certification.
    await prompt.focus();
    await page.setViewportSize({ width, height: 500 });
    await expect
      .poll(async () => {
        const box = (await content.boundingBox())!;
        return box.y + box.height;
      })
      .toBeLessThanOrEqual(501);
    await expect(prompt).toBeFocused();
    await handle.click({ trial: true });
    expect((await prompt.boundingBox())!.height).toBe(96);
    const shortSummary = (await sources.boundingBox())!;
    await page.mouse.click(
      shortSummary.x + shortSummary.width / 2,
      shortSummary.y + shortSummary.height / 2,
    );
    const notes = page.locator('.atlas-inline-map-notes');
    await expect(notes).toBeVisible();
    expect((await sources.boundingBox())!.y).toBe(shortSummary.y);
    expect((await prompt.boundingBox())!.height).toBe(96);
    // Notes and editing space remain open even after focus moves to other controls.
    await expect
      .poll(async () => {
        const box = (await content.boundingBox())!;
        return box.y + box.height;
      })
      .toBeLessThanOrEqual(501);
    expect((await content.boundingBox())!.height).toBeGreaterThan(80);
    expect((await notes.boundingBox())!.height).toBeLessThanOrEqual(80);
    await notes.focus();
    await notes.press('End');
    await expect
      .poll(() =>
        notes.evaluate(
          (element) => element.scrollHeight - element.scrollTop - element.clientHeight,
        ),
      )
      .toBeLessThanOrEqual(1);
    await notes.press('Tab');
    await expect(attributionLinks.first()).toBeFocused();

    const finalAction = page.locator('.atlas-evidence > a.atlas-action-primary');
    await finalAction.scrollIntoViewIfNeeded();
    const compareAction = page.locator('.atlas-evidence > button.atlas-action');
    await compareAction.focus();
    await compareAction.press('Tab');
    await expect(finalAction).toBeFocused();
    await expect(finalAction).toBeInViewport({ ratio: 1 });
    await sources.focus();
    await sources.press('Enter');
    await expect(notes).not.toBeVisible();
    await page.setViewportSize({ width, height: 844 });
    await handle.click();
    await expect(root).toHaveAttribute('data-sheet', 'collapsed');
    expect((await intro.boundingBox())!.height).toBeGreaterThan(1);
    expect((await prompt.boundingBox())!.height).toBeGreaterThanOrEqual(72);
    await handle.click();
    await page.locator('.atlas-evidence > .atlas-text-button').click();
    await expect(root).toHaveAttribute('data-evidence', 'false');
    await expect(root).toHaveAttribute('data-composer-editing', 'false');
    await expect(trigger).toBeFocused();

    await trigger.click();
    expect((await prompt.boundingBox())!.height).toBe(52);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect.poll(async () => (await intro.boundingBox())!.height).toBeGreaterThan(1);
    expect((await prompt.boundingBox())!.height).toBeGreaterThanOrEqual(86);
    await expect(prompt).toHaveValue(`${brief}\n2027 AED / EGP`);
    await expect(page.locator('#atlas-evidence-title')).toBeVisible();
    expect(hydrationWarnings).toEqual([]);
  });
}
