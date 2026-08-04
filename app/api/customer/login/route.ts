import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import {
  createCustomerToken,
  hashCustomerToken,
  setCustomerSessionCookie,
} from "@/lib/customer-auth";
import { prisma } from "@/lib/db";
import { allowSecurityAttempt } from "@/lib/security-rate-limit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

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
          headers: corsHeaders,
        }
      );
    }

    if (
      !(await allowSecurityAttempt({
        scope: "customer-api-login",
        headers: request.headers,
        identity: email,
        ipLimit: 20,
        identityLimit: 8,
        windowMinutes: 15,
      }))
    ) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: corsHeaders },
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
          headers: corsHeaders,
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
          headers: corsHeaders,
        }
      );
    }

    const token = createCustomerToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        token: hashCustomerToken(token),
        expiresAt,
      },
    });

    await setCustomerSessionCookie(token);

    return NextResponse.json(
      {
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
      },
      {
        headers: corsHeaders,
      }
    );
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
