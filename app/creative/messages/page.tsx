import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppHeader, BottomNav } from "../../components/app-nav";
import { MessageIcon } from "../../components/icons";

export default async function CreativeMessagesPage(){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/auth?role=creative&mode=signin");
  const admin=createAdminClient();const {data:profile}=await admin.from("profiles").select("full_name,role").eq("id",user.id).single();if(profile?.role==="business")redirect("/business/messages");
  const {data:creative}=await admin.from("creatives").select("id,application_status").eq("user_id",user.id).single();if(!creative)redirect("/creative/apply");
  const {data:projects}=await admin.from("projects").select("id,title,status,created_at").eq("assigned_creative_id",creative.id).order("created_at",{ascending:false});
  return <main className="app-shell"><AppHeader name={profile?.full_name} role="creative"/><div className="section-row"><div><span className="eyebrow">MESSAGES</span><h2>Your project conversations.</h2><p>Every conversation stays tied to its project and timeline.</p></div></div><section className="project-list">{(projects??[]).map((p:any)=><Link href={`/projects/${p.id}#chat`} className="project-card" key={p.id}><div className="project-card-top"><div><h3>{p.title}</h3><p className="project-meta">Open the project chat.</p></div><span className="icon-shell"><MessageIcon/></span></div></Link>)}{(!projects||projects.length===0)&&<div className="empty-state"><span className="icon-shell" style={{margin:"0 auto 12px"}}><MessageIcon/></span><h2>No project chats yet.</h2><p className="muted">Chats appear here after you are assigned to a project.</p></div>}</section><BottomNav role="creative" active="messages"/></main>
}
