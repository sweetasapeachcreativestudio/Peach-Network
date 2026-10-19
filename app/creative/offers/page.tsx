import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import OfferActions from "./offer-actions";
import { AppHeader, BottomNav } from "../../components/app-nav";

export default async function CreativeOffersPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/auth?role=creative&mode=signin");
  const admin=createAdminClient();
  const {data:profile}=await admin.from("profiles").select("full_name,role").eq("id",user.id).single();
  if(profile?.role==="business")redirect("/business");
  const {data:creative}=await admin.from("creatives").select("id,application_status,peach_level,primary_specialty").eq("user_id",user.id).single();
  if(!creative)redirect("/creative/apply");
  if(creative.application_status!=="approved") redirect("/creative/status");

  const {data:offers}=await admin.from("project_offers")
    .select("id,status,payout_cents,counter_payout_cents,counter_reason,expires_at,projects(id,title,category,description,coin_amount,due_at,revision_rounds)")
    .eq("creative_id",creative.id).in("status",["sent","countered"]).order("created_at",{ascending:false});

  return <main className="app-shell">
    <AppHeader name={profile?.full_name} role="creative"/>
    <div className="section-row"><div><span className="eyebrow">PEACH MATCH</span><h2>Your private opportunities.</h2><p>No public bidding pile. Peach sends projects that fit your profile.</p></div></div>
    <section className="project-list">
      {(offers??[]).map((offer:any)=><article className="project-card" key={offer.id}>
        <div className="project-card-top"><div><span className="pill">PRIVATE MATCH</span><h3 style={{marginTop:10}}>{offer.projects?.title ?? "Creative Opportunity"}</h3><p className="project-meta">{offer.projects?.category} · {offer.projects?.coin_amount} Peach Coin{offer.projects?.coin_amount===1?"":"s"}</p></div><div style={{textAlign:"right"}}><small className="muted">YOUR PAYOUT</small><div className="big">${(offer.payout_cents/100).toFixed(2)}</div></div></div>
        <p>{offer.projects?.description}</p>
        <div className="grid grid-3" style={{marginTop:16}}><div className="stat-card"><small>DEADLINE</small><strong style={{fontSize:18}}>{offer.projects?.due_at?new Date(offer.projects.due_at).toLocaleDateString():"Flexible"}</strong></div><div className="stat-card"><small>REVISIONS</small><strong>{offer.projects?.revision_rounds??2}</strong></div><div className="stat-card"><small>OFFER EXPIRES</small><strong style={{fontSize:16}}>{new Date(offer.expires_at).toLocaleDateString()}</strong></div></div>
        {offer.status==="countered"?<div className="auth-message"><strong>Counter sent.</strong> You requested ${(offer.counter_payout_cents/100).toFixed(2)}. Peach will keep this card updated.</div>:<div style={{marginTop:18}}><OfferActions offerId={offer.id} payoutCents={offer.payout_cents}/></div>}
      </article>)}
      {(!offers||offers.length===0)&&<div className="empty-state"><div className="empty-mark"><i/><i/><i/></div><h2>No open Peach Matches.</h2><p className="muted">Your next matched opportunity will appear here with scope, payout, deadline and revision count before you accept.</p></div>}
    </section>
    <BottomNav role="creative" active="matches"/>
  </main>
}
