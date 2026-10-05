import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PeachAppShell } from "../components/peach-app-shell";
import { ProjectProgress } from "../components/project-progress";

const reviewStatuses = ["proof_uploaded", "submitted", "waiting_on_client"];
function statusLabel(status: string) {
  return ({matching:"Matching",offer_sent:"Awaiting acceptance",accepted:"Creative accepted",in_progress:"In progress",proof_uploaded:"Proof ready",submitted:"Delivery ready",waiting_on_client:"Waiting on you",revisions:"Revision in progress",approved:"Approved",dispute:"Support needed",dispute_review:"Support reviewing"} as Record<string,string>)[status] ?? status.replaceAll("_", " ");
}
function nextStep(status: string) {
  if (reviewStatuses.includes(status)) return "Review the work or respond to your creative.";
  if (status === "matching" || status === "offer_sent") return "Peach is arranging your creative match.";
  if (status === "revisions") return "Your creative is working through the requested changes.";
  return "Open the project for the latest progress and files.";
}
function dueText(value: string | null) {
  if (!value) return "Deadline not set";
  const hours = Math.ceil((new Date(value).getTime() - Date.now()) / 3600000);
  if (hours < 0) return "Past due";
  if (hours < 24) return `${hours}h remaining`;
  return `Due ${new Date(value).toLocaleDateString("en-US", {month:"short",day:"numeric",timeZone:"America/Chicago"})}`;
}

export default async function BusinessDashboard() {
  const supabase = await createClient();
  const {data:{user}} = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=business&mode=signin");
  const admin = createAdminClient();
  const {data:profile} = await admin.from("profiles").select("full_name,role,avatar_url").eq("id", user.id).single();
  if (profile?.role === "creative") redirect("/creative");
  if (profile?.role === "admin") redirect("/admin");
  const {data:business} = await admin.from("businesses").select("id,name,industry,logo_url").eq("owner_user_id",user.id).single();
  if (!business) redirect("/auth?role=business&mode=signup");
  const [{data:wallet},{data:projects},{data:brandAssets}] = await Promise.all([
    admin.from("coin_wallets").select("available_coins,held_coins").eq("business_id",business.id).maybeSingle(),
    admin.from("projects").select("id,title,category,status,coin_amount,due_at,created_at,assigned_creative_id").eq("business_id",business.id).order("created_at",{ascending:false}),
    admin.from("business_brand_assets").select("id,kind,label,value,original_name").eq("business_id",business.id)
  ]);
  const active = (projects??[]).filter(p=>!["completed","cancelled"].includes(p.status));
  const attention = active.find(p=>reviewStatuses.includes(p.status));
  const lead = attention ?? active[0];
  const first = profile?.full_name?.trim().split(" ")[0] || business.name;
  const coins = wallet?.available_coins ?? 0;
  const ids = active.map(p=>p.id);
  const creativeIds = [...new Set(active.map(p=>p.assigned_creative_id).filter(Boolean))];
  const [{data:messages},{data:creatives}] = await Promise.all([
    ids.length ? admin.from("project_messages").select("id,project_id,message,created_at,sender_user_id").in("project_id",ids).order("created_at",{ascending:false}).limit(3) : Promise.resolve({data:[]}),
    creativeIds.length ? admin.from("creatives").select("id,user_id").in("id",creativeIds) : Promise.resolve({data:[]})
  ]);
  const peopleIds = [...new Set([...(creatives??[]).map(c=>c.user_id),...(messages??[]).map(m=>m.sender_user_id)].filter(Boolean))];
  const {data:people} = peopleIds.length ? await admin.from("profiles").select("id,full_name,avatar_url").in("id",peopleIds) : {data:[]};
  const peopleMap = new Map((people??[]).map(p=>[p.id,p]));
  const creativeMap = new Map((creatives??[]).map(c=>[c.id,peopleMap.get(c.user_id)]));

  const projectCard = (project: typeof active[number]) => {
    const creative = creativeMap.get(project.assigned_creative_id);
    return <details className="bd-project" key={project.id}>
      <summary>
        <span className="bd-project-art" aria-hidden="true">{business.logo_url ? <img src={business.logo_url} alt=""/> : <span>{business.name.slice(0,2).toUpperCase()}</span>}</span>
        <span className="bd-project-info"><span className="bd-meta"><span className={`bd-status ${reviewStatuses.includes(project.status)?"review":""}`}>{statusLabel(project.status)}</span><span>{project.category} · {project.coin_amount} Coins</span></span><strong>{project.title}</strong><span className="bd-assigned">{creative?.avatar_url&&<img src={creative.avatar_url} alt=""/>}{creative?.full_name ? `Assigned: ${creative.full_name}` : project.assigned_creative_id ? "Creative connected" : "Finding your creative"}</span><span className="bd-next">Next: {nextStep(project.status)} · {dueText(project.due_at)}</span></span>
        <span className="bd-expand">Details <span className="bd-chevron">⌄</span></span>
      </summary>
      <div className="bd-project-expanded"><ProjectProgress status={project.status} compact/><Link href={`/projects/${project.id}`} className="bd-button">{reviewStatuses.includes(project.status)?"Review project":"Open Project Room"} →</Link><Link href={`/projects/${project.id}#chat`} className="bd-text-link">Message your creative</Link></div>
    </details>;
  }

  return <PeachAppShell role="business" active="home" name={profile?.full_name} coinCount={coins} businessName={business.name} logoUrl={business.logo_url}>
    <main className="bd-dashboard">
      <header className="bd-heading"><div><h1>Welcome back, {first}</h1><p>Here is what needs your review today across your active design requests.</p></div><Link href="/business/new-project" className="bd-button">+ Start a Project</Link></header>
      <div className="bd-layout"><div className="bd-main">
        <section className="bd-attention"><div className="bd-meta"><span className="bd-attention-label">{attention?"NEEDS YOUR ATTENTION":active.length?"PROJECTS IN MOTION":"YOUR NEXT BIG IDEA"}</span><span className="bd-status">{lead?statusLabel(lead.status):"Ready when you are"}</span>{lead&&<span>{dueText(lead.due_at)}</span>}</div><h2>{lead?.title ?? "Good work starts with a clear idea."}</h2><p>{lead?`${lead.coin_amount} Peach Coins · ${nextStep(lead.status)}`:"Tell us what you need. Peach connects your business with a vetted creative."}</p><div className="bd-actions"><Link href={lead?`/projects/${lead.id}`:"/business/new-project"} className="bd-button peach">{attention?"Review project":lead?"Open Project Room":"Find my creative"} →</Link>{lead&&<Link href="/business/projects" className="bd-button secondary">View all projects</Link>}</div></section>
        <div className="bd-section-heading"><h2>Active Projects <span>({active.length})</span></h2><Link href="/business/projects" className="bd-text-link">All Projects & Archive →</Link></div>
        <section className="bd-project-list" aria-label="Active projects">{active.length?active.slice(0,2).map(projectCard):<div className="bd-empty"><h3>A little room for something great.</h3><p>Your projects, creative and next steps will appear here.</p><Link href="/business/new-project" className="bd-text-link">Start your first project →</Link></div>}{active.length>2&&<details className="bd-more"><summary>{active.length-2} more active projects <span className="bd-chevron">⌄</span></summary><div>{active.slice(2).map(projectCard)}</div></details>}</section>
        <details className="bd-guarantee"><summary><span className="bd-check">✓</span><span><strong>Protected payments. Clear next steps.</strong><small>Review the work before final sign-off.</small></span><span className="bd-chevron">⌄</span></summary><p>Track your brief, proofs, revisions and final delivery in the Project Room. Approval and payment actions stay attached to your project.</p></details>
      </div>
      <aside className="bd-dock" aria-label="Wallet, brand and messages">
        <details className="bd-panel" open><summary><span>WALLET & PEACH COINS</span><span className="bd-chevron">⌄</span></summary><div className="bd-panel-body"><div className="bd-wallet-value">{coins} <span>Coins</span></div><p>{wallet?.held_coins??0} Coins committed to active projects</p><Link href="/business/wallet" className="bd-button dock">+ Top-Up Coins</Link></div></details>
        <details className="bd-panel" id="brand-vault" open><summary><span>BRAND VAULT</span><span>{brandAssets?.length??0} Assets <span className="bd-chevron">⌄</span></span></summary><div className="bd-panel-body"><div className="bd-brand-title">{business.logo_url&&<img src={business.logo_url} alt={`${business.name} logo`}/>}<strong>{business.name} Assets</strong></div><p>Saved once. Ready for your creative on every project.</p><div className="bd-vault-grid">{([['logo','Primary Logo'],['color','Brand Colors'],['font','Official Typefaces & Fonts Kit']] as const).map(([kind,title])=>{const items=(brandAssets??[]).filter(a=>a.kind===kind);return <Link key={kind} href={`/business/vault#${kind}`} className={`bd-vault-tile ${kind==='font'?'wide':''}`}><strong>{title}</strong><span>{items.length?kind==='logo'?`${items.length} saved · ${items[0].original_name?.split('.').pop()?.toUpperCase()??'Logo'}`:`${items.length} saved${kind==='color'?' · HEX':''}`:'+ Add to your vault'}</span></Link>})}</div><Link href="/business/vault" className="bd-text-link">Manage all assets →</Link></div></details>
        <details className="bd-panel" open><summary><span>PROJECT MESSAGES</span><span className="bd-chevron">⌄</span></summary><div className="bd-panel-body">{messages?.length?messages.map(message=><Link key={message.id} href={`/projects/${message.project_id}#chat`} className="bd-message"><strong>{peopleMap.get(message.sender_user_id)?.full_name ?? "Project member"}</strong><span>{message.message}</span></Link>):<p>No project messages yet. Conversations appear here when work gets underway.</p>}<Link href="/business/messages" className="bd-button secondary dock">Open Messages →</Link></div></details>
        <details className="bd-help"><summary><span><strong>Need help scoping a project?</strong><small>Talk through your idea with Peach.</small></span><span className="bd-chevron">⌄</span></summary><p>Describe what you want to create and organize the brief before matching.</p><Link href="/business/ask-peach" className="bd-text-link">Ask Peach →</Link></details>
      </aside></div>
      <style>{`
        .peach-business-workspace .peach-workspace-content{max-width:1600px;padding:22px 28px 28px}.peach-business-workspace .peach-workspace-topbar{height:52px}.bd-dashboard{font-size:14px;color:#263c32}.bd-dashboard h1,.bd-dashboard h2,.bd-dashboard h3,.bd-dashboard p{margin:0}.bd-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:22px}.bd-heading h1{font-size:28px;font-weight:800;letter-spacing:-.025em}.bd-heading p{font-size:14px;color:#69776f;margin-top:7px}.bd-layout{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:22px;align-items:start}.bd-main,.bd-dock{min-width:0}.bd-dock{display:grid;gap:16px}.bd-button{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid transparent;border-radius:14px;background:#263e33;color:white;padding:11px 18px;font-size:12px;font-weight:800;text-decoration:none;white-space:nowrap}.bd-button.peach{background:#e85d3f}.bd-button.secondary{background:#fff;color:#263e33;border-color:#e5dfd7}.bd-button.dock{width:100%;margin-top:12px}.bd-button:hover{filter:brightness(.96)}.bd-text-link{color:#c04c32;font-size:12px;font-weight:800;text-decoration:none}.bd-attention{border:1px solid #ef9c82;border-left:5px solid #e85d3f;border-radius:16px;background:#fff8f4;padding:20px 22px}.bd-meta{display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:11px;color:#64746a}.bd-attention-label{color:#bb482f;font-size:10px;font-weight:850;letter-spacing:.03em}.bd-status{display:inline-flex;border-radius:9px;padding:5px 10px;background:#edf4fa;color:#385c78;font-size:10px;font-weight:800;text-transform:uppercase}.bd-status.review{background:#fff5df;color:#95610e}.bd-attention h2{font-size:22px;line-height:1.3;margin:15px 0 8px}.bd-attention p{color:#607067;font-size:13px;line-height:1.5}.bd-actions{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}.bd-section-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:22px 0 12px}.bd-section-heading h2{font-size:20px}.bd-section-heading h2 span{font-weight:500}.bd-project-list{display:grid;gap:12px}.bd-project{background:#fff;border:1px solid #e7e1d9;border-radius:16px;overflow:hidden}.bd-dashboard summary{list-style:none;cursor:pointer}.bd-dashboard summary::-webkit-details-marker{display:none}.bd-project>summary{display:flex;align-items:center;gap:16px;padding:16px}.bd-project-art{width:80px;height:90px;flex-shrink:0;display:grid;place-items:center;background:#edf4fa;border-radius:10px;color:#607d91;font-size:22px;font-weight:800;overflow:hidden}.bd-project-art img{width:100%;height:100%;object-fit:contain;padding:10px}.bd-project-info{display:grid;gap:8px;min-width:0;flex:1}.bd-project-info>strong{font-size:16px;line-height:1.3;overflow-wrap:anywhere}.bd-assigned{display:flex;align-items:center;gap:7px;font-size:12px;color:#69776f}.bd-assigned img{width:22px;height:22px;border-radius:50%;object-fit:cover}.bd-next{font-size:11px;font-weight:650;color:#526459;line-height:1.5}.bd-expand{display:flex;align-items:center;gap:6px;color:#7a817b;font-size:11px}.bd-chevron{display:inline-block;font-size:17px;color:#65776b;transition:transform .16s}.bd-dashboard details[open]>summary .bd-chevron{transform:rotate(180deg)}.bd-dashboard summary:focus-visible,.bd-dashboard a:focus-visible{outline:3px solid #69a6cf;outline-offset:3px}.bd-project-expanded{border-top:1px solid #ece7e1;padding:14px 18px;display:flex;align-items:center;flex-wrap:wrap;gap:12px}.bd-project-expanded .progress-system{width:100%}.bd-more>summary{padding:12px;color:#a74c34;font-weight:750}.bd-more>div{display:grid;gap:12px}.bd-guarantee{margin-top:18px;border:1px solid #e7e1d9;border-radius:16px;background:#fff;padding:16px}.bd-guarantee summary{display:flex;align-items:center;gap:12px}.bd-guarantee summary>span:nth-child(2){display:grid;gap:4px;flex:1}.bd-guarantee strong{font-size:13px}.bd-guarantee small{font-size:11px;color:#6e7d73}.bd-check{width:32px;height:32px;border-radius:50%;background:#edf6f0;color:#4f8e70;display:grid;place-items:center}.bd-guarantee p{font-size:12px;line-height:1.6;color:#69776f;margin-top:14px}.bd-panel{background:#fff;border:1px solid #e7e1d9;border-radius:16px;padding:16px 18px;scroll-margin-top:70px}.bd-panel>summary{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:10px;font-weight:850;letter-spacing:.04em;color:#65776b}.bd-panel-body{padding-top:14px}.bd-wallet-value{font-size:30px;font-weight:800}.bd-wallet-value span{font-size:23px}.bd-panel-body p{font-size:12px;line-height:1.6;color:#69776f;margin-top:8px}.bd-panel-body>small{display:block;font-size:10px;color:#7a817b;line-height:1.5;margin-top:10px}.bd-vault-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.bd-vault-tile{display:grid;gap:6px;padding:12px 9px;background:#f4f8fc;border:1px solid #dce7ee;border-radius:10px;text-decoration:none;color:#385c78}.bd-vault-tile strong{font-size:11px}.bd-vault-tile span{font-size:10px;color:#69776f}.bd-vault-tile.wide{grid-column:1/-1;background:#fff6ef;border-color:#efddcf}.bd-brand-title{display:flex;align-items:center;gap:10px;font-size:14px}.bd-brand-title img{width:36px;height:36px;object-fit:contain}.bd-message{display:grid;gap:5px;padding:0 0 10px;margin-bottom:10px;border-bottom:1px solid #eee7df;color:#263e33;text-decoration:none}.bd-message strong{font-size:12px}.bd-message span{font-size:11px;color:#69776f;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}.bd-help{border:1px solid #e7e1d9;border-radius:16px;padding:16px 18px;background:#faf8f5}.bd-help summary{display:flex;align-items:center;justify-content:space-between;gap:10px}.bd-help summary>span:first-child{display:grid;gap:5px}.bd-help strong{font-size:12px}.bd-help small{font-size:11px;color:#69776f}.bd-help p{margin:12px 0;font-size:12px;line-height:1.6;color:#69776f}.bd-empty{border:1px dashed #dfc9bb;border-radius:16px;padding:30px;background:#fff}.bd-empty h3{font-size:17px}.bd-empty p{font-size:13px;margin:8px 0 14px;color:#69776f}
        @media(min-width:1400px){.bd-layout{grid-template-columns:minmax(0,1fr) 320px}.bd-project-art{width:95px;height:96px}}
        @media(max-width:1100px){.bd-layout{grid-template-columns:minmax(0,1fr) 250px;gap:16px}.bd-project-art{width:60px;height:76px}.bd-project>summary{gap:10px;padding:12px}.bd-expand{font-size:0}.bd-next{font-size:10px}}
        @media(max-width:700px){.peach-business-workspace .peach-workspace-content{padding:20px 16px 90px}.bd-layout{grid-template-columns:1fr}.bd-heading{align-items:flex-start;flex-direction:column;gap:12px}.bd-heading h1{font-size:25px}.bd-attention{padding:18px}.bd-attention h2{font-size:20px}.bd-section-heading h2{font-size:18px}.bd-dock{grid-template-columns:1fr}.bd-project-info>strong{font-size:14px}.bd-project-art{width:52px;height:70px}.bd-project-info .bd-meta{gap:5px}.bd-project-info .bd-meta>span:last-child{font-size:10px}}
      `}</style>
    </main>
  </PeachAppShell>;
}
