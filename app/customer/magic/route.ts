import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { CUSTOMER_SESSION_COOKIE } from "../../../lib/customer-auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/customer/login", request.url));
  }

  const session = await prisma.customerSession.findUnique({
    where: {
      token,
    },
    include: {
      customer: true,
    },
  });

  if (!session || session.expiresAt < new Date() || !session.customer.active) {
    return NextResponse.redirect(new URL("/customer/login", request.url));
  }

  await prisma.customerSession.update({
    where: {
      token,
    },
    data: {
      usedAt: new Date(),
    },
  });

  const response = NextResponse.redirect(
    new URL("/customer/dashboard", request.url)
  );

  response.cookies.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
