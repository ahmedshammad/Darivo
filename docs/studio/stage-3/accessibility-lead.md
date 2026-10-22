# Stage 3 — Accessibility Lead

Design specification only. Preserve the accepted Atlas's keyboard controls, origin selection, project-list alternative, comparison clearance, geographic fallback and source readability. Stage 2 automated checks do not certify this new flow or replace native assistive-technology review.

## Input, Brief and conversation

Use a labelled multiline composer, not the single-line specimen. Enter submits only outside IME composition; Shift+Enter adds a line. A visible send button provides the equivalent action. Busy state exposes Stop without trapping focus or losing the draft. Empty, recording, permission-denied, unavailable, cancelled and failed states require explicit localized messages.

Use one stable form for the Brief with persistent field IDs. Incoming patches do not remount fields, reset selection or steal focus. Editable values remain authored text where appropriate; formatting a numeral preference must not rewrite the user's words. Announce a concise summary after a committed revision, such as updated result count and unmet requirements, rather than reading every field mutation aloud. Validation errors identify the field and preserve entered values.

The conversation has a clear heading and labelled message groups. Do not stream every token into a live region. Keep a separate polite status for generation and announce completion with a short summary; full content remains navigable. If the user is reading history, new content must not move their scroll position. A user-triggered new-response action may move focus to the new response heading.

## Focus and spatial controls

Selecting a project from a card moves focus to its evidence heading only when that action opens the evidence view; Back returns to the initiating control where it still exists. Passive map changes never move focus. History restoration does not replay camera actions or announcements. Keyboard pan, zoom and Enter-to-select-current-center remain available in WebGL and fallback modes.

Use Atlas's nonmodal sheet for conversation/map switching. Its labelled expand/collapse control is the keyboard alternative to dragging; do not rely on swipe. Keep only the active sheet panel's controls in the tab sequence. Modal dialogs are reserved for secondary tasks and require appropriate initial focus, Escape and return focus. The existing dock needs an explicit panel relationship and Escape behavior before reuse.

Cards use ordinary buttons/links with accurate names; no clickable article-only targets. Comparisons use semantic row/column headers and a keyboard-scrollable region. Charts require a text summary and equivalent data table. Layer selection has a persistent pressed/selected state. Information must not depend solely on pin height, glow, color, motion or hover.

## Arabic, voice and reading geometry

Co-design RTL ordering while preserving isolated native currency/amounts, source domains and dates. Mixed Arabic/Latin text, Arabic-Indic digits and IME composition need focused tests. Source names remain readable without inserting invented translations. Native Gulf wording, Egyptian-dialect recognition and Arabic screen-reader behavior are separate validation tasks.

Voice is user-started, visibly active and stoppable. Keep typed input fully usable if recognition is unsupported or permission is denied. Recognition results populate an editable draft and do not submit automatically. Disclose any browser speech-service processing before capture. Optional TTS must never autoplay and must stop on user request/navigation; it is not a replacement for screen-reader access.

Retain the mobile 52px reading composer and expanded multiline editing behavior where appropriate. At a 500px viewport, preserve a positive evidence viewport, bounded scrollable source notes and reachable attribution. A desktop resize does not reproduce a physical software keyboard: test visual viewport changes and real phones separately. Avoid two nested scroll regions when one can provide a usable equivalent, but never hide required source qualifications to improve apparent space.

## Required validation

For each persona in EN/AR: keyboard draft → send → response → Brief edit → compare/map → evidence → Back; cancel and retry; no-result recovery; source opening; history restoration. Add reduced motion, failed network, missing WebGL and actual software-renderer paths. Check 1440/1024/390 plus 375px/short-height focus states, 200% zoom/reflow and explicit numeral preferences. Test a screen reader's message announcements and focus order, not only axe. Authentication continuation must restore the draft without an automatic POST. Report physical-device/native-AT gaps rather than claiming conformance from automated passes.

## Implementation audit — before production review

Focused development-browser checks cover English/Arabic Brief editing without remount, cancellation retaining the draft, retry, clear-history → send, source links and contextual sign-in without an automatic POST. Inline map anchors are named buttons; charts have equivalent tables. The phone sheet has an explicit expand/collapse control as well as dragging. Short 375 × 500 checks retain a reachable composer and positive reading region. The new condition-scope and verification controls use native select/checkbox elements and localized labels; the scoped English/Arabic payload regressions pass, including persisted selected scope and optional evidence. A separate signed-in UI test passes for confirmation receipt/focus and the disabled-saving footer; its confirmation response is simulated, so it makes no backend-write claim.

Speech recognition requires explicit consent and a user action, writes into an editable draft, and never submits automatically. It currently uses the page's `ar-AE` or `en-AE` locale; it does not auto-detect language. Browser support, Gulf/Egyptian dialect accuracy, Arabic TTS voices and speech-service behavior are not certified. Typed input remains the reliable alternative. TTS is opt-in and stops during cleanup.

Generic validation feedback is less precise than the desired field-specific errors. The audit-triggered fixes add a polite, persistent confirmation receipt, return focus to the composer after the proposal disappears, and make the footer reflect do-not-save mode. These bounded fixes do not establish completed accessibility. Automated axe and browser checks do not establish screen-reader announcement quality, 200% zoom, native Arabic assistive technology, actual software-keyboard behavior or physical-phone usability. Those checks and the complete production matrix remain outstanding.
