import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import {
  createCustomerToken,
  setCustomerSessionCookie,
} from "@/lib/customer-auth";
import { prisma } from "@/lib/db";

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function normalizePassword(value: unknown) {
  if (typeof value !== "string") return "";
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const email = normalizeEmail(body.email);
    const password = normalizePassword(body.password);

    if (!email || !email.includes("@") || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: {
        email,
      },
    });

    if (!customer || !customer.active || !customer.passwordHash) {
      return NextResponse.json(
        {
          error: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    const passwordOk = await bcrypt.compare(password, customer.passwordHash);

    if (!passwordOk) {
      return NextResponse.json(
        {
          error: "Invalid email or password",
        },
        {
          status: 401,
        }
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

    await setCustomerSessionCookie(token);

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        active: customer.active,
      },
      session: {
        token,
        expiresAt,
      },
    });
  } catch (error) {
    console.error("POST /api/customer/login failed:", error);

    return NextResponse.json(
      {
        error: "Failed to log in",
      },
      {
        status: 500,
      }
    );
  }
}
