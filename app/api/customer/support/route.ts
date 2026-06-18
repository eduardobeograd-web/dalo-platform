import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";

const allowedReasons = new Set([
  "installing",
  "qr",
  "data",
  "topup",
  "wrong-country",
  "other",
]);

function normalizeString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function POST(request: NextRequest) {
  try {
    const customer = await getCurrentCustomer();

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

    const body = await request.json().catch(() => ({}));

    const orderId = normalizeString(body.orderId);
    const reason = normalizeString(body.reason);
    const message = normalizeString(body.message);

    if (!orderId || !reason || !message) {
      return NextResponse.json(
        {
          error: "orderId, reason and message are required",
        },
        {
          status: 400,
        }
      );
    }

    if (!allowedReasons.has(reason)) {
      return NextResponse.json(
        {
          error: "Invalid support reason",
        },
        {
          status: 400,
        }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
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

    const supportRequest = await prisma.supportRequest.create({
      data: {
        customerId: customer.id,
        orderId: order.id,
        customerEmail: customer.email,
        reason,
        message,
        status: "open",
        orderNumber: order.orderNumber,
        iccid: order.iccid,
        productName: product?.name || null,
      },
    });

    return NextResponse.json({
      success: true,
      supportRequest: {
        id: supportRequest.id,
        status: supportRequest.status,
        reason: supportRequest.reason,
        orderId: supportRequest.orderId,
        orderNumber: supportRequest.orderNumber,
        createdAt: supportRequest.createdAt,
      },
    });
  } catch (error) {
    console.error("POST /api/customer/support failed:", error);

    return NextResponse.json(
      {
        error: "Failed to create support request",
      },
      {
        status: 500,
      }
    );
  }
}
