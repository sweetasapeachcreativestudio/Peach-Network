import {createClient} from "@/lib/supabase/server";
import {redirect,notFound} from "next/navigation";
import ResolutionClient from "./resolution-client";

export default async function Review({params}:{params:Promise<{id:string}>}){
  const {id}=await params;const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/auth");
  const {data:me}=await supabase.from("profiles").select("role").eq("id",user.id).single();if(me?.role!=="admin")redirect("/");
  const {data:d}=await supabase.from("disputes").select("id,status,client_statement,creative_statement,requested_resolution,projects(id,title,coin_amount)").eq("id",id).single();
  if(!d)notFound();const p:any=d.projects;
  const {data:updates}=await supabase.from("project_updates").select("stage,progress_percent,note,created_at").eq("project_id",p.id).order("created_at");
  const {data:files}=await supabase.from("project_files").select("original_name,file_kind,created_at").eq("project_id",p.id).order("created_at");
  return <main className="shell"><div className="brand">PE<span className="brand-accent">≡</span>CH</div><p className="muted">HQ · EVIDENCE REVIEW</p><h1>{p.title}</h1>
    <section className="grid grid-2"><div className="card"><h2>Business</h2><p>{d.client_statement||"No statement."}</p></div><div className="card"><h2>Creative</h2><p>{d.creative_statement||"No statement."}</p></div></section>
    <section className="card" style={{marginTop:16}}><h2>Recorded Work</h2>{(updates??[]).map((u:any,i)=><div key={i}><strong>{u.progress_percent}% · {u.stage}</strong><p>{u.note}</p></div>)}</section>
    <section className="card" style={{marginTop:16}}><h2>Evidence Files</h2>{(files??[]).map((f:any,i)=><p key={i}>{f.original_name} · {f.file_kind}</p>)}</section>
    <ResolutionClient disputeId={d.id} maxCoins={p.coin_amount}/>
  </main>
}
