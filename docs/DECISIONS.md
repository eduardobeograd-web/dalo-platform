# DALO Architecture Decisions

## Decision 1: Use Next.js

DALO uses Next.js because it supports:

* landing pages
* app routing
* server components
* API routes
* future deployment on Vercel
* good performance foundation

## Decision 2: Use Prisma and SQLite locally

For the local MVP, DALO uses Prisma with SQLite.

Reason:

* simple local development
* easy database setup
* good enough for MVP
* structured product, customer, order and support data

Future production should not rely on local SQLite.
Before deployment, DALO should move to an online database such as Postgres through a provider like Supabase, Neon, or another managed database.

## Decision 3: Build Admin first

The project focuses on Admin early because DALO depends on product management.

The admin must allow:

* adding products
* editing products
* activating/deactivating products
* checking margins
* viewing orders
* managing support requests
* changing support request status
* managing provider product IDs
* previewing Excel rate sheets

## Decision 4: Use a shared AdminShell

Admin pages should use:

`components/AdminShell.tsx`

Reason:

* avoid repeated sidebar code
* easier navigation changes
* consistent desktop and mobile admin layout

Current AdminShell navigation includes:

* Dashboard
* Products
* Recommendations
* Upsells
* Orders
* Support
* API Providers

## Decision 5: Use a shared recommendation engine

Recommendation logic lives in:

`lib/recommendation.ts`

Reason:

* result page and admin preview should use the same logic
* avoid different pages showing different recommendations
* make future product logic easier to improve

Current logic considers:

* country
* region
* trip days
* usage type
* active products
* sell price
* upsell product

Important recommendation principle:

Cheapest does not always mean best recommendation.

## Decision 6: Checkout first, Stripe later

The checkout currently creates test orders in the local database.

Reason:

* safer than connecting Stripe too early
* allows testing the full customer-to-admin flow
* keeps the product moving without payment risk

Current flow:

Checkout → Create Pending Order → Success Page → Customer account → Dashboard → Order detail.

Stripe is prepared but not live.

## Decision 7: Orders track payment and delivery separately

Orders have two separate statuses:

* Payment Status
* eSIM Delivery

Reason:

A customer can pay successfully, but eSIM delivery can still fail.

Example:

Payment: Paid
eSIM Delivery: Failed

This means the money was received, but the provider API or delivery process failed.

## Decision 8: Admin order controls are reversible

Admin Orders includes manual controls:

* Mark Paid
* Reset Payment
* Delivered
* Failed
* Reset Delivery

Reason:

During MVP testing, mistakes must be reversible.

Later, Stripe and provider API will automate these states, but manual controls are useful for testing and support.

## Decision 9: Excel import should be careful

DALO should not blindly import thousands of rate sheet rows.

Safer flow:

Upload Excel → Preview sheets → Choose sheet → Map columns → Preview products → Admin confirms import.

Current state:

Excel preview works.
Full import is not automated yet.

## Decision 10: Keep customer experience simple

Customer-facing pages should not expose admin complexity.

Customer should see:

* one recommendation
* one optional upgrade
* one checkout path
* simple success page
* simple customer dashboard
* simple order detail page
* simple support form if something goes wrong

Customer should not see:

* admin links
* provider IDs unless useful
* internal order controls
* confusing technical states

## Decision 11: Use Git before risky changes

Before major changes:

`git status`

If clean, continue.

After successful block:

Commit to main and push origin.

If something unexpected changes:

`git status`

If needed:

`git restore <file>`

## Decision 12: New chats need these docs

Future ChatGPT chats should first read:

* `docs/PROJECT_VISION.md`
* `docs/ARCHITECTURE.md`
* `docs/DECISIONS.md`

Then continue from the current project state.

The founder prefers:

* full file replacements
* clear terminal commands
* fewer explanations
* safe step-by-step progress
* no risky partial edits

## Decision 13: Support requests belong in the database

Customer support should not be handled only by email or hidden form submissions.

DALO stores support messages in the database through the `SupportRequest` model.

Reason:

* support can be linked to a customer
* support can be linked to an order
* admin can see the order number, ICCID and product context
* admin can track status
* support history can later be shown to the customer if needed

Current support statuses:

* open
* in_progress
* resolved

Current admin support pages:

* `/admin/support`
* `/admin/support/[id]`

## Decision 14: Homepage destination selection must not overwhelm customers

DALO should not show a huge confusing country list as the first interaction.

Current decision:

* no default country
* no automatic alphabetic first country like Aaland Islands
* popular destinations shown first
* search all destinations through the input
* destination search should be case-insensitive
* missing flags should fall back to `🌍`
* friendly UI labels may differ from database names

Example:

* Database country: `United States of America`
* Customer-facing label: `United States`

Reason:

DALO should feel like a smart travel assistant, not like a raw database dropdown.

## Decision 15: Destination cards are not the final destination UX

The homepage currently shows destination cards from available products.

Current behavior:

Clicking a destination card scrolls back to the quiz and selects that destination.

Issue:

This can feel confusing because it looks like the user is being sent back to the start.

Future solution:

Clicking a destination should open a modal or dedicated destination view.

That view should show around 3 available offers for the selected destination.

The user can then choose a plan directly or continue with the recommendation quiz.

Current status:

Keep current behavior for now.
Revisit after the product database, recommendation flow and mobile/PWA experience are stable.

## Decision 16: Start mobile with PWA, not native apps

DALO should not start with fully native iOS and Android apps.

Current decision:

Start with a mobile-friendly web app and PWA.

Recommended path:

Mobile-friendly web app → PWA → installable app-like experience → native iOS/Android later only if needed.

Reason:

* the Next.js app already exists
* customer login, dashboard, order detail and support already exist
* eSIM delivery mainly needs installation links, QR code, status and support
* native apps would add App Store and Play Store complexity too early
* PWA gives a faster path to an app-like experience

First mobile/PWA tasks:

* test customer pages on mobile
* improve mobile dashboard
* improve mobile order detail
* add PWA manifest
* add app icons
* support installable experience on iPhone and Android
