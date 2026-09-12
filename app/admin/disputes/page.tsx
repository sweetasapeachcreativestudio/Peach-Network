import {createClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";

export default async function DisputesPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/auth");
  const {data:me}=await supabase.from("profiles").select("role").eq("id",user.id).single();
  if(me?.role!=="admin")redirect("/");

  const {data:disputes}=await supabase.from("disputes")
    .select("id,status,requested_resolution,client_statement,creative_statement,created_at,projects(id,title,coin_amount)")
    .in("status",["open","under_review"]).order("created_at",{ascending:true});

  return <main className="shell">
    <div className="brand">PE<span className="brand-accent">≡</span>CH</div>
    <p className="muted">HQ · PROTECTION</p><h1>Disputes & Evidence</h1>
    {(disputes??[]).map((d:any)=><section className="card" key={d.id} style={{marginBottom:14}}>
      <span className="pill">{d.status.replaceAll("_"," ")}</span>
      <h2>{d.projects?.title}</h2><p className="muted">{d.projects?.coin_amount} Peach Coin(s)</p>
      <h3>Business statement</h3><p>{d.client_statement||"Not submitted yet."}</p>
      <h3>Creative statement</h3><p>{d.creative_statement||"Not submitted yet."}</p>
      <a className="btn btn-primary" href={`/admin/disputes/${d.id}`}>Review Evidence & Resolve</a>
    </section>)}
    {(!disputes||disputes.length===0)&&<section className="card"><h2>Nothing needs review. 🍑</h2></section>}
  </main>
}
