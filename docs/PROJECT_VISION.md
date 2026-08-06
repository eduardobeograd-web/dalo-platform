# DALO Project Vision

Last updated: 7 August 2026

## What DALO is

DALO is a travel eSIM recommendation and management platform. Its purpose is
not to show travelers hundreds of nearly identical plans. DALO compares the
destination, trip length and expected usage, then explains one strong match and
an optional alternative.

The intended journey is:

1. Choose a destination.
2. Describe the trip and expected data use.
3. Receive a clear recommendation.
4. Pay securely.
5. Receive and install the eSIM digitally.
6. Track the plan, get support and later add a compatible bundle.

## Customer promise

Customers should immediately understand:

- why a plan fits their trip;
- data amount, validity and price;
- when activation begins;
- how installation and delivery work;
- what support is available;
- whether the installed eSIM can be reused.

Provider names, internal IDs, reconciliation states and catalogue complexity
remain internal unless a detail is genuinely useful to the customer.

## Current product state

The repository currently contains:

- homepage destination quiz, recommendation flow and result page;
- country and region sales pages with SEO controls;
- Stripe checkout, webhook processing and purchase-time order snapshots;
- customer login, password recovery, dashboard, order detail, invoice,
  settings and support;
- transactional order and delivery email templates;
- installable PWA experience;
- role-based admin, team-access switch, audit log and activity views;
- product catalogue, imports, margin checks and recommendation settings;
- order, support, destination, SEO audit and provider administration;
- PostgreSQL/Neon Prisma schema and migrations;
- separate eSIM profile, bundle and provider-operation records;
- eSIM Go read, validation, webhook, fulfillment, usage and top-up code behind
  fail-closed capability flags.

Implementation in the repository does not mean a production capability is
enabled. Provider transactions and top-ups remain gated until the rollout
runbook is completed.

## Current phase

DALO is in controlled launch preparation. The priority is operational proof,
not more surface area:

1. verify the latest database migration in the intended Neon environment;
2. add the dedicated DALO eSIM Go key securely;
3. complete read-only, validation and signed-callback testing;
4. prove one controlled new-eSIM transaction end to end;
5. verify email, customer account, support and reconciliation behavior;
6. enable top-ups separately only after new-eSIM fulfillment is reliable;
7. finish production, legal, support and SEO launch checks.

## Longer-term direction

- Compare multiple eSIM providers internally while keeping one simple customer
  recommendation.
- Improve recommendations using real conversion and usage outcomes.
- Expand individually reviewed destination content based on Search Console and
  customer demand.
- Add lifecycle communications, usage alerts and safe renewal/top-up journeys.
- Publish mobile-store apps only when the existing PWA and app APIs are stable
  enough to justify the additional release process.
- Explore partner, reseller and white-label models after the direct customer
  journey is proven.

## Product principles

- One clear recommendation is better than a raw catalogue.
- Cheapest is not automatically best.
- Never hide an operational failure behind a successful payment state.
- Never sell a top-up when a new eSIM installation is required.
- Keep eSIM profile lifetime separate from bundle activation and expiry.
- Publish useful destination pages, not mass-generated thin pages.
- Keep provider activation reversible and fail closed.
