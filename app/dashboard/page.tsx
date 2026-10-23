import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("peach_role")?.value;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const resolvedRole = profile?.role || roleCookie || user.user_metadata?.role || "business";

  if (resolvedRole === "creative") {
    redirect("/creative");
  } else if (resolvedRole === "admin") {
    redirect("/admin");
  } else {
    redirect("/business");
  }
}
