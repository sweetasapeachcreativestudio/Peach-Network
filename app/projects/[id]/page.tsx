import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import WorkspaceClient from "./workspace-client";
import { AppHeader, BottomNav } from "../../components/app-nav";
import { ProjectProgress, projectPercent } from "../../components/project-progress";

export default async function ProjectWorkspace({ params, searchParams }: { params: Promise<{id:string}>; searchParams: Promise<{created?:string}> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=signin");

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("full_name,role").eq("id", user.id).single();
  if (!profile) redirect("/auth?mode=signin");

  const { data: project } = await admin.from("projects")
    .select("id,title,description,status,coin_amount,due_at,revision_rounds,business_id,assigned_creative_id,waiting_on_client_since,created_at")
    .eq("id", id).single();
  if (!project) notFound();

  const { data: business } = await admin.from("businesses").select("owner_user_id,name").eq("id", project.business_id).single();
  const { data: assignedCreative } = project.assigned_creative_id ? await admin.from("creatives").select("id,user_id,primary_specialty,peach_level").eq("id", project.assigned_creative_id).single() : { data: null } as any;
  const isBusiness = business?.owner_user_id === user.id;
  const isCreative = assignedCreative?.user_id === user.id;
  const isAdmin = profile.role === "admin";
  if (!isBusiness && !isCreative && !isAdmin) notFound();
  const role: "business"|"creative"|"admin" = isAdmin ? "admin" : isBusiness ? "business" : "creative";

  const [{ data: updates }, { data: messages }, { data: wallet }, { data: creativeProfile }] = await Promise.all([
    admin.from("project_updates").select("id,stage,progress_percent,note,evidence_path,created_at,creative_id").eq("project_id",id).order("created_at",{ascending:false}),
    admin.from("project_messages").select("id,message,created_at,sender_user_id").eq("project_id",id).order("created_at",{ascending:true}),
    isBusiness ? admin.from("coin_wallets").select("available_coins").eq("business_id",project.business_id).maybeSingle() : Promise.resolve({data:null}),
    assignedCreative ? admin.from("profiles").select("full_name").eq("id",assignedCreative.user_id).maybeSingle() : Promise.resolve({data:null}),
  ]);

  const senderIds = [...new Set((messages ?? []).map((m:any)=>m.sender_user_id).filter(Boolean))];
  const senderMap = new Map<string,string>();
  if (senderIds.length) {
    const { data: senders } = await admin.from("profiles").select("id,full_name").in("id", senderIds);
    (senders ?? []).forEach((s:any)=>senderMap.set(s.id,s.full_name ?? "Project member"));
  }

  const days = project.due_at ? Math.ceil((new Date(project.due_at).getTime()-Date.now())/86400000) : null;
  const appRole = role === "creative" ? "creative" : "business";
  const headerName = profile.full_name;

  return <main className="app-shell">
    <AppHeader name={headerName} role={appRole} coinCount={isBusiness ? (wallet as any)?.available_coins ?? 0 : undefined}/>

    {created === "1" && <div className="auth-message" style={{marginBottom:14}}><strong>Project created.</strong> Peach has your scope. Your project now has a home while matching begins.</div>}

    <section className="workspace-header-card">
      <div className="workspace-header-top">
        <div>
          <span className="eyebrow" style={{color:"#ffd1ba"}}>{project.assigned_creative_id ? "ACTIVE PEACH PROJECT" : "PEACH MATCH"}</span>
          <h1>{project.title}</h1>
          <p>{project.description || "Project details will appear here."}</p>
          {creativeProfile?.full_name && <p style={{marginBottom:0}}><strong>Working with {creativeProfile.full_name}</strong>{assignedCreative?.primary_specialty ? ` · ${assignedCreative.primary_specialty}` : ""}</p>}
        </div>
        <div className="workspace-deadline"><small>DEADLINE</small><strong>{project.due_at ? new Date(project.due_at).toLocaleDateString() : "Flexible"}</strong>{days !== null && <div>{days<0?`${Math.abs(days)} days overdue`:days===0?"Due today":`${days} days remaining`}</div>}</div>
      </div>
      <ProjectProgress status={project.status}/>
      <div style={{display:"flex",justifyContent:"space-between",gap:15,flexWrap:"wrap",marginTop:14}}><span className={`status-label ${project.status}`}>{project.status.replaceAll("_"," ")}</span><strong>{projectPercent(project.status)}% through the Peach journey</strong></div>
    </section>

    {!project.assigned_creative_id && ["matching","offer_sent","draft"].includes(project.status) && <section className="card" style={{marginBottom:18}}><span className="eyebrow">PEACH MATCH IS WORKING</span><h2 style={{fontSize:30,margin:"8px 0"}}>We’re finding the right creative.</h2><p className="muted">Your request is saved. Peach Match looks at specialty, fit and availability before a private opportunity is sent. This is not a public bidding board.</p><div className="match-bars" aria-hidden="true"><i/><i/><i/></div></section>}

    <div className="workspace-tabs"><a href="#overview">Overview</a><a href="#chat">Chat</a><a href="#progress">Progress</a><a href="#proofs">Proofs</a><a href="#timeline">Timeline</a></div>

    <section className="workspace-grid" id="overview">
      <div id="chat" className="chat-card">
        <div className="chat-head"><div><strong>Project Chat</strong><div className="muted" style={{fontSize:13}}>Keep decisions attached to the project.</div></div><span className="status-label">{messages?.length ?? 0} messages</span></div>
        <div className="chat-thread">
          {(messages ?? []).map((m:any)=>{
            const mine = m.sender_user_id === user.id;
            return <div key={m.id} className={`chat-bubble ${mine?"mine":""}`}><strong>{mine?"You":senderMap.get(m.sender_user_id)??"Project member"}</strong>{m.message}<small>{new Date(m.created_at).toLocaleString()}</small></div>
          })}
          {(!messages || messages.length===0)&&<div className="muted">No messages yet. Start the project conversation here.</div>}
        </div>
        <WorkspaceClient projectId={id} role={role} status={project.status}/>
      </div>

      <aside className="side-stack">
        <div className="action-card"><span className="eyebrow">SCOPE</span><h3>{project.coin_amount} Peach Coin{project.coin_amount===1?"":"s"}</h3><p>{project.revision_rounds} revision round{project.revision_rounds===1?"":"s"} included in the current scope.</p></div>
        <div className="action-card" id="proofs"><span className="eyebrow">PROOFS & EVIDENCE</span><h3>{(updates ?? []).filter((u:any)=>u.evidence_path).length} attached</h3><p>Creative check-ins and proof evidence stay tied to the progress history. File previews are part of the next storage patch.</p></div>
        {project.status === "waiting_on_client" && <div className="action-card" style={{background:"#fff0de"}}><h3>Waiting on client</h3><p>The creative has marked this project as blocked while they wait for client information.</p></div>}
      </aside>
    </section>

    <section id="progress" className="card" style={{marginTop:18}}>
      <div className="section-row" style={{marginTop:0}}><div><h2>Progress history</h2><p>Check-ins make the work visible before final delivery.</p></div></div>
      <div className="timeline-list">
        {(updates ?? []).map((u:any)=><div className="timeline-row" key={u.id}><span className="timeline-dot"/><div><strong>{u.progress_percent}% · {u.stage.replaceAll("_"," ")}</strong><p>{u.note || "Progress update"} · {new Date(u.created_at).toLocaleString()}</p></div></div>)}
        {(!updates || updates.length===0)&&<p className="muted">No creative check-ins yet.</p>}
      </div>
    </section>

    <section id="timeline" className="card" style={{marginTop:18}}><h2>Project timeline</h2><div className="timeline-list"><div className="timeline-row"><span className="timeline-dot"/><div><strong>Project created</strong><p>{new Date(project.created_at).toLocaleString()}</p></div></div>{project.assigned_creative_id&&<div className="timeline-row"><span className="timeline-dot"/><div><strong>Creative matched</strong><p>{creativeProfile?.full_name ?? "A Peach creative"} is attached to this project.</p></div></div>}{(updates??[]).slice().reverse().map((u:any)=><div className="timeline-row" key={`t-${u.id}`}><span className="timeline-dot"/><div><strong>{u.stage.replaceAll("_"," ")}</strong><p>{u.note || "Progress update"}</p></div></div>)}</div></section>

    {role !== "admin" && <BottomNav role={role} active="projects"/>}
    {role === "admin" && <div style={{marginTop:20}}><Link className="text-link" href="/admin">← Admin HQ</Link></div>}
  </main>
}
