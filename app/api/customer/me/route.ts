import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomerFromRequest } from "@/lib/customer-auth";

export async function GET(request: NextRequest) {
  try {
    const customer = await getCurrentCustomerFromRequest(request);

    if (!customer) {
      return NextResponse.json(
        {
          authenticated: false,
          customer: null,
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      authenticated: true,
      customer: {
        id: customer.id,
        email: customer.email,
        active: customer.active,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    console.error("GET /api/customer/me failed:", error);

    return NextResponse.json(
      {
        error: "Failed to load customer",
      },
      {
        status: 500,
      }
    );
  }
}
