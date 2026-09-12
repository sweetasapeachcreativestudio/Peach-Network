import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppHeader, BottomNav } from "../../components/app-nav";
import { ProjectProgress } from "../../components/project-progress";

export default async function BusinessProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=business&mode=signin");
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("full_name,role").eq("id", user.id).single();
  if (profile?.role !== "business" && profile?.role !== "admin") redirect("/creative");
  const { data: business } = await admin.from("businesses").select("id").eq("owner_user_id", user.id).single();
  if (!business) redirect("/auth?role=business&mode=signup");
  const { data: wallet } = await admin.from("coin_wallets").select("available_coins").eq("business_id", business.id).maybeSingle();
  const { data: projects } = await admin.from("projects").select("id,title,category,status,coin_amount,due_at,created_at").eq("business_id", business.id).order("created_at", { ascending: false });

  return <main className="app-shell">
    <AppHeader name={profile?.full_name} role="business" coinCount={wallet?.available_coins ?? 0} />
    <div className="section-row"><div><span className="eyebrow">PROJECTS</span><h2>Everything you’re creating.</h2><p>Open a project to see its progress, chat, proofs and timeline.</p></div><Link href="/business/new-project" className="btn btn-primary">New Project</Link></div>
    <section className="project-list">
      {(projects ?? []).map((project: any) => <article className="project-card" key={project.id}>
        <div className="project-card-top"><div><h3>{project.title}</h3><p className="project-meta">{project.category} · {project.coin_amount} coin{project.coin_amount === 1 ? "" : "s"}{project.due_at ? ` · Due ${new Date(project.due_at).toLocaleDateString()}` : ""}</p></div><span className={`status-label ${project.status}`}>{project.status.replaceAll("_"," ")}</span></div>
        <ProjectProgress status={project.status} compact />
        <div className="project-actions"><Link className="btn btn-primary btn-small" href={`/projects/${project.id}`}>Open Project</Link></div>
      </article>)}
      {(!projects || projects.length === 0) && <div className="empty-state"><div className="empty-mark"><i/><i/><i/></div><h2>Your project list is ready.</h2><p className="muted">Your first Peach project will appear here after you submit it.</p><Link className="btn btn-primary" href="/business/new-project">Start a Project</Link></div>}
    </section>
    <BottomNav role="business" active="projects" />
  </main>;
}
