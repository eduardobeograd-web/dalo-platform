import { allowSecurityAttempt } from "@/lib/security-rate-limit";

export async function allowCheckoutAttempt(
  request: Request,
  identity?: string | null
) {
  return allowSecurityAttempt({
    scope: "checkout",
    headers: request.headers,
    identity,
    ipLimit: 20,
    identityLimit: 8,
    windowMinutes: 10,
  });
}
