"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AskArtDirectorButton } from "@/app/components/ask-art-director-modal";

interface PeachMatchAIBoxProps {
  initialAvailableCoins: number;
  businessName: string;
}

interface DiagnosticQuestion {
  id: string;
  question: string;
  pills: string[];
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

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  headline?: string;
  mode?: "diagnostic" | "recommendation" | "fallback";
  isRateLimit?: boolean;
  diagnosticQuestions?: DiagnosticQuestion[] | null;
  scope?: ScopedProject | null;
  matchedCreatives?: MatchedCreative[];
  showCreatives?: boolean;
}

// Initial starter prompts shown ONLY on welcome screen before chat starts
const starterPrompts = [
  {
    label: "Restaurant Website",
    prompt: "I need a website for my restaurant. What do you need to diagnose my scope?",
  },
  {
    label: "Brand Identity Suite",
    prompt: "I need a brand identity and logo suite designed for my business.",
  },
  {
    label: "Shoe E-Commerce Store",
    prompt: "I need an e-commerce website for a footwear brand with product detail pages and cart.",
  },
  {
    label: "Food & Dish Photography",
    prompt: "I need an on-location commercial photography shoot for signature dishes at my venue.",
  },
  {
    label: "Event Promo Flyer Kit",
    prompt: "I need a high-impact commercial event flyer with 300 DPI print and social story formats.",
  },
  {
    label: "Monthly Social Media Suite",
    prompt: "I need a monthly social media content package with video reels and static posts.",
  },
];

export function PeachMatchAIBox({
  initialAvailableCoins,
  businessName,
}: PeachMatchAIBoxProps) {
  const router = useRouter();
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
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

  // Initial welcome message - calm, high-end design agency concierge
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: `Welcome to Peach Match AI v1.1. I act as your agency Creative Director.
Tell me what you are planning to build—a website, branding suite, commercial photo shoot, or social campaign.
I will ask 2 to 3 quick diagnostic questions to understand your technical requirements and assets, then lock in one definitive package and pair you with 3 vetted specialists.`,
    },
  ]);

  // Scroll ONLY the internal chat container — NEVER scroll the outer window/screen
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
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

      const res = await fetch("/api/peach-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Peach Match AI could not process your message.");

      if (data.rateLimit || data.error === "rate_limit") {
        const fallbackMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            data.answer ||
            "Peach Match AI v1.1 is experiencing high volume right now—click **Ask an Art Director** in the top bar and our team will scope your project for free.",
          headline: data.headline || "High Volume Notice",
          mode: "fallback",
          isRateLimit: true,
          diagnosticQuestions: null,
          scope: null,
          matchedCreatives: [],
          showCreatives: false,
        };
        setMessages((prev) => [...prev, fallbackMsg]);
        return;
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer || "Here is your recommended project scope.",
        headline: data.headline,
        mode: data.mode || (data.scope ? "recommendation" : "diagnostic"),
        isRateLimit: false,
        diagnosticQuestions: Array.isArray(data.diagnosticQuestions) ? data.diagnosticQuestions : null,
        scope: data.scope || null,
        matchedCreatives: Array.isArray(data.matchedCreatives) ? data.matchedCreatives : [],
        showCreatives: Boolean(data.scope),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg = String(err?.message || "").toLowerCase();
      const isRateLimit =
        errMsg.includes("429") ||
        errMsg.includes("quota") ||
        errMsg.includes("rate") ||
        errMsg.includes("volume") ||
        errMsg.includes("exhausted");

      if (isRateLimit) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            isRateLimit: true,
            headline: "High Volume Notice",
            content:
              "Peach Match AI v1.1 is experiencing high volume right now—click **Ask an Art Director** in the top bar and our team will scope your project for free.",
          },
        ]);
      } else {
        setErrorMsg(err?.message || "Failed to consult Peach Match AI. Please try again.");
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content:
              "I'm right here! Tell me a bit about your project goals or tap one of the suggested project options.",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
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

      setSuccessMsg(`Matched with ${creative.name}! Creative Brief Sheet & Contract created. Redirecting to workspace...`);
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
    <div className="bg-[#FFFDFB] border border-[#E8D8CF] rounded-3xl shadow-sm overflow-hidden flex flex-col transition-all">
      {/* 1. TOPBAR - Clean, High-End Agency Concierge Style */}
      <header className="px-5 py-3.5 bg-[#173328] text-white flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-white uppercase">
                Peach Match AI v1.1
              </span>
              <span className="text-[10px] font-black tracking-wider !text-white text-white bg-[#244738] border border-white/20 px-2 py-0.5 rounded-full uppercase">
                Concierge Scoping
              </span>
            </div>
            <div className="text-[11px] text-[#DCE7E1] font-medium truncate">
              Diagnose First &bull; 1 Peach Coin = $50.00 USD &bull; 3 Revisions Included &bull; 100% Transfer
            </div>
          </div>
        </div>

        {/* Right Actions: Wallet balance + New Chat */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#244738] text-xs font-black !text-white text-white border border-white/20">
            <span>{availableCoins} Coins</span>
            <span className="text-[10px] text-white/90 font-bold">(${availableCoins * 50})</span>
          </div>

          <button
            type="button"
            onClick={() => handleInstantTopUp(10)}
            disabled={topUpLoading}
            className="hidden md:inline-flex items-center px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FFF2EB] text-[#173328] text-xs font-black transition-colors cursor-pointer shadow-2xs"
            title="Buy 10 coins ($500 USD)"
          >
            Buy Coins
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#204938] hover:bg-[#2c614b] text-xs font-black !text-white text-white border border-white/20 transition-colors cursor-pointer shadow-2xs"
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

      {/* 2. CHAT STREAM - Calm, short, scannable in 5 seconds. Internal scroll only — does NOT scroll window. */}
      <div
        ref={chatScrollContainerRef}
        className="p-4 sm:p-6 space-y-4 max-h-[540px] overflow-y-auto bg-gradient-to-b from-[#FFFDFB] to-white scrollbar-thin"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 text-sm ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-[#173328] text-white flex items-center justify-center text-[11px] font-black shrink-0 shadow-2xs mt-0.5">
                PM
              </div>
            )}

            <div
              className={`rounded-2xl leading-relaxed text-xs sm:text-sm ${
                msg.role === "user"
                  ? "bg-[#173328] !text-white text-white p-4 max-w-xl font-medium rounded-tr-none shadow-xs"
                  : "bg-white border border-[#EBE4DE] text-slate-850 p-4 sm:p-5 max-w-2xl rounded-tl-none shadow-2xs space-y-3"
              }`}
            >
              {/* Optional punchy diagnosis headline */}
              {msg.headline && (
                <div className="text-[11px] font-black uppercase tracking-wider text-[#C84E2D]">
                  {msg.headline}
                </div>
              )}

              {/* Message text - scannable in 5 seconds. Highly visible pure white font for user input */}
              <div
                className={`whitespace-pre-wrap leading-relaxed text-xs sm:text-sm ${
                  msg.role === "user" ? "!text-white text-white font-semibold" : "text-slate-800"
                }`}
              >
                {msg.content}
              </div>

              {/* Inline Art Director Action on Rate Limit / High Volume */}
              {msg.isRateLimit && (
                <div className="pt-2 border-t border-amber-200/80 flex items-center gap-3 flex-wrap">
                  <AskArtDirectorButton businessName={businessName} />
                  <span className="text-[11px] text-stone-500 font-medium">
                    Free scoping guidance with a senior creative director
                  </span>
                </div>
              )}

              {/* DIAGNOSTIC QUESTIONS WITH CLICKABLE PILL BUTTONS */}
              {msg.diagnosticQuestions && msg.diagnosticQuestions.length > 0 && (
                <div className="pt-2 border-t border-stone-100 space-y-3">
                  {msg.diagnosticQuestions.map((dq) => (
                    <div key={dq.id} className="space-y-1.5">
                      <span className="text-[11px] font-bold text-stone-700 block">
                        {dq.question}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dq.pills.map((pill, pi) => (
                          <button
                            key={pi}
                            type="button"
                            onClick={() => handleSendMessage(pill)}
                            disabled={loading}
                            className="text-left px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFF5F0] hover:bg-[#C84E2D] text-[#8C341B] hover:text-white border border-[#F2C2B2] hover:border-[#C84E2D] transition-all cursor-pointer shadow-2xs"
                          >
                            {pill}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ONE DEFINITIVE RECOMMENDED PACKAGE CARD */}
              {msg.scope && (
                <div className="bg-[#FFF9F6] border-2 border-[#C84E2D] rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F2C2B2]">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#C84E2D] px-2 py-0.5 rounded-full">
                        Definitive Agency Recommendation
                      </span>
                      <h3 className="text-base font-black text-slate-950 mt-1">
                        {msg.scope.title}
                      </h3>
                      <div className="text-xs text-slate-600 font-semibold mt-0.5">
                        Category: <strong className="text-slate-900">{msg.scope.category}</strong> &bull; Turnaround: {msg.scope.estimatedTurnaround}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#F2C2B2] self-start sm:self-auto">
                      <span className="text-xl font-black text-[#C84E2D]">
                        {msg.scope.coins} Coins
                      </span>
                      <span className="text-xs text-slate-500 font-bold">
                        (${msg.scope.usdAmount || msg.scope.coins * 50} USD)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-stone-600 block">Included Deliverables:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                      {msg.scope.deliverables?.map((deliv, di) => (
                        <div key={di} className="flex items-start gap-1.5">
                          <span className="text-emerald-700 font-black shrink-0">&bull;</span>
                          <span className="leading-snug">{deliv}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {msg.scope.requiredFromBusiness && msg.scope.requiredFromBusiness.length > 0 && (
                    <div className="bg-white p-2.5 rounded-xl border border-[#F2C2B2] text-xs text-slate-700 space-y-1">
                      <span className="text-[10px] font-black uppercase text-[#C84E2D] block">
                        What We Require From You:
                      </span>
                      {msg.scope.requiredFromBusiness.map((req, ri) => (
                        <div key={ri} className="flex items-start gap-1 text-[11px]">
                          <span className="text-[#C84E2D] font-bold">&rarr;</span>
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 font-medium pt-1">
                    Includes 3 revision rounds, protected escrow, and 100% administrative site &amp; asset ownership transfer.
                  </div>
                </div>
              )}

              {/* 3 SKILL-ACCURATE MATCHED CREATIVES */}
              {msg.scope && msg.matchedCreatives && msg.matchedCreatives.length > 0 && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#173328]">
                      3 Vetted Creatives Ready for this Exact Scope:
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Ranked by verified portfolio
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
                                className="w-10 h-10 rounded-full object-cover border-2 border-[#F2C2B2] shadow-2xs"
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

                            {/* Match reason based on skill & history */}
                            <div className="p-2 bg-[#FFF8F5] border border-[#F2C2B2] rounded-xl text-[10px] text-slate-700 leading-snug mb-2">
                              <strong className="text-[#C84E2D] block uppercase font-black text-[9px]">
                                Verified Skill Fit:
                              </strong>
                              {creative.match_reason}
                            </div>

                            {/* Portfolio Thumbnail preview */}
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
                                className="relative rounded-xl overflow-hidden h-18 bg-slate-100 border border-slate-200 cursor-pointer group mb-3"
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
                              className="w-full py-2 bg-[#C84E2D] hover:bg-[#A33B1E] text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer disabled:opacity-50 text-center"
                            >
                              {isSubmitting
                                ? "Creating Brief..."
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
            <div className="w-8 h-8 rounded-xl bg-[#173328] text-white flex items-center justify-center text-[11px] font-black shrink-0 shadow-2xs">
              PM
            </div>
            <div className="bg-white border border-[#EBE4DE] rounded-2xl p-4 rounded-tl-none shadow-xs text-xs text-slate-600 font-medium">
              Diagnosing project requirements and checking vetted creative rosters...
            </div>
          </div>
        )}

        </div>

      {/* 3. PROMPT STARTER CHIPS - HIDDEN ONCE CONVERSATION STARTS (messages.length > 1) */}
      {messages.length <= 1 && (
        <div className="px-5 py-2.5 bg-[#FFF9F6] border-t border-[#F2C2B2] flex items-center gap-2 overflow-x-auto scrollbar-none">
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
      )}

      {/* 4. DOCKED INPUT BAR */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E8D8CF]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-end gap-2 bg-[#FFFDFB] focus-within:bg-white border border-[#E8D8CF] focus-within:border-[#173328] rounded-2xl p-2 transition-all shadow-inner"
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
              placeholder="Message Peach Match AI... (e.g. 'I need a website for my restaurant' or 'I need a new logo')"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden resize-none leading-relaxed min-h-[38px] max-h-[120px]"
            />

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                prompt.trim() && !loading
                  ? "bg-[#173328] hover:bg-[#234b3c] !text-white text-white shadow-xs"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
              title="Send message (Enter)"
              aria-label="Send message to Peach Match AI"
            >
              {loading ? "..." : "Send"}
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
            <span>Press Enter to send, Shift+Enter for line break</span>
            <span className="font-bold text-[#173328]">1 Peach Coin = $50 USD &bull; Protected Escrow</span>
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
                  className="px-4 py-2 bg-[#173328] hover:bg-[#234b3c] !text-white text-white text-xs font-black rounded-xl transition-colors cursor-pointer"
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
