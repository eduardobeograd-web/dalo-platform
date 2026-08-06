# DALO Architecture and Product Decisions

Last updated: 7 August 2026

## 1. DALO recommends; it does not expose provider complexity

The customer sees one primary recommendation and an optional alternative.
Provider IDs, internal states and catalogue complexity stay in Admin.

## 2. Next.js remains the shared web platform

Public pages, account pages, Admin, API routes, SEO and PWA behavior live in one
Next.js App Router application. This keeps product and order rules shared.

## 3. PostgreSQL is the system of record

Prisma uses PostgreSQL. Neon is the managed production database target. SQLite
scripts exist only for historical migration and backup support, not as the
production architecture.

## 4. Orders preserve the purchase-time truth

An order stores the customer-visible price, currency, provider cost, product
description and provider mapping from the moment of purchase. Later product
imports or price changes must not alter old orders.

Payment status and fulfillment status remain separate.

## 5. Stripe and provider fulfillment are separate systems

A verified Stripe payment does not imply successful eSIM delivery. Paid orders
can remain available for manual handling when provider fulfillment is disabled,
fails or needs reconciliation.

## 6. An eSIM profile can contain multiple bundles

`EsimProfile` represents the installed ICCID. `EsimBundle` represents each data
package. Reuse lifetime, activation deadline and bundle expiry are separate.

Before a top-up, DALO must verify that the requested bundle is compatible with
the existing ICCID. If a new installation is required, it must be sold and
explained as a new eSIM rather than a top-up.

## 7. Provider activation is fail closed and staged

API key, reads, validation, callbacks, live fulfillment and top-ups are
independent capabilities. Live fulfillment also requires the Admin provider
switch. The order in `ESIM_GO_ROLLOUT.md` is mandatory.

Unknown provider outcomes are reconciled manually. They are never blindly
retried because a duplicate transaction could create a second charge or bundle.

## 8. Admin uses database identities and least privilege

Admin access uses password hashes, database-backed sessions, forced password
changes, roles, granular permissions and audit logs. Reversible operational
controls remain available for support and controlled testing.

## 9. Product imports must not overwrite editorial or historical data

Provider imports can update catalogue facts. They must not overwrite destination
editorial content or purchase-time order snapshots. Imports require preview,
mapping, validation and deliberate confirmation.

## 10. Recommendations optimize fit, not only price

The shared recommendation engine considers destination, duration, usage,
minimum practical data and active products. Very small or emergency-only plans
must not become the main recommendation merely because they are cheapest.

Recommendation outcomes and usage events should improve the rules over time.

## 11. SEO pages require editorial quality

Destination pages are published and indexed independently. Incomplete,
duplicated or productless pages should remain `noindex`. Each priority page
should provide verified, useful travel and connectivity information.

## 12. PWA is the first app experience

The existing PWA is the primary installable mobile experience. Native or
store-packaged apps come after the checkout, account, provider and support flows
are proven. App clients should reuse the same protected APIs and backend rules.

## 13. Team Access is temporary launch control

The site can be protected during private testing through the Team Access switch
and shared test password. It must be intentionally turned off for public launch.

## 14. Customer language stays simple

Use customer-facing states such as `Purchased`, `Activate by`, `Plan valid
until` and `eSIM reusable until`. Do not surface provider jargon unless it helps
installation or support.

## 15. Git protects working releases

Inspect the worktree before changes, avoid unrelated files, verify in proportion
to risk and commit coherent working blocks. Database migrations, live provider
flags and payment changes require extra review.

## 16. Documentation has one source for each purpose

- `PROJECT_TODO.md` is the canonical open-task list.
- `PROJECT_VISION.md` describes direction.
- `ARCHITECTURE.md` describes the current implementation.
- `DECISIONS.md` describes rules future changes must respect.
- `ESIM_GO_ROLLOUT.md` controls provider activation.

Old chats are historical context, not the current source of truth.
