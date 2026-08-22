import sgMail from "@sendgrid/mail";

let configured = false;

function ensureSendGridConfigured() {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not configured");
  }

  if (!configured) {
    sgMail.setApiKey(apiKey);
    configured = true;
  }
}

export function getSendGridFromEmail() {
  const from = process.env.SENDGRID_FROM_EMAIL?.trim();
  if (!from) {
    throw new Error("SENDGRID_FROM_EMAIL is not configured");
  }
  return from;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  ensureSendGridConfigured();

  await sgMail.send({
    to: input.to,
    from: getSendGridFromEmail(),
    subject: input.subject,
    text: input.text,
    html: input.html,
    trackingSettings: {
      clickTracking: {
        enable: false,
        enableText: false,
      },
      openTracking: {
        enable: false,
      },
    },
  });
}
