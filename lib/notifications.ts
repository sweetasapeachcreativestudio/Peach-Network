import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email";

export async function createPeachNotification({
  userId,
  type,
  title,
  body,
  projectId,
  email = true
}: {
  userId: string;
  type: string;
  title: string;
  body: string;
  projectId?: string | null;
  email?: boolean;
}) {
  const admin = createAdminClient();

  await admin.from("notifications").insert({
    user_id: userId,
    notification_type: type,
    title,
    body,
    project_id: projectId ?? null
  });

  if (!email) return;

  const { data: profile } = await admin
    .from("profiles")
    .select("email,phone")
    .eq("id", userId)
    .single();

  if (profile?.email) {
    try {
      await sendTransactionalEmail({
        to: profile.email,
        subject: `Peach Network · ${title}`,
        text: `${body}\n\nSign in to Peach Network to review the details.`
      });
    } catch (error) {
      console.error("[peach-email:error]", error);
    }
  }

  // Check SMS notification trigger
  if (profile?.phone) {
    console.log(`[peach-sms:trigger] Dispatching SMS alert to ${profile.phone}: "Peach Network: ${title} - ${body}"`);
  }
}
