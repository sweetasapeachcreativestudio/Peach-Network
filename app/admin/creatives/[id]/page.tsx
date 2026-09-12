import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import CreativeReviewActions from "./review-actions";

export default async function CreativeReviewDetail({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (me?.role !== "admin") redirect("/");

  const { data: creative } = await supabase
    .from("creatives")
    .select(`
      id,
      primary_specialty,
      city,
      state,
      peach_level,
      application_status,
      reliability_score,
      profiles:user_id(full_name,email),
      creative_applications(
        id,
        experience,
        tools,
        portfolio_url,
        admin_notes,
        submitted_at,
        reviewed_at
      )
    `)
    .eq("id", id)
    .single();

  if (!creative) notFound();

  const application: any = (creative as any).creative_applications?.[0];

  return (
    <main className="shell" style={{maxWidth:900}}>
      <div className="brand">PE<span className="brand-accent">≡</span>CH</div>
      <p className="muted">HQ · APPLICATION REVIEW</p>

      <section className="card">
        <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"start",flexWrap:"wrap"}}>
          <div>
            <h1 style={{marginTop:0}}>{(creative as any).profiles?.full_name ?? "Creative Applicant"}</h1>
            <p className="muted">{(creative as any).profiles?.email}</p>
            <p><strong>{creative.primary_specialty ?? "No specialty set"}</strong></p>
            <p className="muted">
              {[creative.city, creative.state].filter(Boolean).join(", ") || "Location not set"}
            </p>
          </div>
          <span className="pill">{creative.application_status}</span>
        </div>

        <hr style={{border:0,borderTop:"1px solid var(--peach-border)",margin:"20px 0"}} />

        <div className="grid grid-2">
          <div>
            <h3>Experience</h3>
            <p className="muted">{application?.experience || "No experience summary provided."}</p>
          </div>
          <div>
            <h3>Tools / Equipment</h3>
            <p className="muted">{application?.tools || "No tools listed."}</p>
          </div>
        </div>

        <div style={{marginTop:18}}>
          <h3>Portfolio</h3>
          {application?.portfolio_url ? (
            <a href={application.portfolio_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{display:"inline-block"}}>
              Open Portfolio
            </a>
          ) : (
            <p className="muted">No portfolio URL provided.</p>
          )}
        </div>
      </section>

      <CreativeReviewActions
        creativeId={creative.id}
        applicationId={application?.id}
        currentLevel={creative.peach_level}
        currentStatus={creative.application_status}
        existingNotes={application?.admin_notes ?? ""}
      />
    </main>
  );
}
