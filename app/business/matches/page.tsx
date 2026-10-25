import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import MatchActions from "./match-actions";
import { PeachAppShell } from "@/app/components/peach-app-shell";
import { Sparkles, Award, MapPin, CheckCircle2, Clock, AlertCircle, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project: projectId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=business&mode=signin");
  if (!projectId) redirect("/business");

  const admin = createAdminClient();
  const [{ data: profile }, { data: project }] = await Promise.all([
    admin.from("profiles").select("full_name,role").eq("id", user.id).single(),
    admin
      .from("projects")
      .select("id,title,description,category,coin_amount,due_at,business_id,status,assigned_creative_id")
      .eq("id", projectId)
      .single(),
  ]);

  if (profile?.role === "creative") redirect("/creative");
  if (!project) redirect("/business");

  const { data: business } = await admin
    .from("businesses")
    .select("id,name,logo_url,owner_user_id")
    .eq("id", project.business_id)
    .single();

  if (business?.owner_user_id !== user.id) redirect("/business");

  const { data: wallet } = await admin
    .from("coin_wallets")
    .select("available_coins")
    .eq("business_id", business.id)
    .maybeSingle();

  // Fetch shortlisted candidates
  const { data: rows } = await admin
    .from("project_match_shortlists")
    .select(
      "creative_id,match_score,match_reason,batch_number,status,creatives(id,user_id,primary_specialty,peach_level,bio,city,state,profile_image_url,portfolio_url,reliability_score)"
    )
    .eq("project_id", projectId)
    .order("batch_number", { ascending: false })
    .order("match_score", { ascending: false });

  // Strictly select the latest batch of 3 creatives
  const latestBatch = Math.max(0, ...(rows ?? []).map((x: any) => x.batch_number || 1));
  const rawMatches = (rows ?? []).filter((x: any) => x.batch_number === latestBatch);
  const matches = rawMatches.slice(0, 3);

  const uids = matches.map((x: any) => x.creatives?.user_id).filter(Boolean);
  const { data: names } = uids.length
    ? await admin.from("profiles").select("id,full_name,avatar_url").in("id", uids)
    : { data: [] };

  const nameMap = new Map((names ?? []).map((x: any) => [x.id, x.full_name]));
  const avatarMap = new Map((names ?? []).map((x: any) => [x.id, x.avatar_url]));
  const cids = matches.map((x: any) => x.creative_id);

  // Fetch latest portfolio piece for each creative
  const { data: works } = cids.length
    ? await admin
        .from("creative_featured_work")
        .select("creative_id,title,image_url,industry,tags,role_detail,created_at")
        .in("creative_id", cids)
        .order("created_at", { ascending: false })
    : { data: [] };

  // Fetch offer status
  const { data: offers } = await admin
    .from("project_offers")
    .select("creative_id,status,expires_at")
    .eq("project_id", projectId);

  const offerMap = new Map((offers ?? []).map((o: any) => [o.creative_id, o]));
  const hasDeclinedOffer = (offers ?? []).some((o: any) => o.status === "declined");

  return (
    <PeachAppShell
      role="business"
      active="projects"
      name={profile?.full_name}
      businessName={business.name}
      logoUrl={business.logo_url}
      coinCount={wallet?.available_coins ?? 0}
    >
      <div className="space-y-6">
        {/* Navigation & Header */}
        <header className="pb-3 border-b border-stone-200/80">
          <div className="flex items-center justify-between gap-3 mb-2">
            <Link
              href="/business"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-950 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            <span className="text-xs font-bold text-stone-500">
              Batch #{latestBatch} · Showing 3 vetted matches
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#EB6244] mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Peach Match AI · 3 Curated Creatives</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 tracking-tight">
            Matching for: {project.title}
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Peach Match AI analyzed bios, specialty experience, and recent commercial portfolios across our network.
            Select the creative you want to invite—they have 24 hours to accept.
          </p>
        </header>

        {/* Declined Offer Notice (if any) */}
        {hasDeclinedOffer && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-bold text-sm text-amber-900 block">
                A creative was unable to take this project.
              </strong>
              <p className="text-amber-800 leading-relaxed">
                No worries—creative schedules vary. You can select one of the other matches below, or click
                &ldquo;Show 3 New Creatives&rdquo; to review the next batch of vetted designers.
              </p>
            </div>
          </div>
        )}

        {/* The 3-Creative Match Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((m: any) => {
            const c = m.creatives || {};
            const creativeName = String(nameMap.get(c.user_id) || "Peach Creative");
            const avatarUrl = c.profile_image_url || avatarMap.get(c.user_id);
            const offer = offerMap.get(c.id) as { status: string; expires_at?: string } | undefined;
            const latestWork = (works ?? []).find((w: any) => w.creative_id === c.id);

            return (
              <article
                key={c.id || Math.random()}
                className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-all relative overflow-hidden"
              >
                {/* Match Score Ribbon */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 tabular-nums">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{m.match_score || 95}% Match</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{[c.city, c.state].filter(Boolean).join(", ") || "Birmingham, AL"}</span>
                  </span>
                </div>

                {/* Profile Header */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={creativeName}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#EB6244] font-extrabold flex items-center justify-center text-lg shrink-0">
                        {creativeName.slice(0, 1)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-extrabold text-stone-950 truncate">
                        {creativeName}
                      </h2>
                      <p className="text-xs text-stone-600 truncate font-medium">
                        {c.primary_specialty || "Commercial Designer"}
                      </p>
                    </div>
                  </div>

                  {/* Badges Strip */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px]">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      <Award className="w-3 h-3 text-amber-600" />
                      <span>Peach {c.peach_level || "Pro"}</span>
                    </span>
                    <span className="font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {c.reliability_score ?? 100}% On-Time
                    </span>
                    <span className="font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                      ✦ Vetted Studio
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed pt-1">
                    {c.bio || "Commercial graphic designer specializing in print, digital brand identity, and local retail rollouts."}
                  </p>

                  {/* Why Peach Picked Them */}
                  <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-xl p-2.5 text-xs space-y-0.5">
                    <strong className="text-[11px] font-bold text-stone-900 block">
                      Why Peach Match AI picked them:
                    </strong>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      {m.match_reason || "Exceptional specialty fit for your category and turnaround scope."}
                    </p>
                  </div>
                </div>

                {/* Latest Portfolio Piece */}
                {latestWork && (
                  <div className="border-t border-stone-100 pt-3 mb-3 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Latest Featured Work
                    </span>
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-2 flex items-center gap-2.5">
                      {latestWork.image_url ? (
                        <img
                          src={latestWork.image_url}
                          alt={latestWork.title}
                          className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-stone-200 text-stone-500 flex items-center justify-center text-xs font-bold shrink-0">
                          Work
                        </div>
                      )}
                      <div className="min-w-0 flex-1 text-xs">
                        <strong className="text-stone-900 font-bold block truncate">
                          {latestWork.title}
                        </strong>
                        <span className="text-[11px] text-stone-500 block truncate">
                          {[latestWork.industry, ...(latestWork.tags ?? [])].filter(Boolean).join(" · ") ||
                            "Commercial portfolio sample"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Area */}
                <div className="pt-2 border-t border-stone-100 mt-auto">
                  {offer ? (
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-center space-y-1">
                      {offer.status === "declined" ? (
                        <span className="font-bold text-amber-800 block">
                          Creative was unable to take this request.
                        </span>
                      ) : offer.status === "accepted" ? (
                        <span className="font-bold text-emerald-700 block">
                          ✓ Offer Accepted! Check your project room.
                        </span>
                      ) : (
                        <>
                          <div className="flex items-center justify-center gap-1.5 font-bold text-stone-900">
                            <Clock className="w-3.5 h-3.5 text-[#EB6244]" />
                            <span>Request Sent (24h Window)</span>
                          </div>
                          <span className="text-[11px] text-stone-500 block">
                            Waiting for creative confirmation.
                          </span>
                        </>
                      )}
                    </div>
                  ) : m.status === "candidate" ? (
                    <MatchActions projectId={projectId} creativeId={c.id} />
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>

        {/* Empty State */}
        {matches.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-3">
            <h3 className="text-base font-extrabold text-stone-950">
              No matching creatives found in this batch.
            </h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto">
              Our network has many commercial designers. Click below to load 3 candidates from our verified roster.
            </p>
          </div>
        )}

        {/* Global Batch Controls: Cancel Search & Show 3 New Creatives */}
        <MatchActions projectId={projectId} isBatchControl />
      </div>
    </PeachAppShell>
  );
}