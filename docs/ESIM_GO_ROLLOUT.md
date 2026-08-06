# eSIM Go staged rollout

Last reviewed: 7 August 2026

Current repository status: the guarded integration, lifecycle data model and
migration are implemented. This document describes operational activation; it
does not claim that the migration, API key or flags are active in any specific
Vercel or Neon environment.

This integration is fail-closed. Adding an API key does not enable provider
reads, validation, callbacks, top-ups or paid transactions.

## Before adding the key

- Use the new DALO-only eSIM Go organisation/key. Do not reuse a key that is
  connected to another storefront.
- Keep all `ESIM_GO_*_ENABLED` variables set to `false`.
- Keep the eSIM Go `Fulfillment enabled` switch off in DALO Admin.
- Apply the lifecycle migration before deploying code that uses the new
  profile, bundle, provider-operation and callback tables.
- Run the production environment check and confirm the intended Neon database
  before changing any capability flag.

## Rollout order

1. Add `ESIM_GO_API_KEY` to the intended Vercel environments. Never expose it
   as a `NEXT_PUBLIC_*` variable.
2. Enable `ESIM_GO_READ_ENABLED` only. Verify catalogue/network reads,
   compatibility, install details and usage reads.
3. Enable `ESIM_GO_VALIDATE_ENABLED`. Run validation requests only; these use
   the provider's `type: validate` order mode and must not create a purchase.
4. Register the callback URL
   `{NEXT_PUBLIC_SITE_URL}/api/esim-go/webhook`, then enable
   `ESIM_GO_WEBHOOK_ENABLED`. Verify signature rejection and a signed test
   callback.
5. Test a paid Stripe order while the DALO Admin provider fulfillment switch
   remains off. It must stay in manual fulfillment.
6. Turn on the DALO Admin provider fulfillment switch, then set
   `ESIM_GO_LIVE_FULFILLMENT_ENABLED=true` for one controlled transaction.
7. Verify the provider reference, ICCID, install data, customer email, bundle
   assignment and usage sync before wider use.
8. Keep `ESIM_GO_TOP_UPS_ENABLED=false` until new-eSIM fulfillment is proven.
   Enable it separately, test an existing ICCID, and confirm compatibility and
   no second eSIM installation.

## Emergency stop

Set `ESIM_GO_LIVE_FULFILLMENT_ENABLED=false` and
`ESIM_GO_TOP_UPS_ENABLED=false`, and turn off `Fulfillment enabled` in DALO
Admin. This leaves paid orders available for manual handling and keeps stored
provider operations for reconciliation.

Never automatically retry a transaction whose outcome is unknown or marked
`provider_committed` / `needs_reconciliation`. Confirm it in the provider
portal first.
