# DALO Architecture

## Local project

Project path on Mac:

```txt
~/DALO/dalo-platform
```

Framework:

```txt
Next.js App Router
Tailwind CSS
Prisma
SQLite local database
```

Local dev server:

```bash
npm run dev
```

Local app URL:

```txt
http://localhost:3000
```

## Main user pages

```txt
app/page.tsx
```

Landing page with quiz.

```txt
app/searching/page.tsx
```

Transition page after quiz. Shows a short search/calculation experience and redirects to result.

```txt
app/result/page.tsx
```

Customer result page. Uses the shared recommendation engine.

```txt
app/checkout/page.tsx
```

Checkout preview. Creates local test orders.

```txt
app/checkout/success/page.tsx
```

Customer success page after test order creation. No admin links should be visible to customers.

## Admin pages

```txt
app/admin/login/page.tsx
```

Admin login page.

```txt
app/admin/page.tsx
```

Admin dashboard.

```txt
app/admin/products/page.tsx
```

Product catalog from database.

```txt
app/admin/products/new/page.tsx
```

Add product page.

```txt
app/admin/products/[id]/edit/page.tsx
```

Edit product page.

```txt
app/admin/products/import/page.tsx
```

Excel rate sheet upload page.

```txt
app/admin/products/import/preview/page.tsx
```

Excel preview page.

```txt
app/admin/orders/page.tsx
```

Admin orders page.

```txt
app/admin/recommendations/page.tsx
```

Recommendation preview page.

```txt
app/admin/upsells/page.tsx
```

Upsell logic page.

```txt
app/admin/providers/page.tsx
```

Provider mapping page.

## Shared components

```txt
components/AdminShell.tsx
```

Shared admin layout with sidebar and mobile navigation.

All admin pages should use this component instead of repeating sidebar code.

## Core libraries

```txt
lib/db.ts
```

Prisma database connection.

```txt
lib/recommendation.ts
```

Shared recommendation engine used by both:

* customer result page
* admin recommendations page

```txt
lib/stripe.ts
```

Stripe helper. Prepared but not live.

```txt
lib/products.ts
```

Original seed/demo product data. Still used for seeding.

## Database

Prisma schema path:

```txt
prisma/schema.prisma
```

Main models:

```txt
Product
Order
ApiProvider
```

Product stores:

* country
* region
* name
* data
* validityDays
* planType
* usageFit
* role
* buyPrice
* sellPrice
* oldPrice
* provider
* providerProductId
* image
* description
* active

Order stores:

* customer
* productId
* payment
* fulfillment
* createdAt

Current payment states:

```txt
Pending
Paid
```

Current fulfillment states:

```txt
Waiting
Delivered
Failed
Provisioning
```

## Current checkout flow

Current MVP flow:

```txt
Quiz
→ Recommendation Engine
→ Result Page
→ Buy Now
→ Checkout
→ Create Test Order
→ Success Page
→ Admin Orders
```

Current checkout does not charge real payment yet.

Stripe route is prepared:

```txt
app/api/stripe/checkout/route.ts
```

But real Stripe test keys are not connected yet.

## Admin protection

Admin is protected through middleware:

```txt
middleware.ts
```

Current MVP login uses cookie:

```txt
dalo_admin=true
```

Current demo credentials:

```txt
admin@dalo.com
dalo123
```

This is only for local MVP. Before launch, authentication must be replaced with a stronger solution.

## Git workflow

Before changes:

```bash
git status
```

After a working block:

```txt
Commit to main
Push origin
```

Do not run:

```bash
npm audit fix --force
```

unless explicitly planned.

## Files that should not be casually committed

Local database and local environment files should be treated carefully:

```txt
.env
dev.db
data/rate-sheet-preview.json
```

The local database changes whenever products or orders are tested.
