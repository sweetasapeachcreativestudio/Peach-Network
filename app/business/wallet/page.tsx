import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Coins, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isRealSupabaseEnv } from "@/lib/supabase/admin";
import { PeachAppShell } from "../../components/peach-app-shell";
import WalletActions from "./wallet-actions";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=business&mode=signin");

  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("peach_role")?.value;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name,role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "creative" || (!isRealSupabaseEnv() && roleCookie === "creative")) {
    redirect("/creative/payouts");
  }

  const { data: business } = await admin
    .from("businesses")
    .select("id,name,logo_url")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  const businessId = business?.id ?? null;
  if (!businessId) redirect("/business");

  const [{ data: wallet }, { data: membership }, { data: ledger }] = await Promise.all([
    admin
      .from("coin_wallets")
      .select("available_coins,held_coins")
      .eq("business_id", businessId)
      .maybeSingle(),
    admin
      .from("memberships")
      .select("plan_name,monthly_coins,coin_cap,current_period_end")
      .eq("business_id", businessId)
      .eq("status", "active")
      .maybeSingle(),
    admin
      .from("coin_ledger")
      .select("id,ledger_type,coin_delta,note,created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const coins = wallet?.available_coins ?? 0;

  return (
    <PeachAppShell
      role="business"
      active="wallet"
      name={profile?.full_name}
      businessName={business?.name}
      logoUrl={business?.logo_url}
      coinCount={coins}
    >
      <div className="space-y-6">
        <section className="pn-wallet-header">
          <div>
            <span className="eyebrow">PEACH WALLET</span>
            <h1>Peach Wallet.</h1>
            <p>Your creative budget, easy to see and use.</p>
          </div>
          <div className="pn-wallet-balance">
            <span>Your Peach Coins</span>
            <strong className="inline-flex items-center gap-2 tabular-nums">
              {coins}
              <Coins className="w-6 h-6 text-[#FF5E3A]" strokeWidth={1.75} />
            </strong>
            <small>
              {membership
                ? `${membership.plan_name} · renews ${
                    membership.current_period_end
                      ? new Date(membership.current_period_end).toLocaleDateString()
                      : "monthly"
                  }`
                : "Pay as you go"}
            </small>
          </div>
        </section>

        <div className="pn-wallet-primary-actions">
          <a href="#buy" className="btn btn-primary">
            Buy Coins
          </a>
          <Link href="/business" className="btn btn-outline">
            Scope with Peach Match AI
          </Link>
        </div>

        {coins === 0 && (
          <div className="pn-wallet-nudge">
            <Coins className="w-6 h-6 text-[#FF5E3A] shrink-0" strokeWidth={1.75} />
            <div>
              <strong>A little low on juice.</strong>
              <p>Add Peach Coins when you’re ready to start paid creative work.</p>
            </div>
          </div>
        )}

        <div id="buy">
          <WalletActions />
        </div>

        <section className="pn-ledger-card">
          <div className="section-row">
            <div>
              <span className="eyebrow">RECENT ACTIVITY</span>
              <h2>Your coin story.</h2>
            </div>
          </div>
          {(ledger ?? []).length ? (
            (ledger ?? []).map((r: any) => (
              <div className="pn-ledger-row" key={r.id}>
                <div>
                  <span>{r.note ?? r.ledger_type.replaceAll("_", " ")}</span>
                  <small>{new Date(r.created_at).toLocaleDateString()}</small>
                </div>
                <strong className={r.coin_delta > 0 ? "positive" : ""}>
                  {r.coin_delta > 0 ? "+" : ""}
                  {r.coin_delta}
                </strong>
              </div>
            ))
          ) : (
            <div className="pn-friendly-empty small">
              <Sparkles className="w-5 h-5 text-[#FF5E3A] shrink-0" strokeWidth={1.75} />
              <div>
                <h3>No Peach Coin activity yet.</h3>
                <p>Purchases, refills and project reservations will show here.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </PeachAppShell>
  );
}
