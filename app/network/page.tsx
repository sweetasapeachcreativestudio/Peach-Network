import Link from "next/link";
import { cookies } from "next/headers";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isRealSupabaseEnv } from "@/lib/supabase/admin";
import { PeachBrand } from "../components/brand";
import { PeachAppShell } from "../components/peach-app-shell";

export const dynamic = "force-dynamic";

const events = [
  {
    month: "SEP",
    day: "20",
    title: "Peach Creative Mixer",
    type: "Community",
    text: "A night for creatives, founders and local businesses to meet, talk and make connections.",
  },
  {
    month: "OCT",
    day: "05",
    title: "Portfolio Power Hour",
    type: "Peach Academy",
    text: "A practical session for creatives who want stronger portfolios and clearer positioning.",
  },
  {
    month: "OCT",
    day: "18",
    title: "Business + Creative Workshop",
    type: "Workshop",
    text: "Learn how to brief creative work, manage revisions and build healthier collaborations.",
  },
];

const news = [
  {
    title: "Peach Match AI is in beta",
    text: "Businesses can describe a project in plain language and Peach helps shape the brief before matching.",
  },
  {
    title: "Creative applications are open",
    text: "Peach is reviewing new creatives by specialty, portfolio readiness and availability.",
  },
  {
    title: "Peach Academy is growing",
    text: "New learning sessions, mentor touchpoints and portfolio-building resources are being added.",
  },
];

export default async function NetworkPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const content = (
    <div className="space-y-6">
      <section className="pn-network-hero">
        <div>
          <span className="eyebrow">AROUND THE NETWORK</span>
          <h1>Where Peach comes alive.</h1>
          <p>
            Events, workshops, creative spotlights, opportunities and the news that keeps the Network
            connected.
          </p>
        </div>
        <div className="pn-network-hero-photo">
          <img src="/brand/login-creative.jpg" alt="Creative community member" />
          <span>Good people create great things.</span>
        </div>
      </section>

      <section className="pn-network-grid">
        <div>
          <div className="pn-section-title compact">
            <span className="eyebrow">UPCOMING EVENTS</span>
            <h2>Come meet your people.</h2>
          </div>
          <div className="pn-event-list">
            {events.map((e) => (
              <article key={e.title}>
                <div className="pn-date-card">
                  <span>{e.month}</span>
                  <strong>{e.day}</strong>
                </div>
                <div>
                  <small>{e.type}</small>
                  <h3>{e.title}</h3>
                  <p>{e.text}</p>
                  <Link href="/business/peach-business" className="text-link">
                    View Network events →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className="pn-section-title compact">
            <span className="eyebrow">PEACH PULSE</span>
            <h2>Network news.</h2>
          </div>
          <div className="pn-news-list">
            {news.map((n) => (
              <article key={n.title}>
                <span className="inline-flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#FF5E3A]" strokeWidth={1.75} />
                </span>
                <div>
                  <h3>{n.title}</h3>
                  <p>{n.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  if (!user) {
    return (
      <main className="pn-network-page">
        <header className="pn-public-header">
          <PeachBrand full />
          <Link href="/auth?mode=signin" className="btn btn-dark btn-small">
            Sign In
          </Link>
        </header>
        {content}
      </main>
    );
  }

  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("peach_role")?.value;
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name,role")
    .eq("id", user.id)
    .maybeSingle();

  const preferCreativePreview = !isRealSupabaseEnv() && roleCookie === "creative";
  const shellRole: "business" | "creative" =
    profile?.role === "creative" || preferCreativePreview ? "creative" : "business";

  let businessInfo: { name?: string | null; logo_url?: string | null; coins?: number } = {};
  if (shellRole === "business") {
    const { data: b } = await admin
      .from("businesses")
      .select("id,name,logo_url")
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (b) {
      const { data: w } = await admin
        .from("coin_wallets")
        .select("available_coins")
        .eq("business_id", b.id)
        .maybeSingle();
      businessInfo = {
        name: b.name,
        logo_url: b.logo_url,
        coins: w?.available_coins ?? 0,
      };
    }
  }

  return (
    <PeachAppShell
      role={shellRole}
      active={shellRole === "creative" ? "social" : "home"}
      name={profile?.full_name}
      businessName={shellRole === "business" ? businessInfo.name : undefined}
      logoUrl={shellRole === "business" ? businessInfo.logo_url : undefined}
      coinCount={shellRole === "business" ? businessInfo.coins ?? 0 : undefined}
    >
      {content}
    </PeachAppShell>
  );
}
