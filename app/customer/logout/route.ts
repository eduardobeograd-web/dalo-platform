import { NextResponse } from "next/server";
import { clearCustomerSessionCookie } from "../../../lib/customer-auth";

export async function POST(request: Request) {
  await clearCustomerSessionCookie();

  return NextResponse.redirect(new URL("/", request.url), 303);
}
