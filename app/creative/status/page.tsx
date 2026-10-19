import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { PeachBrand } from "../../components/brand";

function levelName(level?: string | null) {
  if (!level) return "Not assigned yet";
  return `Peach ${level[0].toUpperCase() + level.slice(1)}`;
}

export default async function CreativeStatusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=creative&mode=signin");
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("full_name,role").eq("id", user.id).single();
  if (profile?.role === "business") redirect("/business");
  const { data: creative } = await admin.from("creatives").select("application_status,peach_level,primary_specialty").eq("user_id", user.id).single();
  if (!creative) redirect("/creative/apply");
  const approved = creative.application_status === "approved";

  return <main className="shell" style={{maxWidth:820}}>
    <PeachBrand full/>
    <section className="card" style={{marginTop:30,padding:30}}>
      <span className="eyebrow">CREATIVE STATUS</span>
      <h1 style={{fontSize:42,lineHeight:1.05,letterSpacing:"-.04em"}}>{approved?"You’re officially in the Network.":"Your work is with Peach Review."}</h1>
      <p className="muted" style={{fontSize:18}}>{approved?"Your creative dashboard, private matches and project tools are ready.":"Peach reviews your portfolio, experience and specialty before assigning a starting level."}</p>
      <div className="stat-row"><div className="stat-card"><small>STATUS</small><strong style={{fontSize:22,textTransform:"capitalize"}}>{creative.application_status.replaceAll("_"," ")}</strong></div><div className="stat-card"><small>PEACH LEVEL</small><strong style={{fontSize:22}}>{levelName(creative.peach_level)}</strong></div><div className="stat-card"><small>SPECIALTY</small><strong style={{fontSize:20}}>{creative.primary_specialty??"—"}</strong></div></div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:18}}>{approved?<Link href="/creative" className="btn btn-primary">Open Creative Dashboard</Link>:<><Link href="/account" className="btn btn-outline">Account</Link><Link href="/creative/apply" className="btn btn-soft">Update Application</Link></>}</div>
    </section>
  </main>;
}
