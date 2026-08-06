# DALO Architecture

Last updated: 7 August 2026

## Runtime and deployment

- Next.js 16.3 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Vercel deployment target
- PostgreSQL with Prisma 7 and the PostgreSQL adapter
- `DATABASE_URL` for pooled runtime access
- `DATABASE_URL_UNPOOLED` for direct migrations

Local SQLite migration utilities remain in the repository for historical data
transfer and local backups, but PostgreSQL is the application datasource.

## Main customer flow

Homepage quiz -> recommendation -> result -> checkout -> Stripe Checkout ->
verified webhook -> order -> fulfillment -> delivery email -> customer account

Payment and fulfillment remain separate. A paid order can still require manual
handling if provider fulfillment is disabled or fails.

## Main application areas

### Public and sales

- homepage quiz and destination search;
- recommendation and result pages;
- country/region landing pages;
- checkout and success flow;
- FAQ, support, contact, company and legal pages;
- PWA install experience.

### Customer account

- password and magic-link session flows;
- dashboard and order history;
- order/eSIM detail and invoice access;
- installation information and usage state;
- account, billing, consent and session controls;
- linked support requests.

### Administration

- dashboard and launch readiness;
- products, imports and margins;
- recommendation settings, outcomes and upsells;
- orders and manual recovery controls;
- customers' support requests, replies and push notifications;
- destinations, indexability and SEO audit;
- provider configuration;
- team access, users, roles, permissions, activity and audit logs.

## Data model

The important boundaries are:

- `Product` — current sellable catalogue item.
- `Order` — immutable purchase context and payment/fulfillment state.
- `Customer` / `CustomerSession` — account and authenticated sessions.
- `EsimProfile` — installed provider profile identified by ICCID.
- `EsimBundle` — one data package assigned to an eSIM profile.
- `ProviderOperation` — idempotent provider request and reconciliation record.
- `ProviderWebhookEvent` — signed callback record and processing state.
- `ProviderConfig` — operational provider switches.
- `DestinationPage` — editable publication and SEO content.
- `AdminUser` / `AdminSession` / `AdminAuditLog` — protected administration.
- `SupportRequest` / `SupportReply` — tracked customer service.
- `CustomerEvent` — first-party product and journey analytics.

An eSIM profile can own multiple bundles. The eSIM's reuse lifecycle is not the
same as a bundle's activation deadline, start time or expiry.

## Orders and payments

Stripe Checkout is created server-side. The Stripe webhook verifies events and
updates the order. Orders store purchase-time snapshots including amount,
currency, wholesale price, product name, destination, data, validity and
provider mapping so later catalogue changes do not rewrite order history.

Legal acceptance and immediate-delivery consent are recorded separately.

Test and live behavior is controlled by environment configuration. Test
checkout and mock fulfillment must remain disabled for a public live launch.

## eSIM Go integration

The provider integration is fail closed. Capabilities are enabled in order:

1. API key present
2. read access
3. validation
4. signed callbacks
5. live fulfillment
6. top-ups

Live fulfillment additionally requires the provider's database-backed Admin
switch. A key or environment flag alone is insufficient.

Provider operations use idempotency keys and preserve request/response summaries
and error state. Unknown or provider-committed outcomes must be reconciled in
the provider portal rather than retried automatically.

See `docs/ESIM_GO_ROLLOUT.md` for the mandatory activation procedure.

## Authentication and access

Customer and admin sessions are database backed. Tokens are stored in secure,
HTTP-only cookies and verified using hashed token values.

Admin access uses database users, password hashes, forced password change,
roles, granular permissions, 12-hour sessions and audit logging. The old static
`dalo_admin=true` demo-cookie architecture is no longer the active model.

Optional Team Access can protect non-admin pages with a shared test password.
It is controlled through `SiteConfiguration` in Admin and should be off for the
public launch.

## Email and support

Resend sends transactional messages. Order emails can include delivery,
installation, reusable-eSIM guidance and verified destination safety details.
Support requests and replies are stored in PostgreSQL and linked to customers
and orders. The support console can use PWA push subscriptions.

## SEO and destination content

Destination pages separate editorial content from provider product imports.
Publication and Google indexability are independent controls. Sitemap,
canonical and structured-data behavior should only expose pages that meet the
required quality and product-availability rules.

## PWA and app surface

The web application includes a manifest, icons, service worker and install UI.
Customer-facing JSON APIs under `/api/app` support a future packaged or native
client without duplicating core order logic.

## Operational checks

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `npm run production:check`
- `npm run prices:check-margins`
- `npm run recommendations:audit`

Migrations must be deployed deliberately to the intended database. Preview and
production environments must not unexpectedly modify the same database.

## Sensitive and generated files

Do not commit secrets or local/generated state, including:

- `.env` and `.env.local`
- API keys and database credentials
- `node_modules`
- `.next`
- temporary exports, screenshots and generated reports

Before risky work, inspect `git status`. Commit only the intended files after a
working block passes proportional verification.
