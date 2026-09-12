import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminProjectsPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/auth");
  const {data:me}=await supabase.from("profiles").select("role").eq("id",user.id).single();
  if(me?.role!=="admin") redirect("/");

  const {data:projects}=await supabase.from("projects")
    .select("id,title,category,status,coin_amount,recommended_specialty,minimum_level,due_at")
    .order("created_at",{ascending:false});

  return <main className="shell">
    <div className="brand">PE<span className="brand-accent">≡</span>CH</div>
    <p className="muted">HQ · PROJECTS</p>
    <h1>Projects & Matches</h1>
    {(projects??[]).map((project:any)=><section className="card" key={project.id} style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"center",flexWrap:"wrap"}}>
        <div>
          <h2>{project.title}</h2>
          <p className="muted">{project.category} · {project.coin_amount} coin(s) · {project.status}</p>
          <p className="muted">{project.recommended_specialty??"Open specialty"} · {project.minimum_level??"Seed+"}</p>
        </div>
        {["matching","offer_sent"].includes(project.status) &&
          <a className="btn btn-primary" href={`/admin/projects/${project.id}/match`}>Open Peach Match</a>}
      </div>
    </section>)}
  </main>
}
