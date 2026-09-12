import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppHeader, BottomNav } from "../components/app-nav";
import { ArrowIcon, SparkIcon } from "../components/icons";
import { ProjectProgress } from "../components/project-progress";

function prettyLevel(level?: string | null) {
  if (!level) return "Peach Creative";
  return `Peach ${level[0].toUpperCase() + level.slice(1)}`;
}

export default async function CreativeDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=creative&mode=signin");

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("full_name,role").eq("id", user.id).single();
  if (profile?.role === "business") redirect("/business");
  if (profile?.role === "admin") redirect("/admin");

  const { data: creative } = await admin.from("creatives").select("id,peach_level,application_status,primary_specialty,city,state,reliability_score").eq("user_id", user.id).single();
  if (!creative) redirect("/creative/apply");
  if (creative.application_status !== "approved") redirect("/creative/status");

  const [{ data: offers }, { data: payouts }, { data: projects }] = await Promise.all([
    admin.from("project_offers").select("id,payout_cents,expires_at,project_id,status,projects(title,category,due_at,revision_rounds)").eq("creative_id", creative.id).in("status", ["sent","countered"]).order("created_at", { ascending:false }).limit(4),
    admin.from("creative_payouts").select("amount_cents,status").eq("creative_id", creative.id).in("status", ["pending","ready","approved"]),
    admin.from("projects").select("id,title,category,status,coin_amount,due_at,created_at").eq("assigned_creative_id", creative.id).order("created_at", { ascending:false }).limit(4),
  ]);

  const pendingPayout = (payouts ?? []).reduce((sum:number,p:any)=>sum+(p.amount_cents??0),0);
  const activeProjects = (projects ?? []).filter((p:any)=>!["completed","cancelled"].includes(p.status));
  const first = profile?.full_name?.split(" ")?.[0] ?? "Creative";

  return <main className="app-shell">
    <AppHeader name={profile?.full_name} role="creative" />

    <section className="app-hero">
      <div className="app-hero-main">
        <span className="eyebrow"><SparkIcon/> CREATIVE HOME</span>
        <h1>Your next opportunity can start here, {first}.</h1>
        <p>Private Peach Matches, clear scope, visible payout and one workspace for the whole project.</p>
        <Link href="/creative/offers" className="btn">See Peach Matches <ArrowIcon/></Link>
      </div>
      <div className="quick-panel">
        <span className="eyebrow">YOUR PEACH PROFILE</span>
        <div className="big">{prettyLevel(creative.peach_level)}</div>
        <p>{creative.primary_specialty ?? "Creative professional"}{creative.city ? ` · ${creative.city}${creative.state ? `, ${creative.state}` : ""}` : ""}</p>
        <div style={{height:10,background:"#eee6df",borderRadius:999,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,Number(creative.reliability_score ?? 100))}%`,background:"var(--peach-orange)"}}/></div>
        <small className="muted">Reliability standing · {Number(creative.reliability_score ?? 100).toFixed(0)}%</small>
      </div>
    </section>

    <section className="stat-row">
      <div className="stat-card"><small>OPEN MATCHES</small><strong>{offers?.length ?? 0}</strong><span>Private opportunities</span></div>
      <div className="stat-card"><small>ACTIVE PROJECTS</small><strong>{activeProjects.length}</strong><span>Work currently in motion</span></div>
      <div className="stat-card"><small>PENDING PAYOUT</small><strong>${(pendingPayout/100).toFixed(0)}</strong><span>Awaiting project completion</span></div>
    </section>

    <div className="section-row"><div><h2>Peach Matches</h2><p>Only opportunities selected for your profile.</p></div><Link href="/creative/offers" className="text-link">View all</Link></div>
    <section className="project-list">
      {(offers ?? []).slice(0,2).map((offer:any)=><article className="project-card" key={offer.id}><div className="project-card-top"><div><span className="eyebrow">PRIVATE MATCH</span><h3>{offer.projects?.title ?? "Creative Opportunity"}</h3><p className="project-meta">{offer.projects?.category ?? "Creative"}{offer.projects?.due_at?` · Due ${new Date(offer.projects.due_at).toLocaleDateString()}`:""}</p></div><strong style={{fontSize:26}}>${(offer.payout_cents/100).toFixed(0)}</strong></div><p className="muted">Payout shown before you accept. You can accept, counter or decline.</p><div className="project-actions"><Link href="/creative/offers" className="btn btn-primary btn-small">Review Match</Link></div></article>)}
      {(!offers || offers.length===0)&&<div className="empty-state"><div className="empty-mark"><i/><i/><i/></div><h2>No new matches right now.</h2><p className="muted">When a project fits your specialty and availability, Peach will send it privately.</p></div>}
    </section>

    <div className="section-row"><div><h2>Active work</h2><p>Keep deadlines, progress and messages in one place.</p></div><Link href="/creative/projects" className="text-link">View projects</Link></div>
    <section className="project-list">
      {activeProjects.slice(0,2).map((p:any)=><article className="project-card" key={p.id}><div className="project-card-top"><div><h3>{p.title}</h3><p className="project-meta">{p.category}{p.due_at?` · Due ${new Date(p.due_at).toLocaleDateString()}`:""}</p></div><span className={`status-label ${p.status}`}>{p.status.replaceAll("_"," ")}</span></div><ProjectProgress status={p.status} compact/><div className="project-actions"><Link className="btn btn-primary btn-small" href={`/projects/${p.id}`}>Open Workspace</Link></div></article>)}
    </section>

    <BottomNav role="creative" active="home" />
  </main>;
}
