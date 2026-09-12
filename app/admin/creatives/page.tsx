import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CreativeReviewQueue() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (me?.role !== "admin") redirect("/");

  const { data: creatives } = await supabase
    .from("creatives")
    .select(`
      id,
      primary_specialty,
      city,
      state,
      peach_level,
      application_status,
      profiles:user_id(full_name,email),
      creative_applications(
        id,
        experience,
        tools,
        portfolio_url,
        submitted_at,
        reviewed_at
      )
    `)
    .in("application_status", ["submitted", "under_review", "needs_more_work"])
    .order("created_at", { ascending: true });

  return (
    <main className="shell">
      <div className="brand">PE<span className="brand-accent">≡</span>CH</div>
      <p className="muted">HQ · CREATIVE REVIEW</p>
      <h1>Creative Applications</h1>

      <section className="grid">
        {(creatives ?? []).map((creative: any) => {
          const application = creative.creative_applications?.[0];
          return (
            <Link key={creative.id} href={`/admin/creatives/${creative.id}`} className="card">
              <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"start"}}>
                <div>
                  <h2 style={{marginTop:0}}>{creative.profiles?.full_name ?? "Unnamed Creative"}</h2>
                  <p className="muted">
                    {creative.primary_specialty ?? "Specialty not set"}
                    {creative.city ? ` · ${creative.city}, ${creative.state ?? ""}` : ""}
                  </p>
                  <p className="muted">{creative.profiles?.email}</p>
                  <p><strong>Status:</strong> {creative.application_status}</p>
                  {application?.submitted_at && (
                    <p className="muted">Submitted {new Date(application.submitted_at).toLocaleDateString()}</p>
                  )}
                </div>
                <span className="pill">Review →</span>
              </div>
            </Link>
          );
        })}

        {(!creatives || creatives.length === 0) && (
          <div className="card">
            <h2>No applications waiting 🎉</h2>
            <p className="muted">New creative applications will appear here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
