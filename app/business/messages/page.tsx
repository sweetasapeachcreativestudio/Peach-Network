import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppHeader, BottomNav } from "../../components/app-nav";

export default async function BusinessMessagesPage(){
 const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect("/auth?role=business&mode=signin");const admin=createAdminClient();
 const{data:profile}=await admin.from("profiles").select("full_name,role").eq("id",user.id).single();const{data:business}=await admin.from("businesses").select("id").eq("owner_user_id",user.id).maybeSingle();if(!business)redirect(profile?.role==="creative"?"/creative/messages":"/auth?role=business&mode=signup");
 const[{data:wallet},{data:projects}]=await Promise.all([admin.from("coin_wallets").select("available_coins").eq("business_id",business.id).maybeSingle(),admin.from("projects").select("id,title,status,assigned_creative_id,created_at,category").eq("business_id",business.id).order("created_at",{ascending:false})]);
 const chats=(projects??[]).filter((p:any)=>p.assigned_creative_id);
 return <main className="app-shell pn-app-shell"><AppHeader name={profile?.full_name} role="business" coinCount={wallet?.available_coins??0}/>
  <section className="pn-page-head"><div><span className="eyebrow">MESSAGES</span><h1>Messages.</h1><p>Project conversations stay attached to the work — with Peach nearby when you need help.</p></div></section>
  <div className="pn-message-search">⌕ <span>Search conversations…</span></div>
  <section className="pn-inbox-list">
   <Link href="/business/ask-peach" className="pn-inbox-row ai"><span className="pn-inbox-avatar peach">🍑</span><div><div><strong>Peach Match</strong><small>BETA</small></div><p>Need a creative? Tell Peach what you’re trying to make.</p></div><time>Now</time></Link>
   {chats.map((p:any,i:number)=><Link href={`/projects/${p.id}#chat`} className="pn-inbox-row" key={p.id}><span className="pn-inbox-avatar"><img src={i%2?"/brand/login-creative.jpg":"/brand/hero-creative.jpg"} alt="Creative"/></span><div><div><strong>{i%2?"Donovan":"Nia Carter"}</strong><small>{p.category}</small></div><p>{p.title} · {p.status.replaceAll("_"," ")}</p></div><time>{i===0?"2m":"15m"}</time></Link>)}
   <Link href="/business/wallet" className="pn-inbox-row"><span className="pn-inbox-avatar system">◎</span><div><div><strong>Peach Team</strong><small>System</small></div><p>Your project, wallet and network updates can show here.</p></div><time>1d</time></Link>
  </section>
  <section className="pn-message-ai"><div className="pn-ai-orb">🍑</div><div><span className="eyebrow">ASK PEACH AI · BETA</span><h2>Need help saying it clearly?</h2><p>Peach can summarize a project conversation, explain the next step, help organize feedback or suggest a clearer revision request. Nothing sends without you.</p><div className="pn-ai-example-row"><span>“What did we agree on?”</span><span>“Help me write clearer feedback.”</span><span>“What am I waiting on?”</span></div></div></section>
  {!chats.length&&<div className="pn-human-empty"><img src="/brand/login-creative.jpg" alt="Creative professional"/><div><small>YOUR PROJECT INBOX</small><h3>No human conversations yet.</h3><p>Once Peach matches a creative, their photo, project and conversation will appear right here.</p></div></div>}
  <BottomNav role="business" active="messages"/>
 </main>
}
