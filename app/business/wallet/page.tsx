import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import WalletActions from "./wallet-actions";
import { AppHeader, BottomNav } from "../../components/app-nav";

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=business&mode=signin");

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("full_name,role").eq("id", user.id).single();
  if (profile?.role === "creative") redirect("/creative");

  const { data: business } = await admin.from("businesses").select("id,name").eq("owner_user_id", user.id).single();
  if (!business) redirect("/auth?role=business&mode=signup");

  const [{data: wallet},{data: membership},{data: ledger}] = await Promise.all([
    admin.from("coin_wallets").select("available_coins,held_coins,updated_at").eq("business_id", business.id).maybeSingle(),
    admin.from("memberships").select("plan_name,monthly_coins,coin_cap,status,current_period_end").eq("business_id", business.id).eq("status", "active").maybeSingle(),
    admin.from("coin_ledger").select("id,ledger_type,coin_delta,cash_value_cents,tax_cents,note,created_at").eq("business_id", business.id).order("created_at", { ascending:false }).limit(12),
  ]);

  return <main className="app-shell">
    <AppHeader name={profile?.full_name} role="business" coinCount={wallet?.available_coins ?? 0}/>
    <div className="section-row"><div><span className="eyebrow">PEACH WALLET</span><h2>Your creative credits, clearly tracked.</h2><p>Available coins can start projects. Held coins are committed to active work.</p></div></div>
    <section className="stat-row">
      <div className="stat-card"><small>AVAILABLE</small><strong>{wallet?.available_coins ?? 0}</strong><span>Peach Coins ready to use</span></div>
      <div className="stat-card"><small>HELD</small><strong>{wallet?.held_coins ?? 0}</strong><span>Committed to projects</span></div>
      <div className="stat-card"><small>PLAN</small><strong style={{fontSize:24}}>{membership?.plan_name ?? "Pay As You Go"}</strong><span>{membership ? `${membership.monthly_coins}/month · ${membership.coin_cap} max` : "Buy a pack or choose a plan"}</span></div>
    </section>
    <WalletActions />
    <section className="card" style={{marginTop:18}}><h2>Coin activity</h2>{(ledger??[]).map((row:any)=><div key={row.id} style={{display:"flex",justifyContent:"space-between",gap:16,padding:"13px 0",borderBottom:"1px solid var(--peach-border)"}}><div><strong style={{textTransform:"capitalize"}}>{row.ledger_type.replaceAll("_"," ")}</strong><p className="muted" style={{margin:"3px 0 0"}}>{row.note ?? new Date(row.created_at).toLocaleDateString()}</p></div><strong>{row.coin_delta>0?"+":""}{row.coin_delta}</strong></div>)}{(!ledger||ledger.length===0)&&<p className="muted">No Peach Coin activity yet.</p>}</section>
    <BottomNav role="business" active="wallet"/>
  </main>;
}
