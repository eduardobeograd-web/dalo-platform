"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function adminLogin(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (email !== "admin@dalo.com" || password !== "dalo123") {
    redirect("/admin/login?error=1");
  }

  const cookieStore = await cookies();

  cookieStore.set("dalo_admin", "true", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  redirect("/admin");
}