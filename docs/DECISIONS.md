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
* structured product and order data

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
* managing provider product IDs
* previewing Excel rate sheets

## Decision 4: Use a shared AdminShell

Admin pages should use:

```txt
components/AdminShell.tsx
```

Reason:

* avoid repeated sidebar code
* easier navigation changes
* consistent desktop and mobile admin layout

## Decision 5: Use a shared recommendation engine

Recommendation logic lives in:

```txt
lib/recommendation.ts
```

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

## Decision 6: Checkout first, Stripe later

The checkout currently creates test orders in the local database.

Reason:

* safer than connecting Stripe too early
* allows testing the full customer-to-admin flow
* keeps the product moving without payment risk

Current flow:

```txt
Checkout
→ Create Pending Order
→ Success Page
→ Admin Orders
```

Stripe is prepared but not live.

## Decision 7: Orders track payment and delivery separately

Orders have two separate statuses:

```txt
Payment Status
eSIM Delivery
```

Reason:

A customer can pay successfully, but eSIM delivery can still fail.

Example:

```txt
Payment: Paid
eSIM Delivery: Failed
```

This means the money was received, but the provider API or delivery process failed.

## Decision 8: Admin order controls are reversible

Admin Orders includes manual controls:

```txt
Mark Paid
Reset Payment
Delivered
Failed
Reset Delivery
```

Reason:

During MVP testing, mistakes must be reversible.

Later, Stripe and provider API will automate these states, but manual controls are useful for testing and support.

## Decision 9: Excel import should be careful

DALO should not blindly import thousands of rate sheet rows.

Safer flow:

```txt
Upload Excel
→ Preview sheets
→ Choose sheet
→ Map columns
→ Preview products
→ Admin confirms import
```

Current state:

```txt
Excel preview works
Full import is not automated yet
```

## Decision 10: Keep customer experience simple

Customer-facing pages should not expose admin complexity.

Customer should see:

* one recommendation
* one optional upgrade
* one checkout path
* simple success page

Customer should not see:

* admin links
* provider IDs unless useful
* internal order controls
* confusing technical states

## Decision 11: Use Git before risky changes

Before major changes:

```bash
git status
```

If clean, continue.

After successful block:

```txt
Commit
Push
```

If something unexpected changes:

```bash
git status
```

If needed:

```bash
git restore <file>
```

## Decision 12: New chats need these docs

Future ChatGPT chats should first read:

```txt
docs/PROJECT_VISION.md
docs/ARCHITECTURE.md
docs/DECISIONS.md
```

Then continue from the current project state.

The founder prefers:

* full file replacements
* clear terminal commands
* fewer explanations
* safe step-by-step progress
* no risky partial edits
