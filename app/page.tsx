"use client";

import React, { useState } from "react";
import Link from "next/link";
import PhoneHeroMockup from "@/components/PhoneHeroMockup";
import {
  ShieldCheck,
  Zap,
  Users,
  Lock,
  ArrowRight,
  Palette,
  Printer,
  Share2,
  Layers,
  Layout,
  Check,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";

interface ProjectItem {
  id: number;
  title: string;
  client: string;
  category: string;
  coins: number;
  turnaround: string;
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
    turnaround: "4 Days",
    image: "/project 7.jpg",
    designer: "Jose Garcia",
    designerRole: "Illustrator & Video Editor • ADDY Award Winner (Troy University)",
    description: "High-precision vector logo and identity kit created by Jose Garcia, ADDY Award-winning illustrator and video editor at Troy University.",
    specs: ["Primary Logo & Moon Icon", "Apparel Vector Artwork", "100% Scalable Vector SVGs", "Print & Screen Pre-Flight Passed"],
  },
  {
    id: 2,
    title: "Empower Her Heart",
    client: "Lillian Hewitt, Black Women's Heart Health, LLC",
    category: "UI/UX & Art Direction",
    coins: 8,
    turnaround: "5–7 Days",
    image: "/lillian-project.jpg",
    designer: "Stephanie Stewart",
    designerRole: "UI/UX Designer & Art Director (Troy University)",
    description: "Designed by Stephanie Stewart, UI/UX Designer & Art Director at Troy University for Lillian Hewitt's Empower Her Heart initiative.",
    specs: ["Responsive Web Experience", "Mobile Health UI Prototype", "Figma Design System Tokens", "Art Direction & Brand Collateral"],
  },
  {
    id: 3,
    title: "Bessemer Chamber Logo & Brand Kit",
    client: "Bessemer Area Chamber of Commerce",
    category: "Logo & Brand Kit",
    coins: 6,
    turnaround: "48 Hours",
    image: "/Project 3.png",
    designer: "Donovan",
    designerRole: "Graphic Designer (Studying at SCAD)",
    description: "Official civic chamber logo and brand kit designed by Donovan, graphic designer studying at SCAD (Savannah College of Art and Design).",
    specs: ["Primary Civic Identity Seal", "Signage & Apparel Vector Art", "300 DPI CMYK Pre-Flight", "Brand Guidelines & Color Specs"],
  },
  {
    id: 4,
    title: "Student Campaign & Announcement Suite",
    client: "Lawson State Community College",
    category: "Social Media Campaign",
    coins: 3,
    turnaround: "48 Hours",
    image: "/Project 1.png",
    description: "A cohesive social campaign highlighting student achievement and program opportunities across Birmingham.",
    specs: ["4 social media designs", "Feed & story formats", "Brand guidelines styling", "Editable source files"],
  },
  {
    id: 5,
    title: "Church Program & Civic Event Suite",
    client: "New Joy Fellowship Baptist Church",
    category: "Editorial & Print Design",
    coins: 4,
    turnaround: "48–72 Hours",
    image: "/Project 4.png",
    description: "A coordinated print and digital event suite for a historic Birmingham community congregation.",
    specs: ["Print-ready program (300 DPI)", "Digital mobile version", "Social announcement graphics", "Archive vector files"],
  },
  {
    id: 6,
    title: "Custom Event Flyer Kit",
    client: "Local Culinary & Artisan Market",
    category: "Print & Social Launch Kit",
    coins: 2,
    turnaround: "48 Hours",
    image: "/Project 2.png",
    description: "Pre-scoped event kit: 1 high-res print flyer with 300 DPI press bleeds + matching Instagram square and story.",
    specs: ["1 Commercial Print Flyer (CMYK)", "1 Instagram Square (1080x1080)", "1 Instagram Story (1080x1920)", "Stored in Brand Vault"],
  },
];

const CAPABILITIES = [
  {
    role: "Brand Identity",
    headline: "Logos, brand books, typography systems, and vector icon suites.",
    icon: Palette,
    deliverables: "Vector SVG, AI, EPS, Brand Guide",
  },
  {
    role: "Commercial Print",
    headline: "300 DPI CMYK event flyers, menus, banners, and brochures.",
    icon: Printer,
    deliverables: "Press Bleed Crop Marks, CMYK",
  },
  {
    role: "Digital & Social",
    headline: "Feed campaigns, promotional graphics, and 9:16 story assets.",
    icon: Share2,
    deliverables: "1080x1080 Feed, 1080x1920 Story",
  },
  {
    role: "Product & Packaging",
    headline: "Die-lines, apparel graphics, labels, and product mockup decks.",
    icon: Layers,
    deliverables: "Die-Cut Specs, High-Res Handoff",
  },
  {
    role: "UI & Prototypes",
    headline: "Responsive web designs, SaaS landing layouts, and Figma handoffs.",
    icon: Layout,
    deliverables: "Figma Components, Design Tokens",
  },
];

export default function HomePage() {
  const [selected, setSelected] = useState<ProjectItem | null>(null);
  const [pricingTab, setPricingTab] = useState<"project" | "membership">("project");

  return (
    <main className="min-h-screen bg-[#FAF8F5] relative text-[#0F172A] selection:bg-[#FF5733]/20 selection:text-[#FF5733]">
      
      {/* Subtle Peach Wallpaper Pattern (Turned down so you can hardly see it) */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.07] z-0"
        style={{
          backgroundImage: "url('/brand/peach-pattern.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
        }}
      />
      
      {/* Top Announcement Strip with Deep Royal Blue & Aqua Accent */}
      <div className="relative z-10 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-sky-100 py-2.5 px-4 text-center text-xs font-medium tracking-wide border-b border-blue-900/50">
        <span className="inline-flex items-center gap-1.5 text-cyan-300 font-bold mr-1.5">
          📍 Birmingham&rsquo;s Creative Marketplace
        </span>
        <span className="text-slate-400">&bull;</span>{" "}
        <strong className="text-white font-semibold">Vetted Creatives at the touch of a button.</strong>{" "}
        <span className="text-slate-400">&bull;</span>{" "}
        <span className="text-blue-200">Quality design work &amp; Creative Support</span>
      </div>

      {/* 1. HEADER */}
      <header className="sticky top-0 z-40 bg-[#FFF5EE]/95 backdrop-blur-md border-b border-[#F0D5C7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo: Authentic Peach Network Emblem / Wordmark */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/brand/peach-network-logo.png"
              alt="Peach Network"
              className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-102"
            />
          </Link>

          {/* Menu Links: ALL IN A SINGLE ROW */}
          <nav className="flex items-center gap-3 sm:gap-6 lg:gap-8 text-xs sm:text-sm font-semibold text-[#142B20]/90 whitespace-nowrap overflow-x-auto no-scrollbar py-1">
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
          </nav>

          {/* Header Right: Sign In + Coral Start a Project CTA */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Sign In link */}
            <Link
              href="/auth?mode=signin"
              className="text-xs sm:text-sm font-semibold text-[#142B20] hover:text-[#FF5733] transition-colors px-2 py-1"
            >
              Sign In
            </Link>

            {/* Electric Coral Start a Project button */}
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center gap-1.5 bg-[#FF5733] hover:bg-[#E04826] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-md shadow-sm transition-all duration-150 hover:shadow"
            >
              Start a Project <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </Link>
          </div>

        </div>
      </header>

      {/* 2 & 3. HERO SECTION (Peach Theme with Vetted Creatives) */}
      <section className="relative overflow-hidden pt-8 pb-14 lg:pt-16 lg:pb-20 border-b border-[#F0D5C7] bg-gradient-to-b from-[#FDF2EC]/90 via-[#FCEAE0]/70 to-[#FAF8F5]/90">
        {/* Ambient Glows: Warm Peach + Refreshing Aqua/Blue Orbs */}
        <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-gradient-to-br from-[#FFD8C2]/40 via-[#38BDF8]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-10 w-[380px] h-[380px] bg-gradient-to-tr from-sky-400/20 via-[#FFE2D1]/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* HERO LEFT COLUMN */}
            <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
              
              {/* Creative Lockup Eyebrow: Birmingham's Creative Marketplace (Prominent & Stylish) */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-sky-400/40 text-xs font-bold tracking-wider text-white shadow-md mb-5 group">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
                </span>
                <span className="text-cyan-300 font-extrabold uppercase tracking-widest text-[11px] sm:text-xs">
                  BIRMINGHAM&rsquo;S CREATIVE MARKETPLACE
                </span>
                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-sky-300/60" />
                <span className="hidden sm:inline-flex items-center text-[10px] text-sky-200 bg-white/10 px-2 py-0.5 rounded-full border border-sky-300/30">
                  Magic City Creatives
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-[#142B20] leading-[1.12]">
                Vetted Creatives at the{" "}
                <span className="text-[#FF5733] italic font-serif">
                  touch of a button.
                </span>
              </h1>

              {/* Subhead: Quality design work & creative support */}
              <p className="mt-6 text-base sm:text-lg text-[#142B20]/80 leading-relaxed font-normal max-w-xl">
                Quality design work &amp; creative support for the South&rsquo;s business &amp; creative community. Fixed scopes, commercial pre-flight checks, and verified local talent ready to bring your vision to life.
              </p>

              {/* Agency Credential Credit */}
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#142B20] bg-white/80 border border-blue-200/60 px-3.5 py-1.5 rounded-md shadow-2xs">
                <span className="text-base leading-none">🍑</span>
                <span>Built by <strong className="text-[#FF5733]">Sweet As A Peach Creative Agency</strong></span>
                <span className="text-blue-600 font-semibold ml-1 border-l border-slate-300 pl-2 text-[11px]">Birmingham, AL</span>
              </div>

              {/* Exactly Two Buttons Below: Coral Primary & Clean White Secondary with Blue hover */}
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
                {/* Primary Call to Action Button: I am A Business (Electric Coral) */}
                <Link
                  href="/auth?mode=signup&role=business"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#FF5733] hover:bg-[#E04826] text-white text-base font-bold px-8 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150"
                >
                  I am A Business <ArrowRight className="w-4 h-4 text-white" />
                </Link>

                {/* Secondary Button: I am A Creative (Clean Crisp White with Stone Border & Blue hover) */}
                <Link
                  href="/apply"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50/50 text-[#142B20] hover:text-blue-700 border-2 border-[#E2E8F0] hover:border-blue-400 text-base font-bold px-8 py-4 rounded-lg shadow-2xs transition-all duration-150"
                >
                  I am A Creative
                </Link>
              </div>

              {/* Subtle Trust Indicators */}
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[#142B20]/80">
                <span className="flex items-center gap-1.5 text-[#142B20]">
                  <Check className="w-3.5 h-3.5 text-blue-600" /> Hand-vetted talent
                </span>
                <span className="text-slate-400 hidden sm:inline">&bull;</span>
                <span className="flex items-center gap-1.5 text-[#142B20]">
                  <Check className="w-3.5 h-3.5 text-blue-600" /> Direct creative match
                </span>
                <span className="text-slate-400 hidden sm:inline">&bull;</span>
                <span className="flex items-center gap-1.5 text-[#142B20]">
                  <Zap className="w-3.5 h-3.5 text-blue-600" /> Fast process
                </span>
              </div>
            </div>

            {/* HERO RIGHT COLUMN (Interactive 3D Floating Phone Mockup with iPad Studio & Books) */}
            <div className="lg:col-span-6 w-full flex items-center justify-center lg:justify-end">
              <PhoneHeroMockup />
            </div>

          </div>
        </div>
      </section>

      {/* 4. WOW FACTOR STRIP (Below Hero) */}
      <section className="py-12 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Zero Bidding Wars */}
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-lg shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-md bg-[#FAF8F5] border border-[#E2E8F0] flex items-center justify-center text-[#FF5733] mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">
                Zero Bidding Wars
              </h3>
              <p className="text-sm text-[#0F172A]/70 leading-relaxed">
                No bidding wars or spam proposals. Fixed project units pair your brief directly with verified creative specialists ready to execute immediately.
              </p>
            </div>

            {/* Card 2: 100% Vetted Talent */}
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-lg shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-md bg-[#FAF8F5] border border-[#E2E8F0] flex items-center justify-center text-[#142B20] mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">
                100% Vetted Talent
              </h3>
              <p className="text-sm text-[#0F172A]/70 leading-relaxed">
                Every designer and art director is hand-screened for commercial craft, vector precision, and strict print pre-flight reliability.
              </p>
            </div>

            {/* Card 3: Supporting Local Creatives */}
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-lg shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-md bg-[#FAF8F5] border border-[#E2E8F0] flex items-center justify-center text-[#FF5733] mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">
                Supporting Local Creatives
              </h3>
              <p className="text-sm text-[#0F172A]/70 leading-relaxed">
                Keeping marketing budgets and creative capital thriving locally across Birmingham and the South with equitable, transparent compensation.
              </p>
            </div>

            {/* Card 4: Protected Payments */}
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-lg shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-md bg-[#FAF8F5] border border-[#E2E8F0] flex items-center justify-center text-[#142B20] mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">
                Protected Payments
              </h3>
              <p className="text-sm text-[#0F172A]/70 leading-relaxed">
                Your coin funds remain completely protected and are only disbursed after you inspect and sign off on your commercial deliverables.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION (Clean 3-Step Process) */}
      <section id="how-it-works" className="py-20 bg-[#FAF8F5] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-bold tracking-widest text-[#FF5733] uppercase">
              STREAMLINED DISPATCH
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#142B20] mt-2">
              From Raw Idea to Commercial Asset in 3 Steps
            </h2>
            <p className="text-[#0F172A]/70 text-base mt-3">
              Simple fixed-scope ordering with automated pre-flight certification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 relative shadow-xs">
              <div className="text-xs font-mono font-bold text-[#FF5733] mb-2">STEP 01</div>
              <h3 className="text-xl font-bold text-[#142B20] mb-2">Scope Your Deliverable</h3>
              <p className="text-sm text-[#0F172A]/70 leading-relaxed">
                Select your pre-packaged creative item—from a 2-Coin Event Flyer Kit to a 10-Coin Web UI Prototype. No scope creep, no hourly surprises.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 relative shadow-xs">
              <div className="text-xs font-mono font-bold text-[#FF5733] mb-2">STEP 02</div>
              <h3 className="text-xl font-bold text-[#142B20] mb-2">Vetted Talent Dispatch</h3>
              <p className="text-sm text-[#0F172A]/70 leading-relaxed">
                Our dispatch engine matches your brief with a pre-screened creative skilled in your specific discipline. Rapid kick-off with zero bidding delays.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 relative shadow-xs">
              <div className="text-xs font-mono font-bold text-[#FF5733] mb-2">STEP 03</div>
              <h3 className="text-xl font-bold text-[#142B20] mb-2">Pre-Flight Delivery</h3>
              <p className="text-sm text-[#0F172A]/70 leading-relaxed">
                Receive commercial-grade assets: 300 DPI CMYK press bleed files, formatted feed &amp; story squares, plus permanent Brand Vault archival.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CREATIVE CAPABILITIES (NO human photos or headshots, clean corporate cards) */}
      <section id="why-choose-us" className="py-20 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-[#FF5733] uppercase">
                COMMERCIAL DISCIPLINES
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#142B20] mt-2">
                Enterprise Creative Support
              </h2>
              <p className="text-[#0F172A]/70 text-base mt-2">
                Hand-vetted creative disciplines ready to produce your marketing collateral.
              </p>
            </div>

            <Link
              href="/auth?mode=signup"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF5733] hover:underline"
            >
              Explore all packages <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAPABILITIES.map((c, i) => {
              const IconComp = c.icon;
              return (
                <div
                  key={i}
                  className="bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg p-6 hover:border-slate-300 transition-colors"
                >
                  <div className="w-12 h-12 rounded-md bg-white border border-[#E2E8F0] flex items-center justify-center text-[#142B20] mb-4">
                    <IconComp className="w-6 h-6 text-[#FF5733]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#142B20] mb-1.5">{c.role}</h3>
                  <p className="text-sm text-[#0F172A]/70 mb-4 leading-relaxed">{c.headline}</p>
                  <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-mono text-[#0F172A]/60">
                    <span>SPECS:</span>
                    <span className="font-semibold text-[#142B20]">{c.deliverables}</span>
                  </div>
                </div>
              );
            })}

            {/* Final CTA Card */}
            <div className="bg-[#142B20] text-white rounded-lg p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#FF5733] uppercase">CUSTOM INQUIRY</span>
                <h3 className="text-lg font-bold mt-1 text-white">Need a Multi-Asset Campaign?</h3>
                <p className="text-sm text-white/80 mt-2 leading-relaxed">
                  Our team packages custom multi-coin deliverables for large-scale launches, events, and rebrands.
                </p>
              </div>
              <Link
                href="/auth?mode=signup"
                className="mt-6 inline-flex items-center justify-center gap-2 bg-[#FF5733] hover:bg-[#E04826] text-white text-sm font-semibold px-4 py-2.5 rounded-md transition"
              >
                Request Custom Scope <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* PRICING SECTION (Clean Corporate Pricing Cards) */}
      <section id="pricing" className="py-20 bg-[#FAF8F5] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold tracking-widest text-[#FF5733] uppercase">
              TRANSPARENT PRICING
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#142B20] mt-2">
              Peach Coin Packages
            </h2>
            <p className="text-[#0F172A]/70 text-base mt-2">
              1 Peach Coin = $50 Standard Creative Value. Choose how you want to work.
            </p>

            {/* Toggle (Clean corporate rounded-md buttons, NO pills) */}
            <div className="mt-6 inline-flex p-1 bg-white border border-[#E2E8F0] rounded-md shadow-xs">
              <button
                type="button"
                onClick={() => setPricingTab("project")}
                className={`px-4 py-2 text-sm font-semibold rounded transition ${
                  pricingTab === "project"
                    ? "bg-[#142B20] text-white shadow-xs"
                    : "text-[#0F172A]/70 hover:text-[#0F172A]"
                }`}
              >
                By the Project (Pay-As-You-Go)
              </button>
              <button
                type="button"
                onClick={() => setPricingTab("membership")}
                className={`px-4 py-2 text-sm font-semibold rounded transition ${
                  pricingTab === "membership"
                    ? "bg-[#142B20] text-white shadow-xs"
                    : "text-[#0F172A]/70 hover:text-[#0F172A]"
                }`}
              >
                Monthly Memberships
              </button>
            </div>
          </div>

          {pricingTab === "project" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Package 1 */}
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="text-xs font-mono font-bold text-[#FF5733] uppercase">Quick Tasks</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#0F172A]">$50</span>
                    <span className="text-xs font-mono text-slate-500">/ Flat Rate</span>
                  </div>
                  <p className="text-xs text-[#0F172A]/70 mt-3 leading-relaxed">
                    Social promo graphic, menu price updates, event banner adjustments, or high-res vector conversion.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-xs font-mono text-slate-500 flex items-center justify-between">
                  <span>TURNAROUND</span>
                  <span className="font-bold text-[#142B20]">Fast Delivery</span>
                </div>
              </div>

              {/* Package 2 (Featured) */}
              <div className="bg-white border-2 border-[#FF5733] rounded-lg p-6 flex flex-col justify-between shadow-md relative">
                <div className="absolute -top-3 right-4 bg-[#FF5733] text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded">
                  MOST POPULAR
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#FF5733] uppercase">Launch Kits</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#0F172A]">$100</span>
                    <span className="text-xs font-mono text-slate-500">/ Flat Rate</span>
                  </div>
                  <p className="text-xs text-[#0F172A]/70 mt-3 leading-relaxed">
                    Event Flyer Kit: Print-ready 8.5x11 flyer (300 DPI CMYK) + matching Instagram square &amp; story assets.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-xs font-mono text-slate-500 flex items-center justify-between">
                  <span>TURNAROUND</span>
                  <span className="font-bold text-[#FF5733]">48 Hours</span>
                </div>
              </div>

              {/* Package 3 */}
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="text-xs font-mono font-bold text-[#FF5733] uppercase">Brand Starters</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#0F172A]">$300</span>
                    <span className="text-xs font-mono text-slate-500">/ Flat Rate</span>
                  </div>
                  <p className="text-xs text-[#0F172A]/70 mt-3 leading-relaxed">
                    Mini Brand Kit: Primary corporate logo, secondary mark, typography guidelines, color system, and master SVGs.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-xs font-mono text-slate-500 flex items-center justify-between">
                  <span>TURNAROUND</span>
                  <span className="font-bold text-[#142B20]">4–5 Days</span>
                </div>
              </div>

              {/* Package 4 */}
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="text-xs font-mono font-bold text-[#FF5733] uppercase">Web &amp; Prototypes</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#0F172A]">$500</span>
                    <span className="text-xs font-mono text-slate-500">/ Flat Rate</span>
                  </div>
                  <p className="text-xs text-[#0F172A]/70 mt-3 leading-relaxed">
                    Full responsive desktop &amp; mobile Figma design prototype with interactive transitions and developer handoff.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-xs font-mono text-slate-500 flex items-center justify-between">
                  <span>TURNAROUND</span>
                  <span className="font-bold text-[#142B20]">5–7 Days</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Membership 1 */}
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-7 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="text-xs font-mono font-bold text-[#0F172A]/60 uppercase">ESSENTIALS</div>
                  <div className="text-2xl font-black text-[#142B20] mt-1">$499 <span className="text-xs font-normal text-slate-500">/mo</span></div>
                  <div className="text-xs font-bold text-[#FF5733] mt-1">10 Peach Coins Monthly</div>
                  <p className="text-xs text-[#0F172A]/70 mt-4 leading-relaxed">
                    Ideal for ongoing graphic updates, weekly social promos, and monthly promotional collateral.
                  </p>
                </div>
                <Link
                  href="/auth?mode=signup"
                  className="mt-8 block text-center bg-[#FAF8F5] hover:bg-[#E2E8F0] text-[#0F172A] font-semibold text-sm py-2.5 rounded-md border border-[#E2E8F0] transition"
                >
                  Choose Essentials &rarr;
                </Link>
              </div>

              {/* Membership 2 (Growth) */}
              <div className="bg-white border-2 border-[#FF5733] rounded-lg p-7 flex flex-col justify-between shadow-md relative">
                <div className="absolute -top-3 right-4 bg-[#FF5733] text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded">
                  POPULAR
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#FF5733] uppercase">GROWTH</div>
                  <div className="text-2xl font-black text-[#142B20] mt-1">$1,099 <span className="text-xs font-normal text-slate-500">/mo</span></div>
                  <div className="text-xs font-bold text-[#FF5733] mt-1">24 Coins (+4 Bonus Coins)</div>
                  <p className="text-xs text-[#0F172A]/70 mt-4 leading-relaxed">
                    For scaling companies needing parallel design tasks, priority dispatch, and faster turnaround times.
                  </p>
                </div>
                <Link
                  href="/auth?mode=signup"
                  className="mt-8 block text-center bg-[#FF5733] hover:bg-[#E04826] text-white font-semibold text-sm py-2.5 rounded-md shadow-xs transition"
                >
                  Choose Growth &rarr;
                </Link>
              </div>

              {/* Membership 3 */}
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-7 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="text-xs font-mono font-bold text-[#0F172A]/60 uppercase">PARTNER</div>
                  <div className="text-2xl font-black text-[#142B20] mt-1">$2,199 <span className="text-xs font-normal text-slate-500">/mo</span></div>
                  <div className="text-xs font-bold text-[#FF5733] mt-1">50 Coins (+10 Bonus Coins)</div>
                  <p className="text-xs text-[#0F172A]/70 mt-4 leading-relaxed">
                    Full creative team replacement for high-volume content, video graphics, packaging, and campaigns.
                  </p>
                </div>
                <Link
                  href="/auth?mode=signup"
                  className="mt-8 block text-center bg-[#FAF8F5] hover:bg-[#E2E8F0] text-[#0F172A] font-semibold text-sm py-2.5 rounded-md border border-[#E2E8F0] transition"
                >
                  Choose Partner &rarr;
                </Link>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* REAL DELIVERABLES GALLERY */}
      <section id="about" className="py-20 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-[#FF5733] uppercase">
                PORTFOLIO ARCHIVE
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#142B20] mt-2">
                Real Commercial Deliverables
              </h2>
              <p className="text-[#0F172A]/70 text-base mt-2">
                Click any project deliverable to inspect scope, specs, and coin investment.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p)}
                className="group text-left bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg overflow-hidden hover:border-slate-300 transition-all hover:shadow-md flex flex-col"
              >
                <div className="h-52 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#142B20] border border-[#E2E8F0]">
                    {p.coins} Peach Coins
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-mono font-bold text-[#FF5733] uppercase mb-1">
                      {p.category}
                    </div>
                    <h3 className="text-base font-bold text-[#142B20] line-clamp-1 group-hover:text-[#FF5733] transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-[#0F172A]/70 mt-1 line-clamp-2">
                      {p.description}
                    </p>

                    {p.designer && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center gap-1.5 text-xs text-[#142B20]">
                        <span className="w-5 h-5 rounded-full bg-[#142B20] text-[#38BDF8] text-[9px] font-bold flex items-center justify-center shrink-0">
                          {p.designer[0]}
                        </span>
                        <div className="truncate">
                          <span className="font-bold">{p.designer}</span>
                          <span className="text-slate-400 mx-1">&bull;</span>
                          <span className="text-[11px] text-[#0284C7] font-medium">{p.designerRole}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-mono text-slate-500">
                    <span>{p.turnaround}</span>
                    <span className="font-semibold text-[#142B20] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Inspect &rarr;
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* BIRMINGHAM SKYLINE / CALL TO ACTION */}
      <section className="py-20 bg-[#142B20] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs font-mono font-bold tracking-widest text-[#FF5733] uppercase">
            POWERED BY SWEET AS A PEACH CREATIVE AGENCY
          </span>
          <h2 className="text-3xl sm:text-5xl font-black mt-3 tracking-tight">
            Ready to Elevate Your Brand Assets?
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mt-4 text-base sm:text-lg leading-relaxed">
            Get commercial-grade graphic design, branding, and marketing collateral with predictable coin pricing and pre-flight quality guarantees.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center gap-2 bg-[#FF5733] hover:bg-[#E04826] text-white font-semibold text-base px-8 py-3.5 rounded-md shadow-sm transition"
            >
              Start a Project <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 bg-transparent hover:bg-white/10 text-white font-semibold text-base px-8 py-3.5 rounded-md border border-white/20 transition"
            >
              Become a Creative
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
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E2E8F0] shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#0F172A] p-1.5 rounded-md hover:bg-slate-100 transition"
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

            <div className="p-6">
              <span className="text-xs font-mono font-bold text-[#FF5733] uppercase">
                {selected.category}
              </span>
              <h3 className="text-2xl font-extrabold text-[#142B20] mt-1">
                {selected.title}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Client: {selected.client}
              </p>

              {selected.designer && (
                <div className="mt-3 p-3 rounded-lg bg-[#FAF8F5] border border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#142B20] text-[#38BDF8] text-xs font-bold flex items-center justify-center shadow-xs shrink-0">
                      {selected.designer[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#142B20]">
                        Designed by {selected.designer}
                      </div>
                      <div className="text-[11px] text-[#0284C7] font-semibold">
                        {selected.designerRole}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                    Verified Creative
                  </span>
                </div>
              )}

              <p className="text-sm text-[#0F172A]/80 mt-4 leading-relaxed">
                {selected.description}
              </p>

              <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
                <div className="text-xs font-mono font-bold text-[#142B20] mb-2">DELIVERABLE SPECIFICATIONS:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-600">
                  {selected.specs.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm font-mono">
                  <span className="text-slate-500">Fixed Scope: </span>
                  <strong className="text-[#FF5733] font-bold">{selected.coins} Peach Coins (${selected.coins * 50})</strong>
                </div>

                <Link
                  href="/auth?mode=signup"
                  onClick={() => setSelected(null)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF5733] hover:bg-[#E04826] text-white text-sm font-semibold px-6 py-2.5 rounded-md transition shadow-sm"
                >
                  Start Similar Project <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#E2E8F0] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="text-base font-extrabold text-[#142B20]">Peach Network</div>
            <div className="text-xs text-slate-500 mt-1">
              Powered by Sweet As A Peach Creative Agency &bull; Birmingham, Alabama
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-600">
            <Link href="/business" className="hover:text-[#FF5733] transition">Business Hub</Link>
            <Link href="/creative" className="hover:text-[#FF5733] transition">Creative Portal</Link>
            <Link href="/legal/terms" className="hover:text-[#FF5733] transition">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-[#FF5733] transition">Privacy</Link>
            <Link href="/legal/peach-coins" className="hover:text-[#FF5733] transition">Coin Rules</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
