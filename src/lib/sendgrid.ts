import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Validate inputs and provide helpful errors/logging for SendGrid failures.
export async function sendEmail(to: string | string[], subject: string, html:string) {
  // Validate recipient
  const hasRecipient =
    (typeof to === "string" && to.trim() !== "") ||
    (Array.isArray(to) && to.length > 0);
  if (!hasRecipient) {
    throw new Error(
      `sendEmail: missing recipient (to). Subject="${subject}". Set a valid recipient when calling sendEmail.`
    );
  }

  // Validate from
  const from = process.env.SENDGRID_FROM;
  if (!from) {
    throw new Error("sendEmail: missing SENDGRID_FROM environment variable.");
  }

  const msg = {
    to,
    from,
    subject,
    html,
  };

  // Debug/log outgoing payload (avoid logging PII in production)
  console.info("sendEmail: sending message", { to, subject, from });

  // In development, also print html so you can open/copy it locally
  if (process.env.NODE_ENV !== "production") {
    console.debug("sendEmail: html preview:\n", html);
  }

  try {
    const res = await sgMail.send(msg);
    console.info("sendEmail: SendGrid response", { status: res?.[0]?.statusCode });
    return res;
  } catch (err: any) {
    // Surface useful details from SendGrid's response if available
    const sgResponse = err?.response?.body || err?.message || err;
    console.error("sendEmail: SendGrid error:", sgResponse);
    throw err;
  }
}
