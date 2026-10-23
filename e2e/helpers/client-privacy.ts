import { expect, type APIRequestContext } from '@playwright/test';
import { officePrivacySchema, type OfficePrivacy } from '../../src/lib/office';

type Flags = Pick<OfficePrivacy, 'doNotSave' | 'doNotShare' | 'doNotBook'>;

/** Use the client's versioned settings API, then restore the original durable flags even on failure. */
export async function withClientPrivacy<T>(
  request: APIRequestContext,
  origin: string,
  settings: Partial<Flags>,
  run: () => Promise<T>,
): Promise<T> {
  async function read() {
    const response = await request.get('/api/v1/office/privacy');
    expect(response.status()).toBe(200);
    return officePrivacySchema.parse(await response.json());
  }
  async function write(current: OfficePrivacy, flags: Flags) {
    const response = await request.patch('/api/v1/office/privacy', {
      headers: { Origin: origin },
      data: { version: current.version, ...flags },
    });
    expect(response.status()).toBe(200);
    expect(officePrivacySchema.parse(await response.json())).toMatchObject(flags);
  }
  const original = await read();
  const flags = {
    doNotSave: original.doNotSave,
    doNotShare: original.doNotShare,
    doNotBook: original.doNotBook,
  };
  try {
    await write(original, { ...flags, ...settings });
    return await run();
  } finally {
    // A restrictive turn or explicit settings change may increment the version during the test.
    await write(await read(), flags);
  }
}
