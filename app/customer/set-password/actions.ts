"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "../../../lib/db";
import {
  createCustomerToken,
  hashCustomerToken,
} from "../../../lib/customer-auth";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

type PasswordResetTokenRow = {
  id: string;
  customerId: string;
  expiresAt: Date | string;
  usedAt: Date | string | null;
};

export async function setCustomerPassword(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const resetUrl = `/customer/set-password?token=${encodeURIComponent(token)}`;

  if (!token) {
    redirect("/customer/set-password?error=invalid");
  }

  if (password.length < 8) {
    redirect(`${resetUrl}&error=short`);
  }

  if (password !== confirmPassword) {
    redirect(`${resetUrl}&error=match`);
  }

  const resetTokens = await prisma.$queryRaw<PasswordResetTokenRow[]>`
    SELECT "id", "customerId", "expiresAt", "usedAt"
    FROM "PasswordResetToken"
    WHERE "tokenHash" = ${hashToken(token)}
    LIMIT 1
  `;
  const resetToken = resetTokens[0];

  if (
    !resetToken ||
    resetToken.usedAt ||
    new Date(resetToken.expiresAt) <= new Date()
  ) {
    redirect("/customer/set-password?error=invalid");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const sessionToken = createCustomerToken();
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const claimedTokenCount = await tx.$executeRaw`
      UPDATE "PasswordResetToken"
      SET "usedAt" = ${now}
      WHERE "id" = ${resetToken.id}
        AND "usedAt" IS NULL
        AND "expiresAt" > ${now}
    `;

    if (claimedTokenCount !== 1) {
      throw new Error("Password reset token is no longer valid.");
    }

    await tx.customer.update({
      where: {
        id: resetToken.customerId,
      },
      data: {
        passwordHash,
        active: true,
      },
    });

    await tx.customerSession.deleteMany({
      where: {
        customerId: resetToken.customerId,
      },
    });

    await tx.customerSession.create({
      data: {
        customerId: resetToken.customerId,
        token: hashCustomerToken(sessionToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });
  });

  revalidatePath("/customer/set-password");
  redirect(`/customer/magic?token=${sessionToken}`);
}
