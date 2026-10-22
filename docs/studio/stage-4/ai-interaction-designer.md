# Stage 4 · AI interaction designer

Discovery brief; implementation waits for the shared Office contract. See [Office proposal](OFFICE-PROPOSAL.md) for routes/DTOs and [Stage 4 requirements](../MASTER-BRIEF-V2.md) for scope. Existing Concierge tools propose saves/viewings/handoffs; `confirm.ts` commits them exactly once, but save/viewing currently accept units only. No parser change is proposed during discovery.

## Keep the conversation and Office continuous

A portfolio belongs to the signed-in client, with a named board and typed entries. “Save these” must refer to the actual authorized current selection; ambiguous references ask one short question. The confirmation names the destination board, entries and consequences. On success, return a direct link to that persisted board. The Office should not ask the client to reconstruct an already confirmed selection. A REAL_REFERENCE project can be researched/saved as a project interest; its on-request status cannot become an exact unit or payment schedule. A fictional project first requires an authorized unit selection.

Direct UI actions are explicit client instructions: selecting Add, confirming its named target, submitting a message or requesting a viewing. They should not require a second generic permission dialog. AI-originated writes retain the concrete proposal/confirmation boundary. Persisted privacy prohibitions remain effective; resolving a no-save/no-share conflict needs a specific client choice, not an inferred consent update. Changing language, comparison order or display currency is a reversible reading preference and should not submit a request to a human.

## Interaction requirements

- **Portfolio save:** resolve two–four compared entries or the explicitly selected set, show duplicates as already saved, and retain mixed project/unit distinctions. Never silently omit an unauthorized entry and claim the whole save succeeded.
- **Dossier:** produce the board the client asked for, with current authorization and explicit unknowns. Generating a local download is not advisor sharing. No summary may add factual claims beyond its cited facts. A historical source date is not a verification date; price-on-request stays unknown.
- **Viewing:** separate proposed time, submitted request and confirmed appointment. For reference projects, offer a residence enquiry or introduction through the assigned advisor thread, never a ViewingRequest row. A calendar has no available inventory slots unless backed by an actual schedule.
- **Advisor:** show the assigned identity or honest absence. The thread is a human communication surface; the AI must not impersonate that advisor, invent replies or imply active monitoring. A prepared message remains a draft until Send.
- **Context sharing:** attach a board or Brief excerpt only after the client can inspect its exact scope. Sender, recipient and included entries are explicit. Reauthorize typed attachments on every read and avoid copying private facts into opaque stored summaries.
- **Corrections:** “Remove the Dubai option” changes only the named board entry; “do not send this” cancels a pending draft/proposal rather than deleting unrelated stored work. “Show GBP” changes display, never an original price or payment intent.

## Short bilingual jobs

| Client intent     | English                                          | Arabic                                                    | Boundary                                                  |
| ----------------- | ------------------------------------------------ | --------------------------------------------------------- | --------------------------------------------------------- |
| Family board      | Save these options to Family homes.              | احفظ هذه الخيارات في «منازل العائلة».                     | Named board and selected IDs visible before persistence.  |
| Private handoff   | Send only this portfolio to my assigned advisor. | أرسل هذه القائمة فقط إلى مستشاري المكلّف.                 | No automatic conversation history or other boards.        |
| Time preference   | Request a video viewing at 3 pm London time.     | اطلب معاينة عبر الفيديو الساعة الثالثة عصراً بتوقيت لندن. | Exact date required; request is not booking.              |
| Reference inquiry | Ask about residences at SouthMED.                | استفسر عن الوحدات المتاحة في ساوث ميد.                    | No invented current availability or demo-unit attachment. |
| Stop sharing      | Do not send the message; keep it as a draft.     | لا ترسل الرسالة؛ أبقها مسودة.                             | No transmission; persistence policy must be explicit.     |

These are acceptance phrases, not claims of current parser support. Persona jobs: Sheikha controls access and shared context; Karim preserves two markets/currencies and London scheduling; Elena asks about unverified school suitability without fabricated assurance.

## Evidence plan

Record the actual multi-surface path, not screenshots of disconnected success states. Assert original subject/name/currency at every step. Verify one successful write despite double clicks/retries, no write on cancellation, no messages on merely opening a handoff, and fresh authorization after a proposal expires or a grant is revoked. Require stable keyboard focus across confirmations and status updates, with a recoverable draft on network failure. Tests/evals for UI, API and AI must inspect actual returned identifiers and values. Human advisor response times, current market truth and native Arabic comfort need external validation rather than scripted claims.
