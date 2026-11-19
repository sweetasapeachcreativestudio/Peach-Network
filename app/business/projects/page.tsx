import { ProjectRefresh } from "@/app/components/project-refresh";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PeachAppShell } from "../../components/peach-app-shell";
import { ProjectViewManager, ProjectItem } from "./project-view-manager";
import { formatCityHub } from "@/lib/hubs";
import { FolderArchive, Plus, ShieldCheck, Wallet, Sparkles, ArrowRight } from "lucide-react";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
  const completedList = rawList.filter((p) => p.status === "completed");

  const creativeIds = [...new Set(rawList.map((p) => p.assigned_creative_id).filter(Boolean))];
  const { data: creatives } = creativeIds.length
    ? await admin.from("creatives").select("id,user_id,city,state").in("id", creativeIds)
    : { data: [] };

  const userIds = ((creatives ?? []) as any[]).map((c: any) => c.user_id).filter(Boolean);
  const { data: people } = userIds.length
    ? await admin.from("profiles").select("id,full_name").in("id", userIds)
    : { data: [] };

  const namesMap: Record<string, string> = {};
  const hubsMap: Record<string, string> = {};
  ((creatives ?? []) as any[]).forEach((c: any) => {
    const person = ((people ?? []) as any[]).find((p: any) => p.id === c.user_id);
    if (person?.full_name) {
      namesMap[c.id] = person.full_name;
    }
    hubsMap[c.id] = formatCityHub(c.city, c.state);
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
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F7DFD0]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FF5E3A] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Project Rooms</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#231714] tracking-tight">
              {business.name} Projects
            </h1>
            <p className="text-[15px] text-[#4A3B36] mt-1 flex items-center gap-2 flex-wrap">
              <span>
                <strong className="text-[#231714] tabular-nums">{activeList.length}</strong> active project{activeList.length === 1 ? "" : "s"}
              </span>
              <span className="text-[#E6C5B5]" aria-hidden="true">·</span>
              <span>
                <strong className="text-[#231714] tabular-nums">{completedList.length}</strong> completed
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/business"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF5E3A] hover:bg-[#EB4D29] text-white text-sm font-bold rounded-2xl shadow-[0_8px_20px_rgba(255,94,58,0.22)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Start Project with Peachy™</span>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <main className="xl:col-span-8 space-y-5 min-w-0">
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-red-800 text-sm">
                Projects could not be loaded at this time. Please refresh the page to retry.
              </div>
            ) : (
              <ProjectViewManager
                initialProjects={rawList}
                creativeNames={namesMap}
                creativeHubs={hubsMap}
                initialView={requestedView}
                businessName={business.name}
                assetCount={assets?.length ?? 0}
              />
            )}

            <details className="bg-white border border-[#F7DFD0] rounded-3xl p-5 text-sm text-[#4A3B36] group cursor-pointer shadow-[0_12px_32px_rgba(232,93,59,0.08)]">
              <summary className="font-bold text-[#231714] flex items-center justify-between list-none">
                <span className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#FF5E3A] shrink-0" />
                  <span>Peach Project Protection &amp; Ownership Guarantee</span>
                </span>
                <span className="text-[#8E776E] group-open:rotate-180 transition-transform text-xs">▼</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[#4A3B36] border-t border-[#F7DFD0] pt-3">
                All Peach Network collaborations include 3 revision rounds, milestone proof reviews, and clear deliverables inside your dedicated Project Room. Peach Coins remain reserved under Peach Project Protection until you approve final deliverables, and completed files sync straight to your Brand Vault.
              </p>
            </details>
          </main>

          <aside className="xl:col-span-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-5 min-w-0">
            <section className="bg-white border border-[#F7DFD0] rounded-3xl p-6 shadow-[0_12px_32px_rgba(232,93,59,0.08)] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-[#231714] flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#FF5E3A]" />
                  <span>Peach Wallet</span>
                </h2>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFD8BE] text-[#231714]">
                  $50 / Coin
                </span>
              </div>

              <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-4 space-y-1">
                <div className="text-2xl font-extrabold text-[#231714] tabular-nums">
                  {wallet?.available_coins ?? 0}{" "}
                  <span className="text-xs font-bold text-[#4A3B36]">Coins available</span>
                </div>
                <p className="text-xs text-[#4A3B36] tabular-nums">
                  {wallet?.held_coins ?? 0} Coins reserved for active projects.
                </p>
              </div>

              <Link
                href="/business/wallet"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-[#231714] hover:bg-[#3A2823] rounded-2xl transition-colors"
              >
                <span>Manage Wallet &amp; Buy Coins</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </section>

            <section className="bg-white border border-[#F7DFD0] rounded-3xl p-6 shadow-[0_12px_32px_rgba(232,93,59,0.08)] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-[#231714] flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-[#FF5E3A]" />
                  <span>Brand Vault</span>
                </h2>
                <span className="text-xs font-semibold text-[#4A3B36]">
                  {assets?.length ?? 0} assets
                </span>
              </div>
              <p className="text-sm text-[#4A3B36] leading-relaxed">
                Logos, colors, and completed deliverables are stored safely here for future campaigns.
              </p>
              <Link
                href="/business/vault"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-bold text-[#231714] bg-[#FFD8BE] hover:bg-[#FFCBAA] rounded-2xl transition-colors"
              >
                <span>Open Brand Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </PeachAppShell>
  );
}
