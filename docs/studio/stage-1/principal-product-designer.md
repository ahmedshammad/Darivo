# Principal Product Designer · Stage 1

## Foundation contract

The selected Noir Atlas keeps conversation and geography as the primary experience. Foundation work must preserve the small set of choices the client has already made: language, currency, area unit and numeral style. Display preferences are a visible personal choice, not inferred from nationality. Switching Arabic must not silently choose a new currency or rewrite a property's source amount.

Explicit roles are CLIENT, VERIFIED_CLIENT, ADVISOR, DEVELOPER_PARTNER and ADMIN. A developer partner is not an advisor and does not inherit confidential client inventory. Verified access requires both the explicit verified-client role and current verified status; downgrading either removes access on the next data lookup. Private invitations remain individual grants for client roles.

## Flows

- A client chooses Arabic-Indic numerals in Profile, saves consented preferences, and sees the same choice after reload and while viewing prices.
- A signed-in client can adjust display choices without changing the underlying property facts. The source amount remains identifiable alongside indicative conversions.
- A partner can enter the demo with a clearly named role and sees public client-facing inventory. The partner console belongs to a later stage; its demo identity must not create a privacy bypass now.

## Decision and review

Preserve authentication and existing API routes rather than rewrite the login flow during design-system integration. Changes to role authorization are centralized and tested. Stage 1 review must inspect saved preferences and role boundaries, not just a styled toggle. Remaining developer-console functionality is tracked in its later stage, not simulated by elevated access.
