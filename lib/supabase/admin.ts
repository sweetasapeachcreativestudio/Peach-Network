import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function isRealSupabaseEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
      (url.startsWith("http://") || url.startsWith("https://")) &&
      key &&
      !url.includes("placeholder") &&
      !url.includes("your-project") &&
      !key.includes("placeholder")
  );
}

// In-memory persistent collections for mock/preview environment (shared across requests)
const globalMock = globalThis as unknown as {
  __peachMockShortlists?: Map<string, any[]>;
  __peachMockProjects?: Map<string, any>;
  __peachMockProjectsSeeded?: boolean;
  __peachMockOffers?: Map<string, any[]>;
  __peachMockAddOns?: Map<string, any[]>;
  __peachMockDisciplineData?: Map<string, any>;
  __peachMockNotificationPrefs?: Map<string, any>;
  __peachMockAuditLogs?: Map<string, any[]>;
  __peachMockMessages?: Map<string, any[]>;
  __peachMockFiles?: Map<string, any[]>;
  __peachMockWallets?: Map<string, { business_id: string; available_coins: number; held_coins: number }>;
  __peachMockNotifications?: any[];
  __peachMockBrandAssets?: Map<string, any[]>;
  __peachMockCoinLedger?: any[];
  __peachMockPayouts?: any[];
  __peachMockAdminBanners?: any[];
  __peachMockBusinessEvents?: any[];
  __peachMockStorageFiles?: Map<string, { buffer: Buffer; contentType: string; size: number }>;
  __peachMockBusinesses?: Map<string, any>;
  __peachMockProfiles?: Map<string, any>;
};

const mockStorageFiles = (globalMock.__peachMockStorageFiles ??= new Map<
  string,
  { buffer: Buffer; contentType: string; size: number }
>());
const mockBusinesses = (globalMock.__peachMockBusinesses ??= new Map<string, any>([
  [
    "biz_1",
    {
      id: "biz_1",
      owner_user_id: "usr_business_demo",
      name: "Magic City Brands",
      industry: "Culinary & Lifestyle",
      logo_url: null,
      phone: "205-555-0199",
      website: "www.magiccitybrands.com",
      description: "Premier local culinary and hospitality group in Birmingham, AL.",
      address_line1: "",
      city: "Birmingham",
      state: "AL",
      postal_code: "35203",
      preferred_contact: "Peach Room Chat + SMS",
      common_needs: ["Social Media Graphics", "Menu & Print Design", "Photography"],
    },
  ],
]));
const mockProfiles = (globalMock.__peachMockProfiles ??= new Map<string, any>());

export function getMockStorageFile(bucket: string, path: string) {
  return mockStorageFiles.get(`${bucket}:${path}`) || null;
}

export async function ensureStorageBucket(
  admin: any,
  bucket: string,
  isPublic = false
): Promise<void> {
  if (!isRealSupabaseEnv() || !admin?.storage?.getBucket) return;
  try {
    const { data, error } = await admin.storage.getBucket(bucket);
    if (!data || error) {
      await admin.storage.createBucket(bucket, {
        public: isPublic,
        fileSizeLimit: 26214400,
      });
    }
  } catch {
    // Ignore if bucket already exists or role lacks bucket-creation privilege; upload will report exact cause if needed.
  }
}

const mockShortlists = (globalMock.__peachMockShortlists ??= new Map<string, any[]>());
const mockProjects = (globalMock.__peachMockProjects ??= new Map<string, any>());
const mockOffers = (globalMock.__peachMockOffers ??= new Map<string, any[]>());
const mockAddOns = (globalMock.__peachMockAddOns ??= new Map<string, any[]>());
const mockNotificationPrefs = (globalMock.__peachMockNotificationPrefs ??= new Map<string, any>());
const mockAuditLogs = (globalMock.__peachMockAuditLogs ??= new Map<string, any[]>());
const mockMessages = (globalMock.__peachMockMessages ??= new Map<string, any[]>());
const mockFiles = (globalMock.__peachMockFiles ??= new Map<string, any[]>());
const mockWallets = (globalMock.__peachMockWallets ??= new Map<
  string,
  { business_id: string; available_coins: number; held_coins: number }
>([["biz_1", { business_id: "biz_1", available_coins: 28, held_coins: 4 }]]));
const mockNotifications = (globalMock.__peachMockNotifications ??= []);
const mockBrandAssets = (globalMock.__peachMockBrandAssets ??= new Map<string, any[]>());
const mockCoinLedger = (globalMock.__peachMockCoinLedger ??= [
  {
    id: "l_1",
    business_id: "biz_1",
    ledger_type: "membership_deposit",
    coin_delta: 24,
    note: "Monthly Growth Membership deposit",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "l_2",
    business_id: "biz_1",
    project_id: "p_1",
    ledger_type: "held",
    coin_delta: -4,
    note: "Escrow hold for Magic City Summer Launch Kit",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
]);
const mockPayouts = (globalMock.__peachMockPayouts ??= [
  {
    id: "pay_seed_1",
    project_id: "p_1",
    creative_id: "cr_maya",
    amount_cents: 15000,
    status: "pending",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]);
const mockAdminBanners = (globalMock.__peachMockAdminBanners ??= [
  {
    id: "ban_beta_live",
    title: "Welcome to the Beta Test, Business Owners!",
    subtitle: "Check out Peach Business to submit feedback on anything broken or share suggestions.",
    desktop_image_url: "/assets/aistudio/Code_Generated_Image_e26f9006.png",
    mobile_image_url: "/assets/aistudio/Code_Generated_Image_e26f9006.png",
    cta_label: "Go to Peach Business",
    cta_href: "/business/peach-business#feedback",
    is_active: true,
    sort_order: 0,
    starts_at: null,
    ends_at: null,
    created_at: new Date().toISOString(),
  },
]);
const mockBusinessEvents = (globalMock.__peachMockBusinessEvents ??= [
  {
    id: "evt_special_rates",
    badge: "Partner Special",
    title: "2026 Master Scoping Rates & Transparent Project Protection",
    subtitle: "1 Peach Coin = $50.00 USD across all 6 commercial disciplines",
    description:
      "Every project includes 3 revision rounds, mutual digital signatures, and Review Proofs Before Sign-Off.",
    location: "Peach Network",
    event_date: null,
    ends_at: new Date(Date.now() + 86400000 * 180).toISOString(),
    cta_label: "Explore Peach Business",
    cta_href: "/business/peach-business",
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "evt_spring_bonus",
    badge: "Coin Bonus",
    title: "Studio Bundle Bonus: +2 Complimentary Coins on 10+ Coin Top-Ups",
    subtitle: "Receive $100 USD in extra creative credits for add-ons or revisions",
    description:
      "Top up 10 Peach Coins or more this month and unlock 2 complimentary bonus coins in your Peach Wallet.",
    location: "Wallet & Billing",
    event_date: null,
    ends_at: new Date(Date.now() + 86400000 * 90).toISOString(),
    cta_label: "View Coin Packs",
    cta_href: "/business/wallet",
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "evt_bhm_showcase",
    badge: "Upcoming Event",
    title: "Birmingham Hospitality & Retail Creator Showcase",
    subtitle: "Live brand teardowns, culinary styling demos & partner mixer",
    description:
      "Meet vetted local creative directors, commercial photographers, and web designers. Free for Peach Business partners.",
    location: "Birmingham, AL",
    event_date: new Date(Date.now() + 86400000 * 24).toISOString(),
    ends_at: new Date(Date.now() + 86400000 * 24 + 10800000).toISOString(),
    cta_label: "View Event Details",
    cta_href: "/business/peach-business",
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "evt_past_archived",
    badge: "Upcoming Event",
    title: "Past Q3 Kickoff Mixer (Auto-Hidden)",
    subtitle: "Should never appear because event_date is in the past",
    description: "Past event record used to verify automatic expiration filtering.",
    location: "Birmingham, AL",
    event_date: new Date(Date.now() - 86400000 * 15).toISOString(),
    ends_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    cta_label: "Archive",
    cta_href: "/business/peach-business",
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
]);

function ensureSeededProjects() {
  if (globalMock.__peachMockProjectsSeeded) return;
  globalMock.__peachMockProjectsSeeded = true;

  const seededList = [
    {
      id: "p_1",
      title: "Magic City Summer Launch Kit",
      category: "Print & Social Campaign",
      description:
        "Comprehensive print collateral and social media banners for the summer culinary festival.",
      status: "in_progress",
      coin_amount: 4,
      due_at: new Date(Date.now() + 86400000 * 3).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      assigned_creative_id: "cr_maya",
      revision_rounds: 3,
      current_revision_round: 0,
      business_id: "biz_1",
    },
    {
      id: "p_2",
      title: "Seasonal Menu & Table Cards",
      category: "Commercial Print",
      description:
        "Full-bleed print menus and branded table card inserts with spot gloss specs.",
      status: "proof_uploaded",
      coin_amount: 2,
      due_at: new Date(Date.now() + 86400000 * 1).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      assigned_creative_id: "cr_jordan",
      revision_rounds: 3,
      current_revision_round: 0,
      business_id: "biz_1",
    },
    {
      id: "p_3",
      title: "Spring Brand Identity & Vector Suite",
      category: "Brand Identity",
      description:
        "Complete primary and secondary logo vector system, color guidelines, and commercial typography package.",
      status: "completed",
      coin_amount: 6,
      due_at: new Date(Date.now() - 86400000 * 14).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
      completed_at: new Date(Date.now() - 86400000 * 14).toISOString(),
      assigned_creative_id: "cr_nia",
      revision_rounds: 3,
      current_revision_round: 1,
      business_id: "biz_1",
    },
    {
      id: "p_4",
      title: "Artisan Coffee Packaging Dieline",
      category: "Packaging & Print",
      description:
        "Vector dielines, ingredient panel typography, and production-ready CMYK press proofs for bag packaging.",
      status: "completed",
      coin_amount: 5,
      due_at: new Date(Date.now() - 86400000 * 45).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
      completed_at: new Date(Date.now() - 86400000 * 45).toISOString(),
      assigned_creative_id: "cr_elijah",
      revision_rounds: 3,
      current_revision_round: 2,
      business_id: "biz_1",
    },
  ];

  for (const p of seededList) {
    if (!mockProjects.has(p.id)) {
      mockProjects.set(p.id, p);
    }
  }

  if (!mockBrandAssets.has("biz_1")) {
    mockBrandAssets.set("biz_1", [
      {
        id: "va_logo_1",
        business_id: "biz_1",
        label: "Magic City Primary Logo (SVG)",
        kind: "logo",
        value: null,
        notes: "Primary dark green horizontal lockup.",
        original_name: "magic-city-logo.svg",
        storage_path: "biz_1/magic-city-logo.svg",
        size_bytes: 24500,
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
      {
        id: "va_color_1",
        business_id: "biz_1",
        label: "Brand Terracotta Accent",
        kind: "color",
        value: "#C84E2D",
        notes: "Primary CTA & menu highlight color.",
        original_name: null,
        storage_path: null,
        size_bytes: null,
        created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
      },
    ]);
  }
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (isRealSupabaseEnv()) {
    return createSupabaseClient(url!, key!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  ensureSeededProjects();

  const approvedCreatives = [
    {
      id: "cr_maya",
      user_id: "usr_maya",
      peach_level: "blossom",
      application_status: "approved",
      available_for_projects: true,
      primary_specialty: "Brand & Campaign Identity",
      secondary_specialties: ["Package Design", "Print Collateral", "Typography Systems"],
      city: "Atlanta",
      state: "GA",
      tools: ["Adobe Illustrator", "Adobe InDesign", "Adobe Photoshop", "Figma"],
      industries: ["Hospitality", "Beverage", "Retail", "Lifestyle"],
      reliability_score: 99,
      profile_image_url: "/people/maya.jpg",
      bio: "Commercial brand designer who turns business goals into polished campaign systems, launch graphics, and print-ready production collateral.",
      featured_work: {
        id: "fw_maya_1",
        title: "Artisan Spirits Identity & Bottling",
        image_url: "/Project 1.png",
        industry: "Beverage & Hospitality",
        tags: ["Branding", "Packaging", "Print Production"],
      },
    },
    {
      id: "cr_jordan",
      user_id: "usr_jordan",
      peach_level: "sapling",
      application_status: "approved",
      available_for_projects: true,
      primary_specialty: "Sports & Event Graphics",
      secondary_specialties: ["Flyers & Posters", "Social Media Graphics", "Tournament Kits"],
      city: "Birmingham",
      state: "AL",
      tools: ["Adobe Photoshop", "Adobe Illustrator", "Canva Pro"],
      industries: ["Sports", "Events", "Fitness", "Community"],
      reliability_score: 96,
      profile_image_url: "/Creative1.JPG",
      bio: "High-energy commercial graphic designer specializing in athlete announcements, tournament flyers, event promo, and high-impact social layouts.",
      featured_work: {
        id: "fw_jordan_1",
        title: "Magic City Classic Championship Series",
        image_url: "/Project 2.png",
        industry: "Sports & Entertainment",
        tags: ["Event Promo", "Social Campaign", "Flyer"],
      },
    },
    {
      id: "cr_nia",
      user_id: "usr_nia",
      peach_level: "tree",
      application_status: "approved",
      available_for_projects: true,
      primary_specialty: "Web & Digital Experience",
      secondary_specialties: ["Landing Pages", "E-commerce UI", "Homepage Refreshes"],
      city: "Birmingham",
      state: "AL",
      tools: ["Figma", "Shopify", "Wix Studio", "Adobe XD"],
      industries: ["Retail", "E-commerce", "Beauty", "Small Business"],
      reliability_score: 98,
      profile_image_url: "/Creative2.jpg",
      bio: "Digital designer focused on attractive, responsive web designs and landing pages that convert visitors and elevate local brand trust.",
      featured_work: {
        id: "fw_nia_1",
        title: "Aura Botanical Skincare Storefront",
        image_url: "/Project 3.png",
        industry: "Retail & E-Commerce",
        tags: ["Web Design", "Shopify", "UI/UX"],
      },
    },
    {
      id: "cr_elijah",
      user_id: "usr_elijah",
      peach_level: "blossom",
      application_status: "approved",
      available_for_projects: true,
      primary_specialty: "Commercial Photography & Packaging",
      secondary_specialties: ["Commercial Photography", "Product Tabletop", "Culinary Shoots", "Label Dielines"],
      city: "Birmingham",
      state: "AL",
      tools: ["Adobe Illustrator", "InDesign", "Lightroom", "Photoshop"],
      industries: ["Food & Beverage", "Craft Breweries", "Specialty Retail"],
      reliability_score: 98,
      profile_image_url: "/people/elijah.jpg",
      bio: "Commercial photographer and print production veteran specializing in tabletop product shoots, culinary venue sessions, and packaging dielines.",
      featured_work: {
        id: "fw_elijah_1",
        title: "Red Mountain Cold Brew Tabletop Photo & Bottle Shoot",
        image_url: "/Project 4.png",
        industry: "Food & Beverage",
        tags: ["Commercial Photography", "Product Shoot", "Studio Lighting", "Packaging"],
      },
    },
    {
      id: "cr_sophie",
      user_id: "usr_sophie",
      peach_level: "tree",
      application_status: "approved",
      available_for_projects: true,
      primary_specialty: "Custom Illustration & Editorial",
      secondary_specialties: ["Brand Mascots", "Vector Iconography", "Merchandise Design"],
      city: "Huntsville",
      state: "AL",
      tools: ["Procreate", "Adobe Illustrator", "Photoshop"],
      industries: ["Craft Brewing", "Apparel", "Editorial", "Publishing"],
      reliability_score: 99,
      profile_image_url: "/people/sophie.jpg",
      bio: "Vector illustrator crafting distinct custom brand mascots, merchandise apparel graphics, and bespoke iconography.",
      featured_work: {
        id: "fw_sophie_1",
        title: "Urban Rooster Craft Beer Can Illustration",
        image_url: "/Project 6.jpg",
        industry: "Craft Brewing & Apparel",
        tags: ["Illustration", "Can Art", "Merch"],
      },
    },
    {
      id: "cr_avery",
      user_id: "usr_avery",
      peach_level: "sapling",
      application_status: "approved",
      available_for_projects: true,
      primary_specialty: "Short-Form Video & Motion",
      secondary_specialties: ["Reels & TikToks", "Logo Animation", "Promo Video"],
      city: "Montgomery",
      state: "AL",
      tools: ["Adobe Premiere Pro", "After Effects", "CapCut"],
      industries: ["Dining & Nightlife", "Personal Brands", "Events"],
      reliability_score: 97,
      profile_image_url: "/Creative 3.jpg",
      bio: "Fast-paced motion designer and video editor specializing in vertical video reels, animated logos, and social storytelling.",
      featured_work: {
        id: "fw_avery_1",
        title: "Highland Bar & Grill Launch Reel",
        image_url: "/project 7.jpg",
        industry: "Dining & Nightlife",
        tags: ["Video Reel", "Motion Graphics", "Social"],
      },
    },
  ];

  const profileMap: Record<string, any> = {
    usr_business_demo: {
      id: "usr_business_demo",
      full_name: "Peach Partner",
      role: "business",
      avatar_url: "/brand/business-owner.jpg",
      email: "partner@peachnetwork.com",
    },
    usr_maya: {
      id: "usr_maya",
      full_name: "Maya Brooks",
      role: "creative",
      avatar_url: "/people/maya.jpg",
      email: "maya@peachnetwork.com",
    },
    usr_jordan: {
      id: "usr_jordan",
      full_name: "Jordan Ellis",
      role: "creative",
      avatar_url: "/Creative1.JPG",
      email: "jordan@peachnetwork.com",
    },
    usr_nia: {
      id: "usr_nia",
      full_name: "Nia Carter",
      role: "creative",
      avatar_url: "/Creative2.jpg",
      email: "nia@peachnetwork.com",
    },
    usr_elijah: {
      id: "usr_elijah",
      full_name: "Elijah Vance",
      role: "creative",
      avatar_url: "/people/elijah.jpg",
      email: "elijah@peachnetwork.com",
    },
    usr_sophie: {
      id: "usr_sophie",
      full_name: "Sophie Chen",
      role: "creative",
      avatar_url: "/people/sophie.jpg",
      email: "sophie@peachnetwork.com",
    },
    usr_avery: {
      id: "usr_avery",
      full_name: "Avery Thomas",
      role: "creative",
      avatar_url: "/Creative 3.jpg",
      email: "avery@peachnetwork.com",
    },
    usr_creative_demo: {
      id: "usr_creative_demo",
      full_name: "Maya Brooks",
      role: "creative",
      avatar_url: "/people/maya.jpg",
      email: "creative@peachnetwork.com",
    },
    usr_admin_demo: {
      id: "usr_admin_demo",
      full_name: "Peach Admin",
      role: "admin",
      avatar_url: "/brand/business-owner.jpg",
      email: "admin@peachnetwork.com",
    },
  };

  for (const [k, v] of Object.entries(profileMap)) {
    if (!mockProfiles.has(k)) {
      mockProfiles.set(k, { ...v });
    }
  }

  function matchesRow(
    row: any,
    eqFilters: Record<string, any>,
    inFilters: Record<string, any[]>,
    neqFilters: Record<string, any>
  ) {
    for (const [k, v] of Object.entries(eqFilters)) {
      if (row?.[k] !== v) return false;
    }
    for (const [k, vals] of Object.entries(inFilters)) {
      if (!vals.includes(row?.[k])) return false;
    }
    for (const [k, v] of Object.entries(neqFilters)) {
      if (row?.[k] === v) return false;
    }
    return true;
  }

  return {
    async rpc(fnName: string, args: Record<string, any>) {
      if (fnName === "peach_hold_project_coins") {
        const bId = args.p_business_id;
        const coins = Number(args.p_coins || 0);
        const w = mockWallets.get(bId);
        if (!w || w.available_coins < coins) {
          return { data: null, error: { message: "Not enough available Peach Coins" } };
        }
        w.available_coins -= coins;
        w.held_coins += coins;
        mockCoinLedger.unshift({
          id: `l_${Date.now()}`,
          business_id: bId,
          project_id: args.p_project_id,
          ledger_type: "held",
          coin_delta: -coins,
          note: "Coins held for accepted Peach project.",
          created_at: new Date().toISOString(),
        });
        return { data: null, error: null };
      }

      if (fnName === "peach_release_project_coins") {
        const bId = args.p_business_id;
        const coins = Number(args.p_coins || 0);
        const w = mockWallets.get(bId);
        if (!w || w.held_coins < coins) {
          return { data: null, error: { message: "Unable to release held coins" } };
        }
        w.available_coins += coins;
        w.held_coins -= coins;
        mockCoinLedger.unshift({
          id: `l_${Date.now()}`,
          business_id: bId,
          project_id: args.p_project_id,
          ledger_type: "released",
          coin_delta: coins,
          note: "Held coins returned to Peach Wallet.",
          created_at: new Date().toISOString(),
        });
        return { data: null, error: null };
      }

      if (fnName === "peach_complete_project") {
        const bId = args.p_business_id;
        const coins = Number(args.p_coins || 0);
        const pId = args.p_project_id;
        const w = mockWallets.get(bId);
        if (w && w.held_coins >= coins) {
          w.held_coins -= coins;
        }
        const proj = mockProjects.get(pId);
        if (proj) {
          mockProjects.set(pId, {
            ...proj,
            status: "completed",
            completed_at: new Date().toISOString(),
          });
        }
        const payoutId = `pay_${Date.now()}`;
        mockPayouts.unshift({
          id: payoutId,
          project_id: pId,
          creative_id: args.p_creative_id,
          amount_cents: args.p_payout_cents || 0,
          status: "approved",
          approved_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
        return { data: payoutId, error: null };
      }

      return { data: null, error: null };
    },
    from(table: string) {
      const eqFilters: Record<string, any> = {};
      const inFilters: Record<string, any[]> = {};
      const neqFilters: Record<string, any> = {};
      let orderCol: string | null = null;
      let orderAsc = true;
      let limitVal: number | null = null;
      let operation: "select" | "insert" | "upsert" | "update" | "delete" = "select";
      let mutationResult: any = null;

      function applyMutation() {
        if (operation !== "update" || !mutationResult) return;

        if (table === "projects") {
          const updatedRows: any[] = [];
          for (const [id, proj] of mockProjects.entries()) {
            if (matchesRow(proj, eqFilters, inFilters, neqFilters)) {
              const next = { ...proj, ...mutationResult };
              mockProjects.set(id, next);
              updatedRows.push(next);
            }
          }
          mutationResult = updatedRows;
        } else if (table === "coin_wallets") {
          const bId = eqFilters.business_id || "biz_1";
          const current = mockWallets.get(bId) || {
            business_id: bId,
            available_coins: 28,
            held_coins: 4,
          };
          mockWallets.set(bId, {
            ...current,
            available_coins: mutationResult.available_coins ?? current.available_coins,
            held_coins: mutationResult.held_coins ?? current.held_coins,
          });
        } else if (table === "project_offers") {
          for (const [pId, list] of mockOffers.entries()) {
            mockOffers.set(
              pId,
              list.map((o) =>
                matchesRow(o, eqFilters, inFilters, neqFilters) ? { ...o, ...mutationResult } : o
              )
            );
          }
        } else if (table === "project_add_ons") {
          const idToUpdate = eqFilters.id;
          for (const [pId, list] of mockAddOns.entries()) {
            mockAddOns.set(
              pId,
              list.map((item) =>
                item.id === idToUpdate || matchesRow(item, eqFilters, inFilters, neqFilters)
                  ? { ...item, ...mutationResult }
                  : item
              )
            );
          }
        } else if (table === "admin_banners") {
          const idToUpdate = eqFilters.id;
          for (let i = 0; i < mockAdminBanners.length; i++) {
            if (mockAdminBanners[i].id === idToUpdate || matchesRow(mockAdminBanners[i], eqFilters, inFilters, neqFilters)) {
              mockAdminBanners[i] = { ...mockAdminBanners[i], ...mutationResult };
            }
          }
        } else if (table === "business_events") {
          const idToUpdate = eqFilters.id;
          for (let i = 0; i < mockBusinessEvents.length; i++) {
            if (mockBusinessEvents[i].id === idToUpdate || matchesRow(mockBusinessEvents[i], eqFilters, inFilters, neqFilters)) {
              mockBusinessEvents[i] = { ...mockBusinessEvents[i], ...mutationResult };
            }
          }
        } else if (table === "project_match_shortlists") {
          const pId = eqFilters.project_id;
          if (pId && mockShortlists.has(pId)) {
            mockShortlists.set(
              pId,
              (mockShortlists.get(pId) || []).map((s) =>
                matchesRow(s, eqFilters, inFilters, neqFilters) ? { ...s, ...mutationResult } : s
              )
            );
          }
        } else if (table === "businesses") {
          for (const [bId, biz] of mockBusinesses.entries()) {
            if (matchesRow(biz, eqFilters, inFilters, neqFilters)) {
              mockBusinesses.set(bId, { ...biz, ...mutationResult });
            }
          }
        } else if (table === "profiles") {
          if (eqFilters.id && !mockProfiles.has(eqFilters.id) && profileMap[eqFilters.id]) {
            mockProfiles.set(eqFilters.id, { ...profileMap[eqFilters.id] });
          }
          for (const [pId, prof] of mockProfiles.entries()) {
            if (matchesRow(prof, eqFilters, inFilters, neqFilters)) {
              mockProfiles.set(pId, { ...prof, ...mutationResult });
            }
          }
        } else if (table === "creatives") {
          for (let i = 0; i < approvedCreatives.length; i++) {
            const c = approvedCreatives[i];
            if (
              (eqFilters.user_id === "usr_creative_demo" && i === 0) ||
              matchesRow(c, eqFilters, inFilters, neqFilters)
            ) {
              approvedCreatives[i] = { ...c, ...mutationResult };
            }
          }
        } else if (table === "business_brand_assets") {
          const idToUpdate = eqFilters.id;
          for (const [bId, list] of mockBrandAssets.entries()) {
            mockBrandAssets.set(
              bId,
              list.map((item) =>
                item.id === idToUpdate || matchesRow(item, eqFilters, inFilters, neqFilters)
                  ? { ...item, ...mutationResult }
                  : item
              )
            );
          }
        }
      }

      const query: any = {
        _table: table,
        select() {
          return query;
        },
        eq(col: string, val: any) {
          eqFilters[col] = val;
          return query;
        },
        in(col: string, vals: any[]) {
          inFilters[col] = Array.isArray(vals) ? vals : [vals];
          return query;
        },
        neq(col: string, val: any) {
          neqFilters[col] = val;
          return query;
        },
        order(col: string, opts?: { ascending?: boolean }) {
          orderCol = col;
          orderAsc = opts?.ascending !== false;
          return query;
        },
        limit(n: number) {
          limitVal = n;
          return query;
        },
        upsert(payload: any) {
          operation = "upsert";
          const row = Array.isArray(payload) ? { ...payload[0] } : { ...payload };
          if (table === "notification_preferences" && row.user_id) {
            mockNotificationPrefs.set(row.user_id, row);
          }
          mutationResult = row;
          return query;
        },
        insert(payload: any) {
          operation = "insert";
          const uid = () => Math.random().toString(36).slice(2, 6);
          if (table === "projects") {
            const row = Array.isArray(payload) ? { ...payload[0] } : { ...payload };
            if (!row.id) row.id = `proj_${Date.now()}_${uid()}`;
            if (!row.created_at) row.created_at = new Date().toISOString();
            mockProjects.set(row.id, row);
            mutationResult = row;
          } else if (table === "project_messages") {
            const rows = Array.isArray(payload) ? payload : [payload];
            const pId = rows[0]?.project_id;
            const stamped = rows.map((r: any, idx: number) => ({
              id: r.id || `msg_${Date.now()}_${idx}_${uid()}`,
              created_at: r.created_at || new Date().toISOString(),
              ...r,
            }));
            if (pId) {
              const existing = mockMessages.get(pId) || [];
              mockMessages.set(pId, [...existing, ...stamped]);
            }
            mutationResult = Array.isArray(payload) ? stamped : stamped[0];
          } else if (table === "project_files") {
            const rows = Array.isArray(payload) ? payload : [payload];
            const pId = rows[0]?.project_id;
            const stamped = rows.map((r: any, idx: number) => ({
              id: r.id || `file_${Date.now()}_${idx}_${uid()}`,
              created_at: r.created_at || new Date().toISOString(),
              ...r,
            }));
            if (pId) {
              const existing = mockFiles.get(pId) || [];
              mockFiles.set(pId, [...stamped, ...existing]);
            }
            mutationResult = Array.isArray(payload) ? stamped : stamped[0];
          } else if (table === "notifications") {
            const rows = Array.isArray(payload) ? payload : [payload];
            const stamped = rows.map((r: any, idx: number) => ({
              id: r.id || `notif_${Date.now()}_${idx}_${uid()}`,
              created_at: r.created_at || new Date().toISOString(),
              ...r,
            }));
            mockNotifications.unshift(...stamped);
            mutationResult = Array.isArray(payload) ? stamped : stamped[0];
          } else if (table === "project_match_shortlists") {
            const rows = Array.isArray(payload) ? payload : [payload];
            const pId = rows[0]?.project_id;
            if (pId) {
              const existing = mockShortlists.get(pId) || [];
              mockShortlists.set(pId, [...existing, ...rows]);
            }
            mutationResult = Array.isArray(payload) ? rows : rows[0];
          } else if (table === "project_offers") {
            const rows = Array.isArray(payload) ? payload : [payload];
            const pId = rows[0]?.project_id;
            const stamped = rows.map((r: any, idx: number) => ({
              id: r.id || `off_${Date.now()}_${idx}_${uid()}`,
              created_at: r.created_at || new Date().toISOString(),
              ...r,
            }));
            if (pId) {
              const existing = mockOffers.get(pId) || [];
              mockOffers.set(pId, [...existing, ...stamped]);
            }
            mutationResult = Array.isArray(payload) ? stamped : stamped[0];
          } else if (table === "project_add_ons") {
            const rows = Array.isArray(payload) ? payload : [payload];
            const pId = rows[0]?.project_id;
            if (pId) {
              const existing = mockAddOns.get(pId) || [];
              mockAddOns.set(pId, [...rows, ...existing]);
            }
            mutationResult = Array.isArray(payload) ? rows : rows[0];
          } else if (table === "audit_log") {
            const rows = Array.isArray(payload) ? payload : [payload];
            const eId = rows[0]?.entity_id;
            const stamped = rows.map((r: any, idx: number) => ({
              id: r.id || `audit_${Date.now()}_${idx}_${uid()}`,
              created_at: r.created_at || new Date().toISOString(),
              ...r,
            }));
            if (eId) {
              const existing = mockAuditLogs.get(eId) || [];
              mockAuditLogs.set(eId, [...existing, ...stamped]);
            }
            mutationResult = Array.isArray(payload) ? stamped : stamped[0];
          } else if (table === "coin_ledger" || table === "coin_transactions") {
            const rows = Array.isArray(payload) ? payload : [payload];
            const stamped = rows.map((r: any, idx: number) => ({
              id: r.id || `ledger_${Date.now()}_${idx}_${uid()}`,
              ledger_type: r.ledger_type || r.transaction_type || "adjustment",
              coin_delta: r.coin_delta ?? r.amount ?? 0,
              note: r.note || r.description || "",
              created_at: r.created_at || new Date().toISOString(),
              ...r,
            }));
            mockCoinLedger.unshift(...stamped);
            mutationResult = Array.isArray(payload) ? stamped : stamped[0];
          } else if (table === "business_brand_assets") {
            const row = Array.isArray(payload) ? { ...payload[0] } : { ...payload };
            const bId = row.business_id || "biz_1";
            const stamped = {
              id: row.id || `va_${Date.now()}`,
              created_at: new Date().toISOString(),
              ...row,
            };
            const list = mockBrandAssets.get(bId) || [];
            list.unshift(stamped);
            mockBrandAssets.set(bId, list);
            mutationResult = stamped;
          } else if (table === "creative_payouts") {
            const row = Array.isArray(payload) ? { ...payload[0] } : { ...payload };
            const stamped = { id: row.id || `pay_${Date.now()}`, created_at: new Date().toISOString(), ...row };
            mockPayouts.unshift(stamped);
            mutationResult = stamped;
          } else if (table === "admin_banners") {
            const row = Array.isArray(payload) ? { ...payload[0] } : { ...payload };
            const stamped = {
              id: row.id || `ban_${Date.now()}_${uid()}`,
              created_at: new Date().toISOString(),
              is_active: true,
              sort_order: mockAdminBanners.length,
              ...row,
            };
            mockAdminBanners.unshift(stamped);
            mutationResult = stamped;
          } else if (table === "business_events") {
            const row = Array.isArray(payload) ? { ...payload[0] } : { ...payload };
            const stamped = {
              id: row.id || `evt_${Date.now()}_${uid()}`,
              created_at: new Date().toISOString(),
              is_active: true,
              ...row,
            };
            mockBusinessEvents.unshift(stamped);
            mutationResult = stamped;
          } else {
            mutationResult = Array.isArray(payload) ? payload[0] : payload;
          }
          return query;
        },
        update(payload: any) {
          operation = "update";
          mutationResult = { ...payload };
          return query;
        },
        delete() {
          operation = "delete";
          return query;
        },
        single() {
          return Promise.resolve(query._execute(true));
        },
        maybeSingle() {
          return Promise.resolve(query._execute(true));
        },
        then(resolve: any, reject: any) {
          return Promise.resolve(query._execute(false)).then(resolve, reject);
        },
        _execute(isSingle: boolean) {
          if (operation === "update") {
            applyMutation();
            if (table === "projects") {
              const arr = Array.isArray(mutationResult) ? mutationResult : [];
              return { data: isSingle ? arr[0] || null : arr, error: null };
            }
            return {
              data: isSingle
                ? Array.isArray(mutationResult)
                  ? mutationResult[0] || null
                  : mutationResult
                : mutationResult,
              error: null,
            };
          }

          if (operation === "insert" || operation === "upsert") {
            return { data: mutationResult, error: null };
          }

          if (operation === "delete") {
            if (table === "business_brand_assets" && eqFilters.id) {
              const bId = eqFilters.business_id || "biz_1";
              const list = mockBrandAssets.get(bId) || [];
              mockBrandAssets.set(
                bId,
                list.filter((a) => a.id !== eqFilters.id)
              );
            } else if (table === "admin_banners" && eqFilters.id) {
              const idx = mockAdminBanners.findIndex((b) => b.id === eqFilters.id);
              if (idx >= 0) mockAdminBanners.splice(idx, 1);
            } else if (table === "business_events" && eqFilters.id) {
              const idx = mockBusinessEvents.findIndex((e) => e.id === eqFilters.id);
              if (idx >= 0) mockBusinessEvents.splice(idx, 1);
            }
            return { data: null, error: null };
          }

          return query._getData(isSingle);
        },
        _getData(isSingle: boolean) {
          const finalize = (rows: any[]) => {
            let result = [...rows];
            if (orderCol) {
              result.sort((a, b) => {
                const av = a?.[orderCol!] ?? "";
                const bv = b?.[orderCol!] ?? "";
                if (av < bv) return orderAsc ? -1 : 1;
                if (av > bv) return orderAsc ? 1 : -1;
                return 0;
              });
            }
            if (limitVal !== null && limitVal >= 0) {
              result = result.slice(0, limitVal);
            }
            return { data: isSingle ? result[0] ?? null : result, error: null };
          };

          if (table === "profiles") {
            if (eqFilters.id) {
              const found = mockProfiles.get(eqFilters.id) || profileMap[eqFilters.id] || null;
              return { data: isSingle ? found : found ? [found] : [], error: null };
            }
            if (Array.isArray(inFilters.id)) {
              const matches = inFilters.id
                .map((id: string) => mockProfiles.get(id) || profileMap[id])
                .filter(Boolean);
              return { data: matches, error: null };
            }
            const all = Array.from(mockProfiles.values());
            return {
              data: isSingle ? mockProfiles.get("usr_business_demo") || profileMap.usr_business_demo : all,
              error: null,
            };
          }

          if (table === "businesses") {
            const allBusinesses = Array.from(mockBusinesses.values());
            if (eqFilters.owner_user_id && eqFilters.owner_user_id !== "usr_business_demo") {
              const exact = allBusinesses.find((b) => b.owner_user_id === eqFilters.owner_user_id) || null;
              if (!exact && (eqFilters.owner_user_id === "usr_creative_demo" || eqFilters.owner_user_id.startsWith("usr_"))) {
                return { data: isSingle ? null : [], error: null };
              }
              return { data: isSingle ? exact : exact ? [exact] : [], error: null };
            }
            const matched = allBusinesses.filter((b) => matchesRow(b, eqFilters, inFilters, neqFilters));
            const fallback = matched[0] || mockBusinesses.get("biz_1");
            return { data: isSingle ? fallback || null : matched.length ? matched : [fallback], error: null };
          }

          if (table === "creatives") {
            if (eqFilters.id) {
              const found = approvedCreatives.find((c) => c.id === eqFilters.id) || null;
              return { data: isSingle ? found : found ? [found] : [], error: null };
            }
            if (Array.isArray(inFilters.id)) {
              const found = approvedCreatives.filter((c) => inFilters.id.includes(c.id));
              return { data: found, error: null };
            }
            if (eqFilters.user_id) {
              if (eqFilters.user_id === "usr_creative_demo") {
                return { data: isSingle ? approvedCreatives[0] : [approvedCreatives[0]], error: null };
              }
              const found = approvedCreatives.find((c) => c.user_id === eqFilters.user_id) || null;
              return { data: isSingle ? found : found ? [found] : [], error: null };
            }
            return { data: isSingle ? approvedCreatives[0] : approvedCreatives, error: null };
          }

          if (table === "demo_creatives") {
            const demos = approvedCreatives.map((c) => ({
              id: c.id,
              name: profileMap[c.user_id]?.full_name || "Peach Creative",
              peach_level: c.peach_level,
              headline: c.primary_specialty,
              city: c.city,
              state: c.state,
              remote_available: true,
              specialties: [c.primary_specialty, ...c.secondary_specialties],
              tools: c.tools,
              industries: c.industries,
              bio: c.bio,
              portfolio_highlights: [c.featured_work.title, ...c.featured_work.tags],
              certifications: ["Peach Academy · Verified Commercial Design", "Peach Pro Studio"],
              education: "Commercial Visual Arts",
              mentor_name: "Camille Ross · Root Creative",
              reliability_score: c.reliability_score,
              available_for_projects: true,
              demo_only: false,
            }));
            return finalize(demos);
          }

          if (table === "creative_featured_work") {
            const works = approvedCreatives.map((c) => ({
              id: c.featured_work.id,
              creative_id: c.id,
              title: c.featured_work.title,
              description: `${c.featured_work.title} commercial deliverable.`,
              image_url: c.featured_work.image_url,
              industry: c.featured_work.industry,
              tags: c.featured_work.tags,
              role_detail: "Lead Designer",
              tools: c.tools,
              created_at: new Date().toISOString(),
            }));
            return finalize(works.filter((w) => matchesRow(w, eqFilters, inFilters, neqFilters)));
          }

          if (table === "creative_certifications") {
            const certs = approvedCreatives.map((c) => ({
              id: `cert_${c.id}`,
              creative_id: c.id,
              title: "Peach Academy · Commercial Certified",
            }));
            return finalize(certs);
          }

          if (table === "project_match_shortlists") {
            const pId = eqFilters.project_id;
            let rows = pId ? mockShortlists.get(pId) : null;
            if (!rows || rows.length === 0) {
              rows = [
                {
                  id: "pms_1",
                  project_id: pId || "p_1",
                  creative_id: "cr_maya",
                  match_score: 98,
                  match_reason: "Exceptional commercial brand identity, packaging, and print production track record.",
                  batch_number: 1,
                  status: "candidate",
                  creatives: approvedCreatives[0],
                },
                {
                  id: "pms_2",
                  project_id: pId || "p_1",
                  creative_id: "cr_jordan",
                  match_score: 95,
                  match_reason: "High-energy commercial layouts, event graphics, and fast turnaround.",
                  batch_number: 1,
                  status: "candidate",
                  creatives: approvedCreatives[1],
                },
                {
                  id: "pms_3",
                  project_id: pId || "p_1",
                  creative_id: "cr_nia",
                  match_score: 93,
                  match_reason: "Clean digital assets, web experience, and responsive commercial assets.",
                  batch_number: 1,
                  status: "candidate",
                  creatives: approvedCreatives[2],
                },
              ];
            } else {
              rows = rows.map((r) => {
                const creative = approvedCreatives.find((c) => c.id === r.creative_id) || approvedCreatives[0];
                return { ...r, creatives: creative };
              });
            }
            return finalize(rows.filter((r) => matchesRow(r, eqFilters, inFilters, neqFilters)));
          }

          if (table === "coin_wallets") {
            const bId = eqFilters.business_id || "biz_1";
            const data = mockWallets.get(bId) || { business_id: bId, available_coins: 28, held_coins: 4 };
            return { data: isSingle ? data : [data], error: null };
          }

          if (table === "memberships") {
            const data = {
              plan_name: "Growth Plan",
              monthly_coins: 24,
              coin_cap: 48,
              current_period_end: new Date(Date.now() + 86400000 * 20).toISOString(),
              status: "active",
            };
            return { data: isSingle ? data : [data], error: null };
          }

          if (table === "projects") {
            const allProjects = Array.from(mockProjects.values());
            if (eqFilters.id) {
              const found = mockProjects.get(eqFilters.id) || null;
              if (!found) return { data: isSingle ? null : [], error: null };
              const ok = matchesRow(found, eqFilters, inFilters, neqFilters);
              return { data: isSingle ? (ok ? found : null) : ok ? [found] : [], error: null };
            }

            const filtered = allProjects.filter((p) => {
              if (
                eqFilters.assigned_creative_id === "cr_maya" &&
                String(p.id).startsWith("proj_") &&
                p.assigned_creative_id
              ) {
                const { assigned_creative_id: _ignored, ...restEq } = eqFilters;
                return matchesRow(p, restEq, inFilters, neqFilters);
              }
              return matchesRow(p, eqFilters, inFilters, neqFilters);
            });
            return finalize(filtered);
          }

          if (table === "project_messages") {
            const pId = eqFilters.project_id;
            const msgs = pId ? mockMessages.get(pId) || [] : Array.from(mockMessages.values()).flat();
            return finalize(msgs.filter((m) => matchesRow(m, eqFilters, inFilters, neqFilters)));
          }

          if (table === "project_files") {
            const pId = eqFilters.project_id;
            let files = pId ? mockFiles.get(pId) || [] : Array.from(mockFiles.values()).flat();
            if (eqFilters.id) {
              files = Array.from(mockFiles.values()).flat();
            }
            return finalize(files.filter((f) => matchesRow(f, eqFilters, inFilters, neqFilters)));
          }

          if (table === "notifications") {
            return finalize(mockNotifications.filter((n) => matchesRow(n, eqFilters, inFilters, neqFilters)));
          }

          if (table === "project_offers") {
            const allOffers = Array.from(mockOffers.values())
              .flat()
              .map((o) => ({
                ...o,
                projects: mockProjects.get(o.project_id) || o.projects || null,
              }));

            const pool =
              allOffers.length > 0
                ? allOffers
                : [
                    {
                      id: "off_1",
                      payout_cents: 15000,
                      expires_at: new Date(Date.now() + 86400000 * 1).toISOString(),
                      project_id: "p_1",
                      status: "sent",
                      creative_id: "cr_maya",
                      created_at: new Date().toISOString(),
                      projects: mockProjects.get("p_1") || {
                        id: "p_1",
                        title: "Magic City Summer Launch Kit",
                        category: "Print & Social Campaign",
                        coin_amount: 4,
                        due_at: new Date(Date.now() + 86400000 * 4).toISOString(),
                        revision_rounds: 3,
                      },
                    },
                  ];

            const filtered = pool.filter((o) => {
              if (eqFilters.creative_id === "cr_maya" && String(o.project_id).startsWith("proj_")) {
                const { creative_id: _ignored, ...restEq } = eqFilters;
                return matchesRow(o, restEq, inFilters, neqFilters);
              }
              return matchesRow(o, eqFilters, inFilters, neqFilters);
            });
            return finalize(filtered);
          }

          if (table === "creative_payouts") {
            return finalize(mockPayouts.filter((p) => matchesRow(p, eqFilters, inFilters, neqFilters)));
          }

          if (table === "business_brand_assets") {
            const bId = eqFilters.business_id;
            const list = bId
              ? mockBrandAssets.get(bId) || []
              : Array.from(mockBrandAssets.values()).flat();
            return finalize(list.filter((a) => matchesRow(a, eqFilters, inFilters, neqFilters)));
          }

          if (table === "coin_ledger") {
            return finalize(mockCoinLedger.filter((l) => matchesRow(l, eqFilters, inFilters, neqFilters)));
          }

          if (table === "project_add_ons") {
            const pId = eqFilters.project_id;
            const items = pId ? mockAddOns.get(pId) || [] : Array.from(mockAddOns.values()).flat();
            return finalize(items.filter((x) => matchesRow(x, eqFilters, inFilters, neqFilters)));
          }

          if (table === "notification_preferences") {
            const uId = eqFilters.user_id;
            const prefs = uId ? mockNotificationPrefs.get(uId) : null;
            const defaultPrefs = {
              user_id: uId,
              phone: "205-555-0199",
              sms_enabled: true,
              push_enabled: false,
              email_enabled: true,
              notify_messages: true,
              notify_proofs: true,
              notify_offers: true,
              notify_addons: true,
            };
            const data = prefs || defaultPrefs;
            return { data: isSingle ? data : [data], error: null };
          }

          if (table === "audit_log") {
            const eId = eqFilters.entity_id;
            const logs = eId
              ? mockAuditLogs.get(eId) || []
              : Array.from(mockAuditLogs.values()).flat();
            return finalize(logs.filter((l) => matchesRow(l, eqFilters, inFilters, neqFilters)));
          }

          if (table === "admin_banners") {
            return finalize(mockAdminBanners.filter((b) => matchesRow(b, eqFilters, inFilters, neqFilters)));
          }

          if (table === "business_events") {
            return finalize(mockBusinessEvents.filter((e) => matchesRow(e, eqFilters, inFilters, neqFilters)));
          }

          return { data: isSingle ? null : [], error: null };
        },
      };
      return query;
    },
    storage: {
      async getBucket(bucket: string) {
        return { data: { id: bucket, name: bucket, public: bucket === "profile-media" }, error: null };
      },
      async createBucket(bucket: string) {
        return { data: { name: bucket }, error: null };
      },
      from(bucket: string) {
        return {
          async upload(path: string, file: any, options?: any) {
            let buffer: Buffer;
            if (Buffer.isBuffer(file)) {
              buffer = file;
            } else if (file instanceof Uint8Array) {
              buffer = Buffer.from(file);
            } else if (file instanceof ArrayBuffer) {
              buffer = Buffer.from(file);
            } else if (file && typeof file.arrayBuffer === "function") {
              buffer = Buffer.from(await file.arrayBuffer());
            } else {
              buffer = Buffer.from(String(file ?? ""));
            }
            mockStorageFiles.set(`${bucket}:${path}`, {
              buffer,
              contentType: options?.contentType || "application/octet-stream",
              size: buffer.byteLength,
            });
            return { data: { path }, error: null };
          },
          createSignedUploadUrl(path: string) {
            return Promise.resolve({
              data: {
                signedUrl: `/api/placeholder-file?bucket=${bucket}&path=${encodeURIComponent(path)}`,
                token: "mock-upload-token",
                path,
              },
              error: null,
            });
          },
          download(path: string) {
            const entry = mockStorageFiles.get(`${bucket}:${path}`);
            if (!entry) {
              return Promise.resolve({ data: null, error: { message: "File not found." } });
            }
            return Promise.resolve({
              data: new Blob([new Uint8Array(entry.buffer)], { type: entry.contentType }),
              error: null,
            });
          },
          createSignedUrl(path: string, _expiresIn?: number) {
            return Promise.resolve({
              data: { signedUrl: `/api/placeholder-file?bucket=${bucket}&path=${encodeURIComponent(path)}` },
              error: null,
            });
          },
          getPublicUrl(path: string) {
            return {
              data: { publicUrl: `/api/placeholder-file?bucket=${bucket}&path=${encodeURIComponent(path)}` },
            };
          },
          remove(paths: string[]) {
            for (const p of paths || []) {
              mockStorageFiles.delete(`${bucket}:${p}`);
            }
            return Promise.resolve({ data: null, error: null });
          },
          list(prefix?: string, opts?: { search?: string }) {
            const fullPrefix = `${bucket}:${prefix ? `${prefix}/` : ""}`;
            const items: any[] = [];
            for (const [k, v] of mockStorageFiles.entries()) {
              if (k.startsWith(fullPrefix)) {
                const name = k.slice(fullPrefix.length);
                if (!name.includes("/") && (!opts?.search || name.includes(opts.search))) {
                  items.push({
                    name,
                    metadata: { size: v.size, mimetype: v.contentType },
                  });
                }
              }
            }
            return Promise.resolve({ data: items, error: null });
          },
        };
      },
    },
  } as any;
}
