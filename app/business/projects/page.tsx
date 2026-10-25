import { ProjectRefresh } from "@/app/components/project-refresh";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PeachAppShell } from "../../components/peach-app-shell";
import { AcceptedProject } from "../../components/accepted-project";
import { ProjectViewManager, ProjectItem } from "./project-view-manager";
import { ArchiveToggleButton } from "./archive-toggle-button";
import { FolderArchive, Plus, ShieldCheck, Wallet, Sparkles, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

interface BusinessProjectsPageProps {
  searchParams?: Promise<{
    view?: string;
    search?: string;
  }>;
}

export default async function BusinessProjectsPage({ searchParams }: BusinessProjectsPageProps) {
  const params = searchParams ? await searchParams : {};
  const requestedView = params.view || "active";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=business&mode=signin");

  const admin = createAdminClient();
  const [{ data: profile }, { data: business }] = await Promise.all([
    admin.from("profiles").select("full_name,role").eq("id", user.id).maybeSingle(),
    admin.from("businesses").select("id,name,logo_url").eq("owner_user_id", user.id).maybeSingle(),
  ]);

  if (profile?.role === "creative") redirect("/creative");
  if (!business) redirect("/business");

  const [{ data: wallet }, { data: projects, error }, { data: assets }] = await Promise.all([
    admin.from("coin_wallets").select("available_coins,held_coins").eq("business_id", business.id).maybeSingle(),
    admin
      .from("projects")
      .select("id,title,description,category,status,coin_amount,due_at,created_at,assigned_creative_id,revision_rounds")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),
    admin.from("business_brand_assets").select("id,label,original_name").eq("business_id", business.id),
  ]);

  const rawList = (projects ?? []) as ProjectItem[];
  const activeList = rawList.filter((p) => !["completed", "cancelled"].includes(p.status));
  const archivedList = rawList.filter((p) => ["completed", "cancelled"].includes(p.status));
  const acceptedProject = activeList.find((p) => p.status === "accepted");

  // Fetch creative names for all assigned creatives
  const creativeIds = [...new Set(rawList.map((p) => p.assigned_creative_id).filter(Boolean))];
  const { data: creatives } = creativeIds.length
    ? await admin.from("creatives").select("id,user_id").in("id", creativeIds)
    : { data: [] };

  const userIds = ((creatives ?? []) as any[]).map((c: any) => c.user_id);
  const { data: people } = userIds.length
    ? await admin.from("profiles").select("id,full_name").in("id", userIds)
    : { data: [] };

  const namesMap: Record<string, string> = {};
  ((creatives ?? []) as any[]).forEach((c: any) => {
    const person = ((people ?? []) as any[]).find((p: any) => p.id === c.user_id);
    if (person?.full_name) {
      namesMap[c.id] = person.full_name;
    }
  });

  return (
    <PeachAppShell
      role="business"
      active="projects"
      name={profile?.full_name}
      businessName={business.name}
      logoUrl={business.logo_url}
      coinCount={wallet?.available_coins ?? 0}
    >
      <ProjectRefresh />
      <div className="space-y-6">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#EB6244] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Project Collaboration Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 tracking-tight">
              {business.name} Projects
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 flex items-center gap-2 flex-wrap">
              <span>
                <strong className="text-stone-900 tabular-nums">{activeList.length}</strong> active collaboration{activeList.length === 1 ? "" : "s"}
              </span>
              <span className="text-stone-300 font-normal" aria-hidden="true">·</span>
              <span>
                <strong className="text-stone-900 tabular-nums">{archivedList.length}</strong> in completed archive
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/business/new-project"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EB6244] hover:bg-[#d85538] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Start a Project</span>
            </Link>
          </div>
        </header>

        {/* Accepted Kickoff Project Announcement (if any) */}
        {acceptedProject && (
          <AcceptedProject
            project={acceptedProject}
            creativeName={namesMap[acceptedProject.assigned_creative_id || ""]}
            assetCount={assets?.length ?? 0}
          />
        )}

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Main Column: Project View Manager (Active vs Archived Tabs) */}
          <main className="xl:col-span-8 space-y-5 min-w-0">
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 text-sm">
                Projects could not be loaded at this time. Please refresh the page to retry.
              </div>
            ) : (
              <ProjectViewManager
                initialProjects={rawList}
                creativeNames={namesMap}
                initialView={requestedView}
                businessName={business.name}
                assetCount={assets?.length ?? 0}
              />
            )}

            {/* Peach Guarantee Card */}
            <details className="border border-stone-200/90 bg-white rounded-2xl p-4 sm:p-5 text-xs text-stone-600 group cursor-pointer shadow-2xs">
              <summary className="font-bold text-stone-900 flex items-center justify-between list-none">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Peach Project &amp; Escrow Guarantee</span>
                </span>
                <span className="text-stone-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-stone-600 border-t border-stone-100 pt-3">
                All Peach Network collaborations follow clear milestone scope, agreed revision rounds, and
                proof reviews inside your dedicated Project Room. Peach Coins remain protected in escrow until you approve
                the final work. Completed deliverables remain accessible in your archive and sync to your Brand Vault.
              </p>
            </details>
          </main>

          {/* Side Dock: Room Guide & Wallet/Brand Vault Summary (Organized into responsive 2-col on iPad, 1-col on Desktop) */}
          <aside className="xl:col-span-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-5 min-w-0">
            {/* Quick Archive Summary Card */}
            <section className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-[#167b5c]" />
                  <span>Archive &amp; Vault Access</span>
                </h2>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Permanent Storage
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-3.5">
                Completed work stays in your archive forever. Final vector files and color systems flow directly
                into your Brand Vault for reuse across future design requests.
              </p>

              <div className="bg-[#FAF8F5] border border-stone-200/70 rounded-xl p-3.5 space-y-2 mb-3.5 text-xs">
                <div className="flex items-center justify-between font-medium text-stone-700">
                  <span>Archived Deliverables:</span>
                  <strong className="text-stone-900 tabular-nums">{archivedList.length} projects</strong>
                </div>
                <div className="flex items-center justify-between font-medium text-stone-700">
                  <span>Brand Vault Assets:</span>
                  <strong className="text-stone-900 tabular-nums">{assets?.length ?? 0} saved</strong>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <ArchiveToggleButton />
                <Link
                  href="/business/vault"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-[#EB6244] hover:text-[#d85538] hover:bg-orange-50 rounded-xl transition-colors"
                >
                  <span>Open Brand Vault →</span>
                </Link>
              </div>
            </section>

            {/* Wallet Overview Card */}
            <section className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2 mb-3">
                <Wallet className="w-4 h-4 text-[#EB6244]" />
                <span>Wallet Summary</span>
              </h2>

              <div className="bg-[#fff8f4] border border-[#ffd1c2] rounded-xl p-4 text-[#c45439] mb-3.5">
                <div className="text-2xl font-extrabold text-stone-950 tabular-nums">
                  {wallet?.available_coins ?? 0}{" "}
                  <span className="text-xs font-bold text-stone-600">Peach Coins available</span>
                </div>
                <p className="text-xs text-stone-600 mt-1 tabular-nums">
                  {wallet?.held_coins ?? 0} Coins committed in escrow across active collaborations.
                </p>
              </div>

              <Link
                href="/business/wallet"
                className="w-full inline-flex items-center justify-center py-2 px-3 text-xs font-bold text-white bg-[#0B2D22] hover:bg-[#164e3c] rounded-xl transition-colors shadow-2xs"
              >
                Manage Wallet &amp; Buy Coins →
              </Link>
            </section>

            {/* Project Room Checklist */}
            <section className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs">
              <h2 className="text-sm font-bold text-stone-900 mb-2">
                What to Expect Inside Each Room
              </h2>
              <p className="text-xs text-stone-500 mb-3 leading-relaxed">
                Every Peach Network request gets a dedicated workspace:
              </p>
              <ol className="space-y-2.5 text-xs text-stone-700">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span><strong className="text-stone-900">Direct Creative Messaging</strong> — Chat with your designer in one thread.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span><strong className="text-stone-900">Vault Integration</strong> — Logos, fonts and color codes load automatically.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span><strong className="text-stone-900">Proof Review &amp; Revisions</strong> — Request tweaks or approve with confidence.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                  <span><strong className="text-stone-900">Final Hand-off &amp; Archive</strong> — Delivery triggers payout and permanent archive.</span>
                </li>
              </ol>
            </section>
          </aside>
        </div>
      </div>
    </PeachAppShell>
  );
}
