import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppHeader, BottomNav } from "../components/app-nav";

function prettyLevel(level?: string | null) {
  if (!level) return "Not assigned yet";
  return `Peach ${level[0].toUpperCase() + level.slice(1)}`;
}

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=signin");

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("full_name,email,role").eq("id", user.id).single();
  if (!profile) redirect("/auth?mode=signin");
  const role = profile.role === "creative" ? "creative" : "business";

  const { data: business } = role === "business" ? await admin.from("businesses").select("name,industry").eq("owner_user_id",user.id).maybeSingle() : {data:null} as any;
  const { data: creative } = role === "creative" ? await admin.from("creatives").select("primary_specialty,city,state,peach_level,application_status,reliability_score").eq("user_id",user.id).maybeSingle() : {data:null} as any;
  const displayName = profile.full_name ?? (business as any)?.name ?? "Peach Member";

  return <main className="app-shell">
    <AppHeader name={profile.full_name} role={role}/>
    <div className="section-row"><div><span className="eyebrow">PROFILE & ACCOUNT</span><h2>Your place in Peach Network.</h2><p>Profile details, role and account controls live here.</p></div></div>

    <section className="profile-layout">
      <aside className="profile-card-main">
        <div className="profile-large-avatar">{displayName.trim()[0]?.toUpperCase() ?? "P"}</div>
        <h1>{displayName}</h1>
        <p>{role === "creative" ? prettyLevel((creative as any)?.peach_level) : (business as any)?.name ?? "Business Member"}</p>
        {role === "creative" && <span className="pill" style={{background:"#fff",color:"var(--peach-green)",border:0}}>{(creative as any)?.primary_specialty ?? "Creative"}</span>}
        {role === "business" && <span className="pill" style={{background:"#fff",color:"var(--peach-green)",border:0}}>Business Account</span>}
      </aside>

      <div className="profile-detail-card">
        <h2 style={{marginTop:0}}>Profile details</h2>
        <div className="profile-row"><small>NAME</small><strong>{profile.full_name ?? "—"}</strong></div>
        <div className="profile-row"><small>EMAIL</small><strong>{profile.email ?? user.email ?? "—"}</strong></div>
        <div className="profile-row"><small>ROLE</small><strong style={{textTransform:"capitalize"}}>{profile.role}</strong></div>
        {role === "business" && <><div className="profile-row"><small>BUSINESS</small><strong>{(business as any)?.name ?? "—"}</strong></div><div className="profile-row"><small>INDUSTRY</small><strong>{(business as any)?.industry ?? "Not added yet"}</strong></div></>}
        {role === "creative" && <><div className="profile-row"><small>PEACH LEVEL</small><strong>{prettyLevel((creative as any)?.peach_level)}</strong></div><div className="profile-row"><small>SPECIALTY</small><strong>{(creative as any)?.primary_specialty ?? "—"}</strong></div><div className="profile-row"><small>LOCATION</small><strong>{(creative as any)?.city ? `${(creative as any).city}${(creative as any).state ? `, ${(creative as any).state}` : ""}` : "Not added yet"}</strong></div><div className="profile-row"><small>APPLICATION</small><strong style={{textTransform:"capitalize"}}>{((creative as any)?.application_status ?? "—").replaceAll("_"," ")}</strong></div></>}
        <form action="/auth/signout" method="post" style={{marginTop:22}}><button className="btn btn-outline" type="submit">Log Out</button></form>
      </div>
    </section>

    <BottomNav role={role} active="profile"/>
  </main>;
}
