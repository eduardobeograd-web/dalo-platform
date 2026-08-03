type OrderConfirmationEmailInput = {
  orderNumber: string;
  customerName: string | null;
  iccid: string | null;
  productName: string;
  destination: string;
  data: string;
  validityDays: number;
  price: string;
  fulfillment: string;
  activationCode: string | null;
  qrCodeUrl: string | null;
  iosInstallUrl: string | null;
  androidInstallUrl: string | null;
  accountUrl: string;
  accountButtonLabel: string;
  needsPasswordSetup: boolean;
  supportUrl: string;
  termsUrl: string;
  refundUrl: string;
  privacyUrl: string;
  legalVersion: string | null;
  travelEssentials: {
    destination: string;
    referenceCity: string;
    currencyCode: string | null;
    currencyName: string;
    multipleTimeZones?: boolean;
    emergencyLabel?: string;
    emergencyNumbers?: string;
    emergencySourceUrl?: string;
  } | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function orderConfirmationSubject(orderNumber: string) {
  return `Your DALO eSIM order ${orderNumber} is confirmed`;
}

export function orderConfirmationHtml({
  orderNumber,
  customerName,
  iccid,
  productName,
  destination,
  data,
  validityDays,
  price,
  fulfillment,
  activationCode,
  qrCodeUrl,
  iosInstallUrl,
  androidInstallUrl,
  accountUrl,
  accountButtonLabel,
  needsPasswordSetup,
  supportUrl,
  termsUrl,
  refundUrl,
  privacyUrl,
  legalVersion,
  travelEssentials,
}: OrderConfirmationEmailInput) {
  const isReady = fulfillment.toLowerCase() === "delivered";
  const safeOrderNumber = escapeHtml(orderNumber);
  const safeIccid = iccid ? escapeHtml(iccid) : null;
  const safeFirstName = customerName?.trim()
    ? escapeHtml(customerName.trim().split(/\s+/)[0])
    : null;
  const safeProductName = escapeHtml(productName);
  const safeDestination = escapeHtml(destination);
  const safeData = escapeHtml(data);
  const safePrice = escapeHtml(price);
  const safeActivationCode = activationCode
    ? escapeHtml(activationCode)
    : null;
  const safeQrCodeUrl = qrCodeUrl ? escapeHtml(qrCodeUrl) : null;
  const safeAccountButtonLabel = escapeHtml(accountButtonLabel);
  const safeSupportUrl = escapeHtml(supportUrl);
  const safeTermsUrl = escapeHtml(termsUrl);
  const safeRefundUrl = escapeHtml(refundUrl);
  const safePrivacyUrl = escapeHtml(privacyUrl);
  const safeLegalVersion = legalVersion ? escapeHtml(legalVersion) : null;
  const safeTravelEssentials = travelEssentials
    ? {
        destination: escapeHtml(travelEssentials.destination),
        referenceCity: escapeHtml(travelEssentials.referenceCity),
        currencyCode: travelEssentials.currencyCode
          ? escapeHtml(travelEssentials.currencyCode)
          : null,
        currencyName: escapeHtml(travelEssentials.currencyName),
        multipleTimeZones: Boolean(travelEssentials.multipleTimeZones),
        emergencyLabel: travelEssentials.emergencyLabel
          ? escapeHtml(travelEssentials.emergencyLabel)
          : null,
        emergencyNumbers: travelEssentials.emergencyNumbers
          ? escapeHtml(travelEssentials.emergencyNumbers)
          : null,
        emergencySourceUrl: travelEssentials.emergencySourceUrl
          ? escapeHtml(travelEssentials.emergencySourceUrl)
          : null,
      }
    : null;

  const installationLinks = [
    iosInstallUrl
      ? `<a href="${escapeHtml(iosInstallUrl)}" style="display:inline-block;margin:8px 6px 0 0;border:1px solid #b9c9f8;border-radius:10px;padding:11px 14px;color:#173f91;text-decoration:none;font-size:13px;font-weight:800;">Easy install for iPhone</a>`
      : "",
    androidInstallUrl
      ? `<a href="${escapeHtml(androidInstallUrl)}" style="display:inline-block;margin:8px 6px 0 0;border:1px solid #b9c9f8;border-radius:10px;padding:11px 14px;color:#173f91;text-decoration:none;font-size:13px;font-weight:800;">Easy install for Android</a>`
      : "",
  ].join("");

  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta name="color-scheme" content="light only" />
      <meta name="supported-color-schemes" content="light" />
      <style>
        :root {
          color-scheme: light;
          supported-color-schemes: light;
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background:#eef3fb;font-family:Arial,Helvetica,sans-serif;color:#101828;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
        Your DALO travel eSIM for ${safeDestination} is ${isReady ? "ready to install" : "being prepared"}.
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
                  <div style="display:inline-block;border-radius:999px;background:${isReady ? "#e8f8ee" : "#edf3ff"};padding:7px 11px;font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:${isReady ? "#18723d" : "#173f91"};">
                    ${isReady ? "Ready to install" : "Payment confirmed"}
                  </div>

                  <p style="margin:18px 0 0;font-size:15px;font-weight:800;color:#344054;">
                    Hi${safeFirstName ? ` ${safeFirstName}` : ""},
                  </p>

                  <h1 style="margin:9px 0 10px;font-size:31px;line-height:1.16;letter-spacing:-0.02em;color:#101828;">
                    Your trip to ${safeDestination} starts connected.
                  </h1>

                  <p style="margin:0;font-size:15px;line-height:1.65;color:#536176;">
                    Your payment is confirmed. Everything you need for your travel eSIM is collected below and in your secure DALO account.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:16px 28px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border:1px solid #d9e3f2;border-radius:18px;background:#f7f9fd;">
                    <tr>
                      <td style="padding:20px;">
                        <div style="font-size:10px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#315fca;">
                          DALO order number
                        </div>
                        <div style="margin-top:5px;font-family:monospace;font-size:15px;font-weight:900;letter-spacing:0.04em;color:#173f91;">
                          ${safeOrderNumber}
                        </div>
                        <div style="margin-top:14px;font-size:20px;font-weight:900;line-height:1.3;color:#101828;">
                          ${safeProductName}
                        </div>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:16px;width:100%;font-size:14px;color:#536176;">
                          <tr>
                            <td style="padding:5px 0;">Data</td>
                            <td align="right" style="padding:5px 0;font-weight:800;color:#101828;">${safeData}</td>
                          </tr>
                          <tr>
                            <td style="padding:5px 0;">Validity</td>
                            <td align="right" style="padding:5px 0;font-weight:800;color:#101828;">${validityDays} days</td>
                          </tr>
                          <tr>
                            <td style="padding:10px 0 5px;border-top:1px solid #d9e3f2;">Total paid</td>
                            <td align="right" style="padding:10px 0 5px;border-top:1px solid #d9e3f2;font-size:17px;font-weight:900;color:#101828;">${safePrice}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              ${
                safeTravelEssentials
                  ? `
              <tr>
                <td style="padding:4px 28px 18px;">
                  <div style="border:1px solid #d9e3f2;border-radius:18px;background:#fffaf1;padding:20px;">
                    <div style="font-size:10px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#b45309;">
                      Useful for your trip
                    </div>
                    <div style="margin-top:6px;font-size:19px;font-weight:900;line-height:1.3;color:#101828;">
                      ${safeTravelEssentials.destination} essentials
                    </div>
                    <p style="margin:6px 0 15px;font-size:12px;line-height:1.6;color:#667085;">
                      Keep these practical details with your eSIM information while you travel.
                    </p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;font-size:13px;color:#475467;">
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #f0dfc3;">Local time reference</td>
                        <td align="right" style="padding:10px 0;border-top:1px solid #f0dfc3;font-weight:800;color:#101828;">
                          ${safeTravelEssentials.referenceCity}${safeTravelEssentials.multipleTimeZones ? " · multiple time zones" : ""}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #f0dfc3;">Currency</td>
                        <td align="right" style="padding:10px 0;border-top:1px solid #f0dfc3;font-weight:800;color:#101828;">
                          ${safeTravelEssentials.currencyName}${safeTravelEssentials.currencyCode ? ` · ${safeTravelEssentials.currencyCode}` : ""}
                        </td>
                      </tr>
                      ${
                        safeTravelEssentials.emergencyNumbers
                          ? `
                      <tr>
                        <td style="padding:10px 0;border-top:1px solid #f0dfc3;">
                          <span style="font-weight:900;color:#b42318;">Emergency</span>
                          ${safeTravelEssentials.emergencyLabel ? `<div style="margin-top:2px;font-size:10px;color:#667085;">${safeTravelEssentials.emergencyLabel}</div>` : ""}
                        </td>
                        <td align="right" style="padding:10px 0;border-top:1px solid #f0dfc3;font-size:17px;font-weight:900;letter-spacing:0.04em;color:#b42318;">
                          ${safeTravelEssentials.emergencyNumbers}
                        </td>
                      </tr>`
                          : ""
                      }
                    </table>

                    ${
                      safeTravelEssentials.emergencySourceUrl
                        ? `<a href="${safeTravelEssentials.emergencySourceUrl}" style="display:inline-block;margin-top:10px;font-size:12px;font-weight:900;color:#2148c0;text-decoration:underline;">Check the official emergency guidance</a>`
                        : ""
                    }
                    <p style="margin:10px 0 0;font-size:10px;line-height:1.5;color:#98a2b3;">
                      Travel information can change. Follow local authorities and current official guidance when you arrive.
                    </p>
                  </div>
                </td>
              </tr>`
                  : ""
              }

              <tr>
                <td style="padding:10px 28px 18px;">
                  ${
                    isReady
                      ? `
                  <div style="border-radius:18px;background:#f1f5ff;padding:20px;">
                    <div style="font-size:18px;font-weight:900;color:#101828;">Install before you travel</div>
                    <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#536176;">
                      Connect to reliable Wi-Fi, install the eSIM and keep it switched off until you are ready to use travel data.
                    </p>
                    ${
                      safeQrCodeUrl
                        ? `
                    <div style="margin-top:16px;text-align:center;">
                      <div style="display:inline-block;border:1px solid #d9e3f2;border-radius:16px;background:#ffffff;padding:12px;">
                        <img src="${safeQrCodeUrl}" alt="DALO eSIM installation QR code" width="210" height="210" style="display:block;width:210px;max-width:100%;height:auto;border:0;" />
                      </div>
                      <p style="margin:9px 0 0;font-size:12px;line-height:1.5;color:#667085;">
                        Scan this QR code from your phone's eSIM settings. Keep it private.
                      </p>
                      ${
                        safeActivationCode
                          ? `
                      <div style="margin:12px auto 0;max-width:420px;border-top:1px solid #d9e3f2;padding-top:10px;text-align:left;">
                        <div style="font-size:10px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#667085;">
                          Manual activation code
                        </div>
                        <div style="margin-top:5px;font-family:monospace;font-size:10px;line-height:1.5;overflow-wrap:anywhere;color:#475467;">
                          ${safeActivationCode}
                        </div>
                        <div style="margin-top:4px;font-size:10px;line-height:1.4;color:#98a2b3;">
                          Only use this code if QR or Easy Install does not work.
                        </div>
                      </div>`
                          : ""
                      }
                    </div>`
                        : ""
                    }
                    <div style="margin-top:7px;">${installationLinks}</div>
                  </div>`
                      : `
                  <div style="border-radius:18px;background:#f1f5ff;padding:20px;">
                    <div style="font-size:18px;font-weight:900;color:#101828;">We are preparing your eSIM</div>
                    <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#536176;">
                      Your payment is complete. Installation details will appear in your DALO account as soon as delivery is ready.
                    </p>
                  </div>`
                  }
                </td>
              </tr>

              <tr>
                <td style="padding:4px 28px 28px;">
                  ${
                    needsPasswordSetup
                      ? `
                  <div style="margin-bottom:20px;border-radius:18px;background:#101d35;padding:20px;color:#ffffff;">
                    <div style="font-size:10px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#a9bfff;">
                      Your DALO account
                    </div>
                    <div style="margin-top:7px;font-size:20px;font-weight:900;line-height:1.3;">
                      Keep your eSIM in view
                    </div>
                    <p style="margin:7px 0 16px;font-size:13px;line-height:1.6;color:#cbd5e1;">
                      Create your password to see installation details, order support and available data in one secure place.
                    </p>

                    <div style="border:1px solid #33466a;border-radius:14px;background:#ffffff;padding:15px;color:#101828;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td>
                            <div style="font-size:10px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#315fca;">My eSIM</div>
                            <div style="margin-top:4px;font-size:15px;font-weight:900;">${safeDestination} · ${safeData}</div>
                          </td>
                          <td align="right">
                            <span style="display:inline-block;border-radius:999px;background:#e8f8ee;padding:5px 8px;font-size:10px;font-weight:900;color:#18723d;">Ready</span>
                          </td>
                        </tr>
                      </table>
                      <div style="margin-top:14px;height:8px;border-radius:999px;background:#e5eaf2;overflow:hidden;">
                        <div style="width:8%;height:8px;border-radius:999px;background:#2148c0;"></div>
                      </div>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:7px;font-size:10px;color:#667085;">
                        <tr>
                          <td>Usage overview</td>
                          <td align="right" style="font-weight:800;color:#344054;">Install · Manage · Support</td>
                        </tr>
                      </table>
                    </div>
                  </div>`
                      : ""
                  }

                  <a href="${escapeHtml(accountUrl)}" style="display:block;border-radius:13px;background:#2148c0;padding:16px 20px;color:#ffffff;text-align:center;text-decoration:none;font-size:15px;font-weight:900;">
                    ${safeAccountButtonLabel}
                  </a>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:20px;width:100%;font-size:12px;color:#667085;">
                    <tr>
                      <td align="center" style="padding:4px;">Secure Stripe payment</td>
                      <td align="center" style="padding:4px;">Digital delivery</td>
                      <td align="center" style="padding:4px;">DALO support</td>
                    </tr>
                  </table>

                  <div style="margin-top:22px;border:1px solid #d9e3f2;border-radius:14px;background:#f7f9fd;padding:17px;">
                    <div style="font-size:14px;font-weight:900;color:#101828;">Questions about your order?</div>
                    <p style="margin:6px 0 12px;font-size:12px;line-height:1.6;color:#667085;">
                      Reply to this email or visit DALO Support. Keep these references ready so we can help quickly.
                    </p>
                    <div style="margin:0 0 12px;border-radius:10px;background:#ffffff;padding:11px;font-size:11px;line-height:1.7;color:#475467;">
                      <strong style="color:#101828;">DALO Order:</strong>
                      <span style="font-family:monospace;font-weight:800;">${safeOrderNumber}</span>
                      ${
                        safeIccid
                          ? `
                      <div style="margin-top:8px;border-top:1px solid #e4eaf3;padding-top:8px;">
                        <strong style="color:#101828;">eSIM reference number</strong><br />
                        <span style="font-family:monospace;font-weight:800;">${safeIccid}</span>
                        <div style="margin-top:3px;color:#667085;">ICCID · Only needed if our support team asks for it.</div>
                      </div>`
                          : ""
                      }
                    </div>
                    <a href="${safeSupportUrl}" style="font-size:13px;font-weight:900;color:#2148c0;text-decoration:none;">
                      Contact DALO Support
                    </a>
                  </div>

                  <div style="margin-top:20px;text-align:center;font-size:12px;line-height:1.8;color:#667085;">
                    <a href="${safeTermsUrl}" style="color:#475467;text-decoration:underline;">Terms &amp; Conditions</a>
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    <a href="${safeRefundUrl}" style="color:#475467;text-decoration:underline;">Refund Policy</a>
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    <a href="${safePrivacyUrl}" style="color:#475467;text-decoration:underline;">Privacy Policy</a>
                    ${
                      safeLegalVersion
                        ? `<div style="margin-top:6px;color:#98a2b3;">Terms accepted at checkout · Version ${safeLegalVersion}</div>`
                        : ""
                    }
                  </div>
                </td>
              </tr>

              <tr>
                <td style="border-top:1px solid #e4eaf3;padding:20px 28px;background:#fafbfe;font-size:12px;line-height:1.6;color:#667085;">
                  Need help? Reply to this email or contact DALO support. For your security, never share your activation code publicly.
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
