type ProductInterestEmailInput = {
  customerEmail: string;
  productName: string;
  destination: string;
  price: string;
  checkoutUrl: string;
};

export function productInterestSubject(destination: string) {
  return `Still planning your ${destination} trip?`;
}

export function productInterestHtml({
  customerEmail,
  productName,
  destination,
  price,
  checkoutUrl,
}: ProductInterestEmailInput) {
  return `
  <div style="margin:0;padding:0;background:#f6f8ff;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
      <div style="background:#ffffff;border-radius:28px;padding:32px;box-shadow:0 16px 40px rgba(37,99,235,0.12);">
        <div style="font-size:14px;font-weight:700;color:#2563eb;letter-spacing:0.08em;text-transform:uppercase;">
          DALO Travel eSIM
        </div>

        <h1 style="margin:16px 0 12px;font-size:32px;line-height:1.1;color:#020617;">
          Your ${destination} eSIM is ready when you are.
        </h1>

        <p style="font-size:16px;line-height:1.6;color:#475569;margin:0 0 22px;">
          You recently checked eSIM options for ${destination}. If your trip is still coming up,
          this plan can help you stay connected without hunting for a local SIM.
        </p>

        <div style="border:1px solid #dbeafe;background:#eff6ff;border-radius:20px;padding:20px;margin:24px 0;">
          <div style="font-size:13px;font-weight:700;color:#2563eb;text-transform:uppercase;">
            Viewed plan
          </div>

          <div style="font-size:22px;font-weight:800;color:#020617;margin-top:8px;">
            ${productName}
          </div>

          <div style="font-size:16px;color:#475569;margin-top:8px;">
            Destination: <strong>${destination}</strong>
          </div>

          <div style="font-size:24px;font-weight:900;color:#2563eb;margin-top:14px;">
            ${price}
          </div>
        </div>

        <a href="${checkoutUrl}" style="display:block;background:#2563eb;color:#ffffff;text-decoration:none;text-align:center;font-weight:800;border-radius:18px;padding:16px 22px;font-size:16px;">
          View this eSIM
        </a>

        <p style="font-size:13px;line-height:1.6;color:#64748b;margin:22px 0 0;">
          This email was sent because ${customerEmail} previously interacted with DALO and later viewed this eSIM plan.
          If this was not you, you can ignore this message.
        </p>
      </div>
    </div>
  </div>
  `;
}
