# Arabic Typography & RTL Lead · Stage 1

Arabic display uses the chosen editorial direction; Arabic UI remains clear and restrained. This foundation adds an explicit Arabic-Indic numeral preference, independent of language and currency. The default remains Latin digits to avoid changing existing financial display without consent. Selecting Arabic-Indic digits changes glyph presentation, not stored AED/EGP values or FX assumptions.

Format numeric values through Intl with an explicit numberingSystem. Currency codes and full amount strings are isolated for bidi safety. Preserve native source currency and original price before presenting any converted estimate. Arabic source-price and conversion labels must distinguish facts from indicative display conversions. Do not use character replacement to change a stored price or send localized numeric strings as API amounts.

The preference is visible in Profile and display controls, persists for the signed-in user, and survives reload. Anonymous choices may remain local to that browser; they must never become a server access capability. Form labels and announcements are translated, with a numeric preview such as ١٢٣٤٥٦٧٨٩٠.

Stage 1 evidence must include both numeral styles in EN and AR, mixed-script currencies, reload persistence, and unchanged source amounts. Native Gulf language quality still requires a qualified human review; these implementation checks do not certify it.
