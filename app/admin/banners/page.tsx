import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { BannerManagerClient } from "./banner-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const admin = createAdminClient();
  let banners: any[] = [];
  let events: any[] = [];

  try {
    const [{ data: b }, { data: e }] = await Promise.all([
      admin.from("admin_banners").select("*").order("sort_order", { ascending: true }),
      admin.from("business_events").select("*").order("created_at", { ascending: false }),
    ]);
    banners = b ?? [];
    events = e ?? [];
  } catch {
    // Graceful fallback before migration
  }

  return (
    <div className="min-h-screen bg-[#FFF8F3] text-[#17251E] p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D6CFC7]">
          <div>
            <Link
              href="/admin"
              className="text-sm font-bold text-[#17251E] hover:underline inline-block mb-1"
            >
              ← Back to Peach HQ
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17251E] tracking-tight">
              Admin Banner Manager
            </h1>
            <p className="text-sm text-[#3C4A42] mt-1">
              Publish custom image banners (1600×460 desktop / 1080×560 mobile) and Peach Business upcoming events or specials for the /business carousel.
            </p>
          </div>
        </header>

        <BannerManagerClient initialBanners={banners} initialEvents={events} />
      </div>
    </div>
  );
}
