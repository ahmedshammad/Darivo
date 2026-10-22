# Stage 4 · Accessibility lead

Discovery requirements for the [Private Office proposal](OFFICE-PROPOSAL.md). Reuse the approved focus, contrast and reduced-motion tokens. The Stage 3 all-rules axe repairs demonstrated why narrow automated rule subsets are insufficient; Stage 4 must combine broad automation, keyboard evidence and explicit human-AT limits. No new accessibility pass has been run for this proposal.

## Reading structure and actions

One h1 identifies the Office or board. Use h2 for portfolios, upcoming viewings, advisor and collection sections; cards and dialogue headings follow that hierarchy. Board cards are articles/lists with a clear title link and separately named controls. A card cannot be one giant button containing other buttons. Icon-only controls include the board/entry name in their accessible name. Every target is at least44px where feasible, with adequate spacing and visible focus in both themes.

Renaming, removal and creation preserve a predictable focus destination and announce concise persisted results. Deleting a board uses an accessible confirmation naming it, with focus returned to the next board or create action. No notification claims success before a server response. Pending/failed states retain input and permit retry; submitting twice must not duplicate messages or viewing requests.

## Comparison and mobile layout

Two–four selected entries produce a real table with caption, column/row headings and explicit unknown cells. Wrap it in a labeled focusable scroll group, keep selection controls keyboard reachable, and expose a clear mobile scroll cue. A stacked alternative can improve small-screen reading but must preserve field/subject associations. Do not render both representations into the accessibility tree at once. Native currencies and conversion qualifiers must be read in the intended order, not as detached superscripts.

The normal-scroll Office does not reuse the fixed map sheet. A mobile comparison tray reserves space, respects safe-area insets and never covers the last card control or error message. Test375/390px, 500px short heights, landscape, text enlargement and200% zoom. Essential fields must remain reachable with a physical virtual keyboard; desktop emulation cannot certify that.

## Calendar, advisor and gate

Calendar has an agenda equivalent with all requested/confirmed appointments. Each day exposes date and event count; keyboard arrows move deliberately within the grid, with a documented exit to normal tab order. The zone selector is explicitly labeled and its changes announce the date/time effect without announcing the entire calendar. Confirmation includes local date, city/zone, alternatives and mode. DST error messages attach to the relevant field and offer an actionable correction.

Advisor status uses text, not color alone. A missing/unknown availability state is not an empty unlabeled dot. The thread uses semantic message grouping, author, timestamp and concise live announcements only for new persisted messages. Loading history should not steal focus or read the whole thread. Sending preserves focus at the composer; errors keep the draft. Staff notes are not exposed. A generic private gate has an accessible heading and next step, never disabled previews that leak names through alt text or accessible labels.

## Dossier and verification

Provide an accessible HTML reading view of the same authorized dossier alongside the download if PDF tagging cannot yet be demonstrated. PDFs need embedded fonts, logical text order, links and headings, contrast, readable source notes and no clipped overflow. Verify searchable Arabic and original numeric values, not just raster page appearance. Do not claim PDF/UA from Playwright printing alone.

Acceptance evidence should include: keyboard-only creation→compare→export→request; screen-reader smoke coverage of table/agenda/thread and language changes; broad axe scans on success, empty, error and revoked-access states; pointer and keyboard modal focus restoration; no-JS server gate/content behavior where supported; reduced-motion behavior; authorization checks on UI/API/AI/PDF/thread attachments. Include two-client, partner, unverified, verified and revoked-grant fixtures. Any untested native AT, physical phone, field INP or PDF tagging must remain an explicit limitation rather than a passed criterion.
