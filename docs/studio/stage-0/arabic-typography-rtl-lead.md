# Arabic Typography & RTL Lead · Stage 0

## Principle

Arabic is a composition, not a transform. Preserve the visual hierarchy and information order while choosing Arabic line lengths, rhythm and controls deliberately. The goal is clear Gulf-friendly language that feels discreet and useful, without either stiff translated marketing or forced dialect.

## Voice and copy

Use «خلّنا نبدأ بالمكان اللي يناسب حياتك» for the conversational invitation and «صف لنا المكان اللي في بالك» for the composer. Prefer «مكتبك الخاص»، «اختياراتك»، «على الخريطة» over literal English metaphors. Avoid superlatives, exclamation marks and assumed urgency. Understand Egyptian intent without rewriting the user's identity or dialect.

In Sand Editorial, the Arabic cover has its own two-line composition. Arabic display size is intentionally smaller than the Latin high-contrast serif because the available Plex font carries more visual mass. Line-height is generous and tracking is never artificially spread. The prototype uses existing IBM Plex Sans Arabic as a temporary editorial face; production needs a separate licensed Naskh/Amiri display face as specified by the brief.

## Layout and bidi

- Apply `dir=rtl` to the root and logical inline/block CSS properties throughout.
- Keep map pan/zoom geography physically correct. Mirror control placement, not the world.
- Isolate prices, dates, project identifiers and mixed-script place names with `bdi` or dedicated direction.
- Translate accessible names and live status, including icon-only buttons and map controls.
- Keep disclosure and explanatory copy adjacent to the fact it qualifies.
- Do not use English all-caps tracking rules on Arabic. Arabic headings use weight and size.

## Numerals

Arabic-Indic digits are a user preference in production, not a nationality assumption. This prototype uses Arabic-localized editorial labels and bidi-isolated Latin price codes where shown. Cross-currency comparisons must disclose the source/date of conversion; no conversion is fabricated in Stage 0.

## Review plan and limitations

Capture Home and Map in Arabic at 390, 1024 and 1440 px in both themes. Inspect clipping, composition, reading order, bottom-sheet overlap and keyboard focus. Screen capture proves layout, not idiomatic native quality. A native Gulf reader must review tone before that claim is made. Stage 0 records provisional authored language, without claiming external linguistic approval.

## Disagreement and decision

A direct translation of “A considered life. A place for it.” sounds like advertising in Arabic. The Arabic direction instead says «لكل حياة مكانها» and invites a specific conversation. Equivalent intent takes precedence over identical word count.
