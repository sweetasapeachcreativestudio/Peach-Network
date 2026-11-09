import { NextResponse } from "next/server";
import { safeGenerateContent, ThinkingLevel } from "@/lib/gemini";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MASTER_2026_CATALOG,
  PEACH_COIN_USD_RATE,
  findCategoryByKeywords,
  type CatalogTierOption,
} from "@/lib/project-pricing";

interface CreativeCandidate {
  id: string;
  name: string;
  avatar_url: string;
  peach_level: string;
  headline: string;
  city: string;
  state: string;
  hub: string;
  reliability_score: number;
  bio: string;
  match_score: number;
  match_reason: string;
  specialties: string[];
  featured_work: {
    title: string;
    image_url: string;
    industry: string;
    tags: string[];
  };
}

const APPROVED_CREATIVES_FALLBACK: CreativeCandidate[] = [
  {
    id: "cr_maya",
    name: "Maya Brooks",
    avatar_url: "/people/maya.jpg",
    peach_level: "blossom",
    headline: "Brand & Campaign Identity",
    city: "Atlanta",
    state: "GA",
    hub: "Atlanta Hub",
    reliability_score: 99,
    bio: "Commercial brand designer who turns business goals into polished campaign systems, 3-tier brand sheets, launch graphics, and print-ready packaging collateral.",
    match_score: 98,
    match_reason: "Master of 3-tier brand identity systems, scalable vector kits, and luxury beverage/retail packaging.",
    specialties: ["Brand Identity", "Package Design", "Print Collateral", "Typography"],
    featured_work: {
      title: "Artisan Spirits Identity & Bottling",
      image_url: "/Project 1.png",
      industry: "Beverage & Hospitality",
      tags: ["Branding", "Packaging", "Print Production"],
    },
  },
  {
    id: "cr_jordan",
    name: "Jordan Ellis",
    avatar_url: "/Creative1.JPG",
    peach_level: "sapling",
    headline: "Sports & Event Graphics",
    city: "Birmingham",
    state: "AL",
    hub: "Birmingham Hub",
    reliability_score: 96,
    bio: "High-energy commercial graphic designer specializing in athlete announcements, multi-photo chopped flyers, promo drops, and high-impact social layouts.",
    match_score: 96,
    match_reason: "Specialist in high-contrast promo flyer launch kits, multi-photo cropping, and commercial event graphics.",
    specialties: ["Sports Graphics", "Flyers & Posters", "Social Media", "Event Collateral"],
    featured_work: {
      title: "Magic City Classic Championship Series",
      image_url: "/Project 2.png",
      industry: "Sports & Entertainment",
      tags: ["Event Promo", "Social Campaign", "Flyer"],
    },
  },
  {
    id: "cr_nia",
    name: "Nia Carter",
    avatar_url: "/Creative2.jpg",
    peach_level: "tree",
    headline: "Web & Digital Experience",
    city: "Birmingham",
    state: "AL",
    hub: "Birmingham Hub",
    reliability_score: 98,
    bio: "Digital designer focused on high-converting landing pages, multi-page business websites, and restaurant/retail e-commerce hubs on Shopify and Webflow.",
    match_score: 97,
    match_reason: "Deep portfolio in restaurant digital menus, Shopify e-commerce architecture, and conversion-focused landing pages.",
    specialties: ["Web Design", "Landing Pages", "E-Commerce UI", "Shopify"],
    featured_work: {
      title: "Aura Botanical Skincare Storefront",
      image_url: "/Project 3.png",
      industry: "Retail & E-Commerce",
      tags: ["Web Design", "Shopify", "UI/UX"],
    },
  },
  {
    id: "cr_elijah",
    name: "Elijah Vance",
    avatar_url: "/people/elijah.jpg",
    peach_level: "blossom",
    headline: "Packaging & Commercial Photography",
    city: "Birmingham",
    state: "AL",
    hub: "Birmingham Hub",
    reliability_score: 98,
    bio: "Commercial photographer and packaging designer specializing in tabletop product shoots, footwear closeups, and culinary on-location sessions.",
    match_score: 95,
    match_reason: "Expert in tabletop product photography for footwear/retail and restaurant culinary dish staging.",
    specialties: ["Commercial Photography", "Product Tabletop", "Packaging Dielines", "Print Specs"],
    featured_work: {
      title: "Red Mountain Cold Brew Dieline & Bottle Shoot",
      image_url: "/Project 4.png",
      industry: "Food & Beverage",
      tags: ["Packaging", "Product Shoot", "Studio Lighting"],
    },
  },
  {
    id: "cr_sophie",
    name: "Sophie Chen",
    avatar_url: "/people/sophie.jpg",
    peach_level: "tree",
    headline: "Custom Illustration & Brand Overhauls",
    city: "Huntsville",
    state: "AL",
    hub: "Huntsville Hub",
    reliability_score: 99,
    bio: "Vector illustrator and brand designer crafting custom mascots, merchandise apparel graphics, and complete visual identity overhauls.",
    match_score: 94,
    match_reason: "Bespoke vector illustrations, apparel merch design, and complete brand guidelines.",
    specialties: ["Vector Illustration", "Brand Guidelines", "Merch Graphics", "Icon Sets"],
    featured_work: {
      title: "Urban Rooster Craft Beer Can Illustration",
      image_url: "/Project 6.jpg",
      industry: "Craft Brewing & Apparel",
      tags: ["Illustration", "Can Art", "Merch"],
    },
  },
  {
    id: "cr_avery",
    name: "Avery Thomas",
    avatar_url: "/Creative 3.jpg",
    peach_level: "sapling",
    headline: "Social Media Motion & Video Reels",
    city: "Montgomery",
    state: "AL",
    hub: "Montgomery Hub",
    reliability_score: 97,
    bio: "Fast-paced motion designer and video editor specializing in vertical reels, animated teasers, and monthly social content suites.",
    match_score: 93,
    match_reason: "Dynamic video reels, multi-slide educational carousels, and 30-day social content suites.",
    specialties: ["Video Reels", "Motion Graphics", "Social Carousels", "Social Shorts"],
    featured_work: {
      title: "Highland Bar & Grill Launch Reel & Social Drop",
      image_url: "/project 7.jpg",
      industry: "Dining & Nightlife",
      tags: ["Video Reel", "Motion Graphics", "Social"],
    },
  },
];

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Please enter a question or project brief." }, { status: 400 });
    }

    const trimmed = message.trim();
    const admin = createAdminClient();

    // Fetch approved creatives from DB
    const [{ data: realRows }, { data: realProfiles }, { data: realWorks }] = await Promise.all([
      admin.from("creatives").select("*").eq("application_status", "approved"),
      admin.from("profiles").select("id,full_name,avatar_url"),
      admin.from("creative_featured_work").select("*").order("created_at", { ascending: false }),
    ]);

    const nameMap = new Map((realProfiles ?? []).map((p: any) => [p.id, p.full_name]));
    const avatarMap = new Map((realProfiles ?? []).map((p: any) => [p.id, p.avatar_url]));

    const pool: CreativeCandidate[] =
      realRows && realRows.length > 0
        ? realRows.map((r: any, idx: number) => {
            const fw = (realWorks ?? []).find((w: any) => w.creative_id === r.id);
            const fallback = APPROVED_CREATIVES_FALLBACK[idx % APPROVED_CREATIVES_FALLBACK.length];
            return {
              id: r.id,
              name: nameMap.get(r.user_id) || r.name || fallback.name,
              avatar_url: r.profile_image_url || avatarMap.get(r.user_id) || fallback.avatar_url,
              peach_level: r.peach_level || fallback.peach_level,
              headline: r.primary_specialty || fallback.headline,
              city: r.city || fallback.city,
              state: r.state || fallback.state,
              hub:
                r.hub ||
                (r.city?.toLowerCase().includes("atlanta")
                  ? "Atlanta Hub"
                  : r.city?.toLowerCase().includes("huntsville")
                  ? "Huntsville Hub"
                  : r.city?.toLowerCase().includes("montgomery")
                  ? "Montgomery Hub"
                  : "Birmingham Hub"),
              reliability_score: Number(r.reliability_score) || fallback.reliability_score,
              bio: r.bio || fallback.bio,
              match_score: 95,
              match_reason: "Strong commercial experience and verified portfolio in this industry niche.",
              specialties: [r.primary_specialty, ...(r.secondary_specialties ?? [])].filter(Boolean),
              featured_work: fw
                ? {
                    title: fw.title,
                    image_url: fw.image_url || fallback.featured_work.image_url,
                    industry: fw.industry || fallback.featured_work.industry,
                    tags: Array.isArray(fw.tags) ? fw.tags : fallback.featured_work.tags,
                  }
                : fallback.featured_work,
            };
          })
        : APPROVED_CREATIVES_FALLBACK;

    // Determine category based on keywords
    const masterCat = findCategoryByKeywords(trimmed);

    const systemInstruction = `You are Peach Match AI, the expert Creative Director, pricing architect, and supportive partner for business owners on Peach Network in Birmingham, AL.
You speak like a trusted, encouraging friend who explains design clearly, protects business owners from under-scoping, and ensures creatives are paid fairly.

PEACH RATE LAW:
1 Peach Coin = $50 USD.
Every price MUST state both Coins and USD ($50 per coin). All projects include 3 revision rounds and 100% administrative ownership transfer upon completion.

2026 MASTER 3-TIER SCOPING CATALOG:
1. Website Design:
   • Option A: Landing Page / Conversion Hub — 10 Coins ($500), 5–7 Days.
     Deliverables: 1 high-converting responsive page, hero section, value pillars, social proof, contact form, Webflow/Squarespace/Framer/Figma, custom domain hookup.
     Requires from business: Headline, core service list, brand colors/logo, photos or stock imagery.
   • Option B: Standard Multi-Page Business Site (3–5 Pages) — 18 Coins ($900), 8–12 Days.
     Deliverables: Up to 5 custom responsive pages (Home, About, Services, Gallery, Contact), mobile responsive breakpoints, SEO setup, contact routing, live staging link.
     Requires from business: Page copy/content, team photos, domain login credentials.
   • Option C: Advanced Retail E-Commerce or Restaurant Hub — 26 Coins ($1,300), 12–16 Days.
     Deliverables: Full 5–8 page architecture on Shopify or Webflow; Retail: Product detail pages, variant selectors, zoom gallery, cart drawer; Restaurant: Interactive food/drink menu, table reservation integration, online ordering links; Brand Vault backup.
     Requires from business: Product catalog with photos & variants OR full food & drink menu with prices, payment gateway setup (Stripe/Square).

2. Branding Design:
   • Option A: Core Logo & Vector Kit — 4 Coins ($200), 3–4 Days (Primary logo + secondary mark, scalable vectors .AI, .SVG, .EPS, .PNG, commercial rights).
     Requires from business: Company name, target audience, 2–3 visual reference links.
   • Option B: Brand Identity Starter & Brand Sheet — 6 Coins ($300), 4–5 Days (Primary, secondary, submarks, 1-Page Master Brand Sheet with colors & typography pairings).
     Requires from business: Mission statement, tone of voice, competitor examples.
   • Option C: Full Commercial Brand Identity Overhaul — 12 Coins ($600), 7–10 Days (Full system, 4 variations, stationery suite, social avatar kit, 12-page brand guidelines PDF).
     Requires from business: Detailed questionnaire, existing assets, participation in 2 review rounds.

3. Commercial Photography:
   • Option A: Executive & Creative Portrait Session — 6 Coins ($300), 3–5 Days (1-hr on-location/studio, 5 retouched portraits).
     Requires from business: Wardrobe selection, location confirmation, arrival on time.
   • Option B: Product Tabletop Session (Footwear / Retail) — 10 Coins ($500), 5–7 Days (Up to 5 products, 15 retouched images, clean white cutouts).
     Requires from business: Physical products delivered in pristine condition, shot list/angles.
   • Option C: On-Location Restaurant, Culinary & Brand Shoot — 12 Coins ($600), 5–7 Days (2 hrs on-location, 10 styled dishes, dining room action, 20 retouched photos).
     Requires from business: Venue shoot window during prep hours, kitchen staff styling dishes fresh.

4. Social Media Design:
   • Option A: Social Campaign Launch Pack (4 Posts) — 3 Coins ($150), 2–3 Days (4 static feed + 9:16 story designs, editable source files).
     Requires from business: Headlines, dates, promotional offer details, logo files.
   • Option B: High-Converting Multi-Slide Carousel Drop — 4 Coins ($200), 3–4 Days (6–8 slide seamless carousel, hook slide, CTA slide, caption copy).
     Requires from business: Topic bullet points, product specs, brand fonts/colors.
   • Option C: Monthly Social Suite + Video Reels / Motion Teasers — 8 Coins ($400), 5–7 Days (12 branded assets, 2 animated reels 15–30s).
     Requires from business: Monthly campaign goals, raw video clips/photos, brand kit.

5. Graphic Design:
   • Option A: Quick Task / Minor Graphic Revision — 1 Coin ($50), 1–2 Days (Business card layout, social header, text update).
     Requires from business: Existing vector file or high-res file and exact text changes.
   • Option B: Commercial Event / Promo Flyer Launch Kit — 2 Coins ($100), 2–3 Days (Single/double-sided flyer, 1:1, 9:16, 300 DPI print PDF with bleeds, QR code).
     Requires from business: Event date, venue, headliners, ticket link, high-res photos.
   • Option C: Multi-Page Menu, Brochure or Packaging Die-Line — 6 Coins ($300), 4–6 Days (4-page menu/brochure OR box/label dieline + 3D mockup).
     Requires from business: Printer template specs, finalized menu/copy text, ingredients/nutrition.

BEHAVIOR RULES:
1. Determine what the client needs:
   - If the client's request clearly specifies one of these tiers (e.g. "I need an event flyer with QR code" -> Option B: 2 Coins; or "I need a 4-page restaurant menu" -> Option C: 6 Coins; or "I need an e-commerce website for shoes" -> Option C: 26 Coins), suggest that exact tier with its deliverables, turnaround, and what the business needs to provide.
   - If the client is vague (e.g. "I need a website" or "I want branding" or "I need photos"), set isVague: true and present all 3 tiers (Option A, Option B, Option C) so the client can select one.
   - Talk to the business owner like a supportive friend! Explain what each tier comes with and what they require from the business.
2. Return 3 vetted creatives from our app who can do the project based on their profile, including what they have a history of designing (e.g., Nia Carter for restaurant websites and e-commerce UI; Jordan Ellis for sports/event flyers; Maya Brooks for brand identity and beverage packaging; Elijah Vance for footwear/tabletop photography and culinary shoots).

RESPONSE FORMAT (JSON STRICT):
{
  "answer": "Warm, encouraging friend-like advice explaining the options, pricing in coins and USD, and what each tier requires from the business.",
  "companionInsight": "A supportive 1-2 sentence pro-tip for this business owner.",
  "isVague": boolean,
  "categoryId": "website_design" | "branding_design" | "commercial_photography" | "social_media" | "graphic_design",
  "selectedTier": "option_a" | "option_b" | "option_c",
  "scope": {
    "title": "Exact title of recommended tier",
    "category": "Website" | "Brand & Illustration" | "Photography" | "Design",
    "serviceKey": "string",
    "coins": number,
    "usdAmount": number,
    "deliverables": ["List of deliverables"],
    "requiredFromBusiness": ["List of what the business owner must provide"],
    "estimatedTurnaround": "e.g., 8–12 Business Days",
    "revisionRounds": 3,
    "reason": "Clear explanation of how the project is scoped and why this coin investment fits."
  },
  "topCreativeIds": [
    { "id": "creative_id", "score": 98, "reason": "Specific reason citing their past design history and industry fit" }
  ]
}`;

    const compactPool = pool.map((c) => ({
      id: c.id,
      name: c.name,
      level: c.peach_level,
      hub: c.hub,
      specialties: c.specialties,
      bio: c.bio,
      historyOfDesigning: c.featured_work.title,
      industry: c.featured_work.industry,
    }));

    const prompt = `CLIENT QUERY / PROJECT REQUEST:
"""${trimmed}"""

RECENT CONVERSATION HISTORY:
${JSON.stringify(history || [])}

AVAILABLE CREATIVES (WITH DESIGN HISTORY):
${JSON.stringify(compactPool, null, 2)}

Provide your response in strictly valid JSON matching the format described.`;

    let parsed: any = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const rawText = await safeGenerateContent({
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
          timeoutMs: 22000,
        });
        if (rawText) {
          parsed = JSON.parse(rawText);
        }
      } catch (modelErr) {
        console.warn("Gemini model temporary error, using 2026 catalog fallback engine:", modelErr);
      }
    }

    // Deterministic fallback using 2026 Master Catalog if AI unavailable
    if (!parsed || !parsed.scope) {
      const q = trimmed.toLowerCase();
      const cat = masterCat;
      let selectedOptionKey: "option_a" | "option_b" | "option_c" = "option_b";
      let isVague = false;
      let answer = "";
      let companionInsight = "I'm right here with you! Every project on Peach is protected by escrow, includes 3 revision rounds, and guarantees full ownership transfer.";

      if (cat.id === "website_design") {
        if (/(e-commerce|ecommerce|store|shop|shoe|restaurant|menu|online ordering|reservation)/.test(q)) {
          selectedOptionKey = "option_c";
          answer =
            "For a retail store or restaurant, you need a high-performing architecture that handles menus, ordering, or product variants. Option C: Advanced Retail E-Commerce or Restaurant Hub is 26 Peach Coins ($1,300 USD). It comes with full 5–8 page architecture on Shopify or Webflow, interactive food & drink menus or product variant selectors, and full administrative site transfer.\n\nWhat we require from you: your product catalog/photos or menu items with pricing, and your merchant login (Square/Stripe).";
          companionInsight =
            "Diners and shoppers browse heavily on mobile. A tailored Shopify or Webflow hub with instant cart checkout or tap-to-order menus will drastically boost your conversions!";
        } else if (/(landing|single page|lead capture|one page)/.test(q)) {
          selectedOptionKey = "option_a";
          answer =
            "A fast, high-converting digital presence! Option A: Landing Page / Conversion Hub is 10 Peach Coins ($500 USD). It includes 1 high-converting responsive page with a hero section, value pillars, social proof, and lead capture form.\n\nWhat we require from you: headline, core services list, logo files, and preferred photos.";
          companionInsight =
            "A clean landing page is the fastest way to validate an idea or launch a campaign without spending weeks building out subpages.";
        } else {
          isVague = true;
          selectedOptionKey = "option_b";
          answer =
            "Hey friend! For website design, Peach Network offers 3 master tiers calibrated to your business stage. If you're looking for a standard company presence, Option B: Standard Multi-Page Business Site (3–5 Pages) is 18 Coins ($900 USD). If you just need a single conversion page, Option A is 10 Coins ($500 USD). Or if you need e-commerce/restaurant ordering, Option C is 26 Coins ($1,300 USD). You can pick any tier below to see what it includes and what we require from your business!";
          companionInsight =
            "Check which tier matches your current goals. You can always start with Option A or B and expand later!";
        }
      } else if (cat.id === "branding_design") {
        if (/(overhaul|full brand|guidelines|stationery|rebrand)/.test(q)) {
          selectedOptionKey = "option_c";
          answer =
            "A complete visual overhaul! Option C: Full Commercial Brand Identity Overhaul is 12 Peach Coins ($600 USD). You get primary, secondary, horizontal, and vertical logo variations, custom color palette, stationery suite, and a 12-page commercial brand guidelines PDF.\n\nWhat we require from you: brand questionnaire response, existing assets, and active feedback across 2 review rounds.";
        } else if (/(brand sheet|starter|palette|typography)/.test(q)) {
          selectedOptionKey = "option_b";
          answer =
            "The sweet spot for consistency! Option B: Brand Identity Starter & Brand Sheet is 6 Peach Coins ($300 USD). You get your primary logo, secondary marks, and a 1-Page Master Brand Sheet with color palettes (Hex, RGB, CMYK) and font pairings.\n\nWhat we require from you: mission statement, preferred vibe/tone of voice, and competitor examples.";
        } else {
          isVague = true;
          selectedOptionKey = "option_a";
          answer =
            "Hey! For branding, Peach Network has 3 straightforward options: Option A: Core Logo & Vector Kit (4 Coins / $200 USD) for a clean standalone mark; Option B: Brand Identity Starter & Brand Sheet (6 Coins / $300 USD) for logos plus full typography & color sheet; or Option C: Full Commercial Brand Overhaul (12 Coins / $600 USD) with stationery and 12-page brand guidelines. Take a look at the 3 tiers below to select your best fit!";
          companionInsight =
            "Having a master brand sheet (Option B) prevents mismatched colors and fonts across your social media and physical signage!";
        }
      } else if (cat.id === "commercial_photography") {
        if (/(restaurant|food|culinary|chef|dish)/.test(q)) {
          selectedOptionKey = "option_c";
          answer =
            "On-location food & venue photography! Option C: On-Location Restaurant & Brand Shoot is 12 Peach Coins ($600 USD). Includes a 2-hour shoot at your venue, 10 signature plated dishes styled under professional lighting, dining room and bar action shots, and 20 retouched commercial photos.\n\nWhat we require from you: a 2-hour window during prep hours and kitchen staff ready to plate dishes fresh.";
        } else if (/(tabletop|product|shoe|retail|bottle)/.test(q)) {
          selectedOptionKey = "option_b";
          answer =
            "Clean studio product imagery! Option B: Product Tabletop Session (Footwear / Retail) is 10 Peach Coins ($500 USD). Covers up to 5 physical products, multiple angles, detail closeups, clean white cutouts, and 15 retouched commercial images.\n\nWhat we require from you: physical product samples shipped/delivered clean, and your required angle checklist.";
        } else {
          selectedOptionKey = "option_a";
          answer =
            "Executive portraits and headshots! Option A: Executive & Creative Portrait Session is 6 Peach Coins ($300 USD). 1-hour session on location or studio, mobile lighting, and 5 retouched master portraits.\n\nWhat we require from you: wardrobe selection and on-time arrival.";
        }
      } else if (cat.id === "social_media") {
        if (/(monthly|30 day|calendar|video|reel)/.test(q)) {
          selectedOptionKey = "option_c";
          answer =
            "A full month of branded content! Option C: Monthly Social Suite + Video Reels is 8 Peach Coins ($400 USD). Includes 12 custom branded assets scheduled for a 30-day calendar, plus 2 animated motion video teasers (15–30s).\n\nWhat we require from you: monthly campaign goals and raw photos/video clips.";
        } else if (/(carousel|slide)/.test(q)) {
          selectedOptionKey = "option_b";
          answer =
            "High-converting carousel storytelling! Option B: Multi-Slide Carousel Drop is 4 Peach Coins ($200 USD). 1 seamless 6–8 slide carousel with custom hook and CTA slide plus caption copy.\n\nWhat we require from you: topic bullet points or outline and product details.";
        } else {
          selectedOptionKey = "option_a";
          answer =
            "Launch campaign pack! Option A: Social Campaign Launch Pack (4 Posts) is 3 Peach Coins ($150 USD). 4 coordinated feed designs (1:1 Square) + 9:16 Story formats with editable source files.\n\nWhat we require from you: headlines, dates, and promo offer details.";
        }
      } else {
        // Graphic Design
        if (/(menu|packaging|die-line|dieline|box|brochure)/.test(q)) {
          selectedOptionKey = "option_c";
          answer =
            "Multi-page print or packaging! Option C: Multi-Page Menu, Brochure or Packaging Die-Line is 6 Peach Coins ($300 USD). Up to 4-page folded menu or complete box/label die-line with press-ready bleeds and 3D digital mockup.\n\nWhat we require from you: printer template specs and proofread menu/ingredient copy.";
        } else if (/(flyer|poster|event|promo)/.test(q)) {
          selectedOptionKey = "option_b";
          answer =
            "Commercial event promotion! Option B: Commercial Event / Promo Flyer Launch Kit is 2 Peach Coins ($100 USD). High-impact single or double-sided flyer with 1:1 feed square, 9:16 story format, 300 DPI print-ready PDF with bleeds, and QR code placement.\n\nWhat we require from you: event date, venue, headliners, ticket link, and 1–2 photos.";
        } else {
          selectedOptionKey = "option_a";
          answer =
            "Quick design revision! Option A: Quick Task / Minor Graphic Revision is 1 Peach Coin ($50 USD). Business card layout, social header, or text/price update on existing artwork with print-ready PDF.\n\nWhat we require from you: existing design file and exact text changes.";
        }
      }

      const opt = cat.options[selectedOptionKey];
      parsed = {
        answer,
        companionInsight,
        isVague,
        categoryId: cat.id,
        selectedTier: selectedOptionKey,
        scope: {
          title: opt.tierName,
          category: cat.categoryTag,
          serviceKey: cat.id,
          coins: opt.coins,
          usdAmount: opt.coins * PEACH_COIN_USD_RATE,
          deliverables: opt.deliverables,
          requiredFromBusiness: opt.requiredFromBusiness,
          estimatedTurnaround: opt.typicalTurnaround,
          revisionRounds: 3,
          reason: `Scoped from 2026 Master Catalog (${opt.coins} Coins = $${opt.coins * PEACH_COIN_USD_RATE} USD). Includes 3 revision rounds and 100% administrative transfer.`,
        },
        topCreativeIds: [
          { id: pool[0]?.id || "cr_nia", score: 98, reason: "Specialist with verified design history in this exact category." },
          { id: pool[1]?.id || "cr_jordan", score: 95, reason: "Strong commercial portfolio and rapid turnaround record." },
          { id: pool[2]?.id || "cr_maya", score: 94, reason: "Proven track record with local businesses and commercial brand deliverables." },
        ],
      };
    }

    const catObj = MASTER_2026_CATALOG[parsed.categoryId] || masterCat;
    const scopeData = parsed.scope || {};
    const coins = Math.max(1, Number(scopeData.coins) || catObj.options.option_a.coins);

    // Filter matched creatives to top 3 based on category / industry history
    const matchedIds: Array<{ id: string; score: number; reason: string }> = Array.isArray(parsed?.topCreativeIds)
      ? parsed.topCreativeIds
      : [];

    const matchedCreatives: CreativeCandidate[] = [];
    const poolById = new Map(pool.map((c) => [c.id, c]));

    for (const item of matchedIds) {
      const c = poolById.get(item.id);
      if (c && !matchedCreatives.some((m) => m.id === c.id)) {
        matchedCreatives.push({
          ...c,
          match_score: Math.max(75, Math.min(99, Number(item.score) || 95)),
          match_reason: String(item.reason || c.match_reason),
        });
      }
    }

    // Fill pool to 3 creatives prioritized by relevant industry history
    const sortedPool = [...pool].sort((a, b) => {
      const aMatches = a.specialties.some((s) => s.toLowerCase().includes(catObj.categoryTag.toLowerCase()));
      const bMatches = b.specialties.some((s) => s.toLowerCase().includes(catObj.categoryTag.toLowerCase()));
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

    for (const c of sortedPool) {
      if (matchedCreatives.length >= 3) break;
      if (!matchedCreatives.some((m) => m.id === c.id)) {
        matchedCreatives.push(c);
      }
    }

    // Assemble the 3 catalog tiers (Option A, Option B, Option C)
    const catalogTiers: CatalogTierOption[] = [
      catObj.options.option_a,
      catObj.options.option_b,
      catObj.options.option_c,
    ];

    return NextResponse.json({
      answer: parsed.answer,
      companionInsight: parsed.companionInsight || "We are here to support your business every step of the way!",
      isVague: Boolean(parsed.isVague),
      categoryId: catObj.id,
      catalogTiers,
      scope: {
        title: scopeData.title || catObj.options.option_b.tierName,
        category: scopeData.category || catObj.categoryTag,
        serviceKey: scopeData.serviceKey || catObj.id,
        coins,
        usdAmount: coins * PEACH_COIN_USD_RATE,
        deliverables:
          Array.isArray(scopeData.deliverables) && scopeData.deliverables.length > 0
            ? scopeData.deliverables
            : catObj.options.option_b.deliverables,
        requiredFromBusiness:
          Array.isArray(scopeData.requiredFromBusiness) && scopeData.requiredFromBusiness.length > 0
            ? scopeData.requiredFromBusiness
            : catObj.options.option_b.requiredFromBusiness,
        estimatedTurnaround: scopeData.estimatedTurnaround || catObj.options.option_b.typicalTurnaround,
        revisionRounds: 3,
        reason: scopeData.reason || `Scoped at ${coins} Peach Coins ($${coins * PEACH_COIN_USD_RATE} USD) from the 2026 Master Catalog.`,
      },
      matchedCreatives: matchedCreatives.slice(0, 3),
    });
  } catch (err: any) {
    console.warn("AI Consult safe fallback:", err?.message || err);
    const cat = MASTER_2026_CATALOG.graphic_design;
    const opt = cat.options.option_b;
    return NextResponse.json({
      answer:
        "Peach Match AI scoped your request using the 2026 Master Catalog! On Peach Network, 1 Peach Coin equals $50.00 USD of vetted studio work, including 3 revision rounds and 100% administrative transfer.",
      companionInsight: "We are right here with you! Tell us more details anytime to adjust your scope.",
      isVague: false,
      categoryId: cat.id,
      catalogTiers: [cat.options.option_a, cat.options.option_b, cat.options.option_c],
      scope: {
        title: opt.tierName,
        category: cat.categoryTag,
        serviceKey: cat.id,
        coins: opt.coins,
        usdAmount: opt.coins * PEACH_COIN_USD_RATE,
        deliverables: opt.deliverables,
        requiredFromBusiness: opt.requiredFromBusiness,
        estimatedTurnaround: opt.typicalTurnaround,
        revisionRounds: 3,
        reason: `Priced at ${opt.coins} Peach Coins ($${opt.coins * PEACH_COIN_USD_RATE} USD) via the 2026 Master Catalog.`,
      },
      matchedCreatives: APPROVED_CREATIVES_FALLBACK.slice(0, 3),
    });
  }
}
