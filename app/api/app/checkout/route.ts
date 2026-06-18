import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomerFromRequest } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const ORDER_NUMBER_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

type CheckoutBody = {
  productId?: unknown;
  customerEmail?: unknown;
  email?: unknown;
  platform?: unknown;
  source?: unknown;
};

function normalizeString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeEmail(value: unknown) {
  return normalizeString(value).toLowerCase();
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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as CheckoutBody;

    const productId = normalizeString(body.productId);
    const platform = normalizeString(body.platform) || "unknown";
    const source = normalizeString(body.source) || "mobile_app";

    const sessionCustomer = await getCurrentCustomerFromRequest(request);

    const email =
      sessionCustomer?.email ||
      normalizeEmail(body.customerEmail) ||
      normalizeEmail(body.email);

    if (!productId) {
      return NextResponse.json(
        {
          error: "productId is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        {
          error: "customerEmail is required",
        },
        {
          status: 400,
        }
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
        }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        active: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    const customer = await prisma.customer.upsert({
      where: {
        email,
      },
      update: {
        active: true,
      },
      create: {
        email,
        active: true,
      },
    });

    const totalDataGb = extractDataGb(product.data);
    const orderNumber = await createUniqueOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customer: email,
        customerId: customer.id,
        productId: product.id,
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
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            product_data: {
              name: product.name,
              description: `${product.data} / ${product.validityDays} Days`,
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
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&source=${encodeURIComponent(
        source
      )}&platform=${encodeURIComponent(platform)}`,
      cancel_url: `${siteUrl}/checkout?productId=${product.id}&source=${encodeURIComponent(
        source
      )}&platform=${encodeURIComponent(platform)}`,
    });

    if (!stripeSession.url) {
      return NextResponse.json(
        {
          error: "Stripe checkout URL was not created",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("POST /api/app/checkout failed:", error);

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
