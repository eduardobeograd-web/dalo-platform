import { NextResponse } from "next/server";
import { getCurrentCustomer } from "../../../../../lib/customer-auth";
import { prisma } from "../../../../../lib/db";
import { stripe } from "../../../../../lib/stripe";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    return NextResponse.redirect(new URL("/customer/login", request.url));
  }

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      OR: [{ customerId: customer.id }, { customer: customer.email }],
    },
  });

  const orderUrl = new URL(`/customer/orders/${id}`, request.url);

  if (
    !order ||
    !order.stripeSessionId ||
    (order.payment !== "Paid" && order.payment !== "Refunded")
  ) {
    return NextResponse.redirect(orderUrl);
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(
      order.stripeSessionId
    );

    if (!session.invoice) {
      return NextResponse.redirect(orderUrl);
    }

    const invoiceId =
      typeof session.invoice === "string"
        ? session.invoice
        : session.invoice.id;
    const invoice = await stripe.invoices.retrieve(invoiceId);

    if (!invoice.invoice_pdf) {
      return NextResponse.redirect(orderUrl);
    }

    return NextResponse.redirect(invoice.invoice_pdf);
  } catch (error) {
    console.error("Invoice download failed:", error);
    return NextResponse.redirect(orderUrl);
  }
}
