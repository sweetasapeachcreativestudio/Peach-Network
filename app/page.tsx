"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Check, ChevronLeft, ChevronRight, ArrowRight, Eye, Star, Play, Pause, Search, Mail, Send, Copy, ExternalLink } from "lucide-react";

interface ProjectItem {
  id: number;
  title: string;
  client: string;
  category: string;
  categoryKey: string;
  coins: number;
  timeline: string;
  image: string;
  description: string;
  specs: string[];
  designer?: string;
  designerRole?: string;
  designerAvatar?: string;
  hub?: string;
}

const PROJECTS: ProjectItem[] = [
  {
    id: 1,
    title: "Social Media Marketing Posts",
    client: "Lawson State Community College",
    category: "Social Media Marketing",
    categoryKey: "social",
    coins: 2,
    timeline: "Est. 2–3 Days",
    image: "/Project 1.png",
    designer: "Jeremiah",
    designerRole: "Graphic Designer & Content Creator",
    designerAvatar: "/Creative1.JPG",
    hub: "Birmingham Hub",
    description:
      "Campaign announcement graphics and promotional social media marketing posts designed for Lawson State Community College in Birmingham.",
    specs: [
      "1:1 Feed Square & 9:16 Vertical Story Formats",
      "Branded College Typography & Official Colors",
      "300 DPI Pre-Flight Approved Digital Master Assets",
      "Multi-Post Campaign Template Handoff",
    ],
  },
  {
    id: 2,
    title: "Logo & Brand Identity Suite",
    client: "Bessemer Area Chamber of Commerce",
    category: "Logo & Branding",
    categoryKey: "brand",
    coins: 6,
    timeline: "Est. 4–5 Days",
    image: "/Project 3.png",
    designer: "Donovon",
    designerRole: "Graphic Designer (SCAD)",
    designerAvatar: "/Creative2.jpg",
    hub: "Savannah Georgia Hub",
    description:
      "Official civic chamber logo, primary seal lockup, signage vectors, and comprehensive brand guidelines designed by Donovon from the Savannah Georgia Hub.",
    specs: [
      "Primary Civic Seal & Horizontal Lockup",
      "100% Scalable Vector Handoff (.AI, .SVG, .EPS)",
      "Signage, Embroidery & Apparel Print Vector Specs",
      "Commercial Brand Guidelines & Color Tokens",
    ],
  },
  {
    id: 3,
    title: "Community Program Booklet",
    client: "New Joy Fellowship Baptist Church",
    category: "Booklets & Editorial",
    categoryKey: "booklet",
    coins: 4,
    timeline: "Est. 3–4 Days",
    image: "/Project 4.png",
    designer: "Stephanie Stewart",
    designerRole: "Art Director & Editorial Designer",
    designerAvatar: "/Creative4.jpg",
    hub: "Birmingham Hub",
    description:
      "Multi-page community program booklet and commemorative publication layout designed for New Joy Fellowship Baptist Church in Birmingham.",
    specs: [
      "Multi-Page Saddle-Stitch Publication Layout",
      "Commercial 300 DPI CMYK Print Bleeds & Crop Marks",
      "Accessible Editorial Typography & Spread Balancing",
      "Print-Ready Commercial Proof PDF",
    ],
  },
  {
    id: 4,
    title: "Anniversary Celebration Menu",
    client: "New Joy Fellowship Baptist Church",
    category: "Menus & Event Print",
    categoryKey: "menu",
    coins: 2,
    timeline: "Est. 2–3 Days",
    image: "/Project 2.png",
    designer: "Stephanie Stewart",
    designerRole: "Art Director & Graphic Designer",
    designerAvatar: "/Creative4.jpg",
    hub: "Birmingham Hub",
    description:
      "Custom printed celebration banquet menu and event program designed for New Joy Fellowship Baptist Church in Birmingham.",
    specs: [
      "Double-Sided Banquet Menu Layout & Typography",
      "300 DPI CMYK Commercial Print Bleeds",
      "Elegant Ceremonial Gold & Charcoal Styling",
      "Press-Ready Master PDF with Trim Specifications",
    ],
  },
  {
    id: 5,
    title: "Custom Vector Character Illustration",
    client: "Runa Creative & Apparel",
    category: "Custom Illustration",
    categoryKey: "illustration",
    coins: 4,
    timeline: "Est. 3–4 Days",
    image: "/project 7.jpg",
    designer: "Jose Garcia",
    designerRole: "Illustrator & ADDY Winner",
    designerAvatar: "/jose-creative.jpg",
    hub: "Troy Alabama Hub",
    description:
      "Bespoke stylized vector illustration and character artwork created by ADDY Award-winner Jose Garcia from the Troy Alabama Hub.",
    specs: [
      "100% Scalable Vector Illustration (.AI, .SVG)",
      "Custom Character & Dynamic Scenic Composition",
      "Full Commercial Artwork Copyright Release",
      "High-Resolution Transparent PNG & Screen Previews",
    ],
  },
];

const POPULAR_CATEGORIES = [
  { id: "social", label: "Social Media", index: 0 },
  { id: "brand", label: "Logo & Brand", index: 1 },
  { id: "booklet", label: "Booklets", index: 2 },
  { id: "menu", label: "Menus", index: 3 },
  { id: "illustration", label: "Illustration", index: 4 },
] as const;

interface TrustedClientLogo {
  id: string;
  name: string;
  logo: string;
  fallbackLogo?: string;
  projectIndex: number;
}

const TRUSTED_CLIENT_LOGOS: TrustedClientLogo[] = [
  {
    id: "lawson",
    name: "Lawson State Community College",
    logo: "/assets/aistudio/Lawson-logo_a521bfc8.png",
    projectIndex: 0,
  },
  {
    id: "bessemer",
    name: "Bessemer Area Chamber of Commerce",
    logo: "/assets/aistudio/bessemer-chamber-logo-transparent.png",
    fallbackLogo: "/assets/aistudio/Heading__Instagram_Post__45___-_4_b6a2c37c.PNG",
    projectIndex: 1,
  },
  {
    id: "newjoy",
    name: "New Joy Fellowship Baptist Church",
    logo: "/assets/aistudio/new-joy-seal-transparent.png",
    fallbackLogo: "/assets/aistudio/Gemini_Generated_Image_ub3xaoub3xaoub3x_caae32e1.jpg",
    projectIndex: 2,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<ProjectItem | null>(null);
  const [pricingTab, setPricingTab] = useState<"project" | "membership">("project");

  // Peach Match AI Hero Search / Prompt
  const [heroPrompt, setHeroPrompt] = useState("");

  const handlePeachMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = heroPrompt.trim() ? `?prompt=${encodeURIComponent(heroPrompt.trim())}` : "";
    router.push(`/login${query}`);
  };

  // Hero Project Showcase State with Auto-Movement
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Automatically advance project showcase every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % PROJECTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const activeProject = PROJECTS[featuredIndex % PROJECTS.length] || PROJECTS[0];

  // Client Trust Ribbon Slide State
  const [isTrustPaused, setIsTrustPaused] = useState<boolean>(false);

  // Basic Contact / Partner / Question Form
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactTopic, setContactTopic] = useState("Question About the App");
  const [contactMessage, setContactMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactError, setContactError] = useState("");
  const [mailtoBackup, setMailtoBackup] = useState("");
  const [gmailBackup, setGmailBackup] = useState("");
  const [copiedNote, setCopiedNote] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    const name = contactName.trim();
    const email = contactEmail.trim();
    const topic = contactTopic.trim();
    const message = contactMessage.trim();

    if (!name || !email || !message) {
      e.preventDefault();
      setContactError("Please fill in your name, email, and message.");
      return;
    }

    setSubmittingContact(true);
    setContactError("");

    const targetEmail = "sweetasapeachcreativestudio@gmail.com";
    const subject = `[Peach Network] ${topic} from ${name}`;
    const mailtoSubject = encodeURIComponent(subject);
    const mailtoBody = encodeURIComponent(
      `Hi Sweet As A Peach Studio,\n\n${message}\n\n━━━━━━━━━━━━━━━━━━━━\nSender: ${name}\nEmail: ${email}\nTopic: ${topic}`
    );
    const directMailto = `mailto:${targetEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;
    const directGmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${mailtoSubject}&body=${mailtoBody}`;

    setMailtoBackup(directMailto);
    setGmailBackup(directGmail);

    // 1. Try client-side AJAX to FormSubmit
    try {
      await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          _replyto: email,
          _subject: subject,
          _template: "table",
          _captcha: "false",
          topic,
          message,
        }),
      });
    } catch (fsErr) {
      console.warn("Client FormSubmit attempt:", fsErr);
    }

    // 2. Also log and record to our internal API endpoint
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic, message }),
      });
    } catch (apiErr) {
      console.warn("Internal contact record attempt:", apiErr);
    }

    setFormSubmitted(true);
    setSubmittingContact(false);
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
            <a href="#highlights" className="hover:text-[#FF5733] transition-colors">
              Explore Work
            </a>
            <a href="#how-it-works" className="hover:text-[#FF5733] transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-[#FF5733] transition-colors">
              Pricing
            </a>
            <a href="#about" className="hover:text-[#FF5733] transition-colors">
              About Us
            </a>
            <a href="#contact" className="hover:text-[#FF5733] transition-colors">
              Contact
            </a>
          </nav>

          {/* Header Right: Bright Green Sign In Button */}
          <div className="flex items-center shrink-0">
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 rounded-xl shadow-xs hover:shadow transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* 2. 99DESIGNS-STYLE CLEAN HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-14 lg:pt-14 lg:pb-16 border-b border-[#F0D5C7] bg-gradient-to-b from-[#FFF5EE] via-[#FDECE2]/60 to-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* HERO LEFT COLUMN: UNBOXED FLOATING SHOWCASE (Inspired by 99designs) */}
            <div className="lg:col-span-6 w-full flex flex-col items-center justify-center order-2 lg:order-1 relative">
              {/* Soft ambient gradient glow for depth and fun peach/blue/green accent */}
              <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#FF5733]/20 via-[#2563EB]/15 to-[#22C55E]/20 blur-3xl pointer-events-none -z-0" />

              {/* Main Artwork Showcase - 100% UNBOXED, NO CARD BORDER, NO BACKGROUND BOX */}
              <div
                className="relative w-full max-w-md sm:max-w-lg aspect-[4/3] flex items-center justify-center cursor-pointer group z-10 p-2"
                onClick={() => setSelected(activeProject)}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <img
                  src={activeProject.image}
                  alt={activeProject.title}
                  className="max-h-full max-w-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-103"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = "0";
                  }}
                />

                {/* Floating Attribution Speech-Bubble Pill (99designs style: vibrant blue with pointer) */}
                <div className="absolute bottom-2 sm:bottom-4 left-3 sm:left-6 flex items-center gap-2 z-20 transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="relative flex items-center gap-2 bg-[#2563EB] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg">
                    {/* Speech bubble pointer triangle pointing up/left to design */}
                    <div className="absolute -top-1 left-4 w-2.5 h-2.5 bg-[#2563EB] rotate-45" />

                    {activeProject.designerAvatar ? (
                      <img
                        src={activeProject.designerAvatar}
                        alt={activeProject.designer || "Creative"}
                        className="w-5 h-5 rounded-full object-cover border border-white/80 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white text-[#2563EB] text-[10px] font-black flex items-center justify-center shrink-0">
                        {activeProject.designer?.[0] || "P"}
                      </div>
                    )}
                    <span className="truncate max-w-[170px] sm:max-w-[220px]">
                      {activeProject.category} by {activeProject.designer}
                    </span>
                  </div>

                  {/* Bright Green Coin Value Pill */}
                  <span className="bg-[#22C55E] text-slate-950 text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                    {activeProject.coins} {activeProject.coins === 1 ? "Coin" : "Coins"}
                  </span>
                </div>
              </div>

              {/* Client & Hub Attribution: Italic Serif text (99designs style) */}
              <p className="mt-3 text-xs sm:text-sm text-slate-600 italic font-serif text-center z-10">
                Created for {activeProject.client} &bull;{" "}
                <span className="font-sans not-italic font-bold text-[#FF5733]">
                  {activeProject.hub}
                </span>
              </p>

              {/* Pagination Dots & Pause/Resume Control */}
              <div className="mt-4 flex items-center justify-center gap-3 z-10">
                <div className="flex items-center gap-2">
                  {PROJECTS.map((item, idx) => {
                    const isActive = idx === featuredIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFeaturedIndex(idx)}
                        className={`transition-all rounded-full cursor-pointer ${
                          isActive
                            ? "w-7 h-2.5 bg-slate-900"
                            : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400"
                        }`}
                        aria-label={`Show ${item.title}`}
                      />
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors px-2 py-1 rounded-md hover:bg-white/80 flex items-center gap-1.5 cursor-pointer ml-1"
                  title={isPaused ? "Resume auto-movement" : "Pause auto-movement"}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-3 h-3 fill-current text-slate-700" />
                      <span className="text-[11px]">Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3 h-3 fill-current text-slate-700" />
                      <span className="text-[11px]">Pause</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* HERO RIGHT COLUMN: HEADLINE, SUBHEAD, SEARCH & POPULAR CHIPS */}
            <div className="lg:col-span-6 flex flex-col items-start text-left z-10 order-1 lg:order-2">
              <div className="text-xs font-black uppercase tracking-wider text-[#FF5733] mb-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <span>Birmingham&rsquo;s Creative Marketplace</span>
              </div>

              {/* Exact Requested Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-slate-950 leading-[1.08] text-balance">
                Commercial design for your business.{" "}
                <span className="text-[#2563EB] block sm:inline">
                  Done right, without the runaround.
                </span>
              </h1>

              {/* Exact Requested Subhead */}
              <p className="mt-5 text-base sm:text-lg text-slate-700 leading-relaxed max-w-xl">
                Skip the 40-proposal bidding wars. Peach Network pairs you directly with vetted Birmingham commercial artists at transparent coin rates—with clear milestones, prompt delivery, and full asset ownership.
              </p>

              {/* 99designs-Style Search / Project Launch Bar */}
              <form onSubmit={handlePeachMatchSubmit} className="mt-7 w-full max-w-xl">
                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white border-2 border-[#F0D5C7] focus-within:border-[#2563EB] rounded-2xl sm:rounded-full p-1.5 shadow-sm transition-all gap-2">
                  <div className="flex items-center gap-2.5 px-3.5 py-2 flex-1 min-w-0">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={heroPrompt}
                      onChange={(e) => setHeroPrompt(e.target.value)}
                      placeholder="What do you need designed?"
                      className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="shrink-0 bg-[#FF5733] hover:bg-[#E04826] text-white text-sm font-bold px-6 py-3 rounded-xl sm:rounded-full transition-all cursor-pointer whitespace-nowrap shadow-md hover:shadow-lg active:scale-98"
                  >
                    Hire A Creative
                  </button>
                </div>
              </form>

              {/* Popular Categories: Clean 99designs-Style Rounded Chips */}
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-700 mr-1">Popular:</span>
                {POPULAR_CATEGORIES.map((cat) => {
                  const isSelected = featuredIndex === cat.index;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFeaturedIndex(cat.index)}
                      className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#FF5733] text-white shadow-xs"
                          : "bg-slate-200/70 hover:bg-slate-300 text-slate-800"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
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

      {/* 2.5 CLIENT LOGOS SHOWCASE (Logos Only Scrolling By) */}
      <section className="bg-gradient-to-b from-[#FFF5EE]/90 via-white to-[#FAF8F5] border-b border-[#F0D5C7] py-10 sm:py-12 relative overflow-hidden">
        {/* Soft Multi-Color Ambient Glow: Peach (#FF5733), Bright Blue (#2563EB), Bright Green (#22C55E) */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-[#FF5733]/12 blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-[#2563EB]/10 blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-36 rounded-full bg-[#22C55E]/12 blur-3xl pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#FF5733]/10 text-[#FF5733] border border-[#FF5733]/20 mb-3 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span>Client Showcase</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-950 uppercase font-sans">
            TRUSTED BY BUSINESSES, CIVIC LEADERS &amp;{" "}
            <span className="text-[#2563EB]">GROWING BRANDS.</span>
          </h2>
        </div>

        {/* Continuous Smooth Horizontal Sliding Logo Ribbon (Logos Only) */}
        <div 
          className="relative w-full overflow-hidden py-4 select-none"
          onMouseEnter={() => setIsTrustPaused(true)}
          onMouseLeave={() => setIsTrustPaused(false)}
        >
          {/* Subtle edge fade overlays for infinite slider depth */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#FFF5EE] to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#FAF8F5] to-transparent z-20 pointer-events-none" />

          <div 
            className="animate-trust-slide flex items-center gap-14 sm:gap-20 md:gap-28 px-4"
            style={{ animationPlayState: isTrustPaused ? "paused" : "running" }}
          >
            {/* Repeat the 3 logos 6 times for seamless continuous flow */}
            {[0, 1, 2, 3, 4, 5].map((loopIdx) => (
              <div key={loopIdx} className="flex items-center gap-14 sm:gap-20 md:gap-28 shrink-0">
                {/* 1. Lawson State Community College */}
                <div 
                  className="flex items-center justify-center h-16 sm:h-20 w-44 sm:w-52 transition-transform duration-300 hover:scale-108 cursor-pointer"
                  onClick={() => setSelected(PROJECTS[0])}
                  title="Lawson State Community College"
                >
                  <img
                    src="/assets/aistudio/Lawson-logo_a521bfc8.png"
                    alt="Lawson State Community College"
                    className="max-h-14 sm:max-h-16 w-auto object-contain drop-shadow-2xs filter hover:brightness-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>

                {/* 2. Bessemer Area Chamber of Commerce */}
                <div 
                  className="flex items-center justify-center h-16 sm:h-20 w-44 sm:w-52 transition-transform duration-300 hover:scale-108 cursor-pointer"
                  onClick={() => setSelected(PROJECTS[1])}
                  title="Bessemer Area Chamber of Commerce"
                >
                  <img
                    src="/assets/aistudio/bessemer-chamber-logo-transparent.png"
                    alt="Bessemer Area Chamber of Commerce"
                    className="max-h-11 sm:max-h-13 w-auto object-contain filter hover:brightness-105"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (!img.src.includes("Heading__Instagram_Post")) {
                        img.src = "/assets/aistudio/Heading__Instagram_Post__45___-_4_b6a2c37c.PNG";
                      } else {
                        img.style.display = "none";
                      }
                    }}
                  />
                </div>

                {/* 3. New Joy Fellowship Baptist Church */}
                <div 
                  className="flex items-center justify-center h-16 sm:h-20 w-36 sm:w-44 transition-transform duration-300 hover:scale-108 cursor-pointer"
                  onClick={() => setSelected(PROJECTS[2])}
                  title="New Joy Fellowship Baptist Church"
                >
                  <img
                    src="/assets/aistudio/new-joy-seal-transparent.png"
                    alt="New Joy Fellowship Baptist Church"
                    className="max-h-16 sm:max-h-18 w-auto object-contain drop-shadow-xs filter hover:brightness-105"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (!img.src.includes("Gemini_Generated_Image_ub3xaoub3xaoub3x")) {
                        img.src = "/assets/aistudio/Gemini_Generated_Image_ub3xaoub3xaoub3x_caae32e1.jpg";
                      } else {
                        img.style.display = "none";
                      }
                    }}
                  />
                </div>
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
                  Hire a Creative &rarr;
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
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. REAL COMMERCIAL DELIVERABLES GALLERY */}
      <section id="highlights" className="py-24 bg-[#FAF8F5] border-b border-slate-200">
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
              Hire a creative today &rarr;
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
                <div className="h-64 w-full overflow-hidden bg-[#FAF8F5] relative flex items-center justify-center p-4 border-b border-slate-100">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0";
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-md text-xs font-bold text-slate-950 border border-slate-200 shadow-2xs">
                    {p.coins} {p.coins === 1 ? "Coin" : "Coins"}
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
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-900">
                        <div className="flex items-center gap-2 min-w-0">
                          {p.designerAvatar ? (
                            <img
                              src={p.designerAvatar}
                              alt={p.designer}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-slate-900 text-sky-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {p.designer[0]}
                            </span>
                          )}
                          <div className="truncate">
                            <span className="font-bold text-slate-950">{p.designer}</span>
                            <span className="text-slate-400 mx-1">&bull;</span>
                            <span className="text-slate-500 font-medium">{p.designerRole}</span>
                          </div>
                        </div>
                        {p.hub && (
                          <span className="text-[10px] font-black uppercase text-[#C84E2D] bg-[#FFF2EB] px-2 py-0.5 rounded shrink-0">
                            {p.hub}
                          </span>
                        )}
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5733]/10 text-[#FF5733] text-xs font-bold uppercase tracking-wider mb-3">
              <Mail className="w-3.5 h-3.5" />
              <span>Get in Touch</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
              Have a Question or Want to Partner?
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
              Send our Birmingham studio a note directly to{" "}
              <a
                href="mailto:sweetasapeachcreativestudio@gmail.com"
                className="font-bold text-[#FF5733] hover:underline"
              >
                sweetasapeachcreativestudio@gmail.com
              </a>{" "}
              and we&rsquo;ll get right back to you.
            </p>
          </div>

          <div className="bg-[#FAF8F5] border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs relative">
            {/* Hidden iframe so FormSubmit posts directly without navigating away */}
            <iframe name="formsubmit_frame" id="formsubmit_frame" style={{ display: "none" }} />

            {formSubmitted ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mb-4 font-bold text-2xl">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-950 mb-2">Message Dispatched!</h3>
                <p className="text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{contactName}</strong>! Your note regarding{" "}
                  <strong>&ldquo;{contactTopic}&rdquo;</strong> has been submitted to{" "}
                  <strong className="text-[#FF5733]">sweetasapeachcreativestudio@gmail.com</strong>.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Our Birmingham studio team will follow up at <strong>{contactEmail}</strong> shortly.
                </p>

                {/* Direct 1-Click Launchers so user has 100% guarantee their email sends */}
                <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200 text-left max-w-lg mx-auto shadow-xs">
                  <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-[#FF5733]" />
                    <span>Instant Send & Verification Shortcuts</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Your form was sent to our server and FormSubmit. You can also launch Gmail or your mail app below with your message already drafted:
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {gmailBackup && (
                      <a
                        href={gmailBackup}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#EA4335] hover:bg-[#D93025] text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xs transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Send via Web Gmail
                      </a>
                    )}
                    {mailtoBackup && (
                      <a
                        href={mailtoBackup}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xs transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Open in Mail App
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(
                            `To: sweetasapeachcreativestudio@gmail.com\nSubject: [Peach Network] ${contactTopic} from ${contactName}\n\n${contactMessage}\n\nFrom: ${contactName} (${contactEmail})`
                          );
                          setCopiedNote(true);
                          setTimeout(() => setCopiedNote(false), 2500);
                        }
                      }}
                      className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedNote ? "Copied!" : "Copy Note"}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setFormSubmitted(false);
                      setContactName("");
                      setContactEmail("");
                      setContactMessage("");
                      setContactError("");
                      setCopiedNote(false);
                    }}
                    className="inline-flex items-center justify-center bg-white border border-slate-300 text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Send Another Note
                  </button>
                </div>
              </div>
            ) : (
              <form
                action="https://formsubmit.co/sweetasapeachcreativestudio@gmail.com"
                method="POST"
                target="formsubmit_frame"
                onSubmit={handleContactSubmit}
                className="space-y-5"
              >
                {/* FormSubmit Configuration Fields */}
                <input
                  type="hidden"
                  name="_subject"
                  value={`[Peach Network] ${contactTopic} from ${contactName || "Website Visitor"}`}
                />
                <input type="hidden" name="_replyto" value={contactEmail} />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="table" />

                {contactError && (
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span>{contactError}</span>
                    <a
                      href={`mailto:sweetasapeachcreativestudio@gmail.com?subject=${encodeURIComponent(
                        `[Peach Network] ${contactTopic}`
                      )}&body=${encodeURIComponent(contactMessage)}`}
                      className="font-bold underline text-red-900 hover:text-red-700 whitespace-nowrap"
                    >
                      Click here to email directly &rarr;
                    </a>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
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
                    name="email"
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
                    name="topic"
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
                    name="message"
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us what you're thinking or how we can collaborate..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-[#FF5733] transition-colors resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingContact}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#FF5733] hover:bg-[#E04826] disabled:opacity-75 text-white font-bold text-sm py-3.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    {submittingContact ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending to sweetasapeachcreativestudio@gmail.com...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Note to sweetasapeachcreativestudio@gmail.com &rarr;</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-500">
                    Prefer direct email? Write to{" "}
                    <a
                      href="mailto:sweetasapeachcreativestudio@gmail.com"
                      className="font-semibold text-slate-800 hover:text-[#FF5733] underline"
                    >
                      sweetasapeachcreativestudio@gmail.com
                    </a>
                  </span>
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
              Hire a Creative &rarr;
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

            <div className="h-72 sm:h-80 w-full bg-[#FAF8F5] overflow-hidden flex items-center justify-center p-6 border-b border-slate-100">
              <img
                src={selected.image}
                alt={selected.title}
                className="max-h-full max-w-full object-contain drop-shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "0";
                }}
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
                <div className="mt-4 p-3.5 rounded-xl bg-[#FAF8F5] border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {selected.designerAvatar ? (
                      <img
                        src={selected.designerAvatar}
                        alt={selected.designer}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-sky-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {selected.designer[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-950 truncate">
                        Designed by {selected.designer}
                      </div>
                      <div className="text-[11px] text-[#0284C7] font-semibold truncate">
                        {selected.designerRole}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {selected.hub && (
                      <span className="text-[10px] font-black uppercase text-[#C84E2D] bg-[#FFF2EB] border border-[#F2C2B2] px-2 py-0.5 rounded">
                        {selected.hub}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Verified Creative
                    </span>
                  </div>
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
                  <strong className="text-[#C84E2D] font-bold">
                    {selected.coins} Peach {selected.coins === 1 ? "Coin" : "Coins"}
                  </strong>
                </div>

                <Link
                  href="/login"
                  onClick={() => setSelected(null)}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-[#FF5733] hover:bg-[#E04826] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-xs"
                >
                  Hire a Creative for This &rarr;
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
                    Hire a Creative &rarr;
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
