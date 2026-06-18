import { NextResponse } from "next/server";
import { clearCustomerSessionCookie } from "@/lib/customer-auth";

export async function POST() {
  try {
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
