import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { stripe } from "../../../../lib/stripe";
import {
  CHECKOUT_LEGAL_VERSION,
  hasRequiredCheckoutConsent,
} from "../../../../lib/checkout-consent";

const ORDER_NUMBER_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function extractDataGb(dataText: string) {
  const text = dataText.trim().toLowerCase();

  if (text.includes("unlimited")) {
    return null;
  }

  const gbMatch = text.match(/(\d+(?:\.\d+)?)\s*gb/);
  if (gbMatch) {
    return Number(gbMatch[1]);
  }

  const mbMatch = text.match(/(\d+(?:\.\d+)?)\s*mb/);
  if (mbMatch) {
    return Number(mbMatch[1]) / 1000;
  }

  return null;
}

function createRandomOrderNumber() {
  let code = "";

  for (let i = 0; i < 6; i++) {
    const index = crypto.randomInt(0, ORDER_NUMBER_CHARS.length);
    code += ORDER_NUMBER_CHARS[index];
  }

  return `DALO-${code}`;
}

async function createUniqueOrderNumber() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const orderNumber = createRandomOrderNumber();

    const existingOrder = await prisma.order.findUnique({
      where: {
        orderNumber,
      },
    });

    if (!existingOrder) {
      return orderNumber;
    }
  }

  throw new Error("Could not create unique DALO order number.");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const productId = String(formData.get("productId") || "");
    const email = normalizeEmail(String(formData.get("email") || ""));
    const customerName = String(formData.get("name") || "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 120);
    const sessionId = String(formData.get("sessionId") || "");
    const marketingCampaign = String(formData.get("marketingCampaign") || "");
    const marketingSourceEventId = String(
      formData.get("marketingSourceEventId") || ""
    );

    if (!productId || !email || !email.includes("@")) {
      return NextResponse.redirect(
        new URL(`/checkout?productId=${productId}&error=1`, request.url)
      );
    }

    if (!hasRequiredCheckoutConsent(formData)) {
      return NextResponse.redirect(
        new URL(
          `/checkout?productId=${productId}&consent=required`,
          request.url
        )
      );
    }

    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === "sk_test_placeholder"
    ) {
      return NextResponse.redirect(
        new URL(`/checkout?productId=${productId}&stripe=missing`, request.url)
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return NextResponse.redirect(new URL("/checkout?error=1", request.url));
    }

    const customer = await prisma.customer.upsert({
      where: {
        email,
      },
      update: {
        active: true,
        ...(customerName ? { name: customerName } : {}),
      },
      create: {
        email,
        name: customerName || null,
        active: true,
      },
    });

    const totalDataGb = extractDataGb(product.data);
    const orderNumber = await createUniqueOrderNumber();
    const consentAcceptedAt = new Date();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customer: email,
        customerAccount: {
          connect: {
            id: customer.id,
          },
        },
        productId: product.id,
        amount: product.sellPrice,
        currency: "USD",
        buyPriceAtPurchase: product.buyPrice,
        productNameAtPurchase: product.name,
        countryAtPurchase: product.country,
        dataAtPurchase: product.data,
        validityDaysAtPurchase: product.validityDays,
        providerAtPurchase: product.provider,
        providerProductIdAtPurchase: product.providerProductId,
        legalAcceptedAt: consentAcceptedAt,
        legalVersion: CHECKOUT_LEGAL_VERSION,
        immediateDeliveryAcceptedAt: consentAcceptedAt,
        immediateDeliveryVersion: CHECKOUT_LEGAL_VERSION,
        payment: "Pending",
        fulfillment: "pending_manual",

        esimStatus: "pending",
        providerOrderId: null,
        iccid: null,
        qrCodeUrl: null,
        activationCode: null,
        iosInstallUrl: null,
        androidInstallUrl: null,

        totalDataGb,
        usedDataGb: null,
        remainingDataGb: null,

        expiresAt: null,
        lastUsageSyncAt: null,
      },
    });

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const stripeMetadata = {
      orderId: order.id,
      orderNumber: order.orderNumber || "",
      productId: product.id,
      customerId: customer.id,
      customerEmail: email,
      customerName,
      daloSessionId: sessionId,
      marketingCampaign,
      marketingSourceEventId,
      legalVersion: CHECKOUT_LEGAL_VERSION,
      legalAcceptedAt: consentAcceptedAt.toISOString(),
      immediateDeliveryAcceptedAt: consentAcceptedAt.toISOString(),
    };

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      customer_creation: "always",
      billing_address_collection: "required",
      tax_id_collection: {
        enabled: true,
      },
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `${product.name} digital travel eSIM`,
          metadata: stripeMetadata,
        },
      },
      payment_intent_data: {
        metadata: stripeMetadata,
      },
      branding_settings: {
        display_name: "DALO",
        background_color: "#F4F7FC",
        button_color: "#173FC9",
        border_style: "rounded",
        font_family: "open_sans",
      },
      custom_text: {
        submit: {
          message:
            "Secure payment by Stripe. Your eSIM is delivered digitally after payment.",
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: `${product.data} / ${product.validityDays} Days`,
            },
            unit_amount: Math.round(product.sellPrice * 100),
          },
        },
      ],
      metadata: stripeMetadata,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?productId=${product.id}`,
    });

    if (!stripeSession.url) {
      return NextResponse.redirect(
        new URL(`/checkout?productId=${product.id}&error=1`, request.url)
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.redirect(stripeSession.url, 303);
  } catch (error) {
    console.error("Stripe checkout failed:", error);

    return NextResponse.redirect(new URL("/checkout?error=1", request.url));
  }
}
