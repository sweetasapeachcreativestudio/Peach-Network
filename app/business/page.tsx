import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  ArrowRight,
  ChevronDown,
  FolderKanban,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveDashboardBannerSlides } from "@/lib/business-banners";
import { formatCityHub } from "@/lib/hubs";
import { computeBusinessBrandReadiness } from "@/lib/readiness";
import { ProjectRefresh } from "@/app/components/project-refresh";
import { PeachAppShell } from "../components/peach-app-shell";
import { AcceptedProject } from "../components/accepted-project";
import { BusinessBannerCarousel } from "./components/business-banner-carousel";
import { PeachMatchAIBox } from "./components/peach-match-ai-box";
import { BrandReadinessCard } from "./components/brand-readiness-card";
import { CollapsibleRailCards } from "./components/collapsible-rail-cards";

export const dynamic = "force-dynamic";

const reviewStatuses = ["proof_uploaded", "submitted", "waiting_on_client"];

function statusLabel(status: string) {
  return (
    ({
      matching: "Matching",
      offer_sent: "Awaiting acceptance",
      accepted: "Kickoff ready",
      in_progress: "In progress",
      proof_uploaded: "Proof ready",
      submitted: "Delivery ready",
      waiting_on_client: "Waiting on you",
      revisions: "Revision in progress",
      approved: "Approved",
      dispute: "Support needed",
      dispute_review: "Support reviewing",
    } as Record<string, string>)[status] ?? status.replaceAll("_", " ")
  );
}

function dueText(value: string | null) {
  if (!value) return "Flexible timeline";
  const hours = Math.ceil((new Date(value).getTime() - Date.now()) / 3600000);
  if (hours < 0) return "Past due";
  if (hours < 24) return `${hours}h remaining`;
  return `Due ${new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export default async function BusinessDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=business&mode=signin");

  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("peach_role")?.value;

  const admin = createAdminClient();
  let { data: profile } = await admin
    .from("profiles")
    .select("full_name,role,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "creative" && roleCookie !== "business") {
    redirect("/creative");
  }
  if (profile?.role === "admin") redirect("/admin");

  if (!profile) {
    try {
      const { data: newProf } = await admin
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          full_name:
            user.user_metadata?.full_name ||
            (user.email ? user.email.split("@")[0] : "Peach Partner"),
          role: "business",
        })
        .select("full_name,role,avatar_url")
        .maybeSingle();
      if (newProf) profile = newProf;
    } catch {}
  }

  let { data: business } = await admin
    .from("businesses")
    .select("id,name,industry,logo_url,description,common_needs,city,state")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (!business) {
    const bizName =
      user.user_metadata?.business_name ||
      (profile?.full_name ? `${profile.full_name}'s Business` : "My Business");
    try {
      const { data: createdBiz } = await admin
        .from("businesses")
        .insert({
          owner_user_id: user.id,
          name: bizName,
          industry: "Commercial & Creative",
        })
        .select("id,name,industry,logo_url,description,common_needs,city,state")
        .maybeSingle();
      business = createdBiz;
      if (business) {
        await admin.from("coin_wallets").insert({
          business_id: business.id,
          available_coins: 0,
          held_coins: 0,
        });
      }
    } catch {}
  }

  if (!business) {
    business = {
      id: `biz_${user.id.slice(0, 8)}`,
      name:
        user.user_metadata?.business_name ||
        (profile?.full_name ? `${profile.full_name}'s Business` : "My Business"),
      industry: "Commercial & Creative",
      logo_url: null,
      description: null,
      common_needs: [],
      city: null,
      state: null,
    };
  }
  const businessHub = formatCityHub(business.city, business.state);

  const [{ data: wallet }, { data: projects }, { data: brandAssets }, { data: membership }, bannerSlides] =
    await Promise.all([
      admin
        .from("coin_wallets")
        .select("available_coins,held_coins")
        .eq("business_id", business.id)
        .maybeSingle(),
      admin
        .from("projects")
        .select("id,title,description,category,status,coin_amount,due_at,created_at,assigned_creative_id,revision_rounds")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false }),
      admin
        .from("business_brand_assets")
        .select("id,kind,label,value,original_name,notes")
        .eq("business_id", business.id),
      admin
        .from("memberships")
        .select("id,plan_name,status,monthly_coins,current_period_end")
        .eq("business_id", business.id)
        .eq("status", "active")
        .maybeSingle(),
      getActiveDashboardBannerSlides(admin),
    ]);

  const active = ((projects ?? []) as any[]).filter(
    (p: any) => !["completed", "cancelled"].includes(p.status)
  );
  const accepted = active.find((p: any) => p.status === "accepted");
  const first = profile?.full_name?.trim().split(" ")[0] || business.name;
  const coins = wallet?.available_coins ?? 0;
  const heldCoins = wallet?.held_coins ?? 0;

  const brandReadiness = computeBusinessBrandReadiness(
    business,
    (brandAssets ?? []) as any[]
  );

  const creativeIds = [
    ...new Set(active.map((p: any) => p.assigned_creative_id).filter(Boolean)),
  ];
  const activeIds = active.map((p: any) => p.id);

  const [{ data: messages }, { data: creatives }] = await Promise.all([
    activeIds.length
      ? admin
          .from("project_messages")
          .select("id,project_id,message,created_at,sender_user_id")
          .in("project_id", activeIds)
          .order("created_at", { ascending: false })
          .limit(4)
      : Promise.resolve({ data: [] }),
    creativeIds.length
      ? admin.from("creatives").select("id,user_id").in("id", creativeIds)
      : Promise.resolve({ data: [] }),
  ]);

  const peopleIds = [
    ...new Set(
      [
        ...((creatives ?? []) as any[]).map((c: any) => c.user_id),
        ...((messages ?? []) as any[]).map((m: any) => m.sender_user_id),
      ].filter(Boolean)
    ),
  ];

  const { data: people } = peopleIds.length
    ? await admin.from("profiles").select("id,full_name,avatar_url").in("id", peopleIds)
    : { data: [] };

  const peopleMap = new Map(((people ?? []) as any[]).map((p: any) => [p.id, p]));
  const creativeMap = new Map(
    ((creatives ?? []) as any[]).map((c: any) => [c.id, peopleMap.get(c.user_id)])
  );

  const formattedMessages = ((messages ?? []) as any[]).map((m) => ({
    id: m.id,
    project_id: m.project_id,
    message: m.message,
    senderName: peopleMap.get(m.sender_user_id)?.full_name || "Project Member",
  }));

  return (
    <PeachAppShell
      role="business"
      active="home"
      name={profile?.full_name}
      coinCount={coins}
      businessName={business.name}
      logoUrl={business.logo_url}
    >
      <ProjectRefresh />
      <div className="space-y-6">
        {/* Top Greeting Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#FF5E3A]">
              Peach Studio &middot; {business.name}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#231714] tracking-tight mt-0.5">
              Welcome back, {first}
            </h1>
            <p className="text-[15px] text-[#4A3B36] mt-1 flex items-center gap-2 flex-wrap">
              <span>
                <strong className="text-[#231714] tabular-nums">{active.length}</strong> active project
                {active.length === 1 ? "" : "s"}
              </span>
              <span className="text-[#F7DFD0]">&bull;</span>
              <span>
                <strong className="text-[#231714] tabular-nums">{coins}</strong> Peach Coins available
              </span>
              <span className="text-[#F7DFD0]">&bull;</span>
              <span>
                Brand Readiness{" "}
                <strong className="text-[#FF5E3A] tabular-nums">{brandReadiness.score}%</strong>
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/business/projects"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-[#231714] bg-white hover:bg-[#FFD8BE] border border-[#F7DFD0] rounded-2xl transition-colors shadow-[0_6px_18px_rgba(232,93,59,0.06)]"
            >
              <span>View All Projects</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </header>

        {/* 3-Column Peach Studio Layout (240px Sidebar via Shell + Center Workspace + 300px Right Rail) */}
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* CENTER COLUMN */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {/* 1. Top Hero Carousel Banner */}
            <BusinessBannerCarousel slides={bannerSlides} />

            {/* Kickoff banner if a project was just accepted */}
            {accepted && (
              <AcceptedProject
                project={accepted}
                creativeName={creativeMap.get(accepted.assigned_creative_id)?.full_name}
                assetCount={brandAssets?.length ?? 0}
              />
            )}

            {/* 2. Peachy™ Creative Director AI & Live Project Planner */}
            <PeachMatchAIBox
              initialAvailableCoins={coins}
              businessName={business.name}
              hasActiveSubscription={Boolean(membership)}
              subscriptionPlan={membership?.plan_name || null}
              brandReadinessScore={brandReadiness.score}
              missingBrandItems={brandReadiness.missingLabels}
            />

            {/* 3. Your Projects Section (Clean 3-line cards) */}
            <section className="space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <FolderKanban className="w-5 h-5 text-[#FF5E3A]" strokeWidth={1.5} />
                  <h2 className="text-lg font-extrabold text-[#231714]">Your Projects</h2>
                  <span className="text-xs font-extrabold text-[#231714] bg-[#FFD8BE] px-2.5 py-0.5 rounded-full tabular-nums">
                    {active.length}
                  </span>
                </div>
                <Link
                  href="/business/projects"
                  className="text-sm font-bold text-[#FF5E3A] hover:text-[#231714] transition-colors inline-flex items-center gap-1"
                >
                  <span>All Projects</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              </div>

              {active.length > 0 ? (
                <div className="space-y-3">
                  {active.map((p: any) => {
                    const creative = creativeMap.get(p.assigned_creative_id);
                    const isReview = reviewStatuses.includes(p.status);

                    return (
                      <article
                        key={p.id}
                        className="bg-white border border-[#F7DFD0] rounded-3xl p-5 shadow-[0_12px_32px_rgba(232,93,59,0.08)]"
                      >
                        {/* Line 1: Category + Due Date + 1 Status Pill */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="text-[13px] font-semibold text-[#4A3B36] flex items-center gap-2">
                            <span>{p.category || "Creative Project"}</span>
                            <span className="text-[#F7DFD0]">&bull;</span>
                            <span>{dueText(p.due_at)}</span>
                          </div>
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              isReview
                                ? "bg-[#FF5E3A] text-white"
                                : "bg-[#FFD8BE] text-[#231714]"
                            }`}
                          >
                            {statusLabel(p.status)}
                          </span>
                        </div>

                        {/* Line 2: Project Title */}
                        <h3 className="text-base sm:text-lg font-extrabold text-[#231714] truncate mt-1.5">
                          <Link
                            href={`/projects/${p.id}`}
                            className="hover:text-[#FF5E3A] transition-colors"
                          >
                            {p.title}
                          </Link>
                        </h3>

                        {/* Line 3: Creative Name + Coins + 1 Primary Action Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2.5 pt-2.5 border-t border-[#F7DFD0]/70">
                          <div className="text-[14px] text-[#4A3B36] flex items-center gap-2.5 flex-wrap">
                            <span>
                              Creative:{" "}
                              <strong className="text-[#231714] font-bold">
                                {creative?.full_name || "Assigning Creative"}
                              </strong>
                            </span>
                            <span className="text-[#F7DFD0]">&bull;</span>
                            <span className="tabular-nums font-bold text-[#231714]">
                              {p.coin_amount} Peach Coins
                            </span>
                          </div>

                          <Link
                            href={isReview ? `/projects/${p.id}?section=proofs` : `/projects/${p.id}`}
                            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold text-white transition-colors shrink-0 ${
                              isReview
                                ? "bg-[#FF5E3A] hover:bg-[#E84D2B]"
                                : "bg-[#231714] hover:bg-[#3A2722]"
                            }`}
                          >
                            <span>{isReview ? "Review Proof" : "Open Room"}</span>
                            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-[#F7DFD0] rounded-3xl p-6 text-center shadow-[0_12px_32px_rgba(232,93,59,0.08)]">
                  <p className="text-[15px] text-[#4A3B36] font-medium">
                    No active projects yet. Describe what you are building in Peachy™ above to generate a live project plan and match with vetted creatives.
                  </p>
                </div>
              )}
            </section>

            {/* Subtle Peach Project Protection Accordion */}
            <details className="bg-white border border-[#F7DFD0] rounded-3xl p-5 shadow-[0_12px_32px_rgba(232,93,59,0.08)] group cursor-pointer">
              <summary className="font-extrabold text-base text-[#231714] flex items-center justify-between list-none gap-3">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-[18px] h-[18px] text-[#FF5E3A]" strokeWidth={1.5} />
                  <span>Peach Project Protection &middot; Review Proofs Before Sign-Off</span>
                </span>
                <ChevronDown
                  className="w-4 h-4 text-[#4A3B36] group-open:rotate-180 transition-transform shrink-0"
                  strokeWidth={1.5}
                />
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-[#4A3B36] border-t border-[#F7DFD0] pt-3">
                Every project follows fixed coin pricing and 3 included revision rounds. Coins Reserved for Active
                Projects stay protected while you review proofs before final sign-off, and you receive 100% ownership
                transfer upon completion.
              </p>
            </details>
          </main>

          {/* RIGHT COLUMN (300px Desktop Rail) */}
          <aside className="w-full xl:w-[300px] shrink-0 space-y-5">
            {/* 1. Business Profile Card */}
            <section className="bg-white border border-[#F7DFD0] rounded-3xl p-5 shadow-[0_12px_32px_rgba(232,93,59,0.08)] space-y-3">
              <div className="flex items-center gap-3.5">
                {business.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="w-12 h-12 rounded-2xl object-contain bg-[#FFF6EE] border border-[#F7DFD0] p-1 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#231714] text-white flex items-center justify-center font-extrabold text-lg shrink-0">
                    {(business.name?.[0] || "P").toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-extrabold text-[#231714] truncate">
                    {business.name}
                  </h2>
                  <p className="text-[14px] text-[#4A3B36] truncate">
                    {business.industry || "Commercial & Creative"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#231714] bg-[#FFD8BE] px-2.5 py-0.5 rounded-full mt-1">
                    <MapPin className="w-3 h-3 text-[#FF5E3A]" strokeWidth={1.75} />
                    <span>{businessHub}</span>
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#F7DFD0] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4A3B36] truncate">
                  {membership?.plan_name ? `${membership.plan_name} Member` : "Standard Partner"}
                </span>
                <Link
                  href="/business/account"
                  className="font-bold text-[#FF5E3A] hover:text-[#231714] shrink-0"
                >
                  Edit Profile
                </Link>
              </div>
            </section>

            {/* 2. Brand Readiness Card (0%-100%) */}
            <BrandReadinessCard readiness={brandReadiness} />

            {/* 3. Peach Coins Wallet Card */}
            <section className="bg-white border border-[#F7DFD0] rounded-3xl p-5 shadow-[0_12px_32px_rgba(232,93,59,0.08)] space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Wallet className="w-[18px] h-[18px] text-[#FF5E3A]" strokeWidth={1.5} />
                  <h2 className="text-base font-extrabold text-[#231714]">Peach Wallet</h2>
                </div>
                <span className="text-xs font-bold text-[#4A3B36]">1 Coin = $50</span>
              </div>

              <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-4">
                <div className="text-2xl font-extrabold text-[#231714] tabular-nums">
                  {coins}{" "}
                  <span className="text-sm font-bold text-[#4A3B36]">Peach Coins</span>
                </div>
                <p className="text-[13px] text-[#4A3B36] mt-1 tabular-nums">
                  {heldCoins} Coins Reserved for Active Projects
                </p>
              </div>

              <Link
                href="/business/wallet"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-bold text-white bg-[#231714] hover:bg-[#3A2722] rounded-2xl transition-colors"
              >
                <span>Top Up / Buy Coins</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </Link>
            </section>

            {/* 4. Collapsible Brand Vault & Recent Messages */}
            <CollapsibleRailCards
              brandAssetCount={brandAssets?.length ?? 0}
              recentMessages={formattedMessages}
            />
          </aside>
        </div>
      </div>
    </PeachAppShell>
  );
}
