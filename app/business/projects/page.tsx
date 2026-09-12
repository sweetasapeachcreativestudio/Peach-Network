import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppHeader, BottomNav } from "../../components/app-nav";
import { ProjectProgress, projectPercent } from "../../components/project-progress";

export default async function BusinessProjectsPage(){
 const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect("/auth?role=business&mode=signin");const admin=createAdminClient();
 const{data:profile}=await admin.from("profiles").select("full_name,role").eq("id",user.id).single();if(profile?.role!=="business"&&profile?.role!=="admin")redirect("/creative");
 const{data:business}=await admin.from("businesses").select("id").eq("owner_user_id",user.id).single();if(!business)redirect("/auth?role=business&mode=signup");
 const[{data:wallet},{data:projects}]=await Promise.all([admin.from("coin_wallets").select("available_coins").eq("business_id",business.id).maybeSingle(),admin.from("projects").select("id,title,category,status,coin_amount,due_at,created_at,assigned_creative_id").eq("business_id",business.id).order("created_at",{ascending:false})]);
 const list=projects??[];const active=list.filter((p:any)=>!["completed","cancelled"].includes(p.status));const matching=list.filter((p:any)=>["matching","offer_sent"].includes(p.status));const completed=list.filter((p:any)=>p.status==="completed");
 return <main className="app-shell pn-app-shell"><AppHeader name={profile?.full_name} role="business" coinCount={wallet?.available_coins??0}/>
  <section className="pn-page-head"><div><span className="eyebrow">PROJECTS</span><h1>Projects.</h1><p>Every brief, creative, milestone and proof in one place.</p></div><Link href="/business/new-project" className="btn btn-primary">+ New Project</Link></section>
  <div className="pn-filter-row"><span className="active">All ({list.length})</span><span>Active ({active.length})</span><span>Matching ({matching.length})</span><span>Completed ({completed.length})</span></div>
  <section className="pn-project-card-list">
   {list.map((p:any)=><article className="pn-project-card-new" key={p.id}><div className="pn-card-person"><img src={p.assigned_creative_id?"/brand/hero-creative.jpg":"/icons/peach-192.png"} alt=""/></div><div className="pn-card-project-main"><div className="pn-project-topline"><div><small>{p.category}</small><h3>{p.title}</h3></div><span className={`status-label ${p.status}`}>{p.status.replaceAll("_"," ")}</span></div><p>{p.assigned_creative_id?"Creative matched":"Peach Match is reviewing fit"} · {p.coin_amount} coins{p.due_at?` · Due ${new Date(p.due_at).toLocaleDateString()}`:""}</p><ProjectProgress status={p.status} compact/><div className="pn-card-project-bottom"><span>{projectPercent(p.status)}% journey</span><Link href={`/projects/${p.id}`} className="btn btn-primary btn-small">Open Project</Link></div></div></article>)}
   {!list.length&&<div className="pn-friendly-empty"><span>🍑</span><div><h3>Your project space is ready.</h3><p>Start with the idea. Peach will help shape the rest.</p><Link href="/business/new-project" className="btn btn-primary btn-small">Start a Project</Link></div></div>}
  </section><BottomNav role="business" active="projects"/>
 </main>
}
