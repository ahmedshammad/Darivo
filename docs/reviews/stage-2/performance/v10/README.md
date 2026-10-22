# Scoped CSS experiment

Production v15 scopes legacy page styles to a URL-preserving route group. Shared fonts, reset, headings, forms, focus, reduced-motion and error helpers remain in `app/base.css`. Preferences controls were separated from the state provider, and Arrival sign-out is imported on demand. The full root translation provider/Shell is still present in this measurement.

Eight computed-style snapshots (Home/Explore × EN/AR × 390/1440, dark, reduced motion) were identical to v14, including sampled heading, header, footer, form and link geometry. This is a bounded comparison, not the full review matrix. A fresh local Home HTML response shrank from 176,407 raw / 38,555 gzip bytes to 147,177 raw / 32,671 gzip bytes; local gzip measurements exclude transfer overhead.

| Page    | Performance |   LCP ms | TBT ms | Other categories |
| ------- | ----------: | -------: | -----: | ---------------- |
| Home    |          98 | 2182.993 |  129.5 | 100/100/100      |
| Explore |          96 | 2205.527 |  173.5 | 100/100/100      |

The unchanged audit confirms no material LCP improvement from this extraction alone. The strict two-second target remains open. Styles and page content were conserved; no audit settings or visible facts were removed. A stale generated development validator initially blocked the build after route moves; deleting only `.next/dev/types` and rebuilding resolved it.

Six production browser cases also passed: four EN/AR no-JavaScript first-content cases and two legacy→Atlas navigation style regressions.
