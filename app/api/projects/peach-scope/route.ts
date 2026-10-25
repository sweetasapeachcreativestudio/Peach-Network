import { NextResponse } from "next/server";
import { SERVICE_GUIDE } from "@/lib/project-pricing";
import { ai } from "@/lib/gemini";
import { Type } from "@google/genai";

const guideRules = Object.entries(SERVICE_GUIDE).map(([key, v]) => ({
  key,
  label: v.label,
  minCoins: v.min,
  maxCoins: v.max,
}));

function getCategoryForService(key: string): string {
  if (key.includes("web") || key === "landing_page" || key === "homepage_refresh" || key === "multipage_refresh") {
    return "Website";
  }
  if (key.includes("video") || key.includes("reel") || key.includes("motion") || key.includes("animation")) {
    return "Video & Motion";
  }
  if (key.includes("photo")) return "Photography";
  if (key.includes("logo") || key === "illustration") return "Brand & Illustration";
  return "Design";
}

function fallbackScope(text: string) {
  const q = text.toLowerCase();
  let key: keyof typeof SERVICE_GUIDE = "social_graphic";

  if (/website|web site|landing|web page|homepage|shopify|squarespace|wordpress/.test(q)) {
    key = /multi|full|pages|ecommerce|e-commerce|store/.test(q) ? "multipage_refresh" : "landing_page";
  } else if (/flyer|poster|handout|one-pager|one pager/.test(q)) {
    key = "flyer";
  } else if (/logo|brandmark|logomark/.test(q)) {
    key = /refresh|update|clean up/.test(q) ? "logo_refresh" : "new_logo";
  } else if (/reel|tiktok|short edit|instagram story/.test(q)) {
    key = "simple_reel";
  } else if (/video|commercial|promo|filming/.test(q)) {
    key = "promo_video";
  } else if (/photo|headshot|product photography/.test(q)) {
    key = /brand|product/.test(q) ? "brand_photo" : "mini_photo";
  } else if (/brochure|trifold|pamphlet/.test(q)) {
    key = "brochure";
  } else if (/presentation|pitch deck|slides/.test(q)) {
    key = "presentation";
  } else if (/illustration|drawing|icon set/.test(q)) {
    key = "illustration";
  }

  const guide = SERVICE_GUIDE[key];
  const coins = guide.min;

  return {
    serviceKey: key,
    title: guide.label,
    category: getCategoryForService(key),
    complexity: "standard",
    coins,
    usdAmount: coins * 50,
    deliverables: [`Standard high-res files for ${guide.label}`, "Complete commercial rights & source files"],
    estimatedTurnaround: coins > 5 ? "5–7 business days" : "2–4 business days",
    revisionRounds: 2,
    reason: `Scoped based on standard commercial deliverables for ${guide.label} (1 Coin = $50 USD).`,
    followUp: null,
  };
}

export async function POST(req: Request) {
  try {
    const { idea, details } = await req.json();
    const text = [idea, details].filter(Boolean).join("\n").trim();

    if (!text) {
      return NextResponse.json({ error: "Tell Peach what you need created." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(fallbackScope(text));
    }

    const systemInstruction = `You are Peach Match AI, the expert project architect and commercial design estimator for Sweet As A Peach Creative Network in Birmingham, AL.
Your mission is to understand whatever creative work a business describes in plain English, translate it into an exact commercial brief, and calculate the cost in Peach Coins.

STRICT PEACH COIN RULES:
1. Exactly 1 Peach Coin = $50 USD of standard commercial creative value.
2. Every project must be priced in integer Peach Coins (minimum 1 Coin).
3. Benchmark against standard commercial services:
   - Social Graphic / Flyer / Poster / Business Card: 1 Coin ($50)
   - Carousel / Email Newsletter / Small Website Update / Brochure: 2-3 Coins ($100-$150)
   - Landing Page / Logo Refresh / Custom Illustration / Reel Edit: 3-5 Coins ($150-$250)
   - New Logo & Brand Identity / Promo Video / Multi-Page Website: 6-10 Coins ($300-$500)
   - Full Commercial Rebrand / High-End Packaging Line / Custom Web App: 10-18 Coins ($500-$900)
4. Do NOT under-scope or overcharge. Provide a fair, transparent commercial rate.
5. Identify concrete deliverables, estimated turnaround, and standard 2 revision rounds.`;

    const prompt = `PROJECT REQUEST:
"""
${text}
"""

SERVICE GUIDE BENCHMARKS:
${JSON.stringify(guideRules, null, 2)}

Analyze this project request and return the JSON evaluation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            serviceKey: {
              type: Type.STRING,
              description: "Closest matching service key from guide or 'custom'",
            },
            title: {
              type: Type.STRING,
              description: "Punchy, clear, professional project title (e.g., 'Cold Brew Packaging & Social Launch Graphics')",
            },
            category: {
              type: Type.STRING,
              description: "Category: 'Design' | 'Brand & Illustration' | 'Website' | 'Video & Motion' | 'Photography' | 'Custom'",
            },
            complexity: {
              type: Type.STRING,
              description: "'standard' | 'expanded' | 'custom'",
            },
            coins: {
              type: Type.INTEGER,
              description: "Required whole number of Peach Coins (1 coin = $50 USD)",
            },
            deliverables: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of 2 to 4 tangible deliverables the creative will produce",
            },
            estimatedTurnaround: {
              type: Type.STRING,
              description: "Estimated business days turnaround (e.g., '2–3 business days', '4–6 business days')",
            },
            revisionRounds: {
              type: Type.INTEGER,
              description: "Number of included revision rounds (usually 2)",
            },
            reason: {
              type: Type.STRING,
              description: "Clear, reassuring 1-2 sentence explanation of the scope and coin breakdown",
            },
            followUp: {
              type: Type.STRING,
              description: "Optional single clarifying question if something critical is ambiguous, else null",
            },
          },
          required: ["title", "category", "coins", "deliverables", "reason"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const coins = Math.max(1, Number(parsed.coins) || 1);

    return NextResponse.json({
      serviceKey: parsed.serviceKey || "custom",
      title: parsed.title || "Custom Commercial Design Request",
      category: parsed.category || "Design",
      complexity: parsed.complexity || "standard",
      coins,
      usdAmount: coins * 50,
      deliverables: Array.isArray(parsed.deliverables) && parsed.deliverables.length > 0
        ? parsed.deliverables
        : ["Standard commercial deliverables", "Print/web source assets"],
      estimatedTurnaround: parsed.estimatedTurnaround || (coins > 5 ? "5–7 business days" : "2–4 business days"),
      revisionRounds: parsed.revisionRounds || 2,
      reason: parsed.reason || `Estimated at ${coins} Peach Coins ($${coins * 50} USD) based on scope.`,
      followUp: parsed.followUp || null,
    });
  } catch (err: any) {
    console.error("Peach Match AI Scope Error:", err);
    try {
      const { idea, details } = await req.json().catch(() => ({}));
      return NextResponse.json(fallbackScope([idea, details].filter(Boolean).join("\n")));
    } catch {
      return NextResponse.json(fallbackScope("Design request"));
    }
  }
}