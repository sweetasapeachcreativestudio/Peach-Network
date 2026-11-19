import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PeachAppShell } from "@/app/components/peach-app-shell";
import { ProjectRefresh } from "@/app/components/project-refresh";
import { ArrowRight, Bell, MessageSquare, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BusinessMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=business&mode=signin");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name,role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: business } = await admin
    .from("businesses")
    .select("id,name,logo_url")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (!business) {
    redirect(profile?.role === "creative" ? "/creative/messages" : "/auth?role=business&mode=signup");
  }

  const [{ data: wallet }, { data: projects }, { data: notifications }] = await Promise.all([
    admin.from("coin_wallets").select("available_coins").eq("business_id", business.id).maybeSingle(),
    admin
      .from("projects")
      .select("id,title,status,assigned_creative_id,created_at,category")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),
    admin
      .from("notifications")
      .select("id,title,body,project_id,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const projectRows = (projects ?? []) as any[];
  const chats = projectRows.filter((p) => p.assigned_creative_id);

  const creativeIds = [...new Set(chats.map((p) => p.assigned_creative_id).filter(Boolean))];
  const { data: creatives } = creativeIds.length
    ? await admin.from("creatives").select("id,user_id,profile_image_url").in("id", creativeIds)
    : { data: [] };

  const userIds = ((creatives ?? []) as any[]).map((c) => c.user_id).filter(Boolean);
  const { data: people } = userIds.length
    ? await admin.from("profiles").select("id,full_name,avatar_url").in("id", userIds)
    : { data: [] };

  const creativeMap: Record<string, { name: string; avatar: string }> = {};
  for (const c of (creatives ?? []) as any[]) {
    const person = ((people ?? []) as any[]).find((p) => p.id === c.user_id);
    creativeMap[c.id] = {
      name: person?.full_name || "Assigned Creative",
      avatar: c.profile_image_url || person?.avatar_url || "/Creative2.jpg",
    };
  }

  const latestMessageByProject: Record<string, { message: string; created_at: string }> = {};
  await Promise.all(
    chats.map(async (p) => {
      const { data: msgs } = await admin
        .from("project_messages")
        .select("message,created_at")
        .eq("project_id", p.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (msgs && msgs.length > 0) {
        latestMessageByProject[p.id] = msgs[0];
      }
    })
  );

  return (
    <PeachAppShell
      role="business"
      active="messages"
      name={profile?.full_name}
      businessName={business.name}
      logoUrl={business.logo_url}
      coinCount={wallet?.available_coins ?? 0}
    >
      <ProjectRefresh />
      <div className="space-y-6 max-w-4xl mx-auto">
        <header className="pb-3 border-b border-stone-200">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#C84E2D] mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Project Inbox &amp; Alerts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 tracking-tight">
            Messages
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Project alerts, contract notifications, and creative threads stay attached to each workspace.
          </p>
        </header>

        <Link
          href="/business"
          className="flex items-center justify-between gap-4 bg-[#FFF9F6] border border-[#F2C2B2] hover:border-[#C84E2D] rounded-2xl p-4 transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src="/images/peachy-avatar.jpg"
              alt="Peachy AI"
              className="w-11 h-11 rounded-full object-cover border-2 border-[#C84E2D] shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <strong className="text-sm font-black text-stone-950">Peachy™ · Creative Director AI</strong>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#C84E2D] !text-white text-white">
                  Scope &amp; Match
                </span>
              </div>
              <p className="text-xs text-stone-600 truncate mt-0.5">
                Need another creative or scoped deliverable? Tell Peachy™ what you are building next.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#C84E2D] shrink-0" />
        </Link>

        <section className="space-y-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-500">
            Project Threads ({chats.length})
          </h2>

          {chats.length > 0 ? (
            <div className="space-y-2.5">
              {chats.map((p) => {
                const creativeInfo = creativeMap[p.assigned_creative_id] || {
                  name: "Assigned Creative",
                  avatar: "/Creative2.jpg",
                };
                const latest = latestMessageByProject[p.id];
                const previewText = latest?.message
                  ? latest.message
                  : `${p.title} · Status: ${p.status.replaceAll("_", " ")}`;
                const timestamp = latest?.created_at || p.created_at;

                return (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}#chat`}
                    className="flex items-start justify-between gap-4 bg-white border border-stone-200 hover:border-[#C84E2D] rounded-2xl p-4 transition-all shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <img
                        src={creativeInfo.avatar}
                        alt={creativeInfo.name}
                        className="w-11 h-11 rounded-full object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-sm font-extrabold text-stone-950">
                            {creativeInfo.name}
                          </strong>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                            {p.category}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF5F0] text-[#C84E2D]">
                            {p.status === "draft"
                              ? "Brief Setup"
                              : p.status === "offer_sent"
                              ? "Awaiting Signatures"
                              : p.status.replaceAll("_", " ")}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-stone-800">{p.title}</div>
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {previewText}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <div className="text-[11px] font-semibold text-stone-400">
                        {timestamp ? new Date(timestamp).toLocaleDateString() : "Now"}
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#173328]">
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-[#C84E2D] mx-auto" />
              <h3 className="text-base font-extrabold text-stone-950">No project conversations yet.</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Once you confirm a creative match, your welcome alert and project conversation thread appear right here.
              </p>
            </div>
          )}
        </section>

        {notifications && notifications.length > 0 && (
          <section className="space-y-2.5 pt-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              <span>Recent Project Alerts</span>
            </h2>
            <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
              {notifications.map((n: any) => (
                <Link
                  key={n.id}
                  href={n.project_id ? `/projects/${n.project_id}` : "/business/projects"}
                  className="block p-4 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-xs font-extrabold text-stone-950">{n.title}</strong>
                    <span className="text-[11px] text-stone-400">
                      {n.created_at ? new Date(n.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">{n.body}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </PeachAppShell>
  );
}
