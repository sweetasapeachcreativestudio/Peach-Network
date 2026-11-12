import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const { subject, message, topic, businessName } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Please write a message or question for the art director." }, { status: 400 });
    }

    const admin = createAdminClient();

    // Log to audit log / art director queue
    await admin.from("audit_log").insert({
      actor_user_id: user?.id || "anonymous_business",
      action: "art_director_inquiry_sent",
      entity_type: "business_inquiry",
      entity_id: `artdir_${Date.now()}`,
      metadata: {
        topic: topic || "General Guidance",
        subject: subject || "Art Director Inquiry",
        message: message.trim(),
        business_name: businessName || "Peach Business Partner",
        user_email: user?.email || "business_partner@peachnetwork.com",
        created_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Your message has been sent to an Art Director! Our creative direction team will review and reply shortly.",
    });
  } catch (err: any) {
    console.error("Ask Art Director error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit inquiry." }, { status: 500 });
  }
}
