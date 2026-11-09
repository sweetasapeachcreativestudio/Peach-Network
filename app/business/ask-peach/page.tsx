import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PeachAppShell } from "@/app/components/peach-app-shell";
import { PeachMatchAIBox } from "@/app/business/components/peach-match-ai-box";
import { ArrowLeft, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AskPeachPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=business&mode=signin");

  const admin = createAdminClient();
  const [{ data: profile }, { data: business }] = await Promise.all([
    admin.from("profiles").select("full_name,role").eq("id", user.id).maybeSingle(),
    admin.from("businesses").select("id,name,logo_url").eq("owner_user_id", user.id).maybeSingle(),
  ]);

  const bizName = business?.name || "My Business";
  const { data: wallet } = business?.id
    ? await admin.from("coin_wallets").select("available_coins").eq("business_id", business.id).maybeSingle()
    : { data: null };

  const coins = wallet?.available_coins ?? 14;

  return (
    <PeachAppShell
      role="business"
      active="home"
      name={profile?.full_name}
      businessName={bizName}
      logoUrl={business?.logo_url}
      coinCount={coins}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        <header className="flex items-center justify-between pb-3 border-b border-stone-200">
          <Link
            href="/business"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="inline-flex items-center gap-1 text-xs font-bold text-[#EB6244]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Creative Advisory</span>
          </div>
        </header>

        <PeachMatchAIBox
          initialAvailableCoins={coins}
          businessName={bizName}
        />
      </div>
    </PeachAppShell>
  );
}
