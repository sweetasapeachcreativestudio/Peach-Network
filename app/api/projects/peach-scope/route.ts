import { NextResponse } from "next/server";
import { MASTER_2026_CATALOG, PEACH_COIN_USD_RATE, findCategoryByKeywords, type CatalogTierOption } from "@/lib/project-pricing";
import { safeGenerateContent } from "@/lib/gemini";
import { Type } from "@google/genai";

function fallbackScope(text: string) {
  const cat = findCategoryByKeywords(text);
  const q = (text || "").toLowerCase();

  let selectedTier: CatalogTierOption = cat.options.option_a;
  let isVague = false;

  if (cat.id === "website_design") {
    if (/(store|shop|e-commerce|ecommerce|product|restaurant|menu|online ordering|footwear)/.test(q)) {
      selectedTier = cat.options.option_c; // 26 Coins
    } else if (/(multi|pages|5 page|about us|services|gallery|full site)/.test(q)) {
      selectedTier = cat.options.option_b; // 18 Coins
    } else if (/(landing|single|conversion|one page)/.test(q)) {
      selectedTier = cat.options.option_a; // 10 Coins
    } else {
      isVague = true;
      selectedTier = cat.options.option_b;
    }
  } else if (cat.id === "branding_design") {
    if (/(overhaul|full rebrand|guidelines|stationery|complete brand|scale)/.test(q)) {
      selectedTier = cat.options.option_c; // 12 Coins
    } else if (/(brand sheet|starter|palette|typography|color)/.test(q)) {
      selectedTier = cat.options.option_b; // 6 Coins
    } else if (/(logo|vector mark|icon)/.test(q)) {
      selectedTier = cat.options.option_a; // 4 Coins
    } else {
      isVague = true;
      selectedTier = cat.options.option_b;
    }
  } else if (cat.id === "commercial_photography") {
    if (/(restaurant|food|culinary|chef|dish|dining)/.test(q)) {
      selectedTier = cat.options.option_c; // 12 Coins
    } else if (/(tabletop|product|shoe|bottle|retail)/.test(q)) {
      selectedTier = cat.options.option_b; // 10 Coins
    } else {
      selectedTier = cat.options.option_a; // 6 Coins
    }
  } else if (cat.id === "social_media") {
    if (/(monthly|30 day|calendar|reel|video|motion)/.test(q)) {
      selectedTier = cat.options.option_c; // 8 Coins
    } else if (/(carousel|slide|multi-slide)/.test(q)) {
      selectedTier = cat.options.option_b; // 4 Coins
    } else {
      selectedTier = cat.options.option_a; // 3 Coins
    }
  } else {
    // Graphic Design
    if (/(menu|packaging|die-line|dieline|box|brochure|multi-page)/.test(q)) {
      selectedTier = cat.options.option_c; // 6 Coins
    } else if (/(flyer|poster|event|promo)/.test(q)) {
      selectedTier = cat.options.option_b; // 2 Coins
    } else {
      selectedTier = cat.options.option_a; // 1 Coin
    }
  }

  return {
    serviceKey: cat.id,
    title: selectedTier.tierName,
    category: cat.categoryTag,
    categoryId: cat.id,
    complexity: "standard",
    coins: selectedTier.coins,
    usdAmount: selectedTier.coins * PEACH_COIN_USD_RATE,
    deliverables: selectedTier.deliverables,
    requiredFromBusiness: selectedTier.requiredFromBusiness,
    scopeSummary: selectedTier.scopeSummary,
    estimatedTurnaround: selectedTier.typicalTurnaround,
    revisionRounds: 3,
    isVague,
    catalogTiers: [cat.options.option_a, cat.options.option_b, cat.options.option_c],
    reason: `Calibrated with Peach Network 2026 Master Catalog (${selectedTier.coins} Peach Coins = $${selectedTier.coins * PEACH_COIN_USD_RATE} USD). Includes 3 revision rounds and 100% ownership transfer.`,
    followUp: isVague ? "Which scope level (Option A, B, or C) best matches your timeline and business goals?" : null,
  };
}

export async function POST(req: Request) {
  let text = "Design request";
  try {
    const body = await req.json().catch(() => ({}));
    const idea = body?.idea;
    const details = body?.details;
    text = [idea, details].filter(Boolean).join("\n").trim() || "Design request";

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(fallbackScope(text));
    }

    const systemInstruction = `You are Peach Match AI, the Senior Creative Director and Master Estimator for Peach Network in Birmingham, AL.
You scope commercial projects using the official 2026 Master Rates, Services, and 3-Tier Scoping Catalog.

PEACH RATE LAW:
1 Peach Coin = Exactly $50 USD.
NEVER under-quote or lowball creatives. Websites are NEVER 1-2 coins.

MASTER 2026 CATALOG BENCHMARKS:
1. Website Design:
   - Option A: Landing Page / Conversion Hub — 10 Coins ($500), 5–7 Days (1 responsive page, lead capture, Webflow/Squarespace/Figma, domain hookup).
   - Option B: Standard Multi-Page Business Site (3–5 Pages) — 18 Coins ($900), 8–12 Days (Home, About, Services, Gallery, Contact, responsive, SEO).
   - Option C: Advanced Retail E-Commerce or Restaurant Hub — 26 Coins ($1,300), 12–16 Days (Shopify/Webflow, products/cart or food/drink menus, reservation/takeout integration).
2. Branding Design:
   - Option A: Core Logo & Vector Kit — 4 Coins ($200), 3–4 Days (Primary logo + secondary mark, vector files, commercial rights).
   - Option B: Brand Identity Starter & Brand Sheet — 6 Coins ($300), 4–5 Days (Primary, secondary, submarks, 1-Page Master Brand Sheet with colors & typography).
   - Option C: Full Commercial Brand Identity Overhaul — 12 Coins ($600), 7–10 Days (Full system, 4 variations, stationery suite, 12-page brand guidelines).
3. Commercial Photography:
   - Option A: Executive & Creative Portrait Session — 6 Coins ($300), 3–5 Days (1 hr on-location/studio, 5 retouched portraits).
   - Option B: Product Tabletop Session (Footwear / Retail) — 10 Coins ($500), 5–7 Days (Up to 5 products, 15 retouched images, white cutouts).
   - Option C: On-Location Restaurant, Culinary & Brand Shoot — 12 Coins ($600), 5–7 Days (2 hrs, 10 styled dishes, 20 retouched photos).
4. Social Media Design:
   - Option A: Social Campaign Launch Pack (4 Posts) — 3 Coins ($150), 2–3 Days (4 static feed + 9:16 story designs, editable files).
   - Option B: High-Converting Multi-Slide Carousel Drop — 4 Coins ($200), 3–4 Days (6–8 slide carousel, hook + CTA slide, caption copy).
   - Option C: Monthly Social Suite + Video Reels / Motion Teasers — 8 Coins ($400), 5–7 Days (12 branded assets, 2 animated reels 15–30s).
5. Graphic Design:
   - Option A: Quick Task / Minor Graphic Revision — 1 Coin ($50), 1–2 Days (Business card, social banner, text update).
   - Option B: Commercial Event / Promo Flyer Launch Kit — 2 Coins ($100), 2–3 Days (Single/double-sided flyer, 1:1, 9:16, 300 DPI print PDF).
   - Option C: Multi-Page Menu, Brochure or Packaging Die-Line — 6 Coins ($300), 4–6 Days (4-page menu/brochure OR box/label dieline + 3D mockup).

DECISION LOGIC:
- If the client's request clearly matches one tier, suggest that exact tier with its coin amount, deliverables, turnaround, and what is required from the business.
- If the client's request is vague or could fall into multiple tiers (e.g. "I need a website" or "I need some branding"), mark isVague = true and explain the 3 options (Option A, Option B, Option C) so the client can select one.
- Tone: warm, friendly, like an experienced Creative Director partner who has the business owner's back.`;

    const prompt = `PROJECT REQUEST:
"""
${text}
"""

Analyze this request according to the 2026 Master Catalog rules and return the JSON evaluation.`;

    const rawResponse = await safeGenerateContent({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categoryId: {
              type: Type.STRING,
              description: "website_design | branding_design | commercial_photography | social_media | graphic_design",
            },
            title: {
              type: Type.STRING,
              description: "Punchy, clear project title from 2026 catalog",
            },
            category: {
              type: Type.STRING,
              description: "Website | Brand & Illustration | Photography | Design",
            },
            selectedTierOption: {
              type: Type.STRING,
              description: "option_a | option_b | option_c",
            },
            coins: {
              type: Type.INTEGER,
              description: "Accurate Peach Coins from 2026 Catalog",
            },
            deliverables: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Concrete deliverables list",
            },
            requiredFromBusiness: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "What the business owner must provide for this project to succeed",
            },
            estimatedTurnaround: {
              type: Type.STRING,
              description: "Turnaround time in business days",
            },
            isVague: {
              type: Type.BOOLEAN,
              description: "True if request was broad/vague and client should choose between Option A, B, or C",
            },
            reason: {
              type: Type.STRING,
              description: "Friendly Creative Director explanation of the scope and coin pricing",
            },
            followUp: {
              type: Type.STRING,
              description: "Friendly question to help the business choose, or null",
            },
          },
          required: ["categoryId", "title", "category", "coins", "deliverables", "reason"],
        },
      },
    });

    if (!rawResponse) {
      return NextResponse.json(fallbackScope(text));
    }

    const parsed = JSON.parse(rawResponse);
    const cat = MASTER_2026_CATALOG[parsed.categoryId] || findCategoryByKeywords(text);
    const coins = Math.max(1, Number(parsed.coins) || cat.options.option_a.coins);

    return NextResponse.json({
      serviceKey: cat.id,
      title: parsed.title || cat.options.option_b.tierName,
      category: parsed.category || cat.categoryTag,
      categoryId: cat.id,
      complexity: "standard",
      coins,
      usdAmount: coins * PEACH_COIN_USD_RATE,
      deliverables: Array.isArray(parsed.deliverables) && parsed.deliverables.length > 0
        ? parsed.deliverables
        : cat.options.option_b.deliverables,
      requiredFromBusiness: Array.isArray(parsed.requiredFromBusiness) && parsed.requiredFromBusiness.length > 0
        ? parsed.requiredFromBusiness
        : cat.options.option_b.requiredFromBusiness,
      estimatedTurnaround: parsed.estimatedTurnaround || cat.options.option_b.typicalTurnaround,
      revisionRounds: 3,
      isVague: Boolean(parsed.isVague),
      catalogTiers: [cat.options.option_a, cat.options.option_b, cat.options.option_c],
      reason: parsed.reason || `Priced at ${coins} Peach Coins ($${coins * PEACH_COIN_USD_RATE} USD) via the 2026 Master Catalog.`,
      followUp: parsed.followUp || null,
    });
  } catch (err: any) {
    console.warn("Peach Scope fallback:", err?.message || err);
    return NextResponse.json(fallbackScope(text));
  }
}