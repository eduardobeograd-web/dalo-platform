"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "../../../lib/db";
import { CUSTOMER_SESSION_COOKIE } from "../../../lib/customer-auth";

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value || "").trim().toLowerCase();
}

function createCustomerToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function loginCustomer(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");

  if (!email || !email.includes("@") || !password) {
    redirect("/customer/login?error=1");
  }

  const customer = await prisma.customer.findUnique({
    where: {
      email,
    },
  });

  if (!customer || !customer.active || !customer.passwordHash) {
    redirect("/customer/login?error=1");
  }

  const passwordOk = await bcrypt.compare(password, customer.passwordHash);

  if (!passwordOk) {
    redirect("/customer/login?error=1");
  }

  const token = createCustomerToken();

  await prisma.customerSession.create({
    data: {
      customerId: customer.id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/customer/dashboard");
}
