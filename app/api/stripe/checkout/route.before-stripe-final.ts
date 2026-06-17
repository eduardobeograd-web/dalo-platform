import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { stripe } from "../../../../lib/stripe";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const productId = String(formData.get("productId") || "");
    const email = String(formData.get("email") || "");

    if (!productId || !email) {
      return NextResponse.redirect(
        new URL(`/checkout?productId=${productId}&error=1`, request.url)
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return NextResponse.redirect(new URL("/checkout?error=1", request.url));
    }

    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === "sk_test_placeholder"
    ) {
      return NextResponse.redirect(
        new URL(`/checkout?productId=${productId}&stripe=missing`, request.url)
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const order = await prisma.order.create({
      data: {
        customer: email,
        productId: product.id,
        payment: "Pending",
        fulfillment: "Waiting",
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            product_data: {
              name: product.name,
              description: `${product.data} / ${product.validityDays} Days`,
            },
            unit_amount: Math.round(product.sellPrice * 100),
          },
        },
      ],
      metadata: {
        orderId: order.id,
        productId: product.id,
      },
      success_url: `${siteUrl}/checkout/success?orderId=${order.id}`,
      cancel_url: `${siteUrl}/checkout?productId=${product.id}`,
    });

    if (!session.url) {
      return NextResponse.redirect(
        new URL(`/checkout?productId=${product.id}&error=1`, request.url)
      );
    }

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error(error);

    return NextResponse.redirect(new URL("/checkout?error=1", request.url));
  }
}