export const PEACH_COIN_USD_RATE = 50;

export interface CatalogTierOption {
  id: "option_a" | "option_b" | "option_c";
  tierName: string;
  coins: number;
  usdEquivalent: number;
  typicalTurnaround: string;
  deliverables: string[];
  scopeSummary: string;
  requiredFromBusiness: string[];
  bestFor: string;
}

export interface CatalogAddOn {
  name: string;
  coins: number;
  usdEquivalent: number;
  note?: string;
}

export interface MasterServiceCategory {
  id: string;
  title: string;
  categoryTag: string;
  guaranteeNote: string;
  options: {
    option_a: CatalogTierOption;
    option_b: CatalogTierOption;
    option_c: CatalogTierOption;
  };
  addOns: CatalogAddOn[];
}

export const MASTER_2026_CATALOG: Record<string, MasterServiceCategory> = {
  website_design: {
    id: "website_design",
    title: "Website Design",
    categoryTag: "Website",
    guaranteeNote:
      "All website builds include a live preview staging link for review and 100% administrative site ownership transfer to the business upon project completion.",
    options: {
      option_a: {
        id: "option_a",
        tierName: "Option A: Landing Page / Conversion Hub",
        coins: 10,
        usdEquivalent: 500,
        typicalTurnaround: "5–7 Business Days",
        scopeSummary: "1 high-converting responsive desktop & mobile page built in Webflow, Squarespace, Framer, or Figma.",
        deliverables: [
          "1 high-converting responsive desktop & mobile page",
          "Hero section, value pillars, social proof, and contact/lead capture form",
          "Built in Webflow, Squarespace, Framer, or Figma",
          "Custom domain hookup + full ownership transfer",
        ],
        requiredFromBusiness: [
          "Headline, mission, & core service list",
          "Logo files & brand color preferences",
          "Photos or preferred stock imagery selection",
        ],
        bestFor: "Single-product launches, service lead capture, or businesses needing a fast, credible digital storefront.",
      },
      option_b: {
        id: "option_b",
        tierName: "Option B: Standard Multi-Page Business Site (3–5 Pages)",
        coins: 18,
        usdEquivalent: 900,
        typicalTurnaround: "8–12 Business Days",
        scopeSummary: "Up to 5 custom responsive pages (Home, About, Services, Gallery, Contact) with SEO and interactive components.",
        deliverables: [
          "Up to 5 custom responsive pages (Home, About, Services, Gallery, Contact)",
          "Mobile responsive breakpoints & interactive components",
          "Basic on-page SEO setup & contact form routing",
          "Live staging link + 100% administrative site transfer",
        ],
        requiredFromBusiness: [
          "Written copy/text for each page (or bullet points for creative layout)",
          "Team photos or company photography assets",
          "Domain registrar / hosting login access",
        ],
        bestFor: "Established local service businesses, medical/wellness clinics, law firms, and consulting practices.",
      },
      option_c: {
        id: "option_c",
        tierName: "Option C: Advanced Retail E-Commerce or Restaurant Hub",
        coins: 26,
        usdEquivalent: 1300,
        typicalTurnaround: "12–16 Business Days",
        scopeSummary: "Full 5–8 page architecture on Shopify or Webflow with product variants or interactive menus and ordering.",
        deliverables: [
          "Full 5–8 page architecture on Shopify, Webflow, or custom platform",
          "Retail/Apparel: Product detail pages, size/variant selectors, zoom gallery, cart drawer",
          "Restaurant/Hospitality: Categorized interactive food & drink menu, table reservation integration, online ordering links",
          "Full ownership transfer + Brand Vault backup",
        ],
        requiredFromBusiness: [
          "Product catalog with high-res product photos, variants (sizes/colors), & pricing",
          "For restaurants: Full categorized food & drink menu with dietary badges & prices",
          "Stripe/Square merchant processor or payment gateway login",
        ],
        bestFor: "Apparel brands, footwear retailers, artisan goods, high-volume restaurants, cafes, and multi-location venues.",
      },
    },
    addOns: [
      { name: "Extra Page / Section", coins: 3, usdEquivalent: 150, note: "Adds 1–2 days" },
      { name: "Designer Sources Commercial Stock Photos", coins: 2, usdEquivalent: 100 },
      { name: "Custom Color Palette & Typography Tokens", coins: 4, usdEquivalent: 200 },
      { name: "On-Location Photographer Pairing", coins: 10, usdEquivalent: 500, note: "10 to 12 Coins" },
      { name: "Rush Delivery (3 days faster)", coins: 4, usdEquivalent: 200 },
    ],
  },

  branding_design: {
    id: "branding_design",
    title: "Branding Design",
    categoryTag: "Brand & Illustration",
    guaranteeNote:
      "All branding projects include commercial usage rights and master vector files stored in the client’s Brand Vault.",
    options: {
      option_a: {
        id: "option_a",
        tierName: "Option A: Core Logo & Vector Kit",
        coins: 4,
        usdEquivalent: 200,
        typicalTurnaround: "3–4 Business Days",
        scopeSummary: "Primary logo design + secondary icon mark with full scalable vector exports (.AI, .SVG, .EPS, .PNG).",
        deliverables: [
          "Primary logo design + secondary icon mark",
          "100% scalable vector artwork (.AI, .SVG, .EPS, .PNG)",
          "CMYK print and RGB digital color specifications",
          "Full commercial ownership rights",
        ],
        requiredFromBusiness: [
          "Company name, tagline (if any), and core industry",
          "Target audience & 2–3 visual reference links or aesthetic examples",
        ],
        bestFor: "Startups and early ventures needing a clean, professional vector mark to put on merchandise, signage, or invoices.",
      },
      option_b: {
        id: "option_b",
        tierName: "Option B: Brand Identity Starter & Brand Sheet",
        coins: 6,
        usdEquivalent: 300,
        typicalTurnaround: "4–5 Business Days",
        scopeSummary: "Primary logo, secondary mark, sub-marks, plus 1-Page Master Brand Sheet with colors and typography pairings.",
        deliverables: [
          "Primary logo, secondary mark, and sub-marks",
          "1-Page Master Brand Sheet: Primary/secondary color palette (Hex, RGB, CMYK), typography pairings (Header, Subhead, Body), and logo clearspace rules",
          "Master vector source files + Brand Vault sync",
        ],
        requiredFromBusiness: [
          "Brand mission statement or tone of voice (e.g. bold, earthy, luxury, playful)",
          "Competitor names and what makes your business distinctive",
        ],
        bestFor: "Growing businesses seeking total visual consistency across their social channels, website, and physical collateral.",
      },
      option_c: {
        id: "option_c",
        tierName: "Option C: Full Commercial Brand Identity Overhaul",
        coins: 12,
        usdEquivalent: 600,
        typicalTurnaround: "7–10 Business Days",
        scopeSummary: "Complete visual identity overhaul with 4 logo variations, typography system, stationery suite, and 12-page brand guidelines.",
        deliverables: [
          "Complete visual identity overhaul for scaling brands",
          "Primary, secondary, horizontal, and vertical logo variations",
          "Full typography system & custom color palette (Pantone, CMYK, RGB, HEX)",
          "Stationery suite (business card, letterhead) + social avatar kit",
          "12-Page Commercial Brand Guidelines PDF",
        ],
        requiredFromBusiness: [
          "Detailed creative brief questionnaire response",
          "Current brand assets, sketches, or historical collateral",
          "Active stakeholder participation for 2 milestone review rounds",
        ],
        bestFor: "Companies rebranding, civic institutions, regional hospitality groups, and venture-backed startups preparing to scale.",
      },
    },
    addOns: [
      { name: "Vector Clean-up / Redraw (Client has sketch or low-res file)", coins: 2, usdEquivalent: 100 },
      { name: "Social Media Profile & Banner Kit", coins: 2, usdEquivalent: 100 },
      { name: "Apparel / Merch Vector Formatting", coins: 2, usdEquivalent: 100 },
    ],
  },

  commercial_photography: {
    id: "commercial_photography",
    title: "Commercial Photography",
    categoryTag: "Photography",
    guaranteeNote:
      "All photography packages include commercial licensing, color grading, and final delivery via secure Google Drive link and Brand Vault.",
    options: {
      option_a: {
        id: "option_a",
        tierName: "Option A: Executive & Creative Portrait Session",
        coins: 6,
        usdEquivalent: 300,
        typicalTurnaround: "3–5 Business Days",
        scopeSummary: "1-Hour session on location or in studio with mobile lighting and 5 retouched, color-graded master portraits.",
        deliverables: [
          "1-Hour session on location or in studio",
          "Professional mobile lighting setup",
          "5 fully retouched, color-graded master portraits",
          "High-res print & web-optimized files delivered via Drive & Brand Vault",
        ],
        requiredFromBusiness: [
          "Wardrobe selection (2 outfits recommended)",
          "Location approval / access permission",
          "Key person availability for the 1-hour session",
        ],
        bestFor: "Founders, executives, creative directors, realtors, attorneys, and team leadership bios.",
      },
      option_b: {
        id: "option_b",
        tierName: "Option B: Product Tabletop Session (Footwear / Retail)",
        coins: 10,
        usdEquivalent: 500,
        typicalTurnaround: "5–7 Business Days",
        scopeSummary: "Studio tabletop shoot for up to 5 physical products with detail close-ups, clean white cutouts, and 15 retouched images.",
        deliverables: [
          "Studio tabletop shoot for up to 5 physical products (shoes, apparel, bottles, artisan items)",
          "Multiple angles, detail close-ups, and clean white e-commerce cutouts",
          "15 retouched commercial images delivered via Drive & Brand Vault",
        ],
        requiredFromBusiness: [
          "Physical product samples delivered/shipped in pristine, unblemished condition",
          "Shot list or required angles (front, side, hero, sole, label close-ups)",
        ],
        bestFor: "Shoe companies, apparel boutiques, craft cosmetics, bottled beverages, and Amazon/Shopify storefronts.",
      },
      option_c: {
        id: "option_c",
        tierName: "Option C: On-Location Restaurant, Culinary & Brand Shoot",
        coins: 12,
        usdEquivalent: 600,
        typicalTurnaround: "5–7 Business Days",
        scopeSummary: "2-Hour on-location shoot at your venue/restaurant with 10 styled dishes, dining room action, and 20 retouched photos.",
        deliverables: [
          "2-Hour on-location shoot at your venue/restaurant",
          "10 signature plated dishes styled under professional lighting",
          "Dining room atmosphere, bar action, and kitchen/chef shots",
          "20 retouched, color-graded commercial photos delivered via Drive",
        ],
        requiredFromBusiness: [
          "Designated 2-hour shoot window during non-peak or kitchen prep hours",
          "Kitchen staff ready to prepare and fresh-plate signature dishes on cue",
          "Cleaned, staged dining room and bar area",
        ],
        bestFor: "Bistros, bars, bakeries, coffee shops, fine dining restaurants, and catering services.",
      },
    },
    addOns: [
      { name: "Half-Day Brand Extension (4 hours total, 40+ photos)", coins: 8, usdEquivalent: 400 },
      { name: "Additional Retouched Photos", coins: 1, usdEquivalent: 50, note: "Per 3 additional images" },
      { name: "Travel Beyond 30 Miles", coins: 2, usdEquivalent: 100, note: "Travel fee" },
    ],
  },

  social_media: {
    id: "social_media",
    title: "Social Media Design",
    categoryTag: "Design",
    guaranteeNote:
      "Delivered in editable format with export-ready files for Instagram, TikTok, LinkedIn, and Facebook.",
    options: {
      option_a: {
        id: "option_a",
        tierName: "Option A: Social Campaign Launch Pack (4 Posts)",
        coins: 3,
        usdEquivalent: 150,
        typicalTurnaround: "2–3 Business Days",
        scopeSummary: "4 coordinated static feed designs (1:1 Square) + 9:16 Story formats with editable source files.",
        deliverables: [
          "4 coordinated static feed designs (1:1 Square) + 9:16 Story formats",
          "Promo drops, event announcements, or testimonial features",
          "Fully layered editable source files (Photoshop, Figma, or Canva)",
        ],
        requiredFromBusiness: [
          "Headlines, dates, promotional offer details, or discount codes",
          "High-res brand logo files & product imagery",
        ],
        bestFor: "Flash sales, seasonal promotions, speaker/event announcements, and new service reveals.",
      },
      option_b: {
        id: "option_b",
        tierName: "Option B: High-Converting Multi-Slide Carousel Drop",
        coins: 4,
        usdEquivalent: 200,
        typicalTurnaround: "3–4 Business Days",
        scopeSummary: "1 seamless multi-slide educational or product carousel (6–8 slides) with hook slide, CTA slide, and caption copy.",
        deliverables: [
          "1 seamless multi-slide educational or product carousel (6–8 slides)",
          "Visual storytelling layout with custom hook slide and CTA slide",
          "Includes suggested caption copy & hashtag framework",
        ],
        requiredFromBusiness: [
          "Core topic, bullet points, educational steps, or story outline",
          "Brand typography preferences and target reader demographic",
        ],
        bestFor: "Industry authorities, B2B consultants, fitness coaches, educational creators, and thought leaders.",
      },
      option_c: {
        id: "option_c",
        tierName: "Option C: Monthly Social Suite + Video Reels / Motion Teasers",
        coins: 8,
        usdEquivalent: 400,
        typicalTurnaround: "5–7 Business Days",
        scopeSummary: "12 custom branded assets for a 30-day content calendar, including 2 animated video reels (15–30s) and templates.",
        deliverables: [
          "12 custom branded assets scheduled for a 30-day content calendar",
          "Includes 2 animated motion video teasers / reel covers (15–30s)",
          "Feed, carousel, and story templates aligned to your Brand Sheet",
        ],
        requiredFromBusiness: [
          "Monthly marketing themes, holidays, or business milestones to highlight",
          "Raw video clips, photos, or audio voiceovers to integrate",
        ],
        bestFor: "Brands seeking consistent, daily visual presence with motion content on Instagram, TikTok, and LinkedIn.",
      },
    },
    addOns: [
      { name: "Standalone Animated Video Reel / Motion Graphic", coins: 3, usdEquivalent: 150 },
      { name: "Monthly Content Calendar Planning Sheet", coins: 2, usdEquivalent: 100 },
    ],
  },

  graphic_design: {
    id: "graphic_design",
    title: "Graphic Design",
    categoryTag: "Design",
    guaranteeNote:
      "Print deliverables are pre-flighted at 300 DPI CMYK with standard 0.125\" bleeds.",
    options: {
      option_a: {
        id: "option_a",
        tierName: "Option A: Quick Task / Minor Graphic Revision",
        coins: 1,
        usdEquivalent: 50,
        typicalTurnaround: "1–2 Business Days",
        scopeSummary: "Business card layout, social header refresh, or quick text/price update on existing artwork with 300 DPI PDF.",
        deliverables: [
          "Business card layout, social header refresh, or quick text/price update on existing artwork",
          "300 DPI print-ready PDF + web PNG",
        ],
        requiredFromBusiness: [
          "Existing design files (.AI, .PSD, or high-res PDF) or clean vector logo",
          "Exact text/contact info/price changes to implement",
        ],
        bestFor: "Quick adjustments, employee card updates, seasonal hours updates, or single graphic fixes.",
      },
      option_b: {
        id: "option_b",
        tierName: "Option B: Commercial Event / Promo Flyer Launch Kit",
        coins: 2,
        usdEquivalent: 100,
        typicalTurnaround: "2–3 Business Days",
        scopeSummary: "High-impact single or double-sided event flyer with 1:1 feed, 9:16 story, and 300 DPI print PDF with bleeds.",
        deliverables: [
          "High-impact single or double-sided event flyer",
          "1:1 feed square + 9:16 story digital formats + 300 DPI print-ready PDF with bleed",
          "Clean photo integration, high-contrast headline hierarchy, and QR code placement",
        ],
        requiredFromBusiness: [
          "Event date, time, venue address, and ticketing / RSVP link (or QR code)",
          "1–2 high-res photos or headshots, plus sponsor logo files",
        ],
        bestFor: "Concerts, pop-up markets, corporate galas, charity banquets, club events, and festival announcements.",
      },
      option_c: {
        id: "option_c",
        tierName: "Option C: Multi-Page Menu, Brochure or Packaging Die-Line",
        coins: 6,
        usdEquivalent: 300,
        typicalTurnaround: "4–6 Business Days",
        scopeSummary: "Up to 4-page folded menu/brochure OR complete packaging die-line (box, label, pouch) with 3D digital mockup.",
        deliverables: [
          "Up to 4-page folded menu/brochure OR complete packaging die-line (box, label, pouch, bottle wrap)",
          "Press-ready CMYK with bleeds, spot colors, foil stamp specifications",
          "3D digital mockup for website and marketing preview",
        ],
        requiredFromBusiness: [
          "Printer dieline template specifications (width, height, bleed, crease lines)",
          "Finalized proofread copy/text, nutrition/ingredient panel if food/cosmetics",
          "Vector logos and brand colors",
        ],
        bestFor: "Restaurant food/drink menus, retail product packaging boxes, cosmetic labels, coffee bags, and tri-fold brochures.",
      },
    },
    addOns: [
      { name: "Extra Revision Round (Beyond included 3)", coins: 1, usdEquivalent: 50 },
      { name: "Rush Delivery (24-Hour Turnaround)", coins: 2, usdEquivalent: 100 },
    ],
  },
};

// Creative Direction & Pod Supervision Rates
export const CREATIVE_DIRECTION_GUIDE = {
  consultation: {
    label: "1-on-1 Creative Direction Consultation",
    coins: 2,
    usdEquivalent: 100,
    deliverables: ["45-minute scoping & art direction strategy call", "Written creative brief sheet & moodboard checklist"],
  },
  podSupervision: {
    label: "Creative Pod Supervision",
    note: "Included free on projects over 20 Peach Coins ($1,000 USD).",
    thresholdCoins: 20,
  },
};

// Backward compatibility map
export const SERVICE_GUIDE = {
  social_graphic: { label: "Social Media Graphic", min: 1, max: 3, category: "social_media", defaultTier: "option_a" },
  flyer: { label: "Flyer / Event Promo Kit", min: 2, max: 2, category: "graphic_design", defaultTier: "option_b" },
  business_card: { label: "Business Card / Quick Revision", min: 1, max: 1, category: "graphic_design", defaultTier: "option_a" },
  banner: { label: "Banner / Signage", min: 2, max: 4, category: "graphic_design", defaultTier: "option_b" },
  carousel: { label: "Carousel (6–8 slides)", min: 4, max: 4, category: "social_media", defaultTier: "option_b" },
  newsletter: { label: "Email / Newsletter Design", min: 2, max: 3, category: "social_media", defaultTier: "option_a" },
  brochure: { label: "Multi-Page Brochure / Menu / Packaging", min: 6, max: 6, category: "graphic_design", defaultTier: "option_c" },
  presentation: { label: "Presentation Design", min: 4, max: 6, category: "graphic_design", defaultTier: "option_c" },
  small_web_update: { label: "Small Website Update", min: 2, max: 4, category: "website_design", defaultTier: "option_a" },
  landing_page: { label: "Landing Page / Conversion Hub", min: 10, max: 10, category: "website_design", defaultTier: "option_a" },
  homepage_refresh: { label: "Multi-Page Website (3–5 Pages)", min: 18, max: 18, category: "website_design", defaultTier: "option_b" },
  multipage_refresh: { label: "E-Commerce or Restaurant Hub", min: 26, max: 26, category: "website_design", defaultTier: "option_c" },
  logo_refresh: { label: "Core Logo & Vector Kit", min: 4, max: 4, category: "branding_design", defaultTier: "option_a" },
  new_logo: { label: "Brand Identity Starter & Brand Sheet", min: 6, max: 6, category: "branding_design", defaultTier: "option_b" },
  illustration: { label: "Full Commercial Brand Overhaul", min: 12, max: 12, category: "branding_design", defaultTier: "option_c" },
  simple_reel: { label: "Social Campaign Launch Pack (4 Posts)", min: 3, max: 3, category: "social_media", defaultTier: "option_a" },
  advanced_video: { label: "High-Converting Carousel Drop", min: 4, max: 4, category: "social_media", defaultTier: "option_b" },
  motion_graphic: { label: "Monthly Social Suite + Video Reels", min: 8, max: 8, category: "social_media", defaultTier: "option_c" },
  logo_animation: { label: "Animated Video Reel / Motion Graphic", min: 3, max: 3, category: "social_media", defaultTier: "option_c" },
  promo_video: { label: "Executive / Creative Portrait Session", min: 6, max: 6, category: "commercial_photography", defaultTier: "option_a" },
  mini_photo: { label: "Product Tabletop Session (Footwear/Retail)", min: 10, max: 10, category: "commercial_photography", defaultTier: "option_b" },
  brand_photo: { label: "On-Location Restaurant & Brand Shoot", min: 12, max: 12, category: "commercial_photography", defaultTier: "option_c" },
} as const;

export function recommendCoins(serviceKey: keyof typeof SERVICE_GUIDE, complexity: "standard" | "expanded" = "standard") {
  const item = SERVICE_GUIDE[serviceKey];
  return complexity === "expanded" ? item.max : item.min;
}

export function requiresManualScope(coins: number) {
  return coins >= 30;
}

export function findCategoryByKeywords(query: string): MasterServiceCategory {
  const q = (query || "").toLowerCase();
  if (/(website|web site|landing page|storefront|shopify|squarespace|webflow|framer|ecommerce|e-commerce|web page)/.test(q)) {
    return MASTER_2026_CATALOG.website_design;
  }
  if (/(photo|headshot|portrait|tabletop|culinary shoot|food photography|camera|studio shoot)/.test(q)) {
    return MASTER_2026_CATALOG.commercial_photography;
  }
  if (/(social|carousel|instagram|tiktok|reel|story|post|content calendar)/.test(q)) {
    return MASTER_2026_CATALOG.social_media;
  }
  if (/(logo|branding|brand identity|brand sheet|brandmark|rebrand|vector kit)/.test(q)) {
    return MASTER_2026_CATALOG.branding_design;
  }
  return MASTER_2026_CATALOG.graphic_design;
}
