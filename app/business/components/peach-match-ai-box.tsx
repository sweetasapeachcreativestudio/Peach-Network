"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Coins,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  RotateCw,
  Wallet,
} from "lucide-react";

interface PeachMatchAIBoxProps {
  initialAvailableCoins: number;
  businessName: string;
}

interface ScopedProject {
  serviceKey: string;
  title: string;
  category: string;
  complexity: string;
  coins: number;
  usdAmount: number;
  deliverables: string[];
  estimatedTurnaround: string;
  revisionRounds: number;
  reason: string;
  followUp: string | null;
}

const inspirationExamples = [
  "Menu redesign & social promos for cocktail launch",
  "Cold brew bottle packaging & label die-line",
  "Modern brand identity refresh with vector logo & color palette",
  "30-second promotional video reel for Instagram",
  "E-commerce product landing page for local boutique",
];

export function PeachMatchAIBox({
  initialAvailableCoins,
  businessName,
}: PeachMatchAIBoxProps) {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [availableCoins, setAvailableCoins] = useState(initialAvailableCoins);
  const [scoping, setScoping] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [scope, setScope] = useState<ScopedProject | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [topUpSuccessMsg, setTopUpSuccessMsg] = useState("");

  // Handle AI analysis
  const handleAnalyze = async (textToAnalyze?: string) => {
    const input = (textToAnalyze ?? prompt).trim();
    if (!input) {
      setErrorMsg("Please describe your project idea first.");
      return;
    }

    setScoping(true);
    setErrorMsg("");
    setTopUpSuccessMsg("");

    try {
      const res = await fetch("/api/projects/peach-scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: input }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not analyze project.");

      setScope(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to analyze with Peach Match AI.");
    } finally {
      setScoping(false);
    }
  };

  // Instant Top-Up handler right inside the AI container
  const handleInstantTopUp = async (coinsToBuy: number) => {
    setTopUpLoading(true);
    setErrorMsg("");
    setTopUpSuccessMsg("");

    try {
      const res = await fetch("/api/wallet/top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins: coinsToBuy }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Top-up failed.");

      setAvailableCoins(data.newBalance);
      setTopUpSuccessMsg(
        `✓ Added ${data.coinsAdded} Peach Coins ($${data.usdCharged} USD). New balance: ${data.newBalance} Coins.`
      );
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Top-up failed. Please try again or visit Wallet.");
    } finally {
      setTopUpLoading(false);
    }
  };

  // Submit project and find 3 matches
  const handleSubmitAndMatch = async () => {
    if (!scope) return;

    if (availableCoins < scope.coins) {
      setErrorMsg("Please top up your wallet with the required Peach Coins before proceeding.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Create project
      const createRes = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: scope.title,
          category: scope.category,
          serviceKey: scope.serviceKey,
          aiCoins: scope.coins,
          description: prompt.trim() || scope.reason,
          revisionRounds: scope.revisionRounds || 2,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Could not create project.");

      const projectId = createData.project.id;

      // 2. Trigger AI match shortlisting (picks 3 at a time)
      await fetch("/api/projects/ai-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      // 3. Navigate to curated 3-match interface
      router.push(`/business/matches?project=${projectId}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong creating your project.");
      setSubmitting(false);
    }
  };

  const neededCoins = scope ? Math.max(0, scope.coins - availableCoins) : 0;
  const hasEnoughCoins = scope ? availableCoins >= scope.coins : true;

  return (
    <section
      id="peach-match-ai"
      className="bg-white border-2 border-[#173328]/10 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all"
    >
      {/* Decorative Brand Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-100/40 via-peach-50/20 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#EB6244] mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Peach Match AI · Instant Scoping &amp; Pricing</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-950 tracking-tight">
            What would you like to create for {businessName}?
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Describe your project in plain English. Peach Match AI scopes deliverables and prices in Peach Coins (
            <strong className="text-stone-900 font-bold">1 Coin = $50 USD</strong>).
          </p>
        </div>

        {/* Current Wallet Indicator */}
        <div className="flex items-center gap-2 bg-[#FAF8F5] border border-stone-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-800 shrink-0 self-start sm:self-auto">
          <Coins className="w-4 h-4 text-[#EB6244]" />
          <span>Wallet:</span>
          <strong className="text-stone-950 tabular-nums">{availableCoins} Coins</strong>
          <span className="text-stone-400">(${(availableCoins * 50).toLocaleString()} USD)</span>
        </div>
      </div>

      {/* Input Box */}
      <div className="space-y-3">
        <div className="relative">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleAnalyze();
              }
            }}
            placeholder="Type any design request... e.g., 'I need a 4-page menu redesign and matching social promo graphics for our spring cocktail launch next month.'"
            className="w-full bg-[#FAF8F5]/80 focus:bg-white border border-stone-200 focus:border-[#EB6244] rounded-xl p-3.5 text-sm text-stone-950 placeholder:text-stone-400 focus:outline-hidden transition-all leading-relaxed shadow-2xs resize-y min-h-[90px]"
          />
        </div>

        {/* Quick Inspiration Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <span className="text-[11px] text-stone-400 font-medium shrink-0">Try an example:</span>
          {inspirationExamples.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPrompt(ex);
                handleAnalyze(ex);
              }}
              className="text-[11px] font-semibold text-stone-600 hover:text-stone-950 bg-stone-100/80 hover:bg-stone-200/90 px-2.5 py-1 rounded-lg transition-colors shrink-0 cursor-pointer whitespace-nowrap"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Action Button for Scoping */}
        {!scope && (
          <div className="pt-1 flex items-center justify-between gap-3">
            <span className="text-[11px] text-stone-500 hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-[10px] font-mono">⌘ + Enter</kbd> to analyze
            </span>
            <button
              type="button"
              onClick={() => handleAnalyze()}
              disabled={scoping || !prompt.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#EB6244] hover:bg-[#d85538] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer ml-auto"
            >
              {scoping ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Peach AI is Scoping Deliverables…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Scope &amp; Get Price →</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Scoped Result Card */}
      {scope && (
        <div className="mt-5 pt-5 border-t border-stone-200/80 space-y-4 animate-fade-in">
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200/70">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-[#EB6244] uppercase tracking-wide">
                    {scope.category}
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="text-stone-600 font-medium">{scope.estimatedTurnaround}</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-stone-600 font-medium">
                    {scope.revisionRounds} revision rounds included
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-stone-950">
                  {scope.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                  {scope.reason}
                </p>
              </div>

              {/* Price Callout */}
              <div className="bg-white border border-stone-200 rounded-xl p-3.5 text-left lg:text-right shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                  Peach Coin Price
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-stone-950 flex items-center lg:justify-end gap-1.5 tabular-nums">
                  <Coins className="w-5 h-5 text-[#EB6244]" />
                  <span>{scope.coins} Coins</span>
                </div>
                <span className="text-xs font-bold text-stone-600 tabular-nums">
                  ${scope.usdAmount.toLocaleString()} USD{" "}
                  <span className="text-[10px] font-normal text-stone-400">($50/coin)</span>
                </span>
              </div>
            </div>

            {/* Deliverables List */}
            <div className="pt-3">
              <span className="text-xs font-bold text-stone-800 block mb-1.5">
                Included Deliverables:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                {scope.deliverables.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Wallet Balance Verification & Top-Up Alert */}
          {hasEnoughCoins ? (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-900 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  You have <strong className="font-bold">{availableCoins} Coins</strong> available.{" "}
                  {scope.coins} Coins will be held in secure escrow once your creative accepts.
                </span>
              </div>

              <button
                type="button"
                onClick={handleSubmitAndMatch}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#173328] hover:bg-[#234b3c] text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                {submitting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Finding Top 3 Creatives…</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Find Matching Creatives →</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-start gap-2.5 text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block text-sm text-amber-900">
                    Additional Peach Coins needed for this project
                  </strong>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    This project requires <strong className="font-bold">{scope.coins} Coins</strong> ($
                    {scope.usdAmount} USD), but you currently have{" "}
                    <strong className="font-bold">{availableCoins} Coins</strong>. You need{" "}
                    <strong className="font-bold">{neededCoins} more Coin{neededCoins === 1 ? "" : "s"}</strong> ($
                    {neededCoins * 50} USD).
                  </p>
                </div>
              </div>

              {/* Instant Top-Up Action Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-amber-200/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-amber-900">Quick Top-Up Options:</span>
                  <button
                    type="button"
                    onClick={() => handleInstantTopUp(neededCoins)}
                    disabled={topUpLoading}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    +{neededCoins} Coin{neededCoins === 1 ? "" : "s"} (${neededCoins * 50})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstantTopUp(neededCoins + 2)}
                    disabled={topUpLoading}
                    className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    +{neededCoins + 2} Coins (${(neededCoins + 2) * 50})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push("/business/wallet")}
                    className="text-amber-900 hover:underline font-bold text-xs"
                  >
                    Full Wallet &amp; Billing →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reset / Modify Brief Button */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setScope(null);
                setErrorMsg("");
              }}
              className="text-stone-500 hover:text-stone-900 underline font-medium cursor-pointer"
            >
              ← Edit project description
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {errorMsg && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
          {errorMsg}
        </div>
      )}

      {topUpSuccessMsg && (
        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
          {topUpSuccessMsg}
        </div>
      )}
    </section>
  );
}
