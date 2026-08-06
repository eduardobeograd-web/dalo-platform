# DALO Platform

DALO is a travel eSIM recommendation, checkout and customer-service platform.
It asks travelers about their destination, trip length and data needs, then
recommends a suitable plan instead of exposing the full provider catalogue.

## Current platform

- Next.js 16.3 with React 19 and TypeScript
- PostgreSQL through Prisma 7; production is designed for Neon
- Stripe Checkout and verified Stripe webhooks
- Resend transactional email delivery
- Customer accounts, orders, invoices, eSIM details, settings and support
- Role-based admin, database-backed sessions and audit logging
- Product, margin, recommendation, order, provider, support and SEO tools
- Country landing pages with controlled publication and indexability
- Installable PWA with manifest, icons and service worker
- Fail-closed eSIM Go integration prepared for staged activation

## Local development

1. Copy `.env.example` to `.env.local` and provide development credentials.
2. Install dependencies with `npm install`.
3. Generate Prisma Client with `npx prisma generate` when the schema changes.
4. Start the site with `npm run dev`.
5. Open `http://localhost:3000`.

Never commit `.env.local`, API keys, database credentials or generated test
data.

## Verification

- `npx tsc --noEmit` — TypeScript check
- `npm run lint` — lint check
- `npm run build` — production build
- `npm run production:check` — production environment safety check
- `npm run prices:check-margins` — product margin audit
- `npm run recommendations:audit` — recommendation audit

## Operational documentation

- `PROJECT_TODO.md` — canonical current task list
- `docs/PROJECT_VISION.md` — product direction and current phase
- `docs/ARCHITECTURE.md` — current technical architecture
- `docs/DECISIONS.md` — decisions that should guide future changes
- `docs/ESIM_GO_ROLLOUT.md` — mandatory staged provider activation runbook

## Deployment safety

The presence of an eSIM Go API key does not enable provider calls or purchases.
Provider access, validation, callbacks, live fulfillment and top-ups use
separate flags. Follow `docs/ESIM_GO_ROLLOUT.md` in order.
