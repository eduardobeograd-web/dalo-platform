"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function adminLogout() {
  const cookieStore = await cookies();

  cookieStore.set("dalo_admin", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  redirect("/admin/login");
}