# DALO – sales launch gate

Status: NOT cleared for sales launch. Updated 2026-09-08.

## Verified locally

- [x] Production build succeeds, including the pending destination package navigation.
- [x] 47 isolated safety tests pass (payment matching, delayed events, one-use login links, provider purchase approval, usage ambiguity, legacy SEO guards and launch configuration checks).
- [x] TypeScript passes; focused lint on the new configuration checker/tests passes.
- [x] `npm run launch:check` distinguishes a real automated sales launch from test preflight. No settings are changed by this command.
- [x] All tests use synthetic inputs/mocked dependencies; no purchase or email was triggered.

## Before publishing this code

- [ ] Review the complete pending diff. Earlier local SEO guard changes and content drafts also exist; do not stage blindly.
- [ ] Verify the new package anchor on a mobile browser against the new build.
- [ ] Commit/push only the reviewed change set, verify deployment and public page output.

## Production-specific checks (not verified by local success)

- [ ] Normal admin login restored; inspect actual purchase, provider and automatic fulfillment switches read-only.
- [ ] Confirm deployed Vercel production environment, domain and release revision. Local `.env.local` is not evidence of production configuration.
- [ ] Stripe live setup and signed payment webhook verified. Turning live payments on requires explicit owner approval.
- [ ] eSIM Go read/validate/live/automatic settings consistent, own/shared-account implications reviewed and provider balance sufficient.
- [ ] Existing shared eSIM Go callback must not be replaced without coordination. Confirm authentic events reach the correct shop and order.
- [ ] Mock fulfillment disabled and per-order test exceptions removed when transitioning to real sales. Never enable provider transactions just to make a checker pass.
- [ ] Real monitored support mailbox and actual From/Reply-To verified; verify delivery to customer inbox, not just API acceptance.
- [ ] Backup/restore capability confirmed for PostgreSQL. Existing SQLite backup command is not a production PostgreSQL backup.
- [ ] Current legal/business details and published policies reviewed by owner; automated checks do not certify legal compliance.

## Explicitly approved end-to-end acceptance

- [ ] Agree test product, customer account, Stripe mode and maximum real eSIM Go cost before purchase.
- [ ] Purchase once; confirm exact amount, product and customer ownership.
- [ ] Confirm one provider order only, installation links and usable QR in the correct customer account.
- [ ] Confirm customer delivery email and support path.
- [ ] Check installation, first connection, usage update and delayed-data message on mobile/PWA.
- [ ] Verify failed/duplicate payment behavior through isolated tests, not repeated real purchases.
- [ ] Confirm operational recovery and who handles an uncertain provider outcome without blindly rebuying.

## Commands and interpretation

`npm run test:safety` is isolated and does not use real service credentials.

`npm run production:check` is configuration preflight, not sales approval.

`npm run launch:check` checks the supplied process environment plus dotenv's selected input file. Set `DOTENV_CONFIG_PATH` intentionally for an approved local configuration snapshot; never treat local defaults as deployed state. The command reports issues without printing secret values and does not connect to Stripe, eSIM Go or the database. A pass cannot prove working webhooks, mail delivery, admin switches or sufficient provider balance.

On 2026-09-08 the explicitly selected local `.env.local` launch check was blocked by 11 issues (test/mock setup, missing live payment/email values and disabled provider capabilities). This is NOT a finding about Vercel production.

Build emitted the existing PostgreSQL SSL-mode future-compatibility warning. Do not weaken certificate validation to silence it; review explicit verify-full configuration separately.

The larger visual redesign remains deferred in the project layout memory list.
