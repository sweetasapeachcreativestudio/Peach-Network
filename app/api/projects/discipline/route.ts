import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: logs } = await admin
      .from("audit_log")
      .select("action,metadata,created_at")
      .eq("entity_id", projectId)
      .in("action", [
        "project_shoot_schedule_updated",
        "project_cloud_link_added",
        "project_cloud_link_removed",
        "project_staging_url_added",
        "project_staging_url_removed",
        "project_ownership_transfer_updated",
      ])
      .order("created_at", { ascending: true });

    let shootSchedule: any = null;
    let cloudLinks: any[] = [];
    let stagingUrls: any[] = [];
    let ownershipTransfer: any = {
      platform: "Webflow",
      targetEmail: "",
      notes: "",
      transferred: false,
    };

    for (const log of logs ?? []) {
      const meta = log.metadata || {};
      if (log.action === "project_shoot_schedule_updated") {
        shootSchedule = { ...meta, updatedAt: log.created_at };
      } else if (log.action === "project_cloud_link_added") {
        cloudLinks = cloudLinks.filter((l) => l.id !== meta.id);
        cloudLinks.push({ ...meta, addedAt: log.created_at });
      } else if (log.action === "project_cloud_link_removed") {
        cloudLinks = cloudLinks.filter((l) => l.id !== meta.id);
      } else if (log.action === "project_staging_url_added") {
        stagingUrls = stagingUrls.filter((s) => s.id !== meta.id);
        stagingUrls.push({ ...meta, addedAt: log.created_at });
      } else if (log.action === "project_staging_url_removed") {
        stagingUrls = stagingUrls.filter((s) => s.id !== meta.id);
      } else if (log.action === "project_ownership_transfer_updated") {
        ownershipTransfer = { ...ownershipTransfer, ...meta, updatedAt: log.created_at };
      }
    }

    return NextResponse.json({
      shootSchedule,
      cloudLinks,
      stagingUrls,
      ownershipTransfer,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load discipline data." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const body = await request.json();
    const { action, projectId } = body;

    if (!projectId || !action) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("id,title,category,business_id,assigned_creative_id")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name,role")
      .eq("id", user.id)
      .single();

    const senderName = profile?.full_name || "Project Member";

    // -----------------------------------------------------------------
    // 1. UPDATE SHOOT LOCATION & SCHEDULE (Commercial Photography)
    // -----------------------------------------------------------------
    if (action === "update_shoot_schedule") {
      const { venueAddress, sessionDatetime, parkingNotes, contactPerson, status } = body;
      const cleanSchedule = {
        venueAddress: venueAddress?.trim() || "",
        sessionDatetime: sessionDatetime?.trim() || "",
        parkingNotes: parkingNotes?.trim() || "",
        contactPerson: contactPerson?.trim() || "",
        status: status || "confirmed",
        updatedBy: user.id,
      };

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "project_shoot_schedule_updated",
        entity_type: "project",
        entity_id: projectId,
        metadata: cleanSchedule,
      });

      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: `📍 **Shoot Location & Schedule Updated**:\n• **Venue Address:** ${cleanSchedule.venueAddress || "Studio / On-Location"}\n• **Date & Time:** ${cleanSchedule.sessionDatetime || "Pending Agreement"}\n• **Contact & Parking:** ${cleanSchedule.parkingNotes || "N/A"}${cleanSchedule.contactPerson ? ` (Contact: ${cleanSchedule.contactPerson})` : ""}`,
      });

      return NextResponse.json({ ok: true, schedule: cleanSchedule });
    }

    // -----------------------------------------------------------------
    // 2. ADD CLOUD / GOOGLE DRIVE DELIVERY LINK (Photography / Deliverables)
    // -----------------------------------------------------------------
    if (action === "add_cloud_link") {
      const { label, url, note } = body;
      if (!url?.trim()) {
        return NextResponse.json({ error: "Cloud link URL is required." }, { status: 400 });
      }

      const linkId = `cloud_${Date.now()}`;
      const cleanLink = {
        id: linkId,
        label: label?.trim() || "Google Drive Gallery & Master High-Res Files",
        url: url.trim(),
        note: note?.trim() || "Full-resolution master retouched files with client download rights.",
        addedBy: senderName,
      };

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "project_cloud_link_added",
        entity_type: "project",
        entity_id: projectId,
        metadata: cleanLink,
      });

      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: `📁 **Cloud Gallery / Master Delivery Link Posted**:\n[${cleanLink.label}](${cleanLink.url})\n\n${cleanLink.note}`,
      });

      return NextResponse.json({ ok: true, link: cleanLink });
    }

    // -----------------------------------------------------------------
    // 3. ADD STAGING / PREVIEW URL (Website Design)
    // -----------------------------------------------------------------
    if (action === "add_staging_url") {
      const { label, url, notes } = body;
      if (!url?.trim()) {
        return NextResponse.json({ error: "Staging URL is required." }, { status: 400 });
      }

      const stagingId = `stg_${Date.now()}`;
      const cleanStaging = {
        id: stagingId,
        label: label?.trim() || "Live Desktop & Mobile Staging Link",
        url: url.trim(),
        notes: notes?.trim() || "Review layouts across desktop, tablet, and mobile breakpoints.",
        addedBy: senderName,
      };

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "project_staging_url_added",
        entity_type: "project",
        entity_id: projectId,
        metadata: cleanStaging,
      });

      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: `🌐 **New Website Staging Link Added**:\n[${cleanStaging.label}](${cleanStaging.url})\n\n*Designer Notes:* ${cleanStaging.notes}`,
      });

      return NextResponse.json({ ok: true, staging: cleanStaging });
    }

    // -----------------------------------------------------------------
    // 4. REMOVE STAGING URL
    // -----------------------------------------------------------------
    if (action === "remove_staging_url") {
      const { stagingId } = body;
      if (!stagingId) {
        return NextResponse.json({ error: "Staging ID is required." }, { status: 400 });
      }

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "project_staging_url_removed",
        entity_type: "project",
        entity_id: projectId,
        metadata: { id: stagingId },
      });

      return NextResponse.json({ ok: true });
    }

    // -----------------------------------------------------------------
    // 5. UPDATE WEBSITE OWNERSHIP TRANSFER (Final Milestone Step)
    // -----------------------------------------------------------------
    if (action === "update_ownership_transfer") {
      const { platform, targetEmail, notes, markTransferred } = body;

      const transferData: any = {
        platform: platform?.trim() || "Webflow / Shopify / Squarespace",
        targetEmail: targetEmail?.trim() || "",
        notes: notes?.trim() || "",
      };

      if (markTransferred !== undefined) {
        transferData.transferred = Boolean(markTransferred);
        if (transferData.transferred) {
          transferData.transferredAt = new Date().toISOString();
          transferData.transferredBy = senderName;
        }
      }

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "project_ownership_transfer_updated",
        entity_type: "project",
        entity_id: projectId,
        metadata: transferData,
      });

      if (transferData.transferred) {
        await admin.from("project_messages").insert({
          project_id: projectId,
          sender_user_id: user.id,
          message: `🎉 **Website Ownership Transferred!**\n100% administrative site ownership for **${transferData.platform}** has been transferred to **${transferData.targetEmail}** by ${senderName}. The client now has total control of the site, code, and CMS! 🚀`,
        });
      } else if (transferData.targetEmail) {
        await admin.from("project_messages").insert({
          project_id: projectId,
          sender_user_id: user.id,
          message: `📋 **Website Transfer Details Provided by Client**:\n• **Target Platform:** ${transferData.platform}\n• **Account Email:** ${transferData.targetEmail}${transferData.notes ? `\n• **Access Notes:** ${transferData.notes}` : ""}\n\nThe designer will initiate transfer before final project sign-off.`,
        });
      }

      return NextResponse.json({ ok: true, ownershipTransfer: transferData });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    console.error("Discipline API error:", err);
    return NextResponse.json({ error: err.message || "Failed to update discipline data." }, { status: 500 });
  }
}
