import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppHeader, BottomNav } from "../../components/app-nav";
import ProjectBuilder from "./project-builder";

export default async function NewProject({ searchParams }: { searchParams: Promise<{ brief?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/auth?role=business&mode=signin${params.brief ? `&next=${encodeURIComponent(`/business/new-project?brief=${params.brief}`)}` : ""}`);
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("full_name,role").eq("id", user.id).single();
  if (profile?.role === "creative") redirect("/creative");
  const { data: business } = await admin.from("businesses").select("id").eq("owner_user_id",user.id).single();
  if (!business) redirect("/auth?role=business&mode=signup");
  const { data: wallet } = await admin.from("coin_wallets").select("available_coins").eq("business_id", business.id).maybeSingle();

  return <main className="app-shell">
    <AppHeader name={profile?.full_name} role="business" coinCount={wallet?.available_coins ?? 0}/>
    <div className="builder-top"><Link className="back-link" href="/business">← Back to Dashboard</Link></div>
    <div className="builder-heading"><span className="eyebrow">PEACH MATCH AI · BETA</span><h1>Tell Peach what you need.</h1><p>Start in plain language. We’ll turn it into a project, estimate the coins, then match it against the network.</p></div>
    <ProjectBuilder availableCoins={wallet?.available_coins ?? 0} initialBrief={params.brief ?? ""}/>
    <BottomNav role="business" active="projects"/>
  </main>;
}
