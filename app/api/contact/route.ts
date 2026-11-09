import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

const TARGET_EMAIL = "sweetasapeachcreativestudio@gmail.com";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const topic = String(body.topic || "Question About the App").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Please provide your name, email address, and message." },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const emailSubject = `[Peach Network] ${topic} from ${name}`;
    const emailBody = `New inquiry received from the Peach Network website contact & partner form:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SENDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${name}
Email: ${email}
Topic: ${topic}
Timestamp: ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })} (Central Time)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reply directly to ${email} to follow up with this inquiry.
Peach Network · Birmingham's Creative Marketplace
`;

    console.info(`[Peach Contact Form] Sending inquiry from "${name}" <${email}> to <${TARGET_EMAIL}>:`, {
      topic,
      messageLength: message.length,
    });

    // 1. Attempt transactional email delivery
    let emailDelivered = false;
    let emailSkipped = false;
    try {
      const emailResult = await sendTransactionalEmail({
        to: TARGET_EMAIL,
        subject: emailSubject,
        text: emailBody,
      });
      emailDelivered = Boolean(emailResult.delivered);
      emailSkipped = Boolean(emailResult.skipped);
    } catch (err: any) {
      console.warn("[Peach Contact Form] Email dispatch note:", err?.message || err);
    }

    // 2. Persist to database notifications / contact log so nothing is lost
    try {
      const admin = createAdminClient();
      await admin.from("notifications").insert({
        user_id: "usr_admin",
        notification_type: "contact_inquiry",
        title: `Contact Form: ${name} (${topic})`,
        body: `${name} (${email}) sent: "${message.slice(0, 200)}..."`,
      });
    } catch (dbErr) {
      console.warn("[Peach Contact Form] Database log note:", dbErr);
    }

    // 3. Generate prefilled mailto link for direct client backup
    const mailtoSubject = encodeURIComponent(emailSubject);
    const mailtoBody = encodeURIComponent(
      `Hi Sweet As A Peach Team,\n\n${message}\n\nFrom: ${name}\nEmail: ${email}\nTopic: ${topic}`
    );
    const mailtoUrl = `mailto:${TARGET_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`;

    return NextResponse.json({
      ok: true,
      recipient: TARGET_EMAIL,
      delivered: emailDelivered,
      skipped: emailSkipped,
      mailto: mailtoUrl,
      message: `Your note has been submitted to ${TARGET_EMAIL}.`,
    });
  } catch (err: any) {
    console.error("[Peach Contact Form] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to send message. Please try again or email sweetasapeachcreativestudio@gmail.com directly." },
      { status: 500 }
    );
  }
}
