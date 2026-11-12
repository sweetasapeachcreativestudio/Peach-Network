import { NextResponse } from "next/server";
import { safeGenerateContent, ThinkingLevel } from "@/lib/gemini";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MASTER_2026_CATALOG,
  PEACH_COIN_USD_RATE,
  findCategoryByKeywords,
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
    match_score: 98,
    match_reason: "Specialized in restaurant web architecture, digital menus, table reservation widgets, and Shopify store builds.",
    specialties: ["Web Design", "Landing Pages", "E-Commerce UI", "Shopify", "Webflow"],
    featured_work: {
      title: "Aura Botanical Skincare Storefront & Cart",
      image_url: "/Project 3.png",
      industry: "Retail & E-Commerce",
      tags: ["Web Design", "Shopify", "UI/UX"],
    },
  },
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
    match_score: 97,
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

interface DiagnosticQuestion {
  id: string;
  question: string;
  pills: string[];
}

function generateDefaultDiagnostic(categoryKey: string, queryText: string) {
  const q = queryText.toLowerCase();

  if (categoryKey === "website_design") {
    const isRestaurant = /(restaurant|cafe|bar|food|dining|bakery|bistro)/.test(q);
    return {
      headline: isRestaurant ? "Let's scope your restaurant website" : "Let's dial in your website requirements",
      answer: "Before recommending an exact scope, I need to check 3 quick details so you don't overpay or get under-scoped:",
      questions: [
        {
          id: "q_feature",
          question: isRestaurant ? "What does the restaurant site need to do?" : "What core function does the website need?",
          pills: isRestaurant
            ? ["Simple Menu & Location Hours", "Interactive Menu & Table Reservations", "Full Online Takeout & Catering Hub"]
            : ["Simple Landing Page / Lead Capture", "Standard Multi-Page Business Site (3–5 Pages)", "Full E-Commerce / Product Catalog"],
        },
        {
          id: "q_assets",
          question: "Do you already have photos and branding ready?",
          pills: ["Logos & Photos Ready", "Need Creative to Source Stock Photos", "Need an On-Location Photographer (+12 Coins)"],
        },
        {
          id: "q_timeline",
          question: "What is your target launch timeline?",
          pills: ["Urgent (5–7 Days)", "Standard (2–3 Weeks)", "Flexible Launch"],
        },
      ],
    };
  }

  if (categoryKey === "branding_design") {
    return {
      headline: "Let's diagnose your brand identity needs",
      answer: "Branding ranges from a clean standalone mark to a full corporate system. Tell me what stage you're in:",
      questions: [
        {
          id: "q_scope",
          question: "What level of brand identity do you need?",
          pills: ["Core Logo & Vector Kit", "Brand Sheet (Colors & Typography)", "Full Commercial Brand Overhaul (Guidelines)"],
        },
        {
          id: "q_starting_point",
          question: "What are we starting with?",
          pills: ["Starting from Scratch", "Have a Sketch / Idea to Vectorize", "Existing Logo Needs a Modern Refresh"],
        },
        {
          id: "q_application",
          question: "Where will this branding be used first?",
          pills: ["Storefront & Signage", "Website & Social Media", "Product Packaging & Merch"],
        },
      ],
    };
  }

  if (categoryKey === "commercial_photography") {
    return {
      headline: "Let's plan your photography shoot",
      answer: "To match the right photographer and equipment, I need to understand your subject and venue:",
      questions: [
        {
          id: "q_type",
          question: "What kind of session are you looking for?",
          pills: ["Executive / Team Portraits (1 Hr)", "Studio Tabletop Products / Shoes (Up to 5 Items)", "On-Location Restaurant / Plated Dishes (2 Hrs)"],
        },
        {
          id: "q_volume",
          question: "How many finished retouched photos do you need?",
          pills: ["5 Retouched Master Shots", "15 Commercial E-Commerce Images", "20+ Editorial & Venue Shots"],
        },
        {
          id: "q_location",
          question: "Where will the session take place?",
          pills: ["On-Location at Venue / Office", "Studio Tabletop (Products Shipped)", "Outdoor / City Location"],
        },
      ],
    };
  }

  if (categoryKey === "social_media") {
    return {
      headline: "Let's scope your social media campaign",
      answer: "Social design depends on your content volume and whether you need static posts or video motion:",
      questions: [
        {
          id: "q_format",
          question: "What format do you need created?",
          pills: ["4-Post Campaign Launch Pack", "High-Converting Carousel Drop (6–8 Slides)", "Monthly 30-Day Suite + 2 Video Reels"],
        },
        {
          id: "q_assets",
          question: "Do you have raw photo or video assets ready?",
          pills: ["Raw Photos / Clips Ready", "Need Creative to Provide Stock", "Need Video Motion from Scratch"],
        },
        {
          id: "q_platforms",
          question: "Primary social channels?",
          pills: ["Instagram & TikTok", "LinkedIn & Facebook", "All Channels"],
        },
      ],
    };
  }

  // Graphic Design
  return {
    headline: "Let's scope your graphic design deliverable",
    answer: "To give you the exact coin rate, tell me about your format and print requirements:",
    questions: [
      {
        id: "q_item",
        question: "What are we designing?",
        pills: ["Commercial Event Promo Flyer", "Multi-Page Menu / Brochure", "Product Packaging Box / Label Dieline"],
      },
      {
        id: "q_complexity",
        question: "What photo editing is required?",
        pills: ["Clean Layout with 1–2 Photos", "Multiple Photo Cutouts & 3D Lighting", "Vector Artwork / Dieline Only"],
      },
      {
        id: "q_output",
        question: "How will this be used?",
        pills: ["Digital Social Formats Only", "Commercial Print Ready (300 DPI)", "Both Print & Social Story Formats"],
      },
    ],
  };
}

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

    const masterCat = findCategoryByKeywords(trimmed);
    const historyArray: Array<{ role: string; content: string }> = Array.isArray(history) ? history : [];

    // Check if the user is answering a previous diagnosis OR if this is the first open-ended inquiry
    // If history has at least 1 previous assistant turn, user is answering diagnostic questions.
    const hasPreviousDiagnosticTurn = historyArray.some((h) => h.role === "assistant");

    // Also check if user message explicitly provides complete specifications upfront:
    const qLower = trimmed.toLowerCase();
    const hasExplicitTierSpecified =
      /(landing page|e-commerce|ecommerce|shopify|webflow|table reservations|menu and hours|brand sheet|logo overhaul|tabletop shoot|culinary shoot|portrait session|carousel drop|monthly social|flyer launch kit|packaging die-line)/.test(
        qLower
      );

    const isDiagnosisPhase = !hasPreviousDiagnosticTurn && !hasExplicitTierSpecified;

    // ==========================================
    // PHASE 1: DIAGNOSE FIRST (No pricing on message 1)
    // ==========================================
    if (isDiagnosisPhase) {
      const diag = generateDefaultDiagnostic(masterCat.id, trimmed);
      return NextResponse.json({
        mode: "diagnostic",
        headline: diag.headline,
        answer: diag.answer,
        diagnosticQuestions: diag.questions,
        scope: null,
        matchedCreatives: [],
      });
    }

    // ==========================================
    // PHASE 2: ONE DEFINITIVE RECOMMENDATION
    // ==========================================
    const systemInstruction = `You are Peach Match AI, a Senior Creative Director at Peach Network in Birmingham, AL.
You speak like a calm, high-end agency concierge. Keep your answers brief, confident, and scannable in 5 seconds.

MASTER PRICING LAW:
1 Peach Coin = Exactly $50 USD.
Every project includes 3 revision rounds and 100% administrative site/asset transfer upon completion.

2026 MASTER RATES TIERS:
1. Website Design:
   • Option A: Landing Page / Conversion Hub — 10 Coins ($500), 5–7 Days.
   • Option B: Standard Multi-Page Business Site (3–5 Pages) — 18 Coins ($900), 8–12 Days.
   • Option C: Advanced Retail E-Commerce or Restaurant Hub — 26 Coins ($1,300), 12–16 Days (Shopify/Webflow, product variants or digital menus + table reservations/ordering).
   • Add-On: On-Location Photographer Pairing (+12 Coins / $600 USD).
2. Branding Design:
   • Option A: Core Logo & Vector Kit — 4 Coins ($200), 3–4 Days.
   • Option B: Brand Identity Starter & Brand Sheet — 6 Coins ($300), 4–5 Days (Logos + typography + color palette).
   • Option C: Full Commercial Brand Identity Overhaul — 12 Coins ($600), 7–10 Days (4 logo variations, stationery, 12-page brand guidelines).
3. Commercial Photography:
   • Option A: Executive & Creative Portrait Session — 6 Coins ($300), 3–5 Days (5 retouched portraits).
   • Option B: Product Tabletop Session (Footwear / Retail) — 10 Coins ($500), 5–7 Days (Up to 5 products, 15 retouched images).
   • Option C: On-Location Restaurant, Culinary & Brand Shoot — 12 Coins ($600), 5–7 Days (2 hrs, 10 styled dishes, 20 retouched photos).
4. Social Media Design:
   • Option A: Social Campaign Launch Pack (4 Posts) — 3 Coins ($150), 2–3 Days.
   • Option B: High-Converting Multi-Slide Carousel Drop — 4 Coins ($200), 3–4 Days.
   • Option C: Monthly Social Suite + Video Reels / Motion Teasers — 8 Coins ($400), 5–7 Days.
5. Graphic Design:
   • Option A: Quick Task / Minor Graphic Revision — 1 Coin ($50), 1–2 Days.
   • Option B: Commercial Event / Promo Flyer Launch Kit — 2 Coins ($100), 2–3 Days.
   • Option C: Multi-Page Menu, Brochure or Packaging Die-Line — 6 Coins ($300), 4–6 Days.

CRITICAL RULES FOR RECOMMENDATION:
1. Give ONE Definitive Recommendation that precisely fits the user's technical requirements and asset readiness.
2. State the exact package name, coins, USD, turnaround, and what is required from the business.
3. Keep the text concise: 2 short paragraphs max. No clutter. No "tips".
4. Select 3 skill-accurate creatives whose specialties and verified portfolios prove they can execute this exact tier.`;

    const compactPool = pool.map((c) => ({
      id: c.id,
      name: c.name,
      headline: c.headline,
      hub: c.hub,
      specialties: c.specialties,
      historyOfDesigning: c.featured_work.title,
      industry: c.featured_work.industry,
    }));

    const prompt = `CLIENT BRIEF & DIAGNOSTIC CONTEXT:
"""${trimmed}"""

RECENT CHAT HISTORY:
${JSON.stringify(historyArray.slice(-4))}

AVAILABLE CREATIVES:
${JSON.stringify(compactPool, null, 2)}

Provide your response in strictly valid JSON:
{
  "mode": "recommendation",
  "answer": "Concise 2-sentence explanation of why this specific package is the right commercial recommendation.",
  "scope": {
    "title": "Exact title of recommended tier",
    "category": "Website" | "Brand & Illustration" | "Photography" | "Design",
    "serviceKey": "website_design" | "branding_design" | "commercial_photography" | "social_media" | "graphic_design",
    "coins": number,
    "usdAmount": number,
    "deliverables": ["3 to 4 concrete deliverables"],
    "requiredFromBusiness": ["2 to 3 assets required from client"],
    "estimatedTurnaround": "e.g., 8–12 Business Days",
    "revisionRounds": 3,
    "reason": "1-sentence reason why this exact package fits"
  },
  "topCreativeIds": [
    { "id": "creative_id", "score": 98, "reason": "Specific skill fit citing past work" }
  ]
}`;

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
          timeoutMs: 20000,
        });
        if (rawText) {
          parsed = JSON.parse(rawText);
        }
      } catch (modelErr) {
        console.warn("Gemini model fallback:", modelErr);
      }
    }

    // Deterministic fallback recommendation engine
    if (!parsed || !parsed.scope) {
      const cat = masterCat;
      let optKey: "option_a" | "option_b" | "option_c" = "option_b";

      if (cat.id === "website_design") {
        if (/(e-commerce|ecommerce|store|shop|shoe|restaurant|online ordering|reservation|menu)/.test(qLower)) {
          optKey = "option_c"; // 26 Coins
        } else if (/(landing|single page|lead capture|one page)/.test(qLower)) {
          optKey = "option_a"; // 10 Coins
        } else {
          optKey = "option_b"; // 18 Coins
        }
      } else if (cat.id === "branding_design") {
        if (/(overhaul|full brand|guidelines|stationery|rebrand)/.test(qLower)) {
          optKey = "option_c"; // 12 Coins
        } else if (/(brand sheet|starter|palette|typography)/.test(qLower)) {
          optKey = "option_b"; // 6 Coins
        } else {
          optKey = "option_a"; // 4 Coins
        }
      } else if (cat.id === "commercial_photography") {
        if (/(restaurant|food|culinary|chef|dish)/.test(qLower)) {
          optKey = "option_c"; // 12 Coins
        } else if (/(tabletop|product|shoe|retail|bottle)/.test(qLower)) {
          optKey = "option_b"; // 10 Coins
        } else {
          optKey = "option_a"; // 6 Coins
        }
      } else if (cat.id === "social_media") {
        if (/(monthly|30 day|calendar|video|reel)/.test(qLower)) {
          optKey = "option_c"; // 8 Coins
        } else if (/(carousel|slide)/.test(qLower)) {
          optKey = "option_b"; // 4 Coins
        } else {
          optKey = "option_a"; // 3 Coins
        }
      } else {
        // Graphic Design
        if (/(menu|packaging|die-line|dieline|box|brochure)/.test(qLower)) {
          optKey = "option_c"; // 6 Coins
        } else if (/(flyer|poster|event|promo)/.test(qLower)) {
          optKey = "option_b"; // 2 Coins
        } else {
          optKey = "option_a"; // 1 Coin
        }
      }

      const opt = cat.options[optKey];
      parsed = {
        mode: "recommendation",
        answer: `Based on your technical requirements, I recommend **${opt.tierName}**. This gives your business a complete commercial setup with 100% ownership transfer and 3 included revision rounds.`,
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
          reason: `Locked in based on your required features, assets, and timeline (${opt.coins} Coins = $${opt.coins * PEACH_COIN_USD_RATE} USD).`,
        },
        topCreativeIds: [
          { id: pool[0]?.id || "cr_nia", score: 98, reason: "Verified commercial portfolio executing this exact tier." },
          { id: pool[1]?.id || "cr_maya", score: 96, reason: "Specialized in commercial branding and print production." },
          { id: pool[2]?.id || "cr_jordan", score: 94, reason: "Proven track record with high-impact commercial deliverables." },
        ],
      };
    }

    const scopeData = parsed.scope;
    const coins = Math.max(1, Number(scopeData.coins) || 10);

    // Skill-accurate creative matching
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

    // Ensure 3 creatives prioritized by exact skill alignment
    const targetTag = scopeData.category?.toLowerCase() || "design";
    const sortedPool = [...pool].sort((a, b) => {
      const aMatches = a.specialties.some((s) => s.toLowerCase().includes(targetTag));
      const bMatches = b.specialties.some((s) => s.toLowerCase().includes(targetTag));
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

    return NextResponse.json({
      mode: "recommendation",
      answer: parsed.answer,
      diagnosticQuestions: null,
      scope: {
        title: scopeData.title,
        category: scopeData.category || "Design",
        serviceKey: scopeData.serviceKey || "website_design",
        coins,
        usdAmount: coins * PEACH_COIN_USD_RATE,
        deliverables: scopeData.deliverables,
        requiredFromBusiness: scopeData.requiredFromBusiness,
        estimatedTurnaround: scopeData.estimatedTurnaround,
        revisionRounds: 3,
        reason: scopeData.reason,
      },
      matchedCreatives: matchedCreatives.slice(0, 3),
    });
  } catch (err: any) {
    console.warn("AI Consult safe fallback:", err?.message || err);
    return NextResponse.json({
      mode: "diagnostic",
      headline: "Let's diagnose your project requirements",
      answer: "Before recommending an exact scope, let me ask 3 quick questions so we don't under-scope or over-quote:",
      diagnosticQuestions: [
        {
          id: "q_scope",
          question: "What core deliverable do you need?",
          pills: ["Landing Page / Web Design", "Brand Identity & Logo Suite", "Commercial Photography / Product Shoot", "Event Flyer / Print Promo"],
        },
        {
          id: "q_assets",
          question: "Do you have brand assets and copy ready?",
          pills: ["Assets & Copy Ready", "Need Creative to Sourcing/Editing", "Starting from Scratch"],
        },
        {
          id: "q_timeline",
          question: "What is your target completion timeline?",
          pills: ["Urgent (Within 1 Week)", "Standard (2–3 Weeks)", "Flexible Timeline"],
        },
      ],
      scope: null,
      matchedCreatives: [],
    });
  }
}
