# Minimal software paint probe

A bounded diagnostic used a local plain HTML page with a system-serif heading, no framework, external fonts or map. Each mode launched a fresh headless Chrome process with explicit ANGLE SwiftShader flags. The optional worker created a1×1OffscreenCanvas WebGL2 context, inspected the actual renderer and released it.

| Mode                              | First contentful paint | Worker start | Worker reply |
| --------------------------------- | ---------------------: | -----------: | -----------: |
| No worker                         |                  904ms |            — |            — |
| Immediate worker                  |                 1220ms |        5.7ms |     2977.9ms |
| Worker after two animation frames |                  888ms |       12.2ms |     2836.3ms |

One trial per mode, not a stable benchmark or causality proof. Both worker modes confirmed actual SwiftShader. The double-animation-frame callback ran long before the recorded paint; it is not evidence of a post-paint guarantee. Even the plain baseline incurred roughly900ms before content paint. This rules out attributing all software first-paint delay to Darivo's layout/provider payload from the reports alone. No application scheduling change is made from this limited evidence. The normal and software Lighthouse LCP misses remain open.
