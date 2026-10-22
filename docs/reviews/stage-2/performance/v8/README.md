# Hardware production v8

Ordinary Lighthouse command, unchanged audit settings, production v12 on the local Apple M3. No other browser or CPU test batch ran during measurement.

| Page    | Performance |   LCP ms | TBT ms | Other categories |
| ------- | ----------: | -------: | -----: | ---------------- |
| Home    |          98 | 2179.483 |  133.5 | 100/100/100      |
| Explore |          96 | 2327.811 |    172 | 100/100/100      |

Worker capability preflight retains the hardware path. These results pass the existing CI score floor, but do not meet the separate two-second LCP requirement or establish performance on M1/physical phones. Real WebGL EN/AR comparison endpoint tests pass pointer selection at 20px offsets from both glyph centers (22px target radius).
