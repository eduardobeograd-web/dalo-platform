import { Resend } from "resend";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.DALO_EMAIL_FROM || "DALO <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("RESEND_API_KEY is missing. Email was not sent.");

    return {
      success: false,
      skipped: true,
      reason: "RESEND_API_KEY is missing",
    };
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Resend email failed:", error);

    return {
      success: false,
      skipped: false,
      error,
    };
  }

  return {
    success: true,
    skipped: false,
    data,
  };
}
