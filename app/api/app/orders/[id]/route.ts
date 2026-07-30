import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

type ProductLike = {
  id: string;
  country: string;
  region: string | null;
  name: string;
  data: string;
  validityDays: number;
  planType: string;
  usageFit: string;
  provider: string;
  image: string;
  description: string;
};

function normalizeEmail(value: string | null) {
  return (value || "").trim().toLowerCase();
}

function safeProduct(product?: ProductLike | null) {
  if (!product) return null;

  return {
    id: product.id,
    country: product.country,
    region: product.region,
    name: product.name,
    data: product.data,
    validityDays: product.validityDays,
    planType: product.planType,
    usageFit: product.usageFit,
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

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const email = normalizeEmail(request.nextUrl.searchParams.get("email"));
    const { id } = await context.params;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        {
          error: "email is required",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        customer: email,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: order.productId,
      },
    });

    return NextResponse.json(
      {
        customer: {
          email,
        },
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          payment: order.payment,
          fulfillment: order.fulfillment,
          esimStatus: order.esimStatus,

          providerOrderId: order.providerOrderId,
          iccid: order.iccid,
          qrCodeUrl: order.qrCodeUrl,
          activationCode: order.activationCode,
          iosInstallUrl: order.iosInstallUrl,
          androidInstallUrl: order.androidInstallUrl,

          totalDataGb: order.totalDataGb,
          usedDataGb: order.usedDataGb,
          remainingDataGb: order.remainingDataGb,

          expiresAt: order.expiresAt,
          lastUsageSyncAt: order.lastUsageSyncAt,
          createdAt: order.createdAt,
          purchase: {
            amount: order.amount ?? product?.sellPrice ?? null,
            currency: order.currency || "USD",
            productName:
              order.productNameAtPurchase || product?.name || null,
            country: order.countryAtPurchase || product?.country || null,
            data: order.dataAtPurchase || product?.data || null,
            validityDays:
              order.validityDaysAtPurchase ??
              product?.validityDays ??
              null,
            provider:
              order.providerAtPurchase || product?.provider || null,
            providerProductId: order.providerProductIdAtPurchase,
            stripeSessionId: order.stripeSessionId,
            stripePaymentIntentId: order.stripePaymentIntentId,
            paidAt: order.paidAt,
          },

          product: safeProduct(product),
        },
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("GET /api/app/orders/[id] failed:", error);

    return NextResponse.json(
      {
        error: "Failed to load app order",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
