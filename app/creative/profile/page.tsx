import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PeachAppShell } from "@/app/components/peach-app-shell";
import PortfolioEditor from "./portfolio-editor";

import { formatCityHub } from "@/lib/hubs";

export const dynamic = "force-dynamic";

export default async function Page() {
  const s = await createClient();
  const {
    data: { user },
  } = await s.auth.getUser();
  if (!user) redirect("/auth?role=creative&mode=signin");

  const a = createAdminClient();
  const [{ data: profile }, { data: c }] = await Promise.all([
    a.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    a
      .from("creatives")
      .select("id,application_status,primary_specialty,peach_level,bio,city,state")
      .eq("user_id", user.id)
      .single(),
  ]);

  if (!c) redirect("/creative/apply");

  const { data: work } = await a
    .from("creative_featured_work")
    .select("*")
    .eq("creative_id", c.id)
    .order("created_at", { ascending: false });

  const creativeHub = formatCityHub(c.city, c.state);

  return (
    <PeachAppShell role="creative" active="portfolio" name={profile?.full_name}>
      <div className="builder-heading">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="eyebrow">YOUR PEACH PROFILE</span>
          <span className="text-xs font-bold bg-[#FFD8BE] text-[#231714] px-3 py-1 rounded-full">
            {creativeHub}
          </span>
        </div>
        <h1>Show Peach what you actually do.</h1>
        <p>
          Your featured work and {creativeHub} profile help Peach AI understand your niche and show relevant examples when matching you to businesses.
        </p>
      </div>
      <PortfolioEditor work={work ?? []} approved={c.application_status === "approved"} />
    </PeachAppShell>
  );
}