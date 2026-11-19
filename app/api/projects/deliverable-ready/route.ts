import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isRealSupabaseEnv } from "@/lib/supabase/admin";
import { isApprovedProjectCollaborator } from "@/lib/collaborators";
import { createPeachNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const { projectId, deliverableIndex, deliverableText, ready = true } = await request.json();

    if (!projectId || deliverableIndex === undefined || !deliverableText) {
      return NextResponse.json({ error: "Missing deliverable parameters." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("id,title,business_id,assigned_creative_id")
      .eq("id", projectId)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const { data: creative } = project.assigned_creative_id
      ? await admin
          .from("creatives")
          .select("id,user_id")
          .eq("id", project.assigned_creative_id)
          .maybeSingle()
      : { data: null };

    const isLeadCreative =
      creative?.user_id === user.id ||
      (!isRealSupabaseEnv() && user.id === "usr_creative_demo" && Boolean(project.assigned_creative_id));
    const isCollab = await isApprovedProjectCollaborator(admin, projectId, user.id);

    const { data: profile } = await admin
      .from("profiles")
      .select("role,full_name")
      .eq("id", user.id)
      .maybeSingle();
    const isAdmin = profile?.role === "admin";

    if (!isLeadCreative && !isCollab && !isAdmin) {
      return NextResponse.json(
        { error: "Only the assigned creative can mark deliverables ready for review." },
        { status: 403 }
      );
    }

    const isReady = Boolean(ready);

    await admin.from("audit_log").insert({
      actor_user_id: user.id,
      action: "deliverable_ready_for_review",
      entity_type: "project",
      entity_id: projectId,
      metadata: {
        deliverableIndex,
        deliverableText,
        ready: isReady,
      },
    });

    if (isReady) {
      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: `Deliverable marked Ready for Review: "${deliverableText}" — awaiting client approval.`,
      });

      const { data: business } = await admin
        .from("businesses")
        .select("owner_user_id")
        .eq("id", project.business_id)
        .maybeSingle();

      if (business?.owner_user_id) {
        try {
          await createPeachNotification({
            userId: business.owner_user_id,
            type: "deliverable_ready",
            title: `Deliverable Ready for Review: ${project.title}`,
            body: `${profile?.full_name || "Your creative"} marked "${deliverableText}" ready for your review.`,
            projectId,
          });
        } catch {}
      }
    }

    return NextResponse.json({
      ok: true,
      deliverableIndex,
      ready: isReady,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Could not update deliverable status." },
      { status: 500 }
    );
  }
}
