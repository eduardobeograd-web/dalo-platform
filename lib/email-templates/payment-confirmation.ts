type PaymentConfirmationEmailInput = {
  orderNumber: string;
  customerName: string | null;
  productName: string;
  destination: string;
  data: string;
  validityDays: number;
  price: string;
  accountUrl: string;
  supportUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function paymentConfirmationSubject(orderNumber: string) {
  return `Payment received for your DALO order ${orderNumber}`;
}

export function paymentConfirmationHtml({
  orderNumber,
  customerName,
  productName,
  destination,
  data,
  validityDays,
  price,
  accountUrl,
  supportUrl,
}: PaymentConfirmationEmailInput) {
  const greeting = customerName ? `Hi ${escapeHtml(customerName)},` : "Hi,";

  return `
  <div style="margin:0;padding:0;background:#f3f7ff;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
      <div style="overflow:hidden;border:1px solid #dbeafe;border-radius:28px;background:#ffffff;box-shadow:0 18px 50px rgba(30,64,175,0.10);">
        <div style="background:#1648d8;padding:28px 32px;color:#ffffff;">
          <div style="font-size:24px;font-weight:900;letter-spacing:0.08em;">DALO</div>
          <div style="margin-top:8px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#dbeafe;">
            Payment confirmed
          </div>
        </div>

        <div style="padding:32px;">
          <div style="display:inline-block;border-radius:999px;background:#ecfdf5;padding:8px 12px;font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#047857;">
            Payment received
          </div>

          <p style="margin:22px 0 8px;font-size:16px;font-weight:700;color:#334155;">${greeting}</p>
          <h1 style="margin:0 0 12px;font-size:30px;line-height:1.15;color:#020617;">
            We are preparing your eSIM.
          </h1>
          <p style="margin:0;font-size:16px;line-height:1.65;color:#475569;">
            Your payment is confirmed. We will send a second email with your QR code and installation details as soon as your eSIM is ready.
          </p>

          <div style="margin:26px 0;border:1px solid #dbeafe;background:#f8fbff;border-radius:20px;padding:22px;">
            <div style="font-size:12px;font-weight:800;color:#2563eb;letter-spacing:0.08em;text-transform:uppercase;">
              Order ${escapeHtml(orderNumber)}
            </div>
            <div style="margin-top:9px;font-size:21px;font-weight:800;color:#020617;">
              ${escapeHtml(productName)}
            </div>
            <div style="margin-top:12px;font-size:15px;line-height:1.7;color:#475569;">
              ${escapeHtml(destination)} &middot; ${escapeHtml(data)} &middot; ${validityDays} days
            </div>
            <div style="margin-top:8px;font-size:18px;font-weight:900;color:#0f172a;">
              ${escapeHtml(price)}
            </div>
          </div>

          <div style="margin:26px 0;border-left:4px solid #f59e0b;padding:2px 0 2px 18px;">
            <div style="font-size:18px;font-weight:800;color:#020617;">What happens next?</div>
            <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#475569;">
              Keep an eye on your inbox. Your installation email will contain everything needed to add the eSIM to your phone.
            </p>
          </div>

          <a href="${escapeHtml(accountUrl)}" style="display:block;background:#1648d8;color:#ffffff;text-decoration:none;text-align:center;font-weight:800;border-radius:16px;padding:16px 22px;font-size:16px;">
            View order status
          </a>

          <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#64748b;">
            Need help? Reply to this email or visit <a href="${escapeHtml(supportUrl)}" style="color:#1648d8;font-weight:700;">DALO support</a> and include your order number.
          </p>
        </div>
      </div>
    </div>
  </div>
  `;
}
