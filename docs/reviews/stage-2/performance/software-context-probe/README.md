# Software-context capability investigation

22 October 2026. Local Chrome155.0.8059.85, Apple M3 host. An isolated blank-page probe created WebGL2 contexts with `antialias:false`, `powerPreference:high-performance`, depth/stencil enabled, and `failIfMajorPerformanceCaveat` false then true. Each mode used a fresh browser. The software browser explicitly used `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`; no application environment, user agent or audit flag was changed.

[Recorded probe](probe.json): default Chrome reported Apple M3 Metal. The forced-software process reported SwiftShader. **Both accepted the context with the native major-caveat flag true** and echoed true in `getContextAttributes()`. Therefore the flag alone does not provide a reliable fallback boundary in this Chrome version. Initial tiny-shader compile/link/status work took238.3ms on Metal and911.0ms on SwiftShader; subsequent warmed results were0.4/10.4ms. These ordered, cache-confounded samples demonstrate why the second flag result must not be misrepresented as a cold performance comparison. They are not a full application benchmark.

The failed hosted reports from run39806595479 show Home67, LCP2210.276ms/TBT4530.5ms; Explore66, LCP2356.254ms/TBT5668ms. MapLibre owns the largest post-LCP long tasks, up to551ms Home/962ms Explore. The saved Lighthouse environment identifies Linux headlessChrome but does not itself identify its GL renderer. Software rendering is a supported hypothesis, not a fact established by those report files alone.

## Primary references and installed-code findings

- [Khronos WebGL context attributes](https://registry.khronos.org/webgl/specs/latest/1.0/#WEBGLCONTEXTATTRIBUTES) explicitly permits a2D fallback when native context creation rejects a major performance caveat; software rasterizers are one example. The current linked text is an editor's draft.
- [MapLibre MapOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/) supports the native flag inside `canvasContextAttributes`. Installed6.15 `src/ui/map.ts` callsWebGL2 getContext and throwsGPUInitializationError on null.
- Installed `src/render/painter.ts` constructor creates buffers and a program cache; shader use occurs later. The application checks the context immediately after constructing Map and before yielding to its first animation frame.
- A supplied [Chromium issue437337131](https://issues.chromium.org/issues/437337131) could not be read without sign-in. It is not relied on as evidence; the actual local probe establishes the observed behavior.

## Policy and validation boundary

The application requests the native major-caveat flag and checks the actual context's optional unmasked renderer for explicit CPU rasterizers (SwiftShader, llvmpipe, softpipe, Software Rasterizer/Renderer, Microsoft Basic Render Driver). It keeps unknown/absent/restricted renderer information on the normal path. The renderer string is read transiently, never exposed in DOM diagnostics, persisted or transmitted by application code. Only a non-identifying fallback reason is exposed. No CI, user-agent, headless or Lighthouse detection exists in the policy.

A known software context chooses the existing real-geography2D experience with EN/AR 'smoother2D' explanation, source/limitations disclosure and the same discovery interactions. Forced fallback and unavailable contexts retain separate reasons. The production software behavior and unchanged-settings Lighthouse improvement remain **pending rebuilt-browser validation** at authoring.

The new test launches actual SwiftShader Chrome, verifies the real software context and exercises both locales without mocking canvas or application behavior. Generic atlas tests accept automatic fallback only with the explicit software reason, still perform their interactions, and annotate which mode ran. Only the WebGL-specific resize case can capability-skip on software hosts; hardware runs must retain it. Unit tests preserve the normal path for hardware, unknown and restricted contexts. Earlier failures and device/INP limitations remain in the record.

## Second iteration: asynchronous worker preflight

The first policy was functionally correct but too late for slow contexts. The preserved [software-mode failure](../software-v1/home.json) reports Home performance 52, LCP 5.918 s and TBT 1.226 s; [Explore](../software-v1/explore.json) reports performance 41, LCP 8.537 s and TBT 3.821 s. A single simulated MapLibre constructor task of roughly 1,332 ms / 3,791 ms blocked paint before the post-constructor fallback. These failures are retained and are not replaced by local hardware scores.

The next implementation adds `probeMapCapability(signal)` in a separate client helper. Before importing MapLibre, the consumer awaits a small worker that constructs a 1×1 OffscreenCanvas WebGL2 context and applies the same native flag and explicit-software classifier. The worker transmits only `software-renderer` or `unknown`; it never sends a renderer string. Context initialization therefore takes place off the UI thread. The worker attempts to release the GL context before responding.

A 2.5-second deadline bounds the probe. A missing/blocked worker, absent OffscreenCanvas, unavailable context, restricted renderer information, malformed reply, worker error or timeout yields `unknown` and allows the normal path with the retained post-constructor safeguard. This timeout is failure recovery, not a delayed-start performance workaround. Abort, reply, error and timeout all terminate the worker, remove handlers and clear the timer. No global cached device classification is persisted.

[Webpack's primary worker guide](https://webpack.js.org/guides/web-workers/) documents `new Worker(new URL('./worker.ts', import.meta.url))`; this project builds with Next's `--webpack` mode. The literal worker entry stays separate from the classifier/client helper to avoid a circular bundle. Six focused lifecycle tests cover result validation, cancellation, unavailable/blocked worker construction, worker errors, timeout, late messages and cleanup. The existing actual-SwiftShader browser test remains the integration check; rebuilt-worker bundling and performance are pending parent validation at this point. No browser or build was run while developing this helper.
