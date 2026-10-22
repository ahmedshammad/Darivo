import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyConciergeBrief } from '../src/lib/concierge';
import { HttpError } from '../src/server/errors';
const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  restrict: vi.fn(),
  policy: vi.fn(),
  reserve: vi.fn(),
  engine: vi.fn(),
  persist: vi.fn(),
  load: vi.fn(),
  remove: vi.fn(),
  memory: vi.fn(),
  external: vi.fn(),
  card: vi.fn(),
}));
vi.mock('@/src/server/security', () => ({
  optionalUser: mocks.user,
  requireUser: mocks.user,
  sameOrigin: () => {},
  rateLimit: () => {},
  readJson: (r: Request) => r.json(),
  json: (v: unknown) => Response.json(v),
  failure: (e: unknown) =>
    Response.json(
      { error: e instanceof Error ? e.message : 'error' },
      { status: e instanceof HttpError ? e.status : 500 },
    ),
}));
vi.mock('@/src/server/office/privacy', () => ({
  getClientPrivacy: mocks.policy,
  restrictClientPrivacy: mocks.restrict,
}));
vi.mock('@/src/server/concierge/persistence', () => ({
  reserveConciergeTurn: mocks.reserve,
  persistConciergeTurn: mocks.persist,
  loadConciergeSession: mocks.load,
  deleteConciergeHistory: mocks.remove,
  updateConciergeMemory: mocks.memory,
  emptyReplay: (id: string) => ({ conversationId: id, brief: emptyConciergeBrief(), turns: [] }),
}));
vi.mock('@/src/server/concierge/engine', () => ({ runConciergeTurn: mocks.engine }));
vi.mock('@/src/server/concierge/grounding', () => ({
  resolveCard: mocks.card,
  rehydrateConciergeComponents: async () => [],
}));
vi.mock('@/src/server/concierge/provider', () => ({
  SDKConciergeProvider: class {},
  permitsExternalConciergeProcessing: mocks.external,
}));
import { POST, DELETE } from '../app/api/v1/concierge/route';
import { officeQueryPreferences } from '../src/server/office/http';
const policy = {
  doNotSave: false,
  doNotShare: false,
  doNotBook: false,
  version: 1,
  updatedAt: null,
};
const conversationId = randomUUID();
function snapshot() {
  return {
    version: 1,
    conversationId,
    mode: 'snapshot',
    applyActions: false,
    brief: emptyConciergeBrief(),
    turns: [],
    cursor: null,
  };
}
function request(message: string, brief = emptyConciergeBrief()) {
  return new Request('http://localhost/api/v1/concierge', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ requestId: randomUUID(), conversationId, locale: 'en', message, brief }),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockResolvedValue({ id: 'client', role: 'CLIENT' });
  mocks.restrict.mockResolvedValue({ ...policy });
  mocks.policy.mockResolvedValue({ ...policy });
  mocks.reserve.mockResolvedValue({ sessionId: conversationId, version: 1, snapshot: snapshot() });
  mocks.load.mockResolvedValue({ snapshot: snapshot() });
  mocks.engine.mockImplementation(async (input) => ({
    status: 'cancelled',
    brief: input.brief,
    text: '',
    components: [],
    proposals: [],
    responseLanguage: 'en',
  }));
});
describe('durable privacy at the API boundary', () => {
  it('does not let optional read-query defaults override stored currency, locale or area', () => {
    expect(officeQueryPreferences(new Request('http://localhost/api/v1/office'))).toEqual({});
    expect(
      officeQueryPreferences(new Request('http://localhost/api/v1/office?arabicIndicDigits=0')),
    ).toEqual({ arabicIndicDigits: false });
    expect(
      officeQueryPreferences(new Request('http://localhost/api/v1/office?currency=GBP&locale=ar')),
    ).toEqual({ currency: 'GBP', locale: 'ar' });
    expect(() =>
      officeQueryPreferences(new Request('http://localhost/api/v1/office?currency=FAKE')),
    ).toThrow();
  });

  it('persists refusal before a failed/cancelled lease and never starts provider processing', async () => {
    mocks.reserve.mockRejectedValue(new HttpError(409, 'concurrent_turn'));
    const response = await POST(request('Do not save or share this request.'));
    expect(response.status).toBe(409);
    expect(mocks.restrict).toHaveBeenCalledWith(
      'client',
      expect.objectContaining({ doNotSave: true, doNotShare: true }),
    );
    expect(mocks.restrict.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.reserve.mock.invocationCallOrder[0],
    );
    expect(mocks.engine).not.toHaveBeenCalled();
    expect(mocks.external).not.toHaveBeenCalled();
  });
  it('uses cleared versioned policy, not stale client or saved flags, for the next turn', async () => {
    const stale = emptyConciergeBrief();
    stale.privacy.doNotShare = true;
    stale.privacy.doNotSave = true;
    const old = snapshot();
    old.brief = stale;
    mocks.reserve.mockResolvedValue({ sessionId: conversationId, version: 3, snapshot: old });
    await (await POST(request('Explain Dubai', stale))).text();
    expect(mocks.engine).toHaveBeenCalledWith(
      expect.objectContaining({
        brief: expect.objectContaining({
          privacy: expect.objectContaining({ doNotShare: false, doNotSave: false }),
        }),
      }),
      expect.any(Function),
    );
    expect(mocks.restrict).toHaveBeenCalledTimes(1);
    expect(mocks.restrict.mock.calls[0][1].doNotShare).toBe(false);
  });
  it('deleting conversation history returns the same durable restrictions', async () => {
    mocks.policy.mockResolvedValue({ ...policy, doNotSave: true, doNotShare: true });
    const result = await DELETE(
      new Request('http://localhost/api/v1/concierge', { method: 'DELETE' }),
    );
    expect((await result.json()).brief.privacy).toMatchObject({
      doNotSave: true,
      doNotShare: true,
    });
    expect(mocks.remove).toHaveBeenCalledWith('client');
  });
  it('cannot relax policy using an unversioned Brief editor patch', async () => {
    mocks.restrict.mockResolvedValue({ ...policy, doNotShare: true });
    const body = await request('Update my brief').json();
    body.patch = {
      baseRevision: body.brief.revision,
      operations: [{ op: 'privacy.replace', value: body.brief.privacy }],
    };
    const response = await POST(
      new Request('http://localhost/api/v1/concierge', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    );
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: 'privacy_settings_required' });
    expect(mocks.engine).not.toHaveBeenCalled();
  });
});
