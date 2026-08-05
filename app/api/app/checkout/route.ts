import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomerFromRequest } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { allowCheckoutAttempt } from "@/lib/checkout-rate-limit";

const ORDER_NUMBER_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

type CheckoutBody = {
  productId?: unknown;
  customerEmail?: unknown;
  email?: unknown;
  platform?: unknown;
  source?: unknown;
  successUrl?: unknown;
  cancelUrl?: unknown;
};

function normalizeString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeEmail(value: unknown) {
  return normalizeString(value).toLowerCase();
}

function isValidEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeOptionalUrl(value: unknown) {
  const url = normalizeString(value);

  if (!url) return "";

  if (
    url.startsWith("http://localhost:") ||
    url.startsWith("https://localhost:") ||
    url.startsWith("http://127.0.0.1:") ||
    url.startsWith("https://127.0.0.1:") ||
    url.startsWith("dalo://")
  ) {
    return url;
  }

  return "";
}

function appendCheckoutParams(url: string, params: Record<string, string>) {
  const separator = url.includes("?") ? "&" : "?";
  const query = new URLSearchParams(params).toString();

  return `${url}${separator}${query}`;
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

function safeProduct(product: {
  id: string;
  country: string;
  region: string | null;
  name: string;
  data: string;
  validityDays: number;
  planType: string;
  usageFit: string;
  sellPrice: number;
  oldPrice: number | null;
  provider: string;
  image: string;
  description: string;
}) {
  return {
    id: product.id,
    country: product.country,
    region: product.region,
    name: product.name,
    data: product.data,
    validityDays: product.validityDays,
    planType: product.planType,
    usageFit: product.usageFit,
    sellPrice: product.sellPrice,
    oldPrice: product.oldPrice,
    provider: product.provider,
    image: product.image,
    description: product.description,
  };
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  let pendingOrderId: string | null = null;
  let createdStripeSessionId: string | null = null;

  try {
    const body = (await request.json().catch(() => ({}))) as CheckoutBody;

    const productId = normalizeString(body.productId);
    const platform = normalizeString(body.platform) || "unknown";
    const source = normalizeString(body.source) || "mobile_app";
    const requestedSuccessUrl = normalizeOptionalUrl(body.successUrl);
    const requestedCancelUrl = normalizeOptionalUrl(body.cancelUrl);

    const sessionCustomer = await getCurrentCustomerFromRequest(request);

    if (!sessionCustomer) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    const email = sessionCustomer.email;

    if (!productId) {
      return NextResponse.json(
        {
          error: "productId is required",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error: "customerEmail is required",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (!(await allowCheckoutAttempt(request, sessionCustomer.id))) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again shortly." },
        { status: 429, headers: corsHeaders }
      );
    }

    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === "sk_test_placeholder"
    ) {
      return NextResponse.json(
        {
          error: "Stripe is not configured",
        },
        {
          status: 503,
          headers: corsHeaders,
        }
      );
    }

    let product = await prisma.product.findFirst({
      where: {
        id: productId,
        active: true,
      },
    });

    const providerProductId =
      typeof body.providerProductId === "string"
        ? body.providerProductId.trim().slice(0, 160)
        : "";

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
      return NextResponse.json(
        {
          error: "Product not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    const customer = sessionCustomer;

    const totalDataGb = extractDataGb(product.data);
    const orderNumber = await createUniqueOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customer: email,
        customerId: customer.id,
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

    const successUrl = requestedSuccessUrl
      ? appendCheckoutParams(requestedSuccessUrl, {
          session_id: "{CHECKOUT_SESSION_ID}",
          source,
          platform,
        })
      : `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&source=${encodeURIComponent(
          source
        )}&platform=${encodeURIComponent(platform)}`;

    const cancelUrl = requestedCancelUrl
      ? appendCheckoutParams(requestedCancelUrl, {
          source,
          platform,
          canceled: "true",
        })
      : `${siteUrl}/checkout?productId=${product.id}&source=${encodeURIComponent(
          source
        )}&platform=${encodeURIComponent(platform)}`;

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: "Prepaid travel eSIM · Digital delivery",
            },
            unit_amount: Math.round(product.sellPrice * 100),
          },
        },
      ],
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber || "",
        productId: product.id,
        customerId: customer.id,
        customerEmail: email,
        source,
        platform,
        checkoutType: "app_checkout",
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    createdStripeSessionId = stripeSession.id;

    if (!stripeSession.url) {
      throw new Error("Stripe checkout URL was not created");
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.json(
      {
        success: true,
        checkoutUrl: stripeSession.url,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          payment: order.payment,
          fulfillment: order.fulfillment,
          esimStatus: order.esimStatus,
        },
        product: safeProduct(product),
        customer: {
          id: customer.id,
          email: customer.email,
        },
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("POST /api/app/checkout failed:", error);

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

    return NextResponse.json(
      {
        error: "Failed to create app checkout",
      },
      {
        status: 500,
      }
    );
  }
}
