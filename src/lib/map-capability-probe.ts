export type MapCapability = 'software-renderer' | 'unknown';
export const MAP_CAPABILITY_TIMEOUT_MS = 2500;

/** Run potentially expensive context creation off the UI thread before loading the map engine. */
export function probeMapCapability(signal?: AbortSignal): Promise<MapCapability> {
  if (signal?.aborted || typeof Worker === 'undefined') return Promise.resolve('unknown');
  return new Promise((resolve) => {
    let worker: Worker | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let finished = false;
    const finish = (result: MapCapability) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      if (worker) {
        worker.onmessage = null;
        worker.onerror = null;
        worker.onmessageerror = null;
        worker.terminate();
      }
      resolve(result);
    };
    const abort = () => finish('unknown');
    try {
      // Keep this literal syntax: webpack discovers and bundles the separate worker entry.
      worker = new Worker(new URL('./map-capability-worker.ts', import.meta.url), {
        type: 'module',
      });
      worker.onmessage = (event: MessageEvent<unknown>) =>
        finish(event.data === 'software-renderer' ? 'software-renderer' : 'unknown');
      worker.onerror = (event) => {
        event.preventDefault();
        finish('unknown');
      };
      worker.onmessageerror = () => finish('unknown');
      timer = setTimeout(() => finish('unknown'), MAP_CAPABILITY_TIMEOUT_MS);
      signal?.addEventListener('abort', abort, { once: true });
      if (signal?.aborted) finish('unknown');
      else worker.postMessage('probe');
    } catch {
      finish('unknown');
    }
  });
}
