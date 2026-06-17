import { NextResponse } from "next/server";
import { sendEmail } from "../../../../lib/email";
import {
  abandonedCheckoutHtml,
  abandonedCheckoutSubject,
} from "../../../../lib/email-templates/abandoned-checkout";

export async function POST() {
  const testEmail = process.env.DALO_ADMIN_TEST_EMAIL;

  if (!testEmail) {
    return NextResponse.json(
      {
        success: false,
        error: "DALO_ADMIN_TEST_EMAIL is missing in .env",
      },
      { status: 400 }
    );
  }

  const destination = "Armenia";
  const productName = "Armenia eSIM 10GB / 30 days";
  const price = "€37.59";

  const result = await sendEmail({
    to: testEmail,
    subject: abandonedCheckoutSubject(destination),
    html: abandonedCheckoutHtml({
      customerEmail: testEmail,
      productName,
      destination,
      price,
      checkoutUrl: "http://localhost:3000/checkout?productId=test-product",
    }),
  });

  return NextResponse.json(result);
}
