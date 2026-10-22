import { readFile, writeFile } from 'node:fs/promises';
const base = '/Users/hammad/Codex-App-Development/Darivo-v1/node_modules/lighthouse/core/';
const { LanternLargestContentfulPaint } = await import(
  base + 'computed/metrics/lantern-largest-contentful-paint.js'
);
const { LanternFirstContentfulPaint } = await import(
  base + 'computed/metrics/lantern-first-contentful-paint.js'
);
const { ProcessedNavigation } = await import(base + 'computed/processed-navigation.js');
const prefix = process.argv[2] || '/tmp/darivo-lcp-trace-home';
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
const result = await LanternLargestContentfulPaint.request(data, context);
const fcp = await LanternFirstContentfulPaint.request(data, context);
const nav = await ProcessedNavigation.request(trace, context);
function describe(node, timing) {
  const cpu = node.type === 'cpu';
  return {
    id: node.id,
    type: node.type,
    ...timing,
    duration: timing.endTime - timing.startTime,
    dependencies: node.getDependencies().map((n) => n.id),
    observedStartMs: (node.startTime - nav.timestamps.timeOrigin) / 1000,
    observedDurationMs: (node.endTime - node.startTime) / 1000,
    ...(cpu
      ? {
          scripts: [...node.getEvaluateScriptURLs()],
          events: node.childEvents
            .filter((e) => e.dur)
            .map((e) => ({ name: e.name, durationMs: e.dur / 1000, url: e.args?.data?.url }))
            .sort((a, b) => b.durationMs - a.durationMs)
            .slice(0, 15),
        }
      : {
          url: node.request.url,
          resourceType: node.request.resourceType,
          priority: node.request.priority,
          transferSize: node.request.transferSize,
          resourceSize: node.request.resourceSize,
          initiatorType: node.initiatorType,
        }),
  };
}
function estimate(e) {
  const nodes = [...e.nodeTimings]
    .map(([n, t]) => describe(n, t))
    .sort((a, b) => b.endTime - a.endTime);
  return { timeInMs: e.timeInMs, nodes };
}
const out = {
  reportLcp: report.audits['largest-contentful-paint'].numericValue,
  reconstructedLcp: result.timing,
  reconstructedFcp: fcp.timing,
  observedTimings: nav.timings,
  settings: report.configSettings,
  optimistic: estimate(result.optimisticEstimate),
  pessimistic: estimate(result.pessimisticEstimate),
};
await writeFile(prefix + '-graph.json', JSON.stringify(out, null, 2));
console.log(
  JSON.stringify(
    {
      reportLcp: out.reportLcp,
      reconstructedLcp: out.reconstructedLcp,
      fcp: out.reconstructedFcp,
      observed: out.observedTimings,
      optimistic: out.optimistic,
      pessimistic: out.pessimistic,
    },
    null,
    2,
  ),
);
const { getComputationDataParams } = await import(base + 'computed/metrics/lantern-metric.js');
const Lantern = await import(base + 'lib/lantern/lantern.js');
const params = await getComputationDataParams(data, context);
const scenarios = [];
for (const addedBytes of [23093, 46500]) {
  const graph = params.graph.cloneWithRelationships(
    (n) => !(n.type === 'network' && n.request.url.endsWith('/fonts/display.woff2')),
  );
  let document;
  graph.traverse((n) => {
    if (n.type === 'network' && n.isMainDocument()) document = n;
  });
  const original = document.request.transferSize;
  document.request.transferSize = original + addedBytes;
  const f = Lantern.Metrics.FirstContentfulPaint.compute({ ...params, graph });
  const l = Lantern.Metrics.LargestContentfulPaint.compute({ ...params, graph }, { fcpResult: f });
  scenarios.push({
    scenario: 'English display font inline; remove external font request',
    addedDocumentTransferBytes: addedBytes,
    lcp: l.timing,
    fcp: f.timing,
    optimistic: l.optimisticEstimate.timeInMs,
    pessimistic: l.pessimisticEstimate.timeInMs,
    limitation:
      'Graph-only estimate; retains recorded CPU costs and cannot model added HTML parse cost, compression interactions or changed observed LCP candidate.',
  });
  document.request.transferSize = original;
}
await writeFile(prefix + '-font-counterfactual.json', JSON.stringify(scenarios, null, 2));
console.log(JSON.stringify(scenarios, null, 2));
{
  const graph = params.graph.cloneWithRelationships();
  let document;
  const routeScripts = [];
  graph.traverse((n) => {
    if (n.type === 'network' && n.isMainDocument()) document = n;
    if (n.type === 'network' && n.request.resourceType === 'Script' && n.initiatorType === 'script')
      routeScripts.push(n);
  });
  for (const n of routeScripts) {
    n.removeAllDependencies();
    n.addDependency(document);
  }
  const f = Lantern.Metrics.FirstContentfulPaint.compute({ ...params, graph });
  const l = Lantern.Metrics.LargestContentfulPaint.compute({ ...params, graph }, { fcpResult: f });
  const scenario = {
    scenario:
      'HTML discovery of script-initiated route chunks (dependency-only sensitivity, not predicted boundary-removal outcome)',
    changedUrls: routeScripts.map((n) => n.request.url),
    lcp: l.timing,
    fcp: f.timing,
    optimistic: l.optimisticEstimate.timeInMs,
    pessimistic: l.pessimisticEstimate.timeInMs,
    limitation:
      'Retains recorded transfer sizes, priorities, CPU costs and paint cutoff. A real boundary change must be rebuilt/remeasured; this does not model SSR wait or changed LCP candidate.',
  };
  await writeFile(
    prefix + '-route-discovery-counterfactual.json',
    JSON.stringify(scenario, null, 2),
  );
  console.log(JSON.stringify(scenario, null, 2));
}
