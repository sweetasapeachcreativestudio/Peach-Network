import "server-only";

type EmailInput = {
  to: string;
  subject: string;
  text: string;
};

export async function sendTransactionalEmail(input: EmailInput) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.PEACH_EMAIL_FROM;

  // Local/dev-safe behavior: email delivery can be enabled without changing app code.
  if (!key || !from) {
    console.info("[peach-email:skipped]", {
      to: input.to,
      subject: input.subject
    });
    return { delivered: false, skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email provider rejected message: ${body.slice(0, 300)}`);
  }

  return { delivered: true, skipped: false };
}
