import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCollaboratorProjectIdsForCreative } from "@/lib/collaborators";
import { PeachAppShell } from "@/app/components/peach-app-shell";
import { ProjectRefresh } from "@/app/components/project-refresh";
import OfferActions from "./offer-actions";
import { ArrowRight, Calendar, Clock, FileSignature, Layers, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CreativeOffersPage() {
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
    redirect("/business");
  }

  const { data: creative } = await admin
    .from("creatives")
    .select("id,application_status,peach_level,primary_specialty")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!creative) redirect("/creative/apply");
  if (creative.application_status !== "approved") redirect("/creative/status");

  const [{ data: offers }, collabProjectIds] = await Promise.all([
    admin
      .from("project_offers")
      .select(
        "id,status,payout_cents,counter_payout_cents,counter_reason,expires_at,project_id,projects(id,title,category,description,coin_amount,due_at,revision_rounds,status,assigned_creative_id)"
      )
      .eq("creative_id", creative.id)
      .in("status", ["sent", "countered"])
      .order("created_at", { ascending: false }),
    getCollaboratorProjectIdsForCreative(admin, creative.id, user.id),
  ]);

  return (
    <PeachAppShell role="creative" active="opportunities" name={profile?.full_name}>
      <ProjectRefresh />
      <div className="space-y-6 max-w-5xl mx-auto">
        <header className="pb-3 border-b border-stone-200">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#C84E2D] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Peach Match · Private Opportunities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 tracking-tight">
            Your Private Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            No public bidding pile. Review the Creative Brief &amp; Design Contract, then choose <strong>Sign &amp; Accept</strong> or <strong>Decline</strong>.
          </p>
        </header>

        <section className="space-y-4">
          {(offers ?? []).map((offer: any) => {
            const proj = offer.projects;
            const projId = proj?.id || offer.project_id;
            const isBriefDraft = proj?.status === "draft";
            const isOfferSent = proj?.status === "offer_sent";
            const isCollabInvite =
              collabProjectIds.includes(projId) && proj?.assigned_creative_id !== creative.id;

            return (
              <article
                key={offer.id}
                className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF5F0] text-[#C84E2D] border border-[#F2C2B2]">
                        {isCollabInvite ? "Collaborator Invite" : "Private Match"}
                      </span>
                      {isBriefDraft && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                          <Clock className="w-3 h-3" />
                          <span>Client Preparing Brief</span>
                        </span>
                      )}
                      {isOfferSent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          <FileSignature className="w-3 h-3" />
                          <span>Brief Ready for Signature</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-extrabold text-stone-950">
                      {proj?.title ?? "Creative Opportunity"}
                    </h2>
                    <p className="text-xs text-stone-600 font-semibold">
                      {proj?.category || "Design"} · {proj?.coin_amount || 0} Peach Coin
                      {proj?.coin_amount === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0 bg-[#F0FDF4] border border-emerald-200 px-4 py-2.5 rounded-xl">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                      Your Guaranteed Payout
                    </span>
                    <strong className="text-2xl font-black text-emerald-950 tabular-nums">
                      ${(offer.payout_cents / 100).toFixed(2)}
                    </strong>
                  </div>
                </div>

                {proj?.description && (
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 whitespace-pre-wrap bg-[#FAF8F5] border border-stone-200/70 rounded-xl p-3.5">
                    {proj.description}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-[#C84E2D] shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-stone-500 block">Deadline</span>
                      <strong className="text-stone-900">
                        {proj?.due_at ? new Date(proj.due_at).toLocaleDateString() : "Flexible"}
                      </strong>
                    </div>
                  </div>
                  <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-[#C84E2D] shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-stone-500 block">Revisions</span>
                      <strong className="text-stone-900">{proj?.revision_rounds ?? 3} rounds included</strong>
                    </div>
                  </div>
                  <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#C84E2D] shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-stone-500 block">Offer Expires</span>
                      <strong className="text-stone-900">
                        {offer.expires_at ? new Date(offer.expires_at).toLocaleDateString() : "72 hours"}
                      </strong>
                    </div>
                  </div>
                </div>

                {offer.status === "countered" ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 font-semibold">
                    Counter sent. You requested ${(offer.counter_payout_cents / 100).toFixed(2)}. Peach will keep this card updated.
                  </div>
                ) : (
                  <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {projId && (
                      <Link
                        href={`/projects/${projId}`}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#173328] hover:bg-[#204938] !text-white text-white text-xs font-black shadow-xs transition-colors"
                      >
                        <FileSignature className="w-3.5 h-3.5" />
                        <span>{isBriefDraft ? "Preview Draft Brief" : "Review Brief & Sign Contract"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    <OfferActions
                      offerId={offer.id}
                      projectId={projId}
                      payoutCents={offer.payout_cents}
                      briefDraft={isBriefDraft}
                    />
                  </div>
                )}
              </article>
            );
          })}

          {(!offers || offers.length === 0) && (
            <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-2">
              <h2 className="text-base font-extrabold text-stone-950">No open Peach Matches right now.</h2>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Your next matched opportunity will appear here with the Creative Brief, payout, deadline, and revision count before you decide.
              </p>
            </div>
          )}
        </section>
      </div>
    </PeachAppShell>
  );
}
