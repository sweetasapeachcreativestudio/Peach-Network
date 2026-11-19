import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Award, CheckCircle2, Clock, FileCheck2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PeachAppShell } from "@/app/components/peach-app-shell";
import { VerifyStandardsButton } from "./verify-standards-button";

export const dynamic = "force-dynamic";

const standards = [
  {
    title: "Editable Source & Vector Delivery",
    detail:
      "Provide clean, organized source files (.AI, .SVG, .EPS, .FIG, or high-res RAW/WebP) with outlined fonts or documented font links upon final sign-off.",
    icon: FileCheck2,
  },
  {
    title: "Print-Ready 300 DPI & Color Fidelity",
    detail:
      "Every print deliverable must include 300 DPI resolution, 0.125 in bleed where applicable, and verified CMYK/HEX color specs matching the client Brand Vault.",
    icon: Award,
  },
  {
    title: "5-Hour Client Response Commitment",
    detail:
      "Respond to active project room messages during studio business hours within 5 hours so turnarounds stay predictable and calm.",
    icon: Clock,
  },
  {
    title: "Protected Proofs & 3-Revision Workflow",
    detail:
      "Upload watermarked or preview proofs inside the Project Room before final high-res file handoff. Track all 3 included revision rounds clearly in project notes.",
    icon: ShieldCheck,
  },
];

export default async function CreativeAcademyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=creative&mode=signin");

  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("peach_role")?.value;

  const admin = createAdminClient();
  const [{ data: profile }, { data: creative }] = await Promise.all([
    admin.from("profiles").select("full_name,role").eq("id", user.id).maybeSingle(),
    admin
      .from("creatives")
      .select("id,mentorship_notes,bio,stripe_connect_account_id,availability_text")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (profile?.role === "business" && roleCookie !== "creative") redirect("/business");

  const notesAndBio = `${creative?.mentorship_notes || ""} ${creative?.bio || ""}`;
  const isVerified = /(deliverable standards verified|peach academy standards|standards verified)/i.test(
    notesAndBio
  );

  return (
    <PeachAppShell role="creative" active="academy" name={profile?.full_name}>
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/creative"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#4A3B36] hover:text-[#231714] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>Back to Creative Hub</span>
          </Link>

          <span className="text-xs font-extrabold uppercase tracking-wider bg-[#FFD8BE] text-[#231714] px-3 py-1 rounded-full">
            Peach Academy &amp; Standards
          </span>
        </header>

        <section className="rounded-3xl p-6 sm:p-8 text-white shadow-[0_12px_32px_rgba(232,93,59,0.14)]" style={{ background: "linear-gradient(135deg, #FF7350 0%, #FFAE78 100%)" }}>
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
              <Award className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Commercial Quality Benchmarks</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Peach Network Deliverable Standards
            </h1>
            <p className="text-[15px] text-white/95 leading-relaxed font-medium">
              Review and verify our 4 studio deliverable commitments to unlock 100% Business Readiness and appear in Peachy™ commercial matches.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {standards.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="bg-white border border-[#F7DFD0] rounded-3xl p-5 shadow-[0_12px_32px_rgba(232,93,59,0.08)] space-y-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#FFF6EE] border border-[#F7DFD0] flex items-center justify-center text-[#FF5E3A] shrink-0">
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-base font-extrabold text-[#231714]">{item.title}</h2>
                </div>
                <p className="text-[15px] text-[#4A3B36] leading-relaxed">{item.detail}</p>
              </article>
            );
          })}
        </section>

        <section className="bg-white border border-[#F7DFD0] rounded-3xl p-6 shadow-[0_12px_32px_rgba(232,93,59,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#FF5E3A]" strokeWidth={1.5} />
              <h3 className="text-base font-extrabold text-[#231714]">
                Confirm Commercial Standards Pledge
              </h3>
            </div>
            <p className="text-sm text-[#4A3B36]">
              Confirming marks Deliverable Standards Verified on your Creative Readiness scorecard.
            </p>
          </div>

          <VerifyStandardsButton alreadyVerified={isVerified} />
        </section>
      </div>
    </PeachAppShell>
  );
}
