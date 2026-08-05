"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const CookieConsent = dynamic(() => import("./CookieConsent"), {
  ssr: false,
});

export default function DeferredCookieConsent() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname.startsWith("/support-console")) {
    return null;
  }

  return <CookieConsent />;
}
