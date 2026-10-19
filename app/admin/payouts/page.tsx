import {createClient} from "@/lib/supabase/server";import {redirect} from "next/navigation";import PayoutButton from "./payout-button";
export default async function Payouts(){
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)redirect("/auth");const {data:me}=await s.from("profiles").select("role").eq("id",user.id).single();if(me?.role!=="admin")redirect("/");
 const {data:rows}=await s.from("creative_payouts").select("id,amount_cents,status,processed_at,projects(title),creatives(user_id,profiles:user_id(full_name))").order("created_at",{ascending:false});
 return <main className="shell"><div className="brand">PE<span className="brand-accent">≡</span>CH</div><p className="muted">HQ · PAYOUTS</p><h1>Creative Payouts</h1>
 {(rows??[]).map((r:any)=><section className="card" key={r.id} style={{marginBottom:12}}><h2>{r.projects?.title}</h2><p>{r.creatives?.profiles?.full_name??"Creative"} · ${(r.amount_cents/100).toFixed(2)}</p><span className="pill">{r.status}</span>{r.status==="approved"&&<div style={{marginTop:12}}><PayoutButton payoutId={r.id}/></div>}</section>)}
 </main>
}
