import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppHeader, BottomNav } from "../../components/app-nav";
import ProjectBuilder from "./project-builder";

export default async function NewProject() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=business&mode=signin");
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("full_name,role").eq("id", user.id).single();
  if (profile?.role === "creative") redirect("/creative");
  const { data: business } = await admin.from("businesses").select("id").eq("owner_user_id",user.id).single();
  if (!business) redirect("/auth?role=business&mode=signup");
  const { data: wallet } = await admin.from("coin_wallets").select("available_coins").eq("business_id", business.id).maybeSingle();

  return <main className="app-shell">
    <AppHeader name={profile?.full_name} role="business" coinCount={wallet?.available_coins ?? 0}/>
    <div className="builder-top"><Link className="back-link" href="/business">← Back to Dashboard</Link></div>
    <div className="builder-heading"><span className="eyebrow">START A PROJECT · PEACH AI</span><h1>From idea to project in about 60 seconds.</h1><p>Talk to Peach like a person. We’ll turn your answers into a clean brief and find creatives who fit.</p></div>
    <ProjectBuilder availableCoins={wallet?.available_coins ?? 0}/>
    <BottomNav role="business" active="projects"/>
  </main>;
}
