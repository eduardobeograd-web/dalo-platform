function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

type SupportReplyEmailInput = {
  message: string;
  orderNumber?: string | null;
};

export function buildSupportReplyEmail({ message, orderNumber }: SupportReplyEmailInput) {
  const formattedMessage = escapeHtml(message).replaceAll("\n", "<br />");
  const reference = orderNumber
    ? `<p style="margin:20px 0 0;color:#64748b;font-size:13px;">Order reference: <strong style="color:#334155;">${escapeHtml(orderNumber)}</strong></p>`
    : "";

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#eef4fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef4fb;padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #dbe7f5;border-radius:22px;overflow:hidden;box-shadow:0 18px 45px rgba(15,49,102,.10);">
          <tr><td style="padding:25px 30px;background:#0b2868;color:#ffffff;">
            <div style="font-size:26px;font-weight:800;letter-spacing:7px;line-height:1;">DALO</div>
            <div style="margin-top:9px;color:#b9d1ff;font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;">Travel eSIM support</div>
          </td></tr>
          <tr><td style="padding:32px 30px 26px;">
            <p style="margin:0 0 18px;font-size:17px;font-weight:700;">Hi there,</p>
            <div style="font-size:16px;line-height:1.7;color:#334155;">${formattedMessage}</div>
            ${reference}
          </td></tr>
          <tr><td style="padding:20px 30px;border-top:1px solid #e8eef7;background:#f8fbff;color:#64748b;font-size:12px;line-height:1.6;">
            Reply to this email if you still need help. Keep your DALO order number in the conversation so our team can assist you faster.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
