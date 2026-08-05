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
  return `DALO payment confirmed - order ${orderNumber}`;
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
  const firstName = customerName?.trim()
    ? escapeHtml(customerName.trim().split(/\s+/)[0])
    : null;
  const safeOrderNumber = escapeHtml(orderNumber);
  const safeProductName = escapeHtml(productName);
  const safeDestination = escapeHtml(destination);
  const safeData = escapeHtml(data);
  const safePrice = escapeHtml(price);
  const safeAccountUrl = escapeHtml(accountUrl);
  const safeSupportUrl = escapeHtml(supportUrl);

  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta name="color-scheme" content="light only" />
      <meta name="supported-color-schemes" content="light" />
      <style>:root { color-scheme: light; supported-color-schemes: light; }</style>
    </head>
    <body style="margin:0;padding:0;background:#eef3fb;font-family:Arial,Helvetica,sans-serif;color:#101828;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
        Your payment for DALO order ${safeOrderNumber} is confirmed.
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#eef3fb;">
        <tr>
          <td align="center" style="padding:28px 12px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;border:1px solid #d7e1f1;border-radius:24px;background:#ffffff;overflow:hidden;">
              <tr>
                <td style="padding:0;background:#dfe9ff;">
                  <img src="cid:dalo-header" alt="DALO - We found the right eSIM for your trip." width="620" style="display:block;width:100%;max-width:620px;height:auto;border:0;" />
                </td>
              </tr>
              <tr>
                <td style="padding:30px 28px 12px;">
                  <div style="display:inline-block;border-radius:999px;background:#e8f8ee;padding:7px 11px;font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#18723d;">Payment confirmed</div>
                  <p style="margin:18px 0 0;font-size:15px;font-weight:800;color:#344054;">Hi${firstName ? ` ${firstName}` : ""},</p>
                  <h1 style="margin:9px 0 10px;font-size:31px;line-height:1.16;letter-spacing:-0.02em;color:#101828;">We are preparing your eSIM.</h1>
                  <p style="margin:0;font-size:15px;line-height:1.65;color:#536176;">Your payment has been received. A separate email with your QR code and installation details will follow as soon as your eSIM is ready.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 28px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border:1px solid #d9e3f2;border-radius:18px;background:#f7f9fd;">
                    <tr>
                      <td style="padding:20px;">
                        <div style="font-size:10px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#315fca;">DALO order number</div>
                        <div style="margin-top:5px;font-family:monospace;font-size:15px;font-weight:900;color:#173f91;">${safeOrderNumber}</div>
                        <div style="margin-top:17px;font-size:19px;font-weight:800;color:#101828;">${safeProductName}</div>
                        <div style="margin-top:8px;font-size:14px;line-height:1.6;color:#536176;">${safeDestination} &middot; ${safeData} &middot; ${validityDays} days</div>
                        <div style="margin-top:8px;font-size:18px;font-weight:900;color:#101828;">${safePrice}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 28px 28px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-left:3px solid #f59e0b;background:#fffaf0;">
                    <tr><td style="padding:15px 17px;font-size:14px;line-height:1.6;color:#475467;"><strong style="color:#101828;">Next:</strong> Keep an eye on your inbox. Your installation email will contain everything needed to add the eSIM to your device.</td></tr>
                  </table>
                  <a href="${safeAccountUrl}" style="display:block;margin-top:20px;border-radius:12px;background:#173fbd;padding:15px 18px;text-align:center;font-size:15px;font-weight:800;color:#ffffff;text-decoration:none;">View order status</a>
                  <p style="margin:20px 0 0;font-size:12px;line-height:1.65;color:#667085;">Need help? Reply to this email or visit <a href="${safeSupportUrl}" style="color:#173f91;font-weight:800;">DALO support</a> and include order ${safeOrderNumber}.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}
