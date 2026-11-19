import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isRealSupabaseEnv } from "@/lib/supabase/admin";
import { PeachAppShell } from "../components/peach-app-shell";
import ProfileEditor from "./profile-editor";
import { PhoneAlertsCard } from "../components/phone-alerts-card";
import { LogoutButton } from "../components/logout-button";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string; tab?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=signin");

  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("peach_role")?.value;

  const admin = createAdminClient();
  let { data: profile } = await admin
    .from("profiles")
    .select("full_name,email,role,phone,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const defaultRole = (user.user_metadata?.role || "business") as "business" | "creative";
    profile = {
      full_name:
        user.user_metadata?.full_name || (user.email ? user.email.split("@")[0] : "Peach Member"),
      email: user.email || "",
      role: defaultRole,
      phone: "",
      avatar_url: "",
    };
  }

  if (profile.role === "admin") redirect("/admin");

  const params = searchParams ? await searchParams : {};
  const preferCreativePreview = !isRealSupabaseEnv() && roleCookie === "creative";
  const role = profile.role === "creative" || preferCreativePreview ? "creative" : "business";
  const activeTab = params.tab === "sms" ? "sms" : "profile";
  if (role === "business" && activeTab !== "sms") {
    redirect("/business/account");
  }
  if (params.edit !== "1" && activeTab !== "sms") {
    redirect(role === "creative" ? "/creative" : "/business");
  }

  let initial: any = {
    fullName: profile.full_name ?? "",
    phone: profile.phone ?? "",
    avatarUrl: profile.avatar_url ?? "",
  };
  let certifications: any[] = [];
  let featured: any[] = [];
  let businessMeta: { name?: string | null; logo_url?: string | null; coins?: number } = {};

  if (role === "business") {
    const { data: b } = await admin
      .from("businesses")
      .select(
        "id,name,industry,phone,website,description,address_line1,city,state,postal_code,logo_url,preferred_contact,common_needs"
      )
      .eq("owner_user_id", user.id)
      .maybeSingle();

    let coins = 0;
    if (b?.id) {
      const { data: w } = await admin
        .from("coin_wallets")
        .select("available_coins")
        .eq("business_id", b.id)
        .maybeSingle();
      coins = w?.available_coins ?? 0;
    }

    businessMeta = {
      name: b?.name ?? null,
      logo_url: b?.logo_url ?? null,
      coins,
    };

    initial = {
      ...initial,
      businessName: b?.name ?? "",
      industry: b?.industry ?? "",
      businessPhone: b?.phone ?? "",
      website: b?.website ?? "",
      description: b?.description ?? "",
      addressLine1: b?.address_line1 ?? "",
      city: b?.city ?? "",
      state: b?.state ?? "",
      postalCode: b?.postal_code ?? "",
      logoUrl: b?.logo_url ?? "",
      preferredContact: b?.preferred_contact ?? "",
      commonNeeds: (b?.common_needs ?? []).join(", "),
    };
  } else {
    const { data: c } = await admin
      .from("creatives")
      .select(
        "id,primary_specialty,secondary_specialties,tools,industries,city,state,peach_level,bio,education_level,education_detail,portfolio_url,availability_text,remote_available,service_radius_miles,profile_image_url,mentor_name,mentorship_notes"
      )
      .eq("user_id", user.id)
      .maybeSingle();
    initial = {
      ...initial,
      avatarUrl: c?.profile_image_url || initial.avatarUrl,
      creativeId: c?.id,
      primarySpecialty: c?.primary_specialty ?? "",
      secondarySpecialties: (c?.secondary_specialties ?? []).join(", "),
      tools: (c?.tools ?? []).join(", "),
      industries: (c?.industries ?? []).join(", "),
      city: c?.city ?? "",
      state: c?.state ?? "",
      peachLevel: c?.peach_level ?? "",
      bio: c?.bio ?? "",
      educationLevel: c?.education_level ?? "",
      educationDetail: c?.education_detail ?? "",
      portfolioUrl: c?.portfolio_url ?? "",
      availabilityText: c?.availability_text ?? "",
      remoteAvailable: c?.remote_available ?? true,
      serviceRadiusMiles: c?.service_radius_miles ?? "",
      mentorName: c?.mentor_name ?? "",
      mentorshipNotes: c?.mentorship_notes ?? "",
    };
    if (c?.id) {
      const [{ data: cert }, { data: work }] = await Promise.all([
        admin
          .from("creative_certifications")
          .select("id,title,issuer,completed_at")
          .eq("creative_id", c.id)
          .order("created_at", { ascending: false }),
        admin
          .from("creative_featured_work")
          .select("id,title,description,project_url,image_url,tags")
          .eq("creative_id", c.id)
          .order("created_at", { ascending: false })
          .limit(6),
      ]);
      certifications = cert ?? [];
      featured = work ?? [];
    }
  }

  return (
    <PeachAppShell
      role={role}
      active={activeTab === "sms" ? "notifications" : "account"}
      name={profile.full_name}
      businessName={role === "business" ? businessMeta.name : undefined}
      logoUrl={role === "business" ? businessMeta.logo_url : initial.avatarUrl || undefined}
      coinCount={role === "business" ? businessMeta.coins ?? 0 : undefined}
    >
      <div className="space-y-6">
        {/* Account & SMS Settings Navigation Menu */}
        <nav
          aria-label="Account and SMS Settings menu"
          className="bg-white border border-[#F7DFD0] rounded-3xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-[0_12px_32px_rgba(232,93,59,0.06)]"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={role === "business" ? "/business/account" : "/account?edit=1"}
              className={`px-4 py-2 rounded-2xl text-sm font-bold transition-colors ${
                activeTab === "profile"
                  ? "bg-[#FF5E3A] text-white"
                  : "bg-[#FFF6EE] text-[#231714] hover:bg-[#FFD8BE]"
              }`}
            >
              Profile Details
            </Link>
            <Link
              href="/account?edit=1&tab=sms#sms-settings"
              className={`px-4 py-2 rounded-2xl text-sm font-bold transition-colors ${
                activeTab === "sms"
                  ? "bg-[#FF5E3A] text-white"
                  : "bg-[#FFF6EE] text-[#231714] hover:bg-[#FFD8BE]"
              }`}
            >
              SMS Settings Menu
            </Link>
            <Link
              href="/notifications#sms-settings"
              className="px-4 py-2 rounded-2xl text-sm font-bold bg-[#FFF6EE] text-[#231714] hover:bg-[#FFD8BE] transition-colors"
            >
              Alerts &amp; Notification Feed
            </Link>
          </div>

          <Link
            href={role === "creative" ? "/creative" : "/business"}
            className="px-4 py-2 rounded-2xl text-sm font-bold bg-[#231714] text-white hover:bg-[#3A2722] transition-colors"
          >
            Back to Dashboard
          </Link>
        </nav>

        {/* If user clicked SMS Settings, surface the SMS Settings Menu immediately above the fold */}
        {activeTab === "sms" && (
          <div>
            <PhoneAlertsCard initialPhone={initial.phone} role={role} />
          </div>
        )}

        <div id="edit-profile" className="bg-white border border-[#F7DFD0] rounded-3xl p-6 sm:p-7 shadow-[0_12px_32px_rgba(232,93,59,0.08)]">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF5E3A] block mb-1">
            {role === "business" ? "EDIT YOUR PROFILE" : "PROFILE & CREATIVE PASSPORT"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#231714] tracking-tight">
            {role === "creative" ? "Your creative passport." : "Keep Peach up to date."}
          </h1>
          <p className="text-sm text-[#4A3B36] mt-1.5 max-w-2xl">
            {role === "creative"
              ? "Upload your profile photo and keep your skills, portfolio, education, and mentorship up to date for Peach Match."
              : "Update the details Peach uses to understand your business and recommend stronger creative matches."}
          </p>
        </div>

        <ProfileEditor
          role={role}
          initial={initial}
          certifications={certifications}
          featured={featured}
        />

        {activeTab !== "sms" && (
          <div>
            <PhoneAlertsCard initialPhone={initial.phone} role={role} />
          </div>
        )}

        <div className="pt-2">
          <LogoutButton
            label="Log Out"
            className="px-5 py-2.5 rounded-2xl bg-white border border-[#F7DFD0] text-[#FF5E3A] hover:bg-[#FFD8BE] text-sm font-extrabold cursor-pointer transition-colors"
          />
        </div>
      </div>
    </PeachAppShell>
  );
}
