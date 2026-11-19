import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Bell, CheckCircle2, FolderKanban, Sparkles, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isRealSupabaseEnv } from "@/lib/supabase/admin";
import { PeachAppShell } from "../components/peach-app-shell";
import { PhoneAlertsCard } from "../components/phone-alerts-card";
import { PhoneAlertsBanner } from "../components/phone-alerts-banner";

export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=signin");

  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("peach_role")?.value;

  const params = searchParams ? await searchParams : {};
  const activeFilter = params.filter || "all";

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name,role,phone")
    .eq("id", user.id)
    .maybeSingle();

  const preferCreativePreview = !isRealSupabaseEnv() && roleCookie === "creative";
  const role = profile?.role === "creative" || preferCreativePreview ? "creative" : "business";
  let coins = 0;
  let businessInfo: { name?: string | null; logo_url?: string | null } = {};
  const alerts: any[] = [];

  try {
    if (role === "business") {
      const { data: b } = await admin
        .from("businesses")
        .select("id,name,logo_url")
        .eq("owner_user_id", user.id)
        .maybeSingle();
      if (b) {
        businessInfo = { name: b.name, logo_url: b.logo_url };
        const { data: w } = await admin
          .from("coin_wallets")
          .select("available_coins")
          .eq("business_id", b.id)
          .maybeSingle();
        coins = w?.available_coins ?? 0;
        const { data: ps } = await admin
          .from("projects")
          .select("id,title,status,due_at")
          .eq("business_id", b.id)
          .order("created_at", { ascending: false })
          .limit(12);
        for (const p of ps ?? []) {
          if (["proof_uploaded", "submitted"].includes(p.status))
            alerts.push({
              category: "projects",
              kind: "Project",
              title: "Proof ready for review",
              body: `${p.title} is ready for your eyes.`,
              href: `/projects/${p.id}`,
              time: "1h",
            });
          if (p.status === "matching")
            alerts.push({
              category: "projects",
              kind: "Peach Match",
              title: "New creative match underway",
              body: `Peach Match is working on ${p.title}.`,
              href: `/projects/${p.id}`,
              time: "2m",
            });
        }
      }
    } else {
      const { data: c } = await admin
        .from("creatives")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (c) {
        const { data: offers } = await admin
          .from("project_offers")
          .select("id")
          .eq("creative_id", c.id)
          .eq("status", "sent")
          .limit(10);
        if ((offers ?? []).length)
          alerts.push({
            category: "projects",
            kind: "Peach Match",
            title: `${offers!.length} new match${offers!.length === 1 ? "" : "es"} waiting`,
            body: "Open Matches to review the project and payout.",
            href: "/creative/offers",
            time: "Now",
          });
      }
    }
  } catch (e) {
    console.error("notification feed", e);
  }

  const baseFeed = alerts.length
    ? alerts
    : [
        {
          category: "network",
          kind: "Network",
          title: "Peach Network event",
          body: "Creative mixers, workshops and Network updates will appear here.",
          href: role === "business" ? "/business" : "/creative",
          time: "Today",
        },
        {
          category: "wallet",
          kind: "Wallet",
          title: "Wallet is ready",
          body:
            role === "business"
              ? `You currently have ${coins} Peach Coins available.`
              : "Payout and project updates will appear here.",
          href: role === "business" ? "/business/wallet" : "/creative/payouts",
          time: "1d",
        },
      ];

  const feed =
    activeFilter === "all"
      ? baseFeed
      : baseFeed.filter((item) => item.category === activeFilter);

  const filters = [
    { key: "all", label: "All" },
    { key: "projects", label: "Projects" },
    { key: "wallet", label: "Wallet" },
    { key: "network", label: "Network" },
  ];

  const renderFeedIcon = (kind: string) => {
    if (kind === "Peach Match") return <Sparkles className="w-4 h-4 text-[#FF5E3A]" strokeWidth={1.75} />;
    if (kind === "Project") return <FolderKanban className="w-4 h-4 text-[#FF5E3A]" strokeWidth={1.75} />;
    if (kind === "Wallet") return <Wallet className="w-4 h-4 text-[#FF5E3A]" strokeWidth={1.75} />;
    return <Bell className="w-4 h-4 text-[#FF5E3A]" strokeWidth={1.75} />;
  };

  return (
    <PeachAppShell
      role={role}
      active="notifications"
      name={profile?.full_name}
      businessName={role === "business" ? businessInfo.name : undefined}
      logoUrl={role === "business" ? businessInfo.logo_url : undefined}
      coinCount={role === "business" ? coins : undefined}
    >
      <div className="space-y-6">
        <PhoneAlertsBanner role={role} />

        <section className="bg-white border border-[#F7DFD0] rounded-3xl p-6 sm:p-7 shadow-[0_12px_32px_rgba(232,93,59,0.08)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF5E3A] block mb-1">
              NOTIFICATIONS &amp; SMS
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#231714] tracking-tight">
              Notifications &amp; SMS Settings.
            </h1>
            <p className="text-sm text-[#4A3B36] mt-1">
              Matches, messages, deadlines, wallet activity, and your text alert controls in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="#sms-settings"
              className="px-4 py-2.5 rounded-2xl bg-[#FF5E3A] hover:bg-[#EB4D29] text-white text-sm font-bold transition-colors"
            >
              Jump to SMS Settings
            </a>
            <Link
              href={role === "creative" ? "/account?edit=1&tab=sms#sms-settings" : "/business/account"}
              className="px-4 py-2.5 rounded-2xl bg-[#FFF6EE] hover:bg-[#FFD8BE] text-[#231714] border border-[#F7DFD0] text-sm font-bold transition-colors"
            >
              Account Profile
            </Link>
          </div>
        </section>

        {/* SMS Settings Menu surfaced clearly near top */}
        <div>
          <PhoneAlertsCard initialPhone={profile?.phone || ""} role={role} />
        </div>

        {/* Filter Pills with crisp contrast */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/notifications" : `/notifications?filter=${f.key}`}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-colors border ${
                activeFilter === f.key
                  ? "bg-[#FF5E3A] border-[#FF5E3A] text-white"
                  : "bg-white border-[#F7DFD0] text-[#231714] hover:bg-[#FFD8BE]"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <section className="pn-notification-feed">
          {feed.map((a: any, i: number) => (
            <Link href={a.href} key={`${a.kind}-${i}`}>
              <span className="w-10 h-10 rounded-2xl bg-[#FFF6EE] border border-[#F7DFD0] flex items-center justify-center shrink-0">
                {renderFeedIcon(a.kind)}
              </span>
              <div>
                <small>{a.kind}</small>
                <strong>{a.title}</strong>
                <p>{a.body}</p>
              </div>
              <time>{a.time}</time>
            </Link>
          ))}
          {feed.length === 0 && (
            <div className="p-6 text-sm text-[#4A3B36] font-semibold">
              No notifications in this category yet.
            </div>
          )}
        </section>

        <section className="bg-white border border-[#F7DFD0] rounded-3xl p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#FFD8BE] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#FF5E3A]" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#231714]">All caught up!</h2>
            <p className="text-sm text-[#4A3B36]">
              When nothing needs your attention, Peach keeps this screen calm.
            </p>
          </div>
        </section>
      </div>
    </PeachAppShell>
  );
}
