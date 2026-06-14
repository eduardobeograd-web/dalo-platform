import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";

const CUSTOMER_SESSION_COOKIE = "dalo_customer_session";

export function createCustomerToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function setCustomerSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCustomerSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
}

export async function getCurrentCustomer() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = await prisma.customerSession.findUnique({
    where: {
      token,
    },
    include: {
      customer: true,
    },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    return null;
  }

  if (!session.customer.active) {
    return null;
  }

  return session.customer;
}