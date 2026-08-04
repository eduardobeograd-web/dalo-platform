"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import {
  clearCustomerSessionCookie,
  createCustomerToken,
  getCurrentCustomer,
  hashCustomerToken,
  setCustomerSessionCookie,
} from "../../../lib/customer-auth";
import { prisma } from "../../../lib/db";

function clean(value: FormDataEntryValue | null, maxLength = 120) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeEmail(value: FormDataEntryValue | null) {
  return clean(value, 254).toLowerCase();
}

function settingsRedirect(status: string) {
  redirect(`/customer/settings?status=${encodeURIComponent(status)}`);
}

export async function updateCustomerProfile(formData: FormData) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/customer/login");
  }

  const name = clean(formData.get("name"), 100);

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      name: name || null,
    },
  });

  settingsRedirect("profile-saved");
}

export async function updateCustomerEmail() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/customer/login");
  }

  settingsRedirect("email-change-unavailable");
}

export async function updateBillingAddress(formData: FormData) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/customer/login");
  }

  const billingAddressLine1 = clean(formData.get("billingAddressLine1"));
  const billingCity = clean(formData.get("billingCity"));
  const billingPostalCode = clean(formData.get("billingPostalCode"), 32);
  const billingCountry = clean(formData.get("billingCountry"), 80);
  const hasPartialAddress =
    billingAddressLine1 ||
    billingCity ||
    billingPostalCode ||
    billingCountry;

  if (
    hasPartialAddress &&
    (!billingAddressLine1 ||
      !billingCity ||
      !billingPostalCode ||
      !billingCountry)
  ) {
    settingsRedirect("billing-incomplete");
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      billingCompany: clean(formData.get("billingCompany")) || null,
      billingAddressLine1: billingAddressLine1 || null,
      billingAddressLine2:
        clean(formData.get("billingAddressLine2")) || null,
      billingCity: billingCity || null,
      billingState: clean(formData.get("billingState"), 80) || null,
      billingPostalCode: billingPostalCode || null,
      billingCountry: billingCountry || null,
    },
  });

  settingsRedirect("billing-saved");
}

export async function changeCustomerPassword(formData: FormData) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/customer/login");
  }

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (
    !customer.passwordHash ||
    !(await bcrypt.compare(currentPassword, customer.passwordHash))
  ) {
    settingsRedirect("password-current");
  }

  if (newPassword.length < 10) {
    settingsRedirect("password-short");
  }

  if (newPassword !== confirmPassword) {
    settingsRedirect("password-match");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const sessionToken = createCustomerToken();

  await prisma.$transaction(async (tx) => {
    await tx.customer.update({
      where: { id: customer.id },
      data: { passwordHash },
    });
    await tx.customerSession.deleteMany({
      where: { customerId: customer.id },
    });
    await tx.customerSession.create({
      data: {
        customerId: customer.id,
        token: hashCustomerToken(sessionToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });
  });

  await setCustomerSessionCookie(sessionToken);
  settingsRedirect("password-saved");
}

export async function logoutCustomerEverywhere() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/customer/login");
  }

  await prisma.customerSession.deleteMany({
    where: { customerId: customer.id },
  });
  await clearCustomerSessionCookie();
  redirect("/customer/login");
}
