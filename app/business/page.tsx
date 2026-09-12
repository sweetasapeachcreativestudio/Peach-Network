import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppHeader, BottomNav } from "../components/app-nav";
import { ArrowIcon, MessageIcon, SparkIcon } from "../components/icons";
import { ProjectProgress, projectPercent } from "../components/project-progress";

function dueText(dueAt: string | null) {
  if (!dueAt) return "Deadline not set";
  const days = Math.ceil((new Date(dueAt).getTime() - Date.now()) / 86400000);
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  return `Due in ${days} day${days === 1 ? "" : "s"}`;
}

export default async function BusinessDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=business&mode=signin");

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("full_name,role").eq("id", user.id).single();
  if (profile?.role === "creative") redirect("/creative");
  if (profile?.role === "admin") redirect("/admin");

  const { data: business } = await admin.from("businesses").select("id,name").eq("owner_user_id", user.id).single();
  if (!business) redirect("/auth?role=business&mode=signup");

  const [{ data: wallet }, { data: membership }, { data: projects }] = await Promise.all([
    admin.from("coin_wallets").select("available_coins,held_coins").eq("business_id", business.id).maybeSingle(),
    admin.from("memberships").select("plan_name,monthly_coins,coin_cap,current_period_end,status").eq("business_id", business.id).eq("status", "active").maybeSingle(),
    admin.from("projects").select("id,title,category,status,coin_amount,due_at,created_at,assigned_creative_id").eq("business_id", business.id).order("created_at", { ascending: false }).limit(5),
  ]);

  const active = (projects ?? []).filter((p: any) => !["completed", "cancelled"].includes(p.status));
  const name = profile?.full_name?.split(" ")?.[0] ?? business.name;
  const coinCount = wallet?.available_coins ?? 0;

  return (
    <main className="app-shell">
      <AppHeader name={profile?.full_name} role="business" coinCount={coinCount} />

      <section className="app-hero">
        <div className="app-hero-main">
          <span className="eyebrow"><SparkIcon /> BUSINESS HOME</span>
          <h1>What are we creating, {name}?</h1>
          <p>Tell Peach what you need. We’ll guide the scope, estimate the coins and get the right creative in front of the project.</p>
          <Link href="/business/new-project" className="btn">Start a Project <ArrowIcon /></Link>
        </div>
        <div className="quick-panel">
          <span className="eyebrow">YOUR PEACH WALLET</span>
          <div className="big">{coinCount} Peach Coins</div>
          <p>{membership ? `${membership.plan_name} · ${membership.monthly_coins} coins each refill · ${membership.coin_cap} max` : "No active membership yet. You can still use Peach Packs."}</p>
          <Link href="/business/wallet" className="btn btn-outline">Open Wallet</Link>
        </div>
      </section>

      <section className="stat-row" aria-label="Business overview">
        <div className="stat-card"><small>ACTIVE PROJECTS</small><strong>{active.length}</strong><span>{active.length ? "Projects currently moving" : "Ready when you are"}</span></div>
        <div className="stat-card"><small>COINS HELD</small><strong>{wallet?.held_coins ?? 0}</strong><span>Committed to active work</span></div>
        <div className="stat-card"><small>NEXT REFILL</small><strong>{membership ? `+${membership.monthly_coins}` : "—"}</strong><span>{membership?.current_period_end ? new Date(membership.current_period_end).toLocaleDateString() : "Add a plan anytime"}</span></div>
      </section>

      <div className="section-row">
        <div><h2>Your projects</h2><p>See exactly where the work stands.</p></div>
        <Link href="/business/projects" className="text-link">View all</Link>
      </div>

      <section className="project-list">
        {active.slice(0, 3).map((project: any) => (
          <article className="project-card" key={project.id}>
            <div className="project-card-top">
              <div>
                <h3>{project.title}</h3>
                <p className="project-meta">{project.category} · {project.coin_amount} Peach Coin{project.coin_amount === 1 ? "" : "s"} · {dueText(project.due_at)}</p>
              </div>
              <span className={`status-label ${project.status}`}>{project.status.replaceAll("_", " ")}</span>
            </div>
            <ProjectProgress status={project.status} compact />
            <div className="project-actions">
              <Link href={`/projects/${project.id}`} className="btn btn-primary btn-small">View Project</Link>
              <Link href={`/projects/${project.id}#chat`} className="btn btn-outline btn-small"><MessageIcon /> Message</Link>
              <span className="pill">{projectPercent(project.status)}% journey</span>
            </div>
          </article>
        ))}

        {active.length === 0 && (
          <div className="empty-state">
            <div className="empty-mark"><i/><i/><i/></div>
            <h2>No active projects yet.</h2>
            <p className="muted">Start with what you need. Peach will help turn it into a clear project and coin estimate.</p>
            <Link href="/business/new-project" className="btn btn-primary">Start your first project</Link>
          </div>
        )}
      </section>

      <BottomNav role="business" active="home" />
    </main>
  );
}
