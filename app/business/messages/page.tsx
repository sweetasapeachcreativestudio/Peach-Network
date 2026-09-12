import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppHeader, BottomNav } from "../../components/app-nav";
import { MessageIcon } from "../../components/icons";
import PeachMascot from "../../components/peach-mascot";

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

  const projectIds = (projects ?? []).map((p:any)=>p.id);
  const creativeIds = (projects ?? []).map((p:any)=>p.assigned_creative_id).filter(Boolean);
  const [{data:messages},{data:creatives}] = await Promise.all([
    projectIds.length ? admin.from("project_messages").select("id,project_id,message,created_at,sender_user_id").in("project_id",projectIds).order("created_at",{ascending:false}) : Promise.resolve({data:[]}),
    creativeIds.length ? admin.from("creatives").select("id,user_id,primary_specialty,profile_image_url").in("id",creativeIds) : Promise.resolve({data:[]}),
  ]);
  const userIds=(creatives??[]).map((c:any)=>c.user_id);
  const {data:names}=userIds.length?await admin.from("profiles").select("id,full_name").in("id",userIds):{data:[] as any[]};
  const nameMap=new Map((names??[]).map((n:any)=>[n.id,n.full_name]));
  const creativeMap=new Map((creatives??[]).map((c:any)=>[c.id,{...c,name:nameMap.get(c.user_id)??"Peach Creative"}]));

  return <main className="app-shell messages-v112">
    <AppHeader name={profile?.full_name} role="business" coinCount={wallet?.available_coins ?? 0}/>

    <section className="messages-hero">
      <div><span className="eyebrow">MESSAGES</span><h1>Conversations that stay attached to the work.</h1><p>No digging through texts or email threads. Each project keeps its people, decisions, files and messages together.</p></div>
      <PeachMascot note="Keep the juicy details with the project."/>
    </section>

    <section className="inbox-shell">
      <div className="inbox-head"><div><h2>Project inbox</h2><p>{(projects??[]).filter((p:any)=>p.assigned_creative_id).length} active conversation{(projects??[]).filter((p:any)=>p.assigned_creative_id).length===1?"":"s"}</p></div><span className="icon-shell"><MessageIcon/></span></div>
      <div className="conversation-list">
        {(projects ?? []).filter((p:any)=>p.assigned_creative_id).map((p:any)=>{
          const person:any=creativeMap.get(p.assigned_creative_id);
          const latest=(messages??[]).find((m:any)=>m.project_id===p.id);
          return <Link href={`/projects/${p.id}#chat`} className="conversation-row" key={p.id}>
            <div className="conversation-avatar">{person?.profile_image_url?<img src={person.profile_image_url} alt=""/>:<span>{String(person?.name??"PC").split(" ").map((x:string)=>x[0]).join("").slice(0,2)}</span>}</div>
            <div className="conversation-copy"><div className="conversation-topline"><strong>{person?.name??"Peach Creative"}</strong><small>{latest?new Date(latest.created_at).toLocaleDateString():"Project chat"}</small></div><b>{p.title}</b><p>{latest?.message??"Open the project conversation to say hello."}</p><span>{person?.primary_specialty??"Creative professional"} · {p.status.replaceAll("_"," ")}</span></div>
            <span className="conversation-arrow">→</span>
          </Link>
        })}
        {(!projects || !projects.some((p:any)=>p.assigned_creative_id)) && <div className="empty-state"><span className="icon-shell"><MessageIcon/></span><h2>No project chats yet.</h2><p className="muted">Once Peach matches a creative, this becomes your project inbox.</p></div>}
      </div>
    </section>

    <BottomNav role="business" active="messages" />
  </main>;
}
