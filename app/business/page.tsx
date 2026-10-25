import { ProjectRefresh } from "@/app/components/project-refresh";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PeachAppShell } from "../components/peach-app-shell";
import { AcceptedProject } from "../components/accepted-project";
import { ProjectProgress } from "../components/project-progress";
import { EventAnnouncements } from "./components/event-announcements";
import { PeachMatchAIBox } from "./components/peach-match-ai-box";
import {
  Sparkles,
  Coins,
  ArrowRight,
  ShieldCheck,
  FolderArchive,
  Wallet,
  MessageSquare,
  Plus,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { cookies } from "next/headers";

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

function nextStep(status: string) {
  if (reviewStatuses.includes(status)) return "Review proof or respond to your creative in the room.";
  if (status === "matching" || status === "offer_sent") return "Peach is arranging your 3 creative matches.";
  if (status === "revisions") return "Your creative is implementing agreed revisions.";
  return "Open the project room for the latest proofs and deliverables.";
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
  const { data: { user } } = await supabase.auth.getUser();
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
          full_name: user.user_metadata?.full_name || (user.email ? user.email.split("@")[0] : "Peach Partner"),
          role: "business",
        })
        .select("full_name,role,avatar_url")
        .maybeSingle();
      if (newProf) profile = newProf;
    } catch {}
  }

  let { data: business } = await admin
    .from("businesses")
    .select("id,name,industry,logo_url")
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
        .select("id,name,industry,logo_url")
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
      name: user.user_metadata?.business_name || (profile?.full_name ? `${profile.full_name}'s Business` : "My Business"),
      industry: "Commercial & Creative",
      logo_url: "/brand/peach-app-logo.png",
    };
  }

  const [{ data: wallet }, { data: projects }, { data: brandAssets }] = await Promise.all([
    admin.from("coin_wallets").select("available_coins,held_coins").eq("business_id", business.id).maybeSingle(),
    admin
      .from("projects")
      .select("id,title,description,category,status,coin_amount,due_at,created_at,assigned_creative_id,revision_rounds")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),
    admin.from("business_brand_assets").select("id,kind,label,value,original_name").eq("business_id", business.id),
  ]);

  const active = ((projects ?? []) as any[]).filter((p: any) => !["completed", "cancelled"].includes(p.status));
  const accepted = active.find((p: any) => p.status === "accepted");
  const attention = active.find((p: any) => reviewStatuses.includes(p.status));
  const lead = attention ?? active[0];
  const first = profile?.full_name?.trim().split(" ")[0] || business.name;
  const coins = wallet?.available_coins ?? 0;

  const creativeIds = [...new Set(active.map((p: any) => p.assigned_creative_id).filter(Boolean))];
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
    creativeIds.length ? admin.from("creatives").select("id,user_id").in("id", creativeIds) : Promise.resolve({ data: [] }),
  ]);

  const peopleIds = [
    ...new Set([
      ...((creatives ?? []) as any[]).map((c: any) => c.user_id),
      ...((messages ?? []) as any[]).map((m: any) => m.sender_user_id),
    ].filter(Boolean)),
  ];

  const { data: people } = peopleIds.length
    ? await admin.from("profiles").select("id,full_name,avatar_url").in("id", peopleIds)
    : { data: [] };

  const peopleMap = new Map(((people ?? []) as any[]).map((p: any) => [p.id, p]));
  const creativeMap = new Map(((creatives ?? []) as any[]).map((c: any) => [c.id, peopleMap.get(c.user_id)]));

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
        {/* Top Event & Opportunity Announcement Section */}
        <EventAnnouncements />

        {/* Dashboard Welcome Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/70">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#EB6244] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sweet As A Peach Creative Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 tracking-tight">
              Welcome back, {first}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 flex items-center gap-2 flex-wrap">
              <span>
                <strong className="text-stone-900 tabular-nums">{active.length}</strong> active collaboration{active.length === 1 ? "" : "s"}
              </span>
              <span className="text-stone-300 font-normal">·</span>
              <span>
                <strong className="text-stone-900 tabular-nums">{coins}</strong> Peach Coins available
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/business/projects"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-700 hover:text-stone-950 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-all shadow-2xs"
            >
              <span>View All Projects</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            </Link>
          </div>
        </header>

        {/* 1. PEACH MATCH AI CONTAINER (Direct on Dashboard for immediate access) */}
        <PeachMatchAIBox
          initialAvailableCoins={coins}
          businessName={business.name}
        />

        {/* Kickoff Banner if a project was just accepted */}
        {accepted && (
          <AcceptedProject
            project={accepted}
            creativeName={creativeMap.get(accepted.assigned_creative_id)?.full_name}
            assetCount={brandAssets?.length ?? 0}
          />
        )}

        {/* Two-Column Layout: Active Projects on Left, Side Dock on Right */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Main Column */}
          <main className="xl:col-span-8 space-y-5 min-w-0">
            {/* Attention Banner if an action is needed */}
            {lead && (
              <section
                className={`rounded-2xl border p-5 shadow-xs transition-all ${
                  attention
                    ? "bg-[#FFFDF7] border-amber-300/80 ring-1 ring-amber-100"
                    : "bg-white border-stone-200/90"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${
                        attention ? "text-amber-800" : "text-stone-700"
                      }`}
                    >
                      {attention ? "Action Needed" : "Active Focus"}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="font-semibold text-stone-600">{statusLabel(lead.status)}</span>
                  </div>
                  <span className="text-stone-500 font-medium">{dueText(lead.due_at)}</span>
                </div>

                <h2 className="text-lg font-extrabold text-stone-950 tracking-tight leading-snug">
                  {lead.title}
                </h2>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {lead.coin_amount} Peach Coins in escrow · {nextStep(lead.status)}
                </p>

                <div className="pt-3 flex items-center gap-2.5">
                  <Link
                    href={`/projects/${lead.id}`}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      attention
                        ? "bg-[#EB6244] hover:bg-[#d85538] text-white"
                        : "bg-[#173328] hover:bg-[#234b3c] text-white"
                    }`}
                  >
                    <span>{attention ? "Review Proof" : "Open Project Room"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/projects/${lead.id}#chat`}
                    className="px-3 py-2 text-stone-600 hover:text-stone-950 text-xs font-bold hover:bg-stone-100 rounded-xl transition-colors"
                  >
                    Message Creative
                  </Link>
                </div>
              </section>
            )}

            {/* Active Projects List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-stone-950 flex items-center gap-2">
                  <span>Current Collaborations</span>
                  <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full tabular-nums">
                    {active.length}
                  </span>
                </h2>
                <Link
                  href="/business/projects"
                  className="text-xs font-bold text-[#EB6244] hover:text-[#d85538] hover:underline"
                >
                  All Projects &amp; Archive →
                </Link>
              </div>

              {active.length > 0 ? (
                <div className="space-y-2.5">
                  {active.map((p: any) => {
                    const creative = creativeMap.get(p.assigned_creative_id);
                    const isReview = reviewStatuses.includes(p.status);

                    return (
                      <article
                        key={p.id}
                        className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-xs flex-wrap">
                              <span
                                className={`font-bold ${
                                  isReview ? "text-amber-800" : "text-stone-700"
                                }`}
                              >
                                {statusLabel(p.status)}
                              </span>
                              <span className="text-stone-300">·</span>
                              <span className="font-semibold text-stone-600">{p.category}</span>
                              <span className="text-stone-300">·</span>
                              <span className="text-stone-500 font-medium">{dueText(p.due_at)}</span>
                            </div>

                            <h3 className="text-sm sm:text-base font-extrabold text-stone-950 truncate">
                              <Link
                                href={`/projects/${p.id}`}
                                className="hover:text-[#EB6244] transition-colors"
                              >
                                {p.title}
                              </Link>
                            </h3>

                            <div className="flex items-center gap-3 text-xs text-stone-600 pt-0.5">
                              <span>
                                Creative:{" "}
                                <strong className="text-stone-900 font-bold">
                                  {creative?.full_name ? `✦ ${creative.full_name}` : "Finding match"}
                                </strong>
                              </span>
                              <span className="text-stone-300">·</span>
                              <span className="tabular-nums font-semibold text-stone-700">
                                {p.coin_amount} Coins
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <Link
                              href={`/projects/${p.id}#chat`}
                              className="px-2.5 py-1.5 text-xs font-bold text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-colors"
                            >
                              Chat
                            </Link>
                            <Link
                              href={`/projects/${p.id}`}
                              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                                isReview
                                  ? "bg-[#EB6244] hover:bg-[#d85538] text-white"
                                  : "bg-[#173328] hover:bg-[#234b3c] text-white"
                              }`}
                            >
                              <span>{isReview ? "Review Proof" : "Open Room"}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center space-y-2">
                  <p className="text-xs text-stone-500">
                    No active design requests right now. Use Peach Match AI above to start your next brief.
                  </p>
                </div>
              )}
            </div>

            {/* Escrow Guarantee Accordion */}
            <details className="border border-stone-200/90 bg-white rounded-2xl p-4 sm:p-5 text-xs text-stone-600 group cursor-pointer shadow-2xs">
              <summary className="font-bold text-stone-900 flex items-center justify-between list-none">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Peach Escrow &amp; Dispute Protection</span>
                </span>
                <span className="text-stone-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-stone-600 border-t border-stone-100 pt-3">
                All collaborations follow fixed scope and revision rounds. Peach Coins remain held in secure escrow
                until you approve the final delivery. If an issue ever arises, projects can be disputed directly to
                Peach admins for full refund, 50/50 split resolution, or reassignment of a new creative from our ecosystem.
              </p>
            </details>
          </main>

          {/* Side Dock: Wallet, Brand Vault, Messages */}
          <aside className="xl:col-span-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-5 min-w-0">
            {/* Wallet Panel */}
            <section className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#EB6244]" />
                  <span>Peach Wallet</span>
                </h2>
                <span className="text-[11px] font-semibold text-stone-500">1 Coin = $50 USD</span>
              </div>

              <div className="bg-[#fff8f4] border border-[#ffd1c2] rounded-xl p-4 text-[#c45439] mb-3.5">
                <div className="text-2xl font-extrabold text-stone-950 tabular-nums">
                  {coins} <span className="text-xs font-bold text-stone-600">Peach Coins available</span>
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

            {/* Brand Vault Panel */}
            <section className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-[#167b5c]" />
                  <span>Brand Vault</span>
                </h2>
                <span className="text-[11px] font-semibold text-emerald-700">
                  {brandAssets?.length ?? 0} saved
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-3">
                Your logos, vector marks, and color codes are automatically available to your assigned creative.
              </p>

              <Link
                href="/business/vault"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-[#EB6244] hover:text-[#d85538] hover:bg-orange-50 rounded-xl transition-colors"
              >
                <span>Open Brand Vault →</span>
              </Link>
            </section>

            {/* Project Messages Panel */}
            <section className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#173328]" />
                  <span>Recent Messages</span>
                </h2>
                <Link href="/business/messages" className="text-[11px] font-bold text-[#EB6244] hover:underline">
                  All →
                </Link>
              </div>

              {messages?.length ? (
                <div className="space-y-2.5">
                  {(messages as any[]).map((msg: any) => (
                    <Link
                      key={msg.id}
                      href={`/projects/${msg.project_id}#chat`}
                      className="block p-2 rounded-xl hover:bg-stone-50 border border-stone-100 transition-colors"
                    >
                      <strong className="text-xs text-stone-900 block truncate">
                        {peopleMap.get(msg.sender_user_id)?.full_name || "Project Member"}
                      </strong>
                      <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{msg.message}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500">
                  No active project messages. Messages will appear here once matching begins.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </PeachAppShell>
  );
}
