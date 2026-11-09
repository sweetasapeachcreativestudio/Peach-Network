"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PeachMatchAIBoxProps {
  initialAvailableCoins: number;
  businessName: string;
}

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

interface ScopedProject {
  serviceKey: string;
  title: string;
  category: string;
  coins: number;
  usdAmount: number;
  deliverables: string[];
  requiredFromBusiness?: string[];
  scopeSummary?: string;
  estimatedTurnaround: string;
  revisionRounds: number;
  reason: string;
}

interface MatchedCreative {
  id: string;
  name: string;
  avatar_url: string;
  peach_level: string;
  headline: string;
  city: string;
  state: string;
  hub?: string;
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

interface ClarificationOption {
  label: string;
  value: string;
}

interface ClarificationData {
  needed: boolean;
  question: string;
  options: ClarificationOption[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  companionTip?: string;
  clarification?: ClarificationData | null;
  catalogTiers?: CatalogTierOption[];
  isVague?: boolean;
  scope?: ScopedProject | null;
  matchedCreatives?: MatchedCreative[];
  showCreatives?: boolean;
}

// Strictly NO ICONS in starter prompts as requested
const starterPrompts = [
  {
    label: "Website Design Scope",
    prompt: "I need a website designed for my business. What are the 3 tiers and what does each come with?",
  },
  {
    label: "Shoe E-Commerce Hub",
    prompt: "I need a website for a shoe company with e-commerce store and shoe box packaging dielines.",
  },
  {
    label: "Restaurant Food & Web",
    prompt: "I need a website for a restaurant with digital food & drink menus, plus a commercial photography shoot for 10 signature dishes.",
  },
  {
    label: "Branding & 3-Tier Suites",
    prompt: "I need branding done for my business. Explain the 3 tiers and what you require from me as the business owner.",
  },
  {
    label: "Promo Event Flyer Kit",
    prompt: "I need an event flyer with QR code, headline hierarchy, and social story formats.",
  },
  {
    label: "Monthly Social Media Suite",
    prompt: "I need monthly social media graphics and video reels. What is the scope and turnaround?",
  },
];

export function PeachMatchAIBox({
  initialAvailableCoins,
  businessName,
}: PeachMatchAIBoxProps) {
  const router = useRouter();
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableCoins, setAvailableCoins] = useState(initialAvailableCoins);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [submittingOffer, setSubmittingOffer] = useState<string | null>(null);

  // Status notices
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Portfolio image preview modal
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
    creativeName: string;
    industry?: string;
  } | null>(null);

  // Initial welcome message - strictly NO ICONS
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: `Hey friend! I am Peach Match AI, your creative director and scoping partner on Peach Network.
I scope projects using the 2026 Master Rates Catalog (1 Peach Coin = $50.00 USD).
Tell me what you are building—website design, brand identity, commercial photography, social media, or flyers.
If your request is broad, I will lay out the 3 master tiers (Option A, B, and C) with exact deliverables and what we require from you, then match 3 vetted creatives based on their verified design history.`,
    },
  ]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? prompt).trim();
    if (!text || loading) return;

    setErrorMsg("");
    setSuccessMsg("");

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setLoading(true);

    try {
      const historyPayload = newHistory.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/projects/ai-consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Peach Match AI could not process your message.");

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer || "Here is your project scope and pricing.",
        companionTip: data.companionInsight,
        clarification: data.clarification?.needed ? data.clarification : null,
        catalogTiers: Array.isArray(data.catalogTiers) ? data.catalogTiers : [],
        isVague: Boolean(data.isVague),
        scope: data.scope || null,
        matchedCreatives: Array.isArray(data.matchedCreatives) ? data.matchedCreatives : [],
        showCreatives: !data.isVague, // If specific tier is clear, reveal creatives; if vague, wait for tier choice
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const friendlyNotice = err?.message || "Failed to consult Peach Match AI. Please try again.";
      setErrorMsg(friendlyNotice);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "Peach Match AI is right here! To keep moving forward, you can select one of the popular project scopes below or describe your deliverables.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Switch tier directly from the 3-Tier Scoping Grid
  const handleSelectTierFromCatalog = (messageId: string, tier: CatalogTierOption, categoryName: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        return {
          ...m,
          isVague: false,
          showCreatives: true,
          scope: {
            serviceKey: tier.id,
            title: tier.tierName,
            category: categoryName || "Design",
            coins: tier.coins,
            usdAmount: tier.usdEquivalent,
            deliverables: tier.deliverables,
            requiredFromBusiness: tier.requiredFromBusiness,
            scopeSummary: tier.scopeSummary,
            estimatedTurnaround: tier.typicalTurnaround,
            revisionRounds: 3,
            reason: `Selected ${tier.tierName} (${tier.coins} Coins / $${tier.usdEquivalent} USD). Includes 3 revision rounds and 100% administrative site/asset ownership transfer.`,
          },
        };
      })
    );
  };

  // Instant Top-Up handler
  const handleInstantTopUp = async (coinsToBuy: number) => {
    setTopUpLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/wallet/top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins: coinsToBuy }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Top-up failed.");

      setAvailableCoins(data.newBalance);
      setSuccessMsg(
        `Added ${data.coinsAdded} Peach Coins ($${data.usdCharged} USD). New balance: ${data.newBalance} Coins.`
      );
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Top-up failed. Please try again.");
    } finally {
      setTopUpLoading(false);
    }
  };

  // User confirmed "Yes, hire creatives" for a specific message
  const handleConfirmHirePrompt = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, showCreatives: true } : m))
    );
  };

  // Select creative & dispatch offer, creating Creative Brief Sheet & redirecting to /projects/[id]
  const handleSelectCreative = async (creative: MatchedCreative, currentScope: ScopedProject) => {
    setSubmittingOffer(creative.id);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/projects/ai-create-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentScope.title,
          category: currentScope.category,
          serviceKey: currentScope.serviceKey,
          coins: currentScope.coins,
          usdAmount: currentScope.usdAmount,
          deliverables: currentScope.deliverables,
          requiredFromBusiness: currentScope.requiredFromBusiness,
          scopeSummary: currentScope.scopeSummary,
          estimatedTurnaround: currentScope.estimatedTurnaround,
          revisionRounds: 3,
          selectedCreativeId: creative.id,
          matchScore: creative.match_score,
          matchReason: creative.match_reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project and dispatch offer.");

      setSuccessMsg(`Matched with ${creative.name}! Creative Brief Sheet & Contract created. Redirecting to your workspace...`);
      router.push(`/projects/${data.project.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to dispatch match invitation.");
      setSubmittingOffer(null);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: `Chat refreshed. What project would you like to scope next for ${businessName}?`,
      },
    ]);
    setErrorMsg("");
    setSuccessMsg("");
  };

  return (
    <div className="bg-[#FFF9F6] border-2 border-[#C84E2D] rounded-3xl shadow-md overflow-hidden flex flex-col transition-all">
      {/* 1. TOPBAR */}
      <header className="px-5 py-3.5 bg-[#C84E2D] text-white flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white uppercase">
                Peach Match AI
              </span>
              <span className="text-[10px] font-black tracking-widest text-[#FFF2EB] bg-[#A33B1E] px-2.5 py-0.5 rounded-full uppercase">
                2026 Master Scoping Engine
              </span>
            </div>
            <div className="text-[11px] text-[#FFE8DF] font-medium truncate">
              1 Peach Coin = $50.00 USD &bull; 3-Tier Catalog &bull; Dual Digital Sign-off &bull; 3 Revisions Included
            </div>
          </div>
        </div>

        {/* Right Actions: Wallet balance + New Chat */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#A33B1E] text-xs font-black text-white">
            <span>{availableCoins} Coins</span>
            <span className="text-[10px] text-[#FFD4C4] font-medium">(${availableCoins * 50})</span>
          </div>

          <button
            type="button"
            onClick={() => handleInstantTopUp(10)}
            disabled={topUpLoading}
            className="hidden md:inline-flex items-center px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FFEAE2] text-[#C84E2D] text-xs font-bold transition-colors cursor-pointer"
            title="Buy 10 coins ($500 USD)"
          >
            Buy Coins
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#A33B1E] hover:bg-[#8F3319] text-xs font-bold text-white transition-colors cursor-pointer"
            title="Start a fresh conversation"
          >
            New Chat
          </button>
        </div>
      </header>

      {/* STATUS NOTICES */}
      {errorMsg && (
        <div className="px-5 py-2.5 bg-rose-100 border-b border-rose-300 text-xs text-rose-900 font-semibold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg("")} className="text-rose-700 hover:text-rose-950 font-bold">
            Close
          </button>
        </div>
      )}

      {successMsg && (
        <div className="px-5 py-2.5 bg-emerald-100 border-b border-emerald-300 text-xs text-emerald-950 font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg("")} className="text-emerald-700 hover:text-emerald-950 font-bold">
            Close
          </button>
        </div>
      )}

      {/* 2. CHAT STREAM */}
      <div className="p-4 sm:p-6 space-y-5 max-h-[560px] overflow-y-auto bg-gradient-to-b from-[#FFF5F0] to-white scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 text-sm ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-[#C84E2D] text-white flex items-center justify-center text-[11px] font-black shrink-0 shadow-2xs mt-0.5">
                PM
              </div>
            )}

            <div
              className={`rounded-2xl leading-relaxed text-xs sm:text-sm ${
                msg.role === "user"
                  ? "bg-[#0B2D22] text-[#FFD8C2] p-4 max-w-xl font-medium rounded-tr-none shadow-xs"
                  : "bg-white border-2 border-[#F2C2B2] text-slate-850 p-4 sm:p-5 max-w-3xl rounded-tl-none shadow-xs space-y-3.5"
              }`}
            >
              {/* Message text */}
              <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                {msg.content.split("\n\n").map((para, pi) => {
                  if (para.startsWith("###")) {
                    return (
                      <h4 key={pi} className="text-sm sm:text-base font-black text-slate-950 mt-2 mb-1">
                        {para.replace("###", "").trim()}
                      </h4>
                    );
                  }
                  return (
                    <p key={pi} className={msg.role === "user" ? "text-[#FFD8C2]" : "text-slate-800"}>
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* Companion Tip */}
              {msg.companionTip && (
                <div className="bg-[#FFF2EB] border-l-4 border-[#C84E2D] p-3 rounded-r-xl text-xs text-slate-700 space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#C84E2D] block">
                    Creative Director Tip:
                  </span>
                  <p className="leading-snug text-slate-700 italic">"{msg.companionTip}"</p>
                </div>
              )}

              {/* REQUIREMENT: 3-TIER MASTER CATALOG SELECTOR (Option A, Option B, Option C) */}
              {msg.catalogTiers && msg.catalogTiers.length > 0 && (
                <div className="pt-2 border-t border-[#F2C2B2] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#C84E2D]">
                      Select 1 of the 3 Master Scoping Tiers:
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      1 Coin = $50 USD &bull; Full site &amp; asset transfer
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {msg.catalogTiers.map((tier) => {
                      const isSelected = msg.scope?.title === tier.tierName;
                      return (
                        <div
                          key={tier.id}
                          className={`rounded-2xl p-4 flex flex-col justify-between border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#FFF4EE] border-[#C84E2D] shadow-sm ring-2 ring-[#C84E2D]/20"
                              : "bg-white border-[#E9A995] hover:border-[#C84E2D] shadow-2xs"
                          }`}
                          onClick={() => handleSelectTierFromCatalog(msg.id, tier, msg.scope?.category || "Design")}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#FFF2EB] text-[#C84E2D]">
                                {tier.id.replace("_", " ").toUpperCase()}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold">
                                {tier.typicalTurnaround}
                              </span>
                            </div>

                            <strong className="text-xs font-black text-slate-950 block leading-tight mb-1">
                              {tier.tierName.split(":")[1]?.trim() || tier.tierName}
                            </strong>

                            <div className="flex items-baseline gap-1.5 mb-2.5">
                              <span className="text-xl font-black text-[#C84E2D]">
                                {tier.coins} Coins
                              </span>
                              <span className="text-xs text-slate-500 font-bold">
                                (${tier.usdEquivalent} USD)
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 leading-snug mb-2">
                              {tier.scopeSummary}
                            </p>

                            {/* What it requires from business */}
                            <div className="bg-[#FFF9F6] p-2.5 rounded-xl border border-[#F2C2B2] mb-3 text-[10px] text-slate-700 space-y-1">
                              <strong className="text-[10px] text-[#A33B1E] uppercase font-black block">
                                What we require from you:
                              </strong>
                              {tier.requiredFromBusiness.slice(0, 2).map((req, ri) => (
                                <div key={ri} className="flex items-start gap-1">
                                  <span className="text-[#C84E2D] font-bold">&bull;</span>
                                  <span>{req}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTierFromCatalog(msg.id, tier, msg.scope?.category || "Design");
                            }}
                            className={`w-full py-2 rounded-xl text-xs font-black transition-colors cursor-pointer text-center ${
                              isSelected
                                ? "bg-[#C84E2D] text-white shadow-2xs"
                                : "bg-[#FFF2EB] text-[#C84E2D] hover:bg-[#C84E2D] hover:text-white border border-[#E9A995]"
                            }`}
                          >
                            {isSelected ? "✓ Selected Tier" : `Choose ${tier.id.toUpperCase().replace("_", " ")}`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SCOPE BREAKDOWN CARD */}
              {msg.scope && (
                <div className="bg-[#FFF4EE] border border-[#E9A995] rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E9A995]">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded">
                        Scoped Tier &amp; Contract Base
                      </span>
                      <h3 className="text-base font-black text-slate-950 mt-1">
                        {msg.scope.title}
                      </h3>
                      <div className="text-xs text-slate-600 font-semibold mt-0.5">
                        Category: <strong className="text-slate-900">{msg.scope.category}</strong> &bull; Turnaround: {msg.scope.estimatedTurnaround} &bull; 3 Revisions Included
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#E9A995] self-start sm:self-auto">
                      <span className="text-2xl font-black text-[#C84E2D] tabular-nums">
                        {msg.scope.coins} Coins
                      </span>
                      <span className="text-xs text-slate-500 font-bold">
                        (${msg.scope.usdAmount || msg.scope.coins * 50} USD)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-600 block">Included Deliverables:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      {msg.scope.deliverables?.map((deliv, di) => (
                        <div key={di} className="flex items-start gap-2">
                          <span className="text-emerald-700 font-black shrink-0">&bull;</span>
                          <span className="leading-snug">{deliv}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What is required from business */}
                  {msg.scope.requiredFromBusiness && msg.scope.requiredFromBusiness.length > 0 && (
                    <div className="bg-white p-3 rounded-xl border border-[#E9A995] text-xs text-slate-700 space-y-1">
                      <span className="text-[10px] font-black uppercase text-[#C84E2D] block">
                        What Peach Requires From Your Business:
                      </span>
                      {msg.scope.requiredFromBusiness.map((req, ri) => (
                        <div key={ri} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-[#C84E2D] font-black shrink-0">&rarr;</span>
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 text-[11px] text-slate-500 font-medium">
                    All tiers include 100% administrative site/asset ownership transfer, vector files in Brand Vault, and 3 full revision rounds.
                  </div>
                </div>
              )}

              {/* HIRE PROMPT */}
              {msg.scope && msg.matchedCreatives && msg.matchedCreatives.length > 0 && !msg.showCreatives && (
                <div className="p-4 bg-white border-2 border-[#C84E2D] rounded-2xl space-y-3">
                  <div className="text-sm font-black text-slate-950">
                    Ready to view the 3 vetted creatives for this project?
                  </div>
                  <p className="text-xs text-slate-600">
                    We matched 3 approved creatives from our app who have a proven history of designing in this category.
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleConfirmHirePrompt(msg.id)}
                      className="px-4 py-2.5 bg-[#C84E2D] hover:bg-[#A33B1E] text-white rounded-xl text-xs font-black shadow-xs cursor-pointer transition-colors"
                    >
                      View 3 Matched Creatives
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage("I want to adjust this tier first.")}
                      className="px-4 py-2.5 bg-[#FFF2EB] hover:bg-[#FFE3D6] text-[#C84E2D] border border-[#E9A995] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      Adjust Tier
                    </button>
                  </div>
                </div>
              )}

              {/* 3 VETTED CREATIVES WITH DESIGN HISTORY */}
              {msg.scope && msg.matchedCreatives && msg.matchedCreatives.length > 0 && msg.showCreatives && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#0B2D22]">
                      Choose 1 of 3 Matched Creatives (Based on Design History):
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Ranked by portfolio &amp; niche
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {msg.matchedCreatives.slice(0, 3).map((creative) => {
                      const isSubmitting = submittingOffer === creative.id;
                      const hasSufficientCoins = availableCoins >= (msg.scope?.coins || 0);
                      const hubName = creative.hub || "Birmingham Hub";

                      return (
                        <div
                          key={creative.id}
                          className="bg-white border-2 border-[#F2C2B2] hover:border-[#C84E2D] rounded-2xl p-4 flex flex-col justify-between transition-all shadow-2xs hover:shadow-xs"
                        >
                          <div>
                            {/* Creative Header */}
                            <div className="flex items-center gap-3 mb-2.5">
                              <img
                                src={creative.avatar_url || "/Creative2.jpg"}
                                alt={creative.name}
                                className="w-11 h-11 rounded-full object-cover border-2 border-[#F2C2B2] shadow-2xs"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <strong className="text-xs font-black text-slate-950 truncate block">
                                    {creative.name}
                                  </strong>
                                  <span className="text-[10px] font-black text-[#C84E2D] bg-[#FFF2EB] px-1.5 py-0.5 rounded">
                                    {creative.match_score}%
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {creative.headline}
                                </div>
                                <div className="text-[10px] text-[#A33B1E] font-black uppercase tracking-wider mt-0.5">
                                  {hubName}
                                </div>
                              </div>
                            </div>

                            {/* Match reason based on history of designing */}
                            <div className="p-2 bg-[#FFF8F5] border border-[#F2C2B2] rounded-xl text-[10px] text-slate-700 leading-snug mb-2">
                              <strong className="text-[#C84E2D] block uppercase font-black text-[9px]">
                                Why Matched:
                              </strong>
                              {creative.match_reason}
                            </div>

                            {/* Portfolio Thumbnail preview with design history title */}
                            {creative.featured_work && (
                              <div
                                onClick={() =>
                                  setPreviewImage({
                                    url: creative.featured_work.image_url,
                                    title: creative.featured_work.title,
                                    creativeName: creative.name,
                                    industry: creative.featured_work.industry,
                                  })
                                }
                                className="relative rounded-xl overflow-hidden h-20 bg-slate-100 border border-slate-200 cursor-pointer group mb-3"
                              >
                                <img
                                  src={creative.featured_work.image_url}
                                  alt={creative.featured_work.title}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-center text-white">
                                  <span className="text-[10px] font-bold">Past Work:</span>
                                  <span className="text-[10px] font-semibold truncate max-w-full">{creative.featured_work.title}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Match / Action Button */}
                          <div className="pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                if (!hasSufficientCoins) {
                                  handleInstantTopUp((msg.scope?.coins || 0) - availableCoins);
                                } else {
                                  handleSelectCreative(creative, msg.scope!);
                                }
                              }}
                              disabled={isSubmitting}
                              className="w-full py-2.5 bg-[#C84E2D] hover:bg-[#A33B1E] text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer disabled:opacity-50 text-center"
                            >
                              {isSubmitting
                                ? "Creating Brief & Contract..."
                                : !hasSufficientCoins
                                ? `Top Up & Hire ${creative.name.split(" ")[0]}`
                                : `Select & Hire (${msg.scope?.coins ?? 0} Coins)`}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-xl bg-[#C84E2D] text-white flex items-center justify-center text-[11px] font-black shrink-0 shadow-2xs">
              PM
            </div>
            <div className="bg-white border-2 border-[#F2C2B2] rounded-2xl p-4 rounded-tl-none shadow-xs text-xs text-slate-600 font-medium">
              Peach Match AI is calibrating the 2026 Master Catalog and matching creative design histories...
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* 3. PROMPT STARTER CHIPS */}
      <div className="px-5 py-2.5 bg-[#FFF2EB] border-t border-[#F2C2B2] flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#A33B1E] shrink-0">
          Try:
        </span>
        {starterPrompts.map((starter, si) => (
          <button
            key={si}
            type="button"
            onClick={() => handleSendMessage(starter.prompt)}
            disabled={loading}
            className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFE3D6] border border-[#E9A995] text-xs font-bold text-slate-800 hover:text-[#C84E2D] transition-colors cursor-pointer shadow-2xs shrink-0"
          >
            {starter.label}
          </button>
        ))}
      </div>

      {/* 4. DOCKED INPUT BAR */}
      <div className="p-4 sm:p-5 bg-white border-t border-[#F2C2B2]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-end gap-2 bg-[#FFF8F5] focus-within:bg-white border-2 border-[#F2C2B2] focus-within:border-[#C84E2D] rounded-2xl p-2 transition-all shadow-inner"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={handleTextareaChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Message Peach Match AI... (e.g. 'I need a website for a restaurant' or 'I need a 4-page menu and flyer')"
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden resize-none leading-relaxed min-h-[40px] max-h-[140px]"
          />

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
              prompt.trim() && !loading
                ? "bg-[#C84E2D] text-white shadow-xs hover:bg-[#A33B1E]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
            title="Send message (Enter)"
            aria-label="Send message to Peach Match AI"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
          <span>Press Enter to send, Shift+Enter for line break</span>
          <span className="font-bold text-[#A33B1E]">1 Peach Coin = $50 USD &bull; Protected Escrow</span>
        </div>
      </div>

      {/* 5. LIGHTBOX MODAL FOR PORTFOLIO SAMPLES */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-80 bg-stone-900 flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-full max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <h4 className="text-base font-black text-slate-950">
                  {previewImage.title}
                </h4>
                <p className="text-xs text-slate-500 font-semibold">
                  By {previewImage.creativeName} &bull; {previewImage.industry || "Commercial Portfolio"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 bg-[#C84E2D] text-white text-xs font-black rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
