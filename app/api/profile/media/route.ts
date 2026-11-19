import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, ensureStorageBucket } from "@/lib/supabase/admin";
import { validatePhotoFileMeta } from "@/lib/photo-upload-guide";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Could not read uploaded image." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image first." }, { status: 400 });
  }

  const slot = form.get("slot") === "logo" ? "logo" : "avatar";
  const check = validatePhotoFileMeta(file, slot);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  const admin = createAdminClient();
  await ensureStorageBucket(admin, "profile-media", true);

  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "avatar.jpg";
  const path = `${user.id}/${crypto.randomUUID()}-${safe}`;
  const { error } = await admin.storage
    .from("profile-media")
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: check.contentType,
      upsert: true,
    });

  if (error) {
    return NextResponse.json(
      { error: error.message || "Could not upload profile photo." },
      { status: 500 }
    );
  }

  const { data } = admin.storage.from("profile-media").getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
