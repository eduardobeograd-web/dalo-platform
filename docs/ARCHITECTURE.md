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

After checkout, the success page should guide the customer to create a password or log in to manage their eSIM.

## Customer portal

Customer portal pages:

```txt
app/customer/login/page.tsx
app/customer/set-password/page.tsx
app/customer/dashboard/page.tsx
app/customer/orders/[id]/page.tsx
app/customer/logout/route.ts
```

Customer login is password-based:

```txt
Email + password
```

Password hashes are stored on the `Customer` model:

```txt
passwordHash
```

Passwords must never be stored as plain text.

Customer orders are connected by:

```txt
Order.customerId
Order.customer
```

The customer dashboard should show all orders connected to the logged-in customer.

The customer order detail page should show only useful customer-facing information.

Customer should clearly see:

```txt
eSIM status
Install on iPhone
Install on Android
QR code fallback
ICCID
Data usage
Top-up button
Short DALO order number
```

Customer should not prominently see:

```txt
Provider Order ID
Internal database ID
Raw provider/debug data
Too many technical status fields
```

Admin should still see all technical fields.

## eSIM installation details

Orders can store installation details for customer delivery:

```txt
Order.iccid
Order.qrCodeUrl
Order.activationCode
Order.iosInstallUrl
Order.androidInstallUrl
```

The admin can manually add these details on the admin order detail page.

Later, these fields should be filled automatically by the eSIM Go API.

Customer-facing installation UX:

```txt
Install on iPhone
Install on Android
QR code fallback
ICCID
Manual activation code only when needed
```

The quick installation links are important because eSIM Go can provide separate installation links for iOS and Android.

## Customer-facing DALO order numbers

Customers should not see internal database IDs like:

```txt
cmqdqjxjk0001vfo313r1s15h
```

Later we should add a customer-facing order number field to the `Order` model:

```prisma
orderNumber String? @unique
```

Recommended format:

```txt
DALO-XXXXXX
```

Examples:

```txt
DALO-7KQ4PN
DALO-M9TR6X
DALO-3FZ8LA
```

Rules:

```txt
Use random uppercase letters and numbers.
Do not use sequential numbers.
Avoid confusing characters like O, 0, I and 1.
Show orderNumber to customers.
Show both orderNumber and internal ID to admins.
```

Reason:

```txt
Sequential numbers reveal approximate order volume.
Internal database IDs look too technical.
Support needs a short, readable customer reference.
```

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
app/admin/orders/[id]/page.tsx
```

Admin order detail page. Used to view and manually fulfill orders.

Manual fulfillment currently supports:

```txt
Payment status
Fulfillment status
eSIM status
Provider Order ID
ICCID
QR Code URL
Activation Code
iOS Install URL
Android Install URL
Usage data placeholders
```

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
lib/customer-auth.ts
```

Customer session helper for customer login/dashboard access.

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
Customer
CustomerSession
Order
ApiProvider
```

Product stores:

* country
* isoCode
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

Customer stores:

* email
* name
* passwordHash
* active
* createdAt
* updatedAt

CustomerSession stores:

* customerId
* token
* expiresAt
* usedAt
* createdAt

Order stores:

* customer
* customerId
* productId
* payment
* fulfillment
* esimStatus
* providerOrderId
* iccid
* qrCodeUrl
* activationCode
* iosInstallUrl
* androidInstallUrl
* totalDataGb
* usedDataGb
* remainingDataGb
* expiresAt
* lastUsageSyncAt
* createdAt

Future Order field:

```txt
orderNumber
```

This should be a random customer-facing DALO number, not sequential.

Current payment states:

```txt
Pending
Paid
Failed
Refunded
```

Current fulfillment states:

```txt
Waiting
Provisioning
Delivered
Failed
```

Current eSIM status examples:

```txt
pending
ready
active
expired
failed
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
→ Customer creates password or logs in
→ Customer Dashboard
→ Customer Order Detail
→ Admin Orders
```

Current checkout does not charge real payment yet.

Stripe route is prepared:

```txt
app/api/stripe/checkout/route.ts
```

But real Stripe test keys are not connected yet.

## Provider fulfillment

Current state:

```txt
Manual fulfillment in admin
```

The admin can paste test or provider data into the order detail page.

Later state:

```txt
eSIM Go API fulfillment
```

Later eSIM Go should automatically create the eSIM and return:

```txt
Provider Order ID
ICCID
QR Code URL
Activation Code
iOS Install URL
Android Install URL
Usage information if available
```

The customer portal should show this data in a simple customer-friendly way.

## Recommendation logic

The recommendation engine should avoid recommending plans that are too small.

Important rule:

```txt
Cheapest does not always mean best recommendation.
```

Example:

```txt
1GB for 30 days should not be recommended as a main option.
```

`Too Low` and `emergency-only` products should not become main recommendations.

Regional products should not appear as normal country results.

Regional products should later be shown as upsells.

Example:

```txt
Customer searches Germany
→ show Germany products first
→ offer Europe bundle as an extra upsell
```

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
.next
node_modules
```

The local database changes whenever products or orders are tested.
