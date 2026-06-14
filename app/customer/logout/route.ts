import { redirect } from "next/navigation";
import { clearCustomerSessionCookie } from "../../../lib/customer-auth";

export async function GET() {
  await clearCustomerSessionCookie();

  redirect("/");
}