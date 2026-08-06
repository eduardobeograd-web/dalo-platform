import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { stripe } from "../../../../lib/stripe";
import { allowCheckoutAttempt } from "@/lib/checkout-rate-limit";
import {
  CHECKOUT_LEGAL_VERSION,
  hasRequiredCheckoutConsent,
} from "../../../../lib/checkout-consent";
import { getCurrentCustomerFromRequest } from "../../../../lib/customer-auth";
import { getProviderConfigBySlug } from "../../../../lib/providers/provider-configs";
import { getEsimGoReadiness } from "../../../../lib/providers/esim-go/config";
import { checkEsimGoCompatibility } from "../../../../lib/providers/esim-go/client";

const ORDER_NUMBER_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  let pendingOrderId: string | null = null;
  let createdStripeSessionId: string | null = null;
  let submittedProductId = "";
  let submittedProviderProductId = "";
  let submittedTopUpProfileId = "";
  let submittedSourceOrderId = "";

  try {
    const formData = await request.formData();

    const productId = String(formData.get("productId") || "");
    const providerProductId = String(
      formData.get("providerProductId") || ""
    ).slice(0, 160);
    submittedProductId = productId;
    submittedProviderProductId = providerProductId;
    const topUpProfileId = String(formData.get("topUpProfileId") || "").slice(0, 128);
    const sourceOrderId = String(formData.get("sourceOrderId") || "").slice(0, 128);
    submittedTopUpProfileId = topUpProfileId;
    submittedSourceOrderId = sourceOrderId;
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
    const recommendedProductId = String(
      formData.get("recommendedProductId") || ""
    ).slice(0, 128);
    const recommendationTripLength = String(
      formData.get("recommendationTripLength") || ""
    ).slice(0, 32);
    const recommendationUsageType = String(
      formData.get("recommendationUsageType") || ""
    ).slice(0, 32);
    const requestedChoice = String(formData.get("recommendationChoice") || "");
    const recommendationChoice = ["best_match", "upgrade", "regional"].includes(requestedChoice)
      ? requestedChoice
      : null;
    const retryPath = (state: "error" | "consent" | "stripe") => {
      const retryParams = new URLSearchParams({
        productId,
        [state]:
          state === "consent"
            ? "required"
            : state === "stripe"
              ? "missing"
              : "1",
      });
      if (providerProductId) retryParams.set("providerProductId", providerProductId);
      if (topUpProfileId) retryParams.set("topUpProfileId", topUpProfileId);
      if (sourceOrderId) retryParams.set("sourceOrderId", sourceOrderId);
      return `/checkout?${retryParams.toString()}`;
    };

    if (!productId || productId.length > 128 || !isValidEmail(email)) {
      return NextResponse.redirect(
        new URL(retryPath("error"), request.url)
      );
    }

    if (!hasRequiredCheckoutConsent(formData)) {
      return NextResponse.redirect(
        new URL(
          retryPath("consent"),
          request.url
        )
      );
    }

    if (!(await allowCheckoutAttempt(request, email))) {
      return NextResponse.redirect(
        new URL(retryPath("error"), request.url)
      );
    }

    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === "sk_test_placeholder"
    ) {
      return NextResponse.redirect(
        new URL(retryPath("stripe"), request.url)
      );
    }

    let product = await prisma.product.findFirst({
      where: {
        id: productId,
        active: true,
      },
    });

    if (!product && providerProductId) {
      product = await prisma.product.findFirst({
        where: {
          providerProductId,
          active: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }

    if (!product) {
      return NextResponse.redirect(new URL(retryPath("error"), request.url));
    }

    const isTopUp = Boolean(topUpProfileId || sourceOrderId);
    if (isTopUp) {
      const readiness = getEsimGoReadiness();
      const [authenticatedCustomer, providerConfig] = await Promise.all([
        getCurrentCustomerFromRequest(request),
        getProviderConfigBySlug("esim-go"),
      ]);

      if (
        !topUpProfileId ||
        !sourceOrderId ||
        !readiness.topUpsEnabled ||
        !providerConfig?.active ||
        !providerConfig.fulfillmentEnabled ||
        !authenticatedCustomer ||
        authenticatedCustomer.email.toLowerCase() !== email
      ) {
        return NextResponse.redirect(new URL(retryPath("error"), request.url));
      }

      const [profile, sourceOrder] = await Promise.all([
        prisma.esimProfile.findFirst({
          where: {
            id: topUpProfileId,
            customerId: authenticatedCustomer.id,
            status: { notIn: ["deactivated", "deleted"] },
          },
        }),
        prisma.order.findFirst({
          where: {
            id: sourceOrderId,
            customerId: authenticatedCustomer.id,
            esimProfileId: topUpProfileId,
            payment: "Paid",
          },
        }),
      ]);

      if (!profile || !sourceOrder) {
        return NextResponse.redirect(new URL(retryPath("error"), request.url));
      }

      const compatibility = await checkEsimGoCompatibility(
        profile.iccid,
        product.providerProductId,
      );
      if (!compatibility.compatible) {
        return NextResponse.redirect(new URL(retryPath("error"), request.url));
      }
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer && !existingCustomer.active) {
      return NextResponse.redirect(
        new URL(retryPath("error"), request.url)
      );
    }

    const customer = await prisma.customer.upsert({
      where: {
        email,
      },
      update: {
        ...(customerName ? { name: customerName } : {}),
      },
      create: {
        email,
        name: customerName || null,
        active: true,
      },
    });

    const totalDataGb = extractDataGb(product.data);
    const recommendedProduct = recommendedProductId
      ? await prisma.product.findUnique({ where: { id: recommendedProductId } })
      : null;
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
        recommendationProductId: recommendedProduct?.id || null,
        recommendationDataGb: recommendedProduct ? extractDataGb(recommendedProduct.data) : null,
        recommendationTripLength: recommendationTripLength || null,
        recommendationUsageType: recommendationUsageType || null,
        recommendationChoice,
        orderKind: isTopUp ? "top_up" : "new_esim",
        sourceOrderId: isTopUp ? sourceOrderId : null,
        ...(isTopUp
          ? {
              esimProfile: {
                connect: { id: topUpProfileId },
              },
            }
          : {}),
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
    pendingOrderId = order.id;

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

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
      recommendedProductId: recommendedProduct?.id || "",
      recommendationTripLength,
      recommendationUsageType,
      recommendationChoice: recommendationChoice || "",
      orderKind: isTopUp ? "top_up" : "new_esim",
      sourceOrderId: isTopUp ? sourceOrderId : "",
      esimProfileId: isTopUp ? topUpProfileId : "",
      legalVersion: CHECKOUT_LEGAL_VERSION,
      legalAcceptedAt: consentAcceptedAt.toISOString(),
      immediateDeliveryAcceptedAt: consentAcceptedAt.toISOString(),
    };

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      customer_creation: "always",
      billing_address_collection: "auto",
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
      cancel_url: `${siteUrl}${retryPath("error").replace("&error=1", "")}`,
    });
    createdStripeSessionId = stripeSession.id;

    if (!stripeSession.url) {
      throw new Error("Stripe checkout URL was not created");
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.redirect(stripeSession.url, 303);
  } catch (error) {
    console.error("Stripe checkout failed:", error);

    if (createdStripeSessionId) {
      await stripe.checkout.sessions.expire(createdStripeSessionId).catch(() => null);
    }

    if (pendingOrderId) {
      await prisma.order.updateMany({
        where: { id: pendingOrderId, payment: "Pending" },
        data: {
          payment: "Failed",
          fulfillment: "Cancelled",
          esimStatus: "failed",
        },
      }).catch(() => null);
    }

    const retryParams = new URLSearchParams({ error: "1" });

    if (submittedProductId) {
      retryParams.set("productId", submittedProductId);
    }

    if (submittedProviderProductId) {
      retryParams.set("providerProductId", submittedProviderProductId);
    }
    if (submittedTopUpProfileId) {
      retryParams.set("topUpProfileId", submittedTopUpProfileId);
    }
    if (submittedSourceOrderId) {
      retryParams.set("sourceOrderId", submittedSourceOrderId);
    }

    return NextResponse.redirect(
      new URL(`/checkout?${retryParams.toString()}`, request.url)
    );
  }
}
