# DALO Project Vision

## What DALO is

DALO is a travel eSIM recommendation platform.

The goal is not to show customers a confusing list of hundreds of eSIM plans.
The goal is to ask a few simple questions and recommend the best matching eSIM plan for their trip.

The customer journey should feel simple:

1. Choose destination
2. Choose trip length
3. Choose usage type
4. DALO calculates the best eSIM
5. Customer buys the recommended plan
6. eSIM is delivered digitally

## Core idea

DALO should become a smart comparison and recommendation layer between travelers and eSIM providers.

Instead of being only one eSIM reseller, DALO should later connect multiple eSIM providers and compare their products internally.

The customer does not need to know all provider complexity.
DALO handles the logic and shows one clear recommendation.

## Customer promise

DALO helps travelers find the right eSIM faster.

The customer should understand immediately:

* which eSIM fits their trip
* how much data they get
* how long it is valid
* what it costs
* how they receive it
* why this plan was recommended

## Business model

DALO can make money through:

* margin between wholesale buy price and customer sell price
* upsells to larger or better plans
* later partner integrations
* later white-label or reseller models
* later multiple provider comparison

## Product principle

DALO should not overwhelm the customer.

The frontend should show:

* one main recommendation
* one optional upgrade
* one clear checkout path

Admin can manage complexity in the backend.

## Current MVP status

The current local MVP includes:

* Landing page
* Improved homepage destination quiz
* Quiz flow
* Searching transition page
* Result page
* Checkout preview
* Pending order creation
* Customer login/dashboard/order detail
* Customer support page
* Support request database storage
* Admin login/logout
* Product database
* Add/edit/deactivate products
* Admin dashboard
* Admin orders
* Manual order status controls
* Admin support request list
* Admin support request detail page
* Admin support status controls
* Excel rate sheet preview
* Stripe route prepared but not live

## Future direction

The next major goals are:

1. Prepare DALO as a mobile-friendly PWA before considering native iOS/Android apps
2. Improve product recommendation logic
3. Add real Stripe checkout
4. Connect provider API fulfillment
5. Build safer Excel import mapping
6. Deploy with a real online database
7. Add SEO landing pages for countries and travel use cases

## Important note for future chats

This project is being built by a non-technical founder step by step.

When helping with the project:

* give full file replacements when possible
* avoid small risky code edits
* explain only what is necessary
* always protect the working state with Git
* use `git status` before risky changes
* commit after every working block