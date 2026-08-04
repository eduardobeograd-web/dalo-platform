"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/db";
import {
  createCustomerToken,
  hashCustomerToken,
  setCustomerSessionCookie,
} from "../../../lib/customer-auth";
import { allowSecurityAttempt } from "../../../lib/security-rate-limit";

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value || "").trim().toLowerCase();
}

export async function loginCustomer(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");

  if (!email || !email.includes("@") || !password) {
    redirect("/customer/login?error=1");
  }

  if (
    !(await allowSecurityAttempt({
      scope: "customer-login",
      headers: await headers(),
      identity: email,
      ipLimit: 20,
      identityLimit: 8,
      windowMinutes: 15,
    }))
  ) {
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
      token: hashCustomerToken(token),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  await setCustomerSessionCookie(token);

  redirect("/customer/dashboard");
}
