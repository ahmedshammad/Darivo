# English font partition analysis — do not ship now

Read-only application analysis on 22 October 2026. A temporary venv at `/tmp/darivo-font-analysis/venv` installed fontTools 4.60.2 with WOFF support. Generated analysis fonts and scripts remain only in `/tmp/darivo-font-analysis`; repository source fonts, licences and application files were not changed. No browser, production build or performance test was run.

## Measurements

Sizes are actual WOFF2 file bytes, not HTTP transfer estimates. Both originals already contain a limited Latin repertoire: 229 mapped characters for Cormorant Garamond Light and 230 for Inter. Subsetting retained hinting, all applicable layout features, glyph closure, name records, copyright and the original glyph shapes.

| Repertoire                                          | Display bytes | UI bytes |  Total | Saving from originals |
| --------------------------------------------------- | ------------: | -------: | -----: | --------------------: |
| Original                                            |        22,876 |   23,664 | 46,540 |                     — |
| ASCII only                                          |        13,588 |   12,916 | 26,504 |         20,036 /43.1% |
| ASCII + practical punctuation/currencies            |        15,720 |   15,800 | 31,520 |         15,020 /32.3% |
| Practical set + existing combining marks            |        18,364 |   20,708 | 39,072 |          7,468 /16.0% |
| Latin-1 + combining marks + punctuation/currencies  |        22,112 |   23,264 | 45,376 |           1,164 /2.5% |
| Latin through U+024F + marks/punctuation/currencies |        22,308 |   23,452 | 45,760 |             780 /1.7% |

The practical set includes ASCII, NBSP, common currency/copyright symbols, superscripts 2/3, middle dot, multiplication/division, general punctuation, currency-symbol range, trademark and minus. Current English Arrival/Explore copy uses middle dot, dashes, curly apostrophe, ellipsis and superscript 2; these are covered. The Arabic language-switch label uses the existing separate Arabic font. This source inspection does not prove the actual font request set for every rendered page, user request or project name.

Retained mapped glyphs in the practical subsets were checked against the originals: **zero decomposed-outline mismatches and identical horizontal metrics**. This is not whole-text shaping equivalence. The practical subsets exclude combining marks, so fontTools removes the now-inapplicable `mark`, `mkmk` and `ccmp` features. Adding the original combining marks retains mark-positioning tables and increases size to 39,072 bytes. No shaping engine/browser comparison was run.

## Why not ship

- A Unicode partition can preserve individual outlines while changing shaping at the boundary between font faces. Accented Latin names, mixed NFC/NFD input, combining marks and kerning across a basic/extended-character boundary need more than metric checks. Latin-1 plus marks reduces that risk but yields only 1.2KB of savings; it still is not a universal equivalence proof.
- At the current audit throughput, the practical-plus-marks saving represents roughly 36ms of raw transfer, and the conservative Latin-1 saving roughly 6ms. These are bandwidth arithmetic, **not predicted LCP improvements**. The existing two-second target misses are larger, and no causal performance experiment has been run.
- Retaining the original full font as the extended-character source preserves its coverage but may require **both** downloads on mixed text. Practical cores plus both full originals total 78,060 bytes, versus 46,540 today. Generated complementary subsets could reduce that duplication, but introduce another shipped font set and do not eliminate shaping concerns.
- Keeping the original full-font preload would erase the expected core-only saving. Any future experiment must preload only the selected core, use exactly complementary `unicode-range` descriptors derived from the cmap, and verify actual requests. Broad overlapping ranges or arbitrary ASCII/non-ASCII boundaries are insufficient.
- Subsetting is a modified font under the bundled SIL OFL 1.1. Preserve copyright and distribute the licence with each subset; these originals do not embed the full licence text. Respect any applicable Reserved Font Names in complete provenance. A CSS family alias alone does not change internal name records. No original outline editing, hint removal, Arabic subsetting or typography substitution was attempted.

**Recommendation: reject this production change for now.** The modest conservative saving and cross-face shaping risk do not justify changing multilingual typography for an unproven LCP gain. Preserve the measurement evidence and investigate document compression/critical-path bytes instead. This conclusion does not declare the LCP requirement met.

Reproduction artifacts: `/tmp/darivo-font-analysis/analyze.py`, `marks.py`, `verify.py`, `measurements.json`, `verification.json`, and generated `.woff2` files. Source SHA256 values are recorded in `measurements.json`.
