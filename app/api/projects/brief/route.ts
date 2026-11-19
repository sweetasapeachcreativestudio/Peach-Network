import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeGenerateContent } from "@/lib/gemini";
import { createPeachNotification } from "@/lib/notifications";

function buildDeterministicBriefSheet(params: {
  title: string;
  category: string;
  businessName: string;
  coins: number;
  notes?: string;
  existingDescription?: string | null;
}) {
  const { title, category, businessName, coins, notes } = params;
  const userNotes = notes?.trim()
    ? notes.trim()
    : "Align closely with brand voice, typography, and commercial quality standards.";

  return `# OFFICIAL CREATIVE BRIEF SHEET & SCOPE CONTRACT
**Project**: ${title}
**Client**: ${businessName}
**Category**: ${category}
**2026 Master Budget**: ${coins} Peach Coins ($${coins * 50} USD reserved under Peach Project Protection)
**Revisions Included**: 3 Full Revision Rounds
**Ownership**: 100% commercial rights & source files transfer to ${businessName}

---

### 1. Project Objective & Direction
${userNotes}

### 2. Tangible Included Deliverables
• Primary commercial ${category.toLowerCase()} deliverables ready for print and digital launch
• Editable master source files and web/social export formats
• Brand consistency review against ${businessName}'s Brand Vault assets

### 3. What is Required From ${businessName}
• Existing logos, color codes, or inspiration photos (attached or via Brand Vault)
• Any copy, dates, pricing, or venue/product details to feature
• Clear milestone feedback across up to 3 included revision rounds

### 4. Mutual Contract Terms
1. **Peach Project Protection**: ${coins} Peach Coins ($${coins * 50} USD) remain safely reserved until final delivery approval.
2. **Dual Signatures**: Both ${businessName} and the assigned creative sign before work begins.
3. **Brand Vault Access**: Brand Vault unlocks for the assigned creative once both signatures are complete and closes automatically on project completion.`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("id,title,category,description,status,coin_amount")
      .eq("id", projectId)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const { data: logs } = await admin
      .from("audit_log")
      .select("action,metadata,created_at")
      .eq("entity_id", projectId)
      .order("created_at", { ascending: false });

    const lockLog = (logs ?? []).find((l: any) => l.action === "project_brief_locked");
    const modeLog = (logs ?? []).find((l: any) => l.action === "project_brief_updated" || l.action === "project_created_via_peach_match_ai");

    const briefLocked = Boolean(lockLog || project.status !== "draft");
    const briefMode = lockLog?.metadata?.brief_mode || modeLog?.metadata?.brief_mode || "undecided";

    return NextResponse.json({
      projectId,
      briefLocked,
      briefMode,
      description: project.description || "",
      status: project.status,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Could not load brief." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, action, description, notes, briefMode } = body as {
      projectId: string;
      action: "generate" | "save_draft" | "lock_and_send";
      description?: string;
      notes?: string;
      briefMode?: "own" | "ai";
    };

    if (!projectId || !action) {
      return NextResponse.json({ error: "Project ID and action are required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("id,title,category,description,status,coin_amount,business_id,assigned_creative_id")
      .eq("id", projectId)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const [{ data: business }, { data: profile }] = await Promise.all([
      admin.from("businesses").select("id,owner_user_id,name").eq("id", project.business_id).maybeSingle(),
      admin.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    ]);

    const isBusiness = business?.owner_user_id === user.id;
    const isAdmin = profile?.role === "admin";
    if (!isBusiness && !isAdmin) {
      return NextResponse.json(
        { error: "Only the business owner can edit or lock the Creative Brief." },
        { status: 403 }
      );
    }

    if (project.status !== "draft") {
      return NextResponse.json(
        { error: "This Creative Brief has already been locked and dispatched for signatures." },
        { status: 409 }
      );
    }

    // 1. Have Peachy™ generate a customized Brief Sheet
    if (action === "generate") {
      const prompt = `You are Peachy™, Creative Director AI for Peach Network.
Write a crisp, clean, practical Creative Brief Sheet in Markdown for a small business owner and their assigned creative.

Project Title: ${project.title}
Category: ${project.category}
Business Name: ${business?.name || "Business Partner"}
Budget: ${project.coin_amount} Peach Coins ($${project.coin_amount * 50} USD, 3 revisions included)
Business Owner Notes / Preferences: ${notes?.trim() || "None provided yet — tailor cleanly to the project title & category."}
Current Draft Context: ${(project.description || "").slice(0, 800)}

Structure with these clean headings:
# OFFICIAL CREATIVE BRIEF SHEET & SCOPE CONTRACT
### 1. Project Objective & Vision
### 2. Tangible Included Deliverables (bullet list with •)
### 3. Style, Tone & Audience Notes
### 4. What ${business?.name || "the Client"} Is Providing
### 5. Mutual Milestones & Ownership (100% ownership transfer, 3 revisions, Peach Project Protection)

Keep it clear, scannable, non-jargony, and ready to review.`;

      const aiText = await safeGenerateContent({
        contents: prompt,
        timeoutMs: 14000,
      });

      const generatedSheet =
        aiText?.trim() ||
        buildDeterministicBriefSheet({
          title: project.title,
          category: project.category,
          businessName: business?.name || "Business Partner",
          coins: project.coin_amount,
          notes,
          existingDescription: project.description,
        });

      await admin
        .from("projects")
        .update({ description: generatedSheet })
        .eq("id", projectId);

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "project_brief_updated",
        entity_type: "project",
        entity_id: projectId,
        metadata: { brief_mode: "ai", generated_at: new Date().toISOString() },
      });

      return NextResponse.json({
        ok: true,
        description: generatedSheet,
        briefMode: "ai",
        briefLocked: false,
      });
    }

    // 2. Save Draft anytime before locking
    if (action === "save_draft") {
      const nextDescription = String(description ?? project.description ?? "").trim();
      if (!nextDescription) {
        return NextResponse.json({ error: "Creative Brief content cannot be empty." }, { status: 400 });
      }

      await admin
        .from("projects")
        .update({ description: nextDescription })
        .eq("id", projectId);

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "project_brief_updated",
        entity_type: "project",
        entity_id: projectId,
        metadata: {
          brief_mode: briefMode || "own",
          updated_at: new Date().toISOString(),
        },
      });

      return NextResponse.json({
        ok: true,
        description: nextDescription,
        briefMode: briefMode || "own",
        briefLocked: false,
      });
    }

    // 3. Lock Creative Brief & Send to Creative for Contract Signatures
    if (action === "lock_and_send") {
      const finalDescription = String(description ?? project.description ?? "").trim();
      if (!finalDescription) {
        return NextResponse.json(
          { error: "Please write or generate your Creative Brief before sending it to the creative." },
          { status: 400 }
        );
      }

      const nextStatus = project.assigned_creative_id ? "offer_sent" : "matching";

      await admin
        .from("projects")
        .update({
          description: finalDescription,
          status: nextStatus,
        })
        .eq("id", projectId);

      // Ensure an active project_offer exists for the assigned creative
      if (project.assigned_creative_id) {
        const { data: existingOffers } = await admin
          .from("project_offers")
          .select("id,status")
          .eq("project_id", projectId)
          .eq("creative_id", project.assigned_creative_id);

        if (!existingOffers || existingOffers.length === 0) {
          await admin.from("project_offers").insert({
            project_id: projectId,
            creative_id: project.assigned_creative_id,
            status: "sent",
            payout_cents: Math.round(project.coin_amount * 5000 * 0.75),
            expires_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
          });
        }

        try {
          const { data: creativeRow } = await admin
            .from("creatives")
            .select("user_id")
            .eq("id", project.assigned_creative_id)
            .maybeSingle();

          if (creativeRow?.user_id) {
            await createPeachNotification({
              userId: creativeRow.user_id,
              type: "brief_ready_to_sign",
              title: `Creative Brief Ready to Sign: ${project.title}`,
              body: `${business?.name || "Your client"} finalized and locked the Creative Brief for "${project.title}". Review the brief and click Sign & Accept (or Decline) inside the workspace.`,
              projectId,
            });
          }
        } catch (notifyErr) {
          console.warn("Creative brief notification error:", notifyErr);
        }
      }

      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: `📋 **Creative Brief Locked & Sent**: ${business?.name || "Business Owner"} finalized the Creative Brief and sent the Design Contract for signatures.`,
      });

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "project_brief_locked",
        entity_type: "project",
        entity_id: projectId,
        metadata: {
          brief_mode: briefMode || "own",
          locked_at: new Date().toISOString(),
        },
      });

      return NextResponse.json({
        ok: true,
        briefLocked: true,
        status: nextStatus,
        description: finalDescription,
      });
    }

    return NextResponse.json({ error: "Unsupported brief action." }, { status: 400 });
  } catch (err: any) {
    console.error("Project brief API error:", err);
    return NextResponse.json({ error: err.message || "Failed to update brief." }, { status: 500 });
  }
}
