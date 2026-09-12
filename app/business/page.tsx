import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppHeader, BottomNav } from "../components/app-nav";
import { ProjectProgress } from "../components/project-progress";

function dueText(dueAt:string|null){if(!dueAt)return"Deadline not set";const d=Math.ceil((new Date(dueAt).getTime()-Date.now())/86400000);if(d<0)return`${Math.abs(d)} days overdue`;if(d===0)return"Due today";return`Due in ${d} day${d===1?"":"s"}`}

export default async function BusinessDashboard(){
  const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect("/auth?role=business&mode=signin");
  const admin=createAdminClient();const{data:profile}=await admin.from("profiles").select("full_name,role,avatar_url").eq("id",user.id).single();if(profile?.role==="creative")redirect("/creative");if(profile?.role==="admin")redirect("/admin");
  const{data:business}=await admin.from("businesses").select("id,name,industry,logo_url").eq("owner_user_id",user.id).single();if(!business)redirect("/auth?role=business&mode=signup");
  const[{data:wallet},{data:membership},{data:projects}]=await Promise.all([
    admin.from("coin_wallets").select("available_coins,held_coins").eq("business_id",business.id).maybeSingle(),
    admin.from("memberships").select("plan_name,monthly_coins,coin_cap,current_period_end,status").eq("business_id",business.id).eq("status","active").maybeSingle(),
    admin.from("projects").select("id,title,category,status,coin_amount,due_at,created_at,assigned_creative_id").eq("business_id",business.id).order("created_at",{ascending:false}).limit(5)
  ]);
  const list=projects??[];const active=list.filter((p:any)=>!["completed","cancelled"].includes(p.status));const unread=active.filter((p:any)=>["proof_uploaded","submitted","revisions"].includes(p.status)).length;const first=(profile?.full_name?.split(" ")?.[0]??business.name);const coins=wallet?.available_coins??0;
  const lead=active[0];
  return <main className="app-shell pn-app-shell">
    <AppHeader name={profile?.full_name} role="business" coinCount={coins}/>

    <section className="pn-dashboard-hero">
      <div className="pn-dashboard-copy"><span className="eyebrow">GOOD MORNING</span><h1>Good morning, {first}. 👋</h1><p>Big ideas. Brighter futures. Peach is here to help you find the right creative and keep the work moving.</p>
        <Link href="/business/new-project" className="pn-find-card"><span className="pn-find-image"><img src="/brand/business-owner.jpg" alt="Creative workspace"/></span><div><small>FIND A CREATIVE</small><strong>Post a project and get matched with vetted talent.</strong></div><b>›</b></Link>
      </div>
      <div className="pn-dashboard-photo"><img src="/brand/business-owner.jpg" alt="Business owner working"/><div className="pn-photo-caption"><small>PEACH NETWORK</small><strong>Support creative people.</strong></div></div>
    </section>

    <section className="pn-dashboard-stat-grid">
      <Link href="/business/projects"><span>▣</span><strong>{active.length}</strong><small>Projects</small><em>{active.length?"active":"ready"}</em></Link>
      <Link href="/business/messages"><span>✉</span><strong>{unread}</strong><small>Messages</small><em>{unread?"need attention":"caught up"}</em></Link>
      <Link href="/business/wallet"><span>◫</span><strong>{coins}</strong><small>Wallet</small><em>Peach Coins</em></Link>
      <Link href="/notifications"><span>⌁</span><strong>Events</strong><small>Network</small><em>news + opportunities</em></Link>
    </section>

    <section className="pn-ai-home-card">
      <div className="pn-ai-orb">🍑</div><div><span className="eyebrow">PEACH MATCH AI · BETA</span><h2>Tell Peach what you need.</h2><p>Describe the project like you would to a person. Peach helps shape the request, estimates the likely coins and ranks creatives by specialty, portfolio, availability and fit.</p><Link href="/business/new-project" className="text-link">Start with an idea →</Link></div>
    </section>

    <div className="section-row pn-section-row"><div><span className="eyebrow">YOUR WORK</span><h2>Projects in motion.</h2><p>See who is working, what happens next and where each project stands.</p></div><Link href="/business/projects" className="text-link">View all</Link></div>
    <section className="pn-dashboard-projects">
      {lead?<article className="pn-feature-project"><div className="pn-project-avatar"><img src="/brand/hero-creative.jpg" alt="Creative assigned to project"/></div><div className="pn-feature-project-main"><div className="pn-project-topline"><div><small>{lead.category}</small><h3>{lead.title}</h3></div><span className={`status-label ${lead.status}`}>{lead.status.replaceAll("_"," ")}</span></div><p>{lead.assigned_creative_id?"Your creative is connected to this project.":"Peach Match is finding the right creative."} · {lead.coin_amount} coins · {dueText(lead.due_at)}</p><ProjectProgress status={lead.status} compact/><div className="pn-project-footer"><Link href={`/projects/${lead.id}`} className="btn btn-primary btn-small">Open Project</Link><span>{lead.status==="matching"?"🍑 Matching in progress":"Good work is growing."}</span></div></div></article>:
      <div className="pn-friendly-empty"><span>🍑</span><div><h3>Nothing active yet.</h3><p>Tell Peach what you need and we’ll help turn the idea into a clear project.</p><Link href="/business/new-project" className="btn btn-primary btn-small">Start a Project</Link></div></div>}
    </section>

    <section className="pn-pulse-grid">
      <article><span className="eyebrow">AROUND THE NETWORK</span><h3>Peach Creative Mixer</h3><p>Meet creatives, business owners and collaborators from around the Network.</p><small>Events + hub news will appear here as they are published.</small></article>
      <article className="peach"><span className="eyebrow">PEACH PULSE</span><h3>What’s happening at Peach.</h3><p>Applications, workshops, creative spotlights and new tools — without leaving the app.</p><Link href="/notifications" className="text-link">See updates →</Link></article>
    </section>
    <BottomNav role="business" active="home"/>
  </main>
}
