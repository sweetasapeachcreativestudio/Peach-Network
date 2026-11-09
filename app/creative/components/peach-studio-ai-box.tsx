"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Palette,
  Scissors,
  Layers,
  Type,
  RotateCw,
  Send,
  Check,
  Copy,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FolderArchive,
  Image as ImageIcon,
  ShieldAlert,
  Wrench,
  Printer,
  CheckCircle2,
  FileCheck2,
  Compass,
} from "lucide-react";

interface SoftwareItem {
  name: string;
  purpose: string;
  proTip: string;
}

interface ColorSwatch {
  name: string;
  hex: string;
  role?: string;
}

interface FontPairing {
  headline: string;
  subhead: string;
  body: string;
  notes?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isExecutionRefusal?: boolean;
  directorNote?: string;
  softwares?: SoftwareItem[];
  actionSteps?: string[];
  tips?: string[];
  palette?: ColorSwatch[];
  fonts?: FontPairing;
  assets?: string[];
  followUps?: string[];
}

const creativeDirectorQuickTopics = [
  {
    icon: "✂️",
    label: "Photo Chopping & Masking",
    prompt: "How do I cleanly chop out 5-6 people for an event flyer in Photoshop without white edge halos?",
  },
  {
    icon: "📐",
    label: "Flyer Visual Hierarchy",
    prompt: "What is the 3-second visual hierarchy rule for an event flyer so date, artists, and tickets don't look crowded?",
  },
  {
    icon: "🛠️",
    label: "3D Packaging Software",
    prompt: "What software and workflow is best to create 3D box mockups and packaging dielines?",
  },
  {
    icon: "🍽️",
    label: "Restaurant Menu Layout",
    prompt: "How should I structure a 4-page restaurant menu in InDesign with bleed and pricing hierarchy?",
  },
  {
    icon: "🎨",
    label: "High-Contrast Event Palette",
    prompt: "Give me an eye-catching, high-contrast color palette with copyable HEX codes for an event flyer.",
  },
  {
    icon: "🔤",
    label: "Commercial Font Pairing",
    prompt: "What are the best font pairings for high-energy event graphics and luxury restaurant menus?",
  },
  {
    icon: "📋",
    label: "Pre-Flight Press Checklist",
    prompt: "What are the exact CMYK, DPI, and bleed specs required for local commercial print shops?",
  },
  {
    icon: "🚫",
    label: "Can You Design It For Me?",
    prompt: "Can you design my entire event flyer for me?",
  },
];

export function PeachStudioAIBox() {
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"advisor" | "softwares" | "palette" | "chopping" | "preflight">("advisor");
  const [loading, setLoading] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Active loaded data
  const [activePalette, setActivePalette] = useState<ColorSwatch[]>([
    { name: "Deep Obsidian", hex: "#11141C", role: "60% Dominant Canvas" },
    { name: "Peach Radiant", hex: "#EB6244", role: "10% High-Energy Accent / CTA" },
    { name: "Golden Amber", hex: "#F5AB35", role: "30% Structural Secondary / Badges" },
    { name: "Crisp Warm White", hex: "#FAF8F5", role: "High-Contrast Copy & Details" },
    { name: "Studio Evergreen", hex: "#173328", role: "Framing & Card Borders" },
  ]);

  const [activeFonts, setActiveFonts] = useState<FontPairing>({
    headline: "Bebas Neue (Heavy All-Caps Display)",
    subhead: "Montserrat (Semi-Bold Tracking +80)",
    body: "Inter (Regular, 140% line-height)",
    notes: "High-contrast commercial duo engineered for immediate legibility at billboard or mobile screen size.",
  });

  const [activeSoftwares, setActiveSoftwares] = useState<SoftwareItem[]>([
    {
      name: "Adobe Photoshop",
      purpose: "Precision photo chopping, multi-person flyer compositing, and atmospheric rim-lighting.",
      proTip: "Use Pen Tool (P) for hard edges and contract layer masks by 1.5px to kill background color halos.",
    },
    {
      name: "Adobe Illustrator",
      purpose: "Vector typography styling, client logo pre-flight, and commercial packaging dielines.",
      proTip: "Shape Builder Tool (Shift+M) merges overlapping geometry in seconds without messy boolean curves.",
    },
    {
      name: "Figma",
      purpose: "Responsive website layouts, restaurant menus, interactive prototyping, and design tokens.",
      proTip: "Build with Auto-Layout (Shift+A) on an 8pt grid for seamless responsive handoff.",
    },
  ]);

  const [activeActionSteps, setActiveActionSteps] = useState<string[]>([
    "Audit client assets and identify which photos need resolution upscaling and background clipping.",
    "Set canvas to 300 DPI CMYK with 0.125\" outer bleed margins for print, or 1080×1350 px RGB for digital.",
    "Block out the 30-40-25-5 visual hierarchy grid before adding any decorative flares or glow overlays.",
    "Test contrast in grayscale using a Black & White adjustment layer to guarantee headline readability.",
  ]);

  const [activeTips, setActiveTips] = useState<string[]>([
    "Contract your layer mask selection by 1–1.5 px to eliminate ugly background color fringing.",
    "Darken the lower 30% of your canvas to guarantee date, venue, and ticketing details remain 100% readable.",
    "In CMYK printing, use Rich Black (C:60 M:40 Y:40 K:100) instead of pure K:100 to avoid washed-out charcoal.",
  ]);

  const [activeAssets, setActiveAssets] = useState<string[]>([
    "torn paper edges transparent png",
    "golden rim lighting glow overlay",
    "subtle grain noise texture (Screen mode)",
    "chrome 3d lettering render",
    "club laser light flare transparent",
  ]);

  const handleAsk = async (textToSend?: string) => {
    const q = (textToSend ?? prompt).trim();
    if (!q) return;

    setLoading(true);
    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", content: q },
    ];
    setChatHistory(newHistory);

    try {
      const res = await fetch("/api/creative/studio-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          category: activeTab === "softwares" ? "Software & Tools" : "Creative Director Art Direction",
          history: chatHistory.slice(-4),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to consult Peach Studio AI.");

      if (Array.isArray(data.colorPalette) && data.colorPalette.length > 0) {
        setActivePalette(data.colorPalette);
      }
      if (data.fontPairing) {
        setActiveFonts(data.fontPairing);
      }
      if (Array.isArray(data.recommendedSoftwares) && data.recommendedSoftwares.length > 0) {
        setActiveSoftwares(data.recommendedSoftwares);
      }
      if (Array.isArray(data.actionableSteps) && data.actionableSteps.length > 0) {
        setActiveActionSteps(data.actionableSteps);
      }
      if (Array.isArray(data.quickTips) && data.quickTips.length > 0) {
        setActiveTips(data.quickTips);
      }
      if (Array.isArray(data.assetKeywords) && data.assetKeywords.length > 0) {
        setActiveAssets(data.assetKeywords);
      }

      setChatHistory([
        ...newHistory,
        {
          role: "assistant",
          content: data.answer,
          isExecutionRefusal: data.isExecutionRefusal,
          directorNote: data.creativeDirectorNote,
          softwares: data.recommendedSoftwares,
          actionSteps: data.actionableSteps,
          tips: data.quickTips,
          palette: data.colorPalette,
          fonts: data.fontPairing,
          assets: data.assetKeywords,
          followUps: data.followUps,
        },
      ]);
      setPrompt("");
    } catch (err: any) {
      setChatHistory([
        ...newHistory,
        {
          role: "assistant",
          content: "Sorry, I hit a snag connecting to Studio AI. Let's try again in a moment!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <section className="bg-white border-2 border-[#173328]/15 rounded-3xl p-5 sm:p-8 shadow-sm relative overflow-hidden transition-all">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-100/40 via-orange-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-200/80 relative z-10">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#173328]/10 text-[#173328] text-xs font-black tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-[#EB6244]" />
            <span>Creative Director AI · Sweet As A Peach Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
            Art Direction, Software Advice &amp; Project Critique
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Need design critique on an active project? Software workflows in Photoshop or Figma? Guidance on photo cutouts, color harmony, or press bleeds? Your in-house Creative Director is here to guide and unblock your craft.
          </p>
        </div>

        {/* Creative Director Policy Badge */}
        <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-3 max-w-xs shrink-0 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 mb-1">
            <Compass className="w-3.5 h-3.5 text-[#EB6244]" />
            <span>Creative Director Role:</span>
          </div>
          <p className="text-[11px] text-stone-600 leading-snug">
            I provide critique, layout blueprints, software workflows &amp; technical advice. I <strong>will not do the project for you</strong>—you are the designer!
          </p>
        </div>
      </div>

      {/* Studio Tool Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-stone-100 mb-4 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("advisor")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "advisor"
              ? "bg-[#173328] text-white shadow-xs"
              : "bg-[#FAF8F5] text-stone-700 hover:text-stone-950 hover:bg-stone-100"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#EB6244]" />
          <span>Director Advice &amp; Q&amp;A</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("softwares")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "softwares"
              ? "bg-[#173328] text-white shadow-xs"
              : "bg-[#FAF8F5] text-stone-700 hover:text-stone-950 hover:bg-stone-100"
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-[#EB6244]" />
          <span>Software &amp; Tool Arsenal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("palette")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "palette"
              ? "bg-[#173328] text-white shadow-xs"
              : "bg-[#FAF8F5] text-stone-700 hover:text-stone-950 hover:bg-stone-100"
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-[#EB6244]" />
          <span>Color Palettes &amp; Gamut</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("chopping")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "chopping"
              ? "bg-[#173328] text-white shadow-xs"
              : "bg-[#FAF8F5] text-stone-700 hover:text-stone-950 hover:bg-stone-100"
          }`}
        >
          <Scissors className="w-3.5 h-3.5 text-[#EB6244]" />
          <span>Photo Chopping &amp; Halos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preflight")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "preflight"
              ? "bg-[#173328] text-white shadow-xs"
              : "bg-[#FAF8F5] text-stone-700 hover:text-stone-950 hover:bg-stone-100"
          }`}
        >
          <Printer className="w-3.5 h-3.5 text-[#EB6244]" />
          <span>Pre-Flight Press Specs</span>
        </button>
      </div>

      {/* QUICK TOPIC PROMPTS */}
      <div className="pb-4">
        <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider block mb-2">
          Click any design topic to consult your Creative Director:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {creativeDirectorQuickTopics.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPrompt(item.prompt);
                handleAsk(item.prompt);
              }}
              className="text-left bg-[#FAF8F5] hover:bg-orange-50/70 border border-stone-200 hover:border-[#EB6244]/40 p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shadow-2xs group"
            >
              <span className="text-base shrink-0">{item.icon}</span>
              <span className="text-xs font-bold text-stone-800 group-hover:text-[#EB6244] transition-colors truncate">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: INTERACTIVE CREATIVE DIRECTOR CHAT */}
      {activeTab === "advisor" && (
        <div className="space-y-4">
          {/* Chat Stream */}
          {chatHistory.length > 0 ? (
            <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4 sm:p-5 max-h-96 overflow-y-auto space-y-4">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 text-xs ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-[#173328] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs">
                      🍑
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-2xl max-w-2xl leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#173328] text-white font-medium rounded-tr-none"
                        : "bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-2xs space-y-3"
                    }`}
                  >
                    {/* Refusal Notice Banner if user asked the AI to do the work */}
                    {msg.isExecutionRefusal && (
                      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-2.5 text-amber-900">
                        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-xs font-black text-amber-950">
                            Creative Director Policy: Guidance, Not Execution
                          </strong>
                          <p className="text-[11px] text-amber-900 leading-snug">
                            As your Creative Director, I provide art direction, critique, layout grids, and software guidance—but I will not design or build the deliverable for you. You're the designer!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Main Content Body */}
                    <div className="whitespace-pre-wrap text-xs sm:text-sm text-stone-900 font-normal leading-relaxed space-y-2">
                      {msg.content}
                    </div>

                    {/* Creative Director Motto Note */}
                    {msg.directorNote && (
                      <div className="bg-[#FAF8F5] border-l-3 border-[#EB6244] p-2.5 rounded-r-lg text-stone-700 italic text-[11px]">
                        "{msg.directorNote}"
                      </div>
                    )}

                    {/* Recommended Software Cards */}
                    {msg.softwares && msg.softwares.length > 0 && (
                      <div className="pt-2 border-t border-stone-100 space-y-2">
                        <span className="text-[10px] font-black uppercase text-stone-400 block tracking-wider">
                          Recommended Industry Software Stack:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.softwares.map((sw, swi) => (
                            <div key={swi} className="bg-[#FAF8F5] border border-stone-200/80 rounded-xl p-2.5 space-y-1">
                              <div className="flex items-center justify-between">
                                <strong className="text-xs font-black text-[#173328]">{sw.name}</strong>
                                <span className="text-[9px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                  Pro Tool
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-600 leading-tight">{sw.purpose}</p>
                              <div className="text-[10px] text-[#EB6244] font-medium pt-0.5">
                                <strong>Pro-Tip:</strong> {sw.proTip}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Production Action Steps */}
                    {msg.actionSteps && msg.actionSteps.length > 0 && (
                      <div className="pt-2 border-t border-stone-100 space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-stone-400 block tracking-wider">
                          Step-by-Step Production Plan (Execute Yourself):
                        </span>
                        <ol className="space-y-1 text-stone-700 list-decimal list-inside text-xs">
                          {msg.actionSteps.map((step, si) => (
                            <li key={si} className="leading-snug">
                              <span className="font-medium text-stone-900">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Quick Tips */}
                    {msg.tips && msg.tips.length > 0 && (
                      <div className="pt-2 border-t border-stone-100 space-y-1">
                        <span className="text-[10px] font-black uppercase text-stone-400 block tracking-wider">
                          Art Director Rules:
                        </span>
                        <ul className="space-y-1 text-stone-700 text-xs">
                          {msg.tips.map((t, ti) => (
                            <li key={ti} className="flex items-start gap-1.5">
                              <span className="text-[#EB6244] font-bold">✦</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-6 text-center space-y-2.5">
              <span className="text-3xl">👨‍🎨</span>
              <h3 className="text-sm font-black text-stone-900">
                Ask Your Creative Director for Guidance or Critique
              </h3>
              <p className="text-xs text-stone-600 max-w-lg mx-auto leading-relaxed">
                Stuck on a flyer layout? Chopping out tricky backgrounds? Wondering which software handles 3D packaging best? Type your design inquiry below or select a topic above.
              </p>
            </div>
          )}

          {/* Text Input */}
          <div className="space-y-3 pt-1">
            <div className="relative">
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                placeholder="Ask your Creative Director... e.g. 'How do I organize layers in Photoshop for a 5-photo flyer?' or 'What are the best font pairings for a luxury restaurant?'"
                className="w-full bg-[#FAF8F5]/80 focus:bg-white border border-stone-200 focus:border-[#EB6244] rounded-2xl p-4 text-sm text-stone-950 placeholder:text-stone-400 focus:outline-hidden transition-all leading-relaxed shadow-2xs resize-y min-h-[90px]"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-stone-500 hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-[10px] font-mono">⌘ + Enter</kbd> to consult
              </span>

              <button
                type="button"
                onClick={() => handleAsk()}
                disabled={loading || !prompt.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#173328] hover:bg-[#234b3c] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 ml-auto"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Creative Director Thinking…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#EB6244]" />
                    <span>Get Art Direction →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOFTWARE & TOOL ARSENAL */}
      {activeTab === "softwares" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-stone-950">
                Commercial Creative Software Stack
              </h3>
              <p className="text-xs text-stone-600">
                Industry-standard tool recommendations and insider shortcuts recommended by our Creative Director:
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleAsk("What is the complete software stack for graphic designers, web designers, and 3D packaging creators?")}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Ask Software Recommendations</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg">🖼️</span>
                <span className="text-[10px] font-black uppercase text-[#173328] bg-emerald-100 px-2 py-0.5 rounded">
                  Adobe Photoshop
                </span>
              </div>
              <strong className="text-xs font-black text-stone-950 block">Photo Masking &amp; Compositing</strong>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Use <strong>Pen Tool (P)</strong> for razor edges. Contract layer masks by 1.5px to eliminate edge halos. Paint ambient rim lights on a layer set to <strong>Linear Dodge (Add)</strong>.
              </p>
              <div className="text-[10px] font-mono text-[#EB6244] bg-white p-1.5 rounded border border-stone-200">
                Shortcut: Filter &gt; Other &gt; Minimum (1px)
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg">✒️</span>
                <span className="text-[10px] font-black uppercase text-[#173328] bg-emerald-100 px-2 py-0.5 rounded">
                  Adobe Illustrator
                </span>
              </div>
              <strong className="text-xs font-black text-stone-950 block">Vector Branding &amp; Dielines</strong>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Build logos and custom lettering with the <strong>Shape Builder Tool (Shift+M)</strong>. Always place packaging fold lines on a non-printing spot color layer named 'Dieline'.
              </p>
              <div className="text-[10px] font-mono text-[#EB6244] bg-white p-1.5 rounded border border-stone-200">
                Shortcut: Shift + M (Merge shapes)
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg">📐</span>
                <span className="text-[10px] font-black uppercase text-[#173328] bg-emerald-100 px-2 py-0.5 rounded">
                  Figma
                </span>
              </div>
              <strong className="text-xs font-black text-stone-950 block">Web UI &amp; Restaurant Hubs</strong>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Master <strong>Auto-Layout (Shift+A)</strong> to build fluid responsive cards for restaurant menus and product grids. Use component variant tokens for hover and active states.
              </p>
              <div className="text-[10px] font-mono text-[#EB6244] bg-white p-1.5 rounded border border-stone-200">
                Shortcut: Shift + A (Auto-layout container)
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg">📦</span>
                <span className="text-[10px] font-black uppercase text-[#173328] bg-emerald-100 px-2 py-0.5 rounded">
                  Pacdora &amp; Blender
                </span>
              </div>
              <strong className="text-xs font-black text-stone-950 block">3D Packaging &amp; Bottle Mockups</strong>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Use <strong>Pacdora</strong> for instant folding shoe boxes and mailers with 300 DPI dielines. Use <strong>Blender Cycles</strong> for photorealistic glass bottles and liquid refractions.
              </p>
              <div className="text-[10px] font-mono text-[#EB6244] bg-white p-1.5 rounded border border-stone-200">
                Pacdora.com for rapid 3D folding
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg">📖</span>
                <span className="text-[10px] font-black uppercase text-[#173328] bg-emerald-100 px-2 py-0.5 rounded">
                  Adobe InDesign
                </span>
              </div>
              <strong className="text-xs font-black text-stone-950 block">Multi-Page Menus &amp; Booklets</strong>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Never design a 4-page menu in Photoshop! Use InDesign Parent Master Pages, Character Styles for item pricing, and export with standard <strong>PDF/X-1a</strong> press bleeds.
              </p>
              <div className="text-[10px] font-mono text-[#EB6244] bg-white p-1.5 rounded border border-stone-200">
                Export: PDF/X-1a with 0.125" Bleed
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg">🎞️</span>
                <span className="text-[10px] font-black uppercase text-[#173328] bg-emerald-100 px-2 py-0.5 rounded">
                  After Effects
                </span>
              </div>
              <strong className="text-xs font-black text-stone-950 block">Animated Motion Flyers &amp; Reels</strong>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Import layered PSD files, separate typography and background glows, and use the <strong>Graph Editor</strong> with Easy Ease (F9) to give title cards punchy kinetic momentum.
              </p>
              <div className="text-[10px] font-mono text-[#EB6244] bg-white p-1.5 rounded border border-stone-200">
                Shortcut: F9 (Easy Ease keyframes)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE COLOR PALETTE STUDIO */}
      {activeTab === "palette" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-stone-950">
                Curated Commercial Color Palette (Click to Copy HEX)
              </h3>
              <p className="text-xs text-stone-600">
                Balanced 60-30-10 distribution tested for contrast in mobile dark/light modes and CMYK print gamuts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleAsk("Generate another fresh commercial color palette for flyers and branding with copyable HEX codes")}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Generate New Palette</span>
            </button>
          </div>

          {/* Color Swatch Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {activePalette.map((color, idx) => {
              const isCopied = copiedHex === color.hex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => copyToClipboard(color.hex)}
                  className="bg-white border border-stone-200 hover:border-stone-400 rounded-2xl p-3 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                >
                  <div
                    className="w-full h-16 rounded-xl mb-2.5 shadow-inner border border-black/10 flex items-center justify-center transition-transform group-hover:scale-102"
                    style={{ backgroundColor: color.hex }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white text-[10px] font-black px-2 py-0.5 rounded-md transition-opacity">
                      Copy
                    </span>
                  </div>
                  <strong className="text-xs font-bold text-stone-950 block truncate">
                    {color.name}
                  </strong>
                  {color.role && (
                    <span className="text-[10px] text-stone-500 block truncate mb-1">
                      {color.role}
                    </span>
                  )}
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 mt-0.5">
                    <span>{color.hex}</span>
                    {isCopied ? (
                      <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-3 h-3 text-stone-400 group-hover:text-stone-700" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Typography Pairing Recommendation */}
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider block">
              Suggested Font Pairing with this Palette:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-stone-200/70">
                <span className="text-[10px] text-stone-400 font-bold block uppercase">Headline</span>
                <strong className="text-stone-900">{activeFonts.headline}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200/70">
                <span className="text-[10px] text-stone-400 font-bold block uppercase">Subhead</span>
                <strong className="text-stone-900">{activeFonts.subhead}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200/70">
                <span className="text-[10px] text-stone-400 font-bold block uppercase">Body Text</span>
                <strong className="text-stone-900">{activeFonts.body}</strong>
              </div>
            </div>
            {activeFonts.notes && (
              <p className="text-[11px] text-stone-500 italic pt-1">{activeFonts.notes}</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PHOTO CHOPPING & MASKING WORKFLOW */}
      {activeTab === "chopping" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-stone-900 text-white rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs text-[#EB6244] font-bold uppercase tracking-wider">
              <Scissors className="w-4 h-4" />
              <span>Studio Masterclass: Chopping 5–6 People for Event Flyers</span>
            </div>
            <h3 className="text-lg font-black text-white">
              Eliminate White Halos &amp; Blend Cutouts Naturally
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
              When clients send 5–6 phone photos with varied background lighting, raw clipping looks pasted-on. Follow these 4 steps to produce clean, high-end commercial cutouts:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700 space-y-1">
                <strong className="text-amber-300 font-bold block">1. The 1.5-Pixel De-Fringe Trick</strong>
                <p className="text-stone-300 leading-relaxed text-[11px]">
                  After cutting out your subject with Pen Tool or Object Selection, select the Layer Mask and run: <code className="bg-stone-900 px-1 py-0.5 rounded text-amber-200">Filter → Other → Minimum (1.0–1.5 px)</code>. This shrinks the edge inward, eliminating 95% of background color fringe.
                </p>
              </div>

              <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700 space-y-1">
                <strong className="text-amber-300 font-bold block">2. Color-Cast Neutralizer Layer</strong>
                <p className="text-stone-300 leading-relaxed text-[11px]">
                  Clip a blank layer to your cutout, set Blending Mode to <strong>Color</strong>, and with a soft brush (Opacity 30%), sample the subject’s jacket or hair to paint away green/blue background spill on edges.
                </p>
              </div>

              <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700 space-y-1">
                <strong className="text-amber-300 font-bold block">3. Dramatic Rim Light Glow</strong>
                <p className="text-stone-300 leading-relaxed text-[11px]">
                  Clip a layer set to <strong>Linear Dodge (Add)</strong> or <strong>Screen</strong>, pick your flyer’s glow color (e.g. #EB6244), and paint a delicate 2–3px rim light along the shoulders and head. This anchors them into the background atmosphere.
                </p>
              </div>

              <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700 space-y-1">
                <strong className="text-amber-300 font-bold block">4. Non-Destructive Dodge &amp; Burn</strong>
                <p className="text-stone-300 leading-relaxed text-[11px]">
                  Add a new layer filled with <strong>50% Gray</strong>, set mode to <strong>Overlay</strong>. Paint with white (Dodge) on cheekbones and forehead, black (Burn) in shadow folds to give all 6 subjects matching commercial contrast.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRE-FLIGHT PRESS SPECS */}
      {activeTab === "preflight" && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h3 className="text-sm font-black text-stone-950">
              Commercial Print Pre-Flight Specifications
            </h3>
            <p className="text-xs text-stone-600">
              Before marking any print deliverable complete on Peach, verify these tolerances to guarantee zero printer rejections:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-[#EB6244] font-black text-xs">
                <FileCheck2 className="w-4 h-4" />
                <span>300 DPI at 100% Scale</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                All raster imagery must be at least 300 DPI at physical printed size. 72 DPI screen graphics will print pixelated and blurry.
              </p>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-[#EB6244] font-black text-xs">
                <FileCheck2 className="w-4 h-4" />
                <span>0.125" (1/8 inch) Bleeds</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Extend all background colors and edge artwork 0.125 inches past the final trim line so paper cutters never leave white paper slivers.
              </p>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-[#EB6244] font-black text-xs">
                <FileCheck2 className="w-4 h-4" />
                <span>Rich Black Formula</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Do not use pure 100% K black for heavy backgrounds. Use Rich Black: <code className="bg-stone-200 px-1 rounded text-stone-800">C:60 M:40 Y:40 K:100</code> for deep velvet darks.
              </p>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-[#EB6244] font-black text-xs">
                <FileCheck2 className="w-4 h-4" />
                <span>0.25" Safe Text Margin</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Keep all live copy, ticket links, dates, and sponsor logos at least a quarter-inch inside the cut line to prevent accidental slicing.
              </p>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-[#EB6244] font-black text-xs">
                <FileCheck2 className="w-4 h-4" />
                <span>Convert Fonts to Outlines</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Before sending final vector files (.AI/.EPS), outline all typography (<code className="bg-stone-200 px-1 rounded text-stone-800">Cmd/Ctrl + Shift + O</code>) so the printer doesn't encounter missing font errors.
              </p>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-[#EB6244] font-black text-xs">
                <FileCheck2 className="w-4 h-4" />
                <span>PDF/X-1a Export Standard</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Export press proofs using PDF/X-1a:2001 with crop marks enabled. This flattens transparencies cleanly for standard offset or digital presses.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
