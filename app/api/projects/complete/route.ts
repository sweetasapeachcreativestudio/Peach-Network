import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncFinalsToVault } from "@/lib/project-vault-sync";
import { createPeachNotification } from "@/lib/notifications";
import { getProjectCollaboratorsAndPod } from "@/lib/collaborators";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const { projectId } = await request.json();
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("id,title,business_id,assigned_creative_id,coin_amount,status")
      .eq("id", projectId)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const [{ data: business }, { data: profile }] = await Promise.all([
      admin.from("businesses").select("owner_user_id,name").eq("id", project.business_id).maybeSingle(),
      admin.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    ]);

    const isBusiness = business?.owner_user_id === user.id;
    const isAdmin = profile?.role === "admin";
    if (!isBusiness && !isAdmin) {
      return NextResponse.json(
        { error: "Only the business owner or Peach admin can mark a project completed." },
        { status: 403 }
      );
    }

    if (project.status === "completed") {
      return NextResponse.json({ ok: true, status: "completed", brandVaultRevoked: true });
    }

    if (["draft", "matching", "offer_sent", "cancelled"].includes(project.status)) {
      return NextResponse.json(
        { error: "Only an active signed project can be marked completed." },
        { status: 409 }
      );
    }

    const nowIso = new Date().toISOString();
    const coins = Number(project.coin_amount || 0);

    await admin
      .from("projects")
      .update({
        status: "completed",
        completed_at: nowIso,
      })
      .eq("id", projectId);

    // Release held coins from escrow ledger upon completion
    if (coins > 0) {
      const { data: wallet } = await admin
        .from("coin_wallets")
        .select("held_coins")
        .eq("business_id", project.business_id)
        .maybeSingle();

      if (wallet) {
        await admin
          .from("coin_wallets")
          .update({
            held_coins: Math.max(0, Number(wallet.held_coins || 0) - coins),
            updated_at: nowIso,
          })
          .eq("business_id", project.business_id);

        await admin.from("coin_ledger").insert({
          business_id: project.business_id,
          project_id: projectId,
          ledger_type: "released",
          coin_delta: 0,
          note: `Released ${coins} escrow Coins upon completion of "${project.title}"`,
        });
      }
    }

    let vaultSynced = true;
    try {
      await syncFinalsToVault(projectId, project.business_id);
    } catch {
      vaultSynced = false;
    }

    await admin.from("project_messages").insert({
      project_id: projectId,
      sender_user_id: user.id,
      message: `🏁 **Project Completed**: ${business?.name || "Business Owner"} marked this project completed. Creative access to your Brand Vault has been automatically closed.`,
    });

    await admin.from("audit_log").insert({
      actor_user_id: user.id,
      action: "project_completed_brand_vault_revoked",
      entity_type: "project",
      entity_id: projectId,
      metadata: {
        completed_at: nowIso,
        brand_vault_revoked: true,
      },
    });

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
            body: `${business?.name || "Your client"} marked "${project.title}" complete! Brand Vault access is now closed.`,
            projectId,
          });
        }
      } catch {}
    }

    try {
      const { collaborators } = await getProjectCollaboratorsAndPod(admin, projectId);
      const activeCollabUserIds = collaborators
        .filter((c) => (c.status === "active" || c.status === "approved_awaiting_signature") && c.creative_user_id)
        .map((c) => c.creative_user_id as string);

      for (const uid of [...new Set(activeCollabUserIds)]) {
        await createPeachNotification({
          userId: uid,
          type: "project_completed",
          title: `Project Completed: ${project.title}`,
          body: `${business?.name || "Your client"} marked "${project.title}" complete. Collaborator Brand Vault access is now closed.`,
          projectId,
        });
      }
    } catch {}

    return NextResponse.json({
      ok: true,
      status: "completed",
      vaultSynced,
      brandVaultRevoked: true,
    });
  } catch (err: any) {
    console.error("Project complete API error:", err);
    return NextResponse.json({ error: err.message || "Failed to complete project." }, { status: 500 });
  }
}
