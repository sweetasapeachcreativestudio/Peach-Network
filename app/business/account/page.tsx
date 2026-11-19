import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeBusinessBrandReadiness } from "@/lib/readiness";
import { PeachAppShell } from "@/app/components/peach-app-shell";
import {
  BusinessProfileClient,
  type ShowcasePhoto,
  type SocialHandlesData,
} from "./business-profile-client";

export const dynamic = "force-dynamic";

export default async function BusinessAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?role=business&mode=signin");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name,email,role,phone,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "creative") redirect("/creative");
  if (profile?.role === "admin") redirect("/admin");

  let { data: business } = await admin
    .from("businesses")
    .select(
      "id,name,industry,phone,website,description,address_line1,city,state,postal_code,logo_url,preferred_contact,common_needs"
    )
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (!business) {
    const bizName =
      user.user_metadata?.business_name ||
      (profile?.full_name ? `${profile.full_name}'s Business` : "My Business");
    const { data: createdBiz } = await admin
      .from("businesses")
      .insert({
        owner_user_id: user.id,
        name: bizName,
        industry: "Restaurant & Hospitality",
      })
      .select(
        "id,name,industry,phone,website,description,address_line1,city,state,postal_code,logo_url,preferred_contact,common_needs"
      )
      .maybeSingle();
    business = createdBiz;
  }

  if (!business) redirect("/business");

  const [{ data: wallet }, { data: brandAssets }] = await Promise.all([
    admin
      .from("coin_wallets")
      .select("available_coins")
      .eq("business_id", business.id)
      .maybeSingle(),
    admin
      .from("business_brand_assets")
      .select("id,kind,label,value,notes,storage_path,original_name")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),
  ]);

  const assetsList = (brandAssets ?? []) as any[];
  const readiness = computeBusinessBrandReadiness(business, assetsList);

  const photos: ShowcasePhoto[] = assetsList
    .filter((a) => a.kind === "photo" || a.kind === "image")
    .map((a) => ({
      id: a.id,
      label: a.label || a.original_name || "Showcase Photo",
      notes: a.notes,
      value: a.value,
      storage_path: a.storage_path,
      original_name: a.original_name,
    }));

  const socialAsset = assetsList.find(
    (a) => a.kind === "other" && String(a.label || "").toLowerCase() === "social handles"
  );
  let initialSocials: SocialHandlesData = {
    instagram: "",
    tiktok: "",
    facebook: "",
    assetId: socialAsset?.id || null,
  };
  if (socialAsset?.value) {
    try {
      const parsed = JSON.parse(socialAsset.value);
      initialSocials = {
        instagram: parsed.instagram || "",
        tiktok: parsed.tiktok || "",
        facebook: parsed.facebook || "",
        assetId: socialAsset.id,
      };
    } catch {}
  }

  return (
    <PeachAppShell
      role="business"
      active="account"
      name={profile?.full_name}
      coinCount={wallet?.available_coins ?? 0}
      businessName={business.name}
      logoUrl={business.logo_url}
    >
      <div className="space-y-6">
        <BusinessProfileClient
          initialProfile={{
            fullName: profile?.full_name ?? "",
            email: profile?.email ?? user.email ?? "",
            phone: profile?.phone ?? "",
            businessName: business.name ?? "",
            industry: business.industry ?? "",
            description: business.description ?? "",
            businessPhone: business.phone ?? "",
            website: business.website ?? "",
            addressLine1: business.address_line1 ?? "",
            city: business.city ?? "",
            state: business.state ?? "",
            postalCode: business.postal_code ?? "",
            logoUrl: business.logo_url ?? "",
            preferredContact: business.preferred_contact ?? "",
            commonNeeds: Array.isArray(business.common_needs) ? business.common_needs : [],
          }}
          initialPhotos={photos}
          initialSocials={initialSocials}
          initialReadiness={readiness}
          brandAssetCount={assetsList.length}
        />
      </div>
    </PeachAppShell>
  );
}
