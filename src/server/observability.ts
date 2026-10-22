export interface SpanObserver {
  record(name: string, durationMs: number, ok: boolean): void;
}
let observer: SpanObserver = {
  record: (name, durationMs, ok) =>
    console.info(JSON.stringify({ event: 'span', name, durationMs: Math.round(durationMs), ok })),
};
export function setSpanObserver(next: SpanObserver) {
  observer = next;
}
export async function observed<T>(name: string, operation: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    const value = await operation();
    observer.record(name, performance.now() - start, true);
    return value;
  } catch (e) {
    observer.record(name, performance.now() - start, false);
    throw e;
  }
}
