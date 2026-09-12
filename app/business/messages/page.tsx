import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppHeader, BottomNav } from "../../components/app-nav";
import { MessageIcon } from "../../components/icons";

export default async function BusinessMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=business&mode=signin");
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("full_name,role").eq("id", user.id).single();
  const { data: business } = await admin.from("businesses").select("id").eq("owner_user_id", user.id).maybeSingle();
  if (!business) redirect(profile?.role === "creative" ? "/creative/messages" : "/auth?role=business&mode=signup");
  const { data: wallet } = await admin.from("coin_wallets").select("available_coins").eq("business_id", business.id).maybeSingle();
  const { data: projects } = await admin.from("projects").select("id,title,status,assigned_creative_id,created_at").eq("business_id", business.id).order("created_at", { ascending:false });

  return <main className="app-shell">
    <AppHeader name={profile?.full_name} role="business" coinCount={wallet?.available_coins ?? 0}/>
    <div className="section-row"><div><span className="eyebrow">MESSAGES</span><h2>Your project conversations.</h2><p>Chat lives inside each project so scope, proofs and decisions stay together.</p></div></div>
    <section className="project-list">
      {(projects ?? []).filter((p:any)=>p.assigned_creative_id).map((p:any)=><Link href={`/projects/${p.id}#chat`} className="project-card" key={p.id}><div className="project-card-top"><div><h3>{p.title}</h3><p className="project-meta">Open the project chat and files.</p></div><span className="icon-shell"><MessageIcon/></span></div></Link>)}
      {(!projects || !projects.some((p:any)=>p.assigned_creative_id)) && <div className="empty-state"><span className="icon-shell" style={{margin:"0 auto 12px"}}><MessageIcon/></span><h2>No project chats yet.</h2><p className="muted">Chat opens after Peach matches a creative to your project.</p></div>}
    </section>
    <BottomNav role="business" active="messages" />
  </main>;
}
