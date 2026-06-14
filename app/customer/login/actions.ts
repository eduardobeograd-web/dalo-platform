"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../lib/db";
import { createCustomerToken } from "../../../lib/customer-auth";

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value || "").trim().toLowerCase();
}

export async function requestCustomerLogin(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));

  if (!email || !email.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }

  const customer = await prisma.customer.upsert({
    where: {
      email,
    },
    update: {
      active: true,
    },
    create: {
      email,
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const loginUrl = `${baseUrl}/customer/magic?token=${token}`;

  console.log("");
  console.log("==========================================");
  console.log("DALO CUSTOMER MAGIC LOGIN LINK");
  console.log(loginUrl);
  console.log("==========================================");
  console.log("");

  redirect("/customer/login/sent");
}