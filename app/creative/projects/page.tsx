import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppHeader, BottomNav } from "../../components/app-nav";
import { ProjectProgress } from "../../components/project-progress";

export default async function CreativeProjectsPage(){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/auth?role=creative&mode=signin");
  const admin=createAdminClient();const {data:profile}=await admin.from("profiles").select("full_name,role").eq("id",user.id).single();if(profile?.role==="business")redirect("/business");
  const {data:creative}=await admin.from("creatives").select("id,application_status").eq("user_id",user.id).single();if(!creative)redirect("/creative/apply");if(creative.application_status!=="approved")redirect("/creative/status");
  const {data:projects}=await admin.from("projects").select("id,title,category,status,coin_amount,due_at,created_at").eq("assigned_creative_id",creative.id).order("created_at",{ascending:false});
  return <main className="app-shell"><AppHeader name={profile?.full_name} role="creative"/><div className="section-row"><div><span className="eyebrow">PROJECTS</span><h2>Your Peach work.</h2><p>Deadlines, chat, proofs and project progress all stay attached to the job.</p></div></div><section className="project-list">{(projects??[]).map((p:any)=><article className="project-card" key={p.id}><div className="project-card-top"><div><h3>{p.title}</h3><p className="project-meta">{p.category}{p.due_at?` · Due ${new Date(p.due_at).toLocaleDateString()}`:""}</p></div><span className={`status-label ${p.status}`}>{p.status.replaceAll("_"," ")}</span></div><ProjectProgress status={p.status} compact/><div className="project-actions"><Link className="btn btn-primary btn-small" href={`/projects/${p.id}`}>Open Workspace</Link></div></article>)}{(!projects||projects.length===0)&&<div className="empty-state"><h2>No assigned projects yet.</h2><p className="muted">Once you accept a Peach Match and it is assigned, the project workspace will appear here.</p></div>}</section><BottomNav role="creative" active="projects"/></main>
}
