import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCollaboratorProjectIdsForCreative } from "@/lib/collaborators";
import { PeachAppShell } from "@/app/components/peach-app-shell";
import { ProjectRefresh } from "@/app/components/project-refresh";
import { ProjectProgress } from "@/app/components/project-progress";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileSignature,
  FolderKanban,
  Lock,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

function getCreativeStatusMeta(status: string) {
  switch (status) {
    case "draft":
      return {
        label: "Brief Being Prepared",
        hint: "Business owner is finalizing their Creative Brief before sending the contract.",
        badgeClass: "bg-stone-100 text-stone-700 border-stone-200",
      };
    case "offer_sent":
      return {
        label: "Action Needed: Review & Sign",
        hint: "Review the Creative Brief and Sign & Accept or Decline the Design Contract.",
        badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      };
    case "in_progress":
    case "accepted":
      return {
        label: "Active Workspace",
        hint: "Both signatures complete — Brand Vault & project chat are unlocked.",
        badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      };
    case "proof_uploaded":
    case "submitted":
    case "waiting_on_client":
      return {
        label: "Awaiting Client Review",
        hint: "Proof submitted. Waiting on client approval or feedback.",
        badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
      };
    case "revisions":
      return {
        label: "Revision Round Active",
        hint: "Client requested revisions inside the project workspace.",
        badgeClass: "bg-orange-100 text-orange-900 border-orange-300",
      };
    case "completed":
    case "approved":
      return {
        label: "Completed",
        hint: "Project finished and Brand Vault access automatically closed.",
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
      };
    default:
      return {
        label: status.replaceAll("_", " "),
        hint: "Open workspace to check current milestone.",
        badgeClass: "bg-stone-100 text-stone-700 border-stone-200",
      };
  }
}

export default async function CreativeProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=creative&mode=signin");

  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("peach_role")?.value;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name,role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "business" && roleCookie !== "creative") {
    redirect("/business/projects");
  }

  const { data: creative } = await admin
    .from("creatives")
    .select("id,application_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!creative) redirect("/creative/apply");
  if (creative.application_status !== "approved") redirect("/creative/status");

  const [{ data: projects }, collabProjectIds] = await Promise.all([
    admin
      .from("projects")
      .select("id,business_id,title,category,status,coin_amount,due_at,created_at,revision_rounds,assigned_creative_id")
      .eq("assigned_creative_id", creative.id)
      .order("created_at", { ascending: false }),
    getCollaboratorProjectIdsForCreative(admin, creative.id, user.id),
  ]);

  const baseProjects = (projects ?? []) as any[];
  const existingIds = new Set(baseProjects.map((p) => p.id));
  const missingCollabIds = collabProjectIds.filter((pid) => !existingIds.has(pid));

  let collabProjects: any[] = [];
  if (missingCollabIds.length > 0) {
    const { data: extra } = await admin
      .from("projects")
      .select("id,business_id,title,category,status,coin_amount,due_at,created_at,revision_rounds,assigned_creative_id")
      .in("id", missingCollabIds)
      .order("created_at", { ascending: false });
    collabProjects = (extra ?? []).map((p: any) => ({ ...p, isCollaboratorRole: true }));
  }

  const projectList = [
    ...baseProjects.map((p: any) => ({
      ...p,
      isCollaboratorRole: p.assigned_creative_id !== creative.id && collabProjectIds.includes(p.id),
    })),
    ...collabProjects,
  ];
  const businessIds = [...new Set(projectList.map((p) => p.business_id).filter(Boolean))];
  const { data: businesses } = businessIds.length
    ? await admin.from("businesses").select("id,name").in("id", businessIds)
    : { data: [] };

  const bizNames: Record<string, string> = {};
  for (const b of (businesses ?? []) as any[]) {
    if (b.id && b.name) bizNames[b.id] = b.name;
  }

  const activeProjects = projectList.filter((p) => !["completed", "cancelled"].includes(p.status));
  const completedProjects = projectList.filter((p) => ["completed", "cancelled"].includes(p.status));

  return (
    <PeachAppShell role="creative" active="projects" name={profile?.full_name}>
      <ProjectRefresh />
      <div className="space-y-6 max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#C84E2D] mb-1">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Creative Workspace Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 tracking-tight">
              Your Peach Projects
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Review client Creative Briefs, sign two-sided Design Contracts, access active Brand Vaults, and upload proofs.
            </p>
          </div>
          <Link
            href="/creative/offers"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#173328] hover:bg-[#204938] !text-white text-white text-xs font-extrabold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>View Opportunities</span>
          </Link>
        </header>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-stone-700">
            Active &amp; Pending Briefs ({activeProjects.length})
          </h2>

          {activeProjects.length > 0 ? (
            <div className="space-y-3">
              {activeProjects.map((p) => {
                const meta = getCreativeStatusMeta(p.status);
                const estPayout = ((p.coin_amount || 0) * 50 * 0.75).toFixed(0);
                const clientName = bizNames[p.business_id] || "Peach Business Client";
                const needsSign = p.status === "offer_sent";

                return (
                  <article
                    key={p.id}
                    className={`bg-white rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-xs ${
                      needsSign ? "border-amber-300 ring-1 ring-amber-100 bg-[#FFFDF9]" : "border-stone-200"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}
                          >
                            {needsSign ? (
                              <FileSignature className="w-3 h-3" />
                            ) : p.status === "draft" ? (
                              <Clock className="w-3 h-3" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            <span>{meta.label}</span>
                          </span>
                          <span className="text-xs font-bold text-stone-600">{p.category}</span>
                          {p.isCollaboratorRole && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF2EB] text-[#C84E2D] border border-[#F2C2B2]">
                              Collaborator Role
                            </span>
                          )}
                          <span className="text-stone-300">·</span>
                          <span className="text-xs font-semibold text-stone-700">Client: {clientName}</span>
                        </div>

                        <h3 className="text-base sm:text-lg font-extrabold text-stone-950 tracking-tight">
                          <Link href={`/projects/${p.id}`} className="hover:text-[#C84E2D] transition-colors">
                            {p.title}
                          </Link>
                        </h3>

                        <p className="text-xs text-stone-600 leading-relaxed">{meta.hint}</p>

                        <div className="pt-1">
                          <ProjectProgress status={p.status} compact />
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100 shrink-0">
                        <div className="text-left md:text-right">
                          <div className="text-base font-black text-[#173328] tabular-nums">
                            ${estPayout} Payout
                          </div>
                          <div className="text-[11px] text-stone-500 font-medium flex items-center md:justify-end gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{p.due_at ? `Due ${new Date(p.due_at).toLocaleDateString()}` : "Flexible"}</span>
                          </div>
                        </div>

                        <Link
                          href={`/projects/${p.id}`}
                          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-xs whitespace-nowrap ${
                            needsSign
                              ? "bg-[#C84E2D] hover:bg-[#ad4023] !text-white text-white"
                              : "bg-[#173328] hover:bg-[#204938] !text-white text-white"
                          }`}
                        >
                          <span>
                            {needsSign
                              ? "Review Brief & Sign Contract"
                              : p.status === "draft"
                              ? "View Project Status"
                              : "Open Workspace"}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-2">
              <h3 className="text-base font-extrabold text-stone-950">No assigned projects yet.</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Once a business owner selects you via Peach Match AI™ or sends a private offer, the project and Creative Brief will appear here immediately.
              </p>
              <div className="pt-2">
                <Link
                  href="/creative/offers"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#173328] !text-white text-white text-xs font-bold"
                >
                  <span>Check Opportunities</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </section>

        {completedProjects.length > 0 && (
          <section className="space-y-3 pt-2">
            <h2 className="text-sm font-black uppercase tracking-wider text-stone-500">
              Completed Archive ({completedProjects.length})
            </h2>
            <div className="space-y-2.5">
              {completedProjects.map((p) => {
                const clientName = bizNames[p.business_id] || "Peach Business Client";
                return (
                  <article
                    key={p.id}
                    className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                        <span className="text-stone-300">·</span>
                        <span className="font-semibold text-stone-600">{p.category}</span>
                        <span className="text-stone-300">·</span>
                        <span className="text-stone-500 inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Brand Vault Closed</span>
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-stone-950">{p.title}</h3>
                      <p className="text-xs text-stone-500">Client: {clientName}</p>
                    </div>
                    <Link
                      href={`/projects/${p.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-800 self-start sm:self-auto"
                    >
                      <span>View Archive</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </PeachAppShell>
  );
}
