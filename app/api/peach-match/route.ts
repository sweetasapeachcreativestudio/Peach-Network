import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  MASTER_2026_CATALOG,
  PEACH_COIN_USD_RATE,
  findCategoryByKeywords,
} from "@/lib/project-pricing";
import {
  computeBusinessBrandReadiness,
  computeCreativeBusinessReadiness,
  type BusinessBrandReadinessResult,
} from "@/lib/readiness";
import { formatCityHub } from "@/lib/hubs";

export interface ProjectPlanItem {
  id: string;
  service: string;
  serviceKey: string;
  package: string;
  category: string;
  coins: number;
  usd: number;
  status: "needed" | "optional" | "completed";
  estimatedTurnaround: string;
  reason: string;
  deliverables: string[];
  requiredFromBusiness: string[];
}

export interface ProjectPlanPayload {
  goalSummary: string;
  clientBudgetCoins: number | null;
  recommendedItems: ProjectPlanItem[];
  totalCoins: number;
  walletCoverage: "covered" | "partial" | "top_up_needed";
}

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

const PEACH_MATCH_SYSTEM_INSTRUCTION = `You are Peachy™, the Senior Creative Director for Peach Network based in Birmingham, Alabama.
You are a warm, welcoming, sharp, and lightly sassy seasoned female Creative Director who uses plain language, zero agency buzzwords, and keeps advice and scoping punchy, insightful, and decisive.

MASTER PRICING LAW:
- 1 Peach Coin = Exactly $50 USD.
- Every project includes 3 revision rounds, Peach Project Protection (review proofs before sign-off), and 100% administrative site and asset ownership transfer upon completion.

2026 MASTER RATES TIERS & CATALOG:
1. Website Design (UI/UX, Responsive, Webflow / Squarespace / Shopify):
   - Option A: Landing Page / Conversion Hub — 10 Coins ($500), 5–7 Days.
     (1 high-converting page, hero, value pillars, social proof, contact/lead capture, custom domain + full transfer).
   - Option B: Standard Multi-Page Business Site (3–5 Pages) — 18 Coins ($900), 8–12 Days.
     (Up to 5 pages: Home, About, Services, Gallery, Contact, mobile breakpoints, basic on-page SEO, contact routing).
   - Option C: Advanced Retail E-Commerce or Restaurant Hub — 26 Coins ($1,300), 12–16 Days.
     (Full 5–8 page architecture on Shopify/Webflow. Retail: product pages, variants, zoom gallery, cart drawer. Restaurant: categorized food/drink menu, table reservations, online ordering links).
   - Add-Ons: Extra page (+3 Coins / $150), Stock photo sourcing (+2 Coins / $100), Brand colors & fonts (+4 Coins / $200), On-location photographer pairing (+10–12 Coins / $500–$600).

2. Branding Design:
   - Option A: Core Logo & Vector Kit — 4 Coins ($200), 3–4 Days.
     (Primary logo mark, secondary lockup, monochrome versions, AI/EPS/SVG/PNG vector kit).
   - Option B: Brand Identity Starter & Brand Sheet — 6 Coins ($300), 4–5 Days.
     (Primary + secondary marks, submark badge, curated font pairings, HEX/CMYK color palette, 1-page Brand Sheet PDF).
   - Option C: Full Commercial Brand Identity Overhaul — 12 Coins ($600), 7–10 Days.
     (Full identity system, 4 logo variations, custom icon set, stationery layout, 12-page Brand Guidelines PDF).

3. Commercial Photography:
   - Option A: Executive & Creative Portrait Session — 6 Coins ($300), 3–5 Days.
     (1-hour session, 1 location/backdrop, 5 retouched high-res portraits, full commercial license).
   - Option B: Product Tabletop Session (Footwear / Retail) — 10 Coins ($500), 5–7 Days.
     (Up to 5 products, seamless studio backdrop, 15 retouched images, web & print optimization).
   - Option C: On-Location Restaurant, Culinary & Brand Shoot — 12 Coins ($600), 5–7 Days.
     (2 hours on-location, up to 10 styled dishes/cocktails, interior/kitchen ambiance, 20 retouched photos).

4. Social Media Design:
   - Option A: Social Campaign Launch Pack (4 Posts) — 3 Coins ($150), 2–3 Days.
     (4 custom feed graphics, 1:1 square & 9:16 vertical story formats, editable source files).
   - Option B: High-Converting Multi-Slide Carousel Drop — 4 Coins ($200), 3–4 Days.
     (6–8 slide swipeable carousel, hook slide, value slides, CTA slide, designed for engagement).
   - Option C: Monthly Social Suite + Video Reels / Motion Teasers — 8 Coins ($400), 5–7 Days.
     (12 static/carousel feed graphics + 2 animated video reels/motion teasers with audio sync).

5. Graphic Design:
   - Option A: Quick Task / Minor Graphic Revision — 1 Coin ($50), 1–2 Days.
     (Vector touch-up, business card layout, banner resize, single asset modification).
   - Option B: Commercial Event / Promo Flyer Launch Kit — 2 Coins ($100), 2–3 Days.
     (High-impact promo flyer, 300 DPI print-ready PDF with bleed, 9:16 IG story format, 1:1 feed square).
   - Option C: Multi-Page Menu, Brochure or Packaging Die-Line — 6 Coins ($300), 4–6 Days.
     (Up to 4-page menu or tri-fold brochure, or custom folding carton box/label dieline with print-ready CMYK specs).

CRITICAL CONVERSATIONAL & SCOPING RULES:
Rule 0: "STRICT V1 SCOPE GUARDRAIL & MIXED REQUESTS".
In Version 1, Peach Network ONLY offers 6 disciplines:
1. Graphic Design (print flyers, packaging die-lines, brochures, vector graphics)
2. Branding Design (core logos, vector kits, brand sheets, brand overhauls)
3. Website Design (responsive UI/UX, landing pages, multi-page business sites, retail/restaurant hubs on Webflow/Squarespace/Shopify)
4. Social Media Design (campaign launch graphics, multi-slide carousels, monthly post suites + video reels)
5. Commercial Photography (executive portraits, product tabletop shoots, on-location culinary & venue shoots)
6. Creative Direction (scoping, art direction, and creative curation)

A. If a business owner asks purely for a service outside V1 (e.g., mobile app development, custom software coding, backend engineering, full SEO/ad-buying retainers, 3D CGI, PR, copywriting-only, video games):
- Respond warmly: "We currently do not offer [requested service] in Version 1, but you can submit this to our **Peach Business** feedback tab to let our team know it's something you want to see in the app. Every piece of feedback helps us grow—so you are growing with us!"
- Set mode: "out_of_scope" and showFeedbackButton: true.

B. If a business owner submits a MIXED REQUEST (one part out of scope, but another part IN SCOPE, e.g. "I need a website and a mobile app" or "I need a logo and custom software coding"):
- Clearly explain that the out-of-scope part is not in V1 (point to feedback tab), but emphasize that we DO offer the in-scope deliverable (e.g., Website Design or Branding)!
- Ask if they'd like to scope the in-scope part first.
- Set mode: "mixed_scope", showFeedbackButton: true. Include quickReplies like ["Yes, scope my Website Design →", "Go to Peach Business Feedback →"].

Rule 1: "STRICT 4-STAGE STATE MACHINE".
Stage 1: GENERAL ADVICE (mode: "advice"):
- If user asks open-ended questions, creative tips, typography advice, platform comparisons:
- 2–4 sentence sharp advice. NO pricing, NO diagnostic questions, NO package cards, NO creatives.
- Include quickReplies pills.

Stage 2: SCOPING QUESTIONS / DIAGNOSTIC (mode: "diagnostic"):
- When user wants to start a project but requirements aren't dialed in:
- Ask 2–3 short diagnostic questions with clickable pills and a "Submit Answers & Get Pricing →" button.
- Check their Brand Vault! If logos, colors, or fonts exist, acknowledge them and do not ask redundant questions.
- NO prices and NO creatives.

Stage 2.5: ITEMIZED MULTI-SERVICE QUOTE (mode: "multi_service_quote"):
- Whenever the user's request or diagnostic answers require MORE THAN ONE creative discipline (e.g., Website + Commercial Photography, Branding + Website, Photography + Social Media, Branding + Packaging/Graphic Design):
  - Price EACH service clearly from the 2026 Master Rates:
    - Option 1 — [Service A] Only
    - Option 2 — [Service B] Only
    - Option 3 — Both Together (Combined Total; note Art Director Pod Supervision is included free if Combined Total > 20 Coins)
  - Check their live Coin Balance and tell them clearly what their current Coins cover right now vs. how many Coins to top up for the other service or Both Together.
  - Let them choose "Just [Service A]", "Just [Service B]", or "Both Together" BEFORE showing any creatives (topCreativeIds: []).

Stage 3: PRICE QUOTE (mode: "price_quote"):
- When user provides full specifications or submits diagnostic answers for a SINGLE discipline:
- Lock in ONE definitive package from the 2026 Master Rates.
- Present ONLY the package deliverables, turnaround, and Coin/USD price (1 Coin = $50 USD).
- Ask: "Want me to find 3 vetted creatives for this project?" with findCreativesPrompt.
- DO NOT RETURN CREATIVES YET (set topCreativeIds: []). Creatives must only be presented after user confirms.

Stage 4: MATCHED CREATIVES (mode: "matched_creatives"):
- Triggered when user confirms finding creatives (clicks "Yes, Find My Creatives →" or sends creative request).
- Nominate 3 vetted creatives from the candidate pool with verified match scores and reasons.
- Report wallet balance vs project cost (celebrate if sufficient, or explain top up / subscription).

Rule 2: "MULTIMODAL REFERENCE IMAGE ANALYSIS".
If user uploads 1–3 reference images:
- Identify deliverable type, verify if inside V1 catalog, comment on aesthetic, and diagnose first before quoting.

OUTPUT FORMAT REQUIREMENTS:
You MUST respond with strictly valid JSON adhering to one of these formats:

If GENERAL ADVICE:
{
  "mode": "advice",
  "headline": "Punchy Creative Director Insight",
  "answer": "Warm, sharp 2-4 sentence advice.",
  "quickReplies": ["Scope a Website Project", "Ask Another Question", "See 2026 Master Rates"],
  "diagnosticQuestions": null,
  "scope": null,
  "topCreativeIds": []
}

If OUT OF SCOPE:
{
  "mode": "out_of_scope",
  "headline": "Service Outside Version 1 Catalog",
  "answer": "We currently do not offer [service] in Version 1, but you can submit this to our **Peach Business** feedback tab...",
  "showFeedbackButton": true,
  "diagnosticQuestions": null,
  "scope": null,
  "topCreativeIds": []
}

If MIXED SCOPE:
{
  "mode": "mixed_scope",
  "headline": "Mixed Service Request",
  "answer": "We currently do not offer [out-of-scope service] in Version 1, but we DO offer full [in-scope service]! Would you like to move forward with [in-scope service]?",
  "showFeedbackButton": true,
  "quickReplies": ["Yes, scope my [in-scope deliverable] →", "Go to Peach Business Feedback →"],
  "diagnosticQuestions": null,
  "scope": null,
  "topCreativeIds": []
}

If DIAGNOSING / SCOPING QUESTIONS:
{
  "mode": "diagnostic",
  "headline": "Let's dial in your requirements",
  "answer": "Warm 1-2 sentence Creative Director intro.",
  "diagnosticQuestions": [
    {
      "id": "q1",
      "question": "What core functionality does the site need?",
      "pills": ["Option 1", "Option 2", "Option 3"]
    }
  ],
  "scope": null,
  "topCreativeIds": []
}

If PRICE QUOTE (STAGE 3 - NO CREATIVES YET):
{
  "mode": "price_quote",
  "headline": "Definitive Agency Recommendation & Price Quote",
  "answer": "Friendly 2-sentence explanation of why this specific package fits their operational needs and timeline.",
  "diagnosticQuestions": null,
  "scope": {
    "title": "Exact title of recommended package",
    "category": "Website" | "Brand & Illustration" | "Photography" | "Design",
    "serviceKey": "website_design" | "branding_design" | "commercial_photography" | "social_media" | "graphic_design",
    "coins": 18,
    "usdAmount": 900,
    "deliverables": ["Deliverable 1", "Deliverable 2", "100% administrative site ownership transfer"],
    "requiredFromBusiness": ["Requirement 1", "Requirement 2"],
    "estimatedTurnaround": "8–12 Business Days",
    "revisionRounds": 3,
    "reason": "Locked in for your multi-page website."
  },
  "findCreativesPrompt": "Want me to find 3 vetted creatives for this project?",
  "topCreativeIds": [],
  "projectPlan": {
    "goalSummary": "Concise 1-sentence project goal summary",
    "clientBudgetCoins": null,
    "recommendedItems": [
      {
        "id": "plan-main",
        "service": "Website Design",
        "serviceKey": "website_design",
        "package": "Option B: Standard Multi-Page Business Site (3-5 Pages)",
        "category": "Website",
        "coins": 18,
        "usd": 900,
        "status": "needed",
        "estimatedTurnaround": "8-12 Business Days",
        "reason": "Fits multi-page business goals.",
        "deliverables": ["Up to 5 custom responsive pages", "100% administrative site ownership transfer"],
        "requiredFromBusiness": ["Written copy", "Brand logo assets"]
      }
    ],
    "totalCoins": 18,
    "walletCoverage": "covered"
  }
}

If MATCHED CREATIVES (STAGE 4):
{
  "mode": "matched_creatives",
  "headline": "3 Vetted Creatives Ready for Your Project",
  "answer": "I have matched 3 top specialists with verified portfolio matches and high skill fit.",
  "diagnosticQuestions": null,
  "scope": { ...same scope as price quote... },
  "topCreativeIds": [
    { "id": "cr_nia", "score": 98, "reason": "Extensive experience with restaurant menus and Webflow/Shopify." }
  ]
}`;

function extractBudgetCoinsFromText(text: string): number | null {
  const q = text || "";
  const coinMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:peach\s*)?coins?\b/i);
  if (coinMatch) {
    const val = Math.round(Number(coinMatch[1]));
    return val > 0 ? val : null;
  }
  const usdMatch = q.match(/\$\s*([\d,]+(?:\.\d+)?)/);
  if (usdMatch) {
    const dollars = Number(usdMatch[1].replace(/,/g, ""));
    if (dollars >= 50) {
      return Math.max(1, Math.round(dollars / PEACH_COIN_USD_RATE));
    }
  }
  const budgetMatch = q.match(/budget(?:\s+of|\s+is|\s+around|\s*:)?\s*([\d,]+)/i);
  if (budgetMatch) {
    const dollars = Number(budgetMatch[1].replace(/,/g, ""));
    if (dollars >= 50) {
      return Math.max(1, Math.round(dollars / PEACH_COIN_USD_RATE));
    }
  }
  return null;
}

function buildLiveProjectPlan(params: {
  goalSummary: string;
  primaryItems: Array<{
    id: string;
    service: string;
    serviceKey: string;
    package: string;
    category: string;
    coins: number;
    usd: number;
    estimatedTurnaround: string;
    reason: string;
    deliverables: string[];
    requiredFromBusiness: string[];
    status?: "needed" | "optional" | "completed";
  }>;
  availableCoins: number;
  clientBudgetCoins: number | null;
  brandReadiness: BusinessBrandReadinessResult | null;
}): ProjectPlanPayload {
  const items: ProjectPlanItem[] = params.primaryItems.map((it) => ({
    ...it,
    status: it.status || "needed",
  }));

  if (params.brandReadiness && params.brandReadiness.suggestedServices.length > 0) {
    const alreadyHasBranding = items.some((i) => i.serviceKey === "branding_design");
    if (!alreadyHasBranding) {
      const suggestion = params.brandReadiness.suggestedServices[0];
      items.push({
        id: "plan-brand-readiness",
        service: suggestion.serviceName,
        serviceKey: suggestion.serviceKey,
        package: suggestion.packageTitle,
        category: suggestion.category,
        coins: suggestion.coins,
        usd: suggestion.usd,
        status: "optional",
        estimatedTurnaround: suggestion.estimatedTurnaround,
        reason: suggestion.reason,
        deliverables: suggestion.deliverables,
        requiredFromBusiness: ["Company name & aesthetic direction"],
      });
    }
  }

  const neededCoins = items
    .filter((i) => i.status === "needed")
    .reduce((sum, i) => sum + i.coins, 0);

  const walletCoverage: ProjectPlanPayload["walletCoverage"] =
    params.availableCoins >= neededCoins
      ? "covered"
      : params.availableCoins > 0
      ? "partial"
      : "top_up_needed";

  return {
    goalSummary: params.goalSummary,
    clientBudgetCoins: params.clientBudgetCoins,
    recommendedItems: items,
    totalCoins: neededCoins,
    walletCoverage,
  };
}

function buildDefaultDiagnostic(queryText: string) {
  const q = queryText.toLowerCase();
  const masterCat = findCategoryByKeywords(queryText);

  if (masterCat.id === "website_design") {
    const isRestaurant = /(restaurant|cafe|bar|food|dining|bakery|bistro|grill|kitchen)/.test(q);
    return {
      headline: isRestaurant ? "Let's scope your restaurant website" : "Let's dial in your website requirements",
      answer: "Before quoting a price or choosing a package, tell me 3 quick details so you don't overpay or get under-scoped:",
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

  if (masterCat.id === "branding_design") {
    return {
      headline: "Let's diagnose your brand identity needs",
      answer: "Branding ranges from a clean standalone vector mark to a full commercial identity system. Tell me what stage you're in:",
      questions: [
        {
          id: "q_scope",
          question: "What level of brand identity do you need?",
          pills: ["Core Logo & Vector Kit (4 Coins)", "Brand Sheet (Colors & Typography) (6 Coins)", "Full Commercial Brand Overhaul (12 Coins)"],
        },
        {
          id: "q_starting_point",
          question: "What are we starting with?",
          pills: ["Starting from Scratch", "Have a Sketch to Vectorize", "Existing Logo Needs a Modern Refresh"],
        },
        {
          id: "q_application",
          question: "Where will this branding be used first?",
          pills: ["Storefront & Signage", "Website & Social Media", "Product Packaging & Merch"],
        },
      ],
    };
  }

  if (masterCat.id === "commercial_photography") {
    return {
      headline: "Let's plan your photography shoot",
      answer: "To match the right photographer and equipment, let's look at your subjects and location:",
      questions: [
        {
          id: "q_type",
          question: "What kind of session are you looking for?",
          pills: ["Executive / Team Portraits (6 Coins)", "Studio Tabletop Products (10 Coins)", "On-Location Restaurant / Dishes (12 Coins)"],
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

  if (masterCat.id === "social_media") {
    return {
      headline: "Let's scope your social media campaign",
      answer: "Social design depends on your monthly volume and whether you need static posts or video motion:",
      questions: [
        {
          id: "q_format",
          question: "What format do you need created?",
          pills: ["4-Post Campaign Launch Pack (3 Coins)", "Multi-Slide Carousel Drop (4 Coins)", "Monthly 30-Day Suite + 2 Video Reels (8 Coins)"],
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

  return {
    headline: "Let's scope your graphic design deliverable",
    answer: "To lock in your exact coin rate, tell me about your format and print requirements:",
    questions: [
      {
        id: "q_item",
        question: "What are we designing?",
        pills: ["Quick Revision / Minor Graphic (1 Coin)", "Commercial Event Promo Flyer (2 Coins)", "Multi-Page Menu / Packaging Die-Line (6 Coins)"],
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

interface ScopeAnalysisResult {
  isOutOfScope: boolean;
  isMixed: boolean;
  outOfScopeService: string;
  inScopeService: string;
  inScopeCategory: string;
}

function analyzeScopeInquiry(queryText: string): ScopeAnalysisResult {
  const q = queryText.toLowerCase().trim();

  // Detect Out-of-Scope Services (outside V1 catalog)
  let detectedOutOfScope = "";
  if (
    /\b(mobile app development|ios development|android development|app developer|build a mobile app|create a mobile app|make a mobile app|code an app|ios app development|android app development|react native app|flutter app|swift app|kotlin app)\b/i.test(q) ||
    /\b(mobile app|ios app|android app|native app)\b/i.test(q)
  ) {
    detectedOutOfScope = "mobile app development";
  } else if (
    /\b(custom software|software engineering|backend engineering|backend developer|api development|database engineering|devops|full-stack code|backend code|build software|fullstack engineering)\b/i.test(q)
  ) {
    detectedOutOfScope = "custom software coding & backend engineering";
  } else if (
    /\b(ad-buying|ad buying|media buying|ppc campaign|google ads retainer|facebook ads management|meta ads retainer|full seo retainer|monthly seo retainer|link building|ad spend management)\b/i.test(q)
  ) {
    detectedOutOfScope = "full SEO & ad-buying retainers";
  } else if (
    /\b(3d cgi|cgi animation|vfx|visual effects|3d visual effects|special effects|hollywood cgi|cgi render)\b/i.test(q)
  ) {
    detectedOutOfScope = "3D CGI & visual effects";
  } else if (
    /\b(public relations|pr agency|pr retainer|press release distribution|media outreach|press release writing|crisis pr)\b/i.test(q)
  ) {
    detectedOutOfScope = "public relations & PR retainers";
  } else if (
    /\b(copywriting-only|copywriting only|blog writing|article writing|ghostwriting|blog posts only|seo articles|write my blog)\b/i.test(q)
  ) {
    detectedOutOfScope = "copywriting-only services";
  } else if (
    /\b(video game|game development|unity game|unreal engine|build a game)\b/i.test(q)
  ) {
    detectedOutOfScope = "video game development";
  }

  // Detect In-Scope Services in V1 Catalog
  let detectedInScope = "";
  let detectedInScopeCat = "";
  if (/\b(website|landing page|web page|web design|storefront|shopify|webflow|squarespace|e-commerce|ecommerce|online ordering|reservation site)\b/i.test(q)) {
    detectedInScope = "Website Design";
    detectedInScopeCat = "website_design";
  } else if (/\b(branding|brand identity|logo|logomark|vector kit|brand sheet|rebrand|typography|visual identity)\b/i.test(q)) {
    detectedInScope = "Branding Design";
    detectedInScopeCat = "branding_design";
  } else if (/\b(photography|photo shoot|headshot|portrait|tabletop shoot|culinary shoot|dish photo|food photo|product shoot)\b/i.test(q)) {
    detectedInScope = "Commercial Photography";
    detectedInScopeCat = "commercial_photography";
  } else if (/\b(social media|instagram|carousel|video reel|motion teaser|reels|tiktok graphics|social campaign)\b/i.test(q)) {
    detectedInScope = "Social Media Design";
    detectedInScopeCat = "social_media";
  } else if (/\b(graphic design|flyer|promo poster|menu design|brochure|packaging|die-line|dieline|packaging design)\b/i.test(q)) {
    detectedInScope = "Graphic Design";
    detectedInScopeCat = "graphic_design";
  }

  if (detectedOutOfScope && detectedInScope) {
    return {
      isOutOfScope: false,
      isMixed: true,
      outOfScopeService: detectedOutOfScope,
      inScopeService: detectedInScope,
      inScopeCategory: detectedInScopeCat,
    };
  }

  if (detectedOutOfScope && !detectedInScope) {
    return {
      isOutOfScope: true,
      isMixed: false,
      outOfScopeService: detectedOutOfScope,
      inScopeService: "",
      inScopeCategory: "",
    };
  }

  return {
    isOutOfScope: false,
    isMixed: false,
    outOfScopeService: "",
    inScopeService: detectedInScope,
    inScopeCategory: detectedInScopeCat,
  };
}

interface ServiceOptionQuote {
  serviceKey: string;
  serviceName: string;
  category: string;
  title: string;
  coins: number;
  usdAmount: number;
  estimatedTurnaround: string;
  deliverables: string[];
  requiredFromBusiness: string[];
  reason: string;
}

interface MultiServiceQuotePayload {
  serviceA: ServiceOptionQuote;
  serviceB: ServiceOptionQuote;
  combined: {
    title: string;
    coins: number;
    usdAmount: number;
    estimatedTurnaround: string;
    includesPodSupervision: boolean;
    deliverables: string[];
    requiredFromBusiness: string[];
  };
  walletCoverageMessage: string;
}

const DISCIPLINE_KEYWORDS: Record<string, RegExp> = {
  website_design: /\b(website|web site|landing page|web page|web design|storefront|shopify|webflow|squarespace|framer|e-commerce|ecommerce|online ordering|reservation site|multi-page business site|conversion hub)\b/i,
  commercial_photography: /\b(photography|photographer|on-location photographer|photo shoot|headshot|portrait|tabletop|culinary shoot|dish photo|food photo|product shoot|camera|studio shoot)\b/i,
  branding_design: /\b(branding|brand identity|logo|logomark|vector kit|brand sheet|rebrand|typography|visual identity|brand overhaul)\b/i,
  social_media: /\b(social media|instagram|carousel|video reel|motion teaser|reels|tiktok|social campaign|monthly social)\b/i,
  graphic_design: /\b(graphic design|flyer|promo poster|menu design|brochure|packaging|die-line|dieline|packaging design|business card)\b/i,
};

function creativeMatchesDiscipline(creative: CreativeCandidate, serviceKey: string): boolean {
  const profileBlob = [creative.headline, creative.bio, ...(creative.specialties || [])]
    .join(" ")
    .toLowerCase();
  const portfolioBlob = [
    creative.featured_work?.title || "",
    creative.featured_work?.industry || "",
    ...(creative.featured_work?.tags || []),
  ]
    .join(" ")
    .toLowerCase();

  const matchesPatterns: Record<string, RegExp> = {
    website_design: /(web|website|landing|shopify|webflow|squarespace|wix|framer|ui\/ux|e-commerce|ecommerce|digital experience)/i,
    commercial_photography: /(photo|photography|photographer|portrait|tabletop|culinary|product shoot|studio lighting)/i,
    branding_design: /(brand|branding|logo|identity|typography|illustration|visual identity|stationery)/i,
    social_media: /(social|carousel|reel|video|motion|tiktok|instagram)/i,
    graphic_design: /(graphic|flyer|poster|menu|brochure|packaging|dieline|print)/i,
  };

  const rx = matchesPatterns[serviceKey] || matchesPatterns.graphic_design;
  return rx.test(profileBlob) && (rx.test(portfolioBlob) || rx.test(profileBlob));
}

function creativeStrictlyVerifiedForDiscipline(creative: CreativeCandidate, serviceKey: string): boolean {
  const profileBlob = [creative.headline, ...(creative.specialties || [])].join(" ").toLowerCase();
  const portfolioBlob = [
    creative.featured_work?.title || "",
    ...(creative.featured_work?.tags || []),
  ]
    .join(" ")
    .toLowerCase();

  const matchesPatterns: Record<string, RegExp> = {
    website_design: /(web|website|landing|shopify|webflow|squarespace|wix|framer|ui\/ux|e-commerce|ecommerce)/i,
    commercial_photography: /(photo|photography|photographer|portrait|tabletop|culinary|product shoot|studio lighting)/i,
    branding_design: /(brand|branding|logo|identity|typography|brand guidelines|stationery)/i,
    social_media: /(social|carousel|reel|video|motion|tiktok|instagram)/i,
    graphic_design: /(graphic|flyer|poster|menu|brochure|packaging|dieline|print)/i,
  };

  const rx = matchesPatterns[serviceKey] || matchesPatterns.graphic_design;
  return rx.test(profileBlob) && rx.test(portfolioBlob);
}

function rankCreativesForService(
  pool: CreativeCandidate[],
  serviceKey: string,
  businessHub?: string
): CreativeCandidate[] {
  const localPriority =
    (serviceKey === "commercial_photography" || serviceKey === "graphic_design") &&
    Boolean(businessHub) &&
    businessHub !== "US Remote";

  return [...pool]
    .sort((a, b) => {
      const aStrict = creativeStrictlyVerifiedForDiscipline(a, serviceKey) ? 2 : creativeMatchesDiscipline(a, serviceKey) ? 1 : 0;
      const bStrict = creativeStrictlyVerifiedForDiscipline(b, serviceKey) ? 2 : creativeMatchesDiscipline(b, serviceKey) ? 1 : 0;
      if (aStrict !== bStrict) return bStrict - aStrict;

      if (localPriority) {
        const aLocal = a.hub?.toLowerCase() === businessHub?.toLowerCase() ? 1 : 0;
        const bLocal = b.hub?.toLowerCase() === businessHub?.toLowerCase() ? 1 : 0;
        if (aLocal !== bLocal) return bLocal - aLocal;
      }

      return (b.reliability_score || 0) - (a.reliability_score || 0);
    })
    .map((c) => {
      if (localPriority && c.hub?.toLowerCase() === businessHub?.toLowerCase()) {
        return {
          ...c,
          match_score: Math.min(99, (c.match_score || 95) + 2),
          match_reason: `${businessHub} local specialist · ${c.match_reason}`,
        };
      }
      return c;
    });
}

function resolveOptionForService(serviceKey: string, queryLower: string): ServiceOptionQuote {
  const cat = MASTER_2026_CATALOG[serviceKey] || MASTER_2026_CATALOG.graphic_design;
  let optKey: "option_a" | "option_b" | "option_c" = "option_b";

  if (cat.id === "website_design") {
    if (/(e-commerce|ecommerce|store|shop|shoe|restaurant|online ordering|reservation|interactive menu)/.test(queryLower)) {
      optKey = "option_c";
    } else if (/(landing|single page|lead capture|one page)/.test(queryLower)) {
      optKey = "option_a";
    } else {
      optKey = "option_b";
    }
  } else if (cat.id === "branding_design") {
    if (/(overhaul|full brand|guidelines|stationery|rebrand)/.test(queryLower)) {
      optKey = "option_c";
    } else if (/(brand sheet|starter|palette|typography)/.test(queryLower)) {
      optKey = "option_b";
    } else {
      optKey = "option_a";
    }
  } else if (cat.id === "commercial_photography") {
    if (/(restaurant|food|culinary|chef|dish|drinks|on-location|venue)/.test(queryLower)) {
      optKey = "option_c";
    } else if (/(tabletop|product|shoe|retail|bottle)/.test(queryLower)) {
      optKey = "option_b";
    } else if (/(portrait|headshot|executive)/.test(queryLower)) {
      optKey = "option_a";
    } else {
      optKey = "option_c";
    }
  } else if (cat.id === "social_media") {
    if (/(monthly|30 day|calendar|video|reel)/.test(queryLower)) {
      optKey = "option_c";
    } else if (/(carousel|slide)/.test(queryLower)) {
      optKey = "option_b";
    } else {
      optKey = "option_a";
    }
  } else {
    if (/(menu|packaging|die-line|dieline|box|brochure)/.test(queryLower)) {
      optKey = "option_c";
    } else if (/(flyer|poster|event|promo)/.test(queryLower)) {
      optKey = "option_b";
    } else {
      optKey = "option_a";
    }
  }

  const opt = cat.options[optKey];
  return {
    serviceKey: cat.id,
    serviceName: cat.title,
    category: cat.categoryTag,
    title: opt.tierName,
    coins: opt.coins,
    usdAmount: opt.coins * PEACH_COIN_USD_RATE,
    estimatedTurnaround: opt.typicalTurnaround,
    deliverables: opt.deliverables,
    requiredFromBusiness: opt.requiredFromBusiness,
    reason: `Matched ${cat.title} tier based on your requirements (${opt.coins} Coins / $${opt.coins * PEACH_COIN_USD_RATE} USD).`,
  };
}

function buildWalletCoverageMessage(
  availableCoins: number,
  serviceA: ServiceOptionQuote,
  serviceB: ServiceOptionQuote,
  combinedCoins: number
): string {
  const availUsd = availableCoins * PEACH_COIN_USD_RATE;
  const coversA = availableCoins >= serviceA.coins;
  const coversB = availableCoins >= serviceB.coins;
  const coversBoth = availableCoins >= combinedCoins;

  if (coversBoth) {
    return `You currently have ${availableCoins} Coins ($${availUsd.toLocaleString()})—that covers **Both Together** (${combinedCoins} Coins / $${(combinedCoins * PEACH_COIN_USD_RATE).toLocaleString()}) right now, or you can book just one discipline.`;
  }

  const topUpBoth = combinedCoins - availableCoins;
  if (coversA && !coversB) {
    return `You currently have ${availableCoins} Coins ($${availUsd.toLocaleString()})—that covers **${serviceA.serviceName}** (${serviceA.coins} Coins) right now, or you can top up ${topUpBoth} Coins to launch **Both Together**!`;
  }
  if (coversB && !coversA) {
    return `You currently have ${availableCoins} Coins ($${availUsd.toLocaleString()})—that covers **${serviceB.serviceName}** (${serviceB.coins} Coins) right now, or you can top up ${topUpBoth} Coins to launch **Both Together**!`;
  }
  if (coversA && coversB) {
    return `You currently have ${availableCoins} Coins ($${availUsd.toLocaleString()})—that covers **${serviceA.serviceName}** (${serviceA.coins} Coins) or **${serviceB.serviceName}** (${serviceB.coins} Coins) right now, or you can top up ${topUpBoth} Coins to launch **Both Together**!`;
  }

  const cheaper = serviceA.coins <= serviceB.coins ? serviceA : serviceB;
  const shortCheaper = cheaper.coins - availableCoins;
  return `You currently have ${availableCoins} Coins ($${availUsd.toLocaleString()}). Top up ${shortCheaper} Coins to start with **${cheaper.serviceName}** (${cheaper.coins} Coins), or top up ${topUpBoth} Coins to launch **Both Together** (${combinedCoins} Coins)!`;
}

function detectMultiServiceDisciplines(text: string): string[] {
  const ordered = [
    "website_design",
    "branding_design",
    "commercial_photography",
    "social_media",
    "graphic_design",
  ];
  const found: string[] = [];
  for (const key of ordered) {
    if (DISCIPLINE_KEYWORDS[key].test(text)) {
      found.push(key);
    }
  }
  return found;
}

function buildMultiServiceQuote(
  disciplineKeys: string[],
  queryLower: string,
  availableCoins: number
): MultiServiceQuotePayload {
  const [keyA, keyB] = disciplineKeys.slice(0, 2);
  const serviceA = resolveOptionForService(keyA, queryLower);
  const serviceB = resolveOptionForService(keyB, queryLower);
  const combinedCoins = serviceA.coins + serviceB.coins;
  const includesPodSupervision = combinedCoins > 20;

  return {
    serviceA,
    serviceB,
    combined: {
      title: `${serviceA.serviceName} + ${serviceB.serviceName} Linked Package`,
      coins: combinedCoins,
      usdAmount: combinedCoins * PEACH_COIN_USD_RATE,
      estimatedTurnaround: `${serviceA.estimatedTurnaround} (Coordinated Launch)`,
      includesPodSupervision,
      deliverables: [
        ...serviceA.deliverables.slice(0, 2),
        ...serviceB.deliverables.slice(0, 2),
        ...(includesPodSupervision
          ? ["Art Director Pod Supervision included free (combined project over 20 Coins)"]
          : []),
      ],
      requiredFromBusiness: [
        ...new Set([...serviceA.requiredFromBusiness, ...serviceB.requiredFromBusiness]),
      ].slice(0, 4),
    },
    walletCoverageMessage: buildWalletCoverageMessage(
      availableCoins,
      serviceA,
      serviceB,
      combinedCoins
    ),
  };
}

export async function POST(req: Request) {
  try {
    const {
      message,
      history,
      clientContext,
      referenceImages,
      action,
      currentScope,
      multiServiceQuote,
    } = await req.json();

    const isFindingBothCreatives = action === "find_both_creatives";
    const isFindingCreatives =
      !isFindingBothCreatives &&
      (action === "find_creatives" ||
        /(find my creatives|find creatives|yes, find|match creatives|show creatives|vetted creatives)/i.test(
          message || ""
        ));

    if (
      !isFindingCreatives &&
      !isFindingBothCreatives &&
      (!message || typeof message !== "string" || !message.trim()) &&
      (!referenceImages || referenceImages.length === 0)
    ) {
      return NextResponse.json({ error: "Please enter a question or attach a reference image." }, { status: 400 });
    }

    let availableCoins = Math.max(0, Number(clientContext?.availableCoins) || 0);
    const hasSubscription = Boolean(clientContext?.hasSubscription);
    const subscriptionPlan = clientContext?.subscriptionPlan ? String(clientContext.subscriptionPlan) : null;

    const trimmed = (message || "").trim();

    // Check scope inquiries (pure out-of-scope vs mixed-scope)
    if (!isFindingCreatives && !isFindingBothCreatives && trimmed) {
      const scopeAnalysis = analyzeScopeInquiry(trimmed);

      // Mixed Scope: User asked for both in-scope and out-of-scope together
      if (scopeAnalysis.isMixed) {
        return NextResponse.json({
          mode: "mixed_scope",
          headline: "Mixed Service Scope Request",
          answer: `We currently do not offer **${scopeAnalysis.outOfScopeService}** in Version 1, but you can submit this to our **Peach Business** feedback tab so our team knows you want it! However, **we DO offer full ${scopeAnalysis.inScopeService}**. Would you like me to scope your ${scopeAnalysis.inScopeService} project first?`,
          showFeedbackButton: true,
          quickReplies: [
            `Yes, scope my ${scopeAnalysis.inScopeService} →`,
            "Go to Peach Business Feedback →",
            "Ask Peachy™ Another Question",
          ],
          diagnosticQuestions: null,
          scope: null,
          matchedCreatives: [],
          uploadedImageUrls: [],
        });
      }

      // Pure Out-of-Scope
      if (scopeAnalysis.isOutOfScope) {
        return NextResponse.json({
          mode: "out_of_scope",
          headline: "Service Outside Version 1 Catalog",
          answer: `We currently do not offer ${scopeAnalysis.outOfScopeService} in Version 1, but you can submit this to our **Peach Business** feedback tab to let our team know it's something you want to see in the app. Every piece of feedback helps us grow—so you are growing with us!`,
          showFeedbackButton: true,
          diagnosticQuestions: null,
          scope: null,
          matchedCreatives: [],
          uploadedImageUrls: [],
        });
      }
    }

    const admin = createAdminClient();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. Fetch Brand Vault, Brand Readiness, Business Profile & Past Projects
    let brandVaultContext = "Brand Vault: Brand-new user / no assets saved yet.";
    let pastProjectsContext = "Past Projects: None yet on Peach Network.";
    let clientBusinessName = "Client Business";
    let businessHub = "US Remote";
    let brandReadiness: BusinessBrandReadinessResult | null = null;

    if (user?.id) {
      try {
        const { data: business } = await admin
          .from("businesses")
          .select("id, name, industry, description, logo_url, common_needs, city, state, website")
          .eq("owner_user_id", user.id)
          .maybeSingle();

        if (business) {
          clientBusinessName = business.name || clientBusinessName;
          businessHub = formatCityHub(business.city, business.state);
          const [{ data: liveWallet }, { data: brandAssets }, { data: pastProjects }] = await Promise.all([
            admin
              .from("coin_wallets")
              .select("available_coins")
              .eq("business_id", business.id)
              .maybeSingle(),
            admin
              .from("business_brand_assets")
              .select("id, label, kind, value, original_name, notes")
              .eq("business_id", business.id),
            admin
              .from("projects")
              .select("id, title, category, status, coin_amount, created_at")
              .eq("business_id", business.id)
              .order("created_at", { ascending: false })
              .limit(3),
          ]);

          if (typeof liveWallet?.available_coins === "number") {
            availableCoins = Math.max(0, liveWallet.available_coins);
          }

          brandReadiness = computeBusinessBrandReadiness(business, brandAssets || []);

          const logos = (brandAssets || []).filter((a: any) => a.kind === "logo" || a.kind === "vector" || a.label?.toLowerCase().includes("logo"));
          const colors = (brandAssets || []).filter((a: any) => a.kind === "color" || a.value?.startsWith("#"));
          const fonts = (brandAssets || []).filter((a: any) => a.kind === "font" || a.label?.toLowerCase().includes("font"));
          const photos = (brandAssets || []).filter((a: any) => a.kind === "photo" || a.kind === "image");
          const socialAsset = (brandAssets || []).find(
            (a: any) => a.kind === "other" && String(a.label || "").toLowerCase() === "social handles"
          );

          const assetBullets: string[] = [];
          if (logos.length > 0) {
            assetBullets.push(`• Primary Logos on file (${logos.length}): ${logos.map((l: any) => l.label || l.original_name).join(", ")}`);
          } else {
            assetBullets.push("• Logos: None uploaded yet in Brand Vault");
          }
          if (colors.length > 0) {
            assetBullets.push(`• Brand Colors saved: ${colors.map((c: any) => c.value || c.label).join(", ")}`);
          } else {
            assetBullets.push("• Brand Colors: None saved");
          }
          if (fonts.length > 0) {
            assetBullets.push(`• Fonts / Typography: ${fonts.map((f: any) => f.value || f.label).join(", ")}`);
          } else {
            assetBullets.push("• Fonts / Typography: None specified");
          }
          if (photos.length > 0) {
            assetBullets.push(
              `• Showcase Photo Library (${photos.length} photos): ${photos
                .slice(0, 6)
                .map((p: any) => p.label || p.original_name || "Photo")
                .join(", ")}`
            );
          } else {
            assetBullets.push("• Showcase Photo Library: No storefront/product photography uploaded yet");
          }

          const dailyNeedsList = Array.isArray(business.common_needs) && business.common_needs.length > 0
            ? business.common_needs.join(", ")
            : "Not specified yet";
          const socialSummary = socialAsset?.value ? `Social Handles: ${socialAsset.value}` : "Social Handles: Not added yet";

          brandVaultContext = `Business: "${business.name}" (${business.industry || "Commercial"})\nCity Hub: ${businessHub}\nWebsite: ${business.website || "Not listed"}\n${socialSummary}\nBusiness Bio / Vibe: ${business.description || "Not added yet"}\nDaily & Ongoing Creative Needs: ${dailyNeedsList}\nBrand Readiness Score: ${brandReadiness.score}% (${brandReadiness.completedCount}/4 essentials complete)\nMissing Brand Essentials: ${brandReadiness.missingLabels.length ? brandReadiness.missingLabels.join(", ") : "None (100% Brand Ready)"}\n${assetBullets.join("\n")}`;

          if (pastProjects && pastProjects.length > 0) {
            pastProjectsContext = pastProjects
              .map((p: any) => `• "${p.title}" (${p.category}, ${p.coin_amount} Coins, Status: ${p.status})`)
              .join("\n");
          }
        }
      } catch (vaultErr) {
        console.warn("Brand vault lookup notice:", vaultErr);
      }
    }

    const clientBudgetCoins = extractBudgetCoinsFromText(
      `${history?.map((h: any) => h?.content || "").join(" ") || ""} ${trimmed}`
    );

    // 2. Upload reference image(s) to Supabase Storage if provided
    const uploadedImageUrls: string[] = [];
    const validReferenceImages: Array<{ data: string; mimeType: string; name?: string }> = [];

    if (Array.isArray(referenceImages) && referenceImages.length > 0) {
      for (const [idx, img] of referenceImages.slice(0, 3).entries()) {
        if (img?.data && typeof img.data === "string") {
          validReferenceImages.push({
            data: img.data,
            mimeType: img.mimeType || "image/jpeg",
            name: img.name,
          });

          try {
            const buffer = Buffer.from(img.data, "base64");
            const safeName = (img.name || `ref-${idx + 1}.jpg`).replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
            const storagePath = `peachy-references/${user?.id || "anon"}/${Date.now()}-${safeName}`;

            const { error: upErr } = await admin.storage
              .from("project-files")
              .upload(storagePath, buffer, {
                contentType: img.mimeType || "image/jpeg",
                upsert: false,
              });

            if (!upErr) {
              const { data: signed } = await admin.storage
                .from("project-files")
                .createSignedUrl(storagePath, 60 * 60 * 24 * 365);
              if (signed?.signedUrl) {
                uploadedImageUrls.push(signed.signedUrl);
              } else {
                uploadedImageUrls.push(`data:${img.mimeType || "image/jpeg"};base64,${img.data}`);
              }
            } else {
              uploadedImageUrls.push(`data:${img.mimeType || "image/jpeg"};base64,${img.data}`);
            }
          } catch (e) {
            uploadedImageUrls.push(`data:${img.mimeType || "image/jpeg"};base64,${img.data}`);
          }
        }
      }
    }

    // Query approved creatives from Supabase & enforce 100% Creative Business Readiness
    let pool: CreativeCandidate[] = APPROVED_CREATIVES_FALLBACK;
    try {
      const [{ data: realRows }, { data: realProfiles }, { data: realWorks }] = await Promise.all([
        admin.from("creatives").select("*").eq("application_status", "approved"),
        admin.from("profiles").select("id,full_name,avatar_url"),
        admin.from("creative_featured_work").select("*").order("created_at", { ascending: false }),
      ]);

      if (realRows && realRows.length > 0) {
        const readyRows = realRows.filter((r: any) => {
          const worksForCreative = (realWorks ?? []).filter((w: any) => w.creative_id === r.id);
          return computeCreativeBusinessReadiness(r, worksForCreative.length).isEligibleForMatching;
        });

        if (readyRows.length > 0) {
          const nameMap = new Map((realProfiles ?? []).map((p: any) => [p.id, p.full_name]));
          const avatarMap = new Map((realProfiles ?? []).map((p: any) => [p.id, p.avatar_url]));

          pool = readyRows.map((r: any, idx: number) => {
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
              match_reason: "100% Business Ready · Verified commercial portfolio executing this exact tier.",
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
          });
        }
      }
    } catch (dbErr) {
      console.warn("Peach Match creative fetch fallback:", dbErr);
    }

    // Smart Matching for "Both Together" (Hybrid OR Split Specialists)
    if (isFindingBothCreatives && multiServiceQuote?.serviceA && multiServiceQuote?.serviceB) {
      const sA: ServiceOptionQuote = multiServiceQuote.serviceA;
      const sB: ServiceOptionQuote = multiServiceQuote.serviceB;
      const combinedCoins = Math.max(1, Number(multiServiceQuote.combined?.coins) || sA.coins + sB.coins);
      const includesPodSupervision = combinedCoins > 20;
      const hasEnough = availableCoins >= combinedCoins;
      const deficitCoins = Math.max(0, combinedCoins - availableCoins);

      // 1. Check Supabase pool for any real vetted creative verified in BOTH specialties
      const hybridMatches = pool.filter(
        (c) =>
          creativeStrictlyVerifiedForDiscipline(c, sA.serviceKey) &&
          creativeStrictlyVerifiedForDiscipline(c, sB.serviceKey)
      );

      // 2. Always prepare up to 3 vetted specialists for Service A and Service B (with local City Hub priority for on-location/print)
      const serviceACreatives = rankCreativesForService(pool, sA.serviceKey, businessHub).slice(0, 3);
      const serviceBCreatives = rankCreativesForService(pool, sB.serviceKey, businessHub)
        .filter((c) => c.id !== serviceACreatives[0]?.id || pool.length <= 3)
        .slice(0, 3);

      const isHybrid = hybridMatches.length > 0;
      let answerCopy = isHybrid
        ? `Good news—I found ${hybridMatches.length} hybrid Peach creative${hybridMatches.length === 1 ? "" : "s"} verified in both **${sA.serviceName}** and **${sB.serviceName}** (or you can split into two specialists below).`
        : `No single creative in our vetted pool covers both **${sA.serviceName}** and **${sB.serviceName}** end-to-end, so I split your match into two dedicated specialist pods so neither deliverable gets compromised!`;

      if (includesPodSupervision) {
        answerCopy += ` Since your combined project is **${combinedCoins} Coins** (over 20 Coins), **Art Director Pod Supervision** is included free so both creatives stay aligned.`;
      }

      if (hasEnough) {
        answerCopy += `\n\nYou have **${availableCoins} Coins** available—enough to launch Both Together (${combinedCoins} Coins) right now!`;
      } else {
        answerCopy += `\n\nThis combined scope requires **${combinedCoins} Coins** ($${combinedCoins * PEACH_COIN_USD_RATE} USD), and you currently have **${availableCoins} Coins** (${deficitCoins} more needed to launch Both Together).`;
      }

      return NextResponse.json({
        mode: "matched_both_creatives",
        matchStrategy: isHybrid ? "hybrid" : "split",
        headline: isHybrid
          ? `Hybrid & Split Creative Matches (${sA.serviceName} + ${sB.serviceName})`
          : `Split Specialist Match: Pick Your ${sA.serviceName} & ${sB.serviceName} Creatives`,
        answer: answerCopy,
        diagnosticQuestions: null,
        multiServiceQuote,
        hybridCreatives: hybridMatches.slice(0, 3),
        serviceACreatives,
        serviceBCreatives,
        includesPodSupervision,
        walletStatus: {
          hasEnough,
          requiredCoins: combinedCoins,
          availableCoins,
          deficitCoins,
          hasSubscription,
          subscriptionPlan,
        },
        uploadedImageUrls,
      });
    }

    // If user clicked "Yes, Find My Creatives →" or requested creatives: execute Stage 4 immediately
    if (isFindingCreatives) {
      const scopeData = currentScope || {
        title: "Standard Multi-Page Business Site (3–5 Pages)",
        category: "Website",
        serviceKey: "website_design",
        coins: 18,
        usdAmount: 900,
        deliverables: [
          "Up to 5 custom responsive pages",
          "Mobile breakpoints & speed optimization",
          "Domain & 100% administrative site ownership transfer",
        ],
        requiredFromBusiness: ["Brand assets & copy outline", "Domain credentials"],
        estimatedTurnaround: "8–12 Business Days",
        revisionRounds: 3,
        reason: "Locked in based on your required features, assets, and timeline.",
      };

      const coins = Math.max(1, Number(scopeData.coins) || 10);
      const hasEnough = availableCoins >= coins;
      const deficitCoins = Math.max(0, coins - availableCoins);

      let answerCopy = "";
      if (hasEnough) {
        answerCopy = `Great news—you have enough Peach Coins in your wallet to start this project right away (${coins} Coins needed, you currently have ${availableCoins} Coins available)! Below are 3 vetted specialists with verified portfolio matches ready to begin. Click **Select [Creative Name]** on your preferred creative to review your brief and open your project.`;
      } else {
        answerCopy = `This project scope requires ${coins} Coins ($${coins * PEACH_COIN_USD_RATE} USD) and you currently have ${availableCoins} Coins in your wallet (${deficitCoins} more needed to hire). Before hiring, you can top up your wallet right below.`;
        if (hasSubscription) {
          answerCopy += ` As an active ${subscriptionPlan || "Peach Network"} member, you can top up the extra ${deficitCoins} Coins at your member rate right now, or wait until your next monthly coin drop.`;
        } else {
          answerCopy += ` Did you know? Peach Network monthly memberships give you recurring coin allowances, rollover protection, and member discounts. If you don't want to subscribe, that's completely okay—you can just do a quick one-time top up right here!`;
        }
      }

      const rankedPool = rankCreativesForService(
        pool,
        scopeData.serviceKey || "website_design",
        businessHub
      );

      return NextResponse.json({
        mode: "matched_creatives",
        headline: "3 Vetted Creatives Ready for Your Project",
        answer: answerCopy,
        diagnosticQuestions: null,
        scope: scopeData,
        walletStatus: {
          hasEnough,
          requiredCoins: coins,
          availableCoins,
          deficitCoins,
          hasSubscription,
          subscriptionPlan,
        },
        matchedCreatives: rankedPool.slice(0, 3),
        uploadedImageUrls,
      });
    }

    const historyArray: Array<{ role: string; content: string }> = Array.isArray(history) ? history : [];
    const hasPreviousDiagnosticTurn = historyArray.some((h) => h.role === "assistant");

    // Multi-Service Detection: check latest message + recent user answers
    const combinedContextForMulti = [
      ...historyArray.filter((h) => h.role === "user").slice(-2).map((h) => h.content),
      trimmed,
    ].join(" ");
    const detectedDisciplines = detectMultiServiceDisciplines(trimmed);
    const detectedAcrossAnswers =
      trimmed.startsWith("Diagnostic Specifications:") || hasPreviousDiagnosticTurn
        ? detectMultiServiceDisciplines(combinedContextForMulti)
        : detectedDisciplines;

    const multiDisciplines =
      detectedDisciplines.length >= 2
        ? detectedDisciplines
        : detectedAcrossAnswers.length >= 2 && trimmed.startsWith("Diagnostic Specifications:")
        ? detectedAcrossAnswers
        : [];

    if (multiDisciplines.length >= 2) {
      const mQuote = buildMultiServiceQuote(multiDisciplines, combinedContextForMulti.toLowerCase(), availableCoins);
      const podNote = mQuote.combined.includesPodSupervision
        ? " (includes free **Art Director Pod Supervision** since combined total is over 20 Coins)"
        : "";
      const projectPlan = buildLiveProjectPlan({
        goalSummary: `${mQuote.serviceA.serviceName} + ${mQuote.serviceB.serviceName} launch for ${clientBusinessName}`,
        primaryItems: [
          {
            id: "plan-service-a",
            service: mQuote.serviceA.serviceName,
            serviceKey: mQuote.serviceA.serviceKey,
            package: mQuote.serviceA.title,
            category: mQuote.serviceA.category,
            coins: mQuote.serviceA.coins,
            usd: mQuote.serviceA.usdAmount,
            estimatedTurnaround: mQuote.serviceA.estimatedTurnaround,
            reason: mQuote.serviceA.reason,
            deliverables: mQuote.serviceA.deliverables,
            requiredFromBusiness: mQuote.serviceA.requiredFromBusiness,
            status: "needed",
          },
          {
            id: "plan-service-b",
            service: mQuote.serviceB.serviceName,
            serviceKey: mQuote.serviceB.serviceKey,
            package: mQuote.serviceB.title,
            category: mQuote.serviceB.category,
            coins: mQuote.serviceB.coins,
            usd: mQuote.serviceB.usdAmount,
            estimatedTurnaround: mQuote.serviceB.estimatedTurnaround,
            reason: mQuote.serviceB.reason,
            deliverables: mQuote.serviceB.deliverables,
            requiredFromBusiness: mQuote.serviceB.requiredFromBusiness,
            status: "needed",
          },
        ],
        availableCoins,
        clientBudgetCoins,
        brandReadiness,
      });

      return NextResponse.json({
        mode: "multi_service_quote",
        headline: `Itemized Multi-Service Quote: ${mQuote.serviceA.serviceName} + ${mQuote.serviceB.serviceName}`,
        answer: `Your project spans two creative disciplines—here is the clear, itemized breakdown so you can book exactly what fits your budget today${podNote}:\n\n• **Option 1 — ${mQuote.serviceA.serviceName} Only:** ${mQuote.serviceA.coins} Coins ($${mQuote.serviceA.usdAmount.toLocaleString()})\n• **Option 2 — ${mQuote.serviceB.serviceName} Only:** ${mQuote.serviceB.coins} Coins ($${mQuote.serviceB.usdAmount.toLocaleString()})\n• **Option 3 — Both Together:** ${mQuote.combined.coins} Coins ($${mQuote.combined.usdAmount.toLocaleString()})\n\n${mQuote.walletCoverageMessage}`,
        diagnosticQuestions: null,
        scope: null,
        multiServiceQuote: mQuote,
        projectPlan,
        walletStatus: {
          hasEnough: availableCoins >= mQuote.combined.coins,
          requiredCoins: mQuote.combined.coins,
          availableCoins,
          deficitCoins: Math.max(0, mQuote.combined.coins - availableCoins),
          hasSubscription,
          subscriptionPlan,
        },
        matchedCreatives: [],
        uploadedImageUrls,
      });
    }

    const compactPool = pool.slice(0, 6).map((c) => ({
      id: c.id,
      name: c.name,
      headline: c.headline,
      hub: c.hub,
      specialties: c.specialties,
      pastWorkTitle: c.featured_work.title,
      industry: c.featured_work.industry,
    }));

    const conversationPrompt = `
CONVERSATION HISTORY:
${historyArray
  .slice(-6)
  .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
  .join("\n")}

LATEST BUSINESS INQUIRY:
USER: ${trimmed || "[Attached reference image for Peachy™ review]"}

REFERENCE IMAGES ATTACHED: ${validReferenceImages.length > 0 ? `${validReferenceImages.length} image(s) attached for visual analysis` : "None"}

CLIENT BRAND VAULT (READ-ONLY CONTEXT):
${brandVaultContext}

PAST PROJECTS (LAST 3):
${pastProjectsContext}

IS_FIRST_MESSAGE_IN_CONVERSATION: ${!hasPreviousDiagnosticTurn}

CLIENT WALLET & MEMBERSHIP CONTEXT:
- Available Coin Balance: ${availableCoins} Peach Coins ($${availableCoins * 50} USD)
- Mentioned Client Budget: ${clientBudgetCoins ? `${clientBudgetCoins} Coins ($${clientBudgetCoins * 50} USD)` : "Not explicitly stated"}
- Active Subscription: ${hasSubscription ? `YES (Plan: ${subscriptionPlan || "Active Member"})` : "NO (Non-subscriber)"}

AVAILABLE CREATIVE CANDIDATES:
${JSON.stringify(compactPool, null, 2)}

TASK:
Determine if user wants:
1. "advice" (General questions, creative advice, definitions, tips — warm 2–4 sentences, no quote, no cards, no creatives).
2. "diagnostic" (Scoping project on an open-ended request or with reference image — ask 2–3 questions with pills, acknowledging Brand Readiness & assets already in Brand Vault).
3. "price_quote" / "recommendation" (User answered diagnostic questions or provided complete specifications — lock in 1 package card + structured projectPlan; do NOT return matched creatives yet).
If Brand Readiness has missing brand essentials (like Primary Logo or Brand Sheet), proactively acknowledge them and offer them as optional items in projectPlan.
Output strictly valid JSON adhering to PEACH_MATCH_SYSTEM_INSTRUCTION.`;

    let parsed: any = null;
    let rateLimitEncountered = false;

    // Call Gemini API if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const modelsToTry = ["gemini-4-hydrogen", "gemini-3.8-flash"];

      // Multimodal contents assembly
      const contentsPayload = validReferenceImages.length > 0
        ? {
            parts: [
              ...validReferenceImages.map((img) => ({
                inlineData: {
                  mimeType: img.mimeType,
                  data: img.data,
                },
              })),
              { text: conversationPrompt },
            ],
          }
        : conversationPrompt;

      for (const model of modelsToTry) {
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error("Timeout after 8s")), 8000);
            if (typeof (timer as any)?.unref === "function") (timer as any).unref();
          });

          const geminiCall = ai.models.generateContent({
            model,
            contents: contentsPayload,
            config: {
              systemInstruction: PEACH_MATCH_SYSTEM_INSTRUCTION,
              responseMimeType: "application/json",
            },
          });

          const response = await Promise.race([geminiCall, timeoutPromise]);
          if (timer) clearTimeout(timer);
          const responseText = response?.text;

          if (responseText && responseText.trim()) {
            parsed = JSON.parse(responseText.trim());
            break;
          }
        } catch (callErr: any) {
          if (timer) clearTimeout(timer);
          const errMsg = String(callErr?.message || callErr || "").toLowerCase();
          const is429 =
            errMsg.includes("429") ||
            errMsg.includes("quota") ||
            errMsg.includes("rate") ||
            errMsg.includes("exhausted") ||
            errMsg.includes("resource_exhausted") ||
            errMsg.includes("too many requests");

          if (is429) {
            rateLimitEncountered = true;
            console.warn(`[Peachy AI] Gemini 429/Quota on ${model}:`, callErr?.message);
          } else if (errMsg.includes("timeout")) {
            console.info(`[Peachy AI] ${model} response timed out after 8s. Falling back smoothly.`);
          } else {
            console.warn(`[Peachy AI] Notice on ${model}:`, callErr?.message);
          }
        }
      }
    }

    // If Gemini hit a 429 rate limit or quota error on all attempts:
    if (rateLimitEncountered && !parsed) {
      return NextResponse.json({
        mode: "fallback",
        error: "rate_limit",
        rateLimit: true,
        headline: "Peach Match AI v1.1 High Volume",
        answer:
          "Peach Match AI v1.1 is experiencing high volume right now—click **Ask an Art Director** in the top bar and our team will scope your project for free.",
        diagnosticQuestions: null,
        scope: null,
        matchedCreatives: [],
      });
    }

    // Check if model returned an out of scope response
    if (parsed && (parsed.mode === "out_of_scope" || parsed.showFeedbackButton)) {
      return NextResponse.json({
        mode: "out_of_scope",
        headline: parsed.headline || "Service Outside Version 1 Catalog",
        answer:
          parsed.answer ||
          "We currently do not offer this service in Version 1, but you can submit this to our **Peach Business** feedback tab to let our team know it's something you want to see in the app. Every piece of feedback helps us grow—so you are growing with us!",
        showFeedbackButton: true,
        diagnosticQuestions: null,
        scope: null,
        matchedCreatives: [],
        uploadedImageUrls,
      });
    }

    // Check if model returned general creative advice mode
    if (parsed && parsed.mode === "advice") {
      return NextResponse.json({
        mode: "advice",
        headline: parsed.headline || "Peachy™ · Creative Director Advice",
        answer: parsed.answer || "Here is my creative direction recommendation for your project.",
        quickReplies: Array.isArray(parsed.quickReplies) && parsed.quickReplies.length > 0
          ? parsed.quickReplies
          : ["Scope a Website Project", "Scope Brand Identity", "Ask Another Question"],
        diagnosticQuestions: null,
        scope: null,
        matchedCreatives: [],
        uploadedImageUrls,
      });
    }

    // If Gemini did not return a valid response (offline, timeout, or missing key), use intelligent deterministic concierge
    if (!parsed || (!parsed.diagnosticQuestions && !parsed.scope && parsed.mode !== "advice")) {
      const qLower = trimmed.toLowerCase();
      const hasExplicitTier =
        /(landing page|e-commerce|ecommerce|shopify|webflow|table reservations|menu and hours|brand sheet|logo overhaul|tabletop shoot|culinary shoot|portrait session|carousel drop|monthly social|flyer launch kit|packaging die-line)/.test(
          qLower
        );

      const isGeneralQuestion =
        !hasExplicitTier &&
        /^(what|how|why|should|can you explain|difference between|tell me about|recommend a color|advice on|best font|best platform|which platform)\b/i.test(qLower) &&
        !/(build|make|create|design|need|want|hire|scope|quote|price)\b/i.test(qLower);

      if (isGeneralQuestion) {
        parsed = {
          mode: "advice",
          headline: "Peachy™ · Creative Director Perspective",
          answer:
            "From an agency creative direction standpoint, the most effective approach depends on your target customer touchpoint. High-converting brands pair clear typography with focused visual hierarchy rather than overcrowding. Tell me a bit more about your brand aesthetic, or tap below to lock in an exact scope!",
          quickReplies: ["Scope a Website Project", "Scope Brand Identity", "Ask Peachy™ Another Question"],
          diagnosticQuestions: null,
          scope: null,
          matchedCreatives: [],
        };
      } else {
        const isDiagnosis = !hasPreviousDiagnosticTurn && !hasExplicitTier;

        if (isDiagnosis) {
          const diag = buildDefaultDiagnostic(trimmed);
          parsed = {
            mode: "diagnostic",
            headline: diag.headline,
            answer: diag.answer,
            diagnosticQuestions: diag.questions,
            scope: null,
            matchedCreatives: [],
          };
        } else {
          const cat = findCategoryByKeywords(trimmed);
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
            if (/(restaurant|food|culinary|chef|dish|drinks)/.test(qLower)) {
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
            if (/(menu|packaging|die-line|dieline|box|brochure)/.test(qLower)) {
              optKey = "option_c"; // 6 Coins
            } else if (/(flyer|poster|event|promo)/.test(qLower)) {
              optKey = "option_b"; // 2 Coins
            } else {
              optKey = "option_a"; // 1 Coin
            }
          }

          const opt = cat.options[optKey];
          const requiredCoins = opt.coins;
          const hasEnough = availableCoins >= requiredCoins;
          const deficit = Math.max(0, requiredCoins - availableCoins);

          let answerCopy = `Based on your technical requirements, I recommend **${opt.tierName}** (${requiredCoins} Coins = $${requiredCoins * PEACH_COIN_USD_RATE} USD). This provides a complete commercial scope with 100% administrative transfer and 3 included revision rounds.`;
          if (hasEnough) {
            answerCopy += `\n\nGreat news—you have enough Peach Coins in your wallet to start this project right away (${requiredCoins} Coins needed, you currently have ${availableCoins} Coins available)!`;
          } else {
            answerCopy += `\n\nNote: This scope requires ${requiredCoins} Coins ($${requiredCoins * PEACH_COIN_USD_RATE} USD) and you currently have ${availableCoins} Coins in your wallet (${deficit} more Coins needed to hire).`;
            if (hasSubscription) {
              answerCopy += ` As an active ${subscriptionPlan || "Peach Network"} member, you can top up the extra ${deficit} Coins at your member rate right now, or wait until your next monthly coin drop.`;
            } else {
              answerCopy += ` Did you know? Peach Network monthly memberships give you recurring coin allowances, rollover protection, and member discounts. If you don't want to subscribe, that's completely okay—you can just do a quick one-time top up right here!`;
            }
          }

          const resolvedScope = {
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
          };

          parsed = {
            mode: isFindingCreatives ? "matched_creatives" : "price_quote",
            headline: isFindingCreatives
              ? "3 Vetted Creatives Ready for Your Project"
              : "Definitive Agency Recommendation & Price Quote",
            answer: answerCopy,
            scope: resolvedScope,
            findCreativesPrompt: "Want me to find 3 vetted creatives for this project?",
            topCreativeIds: [
              { id: pool[0]?.id || "cr_nia", score: 98, reason: "Verified commercial portfolio executing this exact tier." },
              { id: pool[1]?.id || "cr_maya", score: 96, reason: "Specialized in commercial brand systems and digital collateral." },
              { id: pool[2]?.id || "cr_jordan", score: 94, reason: "Proven track record delivering high-impact commercial launches." },
            ],
          };
        }
      }
    }

    // Process Advice Mode
    if (parsed.mode === "advice") {
      return NextResponse.json({
        mode: "advice",
        headline: parsed.headline || "Peachy™ · Creative Director Advice",
        answer: parsed.answer || "Here is my creative direction advice for your project.",
        quickReplies: Array.isArray(parsed.quickReplies) ? parsed.quickReplies : ["Scope a Project", "Ask Another Question"],
        diagnosticQuestions: null,
        scope: null,
        matchedCreatives: [],
        uploadedImageUrls,
      });
    }

    // Helper to assemble 3 best-fit creatives for a given scope
    const buildMatchedCreatives = (scopeData: any, nominatedIds: any[]) => {
      const matchedCreatives: CreativeCandidate[] = [];
      const poolById = new Map(pool.map((c) => [c.id, c]));

      if (Array.isArray(nominatedIds)) {
        for (const item of nominatedIds) {
          const c = poolById.get(item.id);
          if (c && !matchedCreatives.some((m) => m.id === c.id)) {
            matchedCreatives.push({
              ...c,
              match_score: Math.max(75, Math.min(99, Number(item.score) || 96)),
              match_reason: String(item.reason || c.match_reason),
            });
          }
        }
      }

      const rankedForScope = rankCreativesForService(
        pool,
        scopeData?.serviceKey || "website_design",
        businessHub
      );
      const targetCategoryTag = (scopeData?.category || "web").toLowerCase();
      const sortedPool = [...rankedForScope].sort((a, b) => {
        const aMatches = a.specialties.some((s) => s.toLowerCase().includes(targetCategoryTag));
        const bMatches = b.specialties.some((s) => s.toLowerCase().includes(targetCategoryTag));
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

      return matchedCreatives.slice(0, 3);
    };

    // Stage 4: User requested to find / match creatives (either via button or text)
    if (isFindingCreatives || parsed.mode === "matched_creatives") {
      const scopeData = currentScope || parsed.scope || {
        title: "Commercial Multi-Page Website",
        category: "Website",
        serviceKey: "website_design",
        coins: 18,
        usdAmount: 900,
        deliverables: [
          "Up to 5 custom responsive pages",
          "Mobile breakpoints & speed optimization",
          "Domain & 100% administrative site ownership transfer",
        ],
        requiredFromBusiness: ["Brand assets & copy outline", "Domain credentials"],
        estimatedTurnaround: "8–12 Business Days",
        revisionRounds: 3,
        reason: "Selected tier for commercial website architecture.",
      };

      const coins = Math.max(1, Number(scopeData.coins) || 10);
      const hasEnough = availableCoins >= coins;
      const deficitCoins = Math.max(0, coins - availableCoins);

      let answerCopy = "";
      if (hasEnough) {
        answerCopy = `Great news—you have enough Peach Coins in your wallet to start this project right away (${coins} Coins needed, you currently have ${availableCoins} Coins available)! Below are 3 vetted specialists with verified portfolio matches ready to begin. Click **Select & Review Brief** on your preferred creative to proceed.`;
      } else {
        answerCopy = `This project scope requires ${coins} Coins ($${coins * PEACH_COIN_USD_RATE} USD) and you currently have ${availableCoins} Coins in your wallet (${deficitCoins} more needed to hire).`;
        if (hasSubscription) {
          answerCopy += ` As an active ${subscriptionPlan || "Peach Network"} member, you can top up the extra ${deficitCoins} Coins at your member rate right now, or wait until your next monthly coin drop.`;
        } else {
          answerCopy += ` Did you know? Peach Network monthly memberships give you recurring coin allowances, rollover protection, and member discounts. If you don't want to subscribe, that's completely okay—you can just do a quick one-time top up right here!`;
        }
      }

      const matchedCreatives = buildMatchedCreatives(scopeData, parsed?.topCreativeIds || []);

      return NextResponse.json({
        mode: "matched_creatives",
        headline: "3 Vetted Creatives Ready for Your Project",
        answer: answerCopy,
        diagnosticQuestions: null,
        scope: {
          title: scopeData.title,
          category: scopeData.category || "Design",
          serviceKey: scopeData.serviceKey || "website_design",
          coins,
          usdAmount: scopeData.usdAmount || coins * PEACH_COIN_USD_RATE,
          deliverables: scopeData.deliverables,
          requiredFromBusiness: scopeData.requiredFromBusiness,
          estimatedTurnaround: scopeData.estimatedTurnaround,
          revisionRounds: 3,
          reason: scopeData.reason,
        },
        walletStatus: {
          hasEnough,
          requiredCoins: coins,
          availableCoins,
          deficitCoins,
          hasSubscription,
          subscriptionPlan,
        },
        matchedCreatives,
        uploadedImageUrls,
      });
    }

    // Stage 3: Price Quote Mode (Quotes single package, NO creatives yet)
    if (parsed.scope || parsed.mode === "price_quote" || parsed.mode === "recommendation") {
      const scopeData = parsed.scope;
      const coins = Math.max(1, Number(scopeData.coins) || 10);
      const hasEnough = availableCoins >= coins;
      const deficitCoins = Math.max(0, coins - availableCoins);

      const shortQuoteIntro = `Here is your **${scopeData.title}** plan (${coins} Coins / $${(coins * PEACH_COIN_USD_RATE).toLocaleString()}) ready to launch below.`;
      const answerCopy = shortQuoteIntro;

      const projectPlan =
        parsed.projectPlan && Array.isArray(parsed.projectPlan.recommendedItems) && parsed.projectPlan.recommendedItems.length > 0
          ? {
              ...parsed.projectPlan,
              clientBudgetCoins: parsed.projectPlan.clientBudgetCoins ?? clientBudgetCoins,
            }
          : buildLiveProjectPlan({
              goalSummary: `${scopeData.title} for ${clientBusinessName}`,
              primaryItems: [
                {
                  id: "plan-main",
                  service: scopeData.category || "Design",
                  serviceKey: scopeData.serviceKey || "website_design",
                  package: scopeData.title,
                  category: scopeData.category || "Design",
                  coins,
                  usd: scopeData.usdAmount || coins * PEACH_COIN_USD_RATE,
                  estimatedTurnaround: scopeData.estimatedTurnaround || "5–7 Business Days",
                  reason: scopeData.reason || "Matched based on your project requirements.",
                  deliverables: Array.isArray(scopeData.deliverables) ? scopeData.deliverables : [],
                  requiredFromBusiness: Array.isArray(scopeData.requiredFromBusiness)
                    ? scopeData.requiredFromBusiness
                    : [],
                  status: "needed",
                },
              ],
              availableCoins,
              clientBudgetCoins,
              brandReadiness,
            });

      return NextResponse.json({
        mode: "price_quote",
        headline: parsed.headline || "Definitive Agency Recommendation & Price Quote",
        answer: answerCopy,
        diagnosticQuestions: null,
        scope: {
          title: scopeData.title,
          category: scopeData.category || "Design",
          serviceKey: scopeData.serviceKey || "website_design",
          coins,
          usdAmount: scopeData.usdAmount || coins * PEACH_COIN_USD_RATE,
          deliverables: scopeData.deliverables,
          requiredFromBusiness: scopeData.requiredFromBusiness,
          estimatedTurnaround: scopeData.estimatedTurnaround,
          revisionRounds: 3,
          reason: scopeData.reason,
        },
        projectPlan,
        findCreativesPrompt: "Want me to find 3 vetted creatives for this project?",
        walletStatus: {
          hasEnough,
          requiredCoins: coins,
          availableCoins,
          deficitCoins,
          hasSubscription,
          subscriptionPlan,
        },
        matchedCreatives: [], // NO CREATIVES SHOWN YET! Must click "Yes, Find My Creatives →"
        uploadedImageUrls,
      });
    }

    // Stage 2: Diagnostic Mode (Asks 2-3 questions)
    return NextResponse.json({
      mode: "diagnostic",
      headline: parsed.headline || "Let's diagnose your project requirements",
      answer: parsed.answer || "Before quoting a price, let me check 3 quick details so we don't under-scope or over-quote:",
      diagnosticQuestions: Array.isArray(parsed.diagnosticQuestions) ? parsed.diagnosticQuestions : [],
      scope: null,
      matchedCreatives: [],
      uploadedImageUrls,
    });
  } catch (err: any) {
    console.error("Peach Match route error:", err?.message || err);
    return NextResponse.json(
      {
        mode: "diagnostic",
        headline: "Let's scope your project requirements",
        answer: "Before recommending an exact scope, let me ask 3 quick questions so we don't under-scope or over-quote:",
        diagnosticQuestions: [
          {
            id: "q_deliverable",
            question: "What core deliverable do you need?",
            pills: ["Website Design (Landing or Multi-Page)", "Brand Identity & Logo Suite", "Commercial Photography Session", "Event Flyer or Promo Kit"],
          },
          {
            id: "q_readiness",
            question: "Are your brand assets and photography ready?",
            pills: ["Assets & Photos Ready", "Need Creative to Source Stock", "Need an On-Location Photographer"],
          },
          {
            id: "q_speed",
            question: "What is your target launch timeline?",
            pills: ["Urgent (Within 1 Week)", "Standard (2–3 Weeks)", "Flexible Launch"],
          },
        ],
        scope: null,
        matchedCreatives: [],
        uploadedImageUrls: [],
      },
      { status: 200 }
    );
  }
}
