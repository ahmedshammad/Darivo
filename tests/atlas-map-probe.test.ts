import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAP_CAPABILITY_TIMEOUT_MS, probeMapCapability } from '../src/lib/map-capability-probe';

class ProbeWorker {
  static instances: ProbeWorker[] = [];
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: (() => void) | null = null;
  terminate = vi.fn();
  postMessage = vi.fn();
  constructor() {
    ProbeWorker.instances.push(this);
  }
}
function installWorker() {
  ProbeWorker.instances = [];
  vi.stubGlobal('Worker', ProbeWorker);
  vi.useFakeTimers();
}
function expectClean(worker: ProbeWorker) {
  expect(worker.terminate).toHaveBeenCalledTimes(1);
  expect(worker.onmessage).toBeNull();
  expect(worker.onerror).toBeNull();
  expect(worker.onmessageerror).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
}
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('asynchronous map capability probe lifecycle', () => {
  it('returns only the coarse software result and cleans all resources', async () => {
    installWorker();
    const result = probeMapCapability();
    const worker = ProbeWorker.instances[0];
    expect(worker.postMessage).toHaveBeenCalledWith('probe');
    worker.onmessage?.({ data: 'software-renderer' } as MessageEvent);
    expect(await result).toBe('software-renderer');
    expectClean(worker);
  });
  it('treats unrecognized replies as unknown, never a hardware failure', async () => {
    installWorker();
    const result = probeMapCapability();
    const worker = ProbeWorker.instances[0];
    worker.onmessage?.({ data: { renderer: 'unexpected payload' } } as MessageEvent);
    expect(await result).toBe('unknown');
    expectClean(worker);
  });
  it('bounds a silent worker and ignores late replies after terminating it', async () => {
    installWorker();
    const result = probeMapCapability();
    const worker = ProbeWorker.instances[0];
    const lateReply = worker.onmessage;
    await vi.advanceTimersByTimeAsync(MAP_CAPABILITY_TIMEOUT_MS);
    expect(await result).toBe('unknown');
    lateReply?.({ data: 'software-renderer' } as MessageEvent);
    expectClean(worker);
  });
  it('terminates immediately on cancellation and does not launch for an already aborted signal', async () => {
    installWorker();
    const controller = new AbortController();
    const result = probeMapCapability(controller.signal);
    const worker = ProbeWorker.instances[0];
    controller.abort();
    expect(await result).toBe('unknown');
    expectClean(worker);
    expect(await probeMapCapability(controller.signal)).toBe('unknown');
    expect(ProbeWorker.instances).toHaveLength(1);
  });
  it('handles blocked worker construction and unavailable worker support', async () => {
    vi.stubGlobal('Worker', undefined);
    expect(await probeMapCapability()).toBe('unknown');
    vi.stubGlobal(
      'Worker',
      class {
        constructor() {
          throw new Error('CSP blocked');
        }
      },
    );
    expect(await probeMapCapability()).toBe('unknown');
  });
  it('handles runtime worker errors without leaking timers or uncaught page errors', async () => {
    installWorker();
    const result = probeMapCapability();
    const worker = ProbeWorker.instances[0];
    const preventDefault = vi.fn();
    worker.onerror?.({ preventDefault } as unknown as ErrorEvent);
    expect(await result).toBe('unknown');
    expect(preventDefault).toHaveBeenCalledOnce();
    expectClean(worker);
  });
});
