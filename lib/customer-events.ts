import { prisma } from "@/lib/db";

type TrackCustomerEventInput = {
  customerId?: string | null;
  orderId?: string | null;
  productId?: string | null;
  sessionId?: string | null;
  eventType: string;
  metadata?: Record<string, unknown> | null;
};

export async function trackCustomerEvent(input: TrackCustomerEventInput) {
  try {
    return await prisma.customerEvent.create({
      data: {
        customerId: input.customerId ?? null,
        orderId: input.orderId ?? null,
        productId: input.productId ?? null,
        sessionId: input.sessionId ?? null,
        eventType: input.eventType,
        metadata: input.metadata ?? undefined,
      },
    });
  } catch (error) {
    console.error("Customer event tracking failed:", error);
    return null;
  }
}
