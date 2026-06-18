import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomerFromRequest } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";

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

type OrderDetailLike = {
  id: string;
  orderNumber: string | null;
  payment: string;
  fulfillment: string;
  esimStatus: string | null;

  providerOrderId: string | null;
  iccid: string | null;
  qrCodeUrl: string | null;
  activationCode: string | null;
  iosInstallUrl: string | null;
  androidInstallUrl: string | null;

  totalDataGb: number | null;
  usedDataGb: number | null;
  remainingDataGb: number | null;

  expiresAt: Date | null;
  lastUsageSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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

function safeOrderDetail(order: OrderDetailLike, product?: ProductLike | null) {
  return {
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
    updatedAt: order.updatedAt,

    product: safeProduct(product),
  };
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
    const customer = await getCurrentCustomerFromRequest(request);

    if (!customer) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: [
          {
            customerId: customer.id,
          },
          {
            customer: customer.email,
          },
        ],
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: order.productId,
      },
    });

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
      },
      order: safeOrderDetail(order, product),
    });
  } catch (error) {
    console.error("GET /api/customer/orders/[id] failed:", error);

    return NextResponse.json(
      {
        error: "Failed to load customer order",
      },
      {
        status: 500,
      }
    );
  }
}
