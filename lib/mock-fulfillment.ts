import { prisma } from "@/lib/db";

export async function fulfillOrderMockById(orderId: string) {
  if (process.env.NODE_ENV === "production") {
    return {
      fulfilled: false as const,
      reason: "mock_fulfillment_disabled_in_production",
    };
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    return {
      fulfilled: false as const,
      reason: "order_not_found",
    };
  }

  if (
    order.fulfillment === "Delivered" &&
    order.esimStatus === "ready" &&
    order.providerOrderId &&
    order.iccid
  ) {
    return {
      fulfilled: false as const,
      reason: "already_fulfilled",
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  }

  const claim = await prisma.order.updateMany({
    where: {
      id: order.id,
      fulfillment: { not: "processing_mock" },
      esimStatus: { not: "ready" },
    },
    data: {
      fulfillment: "processing_mock",
    },
  });

  if (claim.count !== 1) {
    return {
      fulfilled: false as const,
      reason: "already_processing_or_fulfilled",
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  }

  const orderNumber = order.orderNumber || order.id;
  const shortId = order.id.slice(-8).toUpperCase();

  const updatedOrder = await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      payment: "Paid",
      fulfillment: "Delivered",
      esimStatus: "ready",
      providerOrderId: `esimgo_mock_${orderNumber}`,
      iccid: `89314404${Date.now().toString().slice(-10)}`,
      activationCode: `LPA:1$mock.getdalo.com$${orderNumber}-${shortId}`,
      iosInstallUrl: `https://getdalo.com/mock-install/ios/${order.id}`,
      androidInstallUrl: `https://getdalo.com/mock-install/android/${order.id}`,
      qrCodeUrl: `https://getdalo.com/mock-qr/${order.id}`,
      usedDataGb: 0,
      remainingDataGb: order.totalDataGb,
      lastUsageSyncAt: new Date(),
    },
  });

  return {
    fulfilled: true as const,
    orderId: updatedOrder.id,
    orderNumber: updatedOrder.orderNumber,
  };
}
