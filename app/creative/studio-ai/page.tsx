import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PeachAppShell } from "@/app/components/peach-app-shell";
import { PeachStudioAIBox } from "@/app/creative/components/peach-studio-ai-box";
import { ArrowLeft, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CreativeStudioAIPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=creative&mode=signin");

  const admin = createAdminClient();
  const [{ data: profile }, { data: creative }] = await Promise.all([
    admin.from("profiles").select("full_name,role,avatar_url").eq("id", user.id).maybeSingle(),
    admin.from("creatives").select("id,peach_level,primary_specialty").eq("user_id", user.id).maybeSingle(),
  ]);

  if (profile?.role === "business") redirect("/business");

  return (
    <PeachAppShell
      role="creative"
      active="studio_ai"
      name={profile?.full_name}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        <header className="flex items-center justify-between pb-3 border-b border-stone-200">
          <Link
            href="/creative"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Creative Hub</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#EB6244]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Peach Studio AI Assistant</span>
          </div>
        </header>

        <PeachStudioAIBox />
      </div>
    </PeachAppShell>
  );
}
