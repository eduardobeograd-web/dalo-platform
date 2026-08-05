import webpush from "web-push";
import { ADMIN_PERMISSIONS } from "./admin-permissions";
import { adminHasPermission } from "./admin-auth";
import { prisma } from "./db";

type SupportPushInput = {
  id: string;
  reason: string;
  orderNumber: string | null;
};

function humanizeReason(reason: string) {
  return reason
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function notifySupportTeam(request: SupportPushInput) {
  const publicKey = process.env.NEXT_PUBLIC_SUPPORT_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.SUPPORT_VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.SUPPORT_VAPID_SUBJECT?.trim() || "mailto:support@daloesim.com";

  if (!publicKey || !privateKey) return;

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const subscriptions = await prisma.supportPushSubscription.findMany({
    include: {
      adminUser: {
        select: {
          id: true,
          active: true,
          role: true,
          permissions: true,
        },
      },
    },
  });
  const permitted = subscriptions.filter(
    (subscription) =>
      subscription.adminUser.active &&
      adminHasPermission(subscription.adminUser, ADMIN_PERMISSIONS.SUPPORT_READ),
  );
  const payload = JSON.stringify({
    title: "New DALO support request",
    body: [humanizeReason(request.reason), request.orderNumber].filter(Boolean).join(" · "),
    url: `/support-console/${request.id}`,
    tag: `dalo-support-${request.id}`,
  });

  await Promise.allSettled(
    permitted.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          payload,
          { TTL: 600, urgency: "high" },
        );
        await prisma.supportPushSubscription.update({
          where: { id: subscription.id },
          data: { failureCount: 0, lastSuccessAt: new Date() },
        });
      } catch (error) {
        const statusCode =
          typeof error === "object" && error && "statusCode" in error
            ? Number(error.statusCode)
            : 0;

        if (statusCode === 404 || statusCode === 410) {
          await prisma.supportPushSubscription.delete({ where: { id: subscription.id } });
          return;
        }

        await prisma.supportPushSubscription.update({
          where: { id: subscription.id },
          data: { failureCount: { increment: 1 } },
        });
        console.error("Support push delivery failed", error);
      }
    }),
  );
}
