"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PeachMatchAIBoxProps {
  initialAvailableCoins: number;
  businessName: string;
}

interface ScopedProject {
  serviceKey: string;
  title: string;
  category: string;
  coins: number;
  usdAmount: number;
  deliverables: string[];
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
  scope?: ScopedProject | null;
  matchedCreatives?: MatchedCreative[];
  showCreatives?: boolean;
}

// Strictly NO ICONS in starter prompts as requested
const starterPrompts = [
  {
    label: "Restaurant Website",
    prompt: "I need a website for a restaurant. What kind of website do I need and how much will it cost?",
  },
  {
    label: "Event Flyer Scope",
    prompt: "I need an event flyer designed. How much does it cost and what is the difference between basic and advanced?",
  },
  {
    label: "Logo & Brand Suite",
    prompt: "I need branding done for my business and a new logo. What should I include?",
  },
  {
    label: "Shoe E-Commerce Store",
    prompt: "I need a website for a shoe company with e-commerce store and shoe box packaging dielines.",
  },
  {
    label: "Food Photography",
    prompt: "I need an on-location commercial photography shoot for 10 signature dishes at my restaurant.",
  },
  {
    label: "Why 3 Logos in a Suite?",
    prompt: "Why do I need a 3-part logo suite instead of just one logo?",
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

  // Initial welcome message - strictly NO ICONS, NO "Creative Director"
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: `Hey! I am Peach Match AI, your companion on Sweet As A Peach.

Tell me what you are building—whether it is a restaurant website, event flyer, 3-part logo suite, or photo shoot.

I will diagnose your exact scope, calculate transparent pricing (1 Peach Coin = $50.00 USD), and help you hire vetted creatives in under 5 minutes.`,
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
        scope: data.scope || null,
        matchedCreatives: Array.isArray(data.matchedCreatives) ? data.matchedCreatives : [],
        showCreatives: false, // User must confirm "Would you like to hire creatives to get it done?"
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const rawMsg = String(err?.message || "").toLowerCase();
      const isQuotaOrRate =
        rawMsg.includes("rate") ||
        rawMsg.includes("limit") ||
        rawMsg.includes("429") ||
        rawMsg.includes("quota") ||
        rawMsg.includes("exhausted");

      const friendlyNotice = isQuotaOrRate
        ? "Peach Match AI is currently at high volume. Please tap one of the suggested project scopes below or retry."
        : (err.message || "Failed to consult Peach Match AI. Please try again.");

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

  // Select creative & dispatch offer, then immediately redirect to /projects/[id]
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
          estimatedTurnaround: currentScope.estimatedTurnaround,
          revisionRounds: 3,
          selectedCreativeId: creative.id,
          matchScore: creative.match_score,
          matchReason: creative.match_reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project and dispatch offer.");

      setSuccessMsg(`Matched with ${creative.name}! Redirecting to your live project room...`);
      
      // Immediately navigate client to project room with DoorDash-style dispatch timeline
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
    // DARKER PEACH CONTAINER: Rich terracotta/warm darker peach border and accent header
    <div className="bg-[#FFF9F6] border-2 border-[#C84E2D] rounded-3xl shadow-md overflow-hidden flex flex-col transition-all">
      {/* 1. TOPBAR: Standout darker peach bar, NO ICONS, strictly "Peach Match AI" */}
      <header className="px-5 py-3.5 bg-[#C84E2D] text-white flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white uppercase">
                Peach Match AI
              </span>
              <span className="text-[10px] font-black tracking-widest text-[#FFF2EB] bg-[#A33B1E] px-2.5 py-0.5 rounded-full uppercase">
                Active Scope Engine
              </span>
            </div>
            <div className="text-[11px] text-[#FFE8DF] font-medium truncate">
              1 Peach Coin = $50.00 USD &bull; Get matched in 5 mins &bull; 3 Revisions Included
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
            onClick={() => handleInstantTopUp(6)}
            disabled={topUpLoading}
            className="hidden md:inline-flex items-center px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FFEAE2] text-[#C84E2D] text-xs font-bold transition-colors cursor-pointer"
            title="Buy 6 coins ($300 USD)"
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

      {/* 2. CHAT STREAM (LIKE CHATGPT & GEMINI) */}
      <div className="p-4 sm:p-6 space-y-5 max-h-[520px] overflow-y-auto bg-gradient-to-b from-[#FFF5F0] to-white scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 text-sm ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* Assistant Label Tag (strictly NO icon) */}
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

              {/* Companion Tip Pill */}
              {msg.companionTip && (
                <div className="bg-[#FFF2EB] border-l-4 border-[#C84E2D] p-3 rounded-r-xl text-xs text-slate-700 space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#C84E2D] block">
                    Studio Tip:
                  </span>
                  <p className="leading-snug text-slate-700 italic">"{msg.companionTip}"</p>
                </div>
              )}

              {/* Interactive Scope Clarification Options */}
              {msg.clarification && msg.clarification.needed && msg.clarification.options?.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block">
                    {msg.clarification.question || "Select an option to clarify your scope:"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {msg.clarification.options.map((opt, oi) => (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => handleSendMessage(opt.value)}
                        disabled={loading}
                        className="text-left px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFF2EB] hover:bg-[#C84E2D] text-[#0B2D22] hover:text-white border border-[#E9A995] hover:border-[#C84E2D] transition-all cursor-pointer shadow-2xs"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SCOPE BREAKDOWN CARD */}
              {msg.scope && (
                <div className="bg-[#FFF4EE] border border-[#E9A995] rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E9A995]">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded">
                        Scope &amp; Price Breakdown
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {msg.scope.deliverables?.map((deliv, di) => (
                      <div key={di} className="flex items-start gap-2">
                        <span className="text-emerald-700 font-black shrink-0">&bull;</span>
                        <span className="leading-snug">{deliv}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500 font-medium">
                    All projects come with 3 revisions included. If you run out, extra revisions can be purchased at 1 Peach Coin each.
                  </div>
                </div>
              )}

              {/* REQUIREMENT: "once it figures out how many coins or how much the project should be then it should ask the client if they would like to hire creatives to get it done?" */}
              {msg.scope && msg.matchedCreatives && msg.matchedCreatives.length > 0 && !msg.showCreatives && (
                <div className="p-4 bg-white border-2 border-[#C84E2D] rounded-2xl space-y-3">
                  <div className="text-sm font-black text-slate-950">
                    Would you like to hire creatives to get it done?
                  </div>
                  <p className="text-xs text-slate-600">
                    We have 3 approved creatives ready in your Hub with matching portfolio work and 95%+ reliability scores.
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleConfirmHirePrompt(msg.id)}
                      className="px-4 py-2.5 bg-[#C84E2D] hover:bg-[#A33B1E] text-white rounded-xl text-xs font-black shadow-xs cursor-pointer transition-colors"
                    >
                      Yes, hire creatives
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage("I want to adjust this scope first.")}
                      className="px-4 py-2.5 bg-[#FFF2EB] hover:bg-[#FFE3D6] text-[#C84E2D] border border-[#E9A995] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      No, adjust scope
                    </button>
                  </div>
                </div>
              )}

              {/* TOP 3 VETTED CREATIVES WITH HUB LABELS (DISPLAYED AFTER CONFIRMATION) */}
              {msg.scope && msg.matchedCreatives && msg.matchedCreatives.length > 0 && msg.showCreatives && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#0B2D22]">
                      Choose 1 of 3 Approved Creatives (5-Minute Match):
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Ranked by Hub &amp; portfolio
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {msg.matchedCreatives.slice(0, 3).map((creative) => {
                      const isSubmitting = submittingOffer === creative.id;
                      const hasSufficientCoins = availableCoins >= (msg.scope?.coins || 0);
                      // REQUIREMENT: Must say what Hub they are in instead of location (e.g., Atlanta Hub, Birmingham Hub)
                      const hubName =
                        creative.hub ||
                        (creative.city?.toLowerCase().includes("atlanta")
                          ? "Atlanta Hub"
                          : creative.city?.toLowerCase().includes("huntsville")
                          ? "Huntsville Hub"
                          : creative.city?.toLowerCase().includes("montgomery")
                          ? "Montgomery Hub"
                          : "Birmingham Hub");

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
                                {/* HUB BADGE (Atlanta Hub, Birmingham Hub, etc.) */}
                                <div className="text-[10px] text-[#A33B1E] font-black uppercase tracking-wider mt-0.5">
                                  {hubName}
                                </div>
                              </div>
                            </div>

                            {/* Bio / Specialty Snippet */}
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug mb-3">
                              {creative.bio}
                            </p>

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
                                className="relative rounded-xl overflow-hidden h-20 bg-slate-100 border border-slate-200 cursor-pointer group mb-3"
                              >
                                <img
                                  src={creative.featured_work.image_url}
                                  alt={creative.featured_work.title}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                                  View Portfolio Work
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
                                ? "Dispatching..."
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
              Peach Match AI is calculating coin pricing and checking Hub creative rosters...
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* 3. PROMPT STARTER CHIPS (strictly NO icons) */}
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
            placeholder="Message Peach Match AI... (e.g. 'I need a website for my restaurant' or 'I need an event flyer with 5 photos')"
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
