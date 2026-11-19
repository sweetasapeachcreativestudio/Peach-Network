import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isRealSupabaseEnv } from "@/lib/supabase/admin";
import { createPeachNotification } from "@/lib/notifications";
import { formatCityHub } from "@/lib/hubs";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveCreativeId(admin: any, candidateId: string | null, category: string) {
  let resolvedId: string | null = candidateId || null;
  if (isRealSupabaseEnv() && resolvedId && !UUID_REGEX.test(resolvedId)) {
    const { data: approvedList } = await admin
      .from("creatives")
      .select("id,primary_specialty")
      .eq("application_status", "approved")
      .limit(10);

    if (approvedList && approvedList.length > 0) {
      const categoryText = String(category || "").toLowerCase();
      const bestMatch = approvedList.find((c: any) =>
        String(c.primary_specialty || "").toLowerCase().includes(categoryText)
      );
      resolvedId = (bestMatch || approvedList[0]).id;
    } else {
      resolvedId = null;
    }
  }
  return resolvedId;
}

function buildBriefSheet(params: {
  title: string;
  businessName: string;
  businessHub?: string;
  industry?: string | null;
  businessBio?: string | null;
  dailyNeeds?: string[];
  showcaseCount?: number;
  category: string;
  coins: number;
  estimatedTurnaround?: string;
  scopeSummary?: string;
  deliverables?: string[];
  requiredFromBusiness?: string[];
  referenceImageUrls?: string[];
  podSupervision?: boolean;
  linkedPartnerTitle?: string;
}) {
  const deliverablesList = Array.isArray(params.deliverables)
    ? params.deliverables.map((d) => `• ${d}`).join("\n")
    : "• Commercial production-ready source assets\n• Web & print exports\n• Commercial usage rights release";

  const requiredBusinessList =
    Array.isArray(params.requiredFromBusiness) && params.requiredFromBusiness.length > 0
      ? params.requiredFromBusiness.map((r) => `• ${r}`).join("\n")
      : "• Brand assets, high-res logo files, and style preferences\n• Finalized text/copy and necessary logins/credentials\n• Timely review and milestone feedback";

  const referenceImagesSection =
    Array.isArray(params.referenceImageUrls) && params.referenceImageUrls.length > 0
      ? `\n\n### 5. Client Visual Reference Assets\n` +
        params.referenceImageUrls
          .map((url, idx) => `• [Visual Reference ${idx + 1}](${url})`)
          .join("\n")
      : "";

  const podLine = params.podSupervision
    ? `\n**Art Director Pod Supervision**: Included Free (Combined multi-service project over 20 Coins)`
    : "";

  const linkedLine = params.linkedPartnerTitle
    ? `\n**Linked Companion Project**: ${params.linkedPartnerTitle}`
    : "";

  const profileLines: string[] = [];
  if (params.businessHub) profileLines.push(`• **Location Hub**: ${params.businessHub}`);
  if (params.industry) profileLines.push(`• **Industry**: ${params.industry}`);
  if (params.businessBio) profileLines.push(`• **Brand Vibe & Bio**: ${params.businessBio}`);
  if (params.dailyNeeds && params.dailyNeeds.length > 0) {
    profileLines.push(`• **Ongoing Creative Needs**: ${params.dailyNeeds.join(", ")}`);
  }
  if (params.showcaseCount && params.showcaseCount > 0) {
    profileLines.push(`• **Showcase Visuals**: ${params.showcaseCount} storefront/product photos attached in Business Profile`);
  }
  const profileContextBlock = profileLines.length
    ? `\n\n### Business Studio Context\n${profileLines.join("\n")}`
    : "";

  return `# OFFICIAL CREATIVE BRIEF SHEET & SCOPE AGREEMENT
**Project**: ${params.title || "Custom Commercial Project"}
**Client**: ${params.businessName}${params.businessHub ? ` (${params.businessHub})` : ""}
**Category**: ${params.category || "Design"}
**Project Budget**: ${params.coins} Peach Coins ($${params.coins * 50} USD reserved under Peach Project Protection)
**Turnaround Timeline**: ${params.estimatedTurnaround || "3–5 business days"}
**Revisions Included**: 3 Full Revision Rounds (100% review-before-sign-off guarantee)
**Asset & Site Ownership**: 100% administrative transfer to ${params.businessName} upon completion${podLine}${linkedLine}

---

### 1. Project Objective & Scope of Work
${params.title || "Commercial Design Deliverable"}
${params.scopeSummary || "High-impact commercial deliverable designed to agency standards."}${profileContextBlock}

### 2. Tangible Included Deliverables
${deliverablesList}

### 3. What is Required From the Business
${requiredBusinessList}

### 4. Mutual Project Terms & Review Milestones
1. **Peach Project Protection**: The client's ${params.coins} Peach Coins ($${params.coins * 50} USD) are reserved for this active project. Final release occurs only after proof sign-off.
2. **Dual Digital Signatures**: Both the client (${params.businessName}) and the assigned creative must digitally sign this agreement before work commences.
3. **Turnaround & Proofs**: The creative guarantees first proof delivery within ${params.estimatedTurnaround || "3–5 business days"}.
4. **Included Revisions**: 3 complete revision rounds are included. Additional revisions can be added at 1 Peach Coin each.
5. **Full Commercial Rights**: 100% intellectual property, vector artwork, and administrative accounts transfer to the business upon completion.${referenceImagesSection}

---
*Drafted for ${params.businessName}. Finalize or customize this brief inside your Project Room before locking & sending for signatures.*`;
}

async function setupProjectSupportRecords(params: {
  admin: any;
  userId: string;
  business: { id: string; name: string };
  project: any;
  coins: number;
  resolvedCreativeId: string | null;
  fallbackCreativeName?: string;
  matchScore?: number;
  matchReason?: string;
  referenceImageUrls?: string[];
  podSupervision?: boolean;
}) {
  const {
    admin,
    userId,
    business,
    project,
    coins,
    resolvedCreativeId,
    fallbackCreativeName,
    matchScore,
    matchReason,
    referenceImageUrls,
    podSupervision,
  } = params;

  await admin.from("coin_ledger").insert({
    business_id: business.id,
    project_id: project.id,
    ledger_type: "held",
    coin_delta: -coins,
    note: `Reserved ${coins} Peach Coins for active project "${project.title}"`,
  });

  let creativeName = fallbackCreativeName || "your matched creative";
  if (resolvedCreativeId) {
    const payoutCents = Math.round(coins * 5000 * 0.75);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await admin.from("project_offers").insert({
      project_id: project.id,
      creative_id: resolvedCreativeId,
      status: "sent",
      payout_cents: payoutCents,
      expires_at: expiresAt,
    });

    try {
      await admin.from("project_match_shortlists").insert({
        project_id: project.id,
        creative_id: resolvedCreativeId,
        match_score: Number(matchScore) || 98,
        match_reason:
          matchReason || "Selected via Peach Match AI based on verified design history",
        batch_number: 1,
        status: "requested",
      });
    } catch {}

    try {
      const { data: creativeRow } = await admin
        .from("creatives")
        .select("id,user_id")
        .eq("id", resolvedCreativeId)
        .maybeSingle();

      if (creativeRow?.user_id) {
        const { data: cProf } = await admin
          .from("profiles")
          .select("full_name")
          .eq("id", creativeRow.user_id)
          .maybeSingle();
        if (cProf?.full_name) creativeName = cProf.full_name;

        await createPeachNotification({
          userId: creativeRow.user_id,
          type: "offer_received",
          title: `New Project Match: ${project.title}`,
          body: `${business.name} selected you for "${project.title}" (${coins} Peach Coins). They are finalizing the Creative Brief now — you'll be notified as soon as it's ready to sign.`,
          projectId: project.id,
        });
      }
    } catch {}
  }

  if (Array.isArray(referenceImageUrls) && referenceImageUrls.length > 0) {
    for (const [idx, refUrl] of referenceImageUrls.entries()) {
      try {
        await admin.from("project_files").insert({
          project_id: project.id,
          uploaded_by: userId,
          file_kind: "asset",
          storage_path: String(refUrl),
          original_name: `Visual Reference ${idx + 1}`,
          mime_type: "image/jpeg",
          size_bytes: 1024,
          note: "Client reference image uploaded during Peachy™ scoping session.",
        });
      } catch {}
    }
  }

  await admin.from("project_messages").insert({
    project_id: project.id,
    sender_user_id: userId,
    message: `Welcome to "${project.title}"! ${coins} Peach Coins ($${coins * 50} USD) are reserved for ${business.name} & ${creativeName} under Peach Project Protection.${
      podSupervision ? " Art Director Pod Supervision is active on this multi-service build." : ""
    } Next step: finalize and lock your Creative Brief for mutual signatures!`,
  });

  await admin.from("audit_log").insert({
    actor_user_id: userId,
    action: "project_created_via_peach_match_ai",
    entity_type: "project",
    entity_id: project.id,
    metadata: {
      coins,
      escrow_held: true,
      selected_creative: resolvedCreativeId,
      creative_name: creativeName,
      title: project.title,
      brief_locked: false,
      brief_mode: "undecided",
      has_creative_brief_sheet: true,
      pod_supervision: Boolean(podSupervision),
    },
  });

  return creativeName;
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

    const admin = createAdminClient();
    const { data: business } = await admin
      .from("businesses")
      .select("id,name,industry,description,city,state,common_needs")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (!business) {
      return NextResponse.json(
        { error: "Business account required to commission a project." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Check wallet balance + showcase photo count BEFORE creating any project(s)
    const [{ data: wallet }, { data: showcasePhotos }] = await Promise.all([
      admin
        .from("coin_wallets")
        .select("available_coins,held_coins")
        .eq("business_id", business.id)
        .maybeSingle(),
      admin
        .from("business_brand_assets")
        .select("id")
        .eq("business_id", business.id)
        .eq("kind", "photo"),
    ]);
    const businessHub = formatCityHub(business.city, business.state);
    const showcaseCount = (showcasePhotos ?? []).length;

    // =========================================================================
    // PATH A: MULTI-SERVICE SPLIT LINKED PROJECTS (Both Together -> 2 Specialists)
    // =========================================================================
    if (body.isMultiServiceSplit && body.serviceA && body.serviceB) {
      const sA = body.serviceA;
      const sB = body.serviceB;
      const coinsA = Math.max(1, Number(sA.coins) || 2);
      const coinsB = Math.max(1, Number(sB.coins) || 2);
      const totalCoins = coinsA + coinsB;
      const podSupervision = totalCoins > 20;

      if (!wallet || (wallet.available_coins ?? 0) < totalCoins) {
        return NextResponse.json(
          {
            error: `Insufficient Peach Coins. Launching both linked projects requires ${totalCoins} Coins, and you have ${wallet?.available_coins ?? 0} Coins available. Please top up first.`,
          },
          { status: 400 }
        );
      }

      const [resolvedCreativeA, resolvedCreativeB] = await Promise.all([
        resolveCreativeId(admin, sA.selectedCreativeId || null, sA.category || "Design"),
        resolveCreativeId(admin, sB.selectedCreativeId || null, sB.category || "Design"),
      ]);

      const briefA = buildBriefSheet({
        title: sA.title,
        businessName: business.name,
        businessHub,
        industry: business.industry,
        businessBio: business.description,
        dailyNeeds: Array.isArray(business.common_needs) ? business.common_needs : [],
        showcaseCount,
        category: sA.category,
        coins: coinsA,
        estimatedTurnaround: sA.estimatedTurnaround,
        scopeSummary: sA.scopeSummary,
        deliverables: sA.deliverables,
        requiredFromBusiness: sA.requiredFromBusiness,
        referenceImageUrls: body.referenceImageUrls,
        podSupervision,
        linkedPartnerTitle: sB.title,
      });

      const briefB = buildBriefSheet({
        title: sB.title,
        businessName: business.name,
        businessHub,
        industry: business.industry,
        businessBio: business.description,
        dailyNeeds: Array.isArray(business.common_needs) ? business.common_needs : [],
        showcaseCount,
        category: sB.category,
        coins: coinsB,
        estimatedTurnaround: sB.estimatedTurnaround,
        scopeSummary: sB.scopeSummary,
        deliverables: sB.deliverables,
        requiredFromBusiness: sB.requiredFromBusiness,
        referenceImageUrls: body.referenceImageUrls,
        podSupervision,
        linkedPartnerTitle: sA.title,
      });

      const { data: projectA, error: errA } = await admin
        .from("projects")
        .insert({
          business_id: business.id,
          title: sA.title || "Linked Project Part 1",
          category: sA.category || "Design",
          description: briefA,
          status: "draft",
          coin_amount: coinsA,
          revision_rounds: 3,
          current_revision_round: 0,
          assigned_creative_id: resolvedCreativeA,
          due_at: new Date(Date.now() + 10 * 86400000).toISOString(),
        })
        .select("*")
        .single();

      if (errA || !projectA) {
        return NextResponse.json({ error: errA?.message || "Could not create first linked project." }, { status: 500 });
      }

      const { data: projectB, error: errB } = await admin
        .from("projects")
        .insert({
          business_id: business.id,
          title: sB.title || "Linked Project Part 2",
          category: sB.category || "Design",
          description: briefB,
          status: "draft",
          coin_amount: coinsB,
          revision_rounds: 3,
          current_revision_round: 0,
          assigned_creative_id: resolvedCreativeB,
          due_at: new Date(Date.now() + 10 * 86400000).toISOString(),
        })
        .select("*")
        .single();

      if (errB || !projectB) {
        return NextResponse.json({ error: errB?.message || "Could not create second linked project." }, { status: 500 });
      }

      // Deduct combined escrow coins cleanly
      await admin
        .from("coin_wallets")
        .update({
          available_coins: wallet.available_coins - totalCoins,
          held_coins: (wallet.held_coins || 0) + totalCoins,
          updated_at: new Date().toISOString(),
        })
        .eq("business_id", business.id);

      const [creativeNameA, creativeNameB] = await Promise.all([
        setupProjectSupportRecords({
          admin,
          userId: user.id,
          business,
          project: projectA,
          coins: coinsA,
          resolvedCreativeId: resolvedCreativeA,
          fallbackCreativeName: sA.selectedCreativeName,
          matchScore: sA.matchScore,
          matchReason: sA.matchReason,
          referenceImageUrls: body.referenceImageUrls,
          podSupervision,
        }),
        setupProjectSupportRecords({
          admin,
          userId: user.id,
          business,
          project: projectB,
          coins: coinsB,
          resolvedCreativeId: resolvedCreativeB,
          fallbackCreativeName: sB.selectedCreativeName,
          matchScore: sB.matchScore,
          matchReason: sB.matchReason,
          referenceImageUrls: body.referenceImageUrls,
          podSupervision,
        }),
      ]);

      const linkedPodPayload = [
        {
          project_id: projectA.id,
          title: projectA.title,
          category: projectA.category,
          creative_id: resolvedCreativeA,
          creative_name: creativeNameA,
          coins: coinsA,
        },
        {
          project_id: projectB.id,
          title: projectB.title,
          category: projectB.category,
          creative_id: resolvedCreativeB,
          creative_name: creativeNameB,
          coins: coinsB,
        },
      ];

      // Cross-link both projects in audit_log so each workspace renders the Linked Pod Card
      await Promise.all([
        admin.from("audit_log").insert({
          actor_user_id: user.id,
          action: "project_linked_pod",
          entity_type: "project",
          entity_id: projectA.id,
          metadata: {
            pod_supervision: podSupervision,
            combined_coins: totalCoins,
            linked_projects: linkedPodPayload,
          },
        }),
        admin.from("audit_log").insert({
          actor_user_id: user.id,
          action: "project_linked_pod",
          entity_type: "project",
          entity_id: projectB.id,
          metadata: {
            pod_supervision: podSupervision,
            combined_coins: totalCoins,
            linked_projects: linkedPodPayload,
          },
        }),
      ]);

      try {
        await createPeachNotification({
          userId: user.id,
          type: "project_created",
          title: `Linked Projects Ready: ${projectA.title} & ${projectB.title}`,
          body: `Your multi-service pod with ${creativeNameA} & ${creativeNameB} (${totalCoins} Coins reserved${
            podSupervision ? " + Art Director Pod Supervision" : ""
          }) is live!`,
          projectId: projectA.id,
          email: false,
        });
      } catch {}

      return NextResponse.json({
        ok: true,
        project: {
          id: projectA.id,
          title: projectA.title,
          status: projectA.status,
        },
        linkedProjects: [
          { id: projectA.id, title: projectA.title, status: projectA.status, coins: coinsA },
          { id: projectB.id, title: projectB.title, status: projectB.status, coins: coinsB },
        ],
        podSupervision,
      });
    }

    // =========================================================================
    // PATH B: SINGLE OR HYBRID COMBINED PROJECT
    // =========================================================================
    const coins = Math.max(1, Number(body.coins) || 2);
    const podSupervision = Boolean(body.includesPodSupervision || coins > 20);

    if (!wallet || (wallet.available_coins ?? 0) < coins) {
      return NextResponse.json(
        {
          error: `Insufficient Peach Coins. This project requires ${coins} Coins, and you have ${wallet?.available_coins ?? 0} Coins available. Please top up first.`,
        },
        { status: 400 }
      );
    }

    const resolvedCreativeId = await resolveCreativeId(
      admin,
      body.selectedCreativeId || null,
      body.category || "Design"
    );

    const creativeBriefSheet = buildBriefSheet({
      title: body.title || "Custom Commercial Project",
      businessName: business.name,
      businessHub,
      industry: business.industry,
      businessBio: business.description,
      dailyNeeds: Array.isArray(business.common_needs) ? business.common_needs : [],
      showcaseCount,
      category: body.category || "Design",
      coins,
      estimatedTurnaround: body.estimatedTurnaround,
      scopeSummary: body.scopeSummary,
      deliverables: body.deliverables,
      requiredFromBusiness: body.requiredFromBusiness,
      referenceImageUrls: body.referenceImageUrls,
      podSupervision,
    });

    const { data: project, error: projErr } = await admin
      .from("projects")
      .insert({
        business_id: business.id,
        title: body.title || "Custom Commercial Project",
        category: body.category || "Design",
        description: creativeBriefSheet,
        status: "draft",
        coin_amount: coins,
        revision_rounds: 3,
        current_revision_round: 0,
        assigned_creative_id: resolvedCreativeId,
        due_at: body.dueAt || new Date(Date.now() + 7 * 86400000).toISOString(),
      })
      .select("*")
      .single();

    if (projErr || !project) {
      console.error("Project creation error:", projErr);
      return NextResponse.json(
        { error: projErr?.message || "Could not initialize project." },
        { status: 500 }
      );
    }

    const { error: walletErr } = await admin
      .from("coin_wallets")
      .update({
        available_coins: wallet.available_coins - coins,
        held_coins: (wallet.held_coins || 0) + coins,
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", business.id);

    if (walletErr) {
      console.error("Wallet deduction error:", walletErr);
      return NextResponse.json(
        { error: walletErr.message || "Could not reserve project coins." },
        { status: 500 }
      );
    }

    const creativeName = await setupProjectSupportRecords({
      admin,
      userId: user.id,
      business,
      project,
      coins,
      resolvedCreativeId,
      fallbackCreativeName: body.selectedCreativeName,
      matchScore: body.matchScore,
      matchReason: body.matchReason,
      referenceImageUrls: body.referenceImageUrls,
      podSupervision,
    });

    if (podSupervision) {
      await admin.from("audit_log").insert({
        actor_user_id: user.id,
        action: "project_linked_pod",
        entity_type: "project",
        entity_id: project.id,
        metadata: {
          pod_supervision: true,
          combined_coins: coins,
          linked_projects: [
            {
              project_id: project.id,
              title: project.title,
              category: project.category,
              creative_id: resolvedCreativeId,
              creative_name: creativeName,
              coins,
            },
          ],
        },
      });
    }

    try {
      await createPeachNotification({
        userId: user.id,
        type: "project_created",
        title: `Project Workspace Ready: ${project.title}`,
        body: `Your project with ${creativeName} (${coins} Coins reserved) is live. Finalize your Creative Brief inside the room to request their signature.`,
        projectId: project.id,
        email: false,
      });
    } catch {}

    return NextResponse.json({
      ok: true,
      project: {
        id: project.id,
        title: project.title,
        status: project.status,
      },
      podSupervision,
    });
  } catch (err: any) {
    console.error("ai-create-match error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process project match." },
      { status: 500 }
    );
  }
}
