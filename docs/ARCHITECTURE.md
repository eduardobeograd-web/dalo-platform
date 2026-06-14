# DALO Architecture

## Local project

Project path on Mac:

`~/DALO/dalo-platform`

Framework:

* Next.js App Router
* Tailwind CSS
* Prisma 7
* SQLite local database

Local dev server:

`npm run dev`

Local app URL:

`http://localhost:3000`

## Important local setup notes

VS Code should be opened with:

`open -a "Visual Studio Code" <file>`

Do not use:

`code`

because it is not installed on this Mac.

Prisma Client is generated to:

`app/generated/prisma`

After Prisma schema changes, run:

`npx prisma db push`

`npx prisma generate`

`pkill -f "next"`

`rm -rf .next`

`npm run dev`

For Prisma 7, `prisma/schema.prisma` datasource should not contain `url = env("DATABASE_URL")`.

Datasource should be:

`datasource db { provider = "sqlite" }`

The database URL comes from:

* `prisma.config.ts`
* `.env`

Current local database file is:

`dev.db`

not:

`prisma/dev.db`

## Main user pages

`app/page.tsx`

Landing page with quiz.

Current homepage destination UX:

* no default destination
* no automatic first alphabetic country
* popular destinations are shown first
* destination search is case-insensitive
* missing flags fall back to `🌍`
* customer-facing labels can differ from DB country names

Example:

* DB: `United States of America`
* UI: `United States`

`app/searching/page.tsx`

Transition page after quiz. Shows a short search/calculation experience and redirects to result.

`app/result/page.tsx`

Customer result page. Uses the shared recommendation engine.

`app/checkout/page.tsx`

Checkout preview. Creates local test orders.

`app/checkout/success/page.tsx`

Customer success page after test order creation. No admin links should be visible to customers.

After checkout, the success page should guide the customer to create a password or log in to manage their eSIM.

## Customer portal

Customer portal pages:

* `app/customer/login/page.tsx`
* `app/customer/set-password/page.tsx`
* `app/customer/dashboard/page.tsx`
* `app/customer/orders/[id]/page.tsx`
* `app/customer/support/page.tsx`
* `app/customer/support/actions.ts`
* `app/customer/logout/route.ts`

Customer login is password-based:

`Email + password`

Password hashes are stored on the `Customer` model:

`passwordHash`

Passwords must never be stored as plain text.

Customer orders are connected by:

* `Order.customerId`
* `Order.customer`

The customer dashboard should show all orders connected to the logged-in customer.

The customer order detail page should show only useful customer-facing information.

Customer should clearly see:

* eSIM status
* Install on iPhone
* Install on Android
* QR code fallback
* ICCID
* Data usage
* Top-up button
* Short DALO order number

Customer should not prominently see:

* Provider Order ID
* Internal database ID
* Raw provider/debug data
* Too many technical status fields

Admin should still see all technical fields.

## Customer support

Customer support currently exists.

Customer side:

* `app/customer/support/page.tsx`
* `app/customer/support/actions.ts`

Current behavior:

* customer must be logged in
* page shows only the customer's own orders
* customer selects an order
* customer chooses a support reason
* customer writes a message
* form creates a `SupportRequest` in the database

Support requests store:

* `customerId`
* `orderId`
* `customerEmail`
* `reason`
* `message`
* `status`
* `orderNumber`
* `iccid`
* `productName`
* `createdAt`
* `updatedAt`

Current support statuses:

* `open`
* `in_progress`
* `resolved`

## eSIM installation details

Orders can store installation details for customer delivery:

* `Order.iccid`
* `Order.qrCodeUrl`
* `Order.activationCode`
* `Order.iosInstallUrl`
* `Order.androidInstallUrl`

The admin can manually add these details on the admin order detail page.

Later, these fields should be filled automatically by the eSIM Go API.

Customer-facing installation UX:

* Install on iPhone
* Install on Android
* QR code fallback
* ICCID
* Manual activation code only when needed

The quick installation links are important because eSIM Go can provide separate installation links for iOS and Android.

## Customer-facing DALO order numbers

Customers should not see internal database IDs like:

`cmqdqjxjk0001vfo313r1s15h`

The `Order` model has a customer-facing order number field:

`orderNumber String? @unique`

Recommended format:

`DALO-XXXXXX`

Examples:

* `DALO-7KQ4PN`
* `DALO-M9TR6X`
* `DALO-3FZ8LA`

Rules:

* Use random uppercase letters and numbers.
* Do not use sequential numbers.
* Avoid confusing characters like O, 0, I and 1.
* Show orderNumber to customers.
* Show both orderNumber and internal ID to admins.

Reason:

* Sequential numbers reveal approximate order volume.
* Internal database IDs look too technical.
* Support needs a short, readable customer reference.

## Admin pages

`app/admin/login/page.tsx`

Admin login page.

`app/admin/page.tsx`

Admin dashboard.

Current dashboard includes support counters and a link to support requests.

`app/admin/products/page.tsx`

Product catalog from database.

`app/admin/products/new/page.tsx`

Add product page.

`app/admin/products/[id]/edit/page.tsx`

Edit product page.

`app/admin/products/import/page.tsx`

Excel rate sheet upload page.

`app/admin/products/import/preview/page.tsx`

Excel preview page.

`app/admin/orders/page.tsx`

Admin orders page.

`app/admin/orders/[id]/page.tsx`

Admin order detail page. Used to view and manually fulfill orders.

Manual fulfillment currently supports:

* Payment status
* Fulfillment status
* eSIM status
* Provider Order ID
* ICCID
* QR Code URL
* Activation Code
* iOS Install URL
* Android Install URL
* Usage data placeholders

`app/admin/support/page.tsx`

Admin support request list.

`app/admin/support/[id]/page.tsx`

Admin support request detail page.

Admin can see:

* Customer email
* Reason
* Message
* Status
* DALO order number
* ICCID
* Product name
* Customer ID
* Order ID

`app/admin/support/[id]/actions.ts`

Server action for updating support status.

Supported status changes:

* `open`
* `in_progress`
* `resolved`

`app/admin/recommendations/page.tsx`

Recommendation preview page.

`app/admin/upsells/page.tsx`

Upsell logic page.

`app/admin/providers/page.tsx`

Provider mapping page.

## Shared components

`components/AdminShell.tsx`

Shared admin layout with sidebar and mobile navigation.

All admin pages should use this component instead of repeating sidebar code.

Current navigation includes:

* Dashboard
* Products
* Recommendations
* Upsells
* Orders
* Support
* API Providers

## Core libraries

`lib/db.ts`

Prisma database connection.

Important: `lib/db.ts` should import Prisma Client from the generated local client path, not from `@prisma/client`.

Expected client source:

`app/generated/prisma`

`lib/recommendation.ts`

Shared recommendation engine used by both:

* customer result page
* admin recommendations page

`lib/customer-auth.ts`

Customer session helper for customer login/dashboard/support access.

`lib/stripe.ts`

Stripe helper. Prepared but not live.

`lib/products.ts`

Original seed/demo product data. Still used for seeding.

## Database

Prisma schema path:

`prisma/schema.prisma`

Main models:

* Product
* Customer
* CustomerSession
* Order
* SupportRequest
* ApiProvider

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

Customer relations:

* sessions
* orders
* supportRequests

CustomerSession stores:

* customerId
* token
* expiresAt
* usedAt
* createdAt

Order stores:

* orderNumber
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

Order relations:

* customerAccount
* supportRequests

SupportRequest stores:

* id
* customerId
* orderId
* customerEmail
* reason
* message
* status
* orderNumber
* iccid
* productName
* createdAt
* updatedAt

SupportRequest relations:

* customer
* order

Current payment states:

* Pending
* Paid
* Failed
* Refunded

Current fulfillment states:

* Waiting
* Provisioning
* Delivered
* Failed

Current eSIM status examples:

* pending
* ready
* active
* expired
* failed

## Current checkout flow

Current MVP flow:

Quiz → Recommendation Engine → Result Page → Buy Now → Checkout → Create Test Order → Success Page → Customer creates password or logs in → Customer Dashboard → Customer Order Detail → Customer Support if needed → Admin Orders → Admin Support if needed

Current checkout does not charge real payment yet.

Stripe route is prepared:

`app/api/stripe/checkout/route.ts`

But real Stripe checkout is not live yet.

## Provider fulfillment

Current state:

Manual fulfillment in admin.

The admin can paste test or provider data into the order detail page.

Later state:

eSIM Go API fulfillment.

Later eSIM Go should automatically create the eSIM and return:

* Provider Order ID
* ICCID
* QR Code URL
* Activation Code
* iOS Install URL
* Android Install URL
* Usage information if available

The customer portal should show this data in a simple customer-friendly way.

## Recommendation logic

The recommendation engine should avoid recommending plans that are too small.

Important rule:

Cheapest does not always mean best recommendation.

Example:

1GB for 30 days should not be recommended as a main option.

`Too Low` and `emergency-only` products should not become main recommendations.

Regional products should not appear as normal country results.

Regional products should later be shown as upsells.

Example:

Customer searches Germany → show Germany products first → offer Europe bundle as an extra upsell.

## Product database

The local product database is already heavily filled with active country products.

Many countries have multiple plan sizes, for example:

* 1GB / 7 days
* 2GB / 15 days
* 3GB / 30 days
* 5GB / 30 days
* 10GB / 30 days
* 20GB / 30 days
* 50GB / 30 days
* 100GB / 30 days

Important country naming examples:

* United States of America
* Korea-Republic of
* VietNam
* Czech Republic

The frontend may show friendlier labels, but the recommendation search must use the database country name.

## Mobile/PWA direction

DALO should not start with fully native iOS and Android apps.

Recommended path:

Mobile-friendly web app → PWA → installable app-like experience → native iOS/Android apps later only if needed.

Reason:

* the Next.js app already exists
* customer login, dashboard, order detail and support already exist
* eSIM delivery mainly needs installation links, QR code, status and support
* native apps would add complexity too early

First mobile/PWA tasks:

* test customer pages on mobile
* improve mobile dashboard
* improve mobile order detail
* add PWA manifest
* add app icons
* support installable experience on iPhone and Android

## Admin protection

Admin is protected through middleware/proxy logic.

Current MVP login uses cookie:

`dalo_admin=true`

Current demo credentials:

* `admin@dalo.com`
* `dalo123`

This is only for local MVP. Before launch, authentication must be replaced with a stronger solution.

Note: Current Next.js warns that the `middleware` file convention is deprecated and recommends using `proxy`.

## Git workflow

Before changes:

`git status`

After a working block:

Commit to main and push origin.

Do not run:

`npm audit fix --force`

unless explicitly planned.

## Files that should not be casually committed

Local database and local environment files should be treated carefully:

* `.env`
* `dev.db`
* `data/rate-sheet-preview.json`
* `.next`
* `node_modules`

The local database changes whenever products, orders or support requests are tested.
