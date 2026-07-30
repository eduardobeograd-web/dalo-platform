import { NextRequest, NextResponse } from "next/server";
import { createTestAccessToken, safeTokenEqual } from "../../../lib/test-access";

const ACCESS_COOKIE = "dalo_test_access";

function safeDestination(value: FormDataEntryValue | null) {
  const destination = String(value || "/");
  return destination.startsWith("/") && !destination.startsWith("//")
    ? destination
    : "/";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "");
  const destination = safeDestination(formData.get("next"));
  const testPassword = process.env.DALO_TEST_PASSWORD;

  if (!testPassword) {
    return NextResponse.redirect(new URL(destination, request.url), 303);
  }

  const [suppliedToken, expectedToken] = await Promise.all([
    createTestAccessToken(password),
    createTestAccessToken(testPassword),
  ]);

  if (!safeTokenEqual(suppliedToken, expectedToken)) {
    const errorUrl = new URL("/test-access", request.url);
    errorUrl.searchParams.set("error", "1");
    errorUrl.searchParams.set("next", destination);
    return NextResponse.redirect(errorUrl, 303);
  }

  const response = NextResponse.redirect(
    new URL(destination, request.url),
    303,
  );
  response.cookies.set(ACCESS_COOKIE, expectedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
