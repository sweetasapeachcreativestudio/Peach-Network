import { NextResponse } from "next/server";
import { safeGenerateContent, ThinkingLevel } from "@/lib/gemini";
import { createAdminClient } from "@/lib/supabase/admin";

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
    bio: "Commercial brand designer who turns business goals into polished campaign systems, 3-part logo suites, launch graphics, and print-ready production collateral.",
    match_score: 98,
    match_reason: "Master of 3-part logo suites, brand typography, and print-ready packaging and menu collateral.",
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
    bio: "High-energy commercial graphic designer specializing in athlete announcements, multi-photo chopped flyers, event promo, and high-impact social layouts.",
    match_score: 95,
    match_reason: "Specialist in layered flyer design, photo subject clipping/chopping, and high-contrast event posters.",
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
    bio: "Digital designer focused on attractive, responsive web designs and landing pages for restaurants, hospitality, and local brands that convert visitors.",
    match_score: 94,
    match_reason: "Deep expertise in restaurant web design, online menus, inventory/ordering integration, and mobile reservations.",
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
    headline: "Packaging & Print Production",
    city: "Birmingham",
    state: "AL",
    hub: "Birmingham Hub",
    reliability_score: 98,
    bio: "Print production veteran specializing in spot colors, foil stamping, packaging dielines, and multi-page menu books.",
    match_score: 93,
    match_reason: "Specialized in packaging dielines, menu engineering, technical print tolerances, and press-ready deliverables.",
    specialties: ["Packaging Dielines", "Box Packaging", "Menu Engineering", "Print Specs"],
    featured_work: {
      title: "Red Mountain Cold Brew Dieline Suite",
      image_url: "/Project 4.png",
      industry: "Food & Beverage",
      tags: ["Packaging", "Print Dieline", "Spot UV"],
    },
  },
  {
    id: "cr_sophie",
    name: "Sophie Chen",
    avatar_url: "/people/sophie.jpg",
    peach_level: "tree",
    headline: "Custom Illustration & Editorial",
    city: "Huntsville",
    state: "AL",
    hub: "Huntsville Hub",
    reliability_score: 99,
    bio: "Vector illustrator crafting distinct custom brand mascots, merchandise apparel graphics, and bespoke iconography.",
    match_score: 92,
    match_reason: "Artistic vector illustration, brand character design, and custom merchandise assets.",
    specialties: ["Vector Illustration", "Character Design", "Merch Graphics", "Icon Sets"],
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
    headline: "Short-Form Video & Motion",
    city: "Montgomery",
    state: "AL",
    hub: "Montgomery Hub",
    reliability_score: 97,
    bio: "Fast-paced motion designer and video editor specializing in vertical video reels, animated logos, and social storytelling.",
    match_score: 91,
    match_reason: "Dynamic motion graphics, vertical reels, and social storytelling tailored for business.",
    specialties: ["Video Reels", "Motion Graphics", "Logo Animation", "Social Shorts"],
    featured_work: {
      title: "Highland Bar & Grill Launch Reel",
      image_url: "/project 7.jpg",
      industry: "Dining & Nightlife",
      tags: ["Video Reel", "Motion Graphics", "Social"],
    },
  },
  {
    id: "cr_jeremiah",
    name: "Jeremiah",
    avatar_url: "/Creative1.JPG",
    peach_level: "sapling",
    headline: "Graphic Designer & Content Creator",
    city: "Birmingham",
    state: "AL",
    hub: "Birmingham Hub",
    reliability_score: 97,
    bio: "Graphic designer and social media content creator specializing in collegiate marketing posts, campus campaigns, and digital announcements.",
    match_score: 96,
    match_reason: "Specialist in Lawson State marketing campaigns and high-engagement social media graphics.",
    specialties: ["Social Media", "Marketing Graphics", "Event Announcement", "Digital Content"],
    featured_work: {
      title: "Social Media Marketing Posts",
      image_url: "/Project 1.png",
      industry: "Education & Campus Life",
      tags: ["Social Media", "College Marketing", "Branding"],
    },
  },
  {
    id: "cr_donovon",
    name: "Donovon",
    avatar_url: "/Creative2.jpg",
    peach_level: "blossom",
    headline: "Graphic Designer (SCAD)",
    city: "Savannah",
    state: "GA",
    hub: "Savannah Georgia Hub",
    reliability_score: 98,
    bio: "Graphic designer trained at Savannah College of Art and Design (SCAD), creating civic brand identities, scalable vector kits, and print suites.",
    match_score: 96,
    match_reason: "Exceptional precision in vector seals, civic identities, apparel art, and brand guidelines.",
    specialties: ["Brand Identity", "Vector Illustration", "Civic Branding", "Print Suites"],
    featured_work: {
      title: "Logo & Brand Identity Suite",
      image_url: "/Project 3.png",
      industry: "Civic & Community",
      tags: ["Brand Kit", "Vector Identity", "Print"],
    },
  },
  {
    id: "cr_stephanie",
    name: "Stephanie Stewart",
    avatar_url: "/Creative4.jpg",
    peach_level: "tree",
    headline: "Art Director & Editorial Designer",
    city: "Birmingham",
    state: "AL",
    hub: "Birmingham Hub",
    reliability_score: 99,
    bio: "Senior art director and editorial designer creating community program booklets, ceremonial menus, and healthcare publications.",
    match_score: 97,
    match_reason: "Expertise in multi-page publication layouts, saddle-stitch booklets, and ceremonial banquet menus.",
    specialties: ["Booklet Design", "Editorial Layout", "Event Menus", "Print Production"],
    featured_work: {
      title: "Community Program Booklet",
      image_url: "/Project 4.png",
      industry: "Healthcare & Non-Profit",
      tags: ["Booklet", "Editorial", "Print Bleeds"],
    },
  },
  {
    id: "cr_jose",
    name: "Jose Garcia",
    avatar_url: "/jose-creative.jpg",
    peach_level: "blossom",
    headline: "Illustrator & ADDY Winner",
    city: "Troy",
    state: "AL",
    hub: "Troy Alabama Hub",
    reliability_score: 98,
    bio: "ADDY Award-winning illustrator and video editor at Troy University specializing in custom vector character illustrations and creative apparel art.",
    match_score: 95,
    match_reason: "Bespoke vector illustrations, dynamic scene compositions, and distinctive brand mascots.",
    specialties: ["Custom Illustration", "Vector Character Art", "Apparel Design", "Editorial Art"],
    featured_work: {
      title: "Custom Vector Character Illustration",
      image_url: "/project 7.jpg",
      industry: "Apparel & Entertainment",
      tags: ["Illustration", "Vector Art", "Character"],
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
                (r.city?.toLowerCase().includes("savannah")
                  ? "Savannah Georgia Hub"
                  : r.city?.toLowerCase().includes("troy")
                  ? "Troy Alabama Hub"
                  : r.city?.toLowerCase().includes("atlanta")
                  ? "Atlanta Georgia Hub"
                  : r.city?.toLowerCase().includes("huntsville")
                  ? "Huntsville Hub"
                  : r.city?.toLowerCase().includes("montgomery")
                  ? "Montgomery Hub"
                  : "Birmingham Hub"),
              reliability_score: Number(r.reliability_score) || fallback.reliability_score,
              bio: r.bio || fallback.bio,
              match_score: 95,
              match_reason: "Strong commercial experience and portfolio alignment.",
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

    // Deep Prompt for Gemini with Scoping & Clarification Rules
    const systemInstruction = `You are Peach Match AI, the warm, expert commercial art director, creative consultant, and companion for business owners on the Sweet As A Peach Creative Network in Birmingham, AL.
You speak like a trusted, encouraging friend and senior creative director who makes design simple, clear, and reassuring for business owners.

IMPORTANT PRICING LAW:
1 Peach Coin = $50.00 USD. Every quote and estimate MUST clearly show both Coins and USD ($50 per coin).

CRITICAL SCOPING & CLARIFICATION RULES:
1. RESTAURANT WEBSITE:
   - When a client mentions a website for a restaurant, cafe, bar, bakery, or food business, you MUST recognize that restaurants usually need menus, food photo galleries, hours/location, and either an online ordering/inventory system or reservation widget (OpenTable/Resy).
   - Before locking in a final scope, ask the client whether they need:
     (a) A Single-Page Homepage / Landing Page (hero, hours, location, embedded menu PDF/simple section, contact CTA): 6–8 Peach Coins ($300–$400).
     (b) A Full-Scale Restaurant Web Platform (multi-page, interactive digital food & drink menus with dietary tags, takeout/inventory ordering integration, reservation widget, catering form): 16–22 Peach Coins ($800–$1,100).
   - Provide interactive options in the "clarification" field.

2. FLYER / EVENT PROMO:
   - When a client asks for a flyer or poster, ask what the flyer is about and clarify the complexity tier:
     (a) Basic Flyer: 1–2 photos provided by client, straightforward typography, headline & event details, no complex photo manipulation: 2 Peach Coins ($100).
     (b) Advanced Flyer: 5–6 photos, demanding people/performers needing background chopping/cutting out and color grading, custom 3D/layered typography, glow lighting effects, double-sided print bleeds: 4–5 Peach Coins ($200–$250).
   - Explain the difference clearly so the client understands why photo chopping and multiple subjects take extra craft and time.

3. BRANDING / LOGO:
   - When a client mentions needing a logo or branding, educate them with warm business insight!
   - Upsell them on why they need a Full 3-Part Logo Suite rather than just a single logo mark:
     * Primary Logo: The full mark with wordmark and icon for storefronts, signboards, invoices.
     * Horizontal / Secondary Logo: Wider orientation for website headers, email headers, and sponsor strips so it doesn't get squeezed.
     * Submark / Favicon / Icon: Compact circular or square mark for social media avatars (Instagram/TikTok), app icons, packaging stickers, and wax seals.
     * Plus brand color palette (HEX, RGB, CMYK, Pantone) and typography rules.
   - Pricing: Single standalone logo = 4 Coins ($200); Complete 3-Part Logo Suite & Brand Identity System = 8 Coins ($400).

4. "WHY DO I NEED THIS?" EXPLANATION:
   - If the client asks "Why do I need this?", "Why 3 logos?", "Why vector .AI files?", "Why bleed margins for print?", "Why a multi-page site vs landing page?":
   - Answer warmly, like a friend who has their back. Explain the tangible business problem it prevents (e.g. "Without a horizontal logo, your primary mark gets shrunken down to an unreadable thumbnail on your website header!").

5. 3 APPROVED CREATIVES:
   - Pick the TOP 3 CREATIVES from the provided roster based on their bios, specialties, and portfolio work. Provide a concrete match score (88–99%) and a 1-sentence match reason citing their specific portfolio work.

RESPONSE FORMAT (JSON STRICT):
{
  "answer": "Warm, encouraging companion advice explaining the design scope, pricing in coins and USD, and answering their questions directly.",
  "companionInsight": "A friendly 1-2 sentence tip or encouragement specifically for this business owner (like a trusted studio friend).",
  "clarification": {
    "needed": boolean,
    "question": "Question to narrow down their scope if ambiguous (e.g., full restaurant site vs landing page, basic 1-2 photo flyer vs 5-6 chopped photos, or single logo vs 3-part suite)",
    "options": [
      { "label": "Short button label with coins & USD", "value": "User response message when clicked" }
    ]
  },
  "scope": {
    "title": "Clear project title (e.g., 'Full-Scale Restaurant Website & Digital Menu Suite')",
    "category": "Design" | "Brand & Illustration" | "Website" | "Video & Motion" | "Photography",
    "serviceKey": "social_graphic" | "flyer" | "business_card" | "banner" | "carousel" | "newsletter" | "brochure" | "presentation" | "small_web_update" | "landing_page" | "homepage_refresh" | "multipage_refresh" | "logo_refresh" | "new_logo" | "illustration" | "simple_reel" | "advanced_video" | "motion_graphic" | "promo_video",
    "coins": number,
    "usdAmount": number,
    "deliverables": ["List of tangible deliverables"],
    "estimatedTurnaround": "e.g., 3–5 business days",
    "revisionRounds": 3,
    "reason": "Clear explanation of how the project is scoped and why this coin investment fits the deliverable."
  },
  "topCreativeIds": [
    { "id": "creative_id", "score": 98, "reason": "Specific reason citing portfolio" }
  ],
  "followUps": [
    "Why do I need a 3-part logo suite instead of one?",
    "What is the difference between a landing page and a full-scale restaurant website?",
    "Can you explain the photo chopping on the advanced flyer?"
  ]
}`;

    const compactPool = pool.map((c) => ({
      id: c.id,
      name: c.name,
      level: c.peach_level,
      specialties: c.specialties,
      bio: c.bio,
      portfolioSample: c.featured_work.title,
      industry: c.featured_work.industry,
    }));

    const prompt = `CLIENT QUERY / PROJECT REQUEST:
"""${trimmed}"""

RECENT CONVERSATION HISTORY:
${JSON.stringify(history || [])}

AVAILABLE APPROVED CREATIVES:
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
          timeoutMs: 20000,
        });
        if (rawText) {
          parsed = JSON.parse(rawText);
        }
      } catch (modelErr) {
        console.warn("Gemini model temporary error, using smart local scoping engine:", modelErr);
      }
    }

    // Smart Local Fallback Engine if Gemini API not configured or timed out
    if (!parsed || !parsed.scope) {
      const q = trimmed.toLowerCase();
      let cat = "Design";
      let key = "social_graphic";
      let title = "Custom Commercial Design Deliverable";
      let coins = 2;
      let deliverables = [
        "Production-ready vector source assets (.AI, .SVG, .PDF)",
        "Web & social optimized exports (.PNG, .JPG)",
        "Commercial usage rights release",
      ];
      let turnaround = "2–4 business days";
      let answer = "";
      let companionInsight = "I'm right here with you! Every project on Peach is protected by escrow, includes 2 full revision rounds, and guarantees direct communication with your vetted creative.";
      let clarification: any = null;
      let followUps = [
        "What file formats will I receive?",
        "Why do I need 3 logos instead of just one?",
        "How does the 24-hour creative acceptance work?",
      ];

      // 1. Restaurant Website Rule
      if (q.includes("restaurant") && (q.includes("web") || q.includes("site") || q.includes("page"))) {
        const isFullScale = q.includes("full") || q.includes("multi") || q.includes("order") || q.includes("inventory");
        cat = "Website";
        if (isFullScale) {
          key = "multipage_refresh";
          coins = 18;
          turnaround = "7–10 business days";
          title = "Full-Scale Restaurant Website with Menus & Ordering";
          deliverables = [
            "Complete multi-page responsive website (Home, About, Menus, Catering, Contact)",
            "Dynamic food & beverage digital menu system with dietary badges",
            "Online ordering / inventory integration (Toast, Square, or Shopify)",
            "Table reservation widget embed (OpenTable or Resy)",
            "Mobile-first responsive layout & local SEO metadata setup",
          ];
          answer =
            "Because restaurants have live menus, daily hours, and inventory/takeout needs, a full-scale restaurant website gives your guests a seamless ordering experience and handles table reservations. At 18 Peach Coins ($900 USD), you get an end-to-end multi-page restaurant suite built for high foot-traffic and takeout orders.";
          companionInsight =
            "Pro-tip from a friend: Most restaurant diners browse your menu on their phone while standing on the sidewalk! Having tap-to-order mobile menus will noticeably boost your takeout sales.";
        } else {
          key = "landing_page";
          coins = 8;
          turnaround = "4–6 business days";
          title = "Restaurant Launch Homepage & Menu Showcase";
          deliverables = [
            "High-impact single-page restaurant landing site with hero dining photography",
            "Full food & drink menu showcase section with price points",
            "Location map, operating hours, phone click-to-call, and directions",
            "Table reservation link or simple booking modal",
          ];
          answer =
            "Restaurants need menus and inventory/ordering off the bat. If you just need a clean single homepage right now, we scope that at 8 Peach Coins ($400 USD). However, if your restaurant needs multi-page menus and live takeout ordering/inventory, a full-scale site is 18 Peach Coins ($900 USD). Which fits your current stage best?";
          clarification = {
            needed: true,
            question: "What scale fits your restaurant launch best?",
            options: [
              { label: "Single-Page Launch Site · 8 Coins ($400)", value: "I need a single-page restaurant homepage with hours and menu section" },
              { label: "Full Restaurant Suite with Menus & Ordering · 18 Coins ($900)", value: "I need a full-scale restaurant website with multi-page menus, online ordering, and reservations" },
            ],
          };
          companionInsight =
            "If you're opening a new restaurant, start with the single homepage to get found on Google Maps fast, then upgrade to full takeout ordering when your kitchen is fully staffed!";
        }
      }
      // 2. Flyer / Event Promo Rule
      else if (q.includes("flyer") || q.includes("poster") || q.includes("event graphic") || q.includes("leaflet")) {
        const isAdvanced = q.includes("5") || q.includes("6") || q.includes("chop") || q.includes("cutout") || q.includes("advanced") || q.includes("people") || q.includes("glow");
        cat = "Design";
        key = "flyer";
        if (isAdvanced) {
          coins = 4;
          turnaround = "2–3 business days";
          title = "Advanced Layered Event Flyer (5–6 Photo Chopping & FX)";
          deliverables = [
            "Precision subject background cutouts for up to 6 people/artists",
            "Custom 3D typography, lighting glows, and layered textures",
            "Full-bleed print-ready PDF (CMYK, 300 DPI, 0.125” bleed marks)",
            "Optimized 9:16 Instagram Story and 1:1 post square exports",
            "Layered editable source file (.PSD or .AI)",
          ];
          answer =
            "An advanced event flyer with 5–6 photos requires precision clipping/chopping of each person, color grading skin tones to match the event lighting, and layered typography effects. Scoped at 4 Peach Coins ($200 USD), you get an eye-catching, club-ready or concert-ready piece with both digital and print press-ready files.";
          companionInsight =
            "When flyers have multiple artists or speakers, clean cutout edges and high-contrast headlines ensure people spot the date and lineup in less than 3 seconds on social media!";
        } else {
          coins = 2;
          turnaround = "1–2 business days";
          title = "Commercial Event & Promo Flyer (Basic Scope)";
          deliverables = [
            "Eye-catching single or double photo event layout",
            "High-contrast headline typography, date, venue, and ticketing details",
            "Print-ready 300 DPI PDF with bleed margins",
            "Social media exports (1:1 feed square and 9:16 story format)",
          ];
          answer =
            "For flyers, scope depends on the photo editing required. A basic flyer with 1–2 photos and clean layout is 2 Peach Coins ($100 USD). If you have 5–6 photos that need people chopped out and custom lighting effects, that is an advanced scope at 4 Peach Coins ($200 USD). Which one matches your vision?";
          clarification = {
            needed: true,
            question: "How advanced does your flyer need to be?",
            options: [
              { label: "Basic Flyer (1–2 photos, clean layout) · 2 Coins ($100)", value: "I need a basic flyer with 1-2 photos and clean event details" },
              { label: "Advanced Flyer (5–6 cutouts & custom FX) · 4 Coins ($200)", value: "I need an advanced flyer with 5-6 chopped photos and custom lighting effects" },
            ],
          };
          companionInsight =
            "If you have high-res transparent PNGs already, a basic 2-coin flyer is plenty! If you have phone photos where we need to chop out the background, go with the advanced 4-coin scope.";
        }
      }
      // 3. Logo / Branding Rule
      else if (q.includes("logo") || q.includes("brand") || q.includes("identity")) {
        cat = "Brand & Illustration";
        const wantsSuite = q.includes("suite") || q.includes("full") || q.includes("3") || q.includes("system") || q.includes("identity");
        if (wantsSuite) {
          key = "new_logo";
          coins = 8;
          turnaround = "4–6 business days";
          title = "Complete 3-Part Logo Suite & Brand Identity System";
          deliverables = [
            "Primary Logo (full master mark for signage, store fronts, and stationery)",
            "Horizontal / Secondary Logo (wide banner orientation for web headers and emails)",
            "Submark / Favicon / Icon (compact mark for social avatars, app icons, and stickers)",
            "Commercial Color Palette (HEX, RGB, CMYK, Pantone specifications)",
            "Brand Typography Hierarchy & font pairing guide",
            "Vector source assets (.AI, .EPS, .SVG, .PDF) + high-res transparent .PNGs",
          ];
          answer =
            "A single logo mark often fails when you try to fit it into different places—it gets cropped on Instagram avatars and squished in website navbars. That's why we build you a full 3-Part Logo Suite (Primary, Horizontal, and Submark) plus color palette and typography rules for 8 Peach Coins ($400 USD). This gives your brand professional versatility everywhere you show up.";
          companionInsight =
            "Think of your 3-logo suite like a tailored suit: the primary logo is your jacket, the horizontal mark is your button-down for tight spaces, and the submark is your cufflinks for small details!";
        } else {
          key = "logo_refresh";
          coins = 4;
          turnaround = "3–4 business days";
          title = "Single Standalone Primary Logo Mark";
          deliverables = [
            "Custom vector primary logo mark (.AI, .SVG, .PDF)",
            "High-res transparent .PNG exports (dark and light background variations)",
            "Basic commercial color codes (HEX and CMYK)",
          ];
          answer =
            "You can start with a single standalone logo for 4 Peach Coins ($200 USD). But let me share an important creative secret: most businesses quickly find that a single logo doesn't fit everywhere! For 8 Peach Coins ($400 USD), you can upgrade to a full 3-Part Logo Suite (Primary + Horizontal + Submark Icon) plus color palettes and typography rules. Would you like the single mark or the full 3-part suite?";
          clarification = {
            needed: true,
            question: "Would you like a standalone logo or the full 3-part brand suite?",
            options: [
              { label: "Full 3-Part Logo Suite (Primary, Horizontal, Submark) · 8 Coins ($400)", value: "I want the full 3-part logo suite with primary, horizontal, and submark versions plus brand colors" },
              { label: "Single Standalone Primary Logo · 4 Coins ($200)", value: "I only need a single standalone primary logo mark for now" },
            ],
          };
          companionInsight =
            "Investing in the 3-part suite now saves you from paying a designer again later when your primary logo looks distorted on your website header or invoice header!";
        }
      }
      // 4. "Why do I need this?" handler
      else if (q.includes("why") && (q.includes("need") || q.includes("this") || q.includes("3") || q.includes("suite"))) {
        answer =
          "Here is why you need these specific deliverables: In commercial design, one size never fits all. For instance, your primary logo is often tall or circular—if you put that on a website navbar, it shrinks down until your company name is unreadable! Having a horizontal logo solves that instantly. A submark gives you a crisp icon for Instagram, TikTok, and app icons. And having vector files (.AI/.SVG) means your logo can be blown up to the size of a highway billboard without ever getting pixelated or blurry.";
        companionInsight =
          "My job as your Peach companion is to make sure you never waste money on files you can't use or designs that break when printed!";
        coins = 4;
        title = "Brand Consistency & Vector Asset Deliverable";
        deliverables = [
          "Scalable vector source files (.AI, .SVG, .PDF)",
          "Print-ready CMYK and digital RGB color separations",
          "Brand application guide showing correct usage",
        ];
      }
      // General Fallback
      else {
        answer = `Peach Match AI here! For "${trimmed}", 1 Peach Coin equals exactly $50 USD of vetted studio work. All projects include 2 complete revision rounds, direct messaging with your creative, and standard commercial source files.`;
        companionInsight = "Feel free to tell me more about your business or audience so we can tailor the scope and match the best creative!";
      }

      parsed = {
        answer,
        companionInsight,
        clarification,
        scope: {
          title,
          category: cat,
          serviceKey: key,
          coins,
          usdAmount: coins * 50,
          deliverables,
          estimatedTurnaround: turnaround,
          revisionRounds: 3,
          reason: `Priced at ${coins} Peach Coins ($${coins * 50} USD) based on transparent studio scope standards.`,
        },
        topCreativeIds: [
          { id: pool[0]?.id || "cr_maya", score: 98, reason: "Specializes in this category with verified commercial portfolio." },
          { id: pool[1]?.id || "cr_jordan", score: 95, reason: "Fast turnaround and high-impact commercial layouts." },
          { id: pool[2]?.id || "cr_nia", score: 94, reason: "Proven track record with local business collateral and digital design." },
        ],
        followUps,
      };
    }

    const scopeData = parsed?.scope || {};
    const coins = Math.max(1, Number(scopeData.coins) || 2);

    // Map matched creative IDs back to full pool
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

    // Fill up to 3 if fewer
    for (const c of pool) {
      if (matchedCreatives.length >= 3) break;
      if (!matchedCreatives.some((m) => m.id === c.id)) {
        matchedCreatives.push(c);
      }
    }

    return NextResponse.json({
      answer:
        parsed.answer ||
        "Peach Match AI scoped your project. Here is your commercial scope, price breakdown, and 3 vetted creative matches.",
      companionInsight: parsed.companionInsight || "We are here to support your business every step of the way!",
      clarification: parsed.clarification || null,
      scope: {
        title: scopeData.title || "Custom Commercial Design Project",
        category: scopeData.category || "Design",
        serviceKey: scopeData.serviceKey || "social_graphic",
        coins,
        usdAmount: coins * 50,
        deliverables:
          Array.isArray(scopeData.deliverables) && scopeData.deliverables.length > 0
            ? scopeData.deliverables
            : ["Production-ready commercial assets", "Full commercial usage rights"],
        estimatedTurnaround: scopeData.estimatedTurnaround || (coins > 5 ? "5–7 business days" : "2–4 business days"),
        revisionRounds: scopeData.revisionRounds || 3,
        reason: scopeData.reason || `Priced at ${coins} Peach Coins ($${coins * 50} USD) based on commercial scope.`,
      },
      matchedCreatives: matchedCreatives.slice(0, 3),
      followUps:
        Array.isArray(parsed.followUps) && parsed.followUps.length > 0
          ? parsed.followUps.slice(0, 3)
          : [
              "What file formats will I receive?",
              "Why do I need 3 logos instead of just one?",
              "How does the 24-hour creative acceptance work?",
            ],
    });
  } catch (err: any) {
    console.warn("AI Consult safe fallback:", err?.message || err);
    return NextResponse.json({
      answer:
        "Peach Match AI scoped your request! In our creative network, 1 Peach Coin equals $50.00 USD of vetted studio work, including 2 revision rounds and full commercial rights.",
      companionInsight: "We are right here with you! Tell us more details anytime to adjust your scope.",
      clarification: null,
      scope: {
        title: "Commercial Creative Design Project",
        category: "Design",
        serviceKey: "social_graphic",
        coins: 2,
        usdAmount: 100,
        deliverables: ["Production-ready commercial assets", "Full commercial usage rights release"],
        estimatedTurnaround: "2–4 business days",
        revisionRounds: 3,
        reason: "Priced at 2 Peach Coins ($100 USD) based on standard commercial deliverables.",
      },
      matchedCreatives: APPROVED_CREATIVES_FALLBACK.slice(0, 3),
      followUps: [
        "What file formats will I receive?",
        "Why do I need 3 logos instead of just one?",
        "How does the 24-hour creative acceptance work?",
      ],
    });
  }
}
