import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import WalletActions from "./wallet-actions";
import { AppHeader, BottomNav } from "../../components/app-nav";
import PeachMascot from "../../components/peach-mascot";

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

  return <main className="app-shell wallet-v112">
    <AppHeader name={profile?.full_name} role="business" coinCount={wallet?.available_coins ?? 0}/>

    <section className="wallet-human-hero">
      <div className="wallet-human-copy">
        <span className="eyebrow">PEACH WALLET</span>
        <h1>Creative support you can actually see and use.</h1>
        <p>Peach Coins turn business needs into managed creative projects. Buy what fits your workload, then Peach helps scope the request and find the right creative.</p>
        <div className="wallet-balance-badge"><strong>{wallet?.available_coins ?? 0}</strong><span>available Peach Coins</span></div>
      </div>
      <div className="wallet-photo-panel">
        <img src="/people/network-hero.jpg" alt="Happy creatives working together"/>
        <div className="wallet-photo-overlay"><strong>People make the work.</strong><span>Peach helps you find them.</span></div>
        <PeachMascot compact note="Coins in. Good work out."/>
      </div>
    </section>

    <section className="stat-row">
      <div className="stat-card"><small>AVAILABLE</small><strong>{wallet?.available_coins ?? 0}</strong><span>Peach Coins ready to use</span></div>
      <div className="stat-card"><small>HELD</small><strong>{wallet?.held_coins ?? 0}</strong><span>Committed to projects</span></div>
      <div className="stat-card"><small>PLAN</small><strong style={{fontSize:24}}>{membership?.plan_name ?? "Pay As You Go"}</strong><span>{membership ? `${membership.monthly_coins}/month · ${membership.coin_cap} max` : "Buy a pack or choose a plan"}</span></div>
    </section>

    <WalletActions />

    <section className="wallet-activity card">
      <div className="section-row" style={{marginTop:0}}><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Your coin story.</h2><p>Every refill, hold and project charge stays visible here.</p></div></div>
      {(ledger??[]).map((row:any)=><div key={row.id} className="wallet-ledger-row"><div><strong style={{textTransform:"capitalize"}}>{row.ledger_type.replaceAll("_"," ")}</strong><p className="muted">{row.note ?? new Date(row.created_at).toLocaleDateString()}</p></div><strong className={row.coin_delta>0?"positive":""}>{row.coin_delta>0?"+":""}{row.coin_delta}</strong></div>)}
      {(!ledger||ledger.length===0)&&<div className="empty-state mini"><h3>No Peach Coin activity yet.</h3><p className="muted">Your purchases and project holds will appear here.</p></div>}
    </section>

    <BottomNav role="business" active="wallet"/>
  </main>;
}
