import { NextResponse } from "next/server";
import { safeGenerateContent, ThinkingLevel } from "@/lib/gemini";

export interface SoftwareRecommendation {
  name: string;
  purpose: string;
  proTip: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  role: string;
}

export interface FontPairing {
  headline: string;
  subhead: string;
  body: string;
  notes?: string;
}

export async function POST(req: Request) {
  try {
    const { message, category, history } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Please enter a design question or topic." }, { status: 400 });
    }

    const trimmed = message.trim();
    const lower = trimmed.toLowerCase();

    // Check if the user is asking the AI to directly execute/do the project for them
    const isDirectExecutionRequest =
      lower.includes("do it for me") ||
      lower.includes("make it for me") ||
      lower.includes("create this for me") ||
      lower.includes("design this for me") ||
      lower.includes("design the flyer for me") ||
      lower.includes("design my flyer") ||
      lower.includes("design my logo") ||
      lower.includes("make the whole website") ||
      lower.includes("do my project") ||
      lower.includes("build this for me");

    const systemInstruction = `You are the Agency Creative Director at Sweet As A Peach Creative Agency in Birmingham, Alabama.
You serve as the senior creative director, executive design mentor, and technical art director for freelance commercial designers, web designers, brand identity creators, motion animators, and photographers on the Peach Network.

YOUR CORE CREATIVE DIRECTOR MANDATE & BOUNDARY:
- You act like a seasoned commercial agency Creative Director: knowledgeable, sharp, encouraging, discerning, and production-savvy.
- CRITICAL BOUNDARY: You CANNOT and MUST NOT do the project for them.
- If a creative or client asks you to "design my flyer", "make this logo for me", "build my whole website", "write the full copy for the site", or generate completed client deliverables:
  * You MUST politely and firmly establish your role as Creative Director:
    "As your Creative Director, my job is to direct, critique, unblock, and elevate your craft—not execute the production for you. You're the designer! You hold the mouse and keyboard. What I can do is break down the exact layout grid, recommend the best industry software, give you color palettes, font pairings, and a step-by-step production checklist so you can execute a stunning deliverable yourself."
  * You set "isExecutionRefusal": true in the JSON response.
  * You then provide high-value art direction, software recommendations, step-by-step production action steps, and layout blueprints so they have everything they need to execute it themselves.

YOUR AREAS OF DEEP CREATIVE EXPERTISE:
1. COMMERCIAL FLYER & POSTER LAYOUTS:
   - Visual hierarchy rules: The 3-second rule (1. What is the event/headline? 2. Who is featured? 3. Date, venue, and tickets).
   - 30-40-25-5 layout grid: Top 30% hook & headline, Middle 40% hero subject cutout with back rim-light, Lower 25% high-contrast event details/tickets, Bottom 5% sponsors & fine print.
   - Contrast management: Darken or gradient-map the lower 30% of your background canvas so date/ticket text remains 100% legible.

2. PHOTO CHOPPING & SUBJECT CLIPPING:
   - Step-by-step Photoshop workflow:
     a) Select Subject + Select and Mask (radius 1–2px, refine hair brush).
     b) Pen Tool (P) for crisp geometric edges (collars, jawlines, weapons, gear).
     c) De-fringing: Contract mask selection by 1.0–1.5 px or use Filter > Other > Minimum (1.0px) to kill halo fringes.
     d) Color decontamination: Clip an empty layer set to 'Color' blending mode and paint over hair tips with the natural hair color.
     e) Atmospheric Rim Lighting: Create a clipped layer set to 'Linear Dodge (Add)' or 'Screen', sample the background accent glow, and brush soft edges (15% Flow).

3. SOFTWARE & TOOL ARSENAL:
   - Provide concrete software recommendations tailored to their problem:
     * Figma: Auto-layout, nested responsive components, 8pt grid system, variant states, tokenized typography, developer handoff.
     * Adobe Illustrator: Shape Builder tool, Live Paint, Pathfinder, Spot Colors, CMYK separations, Astute Graphics vector plugins.
     * Adobe Photoshop: Advanced layer masks, Frequency Separation for skin retouching, Curves adjustment layers, High Pass sharpening, Smart Objects.
     * Adobe InDesign: Master pages, multi-page menu engineering, paragraph/character styles, packaging press bleeds (0.125"), PDF/X-1a export.
     * Blender / Pacdora: 3D box dielines, beverage can & bottle 3D mockups, UV unwrapping, photorealistic lighting setups.
     * Adobe After Effects: Graph Editor easing curves, motion typography, track mattes, audio sync markers, Boris FX / Motion Bro.
     * Topaz Gigapixel AI: Cleanly upscaling low-resolution client logo assets.

4. COLOR PALETTES & HARMONY:
   - Always supply 5 exact HEX codes with descriptive names and designated 60-30-10 roles (60% canvas, 30% structure, 10% high-energy accent).
   - CMYK vs RGB print warnings: Rich black (C:60 M:40 Y:40 K:100) vs pure black, avoiding out-of-gamut neon blues/greens for print.

5. FONT PAIRINGS & TYPOGRAPHIC HIERARCHY:
   - Recommend authentic commercial display + subhead + body combinations (e.g. Bebas Neue + Montserrat + Inter; Playfair Display + Outfit; Clash Display + Satoshi).

6. PRE-FLIGHT PRESS SPECS:
   - 300 DPI at 100% physical scale.
   - 0.125 inch (1/8") outer bleeds on all 4 sides.
   - 0.25 inch safety margin for all live text and critical icons.
   - Convert all type to vector outlines (Ctrl/Cmd+Shift+O) before press export.

RESPONSE FORMAT (STRICT JSON ONLY):
{
  "answer": "Warm, authoritative, articulate Creative Director response with structured headings and numbered guidance.",
  "isExecutionRefusal": boolean,
  "creativeDirectorNote": "A memorable 1-sentence Creative Director art direction rule or motto.",
  "recommendedSoftwares": [
    {
      "name": "Software name (e.g., Adobe Photoshop, Figma, Blender, InDesign)",
      "purpose": "What specific part of this project this software handles best",
      "proTip": "Concrete tool shortcut or advanced trick in this software"
    }
  ],
  "actionableSteps": [
    "Step 1: Open [Software] and set canvas to...",
    "Step 2: Build the visual grid with...",
    "Step 3: Execute the photo chopping by..."
  ],
  "colorPalette": [
    { "name": "Deep Charcoal Canvas", "hex": "#12141C", "role": "60% Dominant Background" },
    { "name": "Peach Ember", "hex": "#EB6244", "role": "10% High-Energy Accent & CTA" },
    { "name": "Golden Hour", "hex": "#F3A93B", "role": "30% Structural Secondary / Badges" },
    { "name": "Crisp Milk White", "hex": "#FAF8F5", "role": "High-Contrast Copy & Details" },
    { "name": "Evergreen Studio", "hex": "#173328", "role": "Anchor Borders & Badges" }
  ],
  "fontPairing": {
    "headline": "Bebas Neue (Heavy All-Caps)",
    "subhead": "Montserrat (Semi-Bold Tracking +60)",
    "body": "Inter (Clean Regular, 140% line-height)",
    "notes": "High contrast pairing engineered for instant readability at mobile and billboard scale."
  },
  "assetKeywords": [
    "torn paper edges png",
    "golden rim lighting glow overlay",
    "smoke fog texture transparent"
  ],
  "quickTips": [
    "Always darken the lower 30% of your canvas to guarantee date & ticket readability.",
    "Contract your layer mask by 1.5px to kill ugly color halos from client photos.",
    "Export print proofs with 0.125 inch bleed and crop marks via PDF/X-1a."
  ],
  "followUps": [
    "What is the best way to cut out curly hair in Photoshop without blurry edges?",
    "How do I set up a 0.125\" bleed in Illustrator vs Photoshop?",
    "Which software should I use for a 3D packaging mockup?"
  ]
}`;

    const prompt = `CREATIVE INQUIRY / PROJECT ASSISTANCE:
"""${trimmed}"""
FOCUS CATEGORY: ${category || "Creative Director Art Direction"}

RECENT CHAT HISTORY:
${JSON.stringify(history || [])}

Provide your Creative Director response in strictly valid JSON matching the format described.`;

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
        console.warn("Gemini Studio AI fallback:", modelErr);
      }
    }

    // High-Fidelity Local Domain Creative Director Fallback Engine
    if (!parsed || !parsed.answer) {
      const q = lower;

      let answer = "";
      let isExecutionRefusal = isDirectExecutionRequest;
      let creativeDirectorNote = "A great designer doesn't just make things look pretty; they command the viewer's eye in under 3 seconds.";
      let recommendedSoftwares: SoftwareRecommendation[] = [
        {
          name: "Adobe Photoshop",
          purpose: "Photo manipulation, clean subject clipping, and atmospheric lighting overlays.",
          proTip: "Use Select Subject + Select & Mask with Refine Hair brush, then contract selection by 1.5px to kill halos.",
        },
        {
          name: "Adobe Illustrator",
          purpose: "Vector typography styling, sponsor logo vectorization, and press-ready packaging dielines.",
          proTip: "Use the Shape Builder Tool (Shift+M) to merge custom geometric letterforms cleanly.",
        },
        {
          name: "Figma",
          purpose: "Rapid layout wireframing, responsive mobile UI breakpoints, and client review prototypes.",
          proTip: "Set up an 8pt layout grid with Auto-Layout (Shift+A) for rock-solid spacing consistency.",
        },
      ];
      let actionableSteps = [
        "Audit the client's raw assets and determine which photos need clipping and resolution enhancement.",
        "Set up your master canvas with standard 300 DPI resolution and 0.125\" outer bleed margins.",
        "Block out visual hierarchy using the 30-40-25-5 layout grid before adding decorative effects.",
        "Test color contrast by toggling a black & white adjustment layer to verify values read in grayscale.",
      ];
      let colorPalette: ColorSwatch[] = [
        { name: "Deep Obsidian", hex: "#11141C", role: "60% Dominant Canvas" },
        { name: "Peach Radiant", hex: "#EB6244", role: "10% High-Energy Accent" },
        { name: "Golden Amber", hex: "#F5AB35", role: "30% Structural Secondary" },
        { name: "Crisp Warm White", hex: "#FAF8F5", role: "High-Contrast Copy" },
        { name: "Studio Evergreen", hex: "#173328", role: "Borders & Badges" },
      ];
      let fontPairing: FontPairing = {
        headline: "Bebas Neue (Heavy All-Caps)",
        subhead: "Montserrat (Semi-Bold Tracking +80)",
        body: "Inter (Regular, 140% line-height)",
        notes: "Timeless commercial duo balancing commanding impact with razor-sharp readability.",
      };
      let assetKeywords = [
        "dramatic rim light png",
        "gold glitter sparks transparent",
        "grunge textured overlay",
        "chrome 3d lettering",
      ];
      let quickTips = [
        "Keep your focal point clear: give the viewer's eye one obvious place to land first.",
        "Always design event flyers with a 0.125” bleed margin if there is any chance of print.",
        "Use the 60-30-10 color rule: 60% dominant canvas, 30% structural secondary, 10% high-contrast accent.",
      ];
      let followUps = [
        "How do I cleanly chop out 5-6 people in Photoshop without white edge halos?",
        "What are the best font pairings for a luxury restaurant menu?",
        "What software is best for creating 3D product and packaging mockups?",
      ];

      // CASE 1: DIRECT "DO IT FOR ME" REFUSAL & EMPOWERMENT
      if (isDirectExecutionRequest) {
        answer =
          "### ⚠️ Creative Director Policy: Guidance & Art Direction (You're the Designer!)\n\n" +
          "As your Creative Director, **I can't do the project for you or generate your final deliverables**. You are the creative professional hired for your unique talent and human touch!\n\n" +
          "My job is to **unblock you, critique your drafts, recommend the best industry software, and give you the structural blueprint** so you can crush the project yourself.\n\n" +
          "Here is your exact game plan to execute this deliverable flawlessly:\n\n" +
          "1. **Software Stack:** Use Adobe Photoshop for photo clipping and visual FX, Adobe Illustrator for vector logos and typography, or Figma for digital/UI layouts.\n" +
          "2. **Canvas Setup:** If print: 300 DPI, CMYK color mode, with 0.125\" bleeds. If digital: 1080×1350 (4:5 portrait) or 1080×1920 (9:16 vertical) in RGB.\n" +
          "3. **Visual Grid:** Follow the 3-Second Rule. Top 30% for your headline hook, Middle 40% for your hero cutout, Lower 25% for high-contrast details, Bottom 5% for sponsor logos.\n" +
          "4. **Feedback & Review:** Bring me your rough concept draft or ask me specific technical questions (like photo clipping, font pairing, or color balance) and I'll review it!";
        creativeDirectorNote = "I direct the vision, you hold the tools. Let's make this piece unforgettable.";
        actionableSteps = [
          "Choose your primary tool (Photoshop for layered composite, Illustrator for vector branding, Figma for web).",
          "Create a new document with 0.125\" bleeds (for print) or 1080×1350 px (for social).",
          "Lay down your background gradient and hero subject position before touching any typography.",
          "Add headline copy in all-caps display type, tracking +40, and check legibility from 6 feet away.",
        ];
      }
      // CASE 2: PHOTO CHOPPING & SUBJECT CLIPPING
      else if (q.includes("chop") || q.includes("cutout") || q.includes("mask") || q.includes("pen tool") || q.includes("halo") || q.includes("fringe")) {
        answer =
          "### ✂️ Photo Chopping Masterclass: 5-6 Subject Compositing Without Halos\n\n" +
          "When compositing multiple people onto a dark event flyer, messy edge halos and background color bleed will instantly ruin your piece. Here is the agency-grade workflow:\n\n" +
          "#### 1. Software & Tool Selection:\n" +
          "- **Adobe Photoshop**: Use **Pen Tool (P)** for hard edges (shoulders, leather jackets, chains, hats). The Pen Tool creates vector-crisp lines that automatic selection tools can never match.\n" +
          "- For hair: Use **Select Subject** → click **Select & Mask** in the options bar. Use the **Refine Edge Brush Tool (R)** at 50% hardness to brush gently over stray hairs.\n\n" +
          "#### 2. Kill the Color Halo (De-fringing):\n" +
          "- In your Layer Mask properties, set **Shift Edge to -15%** or contract your selection by 1.5 pixels before applying the mask. This trims the 1-pixel background color contamination.\n" +
          "- Create a new layer clipped directly to your cutout (`Ctrl+Alt+G` / `Cmd+Opt+G`). Set the blending mode to **Color**. Sample the person's true hair color with the Eyedropper (I), and use a soft brush (20% Opacity) to paint over edge fringes. The background halo vanishes!\n\n" +
          "#### 3. Match Ambient Rim Lighting:\n" +
          "- People look pasted-on when their lighting doesn't match the background glow. Create a clipped layer set to **Linear Dodge (Add)** or **Screen**.\n" +
          "- Sample your flyer's background neon glow (e.g., Peach #EB6244 or Golden #F5AB35). Using a soft round brush with **Flow at 12%**, paint a subtle rim light along the outer silhouette of shoulders and hair.\n\n" +
          "#### 4. Unify With Grain & Curves:\n" +
          "- Clip a **Curves adjustment layer** to each subject to match their contrast values to the overall scene.\n" +
          "- Add an overall **50% Gray layer set to Soft Light** with 2.5% Monochromatic Noise on top of the entire composition to bind disparate photos together.";
        recommendedSoftwares = [
          {
            name: "Adobe Photoshop",
            purpose: "Advanced Pen tool vector masks, hair refinement, and ambient rim lighting.",
            proTip: "Contract layer mask by 1.5px (or Filter > Other > Minimum at 1px) to kill edge halos instantly.",
          },
          {
            name: "Topaz Gigapixel AI",
            purpose: "Upscaling low-res client photos (e.g. 500px phone snapshots) to 300 DPI print quality.",
            proTip: "Run the 'Recovery' model to restore natural facial skin texture before chopping.",
          },
        ];
        actionableSteps = [
          "Open high-res photos in Photoshop and convert them to Smart Objects.",
          "Trace clothing and hard silhouettes with the Pen Tool; use Select & Mask Refine Hair for hair.",
          "Contract mask selection by 1.5px and clip a 'Color' blend mode layer to paint over halos.",
          "Add a clipped 'Linear Dodge' layer with low brush flow to paint background rim lighting.",
        ];
      }
      // CASE 3: FLYER LAYOUT & VISUAL HIERARCHY
      else if (q.includes("flyer") || q.includes("poster") || q.includes("layout") || q.includes("hierarchy") || q.includes("3-second")) {
        answer =
          "### 📐 Commercial Flyer Blueprint: The 3-Second Visual Hierarchy Rule\n\n" +
          "A flyer or poster has exactly 3 seconds to stop someone walking down the street or scrolling past on Instagram. If your text fights your artwork, the client loses business.\n\n" +
          "#### The 30-40-25-5 Grid Architecture:\n" +
          "1. **Top 30% · The Hook & Presenter**: Who is hosting, followed by the commanding event title. Use heavy, condensed display typography (all-caps). Keep it tight with negative space around the edges.\n" +
          "2. **Middle 40% · The Hero Artwork**: High-contrast cutouts of the performers, speakers, or signature dishes. Place dimensional smoke or light leaks *behind* them, and floating particles *in front* for 3D depth.\n" +
          "3. **Lower 25% · High-Contrast Metadata Block**: Date (huge numerals), Venue / Address, Time, and Ticket URL. **Mandatory rule:** Always place a deep gradient or solid charcoal card behind this block. Never let busy photos sit underneath dates or times!\n" +
          "4. **Bottom 5% · Structural Footer**: Sponsor logos in monochromatic white (never multi-color logos that distract), age limits (18+/21+), and QR codes.\n\n" +
          "#### Pre-Flight Press Rule:\n" +
          "- Set canvas to 300 DPI, CMYK color mode.\n" +
          "- Add **0.125\" (1/8 inch) bleeds** on all 4 sides. Keep all live text at least 0.25\" inside the trim line!";
        recommendedSoftwares = [
          {
            name: "Adobe Illustrator",
            purpose: "Building the master layout grid, text formatting, and spot color prep.",
            proTip: "Turn on View > Rulers > Show Rulers and drag guides for bleed, trim, and safety margins.",
          },
          {
            name: "Adobe Photoshop",
            purpose: "Background artwork, compositing chopped subjects, and atmospheric glows.",
            proTip: "Place your PSD artwork as a linked Smart Object inside Illustrator for the sharpest vector type.",
          },
        ];
        actionableSteps = [
          "Set up an 8.5\" × 11\" canvas with 0.125\" bleed margins and CMYK 300 DPI in Illustrator or Photoshop.",
          "Place a dark gradient in the lower 30% to reserve a bulletproof zone for dates and ticket info.",
          "Import your chopped hero subjects into the middle 40% with rim lighting.",
          "Set headline type in Bebas Neue or Anton with tight letter-spacing (-20 to -40 tracking).",
        ];
      }
      // CASE 4: SOFTWARE FOR 3D PACKAGING, BRANDING & MOCKUPS
      else if (q.includes("software") || q.includes("tool") || q.includes("3d") || q.includes("package") || q.includes("mockup") || q.includes("dieline")) {
        answer =
          "### 🛠️ Creative Director Software Arsenal: 3D Packaging, Web & Brand Design\n\n" +
          "To deliver agency-grade deliverables that command top coin rates, here is the industry software stack I recommend:\n\n" +
          "#### 1. Packaging Dielines & 3D Box Mockups:\n" +
          "- **Adobe Illustrator**: The gold standard for flat 2D dielines. Use separate layers for `ARTWORK`, `DIELINE (CUT)`, and `CREASE (FOLD)`. Mark cut lines as 100% Magenta spot color set to Overprint Stroke.\n" +
          "- **Pacdora (Web App)**: The fastest tool for folding packaging. Pick a box template (shoe box, mailer, beverage box), paste your Illustrator artwork, and get instant photorealistic 3D renders with lighting.\n" +
          "- **Blender (Free & Open Source)**: For custom bottles, cosmetic jars, or unique apparel items. Import your SVG dieline or bottle model, apply Glass/Plastic BSDF shaders, and render in Cycles.\n\n" +
          "#### 2. Web UI/UX & Responsive Layouts:\n" +
          "- **Figma**: The undisputed king for websites. Use **Auto-Layout (Shift+A)** for responsive container resizing, and build reusable Components for menu items, buttons, and navigation bars.\n\n" +
          "#### 3. Motion & Animated Flyers:\n" +
          "- **Adobe After Effects**: Animate your Photoshop flyer PSD layers. Use the **Graph Editor** to adjust speed curves (Easing: Easy Ease `F9`) so typography snaps with punchy momentum.";
        recommendedSoftwares = [
          {
            name: "Pacdora / Blender",
            purpose: "3D packaging folding, realistic materials, and client presentation mockups.",
            proTip: "Use Pacdora for instant 3D box dielines, or Blender Cycles for custom glass and beverage bottles.",
          },
          {
            name: "Adobe Illustrator",
            purpose: "Flat vector dielines with exact printer bleed and fold marks.",
            proTip: "Always put dielines on a dedicated non-printing spot color layer named 'Dieline'.",
          },
          {
            name: "Figma",
            purpose: "Interactive website prototyping, client presentations, and developer handoffs.",
            proTip: "Group components with variant properties (e.g. State=Hover, Device=Mobile).",
          },
        ];
        actionableSteps = [
          "Obtain the exact structural dieline PDF from your client's box manufacturer.",
          "Open dieline in Illustrator, lock the cut layer, and design artwork with 0.125\" bleeds past fold lines.",
          "Export 300 DPI flat artwork and load it into Pacdora or Blender to preview 3D lighting folds.",
          "Export high-res 4K mockup PNGs for the client review deck.",
        ];
      }
      // CASE 5: COLOR PALETTE & PRINT GAMUT
      else if (q.includes("color") || q.includes("palette") || q.includes("hex") || q.includes("cmyk")) {
        answer =
          "### 🎨 Color Palette & Harmony Studio: Contrast, Mood & Print Gamut\n\n" +
          "When picking brand and flyer colors, always follow the **60-30-10 Rule**:\n\n" +
          "1. **60% Dominant Canvas**: Sets the mood without competing with content (e.g., Deep Obsidian #11141C).\n" +
          "2. **30% Structural Secondary**: Shapes, cards, badges, and secondary typographic details (e.g., Golden Amber #F5AB35).\n" +
          "3. **10% High-Energy Accent**: Reserved strictly for the #1 focal point or Call-To-Action (e.g., Peach Ember #EB6244).\n\n" +
          "#### The CMYK Print Warning:\n" +
          "- **Out-of-Gamut Alert**: Vibrant electric RGB blues, magentas, and neon lime greens *cannot* be physically printed using standard CMYK 4-color process inks. They will turn muddy unless you specify expensive Pantone spot inks.\n" +
          "- **Rich Black**: Pure 100% K black looks washed out and charcoal on glossy paper. Use Rich Black: `C:60 M:40 Y:40 K:100` for deep, luxurious backgrounds.";
        colorPalette = [
          { name: "Deep Obsidian", hex: "#11141C", role: "60% Dominant Canvas" },
          { name: "Peach Ember", hex: "#EB6244", role: "10% High-Energy Accent / CTA" },
          { name: "Golden Amber", hex: "#F5AB35", role: "30% Structural Secondary / Badges" },
          { name: "Crisp Warm White", hex: "#FAF8F5", role: "High-Contrast Copy & Details" },
          { name: "Evergreen Studio", hex: "#173328", role: "Framing & Card Borders" },
        ];
        quickTips = [
          "Check contrast with a B&W adjustment layer in Photoshop to make sure values read in pure grayscale.",
          "Never put yellow or light peach text on a white background without a dark dropshadow or card.",
          "Use Coolors.co or Adobe Color to check WCAG AAA accessibility contrast scores.",
        ];
      }
      // CASE 6: FONT PAIRINGS
      else if (q.includes("font") || q.includes("typography") || q.includes("pairing") || q.includes("type")) {
        answer =
          "### 🔤 Commercial Font Pairing Blueprint: Impact Meets Readability\n\n" +
          "Rule #1 of typography: **Never use more than 2 font families on a commercial piece** (or 3 if one is a decorative specialty flourish). Contrast in scale and weight replaces the need for extra fonts.\n\n" +
          "#### Top Commercial Duos:\n" +
          "1. **High-Energy Event / Sports / Streetwear**:\n" +
          "   - **Headline**: Bebas Neue or Anton (Heavy Condensed Sans, All-Caps, tight -30 tracking)\n" +
          "   - **Subhead & Metadata**: Montserrat or Archivo (Wide Geometric Sans, semi-bold, +80 tracking)\n" +
          "   - **Body / Fine Print**: Inter or Roboto (Clean Humanist Sans, 140% line-height)\n\n" +
          "2. **Luxury Restaurant / Hospitality / Fine Dining**:\n" +
          "   - **Headline**: Playfair Display or Cormorant Garamond (High-contrast editorial serif)\n" +
          "   - **Subhead & Menu Items**: Outfit or Montserrat (Clean geometric sans-serif, uppercase)\n" +
          "   - **Descriptions**: Lora or Inter (Legible at 9pt size on printed menus)\n\n" +
          "3. **Modern Tech / Startup / Direct-to-Consumer**:\n" +
          "   - **Headline**: Clash Display or Syne (Bold character, distinct geometry)\n" +
          "   - **Body**: Satoshi or Plus Jakarta Sans (Ultra-clean, modern legibility)";
        fontPairing = {
          headline: "Bebas Neue (Heavy All-Caps)",
          subhead: "Montserrat (Semi-Bold Tracking +80)",
          body: "Inter (Regular, 140% line-height)",
          notes: "Ideal for event flyers, sports announcements, and commercial promotion.",
        };
      }
      // DEFAULT FALLBACK
      else {
        answer =
          `### 🍑 Sweet As A Peach Creative Director Guidance\n\n` +
          `Regarding your question: "${trimmed}"\n\n` +
          `As your Creative Director, here are the key principles and software workflows to apply:\n\n` +
          `1. **Clarify the Core Objective**: Ask yourself what the client's audience must do first (buy tickets, order food, recognize the brand).\n` +
          `2. **Software Stack**: Use Photoshop for high-contrast photo compositing, Illustrator for vector identity and print dielines, or Figma for web layouts.\n` +
          `3. **Visual Contrast**: Ensure your focal point stands out with 60-30-10 color balance and at least 4.5:1 contrast ratio.\n` +
          `4. **Production Specs**: Always build with 300 DPI, CMYK color profiles for press, and keep vector outlines backed up in your project Brand Vault.`;
      }

      parsed = {
        answer,
        isExecutionRefusal,
        creativeDirectorNote,
        recommendedSoftwares,
        actionableSteps,
        colorPalette,
        fontPairing,
        assetKeywords,
        quickTips,
        followUps,
      };
    }

    return NextResponse.json({
      answer: parsed.answer || "Here is creative studio guidance from your Creative Director.",
      isExecutionRefusal: Boolean(parsed.isExecutionRefusal),
      creativeDirectorNote: parsed.creativeDirectorNote || "I direct the vision, you hold the tools. Let's make this piece unforgettable.",
      recommendedSoftwares: Array.isArray(parsed.recommendedSoftwares) ? parsed.recommendedSoftwares : [],
      actionableSteps: Array.isArray(parsed.actionableSteps) ? parsed.actionableSteps : [],
      colorPalette: Array.isArray(parsed.colorPalette) ? parsed.colorPalette : [],
      fontPairing: parsed.fontPairing || {
        headline: "Bebas Neue (Heavy All-Caps)",
        subhead: "Montserrat (Semi-Bold)",
        body: "Inter (Regular)",
      },
      assetKeywords: Array.isArray(parsed.assetKeywords) ? parsed.assetKeywords : [],
      quickTips: Array.isArray(parsed.quickTips) ? parsed.quickTips : [],
      followUps: Array.isArray(parsed.followUps) ? parsed.followUps : [
        "How do I cleanly chop out 5-6 people in Photoshop without halos?",
        "What software is best for creating 3D product packaging mockups?",
        "What are the best font pairings for a luxury restaurant menu?",
      ],
    });
  } catch (err: any) {
    console.warn("Studio AI safe fallback:", err?.message || err);
    return NextResponse.json({
      answer:
        "### 🍑 Sweet As A Peach Creative Director\n\nI direct the vision, you hold the tools! For top commercial output, remember:\n\n1. **Focal Point**: Lead with one dominant subject before secondary information.\n2. **Software Stack**: Photoshop for composite chopping, Illustrator for vector logos, Figma for responsive screens.\n3. **Print Specs**: 300 DPI, CMYK color profiles, and 0.125” bleed on physical collaterals.",
      isExecutionRefusal: false,
      creativeDirectorNote: "Keep your layouts punchy, your typography intentional, and your brand files organized.",
      recommendedSoftwares: [
        { name: "Adobe Illustrator", purpose: "Vector artwork & brand identities", proTip: "Always outline display fonts before final handoff." },
        { name: "Adobe Photoshop", purpose: "Subject clipping & photo compositing", proTip: "Use Select Subject + Refine Edge for clean hair cutouts." }
      ],
      actionableSteps: ["Set up your canvas with correct DPI and bleed", "Establish primary typographic hierarchy", "Export review proofs for client feedback"],
      colorPalette: [],
      fontPairing: {
        headline: "Bebas Neue (Heavy All-Caps)",
        subhead: "Montserrat (Semi-Bold)",
        body: "Inter (Regular)",
      },
      assetKeywords: ["Commercial design", "Vector", "300 DPI"],
      quickTips: ["Never stretch type horizontally or vertically", "Keep text at least 0.25 inches from print trim edge"],
      followUps: [
        "How do I cleanly chop out 5-6 people in Photoshop without halos?",
        "What software is best for creating 3D product packaging mockups?",
        "What are the best font pairings for a luxury restaurant menu?",
      ],
    });
  }
}
