import "server-only";

export interface BannerCarouselSlide {
  id: string;
  kind: "image_banner" | "event" | "special";
  badge: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  dateLabel?: string | null;
  desktopImageUrl?: string | null;
  mobileImageUrl?: string | null;
  ctaLabel: string;
  ctaHref: string;
}

export interface BusinessEventRecord {
  id: string;
  badge: string;
  title: string;
  subtitle?: string | null;
  description: string;
  location?: string | null;
  event_date?: string | null;
  ends_at?: string | null;
  cta_label: string;
  cta_href: string;
  is_active: boolean;
  created_at?: string;
}

const FALLBACK_UPCOMING_EVENTS: BusinessEventRecord[] = [
  {
    id: "fallback-special-rates",
    badge: "Partner Special",
    title: "2026 Master Scoping Rates & Transparent Project Protection",
    subtitle: "1 Peach Coin = $50.00 USD across all 6 core commercial disciplines",
    description:
      "Every project includes 3 included revision rounds, mutual digital signatures, and Review Proofs Before Sign-Off.",
    location: "Peach Network",
    event_date: null,
    ends_at: "2027-12-31T23:59:59.000Z",
    cta_label: "Explore Peach Business",
    cta_href: "/business/peach-business",
    is_active: true,
  },
  {
    id: "fallback-spring-bundle",
    badge: "Coin Bonus",
    title: "Studio Bundle Bonus: +2 Complimentary Coins on 10+ Coin Top-Ups",
    subtitle: "Receive $100 USD in extra creative credits for add-ons or revisions",
    description:
      "Top up 10 Peach Coins or more to unlock 2 bonus coins directly in your Peach Wallet for active projects.",
    location: "Wallet & Billing",
    event_date: null,
    ends_at: "2027-06-30T23:59:59.000Z",
    cta_label: "View Coin Packs",
    cta_href: "/business/wallet",
    is_active: true,
  },
  {
    id: "fallback-bhm-showcase",
    badge: "Upcoming Event",
    title: "Birmingham Hospitality & Retail Creator Showcase",
    subtitle: "In-person brand teardowns, culinary styling demos & founder mixer",
    description:
      "Connect directly with vetted local creative directors, photographers, and web designers. Free for Peach Business partners.",
    location: "Birmingham, AL",
    event_date: "2027-02-18T18:00:00.000Z",
    ends_at: "2027-02-18T21:00:00.000Z",
    cta_label: "View Event Details",
    cta_href: "/business/peach-business",
    is_active: true,
  },
];

export function isRecordUpcomingOrActive(
  record: { is_active?: boolean | null; starts_at?: string | null; event_date?: string | null; ends_at?: string | null },
  nowMs = Date.now()
): boolean {
  if (record.is_active === false) return false;
  if (record.starts_at) {
    const startMs = new Date(record.starts_at).getTime();
    if (!Number.isNaN(startMs) && startMs > nowMs) return false;
  }
  if (record.event_date) {
    const eventMs = new Date(record.event_date).getTime();
    if (!Number.isNaN(eventMs) && eventMs < nowMs) return false;
  }
  if (record.ends_at) {
    const endMs = new Date(record.ends_at).getTime();
    if (!Number.isNaN(endMs) && endMs < nowMs) return false;
  }
  return true;
}

function formatEventDate(value?: string | null, location?: string | null): string | null {
  const parts: string[] = [];
  if (value) {
    const dt = new Date(value);
    if (!Number.isNaN(dt.getTime())) {
      parts.push(
        dt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    }
  }
  if (location && location.trim()) {
    parts.push(location.trim());
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export async function getActivePeachBusinessEvents(admin: any): Promise<BusinessEventRecord[]> {
  const nowMs = Date.now();
  try {
    const { data, error } = await admin
      .from("business_events")
      .select("id,badge,title,subtitle,description,location,event_date,ends_at,cta_label,cta_href,is_active,created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return (data as BusinessEventRecord[]).filter((ev) => isRecordUpcomingOrActive(ev, nowMs));
    }
  } catch {
    // Graceful fallback when table has not been migrated yet
  }
  return FALLBACK_UPCOMING_EVENTS.filter((ev) => isRecordUpcomingOrActive(ev, nowMs));
}

const FALLBACK_CUSTOM_BANNERS = [
  {
    id: "fallback-beta-test-live",
    title: "Welcome to the Beta Test, Business Owners!",
    subtitle: "Check out Peach Business to submit feedback on anything broken or share suggestions.",
    desktop_image_url: "/assets/aistudio/Code_Generated_Image_e26f9006.png",
    mobile_image_url: "/assets/aistudio/Code_Generated_Image_e26f9006.png",
    cta_label: "Go to Peach Business",
    cta_href: "/business/peach-business#feedback",
    is_active: true,
    sort_order: 0,
  },
];

export async function getActiveDashboardBannerSlides(admin: any): Promise<BannerCarouselSlide[]> {
  const nowMs = Date.now();
  const slides: BannerCarouselSlide[] = [];
  let hasBetaInDb = false;

  try {
    const { data: banners, error } = await admin
      .from("admin_banners")
      .select("id,title,subtitle,desktop_image_url,mobile_image_url,cta_label,cta_href,is_active,sort_order,starts_at,ends_at")
      .order("sort_order", { ascending: true });

    if (!error && Array.isArray(banners)) {
      hasBetaInDb = banners.some((b: any) =>
        String(b.desktop_image_url || "").includes("Code_Generated_Image_e26f9006.png")
      );
      for (const b of banners as any[]) {
        if (!isRecordUpcomingOrActive(b, nowMs)) continue;
        if (!b.desktop_image_url && !b.mobile_image_url) continue;
        slides.push({
          id: `banner-${b.id}`,
          kind: "image_banner",
          badge: "Featured",
          title: b.title || "Peach Network Feature",
          subtitle: b.subtitle || null,
          desktopImageUrl: b.desktop_image_url || b.mobile_image_url,
          mobileImageUrl: b.mobile_image_url || b.desktop_image_url,
          ctaLabel: b.cta_label || "Learn More",
          ctaHref: b.cta_href || "/business/peach-business",
        });
      }
    }
  } catch {
    // Graceful fallback when admin_banners table has not been migrated yet
  }

  if (!hasBetaInDb) {
    for (const b of FALLBACK_CUSTOM_BANNERS) {
      slides.unshift({
        id: `banner-${b.id}`,
        kind: "image_banner",
        badge: "Beta Test",
        title: b.title,
        subtitle: b.subtitle,
        desktopImageUrl: b.desktop_image_url,
        mobileImageUrl: b.mobile_image_url,
        ctaLabel: b.cta_label,
        ctaHref: b.cta_href,
      });
    }
  }

  const events = await getActivePeachBusinessEvents(admin);
  for (const ev of events) {
    const isSpecial = ev.badge.toLowerCase().includes("special") || ev.badge.toLowerCase().includes("bonus");
    slides.push({
      id: `event-${ev.id}`,
      kind: isSpecial ? "special" : "event",
      badge: ev.badge || "Upcoming Event",
      title: ev.title,
      subtitle: ev.subtitle || null,
      description: ev.description,
      dateLabel: formatEventDate(ev.event_date, ev.location),
      ctaLabel: ev.cta_label || "View Details",
      ctaHref: ev.cta_href || "/business/peach-business",
    });
  }

  return slides;
}
