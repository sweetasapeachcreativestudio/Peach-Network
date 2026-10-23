"use client";

import React, { useState } from "react";
import Link from "next/link";
import PhoneHeroMockup from "@/components/PhoneHeroMockup";
import { X, Check } from "lucide-react";

interface ProjectItem {
  id: number;
  title: string;
  client: string;
  category: string;
  coins: number;
  timeline: string;
  image: string;
  description: string;
  specs: string[];
  designer?: string;
  designerRole?: string;
}

const PROJECTS: ProjectItem[] = [
  {
    id: 1,
    title: "Runa Logo & Vector Kit",
    client: "Runa",
    category: "Logo & Vector Kit",
    coins: 4,
    timeline: "Est. 3–4 Days",
    image: "/project 7.jpg",
    designer: "Jose Garcia",
    designerRole: "Illustrator & Video Editor • ADDY Award Winner (Troy University)",
    description:
      "High-precision vector logo and identity kit created by Jose Garcia, ADDY Award-winning illustrator and video editor at Troy University.",
    specs: [
      "Primary Logo & Moon Icon",
      "Apparel Vector Artwork",
      "100% Scalable Vector SVGs",
      "Print & Screen Pre-Flight Passed",
    ],
  },
  {
    id: 2,
    title: "Empower Her Heart",
    client: "Lillian Hewitt, Black Women's Heart Health, LLC",
    category: "UI/UX & Art Direction",
    coins: 8,
    timeline: "Est. 5–7 Days",
    image: "/lillian-project.jpg",
    designer: "Stephanie Stewart",
    designerRole: "UI/UX Designer & Art Director (Troy University)",
    description:
      "Designed by Stephanie Stewart, UI/UX Designer & Art Director at Troy University for Lillian Hewitt's Empower Her Heart initiative.",
    specs: [
      "Responsive Web Experience",
      "Mobile Health UI Prototype",
      "Figma Design System Tokens",
      "Art Direction & Brand Collateral",
    ],
  },
  {
    id: 3,
    title: "Bessemer Chamber Logo & Brand Kit",
    client: "Bessemer Area Chamber of Commerce",
    category: "Logo & Brand Kit",
    coins: 6,
    timeline: "Est. 4–5 Days",
    image: "/Project 3.png",
    designer: "Donovan",
    designerRole: "Graphic Designer (Studying at SCAD)",
    description:
      "Official civic chamber logo and brand kit designed by Donovan, graphic designer studying at SCAD (Savannah College of Art and Design).",
    specs: [
      "Primary Civic Identity Seal",
      "Signage & Apparel Vector Art",
      "300 DPI CMYK Pre-Flight",
      "Brand Guidelines & Color Specs",
    ],
  },
  {
    id: 4,
    title: "Student Campaign & Announcement Suite",
    client: "Lawson State Community College",
    category: "Social Media Campaign",
    coins: 3,
    timeline: "Est. 2–3 Days",
    image: "/Project 1.png",
    description:
      "A cohesive social campaign highlighting student achievement and program opportunities across Birmingham.",
    specs: [
      "4 social media designs",
      "Feed & story formats",
      "Brand guidelines styling",
      "Editable source files",
    ],
  },
  {
    id: 5,
    title: "Church Program & Civic Event Suite",
    client: "New Joy Fellowship Baptist Church",
    category: "Editorial & Print Design",
    coins: 4,
    timeline: "Est. 3–4 Days",
    image: "/Project 4.png",
    description:
      "A coordinated print and digital event suite for a historic Birmingham community congregation.",
    specs: [
      "Print-ready program (300 DPI)",
      "Digital mobile version",
      "Social announcement graphics",
      "Archive vector files",
    ],
  },
  {
    id: 6,
    title: "Custom Event Flyer Kit",
    client: "Local Culinary & Artisan Market",
    category: "Print & Social Launch Kit",
    coins: 2,
    timeline: "Est. 2–3 Days",
    image: "/Project 2.png",
    description:
      "Pre-scoped event kit: 1 high-res print flyer with 300 DPI press bleeds + matching Instagram square and story.",
    specs: [
      "1 Commercial Print Flyer (CMYK)",
      "1 Instagram Square (1080x1080)",
      "1 Instagram Story (1080x1920)",
      "Stored in Brand Vault",
    ],
  },
];

export default function HomePage() {
  const [selected, setSelected] = useState<ProjectItem | null>(null);
  const [pricingTab, setPricingTab] = useState<"project" | "membership">("project");

  // Basic Contact / Partner / Question Form
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactTopic, setContactTopic] = useState("Question About the App");
  const [contactMessage, setContactMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;
    setFormSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] relative text-slate-900 selection:bg-[#FF5733]/20 selection:text-[#FF5733] font-sans antialiased">
      {/* Subtle Peach Wallpaper Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04] z-0"
        style={{
          backgroundImage: "url('/brand/peach-pattern.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
        }}
      />

      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="relative z-10 bg-slate-950 text-slate-200 py-2.5 px-4 text-center text-xs font-medium tracking-wide border-b border-slate-800">
        <span className="text-cyan-300 font-semibold mr-1.5">
          📍 Birmingham&rsquo;s Creative Marketplace
        </span>
        <span className="text-slate-500">&bull;</span>{" "}
        <strong className="text-white font-semibold ml-1.5">Real Local Human Talent</strong>
      </div>

      {/* 1. HEADER */}
      <header className="sticky top-0 z-40 bg-[#FFF5EE]/95 backdrop-blur-md border-b border-[#F0D5C7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/brand/peach-network-logo.png"
              alt="Peach Network"
              className="h-10 sm:h-11 w-auto object-contain"
            />
          </Link>

          {/* Menu Links */}
          <nav className="flex items-center gap-5 sm:gap-8 lg:gap-10 text-xs sm:text-sm font-semibold text-slate-800 whitespace-nowrap overflow-x-auto py-1">
            <a href="#about" className="hover:text-[#FF5733] transition-colors">
              About Us
            </a>
            <a href="#how-it-works" className="hover:text-[#FF5733] transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-[#FF5733] transition-colors">
              Pricing
            </a>
            <a href="#why-choose-us" className="hover:text-[#FF5733] transition-colors">
              Why Choose Us
            </a>
            <a href="#contact" className="hover:text-[#FF5733] transition-colors">
              Contact
            </a>
          </nav>

          {/* Header Right: Sign In + High-converting Coral Start a Project CTA (No coin badge clutter) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-800 hover:text-[#FF5733] transition-colors px-2 py-1"
            >
              Sign In
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 bg-[#FF5733] hover:bg-[#E04826] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-lg shadow-xs hover:shadow transition-all"
            >
              Start a Project &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-24 border-b border-[#F0D5C7] bg-gradient-to-b from-[#FDF2EC] via-[#FCEAE0]/70 to-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* HERO LEFT COLUMN */}
            <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#1E3A8A] mb-4">
                ✦ THE ON-DEMAND CREATIVE PLATFORM
              </p>

              {/* H1 Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-slate-950 leading-[1.1] text-balance">
                Vetted Creatives at the{" "}
                <span className="text-[#FF5733] italic font-extrabold">
                  Touch of a Button.
                </span>
              </h1>

              {/* Subhead with comfortable breathing room */}
              <p className="mt-6 text-base sm:text-lg text-slate-700 leading-relaxed max-w-xl">
                Describe what you need in plain English. Get matched with top commercial designers at transparent coin pricing&mdash;with zero bidding wars, no hourly bloat, and no low-quality AI shortcuts.
              </p>

              {/* ACTION Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-[#FF5733] hover:bg-[#E04826] text-white text-base font-semibold px-8 py-3.5 rounded-lg shadow-sm hover:shadow transition-colors text-center"
                >
                  Start a Project &rarr;
                </Link>

                <Link
                  href="/apply"
                  className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 text-base font-semibold px-8 py-3.5 rounded-lg transition-colors text-center shadow-2xs"
                >
                  Apply as a Creative
                </Link>
              </div>

              {/* 4 Clean Proof Anchors */}
              <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-700">
                <span>Real Human Craft</span>
                <span className="text-slate-400">&bull;</span>
                <span>Zero Bidding Wars</span>
                <span className="text-slate-400">&bull;</span>
                <span>Stackable Coin Banking</span>
                <span className="text-slate-400">&bull;</span>
                <span>Protected Milestone Release</span>
              </div>
            </div>

            {/* HERO RIGHT COLUMN (3D Smartphone Mockup — Intact & Untouched) */}
            <div className="lg:col-span-6 w-full flex items-center justify-center lg:justify-end">
              <PhoneHeroMockup />
            </div>
          </div>
        </div>

        {/* Live Marketplace Scrolling Marquee Ribbon */}
        <div className="mt-16 lg:mt-20 border-t border-b border-[#F0D5C7] bg-slate-950 backdrop-blur-md overflow-hidden py-3.5 select-none text-xs">
          <div className="animate-marquee-scroll flex items-center whitespace-nowrap">
            {[1, 2].map((loopIdx) => (
              <div key={loopIdx} className="flex items-center gap-7 shrink-0 pr-7">
                <span className="flex items-center gap-2 text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Built in Birmingham, Alabama
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-[#FFD8C2] font-semibold">Vetted Creatives</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-white font-medium">Logo Design &amp; Brand Systems</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-white font-medium">Website Design</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-white font-medium">Social Media Marketing</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-sky-300 font-medium">Creative Campaigns</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-white font-medium">Photography &amp; Video</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-[#FFD8C2] font-medium">Dedicated Creative Support</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-white font-medium">Supporting Business Owners &amp; Local Creatives</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-cyan-300 font-semibold">Sweet As A Peach Creative Agency</span>
                <span className="text-slate-600">&bull;</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-[#FAF8F5] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
              From Raw Idea to Finished Asset in 3 Steps
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-4 leading-relaxed">
              No bidding wars, no confusing creative jargon, and no hourly guessing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {/* Step 01 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-extrabold text-[#FF5733] tracking-wider uppercase mb-3">
                  STEP 01
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-950 mb-3">Chat &amp; Scope in 60s</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Describe what you need in plain English. We calculate exact coin requirements, set technical commercial print specs, and lock your scope upfront.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t border-slate-100 text-xs font-semibold text-slate-800">
                Zero scope creep &bull; Fixed coin rate
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-extrabold text-[#FF5733] tracking-wider uppercase mb-3">
                  STEP 02
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-950 mb-3">Pick From 3 Curated Pros</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  No 40-proposal bidding wars. Review exactly three verified local commercial designers matched to your industry and pick your favorite.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t border-slate-100 text-xs font-semibold text-slate-800">
                Hand-screened Birmingham talent
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-extrabold text-[#FF5733] tracking-wider uppercase mb-3">
                  STEP 03
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-950 mb-3">Approve &amp; Print</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Collaborate on a transparent project canvas. Receive guaranteed 300 DPI CMYK pre-flight files and Brand Vault archival. Payout is released only after your final sign-off.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t border-slate-100 text-xs font-semibold text-slate-800">
                Commercial press-ready &bull; Safe sign-off
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRICING & MEMBERSHIP SECTION */}
      <section id="pricing" className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
              Transparent Creative Pricing
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-4 leading-relaxed">
              Choose on-demand single projects or flexible monthly memberships with stackable rollover coin banking.
            </p>

            {/* Interactive 2-Tab Switch */}
            <div className="mt-8 inline-flex p-1 bg-[#FAF8F5] border border-slate-200 rounded-xl shadow-xs">
              <button
                type="button"
                onClick={() => setPricingTab("project")}
                className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  pricingTab === "project"
                    ? "bg-slate-950 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                Pay-As-You-Go (Single Projects)
              </button>
              <button
                type="button"
                onClick={() => setPricingTab("membership")}
                className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  pricingTab === "membership"
                    ? "bg-slate-950 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                Monthly Memberships (Save &amp; Stack)
              </button>
            </div>
          </div>

          {/* TAB 1: PAY-AS-YOU-GO */}
          {pricingTab === "project" ? (
            <div>
              <p className="text-center text-xs font-semibold text-slate-500 mb-10 max-w-xl mx-auto">
                No monthly commitment. Buy coins on demand from $50 and start immediately.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Quick Tasks */}
                <div className="bg-[#FAF8F5] border border-slate-200 rounded-2xl p-7 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Quick Tasks</div>
                    <div className="mt-2.5 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-950">$50</span>
                      <span className="text-xs font-semibold text-slate-500">/ 1 Coin</span>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-[#FF5733]">
                      Est. 1–2 Days
                    </div>
                    <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                      Small graphics, social revisions, vector cleanups, banner edits, and quick file format conversions.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-slate-200">
                    <Link
                      href="/login"
                      className="w-full inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs py-2.5 rounded-lg border border-slate-300 transition-colors shadow-2xs"
                    >
                      Start Project &rarr;
                    </Link>
                  </div>
                </div>

                {/* 2. Launch Kit (Most Popular) */}
                <div className="bg-white border-2 border-[#FF5733] rounded-2xl p-7 flex flex-col justify-between shadow-sm relative">
                  <div className="absolute -top-3 right-5 bg-[#FF5733] text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded">
                    MOST POPULAR
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#FF5733] uppercase tracking-wide">Launch Kit</div>
                    <div className="mt-2.5 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-950">$100</span>
                      <span className="text-xs font-semibold text-slate-500">/ 2 Coins</span>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-[#FF5733]">
                      Est. 3–4 Days
                    </div>
                    <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                      Complete promotional drop: 1 Commercial Print Flyer (300 DPI CMYK) + 1:1 Instagram Square + 9:16 Story format.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-slate-200">
                    <Link
                      href="/login"
                      className="w-full inline-flex items-center justify-center bg-[#FF5733] hover:bg-[#E04826] text-white font-bold text-xs py-2.5 rounded-lg transition-colors shadow-xs"
                    >
                      Start Project &rarr;
                    </Link>
                  </div>
                </div>

                {/* 3. Brand Starter */}
                <div className="bg-[#FAF8F5] border border-slate-200 rounded-2xl p-7 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Brand Starter</div>
                    <div className="mt-2.5 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-950">$300</span>
                      <span className="text-xs font-semibold text-slate-500">/ 6 Coins</span>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-[#FF5733]">
                      Est. 4–5 Days
                    </div>
                    <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                      Primary corporate logo, secondary mark, typography pairing, vector color kit, and master scalable SVG/AI handoffs.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-slate-200">
                    <Link
                      href="/login"
                      className="w-full inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs py-2.5 rounded-lg border border-slate-300 transition-colors shadow-2xs"
                    >
                      Start Project &rarr;
                    </Link>
                  </div>
                </div>

                {/* 4. Web & Prototypes */}
                <div className="bg-[#FAF8F5] border border-slate-200 rounded-2xl p-7 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Web &amp; Prototypes</div>
                    <div className="mt-2.5 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-950">$500</span>
                      <span className="text-xs font-semibold text-slate-500">/ 10 Coins</span>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-[#FF5733]">
                      Est. 5–7 Days
                    </div>
                    <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                      Responsive landing page or mobile prototype in Figma with interactive transitions, component tokens, and developer specs.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-slate-200">
                    <Link
                      href="/login"
                      className="w-full inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs py-2.5 rounded-lg border border-slate-300 transition-colors shadow-2xs"
                    >
                      Start Project &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: MONTHLY MEMBERSHIPS */
            <div>
              <p className="text-center text-xs font-semibold text-slate-500 mb-10 max-w-xl mx-auto">
                Unused coins never vanish. Bank rollover coins to deploy whenever you need them.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* 1. Essential Plan */}
                <div className="bg-[#FAF8F5] border border-slate-200 rounded-2xl p-8 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">ESSENTIAL PLAN</div>
                    <div className="text-3xl font-extrabold tracking-tight text-slate-950 mt-2">
                      $499 <span className="text-xs font-normal text-slate-500">/ month</span>
                    </div>
                    <div className="mt-2.5 inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                      Replaces $3,000/mo agency retainers
                    </div>

                    <div className="mt-6 space-y-3 text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>10 Peach Coins monthly</strong> ($500 creative value)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>1 active request at a time</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Rollover banking up to <strong>20 coins</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Full editable source files (.AI, .SVG, .EPS)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Standard creative matching</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-slate-200">
                    <Link
                      href="/login"
                      className="w-full inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm py-3 rounded-lg border border-slate-300 transition-colors shadow-2xs"
                    >
                      Join Essential ($499/mo) &rarr;
                    </Link>
                  </div>
                </div>

                {/* 2. Growth Plan (Most Popular) */}
                <div className="bg-white border-2 border-[#FF5733] rounded-2xl p-8 flex flex-col justify-between shadow-md relative">
                  <div className="absolute -top-3 right-6 bg-[#FF5733] text-white text-[10px] font-bold tracking-wider uppercase px-3 py-0.5 rounded">
                    MOST POPULAR
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#FF5733] uppercase tracking-wide">GROWTH PLAN</div>
                    <div className="text-3xl font-extrabold tracking-tight text-slate-950 mt-2">
                      $1,099 <span className="text-xs font-normal text-slate-500">/ month</span>
                    </div>
                    <div className="mt-2.5 inline-block text-[11px] font-bold text-[#C2410C] bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-md">
                      Replaces $55,000/yr in-house designer salary
                    </div>

                    <div className="mt-6 space-y-3 text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#FF5733] shrink-0 mt-0.5" />
                        <span><strong>24 Peach Coins monthly</strong> ($1,200 creative value)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#FF5733] shrink-0 mt-0.5" />
                        <span><strong>2 active projects</strong> running at once</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#FF5733] shrink-0 mt-0.5" />
                        <span>Includes <strong>Brand Asset Vault</strong> archival</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#FF5733] shrink-0 mt-0.5" />
                        <span>Priority creative match &amp; dedicated pairing</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#FF5733] shrink-0 mt-0.5" />
                        <span>Rollover banking up to <strong>48 coins</strong></span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-500">
                        <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>Includes everything in Essential</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-slate-200">
                    <Link
                      href="/login"
                      className="w-full inline-flex items-center justify-center bg-[#FF5733] hover:bg-[#E04826] text-white font-bold text-sm py-3 rounded-lg shadow-sm hover:shadow transition-colors"
                    >
                      Join Growth ($1,099/mo) &rarr;
                    </Link>
                  </div>
                </div>

                {/* 3. Partner Plan (Full Agency Replacement) */}
                <div className="bg-[#FAF8F5] border border-slate-200 rounded-2xl p-8 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">PARTNER PLAN</div>
                    <div className="text-3xl font-extrabold tracking-tight text-slate-950 mt-2">
                      $2,000 <span className="text-xs font-normal text-slate-500">/ month</span>
                    </div>
                    <div className="mt-2.5 inline-block text-[11px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                      Full Agency Replacement
                    </div>

                    <div className="mt-6 space-y-3 text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <span><strong>50 Peach Coins monthly</strong> ($2,500 creative value)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <span><strong>3 to 4 active projects</strong> running at once</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <span>Dedicated Pod: Lead Art Director on call</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <span>Priority queue dispatch</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <span>Rollover banking up to <strong>100 coins</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <span>Quarterly 1-on-1 creative strategy review</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <span>15% discount on top-up coin packs</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-slate-200">
                    <Link
                      href="/login"
                      className="w-full inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm py-3 rounded-lg border border-slate-300 transition-colors shadow-2xs"
                    >
                      Join Partner ($2,000/mo) &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. WHY CHOOSE US / ANTI-AI MANIFESTO */}
      <section id="why-choose-us" className="py-24 bg-[#FAF8F5] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Real human creative photo - Clean, no overlaid words, seamlessly integrated into page */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-white max-w-sm w-full">
                <img
                  src="/Creative5.jpg"
                  alt="Real human creators collaborating in Birmingham, Alabama"
                  className="w-full h-auto max-h-[360px] object-cover mx-auto block"
                />
              </div>
            </div>

            {/* Content & Manifesto */}
            <div className="lg:col-span-7">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
                Why Real Human Artistry Beats AI Slop
              </h2>

              <p className="mt-5 text-base sm:text-lg text-slate-700 leading-relaxed">
                Generative AI creates blurry, unprintable files and invented fonts that print shops reject. Peach Network gives you conversational speed backed by real human designers who master commercial print bleeds and authentic branding.
              </p>

              {/* 3 Pillars - Clean, modern typography without icon boxes */}
              <div className="mt-8 space-y-5 text-sm text-slate-800">
                <div className="pl-4 border-l-2 border-[#FF5733]">
                  <strong className="text-slate-950 font-bold block mb-1">
                    Commercial Print Bleeds &amp; 300 DPI CMYK
                  </strong>
                  <span className="text-slate-600">
                    Every file passes technical pre-flight inspection so your prints are crisp and color-accurate the first time.
                  </span>
                </div>

                <div className="pl-4 border-l-2 border-[#1E3A8A]">
                  <strong className="text-slate-950 font-bold block mb-1">
                    100% Scalable Vector Handoffs
                  </strong>
                  <span className="text-slate-600">
                    You receive true .AI, .SVG, and .EPS source files you own outright—never low-res flattened rasters.
                  </span>
                </div>

                <div className="pl-4 border-l-2 border-emerald-600">
                  <strong className="text-slate-950 font-bold block mb-1">
                    Permanent Brand Asset Vault
                  </strong>
                  <span className="text-slate-600">
                    Fonts, color tokens, and asset history are preserved across projects for consistent brand equity.
                  </span>
                </div>
              </div>

              {/* For Creatives Sub-Box */}
              <div className="mt-10 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <span className="text-xs font-bold text-[#FF5733] tracking-wide uppercase">
                    FOR BIRMINGHAM CREATORS
                  </span>
                  <Link
                    href="/apply"
                    className="text-xs font-bold text-slate-900 hover:text-[#FF5733] transition-colors"
                  >
                    Apply to the Roster &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-slate-900">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-slate-200 text-center">
                    <div className="text-[#FF5733] font-bold">Zero</div>
                    <div className="text-slate-700">Bidding Wars</div>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-slate-200 text-center">
                    <div className="text-[#1E3A8A] font-bold">Fair</div>
                    <div className="text-slate-700">Work Rotation</div>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-slate-200 text-center">
                    <div className="text-emerald-700 font-bold">Art Director</div>
                    <div className="text-slate-700">Mentorship</div>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-slate-200 text-center">
                    <div className="text-[#FF5733] font-bold">75% Payout</div>
                    <div className="text-slate-700">Direct &bull; On Time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHO WE ARE: BORN IN BIRMINGHAM */}
      <section id="about" className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Story & Agency Credentials */}
            <div className="lg:col-span-7">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
                Who We Are: Born in Birmingham
              </h2>

              <p className="mt-6 text-base sm:text-lg text-slate-700 leading-relaxed">
                Peach Network is operated by Sweet As A Peach Creative Agency, an independent Birmingham agency led by commercial artists, art directors, and local business advocates. We built Peach Network to eliminate the friction of slow, expensive agencies and the exploitation of freelance bidding wars. We connect ambitious local businesses with accredited creators who care about craft.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center bg-[#FF5733] hover:bg-[#E04826] text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-xs transition-colors"
                >
                  Start a Project &rarr;
                </Link>
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-sm px-6 py-3 rounded-lg transition-colors"
                >
                  Get in Touch
                </Link>
              </div>
            </div>

            {/* Seamless, unboxed photo integration: User-provided creative visual */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="max-w-md w-full flex items-center justify-center">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_h82sf4h82sf4h82s_d6d4759c.jpg"
                  alt="Sweet As A Peach Creative Agency"
                  className="w-full h-auto max-h-[380px] object-contain mx-auto mix-blend-multiply drop-shadow-sm transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. REAL COMMERCIAL DELIVERABLES GALLERY */}
      <section className="py-24 bg-[#FAF8F5] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
            <div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
                Real Commercial Deliverables
              </h2>
              <p className="text-slate-600 text-base sm:text-lg mt-3">
                Click any project deliverable to inspect scope, specs, and coin investment.
              </p>
            </div>
            <Link
              href="/login"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF5733] hover:underline"
            >
              Start your project today &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROJECTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p)}
                className="group text-left bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors shadow-2xs flex flex-col"
              >
                <div className="h-56 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-md text-xs font-bold text-slate-950 border border-slate-200 shadow-2xs">
                    {p.coins} Coins (${p.coins * 50})
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#FF5733] uppercase tracking-wide mb-1.5">
                      {p.category}
                    </div>
                    <h3 className="text-base font-bold tracking-tight text-slate-950 line-clamp-1 group-hover:text-[#FF5733] transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    {p.designer && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-900">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-sky-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {p.designer[0]}
                        </span>
                        <div className="truncate">
                          <span className="font-bold">{p.designer}</span>
                          <span className="text-slate-400 mx-1">&bull;</span>
                          <span className="text-xs text-[#0284C7] font-semibold">{p.designerRole}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>{p.timeline}</span>
                    <span className="font-semibold text-slate-900 group-hover:text-[#FF5733] transition-colors">
                      Inspect Scope &rarr;
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 8. BASIC CONTACT & PARTNER FORM (Not talking about projects, just questions & partnerships) */}
      <section id="contact" className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
              Have a Question or Want to Partner?
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
              Send our Birmingham team a quick note and we&rsquo;ll get right back to you.
            </p>
          </div>

          <div className="bg-[#FAF8F5] border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs">
            {formSubmitted ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mb-4 font-bold text-xl">
                  ✓
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-950 mb-2">Message Received!</h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thanks for reaching out, <strong>{contactName}</strong>! Our Birmingham studio team will follow up at <strong>{contactEmail}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormSubmitted(false);
                    setContactName("");
                    setContactEmail("");
                    setContactMessage("");
                  }}
                  className="mt-6 inline-flex items-center justify-center bg-white border border-slate-300 text-slate-900 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="First & Last Name"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-[#FF5733] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-[#FF5733] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                    How Can We Help?
                  </label>
                  <select
                    value={contactTopic}
                    onChange={(e) => setContactTopic(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-[#FF5733] transition-colors"
                  >
                    <option value="Question About the App">Question About the App</option>
                    <option value="Partner with Peach Network">Partner with Peach Network</option>
                    <option value="Creative Roster Inquiry">Creative Roster Inquiry</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="How can we help you?"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-[#FF5733] transition-colors resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center bg-[#FF5733] hover:bg-[#E04826] text-white font-bold text-sm py-3 rounded-lg shadow-xs transition-colors"
                  >
                    Send Note &rarr;
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION STRIP */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to Elevate Your Brand Collateral?
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto mt-4 text-base sm:text-lg leading-relaxed">
            Get commercial-grade graphic design, branding, and marketing collateral with predictable coin pricing and careful pre-flight checks.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#FF5733] hover:bg-[#E04826] text-white font-semibold text-base px-8 py-3.5 rounded-lg shadow-xs transition-colors"
            >
              Start a Project &rarr;
            </Link>
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 bg-transparent hover:bg-white/10 text-white font-semibold text-base px-8 py-3.5 rounded-lg border border-white/20 transition-colors"
            >
              Apply as a Creative
            </Link>
          </div>
        </div>
      </section>

      {/* PROJECT DETAILS MODAL */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-64 sm:h-72 w-full bg-slate-100 overflow-hidden">
              <img
                src={selected.image}
                alt={selected.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 sm:p-8">
              <span className="text-xs font-bold text-[#FF5733] uppercase tracking-wide">
                {selected.category}
              </span>
              <h3 className="text-2xl font-extrabold tracking-tight text-slate-950 mt-1">
                {selected.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Client: {selected.client}
              </p>

              {selected.designer && (
                <div className="mt-4 p-3.5 rounded-xl bg-[#FAF8F5] border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-sky-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {selected.designer[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-950">
                        Designed by {selected.designer}
                      </div>
                      <div className="text-[11px] text-[#0284C7] font-semibold">
                        {selected.designerRole}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                    Verified Creative
                  </span>
                </div>
              )}

              <p className="text-sm text-slate-700 mt-4 leading-relaxed">
                {selected.description}
              </p>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2.5">
                  DELIVERABLE SPECIFICATIONS:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {selected.specs.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm">
                  <span className="text-slate-500">Fixed Scope: </span>
                  <strong className="text-[#FF5733] font-bold">
                    {selected.coins} Peach Coins (${selected.coins * 50})
                  </strong>
                </div>

                <Link
                  href="/login"
                  onClick={() => setSelected(null)}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-[#FF5733] hover:bg-[#E04826] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-xs"
                >
                  Start Similar Project &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. COLORFUL & OPTIMIZED FOOTER WITH LOGO, CONTACT INFO & WARM PALETTE */}
      <footer className="bg-[#0B2D22] text-white border-t-4 border-[#FF5733] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-emerald-900/60">
            {/* Column 1: Brand & Mission */}
            <div className="md:col-span-5 space-y-4">
              <Link href="/" className="inline-block bg-white p-2.5 rounded-xl shadow-xs">
                <img
                  src="/brand/peach-network-logo.png"
                  alt="Peach Network"
                  className="h-10 w-auto object-contain"
                />
              </Link>
              <p className="text-emerald-100/80 text-sm leading-relaxed max-w-sm">
                Birmingham&rsquo;s on-demand creative marketplace connecting local business owners with vetted commercial artists. High-converting craft, fixed coin rates, and zero bidding wars.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60">
                <span className="w-2 h-2 rounded-full bg-[#FF5733]" />
                Operated by Sweet As A Peach Creative Agency
              </div>
            </div>

            {/* Column 2: Studio Contact Info (Moved here per user request) */}
            <div className="md:col-span-4 space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#FFD8C2]">
                Studio Contact &amp; Headquarters
              </div>
              <ul className="space-y-2.5 text-xs text-emerald-100/90">
                <li className="flex flex-col">
                  <span className="text-emerald-400 font-semibold text-[11px] uppercase tracking-wide">Email</span>
                  <a
                    href="mailto:sweetasapeachcreativestudio@gmail.com"
                    className="hover:text-[#FFD8C2] transition-colors break-all font-medium"
                  >
                    sweetasapeachcreativestudio@gmail.com
                  </a>
                </li>
                <li className="flex flex-col">
                  <span className="text-emerald-400 font-semibold text-[11px] uppercase tracking-wide">Website</span>
                  <a
                    href="https://www.sweetasapeachcreativeca.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FFD8C2] transition-colors font-medium"
                  >
                    www.sweetasapeachcreativeca.com
                  </a>
                </li>
                <li className="flex flex-col">
                  <span className="text-emerald-400 font-semibold text-[11px] uppercase tracking-wide">Location</span>
                  <span className="font-medium text-white">Birmingham, Alabama</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Quick Navigation */}
            <div className="md:col-span-3 space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#FFD8C2]">
                Platform Navigation
              </div>
              <ul className="space-y-2 text-xs font-medium text-emerald-100/80">
                <li>
                  <a href="#about" className="hover:text-white transition-colors">About Us</a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">Pricing &amp; Memberships</a>
                </li>
                <li>
                  <a href="#why-choose-us" className="hover:text-white transition-colors">Why Choose Us</a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#FFD8C2] transition-colors text-white font-semibold">
                    Start a Project &rarr;
                  </Link>
                </li>
                <li>
                  <Link href="/apply" className="hover:text-[#FFD8C2] transition-colors">
                    Apply as a Creative
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Sub-Footer Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/70">
            <div>
              &copy; {new Date().getFullYear()} Peach Network &bull; Sweet As A Peach Creative Agency. All rights reserved.
            </div>

            <div className="flex items-center gap-6">
              <Link href="/legal/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/peach-coins" className="hover:text-white transition-colors">
                Coin Rules
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
