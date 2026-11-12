"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Layers,
  FileCheck2,
  FolderLock,
  ArrowRight,
} from "lucide-react";

interface FAQItem {
  id: string;
  category: "pricing" | "scoping" | "escrow" | "catalog";
  categoryLabel: string;
  question: string;
  answer: React.ReactNode;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "pricing-usd",
    category: "pricing",
    categoryLabel: "Pricing & Coins",
    question: "How does Peach Coin pricing work in USD?",
    answer: (
      <div className="space-y-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
        <p>
          Every service on Peach Network is pegged to our transparent master rate:{" "}
          <strong className="text-stone-900 font-extrabold">1 Peach Coin = Exactly $50.00 USD</strong>.
        </p>
        <p>
          Coins function as predictable, standardized creative credits. When you initiate a project,
          the exact coin quote is placed into protected escrow and only released once you review and
          approve completed milestones. There are no surprise hourly overages, hidden platform fees, or quote markups.
        </p>
      </div>
    ),
  },
  {
    id: "v1-catalog",
    category: "catalog",
    categoryLabel: "Services & Scope",
    question: "What services does Peach Network offer in Version 1?",
    answer: (
      <div className="space-y-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
        <p>
          In Version 1, Peach Network exclusively focuses on 6 high-demand commercial disciplines executed
          by vetted specialists in our regional creative hubs:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-stone-700 font-medium pl-1">
          <li className="flex items-center gap-1.5">
            <span className="text-[#C84E2D] font-black">&bull;</span>
            <span><strong>Website Design:</strong> UI/UX, Landing Pages, Multi-Page, Shopify/Webflow Hubs</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-[#C84E2D] font-black">&bull;</span>
            <span><strong>Branding Design:</strong> Core Logos, Vector Kits, Brand Sheets, Commercial Overhauls</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-[#C84E2D] font-black">&bull;</span>
            <span><strong>Commercial Photography:</strong> Executive Portraits, Products, Culinary Shoots</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-[#C84E2D] font-black">&bull;</span>
            <span><strong>Social Media Design:</strong> Feed Packs, Carousels, Monthly Suites + Video Reels</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-[#C84E2D] font-black">&bull;</span>
            <span><strong>Graphic Design:</strong> Event Flyers, Multi-Page Menus, Packaging Die-Lines</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-[#C84E2D] font-black">&bull;</span>
            <span><strong>Creative Direction:</strong> Scoping, Art Direction &amp; Match Curation</span>
          </li>
        </ul>
        <p className="text-[11px] text-stone-500 pt-1">
          Disciplines not yet in V1 (such as native mobile app coding, full SEO/PPC retainers, or 3D CGI) can be requested
          directly below in our Business Feedback tab so our roadmap team can prioritize them.
        </p>
      </div>
    ),
  },
  {
    id: "ai-scoping-process",
    category: "scoping",
    categoryLabel: "Scoping & Matching",
    question: "How does Peach Match AI scope my project without overquoting?",
    answer: (
      <div className="space-y-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
        <p>
          Peach Match AI follows our strict agency philosophy: <strong className="text-stone-900 font-bold">"Diagnose First, Price Second."</strong>
        </p>
        <p>
          Instead of throwing arbitrary price tags at open-ended requests, the AI concierge asks 2 to 3 quick diagnostic questions
          covering your functional requirements (e.g. simple menu vs table reservations vs full e-commerce), asset readiness
          (do you already have vectors and high-res photos or need a shoot?), and target launch timeline.
        </p>
        <p>
          Once you select your answers, the AI locks in <strong className="text-stone-900">one definitive package</strong> from our
          2026 Master Rates and matches you with 3 vetted creatives whose verified portfolios prove they have successfully delivered that exact scope.
        </p>
      </div>
    ),
  },
  {
    id: "revision-rounds",
    category: "scoping",
    categoryLabel: "Scoping & Matching",
    question: "How many revision rounds are included with every project?",
    answer: (
      <div className="space-y-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
        <p>
          Every project across every tier includes <strong className="text-stone-900 font-extrabold">3 complete revision rounds</strong> built
          into the standard coin price.
        </p>
        <p>
          Your creative submits watermarked proofs directly to your project workspace. You can pinpoint edits, leave consolidated feedback,
          and approve revisions before final export. If you ever need additional revision passes beyond the 3 included rounds, you can add them
          for just 1 Peach Coin ($50 USD) without delaying delivery.
        </p>
      </div>
    ),
  },
  {
    id: "contracts-and-signatures",
    category: "escrow",
    categoryLabel: "Escrow & Ownership",
    question: "How do digital contracts and dual signatures work before work begins?",
    answer: (
      <div className="space-y-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
        <p>
          To protect both your business and the creative, work never begins on verbal agreements or vague promises.
        </p>
        <p>
          When you select a matched creative, Peach Network automatically generates a binding <strong className="text-stone-900 font-bold">Creative Brief Sheet &amp; Commercial Contract</strong>.
          It lays out the exact deliverables, required client assets, turnaround timeline, revision structure, and escrow amount.
        </p>
        <p>
          Both you and the designer review and digitally sign the contract inside your project workspace. Once dual signatures are locked,
          the designer begins work and you receive immediate access to the live collaboration board.
        </p>
      </div>
    ),
  },
  {
    id: "ownership-and-vault",
    category: "escrow",
    categoryLabel: "Escrow & Ownership",
    question: "Do I own 100% of the completed assets and website?",
    answer: (
      <div className="space-y-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
        <p>
          <strong className="text-stone-900 font-extrabold">Yes, 100% administrative ownership transfers to your business.</strong>
        </p>
        <p>
          Upon project completion and sign-off, you receive full commercial licenses and master source files (.AI, .EPS, .SVG, .PDF,
          high-resolution uncompressed photo exports, and live CMS administrative transfer for Webflow, Squarespace, or Shopify sites).
        </p>
        <p>
          All deliverables are also permanently archived into your business’s encrypted <strong className="text-stone-900 font-bold">Brand Vault</strong>,
          ensuring you never lose access to your raw creative assets.
        </p>
      </div>
    ),
  },
  {
    id: "wallet-and-memberships",
    category: "pricing",
    categoryLabel: "Pricing & Coins",
    question: "What happens if I don't have enough coins in my wallet?",
    answer: (
      <div className="space-y-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
        <p>
          Peach Match AI automatically calculates your coin balance against the project quote. If you need more coins, the system
          clearly shows the exact deficit (e.g. <em>"Deficit: 6 Coins ($300 USD)"</em>) before you hire.
        </p>
        <p>
          You have complete flexibility:
        </p>
        <ul className="list-disc list-inside space-y-1 text-stone-700 pl-1">
          <li>
            <strong className="text-stone-900">One-Time Instant Top-Up:</strong> Purchase only the exact coins needed for that project with 1 click.
          </li>
          <li>
            <strong className="text-stone-900">Peach Memberships:</strong> Join a monthly plan (Essentials, Growth, or Partner) for discounted coin rates,
            recurring monthly creative allowances, rollover protection, and priority creative matching.
          </li>
        </ul>
        <p className="text-[11px] text-stone-500">
          If you are already an active member, you can top up supplemental coins anytime at your discounted membership rate or wait for your next monthly coin drop.
        </p>
      </div>
    ),
  },
  {
    id: "talk-to-art-director",
    category: "scoping",
    categoryLabel: "Scoping & Matching",
    question: "Can I consult with a human Art Director if my project has custom needs?",
    answer: (
      <div className="space-y-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
        <p>
          Yes! While Peach Match AI is trained to diagnose standard scopes in seconds, you can speak directly with our senior agency
          team anytime.
        </p>
        <p>
          Click <strong className="text-stone-900 font-bold">"Ask an Art Director"</strong> in the top bar of your Business Dashboard.
          A senior creative director from Sweet As A Peach in Birmingham will review your brand goals, advise on asset prep, and help tailor
          a custom multi-disciplinary project scope for free.
        </p>
      </div>
    ),
  },
];

export function BusinessFAQSection() {
  const [activeTab, setActiveTab] = useState<"all" | "pricing" | "scoping" | "escrow" | "catalog">("all");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "pricing-usd": true,
    "v1-catalog": true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredItems = FAQ_ITEMS.filter((item) => {
    if (activeTab === "all") return true;
    return item.category === activeTab;
  });

  return (
    <section id="faq" className="space-y-5 scroll-mt-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#C84E2D] mb-0.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Clear Scoping &amp; Transparent Pricing</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Everything business owners need to know about 2026 Master Rates, revisions, contracts, and creative matching.
          </p>
        </div>

        {/* Quick stat badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFF9F6] border border-[#F2C2B2] text-xs font-black text-[#C84E2D] self-start sm:self-auto shrink-0 shadow-2xs">
          <span>1 Peach Coin = $50 USD</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { key: "all", label: "All Questions" },
          { key: "pricing", label: "Pricing & Coins" },
          { key: "catalog", label: "Services & Scope" },
          { key: "scoping", label: "Scoping & Matching" },
          { key: "escrow", label: "Escrow & Ownership" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#173328] !text-white text-white shadow-2xs"
                  : "bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isOpen = Boolean(openItems[item.id]);

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl transition-all shadow-2xs overflow-hidden ${
                isOpen ? "border-[#C84E2D]/50 ring-1 ring-[#C84E2D]/20" : "border-stone-200/90 hover:border-stone-300"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full px-5 py-4 text-left flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none transition-colors"
                aria-expanded={isOpen}
              >
                <div className="space-y-1 pr-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#C84E2D] bg-[#FFF2EB] px-2 py-0.5 rounded-full">
                      {item.categoryLabel}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-stone-950 leading-snug">
                    {item.question}
                  </h3>
                </div>

                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? "bg-[#173328] !text-white text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                  }`}
                >
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-stone-100 bg-[#FFFDFB]/60">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Concierge Helper Callout */}
      <div className="bg-gradient-to-r from-[#173328] to-[#244738] rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
              Concierge Guidance
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-black text-white">
            Need custom scoping advice or have a unique creative initiative?
          </h4>
          <p className="text-xs text-[#DCE7E1] max-w-xl leading-relaxed">
            Our Senior Art Direction team is right here to guide your requirements, review existing branding, or build a multi-creator campaign roadmap for your business.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Link
            href="/business"
            className="px-4 py-2.5 bg-[#C84E2D] hover:bg-[#A33B1E] !text-white text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>Scope with Peach Match AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <a
            href="#feedback"
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Submit Feedback
          </a>
        </div>
      </div>
    </section>
  );
}
