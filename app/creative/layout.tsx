import { ReactNode } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export default async function CreativeLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=creative&mode=signin");

  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("peach_role")?.value;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // Only redirect away if the profile is explicitly business and cookie does not specify creative
  if (profile?.role === "business" && roleCookie !== "creative") {
    redirect("/business");
  }

  return children;
}

