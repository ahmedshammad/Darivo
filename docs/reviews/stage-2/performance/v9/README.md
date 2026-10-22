# Route-scoped loading experiment

Production v14 moves the locale-wide loading placeholder to the existing legacy child routes. Home and Explore retain their map readiness UI and now send their real heading/composer without the outer placeholder. Four JavaScript-disabled browser cases pass across both languages. Legacy loading UI remains localized through a shared server component.

| Page    | Performance |   LCP ms | TBT ms | Other categories |
| ------- | ----------: | -------: | -----: | ---------------- |
| Home    |          98 | 2185.677 |  111.5 | 100/100/100      |
| Explore |          96 | 2188.601 |    177 | 100/100/100      |

Observed first and largest content paint coincide at 98ms/76ms in these runs. This removes the observed placeholder/route-discovery failure, with a modest Explore improvement, but neither page meets the separate two-second simulated target. Trace-v2 reconstructs the remaining dependency; do not treat the repair as a full performance pass.
