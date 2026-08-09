type RefundConfirmationEmailInput = {
  orderNumber: string;
  productName: string;
  amount: string;
  paymentStatus: string;
  wasDelivered: boolean;
  accountUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function refundConfirmationSubject(
  orderNumber: string,
  partial: boolean,
) {
  return `${partial ? "Partial refund" : "Refund"} confirmed for ${orderNumber}`;
}

export function refundConfirmationHtml({
  orderNumber,
  productName,
  amount,
  paymentStatus,
  wasDelivered,
  accountUrl,
}: RefundConfirmationEmailInput) {
  const partial = paymentStatus === "Partially Refunded";

  return `
  <div style="margin:0;padding:0;background:#f3f7ff;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
      <div style="overflow:hidden;border:1px solid #dbeafe;border-radius:28px;background:#ffffff;">
        <div style="background:#1648d8;padding:28px 32px;color:#ffffff;">
          <div style="font-size:24px;font-weight:900;letter-spacing:0.08em;">DALO</div>
          <div style="margin-top:8px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#dbeafe;">
            Refund confirmation
          </div>
        </div>

        <div style="padding:32px;">
          <div style="display:inline-block;border-radius:999px;background:#fff7ed;padding:8px 12px;font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#9a3412;">
            ${partial ? "Partial refund recorded" : "Refund recorded"}
          </div>

          <h1 style="margin:18px 0 10px;font-size:30px;line-height:1.15;color:#020617;">
            Your refund has been confirmed.
          </h1>

          <p style="margin:0;font-size:16px;line-height:1.65;color:#475569;">
            Stripe has confirmed the refund for your DALO order. Your bank can take several business days to display the credit.
          </p>

          <div style="margin:26px 0;border:1px solid #dbeafe;background:#f8fbff;border-radius:20px;padding:22px;">
            <div style="font-size:12px;font-weight:800;color:#2563eb;letter-spacing:0.08em;text-transform:uppercase;">
              Order ${escapeHtml(orderNumber)}
            </div>
            <div style="margin-top:9px;font-size:21px;font-weight:800;color:#020617;">
              ${escapeHtml(productName)}
            </div>
            <div style="margin-top:12px;font-size:15px;line-height:1.7;color:#475569;">
              Refund amount: <strong style="color:#0f172a;">${escapeHtml(amount)}</strong>
            </div>
          </div>

          <div style="margin:26px 0;border-left:4px solid #f59e0b;padding:2px 0 2px 18px;">
            <div style="font-size:18px;font-weight:800;color:#020617;">
              ${
                wasDelivered
                  ? "Your delivered eSIM remains recorded"
                  : partial
                    ? "Check the latest delivery status in your account"
                    : "This order will not be delivered"
              }
            </div>
            <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#475569;">
              ${
                wasDelivered
                  ? "The eSIM was already delivered before the refund. A refund does not automatically remove an eSIM that is already installed on a device. Your order remains visible in your account."
                  : partial
                    ? "This is a partial refund. It does not by itself confirm that delivery was cancelled. Open your account to see the latest status of this order."
                    : "The full refund was recorded before delivery. DALO has cancelled the pending eSIM delivery."
              }
            </p>
          </div>

          <a href="${escapeHtml(accountUrl)}" style="display:block;background:#1648d8;color:#ffffff;text-decoration:none;text-align:center;font-weight:800;border-radius:16px;padding:16px 22px;font-size:16px;">
            View order status
          </a>

          <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#64748b;">
            Need help with this refund? Reply to this email or contact DALO support and include your order number.
          </p>
        </div>
      </div>
    </div>
  </div>
  `;
}
