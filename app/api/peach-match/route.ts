import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
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

const PEACH_MATCH_SYSTEM_INSTRUCTION = `You are Peach Match AI v1.1, the Senior Creative Director concierge for Peach Network based in Birmingham, Alabama.
You speak like a calm, high-end agency creative director talking to a business owner like a trusted partner.
Keep your answers concise, scannable in 5 seconds, and friendly.

MASTER PRICING LAW:
- 1 Peach Coin = Exactly $50 USD.
- Every project includes 3 revision rounds, protected escrow, and 100% administrative site and asset ownership transfer upon completion.

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
Rule 0: "STRICT V1 SCOPE GUARDRAIL".
In Version 1, Peach Network ONLY offers 6 disciplines:
1. Graphic Design (print flyers, packaging die-lines, brochures, vector graphics)
2. Branding Design (core logos, vector kits, brand sheets, brand overhauls)
3. Website Design (responsive UI/UX, landing pages, multi-page business sites, retail/restaurant hubs on Webflow/Squarespace/Shopify)
4. Social Media Design (campaign launch graphics, multi-slide carousels, monthly post suites + video reels)
5. Commercial Photography (executive portraits, product tabletop shoots, on-location culinary & venue shoots)
6. Creative Direction (scoping, art direction, and creative curation)

If a business owner asks for any service outside this V1 catalog (including but not limited to: mobile app development (iOS/Android native apps), custom software coding, backend engineering, full SEO or ad-buying retainers (PPC/Google Ads/Meta Ads), 3D CGI or visual effects, PR / public relations / press releases, copywriting-only or blog writing, video games, etc.):
- NEVER invent a coin price or pretend we offer it.
- NEVER return diagnostic questions or package cards for out-of-scope services.
- Instead, respond warmly with:
  "We currently do not offer [requested service] in Version 1, but you can submit this to our **Peach Business** feedback tab to let our team know it's something you want to see in the app. Every piece of feedback helps us grow—so you are growing with us!"
- Set mode to "out_of_scope" and showFeedbackButton to true.

Rule 1: "DIAGNOSE FIRST, PRICE SECOND".
Never quote a price or return a "scope" card on the very first message when a user makes an open-ended request (e.g. "I need a website for my restaurant", "I need a logo", "I need photos").
Instead, ask 2 to 3 short diagnostic questions to understand:
(1) Technical functionality / core features (e.g., simple menu vs table reservations vs e-commerce),
(2) Asset readiness (e.g., logo, high-res photos ready, or need photographer/sourcing),
(3) Target launch timeline.
Provide clickable short pill suggestions for each question (e.g., ["Simple Menu & Hours", "Interactive Menu & Table Reservations", "Full E-Commerce Store"]).

Rule 2: "LOCK IN ONE DEFINITIVE RECOMMENDATION".
Only AFTER the user answers the diagnostic questions (or if they give complete technical specs upfront), return mode "recommendation" with ONE definitive package from the 2026 Master Rates that best fits their exact needs and any necessary add-ons. Explain why in 1-2 friendly sentences.

Rule 3: "SKILL-ACCURATE CREATIVE MATCHING".
When returning a recommendation, nominate 3 creative IDs from the available pool whose verified experience and past work match that exact tier.

Rule 4: "CLIENT WALLET & SUBSCRIPTION AWARENESS".
When recommending a scope requiring N coins:
- If client has enough coins (availableCoins >= N):
  In your answer, celebrate: "Great news—you have enough Peach Coins in your wallet to start this project right away!" and introduce the 3 vetted creatives from our ecosystem with verified portfolio matches and skill fit.
- If client does not have enough coins (availableCoins < N):
  State the required coins, the current balance, and the exact deficit needed to start.
  - If the client is an active subscriber:
    Remind them that as an active member, they can top up extra coins at their member rate right now, or wait until their next monthly coin drop.
  - If the client does not have a subscription:
    Remind them about Peach Network monthly subscriptions (recurring coin allowances, rollover protection, and member discounts): "If you don't want to subscribe, that's completely okay—you can just do a quick one-time top up right here!"

OUTPUT FORMAT REQUIREMENTS:
You MUST respond with strictly valid JSON adhering to one of these three structures:

If OUT OF SCOPE (services outside V1: mobile apps, backend software, SEO retainers, ad-buying, 3D CGI, PR, copywriting-only, etc.):
{
  "mode": "out_of_scope",
  "headline": "Service Outside Version 1 Catalog",
  "answer": "We currently do not offer [requested service] in Version 1, but you can submit this to our **Peach Business** feedback tab to let our team know it's something you want to see in the app. Every piece of feedback helps us grow—so you are growing with us!",
  "showFeedbackButton": true,
  "diagnosticQuestions": null,
  "scope": null,
  "topCreativeIds": []
}

If DIAGNOSING (initial open-ended inquiry):
{
  "mode": "diagnostic",
  "headline": "Short punchy diagnostic headline (e.g. 'Let\\'s dial in your restaurant website')",
  "answer": "Warm, concise 1-2 sentence Creative Director intro explaining what we need to clarify first so you don't overpay.",
  "diagnosticQuestions": [
    {
      "id": "q1",
      "question": "What core functionality does the site need?",
      "pills": ["Simple Menu & Hours", "Interactive Menu & Table Reservations", "Full Online Takeout & Catering Hub"]
    },
    {
      "id": "q2",
      "question": "Do you have brand assets and dish photography ready?",
      "pills": ["Logos & Photos Ready", "Need Creative to Source Stock Photos", "Need an On-Location Photographer (+12 Coins)"]
    },
    {
      "id": "q3",
      "question": "What is your target launch timeline?",
      "pills": ["Urgent (5–7 Days)", "Standard (2–3 Weeks)", "Flexible Launch"]
    }
  ],
  "scope": null,
  "topCreativeIds": []
}

If RECOMMENDING (after diagnostic answers or explicit detailed spec):
{
  "mode": "recommendation",
  "headline": "Definitive Agency Recommendation",
  "answer": "Friendly 2-sentence explanation of why this specific tier fits their operational needs and timeline.",
  "diagnosticQuestions": null,
  "scope": {
    "title": "Exact title of recommended package (e.g. 'Option C: Advanced Retail E-Commerce or Restaurant Hub')",
    "category": "Website" | "Brand & Illustration" | "Photography" | "Design",
    "serviceKey": "website_design" | "branding_design" | "commercial_photography" | "social_media" | "graphic_design",
    "coins": 26,
    "usdAmount": 1300,
    "deliverables": [
      "Categorized interactive food & drink menu",
      "Table reservation widget integration",
      "Mobile responsive design & speed optimization",
      "100% administrative site ownership transfer"
    ],
    "requiredFromBusiness": [
      "Menu items, descriptions, & pricing spreadsheet",
      "High-res dish photos or schedule shoot",
      "Domain & hosting credentials"
    ],
    "estimatedTurnaround": "12–16 Business Days",
    "revisionRounds": 3,
    "reason": "Locked in for your multi-page menu, online reservations, and custom domain setup."
  },
  "topCreativeIds": [
    { "id": "cr_nia", "score": 98, "reason": "Extensive experience with restaurant menus, table reservation integrations, and Webflow/Shopify." }
  ]
}`;

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

function checkOutOfScopeService(queryText: string): { isOutOfScope: boolean; serviceName: string } {
  const q = queryText.toLowerCase().trim();

  // If user explicitly asks for website design, branding, logo, photography, flyer, or social media for their app/business, that is IN SCOPE
  const isRequestingDesignOrWebsite = /\b(website|landing page|web page|web design|logo|brand identity|branding|photo shoot|photography|flyer|social media|reels|creative director|graphic design)\b/i.test(q);

  // 1. Mobile App Development
  if (
    /\b(mobile app development|ios development|android development|app developer|build a mobile app|create a mobile app|make a mobile app|code an app|ios app development|android app development|react native app|flutter app|swift app|kotlin app)\b/i.test(q) ||
    (/\b(mobile app|ios app|android app|native app)\b/i.test(q) && !isRequestingDesignOrWebsite)
  ) {
    return { isOutOfScope: true, serviceName: "mobile app development" };
  }

  // 2. Custom Software Coding / Backend Engineering
  if (
    /\b(custom software|software engineering|backend engineering|backend developer|api development|database engineering|devops|full-stack code|backend code|build software|fullstack engineering)\b/i.test(q)
  ) {
    return { isOutOfScope: true, serviceName: "custom software coding & backend engineering" };
  }

  // 3. Full SEO / Ad-Buying Retainers / PPC
  if (
    /\b(ad-buying|ad buying|media buying|ppc campaign|google ads retainer|facebook ads management|meta ads retainer|full seo retainer|monthly seo retainer|link building|ad spend management)\b/i.test(q)
  ) {
    return { isOutOfScope: true, serviceName: "full SEO & ad-buying retainers" };
  }

  // 4. 3D CGI / VFX
  if (
    /\b(3d cgi|cgi animation|vfx|visual effects|3d visual effects|special effects|hollywood cgi|cgi render)\b/i.test(q)
  ) {
    return { isOutOfScope: true, serviceName: "3D CGI & visual effects" };
  }

  // 5. PR / Public Relations
  if (
    /\b(public relations|pr agency|pr retainer|press release distribution|media outreach|press release writing|crisis pr)\b/i.test(q)
  ) {
    return { isOutOfScope: true, serviceName: "public relations & PR retainers" };
  }

  // 6. Copywriting-only / Blog Writing
  if (
    /\b(copywriting-only|copywriting only|blog writing|article writing|ghostwriting|blog posts only|seo articles|write my blog)\b/i.test(q)
  ) {
    return { isOutOfScope: true, serviceName: "copywriting-only services" };
  }

  // 7. Video Games
  if (
    /\b(video game|game development|unity game|unreal engine|build a game)\b/i.test(q)
  ) {
    return { isOutOfScope: true, serviceName: "video game development" };
  }

  return { isOutOfScope: false, serviceName: "" };
}

export async function POST(req: Request) {
  try {
    const { message, history, clientContext } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Please enter a question or project brief." }, { status: 400 });
    }

    const availableCoins = Math.max(0, Number(clientContext?.availableCoins) || 0);
    const hasSubscription = Boolean(clientContext?.hasSubscription);
    const subscriptionPlan = clientContext?.subscriptionPlan ? String(clientContext.subscriptionPlan) : null;

    const trimmed = message.trim();

    // Strict V1 Scope Guardrail check
    const outOfScopeCheck = checkOutOfScopeService(trimmed);
    if (outOfScopeCheck.isOutOfScope) {
      return NextResponse.json({
        mode: "out_of_scope",
        headline: "Service Outside Version 1 Catalog",
        answer: `We currently do not offer ${outOfScopeCheck.serviceName} in Version 1, but you can submit this to our **Peach Business** feedback tab to let our team know it's something you want to see in the app. Every piece of feedback helps us grow—so you are growing with us!`,
        showFeedbackButton: true,
        diagnosticQuestions: null,
        scope: null,
        matchedCreatives: [],
      });
    }

    const admin = createAdminClient();

    // Query approved creatives from Supabase
    let pool: CreativeCandidate[] = APPROVED_CREATIVES_FALLBACK;
    try {
      const [{ data: realRows }, { data: realProfiles }, { data: realWorks }] = await Promise.all([
        admin.from("creatives").select("*").eq("application_status", "approved"),
        admin.from("profiles").select("id,full_name,avatar_url"),
        admin.from("creative_featured_work").select("*").order("created_at", { ascending: false }),
      ]);

      if (realRows && realRows.length > 0) {
        const nameMap = new Map((realProfiles ?? []).map((p: any) => [p.id, p.full_name]));
        const avatarMap = new Map((realProfiles ?? []).map((p: any) => [p.id, p.avatar_url]));

        pool = realRows.map((r: any, idx: number) => {
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
            match_reason: "Verified commercial portfolio executing this exact tier.",
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
    } catch (dbErr) {
      console.warn("Peach Match creative fetch fallback:", dbErr);
    }

    const historyArray: Array<{ role: string; content: string }> = Array.isArray(history) ? history : [];
    const hasPreviousDiagnosticTurn = historyArray.some((h) => h.role === "assistant");

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
USER: ${trimmed}

IS_FIRST_MESSAGE_IN_CONVERSATION: ${!hasPreviousDiagnosticTurn}

CLIENT WALLET & MEMBERSHIP CONTEXT:
- Available Coin Balance: ${availableCoins} Peach Coins ($${availableCoins * 50} USD)
- Active Subscription: ${hasSubscription ? `YES (Plan: ${subscriptionPlan || "Active Member"})` : "NO (Non-subscriber)"}

AVAILABLE CREATIVE CANDIDATES (Choose 3 with skill-proven fit if recommending a package):
${JSON.stringify(compactPool, null, 2)}

TASK:
Evaluate whether to DIAGNOSE (ask 2-3 quick diagnostic questions with short clickable pill options) or RECOMMEND (lock in 1 definitive package with coins, USD, turnaround, deliverables, required assets, and 3 matched creatives).
Remember: If this is an open-ended initial inquiry (e.g. "I need a website for my restaurant"), DIAGNOSE FIRST. Do not quote a price or return a package card on the first turn.
Output strictly valid JSON matching the schema in the system prompt.`;

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

      // Prioritize low-latency gemini-3.1-flash-lite, with gemini-3.8-flash as secondary
      const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];

      for (const model of modelsToTry) {
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error("Timeout after 8s")), 8000);
            if (typeof (timer as any)?.unref === "function") (timer as any).unref();
          });

          const geminiCall = ai.models.generateContent({
            model,
            contents: conversationPrompt,
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
            console.warn(`[Peach Match AI] Gemini 429/Quota on ${model}:`, callErr?.message);
          } else if (errMsg.includes("timeout")) {
            console.info(`[Peach Match AI] ${model} response timed out after 8s. Falling back smoothly.`);
          } else {
            console.warn(`[Peach Match AI] Notice on ${model}:`, callErr?.message);
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
      });
    }

    // If Gemini did not return a valid response (offline, timeout, or missing key), use intelligent deterministic concierge
    if (!parsed || (!parsed.diagnosticQuestions && !parsed.scope)) {
      const qLower = trimmed.toLowerCase();
      const hasExplicitTier =
        /(landing page|e-commerce|ecommerce|shopify|webflow|table reservations|menu and hours|brand sheet|logo overhaul|tabletop shoot|culinary shoot|portrait session|carousel drop|monthly social|flyer launch kit|packaging die-line)/.test(
          qLower
        );

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
          answerCopy += ` Great news—you have enough Peach Coins in your wallet to start this project right away (${requiredCoins} Coins needed, you currently have ${availableCoins} Coins available)! Below are 3 vetted specialists with verified portfolio matches ready to begin.`;
        } else {
          answerCopy += ` Note: This scope requires ${requiredCoins} Coins ($${requiredCoins * PEACH_COIN_USD_RATE} USD) and you currently have ${availableCoins} Coins in your wallet (${deficit} more Coins needed to hire).`;
          if (hasSubscription) {
            answerCopy += ` As an active ${subscriptionPlan || "Peach Network"} member, you can top up the extra ${deficit} Coins at your member rate right now, or wait until your next monthly coin drop.`;
          } else {
            answerCopy += ` Did you know? Peach Network monthly memberships give you recurring coin allowances, rollover protection, and member discounts. If you don't want to subscribe, that's completely okay—you can just do a quick one-time top up right here!`;
          }
        }

        parsed = {
          mode: "recommendation",
          headline: "Definitive Agency Recommendation",
          answer: answerCopy,
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
            { id: pool[1]?.id || "cr_maya", score: 96, reason: "Specialized in commercial brand systems and digital collateral." },
            { id: pool[2]?.id || "cr_jordan", score: 94, reason: "Proven track record delivering high-impact commercial launches." },
          ],
        };
      }
    }

    // Process Recommendation Mode
    if (parsed.mode === "recommendation" && parsed.scope) {
      const scopeData = parsed.scope;
      const coins = Math.max(1, Number(scopeData.coins) || 10);
      const matchedIds: Array<{ id: string; score: number; reason: string }> = Array.isArray(parsed?.topCreativeIds)
        ? parsed.topCreativeIds
        : [];

      const matchedCreatives: CreativeCandidate[] = [];
      const poolById = new Map(pool.map((c) => [c.id, c]));

      // 1. Add model-nominated creatives
      for (const item of matchedIds) {
        const c = poolById.get(item.id);
        if (c && !matchedCreatives.some((m) => m.id === c.id)) {
          matchedCreatives.push({
            ...c,
            match_score: Math.max(75, Math.min(99, Number(item.score) || 96)),
            match_reason: String(item.reason || c.match_reason),
          });
        }
      }

      // 2. Fill to 3 candidates prioritizing exact specialty match
      const targetCategoryTag = (scopeData.category || "web").toLowerCase();
      const sortedPool = [...pool].sort((a, b) => {
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

      const hasEnough = availableCoins >= coins;
      const deficitCoins = Math.max(0, coins - availableCoins);

      let finalAnswer = parsed.answer || "";
      // Ensure the wallet status and subscription info are clearly stated in the message text
      const ansLower = finalAnswer.toLowerCase();
      if (!hasEnough && !ansLower.includes("deficit") && !ansLower.includes("top up") && !ansLower.includes("more coin")) {
        finalAnswer += `\n\nNote: This project requires ${coins} Coins ($${coins * PEACH_COIN_USD_RATE} USD). You currently have ${availableCoins} Coins in your wallet (${deficitCoins} more needed).`;
        if (hasSubscription) {
          finalAnswer += ` As an active ${subscriptionPlan || "Peach Network"} member, you can top up the extra ${deficitCoins} Coins at your member rate right now or wait for your next monthly coin drop.`;
        } else {
          finalAnswer += ` Peach Network monthly subscriptions give you recurring monthly coin allowances and rollover protection. If you don't want to subscribe, that's completely okay—you can just do a quick one-time top up right here!`;
        }
      } else if (hasEnough && !ansLower.includes("enough") && !ansLower.includes("great news")) {
        finalAnswer += `\n\nGreat news—you have enough Peach Coins in your wallet to start this project right away (${coins} Coins needed, you have ${availableCoins} Coins available)!`;
      }

      return NextResponse.json({
        mode: "recommendation",
        headline: parsed.headline || "Definitive Agency Recommendation",
        answer: finalAnswer,
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
        matchedCreatives: matchedCreatives.slice(0, 3),
      });
    }

    // Process Diagnostic Mode
    return NextResponse.json({
      mode: "diagnostic",
      headline: parsed.headline || "Let's diagnose your project requirements",
      answer: parsed.answer || "Before quoting a price, let me check 3 quick details so we don't under-scope or over-quote:",
      diagnosticQuestions: Array.isArray(parsed.diagnosticQuestions) ? parsed.diagnosticQuestions : [],
      scope: null,
      matchedCreatives: [],
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
      },
      { status: 200 }
    );
  }
}
