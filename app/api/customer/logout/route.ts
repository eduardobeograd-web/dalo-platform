import { NextRequest, NextResponse } from "next/server";
import {
  clearCustomerSessionCookie,
  getBearerTokenFromRequest,
} from "@/lib/customer-auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const bearerToken = getBearerTokenFromRequest(request);

    if (bearerToken) {
      await prisma.customerSession.deleteMany({
        where: {
          token: bearerToken,
        },
      });
    }

    await clearCustomerSessionCookie();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("POST /api/customer/logout failed:", error);

    return NextResponse.json(
      {
        error: "Failed to log out",
      },
      {
        status: 500,
      }
    );
  }
}
