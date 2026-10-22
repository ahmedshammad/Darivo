# Stage 2 · Accessibility Lead

The Critic’s keyboard test and Sheikha’s Arabic-first task guide the implementation. Every map outcome must also have a DOM equivalent: project buttons, comparison facts, selected-point labels and story captions. Geography is not communicated only through colour, columns or camera motion.

The mobile rail is a nonmodal bottom sheet. A labelled handle offers expand/collapse, ArrowUp/ArrowDown and drag; controls and content stay reachable without dragging. Expanding does not steal focus from the handle. Escape collapses secondary tools and returns focus to their opener. An evidence panel has a heading focus target and a close action returning to its originating project. Content stays scrollable when text wraps.

The UI uses logical spacing and placement, native Arabic editorial/UI fonts, bidi isolation around amounts and source domains. Reduced motion disables story autoplay and asks the map renderer for instant camera changes. Theme contrast, visible focus, 44px control targets, status announcements, live interpretation throttling and 390px overflow are part of the screenshot/interaction gate.

Limits are explicit: a synthetic POI is not a licensed school directory, a circle is not a routed isochrone, and local frame measurements are not physical-phone certification. WebGL fallback must preserve the same accessible project selection and controls.

## v2 review response

The v1 capture exposed comparison intercepting the mobile collapse handle. The repaired comparison sits inside the scrollable rail and is absent while reading project evidence. Expanded mobile map attribution and reading notes now live in the sheet, avoiding collisions with top map tools; the collapsed map retains its original source controls. A fresh Arabic mobile fallback probe passed comparison → evidence → Escape → collapse → tools, with zero axe violations and no page errors. Source records group identical URLs, with faithful Arabic qualifiers and an expandable original record.

The production recheck also covers keyboard placement of an office or school origin: choosing the map focuses its surface, arrows move it and Enter chooses its centre in WebGL and fallback modes. World clusters use native 44px buttons. Adding the second comparison item reveals and focuses the comparison heading; opening evidence resets the content scroll so its Back action remains visible. These behaviours have browser assertions, alongside the current source and handoff checks. Full assistive-technology and native Arabic validation remain separate from the automated results.

# Voice entry policy

Arrival alone permits microphone use by its own origin, still subject to the browser's user permission and the explicit microphone action. Other routes retain the restrictive default. The previous global `microphone=()` policy conflicted with voice entry; the scoped override follows the [documented microphone policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/microphone). Actual speech recognition remains browser/service dependent and is not certified by the automated checks.
