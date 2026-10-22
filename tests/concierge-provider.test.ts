import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  SDKConciergeProvider,
  permitsExternalConciergeProcessing,
} from '../src/server/concierge/provider';
import { emptyConciergeBrief } from '../src/lib/concierge';
import {
  extractConciergePrivacy,
  parseConciergeMessage,
} from '../src/server/concierge/mock-parser';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe('SDK provider boundary', () => {
  it.each(['Do not send my request to an external AI provider', 'No external AI processing'])(
    'keeps external processing off on later ordinary turns after: %s',
    (request) => {
      const first = parseConciergeMessage(request, emptyConciergeBrief());
      expect(
        permitsExternalConciergeProcessing(first.brief, extractConciergePrivacy(request)),
      ).toBe(false);
      const followup = parseConciergeMessage('Show me Dubai villas', first.brief);
      expect(
        permitsExternalConciergeProcessing(
          followup.brief,
          extractConciergePrivacy('Show me Dubai villas'),
        ),
      ).toBe(false);
      expect(
        permitsExternalConciergeProcessing(
          emptyConciergeBrief(),
          extractConciergePrivacy('Show me Dubai villas'),
        ),
      ).toBe(true);
    },
  );
  it('consumes streamed tool arguments without returning unchecked prose', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key-not-real');
    vi.stubEnv('OPENAI_BASE_URL', 'https://provider.example/v1');
    const plan = {
      version: 1,
      baseRevision: 0,
      responseLanguage: 'en',
      continue: false,
      briefPatch: null,
      calls: [],
      replyKey: 'CLARIFY',
      clarificationFields: ['markets'],
    };
    const args = JSON.stringify(plan);
    const chunks = [
      {
        id: 'tool-response',
        object: 'chat.completion.chunk',
        created: 1,
        model: 'test',
        choices: [
          {
            index: 0,
            delta: {
              role: 'assistant',
              content: 'Invented price must never reach the UI.',
              tool_calls: [
                {
                  index: 0,
                  id: 'call-1',
                  type: 'function',
                  function: { name: 'submit_plan', arguments: args.slice(0, 50) },
                },
              ],
            },
            finish_reason: null,
          },
        ],
      },
      {
        id: 'tool-response',
        object: 'chat.completion.chunk',
        created: 1,
        model: 'test',
        choices: [
          {
            index: 0,
            delta: { tool_calls: [{ index: 0, function: { arguments: args.slice(50) } }] },
            finish_reason: null,
          },
        ],
      },
      {
        id: 'tool-response',
        object: 'chat.completion.chunk',
        created: 1,
        model: 'test',
        choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }],
      },
    ];
    const fetchMock = vi.fn(
      async () =>
        new Response(
          chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join('') + 'data: [DONE]\n\n',
          { headers: { 'Content-Type': 'text/event-stream' } },
        ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const result = await new SDKConciergeProvider().plan({
      round: 0,
      message: 'Find a home',
      brief: emptyConciergeBrief(),
      responseLanguage: 'en',
      priorEntities: [],
      toolResults: [],
    });
    expect(result).toEqual(plan);
    expect(JSON.stringify(result)).not.toContain('Invented');
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it('rejects an insecure nonlocal provider before a request', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key-not-real');
    vi.stubEnv('OPENAI_BASE_URL', 'http://provider.example/v1');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(
      new SDKConciergeProvider().plan({
        round: 0,
        message: 'hello',
        brief: emptyConciergeBrief(),
        responseLanguage: 'en',
        priorEntities: [],
        toolResults: [],
      }),
    ).rejects.toThrow('unsafe_provider_url');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
