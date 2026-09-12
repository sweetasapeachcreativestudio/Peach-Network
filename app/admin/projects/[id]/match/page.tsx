import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import MatchWorkbench from "./workbench";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/auth?mode=signin");
  const admin=createAdminClient();const {data:profile}=await admin.from("profiles").select("role").eq("id",user.id).single();if(profile?.role!=="admin")redirect("/");
  const {data:project}=await admin.from("projects").select("id,title,category,description,coin_amount,due_at,status").eq("id",id).single();if(!project)notFound();
  return <main className="shell"><div className="brand">PE<span className="brand-accent">≡</span>CH</div><p className="muted">HQ · PEACH MATCH</p><h1>{project.title}</h1><section className="card"><div className="grid grid-3"><div><p className="muted">COINS</p><div className="big">{project.coin_amount}</div></div><div><p className="muted">CATEGORY</p><div className="big" style={{fontSize:24}}>{project.category}</div></div><div><p className="muted">STATUS</p><div className="big" style={{fontSize:24,textTransform:"capitalize"}}>{project.status.replaceAll("_"," ")}</div></div></div></section><MatchWorkbench projectId={project.id}/></main>
}
