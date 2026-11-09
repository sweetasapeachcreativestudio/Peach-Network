import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isRealSupabase = Boolean(
    url &&
    (url.startsWith("http://") || url.startsWith("https://")) &&
    key &&
    !url.includes("placeholder") &&
    !url.includes("your-project") &&
    !key.includes("placeholder")
  );

  if (isRealSupabase) {
    return createSupabaseClient(
      url!,
      key!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  // In-memory persistent collections for mock/preview environment
  const mockShortlists = new Map<string, any[]>();
  const mockProjects = new Map<string, any>();
  const mockOffers = new Map<string, any>();

  // Global vetted approved creatives on the app
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
      primary_specialty: "Packaging & Print Production",
      secondary_specialties: ["Label Dielines", "Box Packaging", "Menu Engineering"],
      city: "Birmingham",
      state: "AL",
      tools: ["Adobe Illustrator", "InDesign", "Esko Studio", "Photoshop"],
      industries: ["Food & Beverage", "Craft Breweries", "Specialty Retail"],
      reliability_score: 98,
      profile_image_url: "/people/elijah.jpg",
      bio: "Print production veteran specializing in spot colors, foil stamping, packaging dielines, and multi-page menu books.",
      featured_work: {
        id: "fw_elijah_1",
        title: "Red Mountain Cold Brew Dieline Suite",
        image_url: "/Project 4.png",
        industry: "Food & Beverage",
        tags: ["Packaging", "Print Dieline", "Spot UV"],
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

  // Safe fallback mock query runner for local/preview mode
  return {
    from(table: string) {
      const filters: Record<string, any> = {};
      const query: any = {
        _table: table,
        select() {
          return query;
        },
        eq(col: string, val: any) {
          filters[col] = val;
          return query;
        },
        in(col: string, vals: any[]) {
          filters[col] = vals;
          return query;
        },
        order() {
          return query;
        },
        limit() {
          return query;
        },
        upsert(payload: any) {
          if (payload && typeof payload === "object") {
            Object.assign(filters, payload);
          }
          return query;
        },
        insert(payload: any) {
          if (table === "project_match_shortlists") {
            const rows = Array.isArray(payload) ? payload : [payload];
            const pId = rows[0]?.project_id;
            if (pId) {
              const existing = mockShortlists.get(pId) || [];
              mockShortlists.set(pId, [...existing, ...rows]);
            }
          } else if (table === "project_offers") {
            const rows = Array.isArray(payload) ? payload : [payload];
            const pId = rows[0]?.project_id;
            if (pId) {
              const existing = mockOffers.get(pId) || [];
              mockOffers.set(pId, [...existing, ...rows]);
            }
          }
          if (payload && typeof payload === "object") {
            Object.assign(filters, payload);
          }
          return query;
        },
        update(payload: any) {
          if (table === "project_match_shortlists" && filters.id) {
            for (const [, list] of mockShortlists.entries()) {
              const item = list.find((x) => x.id === filters.id);
              if (item) Object.assign(item, payload);
            }
          }
          if (payload && typeof payload === "object") {
            Object.assign(filters, payload);
          }
          return query;
        },
        delete() {
          return query;
        },
        single() {
          return Promise.resolve(query._getData(true));
        },
        maybeSingle() {
          return Promise.resolve(query._getData(true));
        },
        then(resolve: any, reject: any) {
          return Promise.resolve(query._getData(false)).then(resolve, reject);
        },
        _getData(isSingle: boolean) {
          if (table === "profiles") {
            if (filters.id && profileMap[filters.id]) {
              return { data: isSingle ? profileMap[filters.id] : [profileMap[filters.id]], error: null };
            }
            if (Array.isArray(filters.id)) {
              const matches = filters.id.map((id: string) => profileMap[id]).filter(Boolean);
              return { data: matches, error: null };
            }
            const all = Object.values(profileMap);
            return { data: isSingle ? profileMap.usr_business_demo : all, error: null };
          }

          if (table === "businesses") {
            const data = {
              id: "biz_1",
              owner_user_id: filters.owner_user_id || "usr_business_demo",
              name: "Magic City Brands",
              industry: "Culinary & Lifestyle",
              logo_url: "/brand/peach-app-logo.png",
              phone: "205-555-0199",
              website: "www.magiccitybrands.com",
              description: "Premier local culinary and hospitality group in Birmingham, AL.",
            };
            return { data: isSingle ? data : [data], error: null };
          }

          if (table === "creatives") {
            if (filters.id) {
              const found = approvedCreatives.find((c) => c.id === filters.id) || approvedCreatives[0];
              return { data: isSingle ? found : [found], error: null };
            }
            if (filters.user_id) {
              const found = approvedCreatives.find((c) => c.user_id === filters.user_id) || approvedCreatives[0];
              return { data: isSingle ? found : [found], error: null };
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
            return { data: isSingle ? demos[0] : demos, error: null };
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

            if (filters.creative_id) {
              const cids = Array.isArray(filters.creative_id) ? filters.creative_id : [filters.creative_id];
              const filtered = works.filter((w) => cids.includes(w.creative_id));
              return { data: isSingle ? filtered[0] || null : filtered, error: null };
            }
            return { data: isSingle ? works[0] : works, error: null };
          }

          if (table === "creative_certifications") {
            const certs = approvedCreatives.map((c) => ({
              id: `cert_${c.id}`,
              creative_id: c.id,
              title: "Peach Academy · Commercial Certified",
            }));
            return { data: isSingle ? certs[0] : certs, error: null };
          }

          if (table === "project_match_shortlists") {
            const pId = filters.project_id;
            let rows = pId ? mockShortlists.get(pId) : null;
            if (!rows || rows.length === 0) {
              // Generate standard 3 top matches from approved creatives
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
              // Ensure creative profile is joined
              rows = rows.map((r) => {
                const creative = approvedCreatives.find((c) => c.id === r.creative_id) || approvedCreatives[0];
                return {
                  ...r,
                  creatives: creative,
                };
              });
            }
            return { data: isSingle ? rows[0] : rows, error: null };
          }

          if (table === "coin_wallets") {
            const data = { business_id: "biz_1", available_coins: 14, held_coins: 4 };
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
            const list = [
              {
                id: "p_1",
                title: "Magic City Summer Launch Kit",
                category: "Print & Social Campaign",
                description: "Comprehensive print collateral and social media banners for the summer culinary festival.",
                status: "in_progress",
                coin_amount: 4,
                due_at: new Date(Date.now() + 86400000 * 3).toISOString(),
                created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
                assigned_creative_id: "cr_maya",
                revision_rounds: 1,
              },
              {
                id: "p_2",
                title: "Seasonal Menu & Table Cards",
                category: "Commercial Print",
                description: "Full-bleed print menus and branded table card inserts with spot gloss specs.",
                status: "proof_uploaded",
                coin_amount: 2,
                due_at: new Date(Date.now() + 86400000 * 1).toISOString(),
                created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
                assigned_creative_id: "cr_jordan",
                revision_rounds: 0,
              },
              {
                id: "p_3",
                title: "Spring Brand Identity & Vector Suite",
                category: "Brand Identity",
                description: "Complete primary and secondary logo vector system, color guidelines, and commercial typography package.",
                status: "completed",
                coin_amount: 6,
                due_at: new Date(Date.now() - 86400000 * 14).toISOString(),
                created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
                assigned_creative_id: "cr_nia",
                revision_rounds: 1,
              },
              {
                id: "p_4",
                title: "Artisan Coffee Packaging Dieline",
                category: "Packaging & Print",
                description: "Vector dielines, ingredient panel typography, and production-ready CMYK press proofs for bag packaging.",
                status: "completed",
                coin_amount: 5,
                due_at: new Date(Date.now() - 86400000 * 45).toISOString(),
                created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
                assigned_creative_id: "cr_elijah",
                revision_rounds: 2,
              },
            ];

            if (filters.id) {
              const found = list.find((p) => p.id === filters.id) || list[0];
              return { data: isSingle ? found : [found], error: null };
            }
            return { data: isSingle ? list[0] : list, error: null };
          }

          if (table === "project_offers") {
            const pId = filters.project_id;
            const existing = pId ? mockOffers.get(pId) : null;
            if (existing && existing.length) {
              return { data: isSingle ? existing[0] : existing, error: null };
            }
            const list = [
              {
                id: "off_1",
                payout_cents: 15000,
                expires_at: new Date(Date.now() + 86400000 * 1).toISOString(),
                project_id: "p_1",
                status: "sent",
                creative_id: "cr_maya",
                projects: {
                  title: "Artisan Coffee Packaging Dieline",
                  category: "Packaging & Print",
                  due_at: new Date(Date.now() + 86400000 * 4).toISOString(),
                  revision_rounds: 2,
                },
              },
            ];
            return { data: isSingle ? list[0] : list, error: null };
          }

          if (table === "creative_payouts") {
            return { data: isSingle ? null : [{ amount_cents: 35000, status: "pending" }], error: null };
          }

          if (table === "business_brand_assets") {
            return { data: isSingle ? null : [], error: null };
          }

          if (table === "coin_ledger") {
            return {
              data: isSingle
                ? null
                : [
                    {
                      id: "l_1",
                      ledger_type: "membership_deposit",
                      coin_delta: 24,
                      note: "Monthly Growth Membership deposit",
                      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
                    },
                    {
                      id: "l_2",
                      ledger_type: "project_hold",
                      coin_delta: -4,
                      note: "Escrow hold for Magic City Summer Launch Kit",
                      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
                    },
                  ],
              error: null,
            };
          }

          return { data: isSingle ? null : [], error: null };
        },
      };
      return query;
    },
  } as any;
}

