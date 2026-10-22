import { readFile, writeFile } from 'node:fs/promises';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
import { performance } from 'node:perf_hooks';
const workspace = '/Users/hammad/Codex-App-Development/Darivo-v1';
const base = workspace + '/node_modules/lighthouse/core/';
const prefix = '/tmp/darivo-lcp-trace-home-v2';
const { getComputationDataParams } = await import(base + 'computed/metrics/lantern-metric.js');
const Lantern = await import(base + 'lib/lantern/lantern.js');
const report = JSON.parse(await readFile(prefix + '.json', 'utf8'));
const trace = JSON.parse(await readFile(prefix + '-0.trace.json', 'utf8'));
const devtoolsLog = JSON.parse(await readFile(prefix + '-0.devtoolslog.json', 'utf8'));
const context = { computedCache: new Map() };
const data = {
  trace,
  devtoolsLog,
  settings: report.configSettings,
  gatherContext: { gatherMode: 'navigation' },
  simulator: null,
  URL: {
    requestedUrl: report.requestedUrl,
    mainDocumentUrl: report.finalUrl,
    finalDisplayedUrl: report.finalDisplayedUrl || report.finalUrl,
  },
  SourceMaps: [],
  HostDPR: report.configSettings.screenEmulation.deviceScaleFactor,
};
const params = await getComputationDataParams(data, context);
const files = [
  ['/en', '/tmp/darivo-home-v14.html'],
  [
    '/_next/static/chunks/3c783e23-c7263ae43255cbcc.js',
    workspace + '/.next/static/chunks/3c783e23-c7263ae43255cbcc.js',
  ],
  [
    '/_next/static/chunks/954-2bbbf70e456176d2.js',
    workspace + '/.next/static/chunks/954-2bbbf70e456176d2.js',
  ],
];
const compression = [];
for (const [url, path] of files) {
  const bytes = await readFile(path);
  const gzipStart = performance.now();
  const gzip = gzipSync(bytes);
  const gzipMs = performance.now() - gzipStart;
  const levels = [];
  for (const quality of [4, 6, 9, 11]) {
    const start = performance.now();
    const result = brotliCompressSync(bytes, {
      params: { [constants.BROTLI_PARAM_QUALITY]: quality },
    });
    levels.push({
      quality,
      bytes: result.length,
      compressionMs: performance.now() - start,
      savedVsGzip: gzip.length - result.length,
    });
  }
  compression.push({ url, rawBytes: bytes.length, gzipBytes: gzip.length, gzipMs, levels });
}
function measure(graph) {
  const f = Lantern.Metrics.FirstContentfulPaint.compute({ ...params, graph });
  const l = Lantern.Metrics.LargestContentfulPaint.compute({ ...params, graph }, { fcpResult: f });
  return {
    lcp: l.timing,
    fcp: f.timing,
    optimistic: l.optimisticEstimate.timeInMs,
    pessimistic: l.pessimisticEstimate.timeInMs,
  };
}
const scenarios = [];
for (const saved of [4000, 8000, 12000, 16000, 20000, 26000, 30000]) {
  const graph = params.graph.cloneWithRelationships();
  let doc;
  graph.traverse((n) => {
    if (n.type === 'network' && n.isMainDocument()) doc = n;
  });
  const original = doc.request.transferSize;
  doc.request.transferSize -= saved;
  scenarios.push({
    name: 'Document transfer reduction sensitivity',
    savedDocumentBytes: saved,
    ...measure(graph),
  });
  doc.request.transferSize = original;
}
for (const quality of [4, 6, 9, 11])
  for (const includeDocument of [false, true]) {
    const graph = params.graph.cloneWithRelationships();
    const restore = [];
    graph.traverse((n) => {
      if (n.type !== 'network') return;
      const c = compression.find((c) => new URL(n.request.url).pathname === c.url);
      if (!c || (!includeDocument && n.isMainDocument())) return;
      restore.push([n, n.request.transferSize]);
      n.request.transferSize -= c.levels.find((l) => l.quality === quality).savedVsGzip;
    });
    scenarios.push({
      name: 'Brotli transfer-only estimate',
      quality,
      includeDocument,
      mutated: restore.map(([n, original]) => ({
        url: n.request.url,
        from: original,
        to: n.request.transferSize,
      })),
      ...measure(graph),
    });
    for (const [node, size] of restore) node.request.transferSize = size;
  }
for (const targetDocumentBytes of [24000, 18000, 14000, 10000]) {
  const graph = params.graph.cloneWithRelationships();
  const restore = [];
  graph.traverse((n) => {
    if (n.type !== 'network') return;
    if (n.isMainDocument()) {
      restore.push([n, n.request.transferSize]);
      n.request.transferSize = targetDocumentBytes;
      return;
    }
    const c = compression.find((c) => new URL(n.request.url).pathname === c.url);
    if (!c) return;
    restore.push([n, n.request.transferSize]);
    n.request.transferSize -= c.levels.find((l) => l.quality === 11).savedVsGzip;
  });
  scenarios.push({
    name: 'Precompressed static core Brotli11 plus document byte budget',
    targetDocumentBytes,
    ...measure(graph),
  });
  for (const [node, size] of restore) node.request.transferSize = size;
}
const out = {
  compression,
  scenarios,
  limits:
    'Read-only graph sensitivity, not a measured serving change. Uses gzip byte deltas to preserve recorded response overhead. HTML is a fresh read of same build, not saved trace response. Recorded CPU/TTFB/paint cutoff fixed, excludes compression/decompression cost and header negotiation. Timings are one local M3 sync compression sample each, not server throughput benchmarks.',
};
await writeFile('/tmp/darivo-lcp-transfer-model.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
