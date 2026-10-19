import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ConnectButton from "./connect-button";
import PayoutStatusCard from "./status-card";

export default async function CreativePayoutsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: creative } = await supabase
    .from("creatives")
    .select("id,application_status,stripe_connect_account_id")
    .eq("user_id", user.id)
    .single();

  if (!creative) redirect("/creative/apply");
  if (creative.application_status !== "approved") redirect("/creative/status");

  const { data: payouts } = await supabase
    .from("creative_payouts")
    .select("id,amount_cents,status,created_at,projects(title)")
    .eq("creative_id", creative.id)
    .order("created_at", { ascending: false });

  return (
    <main className="shell" style={{maxWidth:850}}>
      <div className="brand">PE<span className="brand-accent">≡</span>CH</div>
      <p className="muted">CREATIVE PAYOUTS</p>

      <PayoutStatusCard />

      <section className="card" style={{marginTop:20}}>
        <h1>Get paid through Peach.</h1>
        <p className="muted">
          Your payout account is handled through Stripe Connect. Peach approves eligible project payouts after completion.
        </p>
        <ConnectButton />
        <p className="muted" style={{fontSize:13}}>
          {creative.stripe_connect_account_id ? "A Stripe Connect account has been created for this Peach profile." : "Payout setup has not started yet."}
        </p>
      </section>

      <section className="card" style={{marginTop:18}}>
        <h2>Payout History</h2>
        {(payouts ?? []).map((p: any) => (
          <div key={p.id} style={{display:"flex",justifyContent:"space-between",gap:16,padding:"12px 0",borderBottom:"1px solid var(--peach-border)"}}>
            <div>
              <strong>{p.projects?.title ?? "Peach Project"}</strong>
              <p className="muted" style={{margin:"4px 0 0"}}>{p.status}</p>
            </div>
            <strong>${(p.amount_cents/100).toFixed(2)}</strong>
          </div>
        ))}
        {(!payouts || payouts.length === 0) && <p className="muted">No payouts yet.</p>}
      </section>
    </main>
  );
}
