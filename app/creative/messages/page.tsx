import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PeachAppShell } from "@/app/components/peach-app-shell";
import { ProjectRefresh } from "@/app/components/project-refresh";
import { ArrowRight, Bell, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CreativeMessagesPage() {
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
    redirect("/business/messages");
  }

  const { data: creative } = await admin
    .from("creatives")
    .select("id,application_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!creative) redirect("/creative/apply");

  const [{ data: projects }, { data: notifications }] = await Promise.all([
    admin
      .from("projects")
      .select("id,business_id,title,category,status,created_at")
      .eq("assigned_creative_id", creative.id)
      .order("created_at", { ascending: false }),
    admin
      .from("notifications")
      .select("id,title,body,project_id,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const projectList = (projects ?? []) as any[];
  const businessIds = [...new Set(projectList.map((p) => p.business_id).filter(Boolean))];
  const { data: businesses } = businessIds.length
    ? await admin.from("businesses").select("id,name").in("id", businessIds)
    : { data: [] };

  const bizNames: Record<string, string> = {};
  for (const b of (businesses ?? []) as any[]) {
    if (b.id && b.name) bizNames[b.id] = b.name;
  }

  const latestMessageByProject: Record<string, { message: string; created_at: string }> = {};
  await Promise.all(
    projectList.map(async (p) => {
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
    <PeachAppShell role="creative" active="messages" name={profile?.full_name}>
      <ProjectRefresh />
      <div className="space-y-6 max-w-4xl mx-auto">
        <header className="pb-3 border-b border-stone-200">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#C84E2D] mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Creative Messages &amp; Alerts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 tracking-tight">
            Project Conversations
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Every match alert, brief update, and client conversation stays tied directly to its workspace.
          </p>
        </header>

        <section className="space-y-2.5">
          {projectList.length > 0 ? (
            projectList.map((p) => {
              const latest = latestMessageByProject[p.id];
              const clientName = bizNames[p.business_id] || "Peach Business Client";
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}#chat`}
                  className="flex items-start justify-between gap-4 bg-white border border-stone-200 hover:border-[#C84E2D] rounded-2xl p-4 transition-all shadow-2xs hover:shadow-xs"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-sm font-extrabold text-stone-950">{p.title}</strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {clientName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF5F0] text-[#C84E2D]">
                        {p.status === "offer_sent" ? "Sign Contract" : p.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {latest?.message || "Open the project workspace to view the brief and client thread."}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#173328] shrink-0">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              );
            })
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-2">
              <MessageSquare className="w-6 h-6 text-[#C84E2D] mx-auto" />
              <h2 className="text-base font-extrabold text-stone-950">No project chats yet.</h2>
              <p className="text-xs text-stone-600">
                Match alerts and chats appear here as soon as a business owner selects you for a project.
              </p>
            </div>
          )}
        </section>

        {notifications && notifications.length > 0 && (
          <section className="space-y-2.5 pt-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              <span>Recent Match Alerts</span>
            </h2>
            <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
              {notifications.map((n: any) => (
                <Link
                  key={n.id}
                  href={n.project_id ? `/projects/${n.project_id}` : "/creative/projects"}
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
