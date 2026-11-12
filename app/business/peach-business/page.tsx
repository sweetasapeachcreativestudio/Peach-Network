import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PeachAppShell } from "@/app/components/peach-app-shell";
import { BusinessFeedbackForm } from "./feedback-form";
import {
  Sparkles,
  Calendar,
  Gift,
  Award,
  Users,
  Building2,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PeachBusinessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=business&mode=signin");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name,role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "creative") redirect("/creative");

  const { data: business } = await admin
    .from("businesses")
    .select("id,name,industry,logo_url")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  const { data: wallet } = business
    ? await admin
        .from("coin_wallets")
        .select("available_coins,held_coins")
        .eq("business_id", business.id)
        .maybeSingle()
    : { data: null };

  const coins = wallet?.available_coins ?? 0;
  const bizName = business?.name || "Peach Partner";

  return (
    <PeachAppShell
      role="business"
      active="peach_business"
      name={profile?.full_name}
      coinCount={coins}
      businessName={bizName}
      logoUrl={business?.logo_url}
    >
      <div className="space-y-8 max-w-5xl">
        {/* Page Header */}
        <header className="pb-4 border-b border-stone-200">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#C84E2D] mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Peach Network Ecosystem Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
            Peach Business
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Platform announcements, upcoming partner mixers, and special commercial coin opportunities for growing businesses on Peach.
          </p>
        </header>

        {/* SECTION 1: ANNOUNCEMENTS & SPECIALS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-stone-950 flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#C84E2D]" />
              <span>Announcements &amp; Specials</span>
            </h2>
            <span className="text-xs text-stone-500 font-semibold">Active Offers &amp; Updates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Special 1: 2026 Master Rates Rollout */}
            <div className="bg-gradient-to-br from-[#FFF9F6] to-white border border-[#F2C2B2] rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#C84E2D] px-2.5 py-0.5 rounded-full">
                  Network Release
                </span>
                <span className="text-xs text-stone-500 font-bold">November 2026</span>
              </div>
              <div>
                <h3 className="text-base font-black text-stone-950">
                  2026 Master Scoping Rates &amp; Dual Signatures Live
                </h3>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                  Our official 3-tier catalog is now standardized across the network (1 Peach Coin = $50 USD). Projects now feature transparent deliverables, 3 included revision rounds, and mutual digital sign-offs before work begins.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <Link
                  href="/business"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C84E2D] hover:underline"
                >
                  <span>Scope a Project in Peach Home</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Special 2: Founder Bundle Bonus */}
            <div className="bg-gradient-to-br from-[#F0FDF4] to-white border border-[#BBF7D0] rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Partner Special
                </span>
                <span className="text-xs font-bold text-emerald-700">Save up to $200</span>
              </div>
              <div>
                <h3 className="text-base font-black text-stone-950">
                  Spring Studio Bundle Bonus: +2 Bonus Coins
                </h3>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                  Top up 10 Peach Coins or more this month and receive 2 complimentary bonus coins ($100 USD value) applied directly to your Brand Vault for revisions or stock asset sourcing.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <Link
                  href="/business/wallet"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline"
                >
                  <span>View Wallet &amp; Coin Packs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Special 3: Creative Pod Supervision Included */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                  Agency Tier
                </span>
                <span className="text-xs text-stone-500 font-semibold">20+ Coins Projects</span>
              </div>
              <h3 className="text-sm font-black text-stone-950">
                Complimentary Creative Pod Supervision
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Large initiatives (such as Advanced Retail E-Commerce at 26 Coins or Full Brand Overhauls paired with Culinary Shoots) automatically include dedicated Art Director supervision and milestone staging at no extra charge.
              </p>
            </div>

            {/* Special 4: Shared Brand Vault Handoff */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                  Brand Vault Feature
                </span>
                <span className="text-xs text-stone-500 font-semibold">Auto-Sync</span>
              </div>
              <h3 className="text-sm font-black text-stone-950">
                100% Administrative Ownership Guarantee
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Upon project completion and milestone sign-off, all master vector source files (.AI, .EPS, .SVG, .PDF) and website staging links automatically back up directly into your business’s permanent Brand Vault.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: PEACH PARTNER BUSINESS EVENTS (COMING SOON) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-stone-950 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#173328]" />
              <span>Peach Partner Business Events</span>
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
              Coming Soon
            </span>
          </div>

          <div className="bg-gradient-to-br from-white to-[#FAF8F5] border-2 border-dashed border-stone-300 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="max-w-xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C84E2D] block mb-1">
                In-Person &amp; Virtual Mixers
              </span>
              <h3 className="text-xl font-black text-stone-950">
                Local Business Mixers &amp; Creative Spotlights
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                We are curating quarterly gatherings for founders, restaurateurs, and marketing directors to connect with top-tier commercial creators, view live brand transformations, and network over local food and drinks.
              </p>
            </div>

            {/* Upcoming Event Preview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#C84E2D]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Birmingham, AL</span>
                </div>
                <h4 className="text-xs font-black text-stone-900 leading-snug">
                  Hospitality &amp; Dining Creator Showcase
                </h4>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Culinary styling demos, menu engineering roundtables, and restaurant web conversion tips.
                </p>
                <div className="text-[10px] text-stone-400 font-semibold pt-1">
                  Target: Q1 2027
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#C84E2D]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Atlanta, GA</span>
                </div>
                <h4 className="text-xs font-black text-stone-900 leading-snug">
                  Retail &amp; Apparel Brand Mixer
                </h4>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Footwear and merchandise packaging teardowns with commercial vector identity designers.
                </p>
                <div className="text-[10px] text-stone-400 font-semibold pt-1">
                  Target: Q2 2027
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#C84E2D]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Virtual Hub</span>
                </div>
                <h4 className="text-xs font-black text-stone-900 leading-snug">
                  Founder Art Direction Q&amp;A
                </h4>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Live 45-minute scoping teardowns with agency creative directors answering live questions.
                </p>
                <div className="text-[10px] text-stone-400 font-semibold pt-1">
                  Target: Monthly Sessions
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-200/70 flex-wrap gap-2">
              <span>Invitations and priority RSVPs will be released directly through your business notifications.</span>
              <span className="font-bold text-[#173328]">Early Access Priority · Free for Peach Partners</span>
            </div>
          </div>
        </section>

        {/* SECTION 3: BUSINESS FEEDBACK & SUGGESTIONS */}
        <section id="feedback" className="space-y-4 scroll-mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-stone-950 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C84E2D]" />
              <span>Business Feedback &amp; Suggestions</span>
            </h2>
            <span className="text-xs text-stone-500 font-semibold">Direct Pipeline to Team</span>
          </div>

          <BusinessFeedbackForm businessName={bizName} />
        </section>
      </div>
    </PeachAppShell>
  );
}
