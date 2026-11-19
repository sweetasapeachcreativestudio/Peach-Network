import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncFinalsToVault } from "@/lib/project-vault-sync";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPeachNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { projectId } = await request.json();
  const admin = createAdminClient();
  const { data: project } = await admin
    .from("projects")
    .select("id,title,business_id,assigned_creative_id,coin_amount,status")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const { data: business } = await admin
    .from("businesses")
    .select("owner_user_id")
    .eq("id", project.business_id)
    .maybeSingle();

  if (business?.owner_user_id !== user.id) {
    return NextResponse.json({ error: "Business owner required." }, { status: 403 });
  }

  if (!["proof_uploaded", "submitted"].includes(project.status)) {
    return NextResponse.json(
      { error: "There is not a proof or final delivery ready for approval yet." },
      { status: 400 }
    );
  }

  if (project.status === "submitted") {
    const { data: finals, error: filesError } = await admin
      .from("project_files")
      .select("id")
      .eq("project_id", projectId)
      .eq("file_kind", "final")
      .limit(1);
    if (filesError || !finals?.length) {
      return NextResponse.json(
        { error: "Your creative needs to upload the final delivery first." },
        { status: 409 }
      );
    }
  }

  // Final delivery approval marks the project completed and automatically closes creative Brand Vault access
  const nextStatus = project.status === "submitted" ? "completed" : "approved";
  const updatePayload: Record<string, any> = { status: nextStatus };
  if (nextStatus === "completed") {
    updatePayload.completed_at = new Date().toISOString();
  }

  const { data: updated, error } = await admin
    .from("projects")
    .update(updatePayload)
    .eq("id", projectId)
    .eq("status", project.status)
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!updated) return NextResponse.json({ error: "The project changed. Refresh before approving." }, { status: 409 });

  await admin.from("project_messages").insert({
    project_id: projectId,
    sender_user_id: user.id,
    message:
      project.status === "proof_uploaded"
        ? "Proof approved by the business. Creative can prepare final delivery."
        : "✓ Final delivery approved and project marked Completed. Creative Brand Vault access has been automatically closed.",
  });

  let vaultSynced = true;
  if (project.status === "submitted") {
    try {
      await syncFinalsToVault(projectId, project.business_id);
    } catch {
      vaultSynced = false;
    }

    if (project.assigned_creative_id) {
      try {
        const { data: cRow } = await admin
          .from("creatives")
          .select("user_id")
          .eq("id", project.assigned_creative_id)
          .maybeSingle();
        if (cRow?.user_id) {
          await createPeachNotification({
            userId: cRow.user_id,
            type: "project_completed",
            title: `Project Completed: ${project.title}`,
            body: `Final delivery approved! "${project.title}" is complete and Brand Vault access has closed automatically.`,
            projectId,
          });
        }
      } catch {}
    }
  }

  return NextResponse.json({
    ok: true,
    vaultSynced,
    status: nextStatus,
    brandVaultRevoked: nextStatus === "completed",
  });
}
