# Darivo design-system components

Stage 1 library and living guide at `/en/design` and `/ar/design`. The guide is a component specimen, not a production Home, Explore or Concierge implementation.

The named exports in `index.tsx` are `ConciergeComposer`, `BriefPanel`, `ProjectCard`, `LightColumn`, `LayerChip`, `ComparisonTable`, `PaymentTimeline`, `TrustBadge`, `SourceChip`, `Price`, `StatBlock`, `BottomSheet`, `CommandPalette`, `EmptyState`, `LoadingState` and `ErrorState`. Every type has a `data-component` marker. ProjectCard supports editorial (`large`), conversational (`medium`) and compact (`small`) layouts.

Data contracts distinguish evidence basis, original currency, source date and demo content. `Price` formats; it does not convert. `DigitsContext` supplies an explicit Arabic-Indic numeral preference in either language, and individual prices can override it. The guide's projection adapter uses canonical `FX` and `FX_DATE` from `src/lib/catalog.ts`, labels those rates as fictional fixed demo assumptions, and updates the payment projection when currency changes. A payment plan with percentages other than100 receives a visible warning.

Brief fields and layer chips are controlled. Composer submission returns the user's text without calling an AI provider. Its microphone reports device capability and explicitly says that no audio is recorded. SourceChip opens only HTTPS links. BottomSheet uses a native modal dialog with Escape, focus restoration, pointer dragging on the handle, and labelled keyboard expand/collapse controls. CommandPalette supports Cmd/Ctrl K from the guide, search, arrow-key navigation, Enter and Escape. Both dialogs inherit the guide's theme.

The guide exposes stable interaction selectors: `#design-composer` (input), `#design-brief`, `#design-command-trigger`, `#design-sheet-trigger`, `#design-theme`, `#design-digits` and `#design-currency`. Named sections are `#conversation`, `#recommendation`, `#spatial`, `#evidence` and `#states`.

Styles live in `src/styles/design-system.css`, scoped to `.dv-system` with `--dv-*` semantic variables. The parent layout supplies the local Darivo display/UI font families and hides legacy shell chrome for this route. Arabic uses Amiri for display and Plex for UI. Reduced-motion users receive nonanimated loading details, immediate section navigation and no sheet transition.

Stage acceptance requires the complete browser matrix and persona review. Local spot checks do not establish native-language certification or production AI, source freshness, inventory availability or map performance.

## Review repair regressions

The review found keyboard focus, numeral coverage and sheet geometry defects. The palette now focuses its search field on open, wraps ArrowUp from search to the final command, closes before transferring focus to the destination heading, and preserves Escape focus return. Comparison areas, timing years, source dates and projection assumptions all honor the numeral preference. User-authored Brief text remains unchanged by numeral formatting.

Brief fields are labelled auto-growing textareas and use one column on mobile; realistic long purpose and mixed-currency notes wrap without clipping. Labels are separate from textarea content so accessible names do not include the current value. The sheet uses explicit68svh and90svh heights, giving expansion a measurable effect. Mobile comparison includes an authored horizontal-scroll hint, and financial/source support text is at least12px.

`e2e/design-system.spec.ts` contains four focused regressions covering palette focus and selection, both-language numeral coverage, wrapped mobile Brief fields, sheet expansion/collapse geometry and focus restoration. All four passed after repair. Stage acceptance remains the studio's full matrix and persona gate.
