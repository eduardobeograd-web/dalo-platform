import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import {
  CUSTOMER_SESSION_COOKIE,
  createCustomerToken,
  hashCustomerToken,
} from "../../../lib/customer-auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/customer/login", request.url));
  }

  const session = await prisma.customerSession.findUnique({
    where: {
      token: hashCustomerToken(token),
    },
    include: {
      customer: true,
    },
  });

  if (!session || session.usedAt || session.expiresAt <= new Date() || !session.customer.active) {
    return NextResponse.redirect(new URL("/customer/login", request.url));
  }

  const sessionToken = createCustomerToken();
  const claimed = await prisma.$transaction(async (tx) => {
    const now = new Date();
    const result = await tx.customerSession.updateMany({
      where: {
        id: session.id,
        usedAt: null,
        expiresAt: { gt: now },
        customer: { active: true },
      },
      data: { usedAt: now },
    });
    if (result.count !== 1) return false;
    await tx.customerSession.delete({ where: { id: session.id } });
    await tx.customerSession.create({
      data: {
        customerId: session.customerId,
        token: hashCustomerToken(sessionToken),
        usedAt: now,
        expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30),
      },
    });
    return true;
  });
  if (!claimed) return NextResponse.redirect(new URL("/customer/login", request.url));

  const response = NextResponse.redirect(
    new URL("/customer/dashboard", request.url)
  );

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.cookies.set(CUSTOMER_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
