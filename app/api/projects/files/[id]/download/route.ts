import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  // This query is intentionally made with the user's session.
  // RLS permits only Peach admins and project participants.
  const { data: file, error } = await supabase
    .from("project_files")
    .select("id,storage_path,original_name")
    .eq("id", id)
    .single();

  if (error || !file) {
    return NextResponse.json({ error: "File not found or access denied." }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data, error: signedError } = await admin.storage
    .from("project-files")
    .createSignedUrl(file.storage_path, 60, { download: file.original_name });

  if (signedError || !data?.signedUrl) {
    return NextResponse.json({ error: "Could not create secure download." }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
