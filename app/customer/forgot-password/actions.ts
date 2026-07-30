"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/db";
import { sendEmail } from "../../../lib/email";
import { siteUrl } from "../../../lib/site-url";

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value || "").trim().toLowerCase();
}

export async function requestPasswordReset(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));

  if (email && email.includes("@")) {
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (customer?.active) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      const resetTokenId = `reset_${crypto.randomUUID()}`;
      const invalidatedAt = new Date();

      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
          UPDATE "PasswordResetToken"
          SET "usedAt" = ${invalidatedAt}
          WHERE "customerId" = ${customer.id} AND "usedAt" IS NULL
        `;

        await tx.$executeRaw`
          INSERT INTO "PasswordResetToken"
            ("id", "customerId", "tokenHash", "expiresAt", "createdAt")
          VALUES
            (${resetTokenId}, ${customer.id}, ${tokenHash}, ${expiresAt}, ${new Date()})
        `;
      });

      const resetUrl = `${siteUrl}/customer/set-password?token=${token}`;
      const result = await sendEmail({
        to: customer.email,
        subject: "Reset your DALO password",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#10233a">
            <p style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#2148c0">DALO account security</p>
            <h1 style="font-size:30px;line-height:1.15;margin:12px 0">Choose a new password</h1>
            <p style="font-size:16px;line-height:1.6;color:#526174">Use the secure button below to create a new DALO password. This link expires in 30 minutes and can be used only once.</p>
            <p style="margin:28px 0">
              <a href="${resetUrl}" style="display:inline-block;border-radius:12px;background:#2148c0;padding:14px 22px;color:#fff;text-decoration:none;font-weight:700">Reset password</a>
            </p>
            <p style="font-size:13px;line-height:1.6;color:#718096">If you did not request this change, you can ignore this email. Your current password remains unchanged.</p>
          </div>
        `,
      });

      if (!result.success && process.env.NODE_ENV !== "production") {
        console.info(`DALO password reset link for ${email}: ${resetUrl}`);
      }
    }
  }

  redirect("/customer/forgot-password?sent=1");
}
