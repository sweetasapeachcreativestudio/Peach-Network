import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isRealSupabaseEnv } from "@/lib/supabase/admin";
import { isSignedContractStatus } from "@/lib/brand-vault";
import {
  getProjectCollaboratorsAndPod,
  isApprovedProjectCollaborator,
} from "@/lib/collaborators";
import { formatCityHub } from "@/lib/hubs";
import { redirect, notFound } from "next/navigation";
import BusinessProjectRoom from "./business-project-room";
import { PeachAppShell } from "../../components/peach-app-shell";
import MatchShortlist from "./match-shortlist";
import { DoorDashDispatchTracker } from "./door-dash-dispatch-tracker";
import { PhoneAlertsBanner } from "../../components/phone-alerts-banner";

export const dynamic = "force-dynamic";

export default async function ProjectWorkspace({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; view?: string; section?: string }>;
}) {
  const { id } = await params;
  const { created, view, section } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=signin");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name,role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/auth?mode=signin");

  const { data: project } = await admin
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!project) notFound();

  const { data: business } = await admin
    .from("businesses")
    .select("owner_user_id,name,logo_url,city,state,industry,description,common_needs,website")
    .eq("id", project.business_id)
    .maybeSingle();

  const { data: assignedCreative } = project.assigned_creative_id
    ? await admin
        .from("creatives")
        .select("id,user_id,primary_specialty,peach_level,city,state")
        .eq("id", project.assigned_creative_id)
        .maybeSingle()
    : ({ data: null } as any);

  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("peach_role")?.value;
  const preferCreativePreview = !isRealSupabaseEnv() && (roleCookie === "creative" || view === "creative");
  const isBusiness = !preferCreativePreview && business?.owner_user_id === user.id;
  const isLeadCreative =
    assignedCreative?.user_id === user.id ||
    (!isRealSupabaseEnv() && (user.id === "usr_creative_demo" || preferCreativePreview) && !isBusiness && Boolean(project.assigned_creative_id));
  const isApprovedCollab = await isApprovedProjectCollaborator(admin, id, user.id);
  const isCreative = isLeadCreative || isApprovedCollab;
  const isAdmin = profile.role === "admin";
  if (!isBusiness && !isCreative && !isAdmin) notFound();

  const role: "business" | "creative" | "admin" = isAdmin
    ? "admin"
    : isBusiness
    ? "business"
    : "creative";

  const { collaborators, podInfo } = await getProjectCollaboratorsAndPod(admin, id);

  const [
    { data: messages },
    { data: wallet },
    { data: creativeProfile },
    { data: files },
    { data: requests },
    { data: auditLogs },
    { data: showcasePhotos },
  ] = await Promise.all([
    admin
      .from("project_messages")
      .select("id,message,created_at,sender_user_id")
      .eq("project_id", id)
      .order("created_at", { ascending: true }),
    isBusiness
      ? admin.from("coin_wallets").select("available_coins").eq("business_id", project.business_id).maybeSingle()
      : Promise.resolve({ data: null }),
    assignedCreative
      ? admin.from("profiles").select("full_name,avatar_url").eq("id", assignedCreative.user_id).maybeSingle()
      : Promise.resolve({ data: null }),
    admin
      .from("project_files")
      .select("id,file_kind,original_name,mime_type,size_bytes,note,created_at,uploaded_by")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    admin
      .from("project_client_requests")
      .select("id,request_type,note,status,created_at")
      .eq("project_id", id)
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    admin
      .from("audit_log")
      .select("action,metadata,created_at")
      .eq("entity_id", id)
      .order("created_at", { ascending: false }),
    admin
      .from("business_brand_assets")
      .select("id,label,original_name")
      .eq("business_id", project.business_id)
      .eq("kind", "photo")
      .limit(6),
  ]);

  const isActiveCollab = await isApprovedProjectCollaborator(admin, id, user.id, { requireSigned: true });
  const canViewVault =
    isBusiness ||
    isAdmin ||
    ((isLeadCreative || isActiveCollab) && isSignedContractStatus(project.status));
  const { data: brandAssets } = canViewVault
    ? await admin
        .from("business_brand_assets")
        .select("id,label,value,notes,storage_path,original_name")
        .eq("business_id", project.business_id)
        .order("kind")
    : { data: [] };

  const vaultAccessState: "open_active" | "closed_completed" | "closed_pending_signatures" =
    ["completed", "cancelled"].includes(project.status)
      ? "closed_completed"
      : isSignedContractStatus(project.status)
      ? "open_active"
      : "closed_pending_signatures";

  const lockLog = (auditLogs ?? []).find((l: any) => l.action === "project_brief_locked");
  const modeLog = (auditLogs ?? []).find(
    (l: any) =>
      l.action === "project_brief_updated" || l.action === "project_created_via_peach_match_ai"
  );
  const briefLocked = Boolean(lockLog || project.status !== "draft");
  const briefMode = (lockLog?.metadata?.brief_mode ||
    modeLog?.metadata?.brief_mode ||
    "undecided") as "undecided" | "own" | "ai";

  const clientSigLog = (auditLogs ?? []).find((l: any) => l.action === "contract_signed_client");
  const creativeSigLog = (auditLogs ?? []).find((l: any) => l.action === "contract_signed_creative");

  const initialClientSignature = project.business_signature_name
    ? {
        name: project.business_signature_name,
        signedAt: project.business_signed_at || project.created_at,
      }
    : clientSigLog
    ? {
        name:
          clientSigLog.metadata?.business_signature_name ||
          clientSigLog.metadata?.signer_name ||
          business?.name ||
          "Business Owner",
        signedAt: clientSigLog.metadata?.business_signed_at || clientSigLog.metadata?.signed_at || clientSigLog.created_at,
      }
    : null;

  const initialCreativeSignature = project.creative_signature_name
    ? {
        name: project.creative_signature_name,
        signedAt: project.creative_signed_at || project.created_at,
      }
    : creativeSigLog
    ? {
        name:
          creativeSigLog.metadata?.creative_signature_name ||
          creativeSigLog.metadata?.signer_name ||
          creativeProfile?.full_name ||
          "Peach Creative",
        signedAt:
          creativeSigLog.metadata?.creative_signed_at ||
          creativeSigLog.metadata?.signed_at ||
          creativeSigLog.created_at,
      }
    : null;

  const senderIds = [...new Set((messages ?? []).map((m: any) => m.sender_user_id).filter(Boolean))];
  const senderMap = new Map<string, string>();
  if (senderIds.length) {
    const { data: senders } = await admin.from("profiles").select("id,full_name").in("id", senderIds);
    (senders ?? []).forEach((s: any) => senderMap.set(s.id, s.full_name ?? "Project member"));
  }

  const previewUrls: Record<string, string> = {};
  const imageFiles = ((files ?? []) as any[]).filter(
    (f: any) => f.mime_type?.startsWith("image/") || ["application/pdf"].includes(f.mime_type ?? "")
  );

  if (imageFiles.length > 0) {
    const { data: filePaths } = await admin
      .from("project_files")
      .select("id,storage_path")
      .in(
        "id",
        imageFiles.map((f: any) => f.id)
      );

    if (filePaths?.length) {
      await Promise.all(
        filePaths.map(async (fp: any) => {
          if (!fp.storage_path) return;
          try {
            const { data: signed } = await admin.storage
              .from("project-files")
              .createSignedUrl(fp.storage_path, 3600);
            if (signed?.signedUrl) {
              previewUrls[fp.id] = signed.signedUrl;
            }
          } catch {
            // fallback
          }
        })
      );
    }
  }

  const latestImageProof = ((files ?? []) as any[]).find(
    (f: any) => f.file_kind === "proof" && ["image/png", "image/jpeg", "image/webp"].includes(f.mime_type ?? "")
  );
  const proofThumbnailUrl = latestImageProof ? previewUrls[latestImageProof.id] ?? null : null;

  const creativeHub = formatCityHub(assignedCreative?.city, assignedCreative?.state);
  const businessHub = formatCityHub(business?.city, business?.state);
  const appRole = role === "creative" ? "creative" : "business";

  const initialCheckedPieces: Record<number, boolean> = {};
  const initialReadyPieces: Record<number, boolean> = {};
  for (const log of [...(auditLogs ?? [])].reverse()) {
    const idx = log?.metadata?.deliverableIndex;
    if (typeof idx !== "number") continue;
    if (log.action === "deliverable_approved") {
      initialCheckedPieces[idx] = true;
      initialReadyPieces[idx] = true;
    } else if (log.action === "deliverable_feedback") {
      initialCheckedPieces[idx] = false;
      initialReadyPieces[idx] = false;
    } else if (log.action === "deliverable_ready_for_review") {
      initialReadyPieces[idx] = Boolean(log.metadata?.ready);
    }
  }

  return (
    <PeachAppShell
      role={appRole}
      active="projects"
      name={profile.full_name}
      businessName={appRole === "business" ? business?.name : undefined}
      logoUrl={appRole === "business" ? business?.logo_url : undefined}
      coinCount={isBusiness ? wallet?.available_coins ?? 0 : undefined}
    >
      <PhoneAlertsBanner role={role} />
      {created === "1" && (
        <div className="mb-4 rounded-2xl bg-[#FFF6EE] border border-[#F7DFD0] px-4 py-3 text-sm font-bold text-[#231714]">
          Project created. Review or customize your Creative Brief in Step 1 below.
        </div>
      )}

      {isBusiness && project.status === "matching" && (
        <DoorDashDispatchTracker
          projectId={id}
          projectTitle={project.title}
          category={project.category}
          coins={project.coin_amount}
          creativeName={creativeProfile?.full_name ?? "Matched Creative"}
          creativeAvatar={creativeProfile?.avatar_url ?? "/Creative1.JPG"}
          creativeSpecialty={assignedCreative?.primary_specialty ?? "Commercial Graphics"}
          creativeHub={creativeHub}
          status={project.status}
          businessName={business?.name ?? "Your business"}
          description={project.description}
          dueAt={project.due_at}
        />
      )}

      {isBusiness && !project.assigned_creative_id && ["matching", "offer_sent", "draft"].includes(project.status) && (
        <MatchShortlist projectId={id} />
      )}

      <BusinessProjectRoom
        role={role}
        isLeadCreative={isLeadCreative || isAdmin}
        currentUserId={user.id}
        initialCollaborators={collaborators}
        initialPodInfo={podInfo}
        coinBalance={wallet?.available_coins ?? 0}
        proofThumbnail={proofThumbnailUrl}
        previewUrls={previewUrls}
        project={project}
        businessName={business?.name ?? "Your business"}
        businessProfile={{
          name: business?.name ?? "Your business",
          logoUrl: business?.logo_url ?? null,
          hub: businessHub,
          industry: business?.industry ?? null,
          description: business?.description ?? null,
          website: business?.website ?? null,
          commonNeeds: Array.isArray(business?.common_needs) ? business.common_needs : [],
          showcasePhotos: (showcasePhotos ?? []) as Array<{ id: string; label?: string | null; original_name?: string | null }>,
        }}
        creative={
          assignedCreative
            ? {
                name: creativeProfile?.full_name ?? "Matched Creative",
                avatar: creativeProfile?.avatar_url ?? null,
                specialty: assignedCreative.primary_specialty,
                hub: creativeHub,
              }
            : null
        }
        files={files ?? []}
        assets={brandAssets ?? []}
        requests={requests ?? []}
        initialBrief={view === "brief"}
        initialSection={section}
        briefLocked={briefLocked}
        briefMode={briefMode}
        initialClientSignature={initialClientSignature}
        initialCreativeSignature={initialCreativeSignature}
        initialCheckedPieces={initialCheckedPieces}
        initialReadyPieces={initialReadyPieces}
        vaultAccessState={vaultAccessState}
        messages={((messages ?? []) as any[]).map((m: any) => ({
          ...m,
          sender: m.sender_user_id === user.id ? "You" : senderMap.get(m.sender_user_id) ?? "Project member",
        }))}
      />
      <style>{`.peach-business-workspace .peach-workspace-content{max-width:1750px;padding:22px 26px 40px}.peach-business-workspace .peach-workspace-topbar{height:52px}@media(max-width:700px){.peach-business-workspace .peach-workspace-content{padding:18px 14px 90px}}`}</style>
    </PeachAppShell>
  );
}
