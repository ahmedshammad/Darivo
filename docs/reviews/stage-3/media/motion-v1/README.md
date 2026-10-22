# Local Concierge motion evidence

Measured production source `157bd02` on an Apple M3, macOS, headless Chrome 155. The report records the actual OS, CPU, GPU and browser identifiers. EN/AR at 1440px and 390px yields twelve measured three-second windows: conversation flights, explicit place-selection flights and keyboard-triggered phone-sheet transitions.

There are 418 moving MapLibre render intervals. Window medians range from 16.5 to 16.9ms. One interval exceeds 33.34ms (33.5ms); none exceeds 50ms. Moving sheet RAF medians are approximately 16.7ms. No page errors or incomplete configurations were reported. Raw intervals and all per-window summaries remain in `performance.json`.

This measures local synthetic interaction windows without network/CPU throttling, screenshots or recording during measurement. RAF callbacks and MapLibre render events do not prove physical display presentation, field INP, M1 performance or physical-phone frame pacing. The 390px runs emulate a phone viewport and touch capability on the same M3. Later exact Arabic display translations preserve facts and do not change the measured map or sheet implementation; their source verification is recorded separately.
