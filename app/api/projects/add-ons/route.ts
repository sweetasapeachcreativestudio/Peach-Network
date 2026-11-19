import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSignedContractStatus } from "@/lib/brand-vault";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: addOns } = await admin
      .from("project_add_ons")
      .select("id,project_id,title,description,coins,status,requested_by,requested_at,resolved_at,decline_reason")
      .eq("project_id", projectId)
      .order("requested_at", { ascending: false });

    // Fallback: check audit_log if dedicated table empty or preview mode
    let list = addOns ?? [];
    if (!list.length) {
      const { data: logs } = await admin
        .from("audit_log")
        .select("id,action,metadata,created_at")
        .eq("entity_id", projectId)
        .in("action", ["project_add_on_requested", "project_add_on_approved", "project_add_on_declined"]);

      const mapped = new Map<string, any>();
      for (const log of logs ?? []) {
        const meta = log.metadata || {};
        const addOnId = meta.add_on_id || log.id;
        if (!mapped.has(addOnId)) {
          mapped.set(addOnId, {
            id: addOnId,
            project_id: projectId,
            title: meta.title || "Custom Add-On",
            description: meta.description || "",
            coins: meta.coins || 1,
            status: meta.status || (log.action === "project_add_on_approved" ? "approved" : log.action === "project_add_on_declined" ? "declined" : "pending"),
            requested_by: meta.requested_by,
            requested_at: meta.requested_at || log.created_at,
            resolved_at: meta.resolved_at,
            decline_reason: meta.decline_reason,
          });
        } else if (log.action === "project_add_on_approved") {
          mapped.get(addOnId).status = "approved";
          mapped.get(addOnId).resolved_at = log.created_at;
        } else if (log.action === "project_add_on_declined") {
          mapped.get(addOnId).status = "declined";
          mapped.get(addOnId).resolved_at = log.created_at;
          mapped.get(addOnId).decline_reason = meta.decline_reason;
        }
      }
      list = Array.from(mapped.values());
    }

    return NextResponse.json({ addOns: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load add-ons." }, { status: 500 });
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
    const { action, projectId, addOnId, title, description, coins, reason } = body;

    if (!projectId || !action) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("id,title,business_id,assigned_creative_id,coin_amount,status")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const { data: business } = await admin
      .from("businesses")
      .select("id,owner_user_id,name")
      .eq("id", project.business_id)
      .single();

    const { data: profile } = await admin
      .from("profiles")
      .select("id,full_name,role")
      .eq("id", user.id)
      .single();

    const isBusiness = business?.owner_user_id === user.id;
    let isCreative = false;
    if (project.assigned_creative_id) {
      const { data: creative } = await admin
        .from("creatives")
        .select("user_id")
        .eq("id", project.assigned_creative_id)
        .single();
      isCreative = creative?.user_id === user.id;
    }
    const isAdmin = profile?.role === "admin";

    // ----------------------------------------------------
    // ACTION: REQUEST ADD-ON (Initiated by Creative)
    // ----------------------------------------------------
    if (action === "request") {
      if (!isCreative && !isAdmin) {
        return NextResponse.json({ error: "Only the assigned creative can propose mid-project add-ons." }, { status: 403 });
      }

      if (!isSignedContractStatus(project.status) && !isAdmin) {
        return NextResponse.json(
          { error: "Both parties must sign the Design Contract before mid-project add-ons can be requested." },
          { status: 409 }
        );
      }

      if (!title?.trim()) {
        return NextResponse.json({ error: "Add-on title is required." }, { status: 400 });
      }

      const parsedCoins = Math.max(1, Math.round(Number(coins) || 1));
      const cleanDesc = description?.trim() || "Scope add-on requested during project progression.";
      const newAddOnId = `addon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const nowIso = new Date().toISOString();

      const newAddOn = {
        id: newAddOnId,
        project_id: projectId,
        title: title.trim(),
        description: cleanDesc,
        coins: parsedCoins,
        status: "pending",
        requested_by: user.id,
        requested_at: nowIso,
      };

      // Try insert into project_add_ons table
      try {
        await admin.from("project_add_ons").insert(newAddOn);
      } catch (err) {
        // Table may be absent; audit_log is authoritative fallback
      }

      // Record in audit log
      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "project_add_on_requested",
        entity_type: "project",
        entity_id: projectId,
        metadata: {
          add_on_id: newAddOnId,
          title: title.trim(),
          description: cleanDesc,
          coins: parsedCoins,
          usd_equivalent: parsedCoins * 50,
          requested_by: user.id,
          requested_at: nowIso,
          status: "pending",
        },
      });

      // Post visible announcement into project messages
      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: `🎁 **Mid-Project Add-On Requested**: "${title.trim()}" for **${parsedCoins} Peach Coin${parsedCoins === 1 ? "" : "s"}** ($${parsedCoins * 50} USD).\n\n*Scope Details:* ${cleanDesc}\n\n*Awaiting business owner review and approval.*`,
      });

      return NextResponse.json({ ok: true, addOn: newAddOn });
    }

    // ----------------------------------------------------
    // ACTION: APPROVE ADD-ON (Client Approves & Funds)
    // ----------------------------------------------------
    if (action === "approve") {
      if (!isBusiness && !isAdmin) {
        return NextResponse.json({ error: "Only the business client can approve add-ons and release coins." }, { status: 403 });
      }

      if (!addOnId) {
        return NextResponse.json({ error: "Add-on ID is required." }, { status: 400 });
      }

      // Retrieve add-on details
      let targetAddOn: any = null;
      const { data: foundAddOn } = await admin
        .from("project_add_ons")
        .select("*")
        .eq("id", addOnId)
        .maybeSingle();

      if (foundAddOn) {
        targetAddOn = foundAddOn;
      } else {
        const { data: logs } = await admin
          .from("audit_log")
          .select("metadata")
          .eq("entity_id", projectId)
          .eq("action", "project_add_on_requested");

        for (const log of logs ?? []) {
          if (log.metadata?.add_on_id === addOnId) {
            targetAddOn = log.metadata;
            break;
          }
        }
      }

      if (!targetAddOn) {
        return NextResponse.json({ error: "Add-on proposal not found." }, { status: 404 });
      }

      if (targetAddOn.status === "approved") {
        return NextResponse.json({ error: "This add-on has already been approved." }, { status: 400 });
      }

      const costCoins = targetAddOn.coins || 1;

      // Check client wallet balance
      const { data: wallet } = await admin
        .from("coin_wallets")
        .select("available_coins,held_coins")
        .eq("business_id", business.id)
        .maybeSingle();

      const available = wallet?.available_coins ?? 0;

      if (available < costCoins) {
        return NextResponse.json(
          {
            error: `Insufficient Peach Coins. You have ${available} coin${available === 1 ? "" : "s"} available, but this add-on requires ${costCoins} coins ($${costCoins * 50} USD).`,
            needsTopUp: true,
            requiredCoins: costCoins,
            availableCoins: available,
            shortBy: costCoins - available,
          },
          { status: 400 }
        );
      }

      // Deduct coins from available and add to held escrow
      const newAvailable = available - costCoins;
      const newHeld = (wallet?.held_coins ?? 0) + costCoins;

      await admin
        .from("coin_wallets")
        .update({
          available_coins: newAvailable,
          held_coins: newHeld,
          updated_at: new Date().toISOString(),
        })
        .eq("business_id", business.id);

      // Record in coin ledger
      await admin.from("coin_ledger").insert({
        business_id: business.id,
        project_id: projectId,
        ledger_type: "held",
        coin_delta: -costCoins,
        note: `Escrow hold for approved add-on: "${targetAddOn.title}" (${costCoins} Coins)`,
      });

      // Increment project total coin_amount so creative payout increases
      const updatedProjectCoins = (project.coin_amount || 0) + costCoins;
      await admin
        .from("projects")
        .update({
          coin_amount: updatedProjectCoins,
        })
        .eq("id", projectId);

      // Update add-on status
      const nowIso = new Date().toISOString();
      try {
        await admin
          .from("project_add_ons")
          .update({
            status: "approved",
            resolved_at: nowIso,
          })
          .eq("id", addOnId);
      } catch (e) {
        // Fallback handled in audit log
      }

      // Record approval in audit log
      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "project_add_on_approved",
        entity_type: "project",
        entity_id: projectId,
        metadata: {
          add_on_id: addOnId,
          title: targetAddOn.title,
          coins: costCoins,
          usd_equivalent: costCoins * 50,
          approved_by: user.id,
          resolved_at: nowIso,
          new_total_project_coins: updatedProjectCoins,
        },
      });

      // Post celebration message into project message stream
      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: `**Add-On Approved**: "${targetAddOn.title}" has been approved! **${costCoins} Peach Coin${costCoins === 1 ? "" : "s"}** ($${costCoins * 50} USD) reserved under Peach Project Protection.\n\nProject scope updated to **${updatedProjectCoins} Peach Coins** ($${updatedProjectCoins * 50} USD).`,
      });

      return NextResponse.json({
        ok: true,
        newTotalCoins: updatedProjectCoins,
        availableCoins: newAvailable,
      });
    }

    // ----------------------------------------------------
    // ACTION: DECLINE ADD-ON
    // ----------------------------------------------------
    if (action === "decline") {
      if (!isBusiness && !isAdmin) {
        return NextResponse.json({ error: "Only the business client can decline add-ons." }, { status: 403 });
      }

      if (!addOnId) {
        return NextResponse.json({ error: "Add-on ID is required." }, { status: 400 });
      }

      const declineReason = reason?.trim() || "Scope adjusted by client.";
      const nowIso = new Date().toISOString();

      try {
        await admin
          .from("project_add_ons")
          .update({
            status: "declined",
            resolved_at: nowIso,
            decline_reason: declineReason,
          })
          .eq("id", addOnId);
      } catch (e) {
        // Fallback handled in audit log
      }

      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "project_add_on_declined",
        entity_type: "project",
        entity_id: projectId,
        metadata: {
          add_on_id: addOnId,
          title: title || "Add-on Proposal",
          decline_reason: declineReason,
          declined_by: user.id,
          resolved_at: nowIso,
        },
      });

      await admin.from("project_messages").insert({
        project_id: projectId,
        sender_user_id: user.id,
        message: `❌ **Add-On Declined**: "${title || "Proposed Add-on"}" was declined by client.\n\n*Note:* ${declineReason}`,
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    console.error("Add-on API error:", err);
    return NextResponse.json({ error: err.message || "Failed to process add-on." }, { status: 500 });
  }
}
