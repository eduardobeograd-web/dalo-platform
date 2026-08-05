import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentCustomerFromRequest } from "@/lib/customer-auth";

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
  sellPrice: number;
  image: string;
  description: string;
};

type OrderLike = {
  id: string;
  orderNumber: string | null;
  payment: string;
  fulfillment: string;
  esimStatus: string | null;
  productId: string;
  totalDataGb: number | null;
  usedDataGb: number | null;
  remainingDataGb: number | null;
  activationDeadlineAt: Date | null;
  activatedAt: Date | null;
  expiresAt: Date | null;
  lastUsageSyncAt: Date | null;
  amount: number | null;
  currency: string | null;
  productNameAtPurchase: string | null;
  countryAtPurchase: string | null;
  dataAtPurchase: string | null;
  validityDaysAtPurchase: number | null;
  providerAtPurchase: string | null;
  providerProductIdAtPurchase: string | null;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  paidAt: Date | null;
  createdAt: Date;
  iosInstallUrl: string | null;
  androidInstallUrl: string | null;
  qrCodeUrl: string | null;
  activationCode: string | null;
  iccid: string | null;
};

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

function safeOrder(order: OrderLike, product?: ProductLike | null) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    payment: order.payment,
    fulfillment: order.fulfillment,
    esimStatus: order.esimStatus,
    totalDataGb: order.totalDataGb,
    usedDataGb: order.usedDataGb,
    remainingDataGb: order.remainingDataGb,
    activationDeadlineAt: order.activationDeadlineAt,
    activatedAt: order.activatedAt,
    expiresAt: order.expiresAt,
    lastUsageSyncAt: order.lastUsageSyncAt,
    createdAt: order.createdAt,
    purchase: {
      amount: order.amount ?? product?.sellPrice ?? null,
      currency: order.currency || "USD",
      productName: order.productNameAtPurchase || product?.name || null,
      country: order.countryAtPurchase || product?.country || null,
      data: order.dataAtPurchase || product?.data || null,
      validityDays:
        order.validityDaysAtPurchase ?? product?.validityDays ?? null,
      provider: order.providerAtPurchase || product?.provider || null,
      providerProductId: order.providerProductIdAtPurchase,
      stripeSessionId: order.stripeSessionId,
      stripePaymentIntentId: order.stripePaymentIntentId,
      paidAt: order.paidAt,
    },
    hasInstallDetails: Boolean(
      order.iosInstallUrl ||
        order.androidInstallUrl ||
        order.qrCodeUrl ||
        order.activationCode ||
        order.iccid
    ),
    product: safeProduct(product),
  };
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  try {
    const customer = await getCurrentCustomerFromRequest(request);

    if (!customer) {
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

    const orders = await prisma.order.findMany({
      where: {
        customerId: customer.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const productIds = [...new Set(orders.map((order) => order.productId))];

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    const productById = new Map(products.map((product) => [product.id, product]));

    return NextResponse.json(
      {
        customer: {
          email: customer.email,
        },
        orders: orders.map((order) => safeOrder(order, productById.get(order.productId))),
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("GET /api/app/orders failed:", error);

    return NextResponse.json(
      {
        error: "Failed to load app orders",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
