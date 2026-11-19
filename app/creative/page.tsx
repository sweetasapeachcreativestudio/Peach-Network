import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  ArrowRight,
  Briefcase,
  Compass,
  DollarSign,
  FolderKanban,
  Globe,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeCreativeBusinessReadiness } from "@/lib/readiness";
import { formatCityHub } from "@/lib/hubs";
import { PeachAppShell } from "../components/peach-app-shell";
import { ProjectProgress } from "../components/project-progress";
import { PeachStudioAIBox } from "./components/peach-studio-ai-box";
import { CreativeReadinessCard } from "./components/creative-readiness-card";

function prettyLevel(level?: string | null) {
  if (!level) return "Peach Creative";
  return `Peach ${level[0].toUpperCase() + level.slice(1)}`;
}

export const dynamic = "force-dynamic";

export default async function CreativeDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=creative&mode=signin");

  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("peach_role")?.value;

  const admin = createAdminClient();
  let { data: profile } = await admin
    .from("profiles")
    .select("full_name,role,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "business" && roleCookie !== "creative") {
    redirect("/business");
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
            (user.email ? user.email.split("@")[0] : "Peach Creative"),
          role: "creative",
        })
        .select("full_name,role,avatar_url")
        .maybeSingle();
      if (newProf) profile = newProf;
    } catch {}
  }

  const creativeCols =
    "id,peach_level,application_status,primary_specialty,industries,availability_text,available_for_projects,stripe_connect_account_id,mentorship_notes,bio,portfolio_url,city,state,reliability_score,profile_image_url";

  let { data: creative } = await admin
    .from("creatives")
    .select(creativeCols)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!creative) {
    try {
      const { data: newCr } = await admin
        .from("creatives")
        .insert({
          user_id: user.id,
          application_status: "approved",
          peach_level: "seed",
          primary_specialty: "Graphic Design & Branding",
          city: "Birmingham",
          state: "AL",
        })
        .select(creativeCols)
        .maybeSingle();
      creative = newCr;
    } catch {}
  }

  if (!creative) {
    creative = {
      id: `cr_${user.id.slice(0, 8)}`,
      peach_level: "seed",
      application_status: "approved",
      primary_specialty: "Graphic Design & Branding",
      industries: [],
      availability_text: null,
      available_for_projects: true,
      stripe_connect_account_id: null,
      mentorship_notes: null,
      bio: null,
      portfolio_url: null,
      city: "Birmingham",
      state: "AL",
      reliability_score: 98,
      profile_image_url: profile?.avatar_url || "/Creative2.jpg",
    } as any;
  }

  const [{ data: offers }, { data: payouts }, { data: projects }, { data: featuredWork }] =
    await Promise.all([
      admin
        .from("project_offers")
        .select("id,payout_cents,expires_at,project_id,status,projects(title,category,due_at,revision_rounds)")
        .eq("creative_id", creative!.id)
        .in("status", ["sent", "countered"])
        .order("created_at", { ascending: false })
        .limit(4),
      admin
        .from("creative_payouts")
        .select("amount_cents,status")
        .eq("creative_id", creative!.id)
        .in("status", ["pending", "ready", "approved"]),
      admin
        .from("projects")
        .select("id,title,category,status,coin_amount,due_at,created_at")
        .eq("assigned_creative_id", creative!.id)
        .order("created_at", { ascending: false })
        .limit(4),
      admin
        .from("creative_featured_work")
        .select("id")
        .eq("creative_id", creative!.id),
    ]);

  const pending = (payouts ?? []).reduce((s: number, p: any) => s + (p.amount_cents ?? 0), 0);
  const active = (projects ?? []).filter(
    (p: any) => !["completed", "cancelled"].includes(p.status)
  );
  const first = profile?.full_name?.split(" ")?.[0] ?? "Creative";

  const readiness = computeCreativeBusinessReadiness(
    creative,
    (featuredWork ?? []).length
  );

  const notesAndBio = `${creative?.mentorship_notes || ""} ${creative?.bio || ""}`;
  const hasDeliverableStandards =
    /(deliverable standards verified|peach academy standards|standards verified)/i.test(
      notesAndBio
    );
  const hasPayoutAccount = Boolean(creative?.stripe_connect_account_id?.trim());

  return (
    <PeachAppShell
      role="creative"
      active="home"
      name={profile?.full_name}
      logoUrl={creative?.profile_image_url || profile?.avatar_url}
    >
      <div className="space-y-6">
        {/* Welcome Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF5E3A]">
                Creative Hub &middot; {prettyLevel(creative?.peach_level)}
              </span>
              <span className="text-xs font-bold bg-[#FFD8BE] text-[#231714] px-2.5 py-0.5 rounded-full">
                {formatCityHub(creative?.city, creative?.state)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#231714] tracking-tight mt-0.5">
              Welcome back, {first}
            </h1>
            <p className="text-[15px] text-[#4A3B36] mt-1">
              Private Peach Matches, clear project scope, visible payout, and one calm workspace.
            </p>
          </div>

          <Link
            href="/creative/offers"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF5E3A] hover:bg-[#E84D2B] text-white text-sm font-bold transition-colors shrink-0"
          >
            <span>View Opportunities</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </Link>
        </header>

        {/* 2-Column Workspace + Business Readiness Right Rail */}
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* MAIN LEFT/CENTER COLUMN */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {/* Hero Highlight Card */}
            <section
              className="rounded-3xl p-6 sm:p-8 text-white shadow-[0_12px_32px_rgba(232,93,59,0.14)] flex flex-col md:flex-row items-center gap-6"
              style={{ background: "linear-gradient(135deg, #FF7350 0%, #FFAE78 100%)" }}
            >
              <div className="flex-1 space-y-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Peach Match Shortlists</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  A shortlist, not a bidding war.
                </h2>
                <p className="text-[15px] text-white/95 leading-relaxed font-medium">
                  Peachy™ routes commercial briefs matched to your specialty, portfolio samples, and availability. Scope and payout are visible before you accept.
                </p>
                <div className="pt-1 flex flex-wrap gap-2.5">
                  <Link
                    href="/creative/offers"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-[#FFF6EE] text-[#231714] text-sm font-extrabold transition-colors"
                  >
                    <span>Review Matches</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                  </Link>
                  <Link
                    href="/creative/profile"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#231714]/90 hover:bg-[#231714] text-white text-sm font-bold transition-colors"
                  >
                    <span>Manage Portfolio</span>
                  </Link>
                </div>
              </div>

              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-2 border-white/60 bg-white/20 shrink-0 relative">
                <img
                  src={creative?.profile_image_url || profile?.avatar_url || "/brand/login-creative.jpg"}
                  alt={profile?.full_name || "Creative professional"}
                  className="w-full h-full object-cover"
                />
              </div>
            </section>

            {/* 4 Clean Stat Cards (Thin Lucide Icons, Zero Emojis) */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <Link
                href="/creative/offers"
                className="bg-white border border-[#F7DFD0] hover:border-[#FF5E3A] rounded-3xl p-4 shadow-[0_12px_32px_rgba(232,93,59,0.08)] transition-colors space-y-1.5"
              >
                <Compass className="w-5 h-5 text-[#FF5E3A]" strokeWidth={1.5} />
                <div className="text-2xl font-extrabold text-[#231714] tabular-nums">
                  {offers?.length ?? 0}
                </div>
                <div className="text-xs font-bold text-[#4A3B36]">Private Matches</div>
              </Link>

              <Link
                href="/creative/projects"
                className="bg-white border border-[#F7DFD0] hover:border-[#FF5E3A] rounded-3xl p-4 shadow-[0_12px_32px_rgba(232,93,59,0.08)] transition-colors space-y-1.5"
              >
                <FolderKanban className="w-5 h-5 text-[#FF5E3A]" strokeWidth={1.5} />
                <div className="text-2xl font-extrabold text-[#231714] tabular-nums">
                  {active.length}
                </div>
                <div className="text-xs font-bold text-[#4A3B36]">Active Projects</div>
              </Link>

              <Link
                href="/creative/payouts"
                className="bg-white border border-[#F7DFD0] hover:border-[#FF5E3A] rounded-3xl p-4 shadow-[0_12px_32px_rgba(232,93,59,0.08)] transition-colors space-y-1.5"
              >
                <DollarSign className="w-5 h-5 text-[#FF5E3A]" strokeWidth={1.5} />
                <div className="text-2xl font-extrabold text-[#231714] tabular-nums">
                  ${(pending / 100).toFixed(0)}
                </div>
                <div className="text-xs font-bold text-[#4A3B36]">Pending Payouts</div>
              </Link>

              <Link
                href="/network"
                className="bg-white border border-[#F7DFD0] hover:border-[#FF5E3A] rounded-3xl p-4 shadow-[0_12px_32px_rgba(232,93,59,0.08)] transition-colors space-y-1.5"
              >
                <Globe className="w-5 h-5 text-[#FF5E3A]" strokeWidth={1.5} />
                <div className="text-2xl font-extrabold text-[#231714]">Events</div>
                <div className="text-xs font-bold text-[#4A3B36]">Peach Social</div>
              </Link>
            </section>

            {/* Matched Opportunities */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#231714]">Matched Opportunities</h2>
                <Link
                  href="/creative/offers"
                  className="text-sm font-bold text-[#FF5E3A] hover:text-[#231714] inline-flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              </div>

              {offers && offers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {offers.slice(0, 2).map((o: any) => (
                    <article
                      key={o.id}
                      className="bg-white border border-[#F7DFD0] rounded-3xl p-5 shadow-[0_12px_32px_rgba(232,93,59,0.08)] space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider bg-[#FFD8BE] text-[#231714] px-2.5 py-0.5 rounded-full">
                          Private Match
                        </span>
                        <strong className="text-base font-extrabold text-[#FF5E3A] tabular-nums">
                          ${(o.payout_cents / 100).toFixed(0)}
                        </strong>
                      </div>
                      <h3 className="text-base font-extrabold text-[#231714] truncate">
                        {o.projects?.title ?? "Creative Opportunity"}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#4A3B36]">
                        {o.projects?.category ?? "Creative"}
                        {o.projects?.due_at
                          ? ` · Due ${new Date(o.projects.due_at).toLocaleDateString()}`
                          : ""}
                      </p>
                      <Link
                        href="/creative/offers"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#231714] hover:bg-[#3A2722] text-white text-xs font-bold transition-colors"
                      >
                        <span>Review Match</span>
                        <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </Link>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#F7DFD0] rounded-3xl p-6 shadow-[0_12px_32px_rgba(232,93,59,0.08)] flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFF6EE] border border-[#F7DFD0] flex items-center justify-center text-[#FF5E3A] shrink-0">
                    <Briefcase className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#231714]">
                      No open invitations right now
                    </h3>
                    <p className="text-sm text-[#4A3B36] mt-0.5">
                      {readiness.isEligibleForMatching
                        ? "Your profile is eligible—your next private Peachy™ match will appear here."
                        : "Reach 100% Business Readiness on the right to start receiving Peachy™ invitations."}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Active Projects */}
            {active.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#231714]">Active Work</h2>
                  <Link
                    href="/creative/projects"
                    className="text-sm font-bold text-[#FF5E3A] hover:text-[#231714] inline-flex items-center gap-1"
                  >
                    <span>All projects</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </Link>
                </div>

                <div className="space-y-3">
                  {active.slice(0, 2).map((p: any) => (
                    <article
                      key={p.id}
                      className="bg-white border border-[#F7DFD0] rounded-3xl p-5 shadow-[0_12px_32px_rgba(232,93,59,0.08)] space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#4A3B36]">{p.category}</span>
                        <span className="text-xs font-bold bg-[#FFD8BE] text-[#231714] px-2.5 py-0.5 rounded-full">
                          {p.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-[#231714] truncate">{p.title}</h3>
                      <ProjectProgress status={p.status} compact />
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <span className="text-xs text-[#4A3B36]">
                          {p.due_at
                            ? `Due ${new Date(p.due_at).toLocaleDateString()}`
                            : "Flexible deadline"}
                        </span>
                        <Link
                          href={`/projects/${p.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#FF5E3A] hover:bg-[#E84D2B] text-white text-xs font-bold transition-colors"
                        >
                          <span>Open Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Creative Director Studio AI */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#231714]">
                  Studio Design Advisor &amp; Software Tips
                </h2>
                <Link
                  href="/creative/studio-ai"
                  className="text-sm font-bold text-[#FF5E3A] hover:text-[#231714] inline-flex items-center gap-1"
                >
                  <span>Full Studio AI</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              </div>
              <PeachStudioAIBox />
            </section>
          </main>

          {/* RIGHT RAIL: Creative Business Readiness (0%-100%) */}
          <aside className="w-full xl:w-[320px] shrink-0 space-y-5">
            <CreativeReadinessCard
              readiness={readiness}
              hasPayoutAccount={hasPayoutAccount}
              hasDeliverableStandards={hasDeliverableStandards}
              applicationStatus={creative?.application_status}
            />
          </aside>
        </div>
      </div>
    </PeachAppShell>
  );
}
