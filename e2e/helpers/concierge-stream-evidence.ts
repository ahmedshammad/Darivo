import { expect, type Page } from '@playwright/test';
import { conciergeStreamEventSchema, type ConciergeStreamEvent } from '../../src/lib/concierge';

type FetchEvidence = { complete: boolean; status?: number; text?: string; error?: string };
type EvidenceWindow = typeof window & { __darivoKarimSse: FetchEvidence[] };

export async function installConciergeEvidence(page: Page) {
  await page.addInitScript(() => {
    const evidenceWindow = window as EvidenceWindow;
    evidenceWindow.__darivoKarimSse = [];
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = new URL(input instanceof Request ? input.url : String(input), location.href);
      const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
      const record: FetchEvidence | undefined =
        url.pathname === '/api/v1/concierge' && method.toUpperCase() === 'POST'
          ? { complete: false }
          : undefined;
      if (record) evidenceWindow.__darivoKarimSse.push(record);
      const pending = originalFetch(input, init);
      if (record) {
        // Inline callbacks serialize under both Playwright and tsx; a named local
        // arrow gains tsx's module-only __name helper, absent in the browser.
        void pending.then(
          (response) => {
            record.status = response.status;
            try {
              void response
                .clone()
                .text()
                .then(
                  (text) => {
                    record.text = text;
                    record.complete = true;
                  },
                  (error: unknown) => {
                    record.error = String(error);
                    record.complete = true;
                  },
                );
            } catch (error) {
              record.error = String(error);
              record.complete = true;
            }
          },
          (error: unknown) => {
            record.error = String(error);
            record.complete = true;
          },
        );
      }
      return pending;
    };
  });
}

export async function conciergeRequestSequence(page: Page) {
  return page.evaluate(() => (window as EvidenceWindow).__darivoKarimSse.length);
}

export async function readConciergeEvidence(
  page: Page,
  sequence: number,
): Promise<ConciergeStreamEvent[]> {
  await page.waitForFunction(
    (index) => (window as EvidenceWindow).__darivoKarimSse[index]?.complete,
    sequence,
    { timeout: 30000 },
  );
  const captured = await page.evaluate((index) => {
    const records = (window as EvidenceWindow).__darivoKarimSse;
    return { ...records[index], count: records.length };
  }, sequence);
  expect(captured.count, 'Each submitted turn must issue exactly one Concierge request').toBe(
    sequence + 1,
  );
  expect(captured.error).toBeUndefined();
  expect(captured.status).toBe(200);
  expect(captured.text).toBeTruthy();
  return captured
    .text!.split('\n')
    .filter((line) => line.startsWith('data: ') && !line.includes('[DONE]'))
    .flatMap((line) => {
      const packet = JSON.parse(line.slice(6));
      return packet.type === 'data-concierge'
        ? [conciergeStreamEventSchema.parse(packet.data)]
        : [];
    });
}
