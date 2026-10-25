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
          if (payload && typeof payload === "object") {
            Object.assign(filters, payload);
          }
          return query;
        },
        update(payload: any) {
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
            const biz = {
              id: "usr_business_demo",
              full_name: "Peach Partner",
              role: "business",
              avatar_url: "/brand/business-owner.jpg",
              email: "partner@peachnetwork.com",
            };
            const cr = {
              id: "usr_creative_demo",
              full_name: "Peach Creative",
              role: "creative",
              avatar_url: "/Creative2.jpg",
              email: "creative@peachnetwork.com",
            };
            const adm = {
              id: "usr_admin_demo",
              full_name: "Peach Admin",
              role: "admin",
              avatar_url: "/brand/business-owner.jpg",
              email: "admin@peachnetwork.com",
            };

            let chosen = biz;
            if (filters.id === "usr_creative_demo" || filters.role === "creative" || (typeof filters.id === "string" && filters.id.includes("creative"))) {
              chosen = cr;
            } else if (filters.id === "usr_admin_demo" || filters.role === "admin") {
              chosen = adm;
            }

            return { data: isSingle ? chosen : [biz, cr, adm], error: null };
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
            const data = {
              id: "cr_1",
              user_id: filters.user_id || "usr_creative_demo",
              peach_level: "pro",
              application_status: "approved",
              primary_specialty: "Brand Identity & Vector Illustration",
              city: "Birmingham",
              state: "AL",
              reliability_score: 98,
              profile_image_url: "/Creative2.jpg",
              bio: "ADDY award-winning commercial designer with 6+ years specializing in vector systems and commercial print bleeds.",
            };
            return { data: isSingle ? data : [data], error: null };
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
                assigned_creative_id: "cr_1",
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
                assigned_creative_id: "cr_1",
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
                assigned_creative_id: "cr_1",
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
                assigned_creative_id: "cr_1",
                revision_rounds: 2,
              },
            ];
            return { data: isSingle ? list[0] : list, error: null };
          }
          if (table === "project_offers") {
            const list = [
              {
                id: "off_1",
                payout_cents: 15000,
                expires_at: new Date(Date.now() + 86400000 * 1).toISOString(),
                project_id: "p_1",
                status: "sent",
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
