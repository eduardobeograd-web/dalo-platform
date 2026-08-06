import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createTestAccessToken, safeTokenEqual } from "./lib/test-access";
import { getTeamAccessEnabled } from "./lib/site-configuration";

const ACCESS_COOKIE = "dalo_test_access";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const testPassword = process.env.DALO_TEST_PASSWORD;
  const isAccessRoute =
    pathname === "/test-access" || pathname === "/api/test-access";
  const isExternalServiceRoute = pathname === "/api/stripe/webhook";
  const isPublicPwaAsset =
    pathname === "/manifest.webmanifest" || pathname === "/sw.js";
  let teamAccessEnabled = Boolean(testPassword);

  if (testPassword) {
    try {
      teamAccessEnabled = await getTeamAccessEnabled();
    } catch (error) {
      console.error("Could not read team access setting:", error);
    }
  }

  if (
    testPassword &&
    teamAccessEnabled &&
    !isAccessRoute &&
    !isExternalServiceRoute &&
    !isPublicPwaAsset
  ) {
    const expectedToken = await createTestAccessToken(testPassword);
    const suppliedToken = request.cookies.get(ACCESS_COOKIE)?.value;

    if (!suppliedToken || !safeTokenEqual(suppliedToken, expectedToken)) {
      const accessUrl = new URL("/test-access", request.url);
      accessUrl.searchParams.set(
        "next",
        `${pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(accessUrl);
    }
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";
  const isPasswordRoute =
    pathname === "/admin/change-password";

  if (!isAdminRoute || isLoginRoute) {
    return NextResponse.next();
  }

  const isLoggedIn = Boolean(
    request.cookies.get("dalo_admin_session")?.value,
  );

  if (!isLoggedIn) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isPasswordRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|dalo-logo.webp|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
