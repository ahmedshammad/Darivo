# PDF pagination refinement — retained candidate v11

Both bilingual dossiers now occupy **17 pages, down from 20 (15% fewer)** for the same authorized public fixture: ORLA, SouthMED and The Courtyard 001 Demo unit. This is a renderer-only refinement after source `165b49e`; [validation.json](validation.json) records the exact renderer SHA-256. The fixture is read-only and its QA portfolio is not persisted.

Retained outputs: [English-first PDF](en.pdf), [Arabic-first PDF](ar.pdf), [English contact sheet](en-contact.jpg), [Arabic contact sheet](ar-contact.jpg). Existing v5 evidence and `/tmp/darivo-stage4-pdf-v6` through `v10` experiments remain unchanged.

## Changes and evidence

The parent’s v6 changes started each new subject on a fresh page, let its second-language section flow behind a divider, kept the title/place/price lead together, and removed the duplicate payment-subject paragraph while preserving the repeatable named Demo table header. That candidate remained 20 pages in both languages.

This refinement changes only spacing and source-list layout: section-heading and paragraph margins, fact padding, two-column source lists with smaller margins, closing-note spacing, and metric-card padding (12px to 10px) / number margins (7px to 6px). Cover layout, font sizes, line heights, facts, headers, warnings, source links and table content are retained.

| Candidate | English pages | Arabic pages | Result                                                                      |
| --------- | ------------: | -----------: | --------------------------------------------------------------------------- |
| v6        |            20 |           20 | Parent baseline; second-language flow alone did not shorten the fixture.    |
| v7        |            20 |           19 | Reduced repeated structural spacing.                                        |
| v8        |            20 |           18 | Two-column source lists; English still had orphan closing notes.            |
| v9        |            18 |           17 | Tighter source/closing spacing; English still had one disclaimer-only page. |
| v10       |            18 |           17 | Additional list margins gave no page-count improvement; not retained.       |
| **v11**   |        **17** |       **17** | Small metric-padding reduction removed the remaining English orphan page.   |

Both final contact sheets were inspected across all **34 pages**. Full-size checks covered [English p17](en-full-17.png), [Arabic p5](ar-full-05.png) and [Arabic p15](ar-full-15.png): the final disclaimer fits above the footer, sources remain numbered and legible, the translation divider separates sections, and the payment table keeps its subject and Demo identity. No obvious clipping, overlapping text, missing glyphs, blank pages or disclaimer-only pages were observed in this bounded inspection.

The rendered HTML body text matches v6 exactly after normalizing only the generated-at timestamp in either digit script. Both source-link arrays remain identical at 20 links each. Font and explicit line-height declarations are identical. These checks are recorded in `validation.json`; they do not infer preservation merely from reduced page counts. Scoped dossier tests passed **3/3**, and renderer ESLint/Prettier passed. No application build or unrelated browser work was run.

## Limits

Seventeen pages remain substantial for three subjects; full bilingual evidence has deliberately not been converted into a short brochure. Two-column source blocks need a future assistive-technology reading-order review; native ordered-list structure and source order are retained, but tagged output is not PDF/UA certification. Source text remains small at its unchanged size, some English original developer descriptions remain within Arabic evidence, and page balance can differ with other portfolio contents. This contributor inspection is neither independent human/native Arabic validation nor physical print testing. No claim of Stage 4 acceptance or broader export-security revalidation is made here.

All Chromium instances from fixture rendering were closed and the PDF/native-database slot was released before documentation was completed. The retained renderer is frozen; the scoped commit includes only the Office comparison-copy repair, PDF renderer and this final evidence folder.
