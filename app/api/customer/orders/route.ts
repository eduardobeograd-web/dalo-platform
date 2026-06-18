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

type OrderLike = {
  id: string;
  orderNumber: string | null;
  payment: string;
  fulfillment: string;
  esimStatus: string | null;
  totalDataGb: number | null;
  usedDataGb: number | null;
  remainingDataGb: number | null;
  expiresAt: Date | null;
  lastUsageSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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

    expiresAt: order.expiresAt,
    lastUsageSyncAt: order.lastUsageSyncAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,

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

export async function GET(request: NextRequest) {
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

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          {
            customerId: customer.id,
          },
          {
            customer: customer.email,
          },
        ],
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

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
      },
      orders: orders.map((order) => safeOrder(order, productById.get(order.productId))),
    });
  } catch (error) {
    console.error("GET /api/customer/orders failed:", error);

    return NextResponse.json(
      {
        error: "Failed to load customer orders",
      },
      {
        status: 500,
      }
    );
  }
}
