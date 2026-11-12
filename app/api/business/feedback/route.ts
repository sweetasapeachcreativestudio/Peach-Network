import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const { category, feedback, businessName, rating } = body;

    if (!feedback || !feedback.trim()) {
      return NextResponse.json({ error: "Please enter your feedback or feature request." }, { status: 400 });
    }

    const admin = createAdminClient();

    await admin.from("audit_log").insert({
      actor_user_id: user?.id || "anonymous_business",
      action: "business_feedback_submitted",
      entity_type: "feedback",
      entity_id: `fb_${Date.now()}`,
      metadata: {
        category: category || "General Feedback",
        feedback: feedback.trim(),
        rating: rating || 5,
        business_name: businessName || "Peach Partner",
        user_email: user?.email || "partner@peachnetwork.com",
        created_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Thank you for your feedback! Your thoughts directly influence our creative network and platform roadmap.",
    });
  } catch (err: any) {
    console.error("Feedback submit error:", err);
    return NextResponse.json({ error: err.message || "Could not submit feedback." }, { status: 500 });
  }
}
