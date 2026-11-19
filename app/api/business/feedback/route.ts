import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const contentType = request.headers.get("content-type") || "";
    let category = "General Feedback";
    let feedback = "";
    let businessName = "Peach Partner";
    let rating = 5;
    let attachmentFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      category = (formData.get("category") as string) || "General Feedback";
      feedback = (formData.get("feedback") as string) || "";
      businessName = (formData.get("businessName") as string) || "Peach Partner";
      rating = Number(formData.get("rating")) || 5;
      const file = formData.get("attachment");
      if (file instanceof File && file.size > 0) {
        attachmentFile = file;
      }
    } else {
      const body = await request.json().catch(() => ({}));
      category = body.category || "General Feedback";
      feedback = body.feedback || "";
      businessName = body.businessName || "Peach Partner";
      rating = Number(body.rating) || 5;
    }

    if (!feedback || !feedback.trim()) {
      return NextResponse.json({ error: "Please enter your feedback or feature request." }, { status: 400 });
    }

    const admin = createAdminClient();
    let attachmentMeta: {
      name: string;
      size_bytes: number;
      mime_type: string;
      storage_path?: string;
      url?: string | null;
    } | null = null;

    if (attachmentFile) {
      if (attachmentFile.size > 15 * 1024 * 1024) {
        return NextResponse.json({ error: "Attachment must be 15 MB or smaller." }, { status: 400 });
      }

      const safeName = attachmentFile.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
      const storagePath = `feedback/${user?.id || "anon"}/${Date.now()}-${safeName}`;
      let fileUrl: string | null = null;

      try {
        const fileBuffer = Buffer.from(await attachmentFile.arrayBuffer());
        const { error: uploadError } = await admin.storage
          .from("project-files")
          .upload(storagePath, fileBuffer, {
            contentType: attachmentFile.type || "application/octet-stream",
            upsert: false,
          });

        if (!uploadError) {
          const { data: signed } = await admin.storage
            .from("project-files")
            .createSignedUrl(storagePath, 60 * 60 * 24 * 365);
          fileUrl = signed?.signedUrl || null;
        } else {
          // Fallback to profile-media bucket
          const { error: fallbackErr } = await admin.storage
            .from("profile-media")
            .upload(storagePath, fileBuffer, {
              contentType: attachmentFile.type || "application/octet-stream",
              upsert: false,
            });
          if (!fallbackErr) {
            const { data: pubData } = admin.storage.from("profile-media").getPublicUrl(storagePath);
            fileUrl = pubData.publicUrl;
          }
        }
      } catch (storageErr) {
        console.warn("Storage upload warning for feedback attachment:", storageErr);
      }

      attachmentMeta = {
        name: attachmentFile.name,
        size_bytes: attachmentFile.size,
        mime_type: attachmentFile.type || "application/octet-stream",
        storage_path: storagePath,
        url: fileUrl,
      };
    }

    await admin.from("audit_log").insert({
      actor_user_id: user?.id || "anonymous_business",
      action: "business_feedback_submitted",
      entity_type: "feedback",
      entity_id: `fb_${Date.now()}`,
      metadata: {
        category,
        feedback: feedback.trim(),
        rating,
        business_name: businessName,
        user_email: user?.email || "partner@peachnetwork.com",
        attachment: attachmentMeta,
        created_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Thank you for your feedback! Your thoughts directly influence our creative network and platform roadmap.",
      attachment: attachmentMeta ? { name: attachmentMeta.name, url: attachmentMeta.url } : null,
    });
  } catch (err: any) {
    console.error("Feedback submit error:", err);
    return NextResponse.json({ error: err.message || "Could not submit feedback." }, { status: 500 });
  }
}
