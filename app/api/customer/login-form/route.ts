import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import {
  createCustomerToken,
  CUSTOMER_SESSION_COOKIE,
} from "../../../../lib/customer-auth";
import { prisma } from "../../../../lib/db";

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value || "").trim().toLowerCase();
}

function safeDestination(value: FormDataEntryValue | null) {
  const destination = String(value || "/customer/dashboard");
  return destination.startsWith("/") && !destination.startsWith("//")
    ? destination
    : "/customer/dashboard";
}

function loginRedirect(
  request: NextRequest,
  destination: string,
  error = false,
) {
  if (!error) {
    return new URL(destination, request.url);
  }

  const loginUrl = new URL("/customer/login", request.url);
  loginUrl.searchParams.set("error", "1");
  loginUrl.searchParams.set("next", destination);
  return loginUrl;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");
  const destination = safeDestination(formData.get("next"));

  if (!email || !email.includes("@") || !password) {
    return NextResponse.redirect(
      loginRedirect(request, destination, true),
      303,
    );
  }

  const customer = await prisma.customer.findUnique({
    where: { email },
  });

  if (
    !customer ||
    !customer.active ||
    !customer.passwordHash ||
    !(await bcrypt.compare(password, customer.passwordHash))
  ) {
    return NextResponse.redirect(
      loginRedirect(request, destination, true),
      303,
    );
  }

  const token = createCustomerToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await prisma.customerSession.create({
    data: {
      customerId: customer.id,
      token,
      expiresAt,
    },
  });

  const response = NextResponse.redirect(
    loginRedirect(request, destination),
    303,
  );
  response.cookies.set("dalo_customer_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
