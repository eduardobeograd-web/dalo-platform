"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/db";
import { createCustomerToken } from "../../../lib/customer-auth";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function setCustomerPassword(formData: FormData) {
  const email = normalizeEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!email || !email.includes("@")) {
    redirect("/customer/set-password?error=email");
  }

  if (password.length < 8) {
    redirect(`/customer/set-password?email=${encodeURIComponent(email)}&error=short`);
  }

  if (password !== confirmPassword) {
    redirect(`/customer/set-password?email=${encodeURIComponent(email)}&error=match`);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const customer = await prisma.customer.upsert({
    where: {
      email,
    },
    update: {
      passwordHash,
      active: true,
    },
    create: {
      email,
      passwordHash,
      active: true,
    },
  });

  const token = createCustomerToken();

  await prisma.customerSession.create({
    data: {
      customerId: customer.id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  redirect(`/customer/magic?token=${token}`);
}