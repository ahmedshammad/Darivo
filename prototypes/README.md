# Darivo concept studio

Run `node scripts/prototype-server.mjs` from the repository root, then open [the gallery](http://localhost:6006). This preview is separate from the Next.js application on port3000.

- [A · Noir Cinematic](http://localhost:6006/prototypes/concept-a/): coastal editorial arrival.
- [B · Sand Editorial](http://localhost:6006/prototypes/concept-b/): research-journal reading structure.
- [C · Noir Atlas](http://localhost:6006/prototypes/concept-c/): selected globe/conversation direction, refined from Glass Atlas.

Use `?lang=ar&theme=light&view=map` (or `en`, `dark`, `home`) to inspect a state. These are static interactive studies. Their fictional cards, simulated responses and honest unimplemented-action messages are not production functionality. C's separate reference panel reads the supplied reference dataset and keeps those real facts apart from its fictional recommendations.

The preview requires network access for OpenFreeMap geographic tiles and glyphs. Fonts, JavaScript and the supplied dataset are served locally. The server is bound to127.0.0.1 and only exposes its explicit prototype/public/reference/media dependencies. It is not a production server.

## Reproduce evidence

`node scripts/capture-concepts.mjs a,b,c <version>` captures Home and Map at1440,1024,390 in both languages and themes plus EN/AR signature videos. It saves manifests with overflow, document language and page errors.

`node scripts/check-concept.mjs <version>` assesses the selected C concept for automated WCAG checks, school-intent retention and a local active-animation frame sample. Run it without other browser workloads. Its text LCP and map-readiness observations are separate measures; it cannot certify a physical phone, throttled4G, native Gulf copy or screen-reader experience.

`node scripts/review-scorecard.mjs docs/reviews/stage-0/v2 1` computes the repaired concept's score from the seven written reviews. A failing review is not overridden by passing automated checks.

The complete brief, role outputs and gate status are in `docs/studio/`; the recorded review iterations and media are in `docs/reviews/stage-0/`.
