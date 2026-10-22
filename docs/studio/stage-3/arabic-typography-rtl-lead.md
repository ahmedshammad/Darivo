# Arabic Typography & RTL Lead · Stage 3

Stage 2 is closed following the recorded board gate and current-source CI. This brief defines Stage 3 language and typography acceptance; it does not claim the concierge is implemented or native-reader approved. Read alongside the [master brief](../MASTER-BRIEF-V2.md), the AI Interaction Designer brief and the forthcoming shared concierge contract.

## Register and interaction

Default to calm, Gulf-friendly Arabic understood across the region. Understand Egyptian Arabic without caricature or turning the response into Egyptian sales copy. Keep the user's literal wording in the Brief; use concise authored Arabic for explanations. No emojis, exclamation marks, flattery, urgency, “perfect investment,” guaranteed yields or unsupported “available now” claims. One useful clarification at a time. Do not ask again for facts already present in the Brief.

A suitable opening is «نبدأ بالسعديات ونخلة جميرا، ونوضح لك الفروق والمعلومات التي تحتاج تأكيداً.» A limitation can say «المصدر يذكر هذا الموعد، لكنه لا يؤكد الجاهزية الحالية.» For privacy, say «لن أرسل طلبك إلى مستشار من دون موافقتك» only when the server enforces that boundary. Do not turn an advice refusal into an automatic handoff.

Avoid the legacy empty-state implication «لم أجد عقاراً متاحاً». Prefer «لم أجد نتيجة مطابقة في البيانات المتاحة». Avoid conflating a simulated record with a verified fact through phrases such as «بياناتنا الافتراضية الموثّقة». Identify the exact basis: مشروع تجريبي، إعلان وسيط، تقرير صحفي، or source-backed project reference.

Explicit response-language preference overrides script detection. “Explain in English لو سمحت” remains English. Otherwise use the established conversational language, allowing the user to change it; an Arabic place name alone must not flip an English conversation. Understand الخليج/Egypt variants; do not infer a person's nationality or dialect preference from their name.

## Three bilingual acceptance journeys

| Persona | English                                                                                 | Arabic                                                                    | Meaning to preserve                                                                                              |
| ------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Sheikha | A beachfront villa on Saadiyat or Palm Jumeirah for my family. Keep my request private. | أبي فيلا على البحر في السعديات أو نخلة جميرا للعائلة، ولا ترسل طلبي لأحد. | Two alternative locations, villa, beachfront requirement, family use and explicit no-sharing boundary.           |
| Karim   | North Coast summer home ready by 2028, compare with a Dubai investment.                 | عايز بيت للمصيف في الساحل يكون جاهز بحلول ٢٠٢٨، وقارنه باستثمار في دبي.   | Separate holiday and investment market requirements; preserve the deadline without claiming confirmed readiness. |
| Elena   | Explain Dubai neighbourhoods for a family with two kids near a British school.          | اشرح لي مناطق دبي لعائلة عندها طفلين، وأبحث عن مدرسة بمنهج بريطاني قريبة. | Teaching intent, two children, curriculum preference, school layer and explicit data limitations.                |

These Arabic examples are authored test inputs, not a native Gulf certification. Elena remains an English-speaking persona; the Arabic variant satisfies bilingual product acceptance.

## Meaning, correction and numbers

- Preserve alternatives: «السعديات أو النخلة» is an OR choice, not one arbitrarily selected neighbourhood. «مب نخلة جبل علي، أقصد نخلة جميرا» removes the first place.
- Negation must bind to its clause: «مش فيلا، شقة» selects apartment and excludes villa; «لا تحفظ ولا تحجز» prohibits both writes. A later clear affirmative instruction must identify the action and scope before revoking a prohibition; ambiguity asks for clarification.
- «قبل ٢٠٢٨» and «بحلول نهاية ٢٠٢٨» have different boundaries. «جاهز» describes a readiness requirement, not proof that a source date has passed. Preserve the original temporal phrase and ask when “ready by 2028” needs a year-start/year-end distinction.
- Normalize Arabic-Indic and Persian digit forms, Arabic decimal/grouping separators and ordinary ASCII variants for parsing. Preserve the original user string. `١٢٫٥ مليون` and `١٢٬٥٠٠٬٠٠٠` both mean 12,500,000; do not truncate at the separator.
- Distinguish original budget currency, preferred display currency and payment currency. «بفكر بالدولار والإسترليني، بس هادفع بالجنيه» does not supply an amount or make GBP the universal budget currency.
- Keep children count separate from bedrooms. «عندي طفلين» must not become a two-bedroom filter. British curriculum remains an unverified requirement if the dataset has only fictional school POIs.

## Typography and access

Retain the approved Arabic display/control fonts and logical spacing. No Arabic letter spacing or Latin italic imitation. Isolate project names, IDs, source dates and currency amounts with bidi boundaries; use `dir="auto"` for user-authored mixed text. Arabic-Indic display preference affects presentation, never stored amounts, entity IDs or URLs. Keep exact source names available alongside translated context.

Brief edits must not remount a focused input on each streamed update, move the caret, reverse mixed currency tokens or overwrite an unsaved edit. Announce stable Brief changes, tool outcomes and errors concisely; do not announce each streamed token. Keep the real composer available during evidence reading, with stable pointer targets and predictable focus restoration.

Voice is optional enhancement: honest unavailable/denied states, editable transcript before consequential actions, and a typing fallback. A recognized transcript is not confirmation to share, save or book. Gulf/Egyptian speech recognition needs direct device/native-speaker validation; mock text coverage cannot certify it.
