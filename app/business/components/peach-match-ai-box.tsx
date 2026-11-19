"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CheckSquare, ChevronDown, Paperclip, Plus, Square, Wallet, X } from "lucide-react";

function renderFormattedMessage(text: string): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-extrabold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

import { AskArtDirectorButton } from "@/app/components/ask-art-director-modal";

interface PeachMatchAIBoxProps {
  initialAvailableCoins: number;
  businessName: string;
  hasActiveSubscription?: boolean;
  subscriptionPlan?: string | null;
  brandReadinessScore?: number;
  missingBrandItems?: string[];
}

export interface ProjectPlanItem {
  id: string;
  service: string;
  serviceKey: string;
  package: string;
  category: string;
  coins: number;
  usd: number;
  status: "needed" | "optional" | "completed";
  estimatedTurnaround: string;
  reason: string;
  deliverables: string[];
  requiredFromBusiness: string[];
}

export interface ProjectPlanPayload {
  goalSummary: string;
  clientBudgetCoins: number | null;
  recommendedItems: ProjectPlanItem[];
  totalCoins: number;
  walletCoverage: "covered" | "partial" | "top_up_needed";
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
  includesPodSupervision?: boolean;
}

interface ServiceOptionQuote {
  serviceKey: string;
  serviceName: string;
  category: string;
  title: string;
  coins: number;
  usdAmount: number;
  estimatedTurnaround: string;
  deliverables: string[];
  requiredFromBusiness: string[];
  reason: string;
}

interface MultiServiceQuotePayload {
  serviceA: ServiceOptionQuote;
  serviceB: ServiceOptionQuote;
  combined: {
    title: string;
    coins: number;
    usdAmount: number;
    estimatedTurnaround: string;
    includesPodSupervision: boolean;
    deliverables: string[];
    requiredFromBusiness: string[];
  };
  walletCoverageMessage: string;
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
  mode?:
    | "diagnostic"
    | "recommendation"
    | "price_quote"
    | "matched_creatives"
    | "multi_service_quote"
    | "matched_both_creatives"
    | "fallback"
    | "out_of_scope"
    | "mixed_scope"
    | "advice"
    | "project_confirmed";
  isRateLimit?: boolean;
  showFeedbackButton?: boolean;
  diagnosticQuestions?: DiagnosticQuestion[] | null;
  quickReplies?: string[];
  scope?: ScopedProject | null;
  multiServiceQuote?: MultiServiceQuotePayload | null;
  projectPlan?: ProjectPlanPayload | null;
  matchStrategy?: "hybrid" | "split";
  hybridCreatives?: MatchedCreative[];
  serviceACreatives?: MatchedCreative[];
  serviceBCreatives?: MatchedCreative[];
  includesPodSupervision?: boolean;
  findCreativesPrompt?: string;
  matchedCreatives?: MatchedCreative[];
  showCreatives?: boolean;
  createdProjectId?: string;
  createdLinkedProjects?: Array<{ id: string; title: string; status: string; coins: number }>;
  uploadedImages?: Array<{ url: string; name?: string }>;
}

interface AttachedImage {
  file: File;
  previewUrl: string;
  base64: string;
  name: string;
  mimeType: string;
}

export function PeachMatchAIBox({
  initialAvailableCoins,
  businessName,
  hasActiveSubscription = false,
  subscriptionPlan = null,
  brandReadinessScore,
  missingBrandItems,
}: PeachMatchAIBoxProps) {
  const router = useRouter();
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableCoins, setAvailableCoins] = useState(initialAvailableCoins);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [submittingOffer, setSubmittingOffer] = useState<string | null>(null);

  // 1-Step Confirmation Modal State (guarantees coins are NEVER deducted without explicit review)
  const [selectedCandidateForConfirmation, setSelectedCandidateForConfirmation] = useState<
    | {
        type: "single";
        creative: MatchedCreative;
        scope: ScopedProject;
      }
    | {
        type: "split";
        creativeA: MatchedCreative;
        creativeB: MatchedCreative;
        multiServiceQuote: MultiServiceQuotePayload;
      }
    | null
  >(null);

  // Split specialist picks keyed by assistant message ID
  const [splitSelections, setSplitSelections] = useState<
    Record<string, { creativeA?: MatchedCreative; creativeB?: MatchedCreative }>
  >({});

  // Interactive Project Plan checked items & collapsible details keyed by assistant message ID
  const [planSelections, setPlanSelections] = useState<Record<string, Record<string, boolean>>>({});
  const [expandedPlanDetails, setExpandedPlanDetails] = useState<Record<string, boolean>>({});

  // Attached reference images for Peachy™ multimodal scoping
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [currentReferenceUrls, setCurrentReferenceUrls] = useState<string[]>([]);

  // Diagnostic multi-question answer selection: { [questionId]: selectedPillText }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

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

  // Initial welcome message - Peachy™ Creative Director persona
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: `Hey there! I'm **Peachy™**, your Creative Director for Peach Network. Tell me what you're building today—or drop a screenshot if you're not sure what to call it—and I'll help you scope it right and match you with vetted US creatives.`,
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

  const handleTogglePlanItem = (msgId: string, itemId: string, currentPlan: ProjectPlanPayload) => {
    setPlanSelections((prev) => {
      const existing = prev[msgId] || buildInitialPlanSelection(currentPlan);
      return {
        ...prev,
        [msgId]: {
          ...existing,
          [itemId]: !existing[itemId],
        },
      };
    });
  };

  function buildInitialPlanSelection(plan: ProjectPlanPayload): Record<string, boolean> {
    const map: Record<string, boolean> = {};
    for (const item of plan.recommendedItems) {
      map[item.id] = item.status === "needed";
    }
    return map;
  }

  const handleLaunchFromProjectPlan = async (plan: ProjectPlanPayload, msgId: string) => {
    const selMap = planSelections[msgId] || buildInitialPlanSelection(plan);
    const chosen = plan.recommendedItems.filter((it) => Boolean(selMap[it.id]));
    if (chosen.length === 0) return;

    if (chosen.length === 1) {
      const item = chosen[0];
      await handleFindCreatives({
        serviceKey: item.serviceKey,
        title: item.package || item.service,
        category: item.category,
        coins: item.coins,
        usdAmount: item.usd || item.coins * 50,
        deliverables: item.deliverables?.length
          ? item.deliverables
          : [`Complete ${item.service} commercial deliverables`],
        requiredFromBusiness: item.requiredFromBusiness?.length
          ? item.requiredFromBusiness
          : ["Brand Vault assets & project notes"],
        estimatedTurnaround: item.estimatedTurnaround || "5–7 Business Days",
        revisionRounds: 3,
        reason: item.reason,
      });
      return;
    }

    const first = chosen[0];
    const second = chosen[1];
    const totalCoins = chosen.reduce((sum, i) => sum + i.coins, 0);
    const multiPayload: MultiServiceQuotePayload = {
      serviceA: {
        serviceKey: first.serviceKey,
        serviceName: first.service,
        category: first.category,
        title: first.package,
        coins: first.coins,
        usdAmount: first.usd || first.coins * 50,
        estimatedTurnaround: first.estimatedTurnaround,
        deliverables: first.deliverables || [],
        requiredFromBusiness: first.requiredFromBusiness || [],
        reason: first.reason,
      },
      serviceB: {
        serviceKey: second.serviceKey,
        serviceName: second.service,
        category: second.category,
        title: second.package,
        coins: second.coins,
        usdAmount: second.usd || second.coins * 50,
        estimatedTurnaround: second.estimatedTurnaround,
        deliverables: second.deliverables || [],
        requiredFromBusiness: second.requiredFromBusiness || [],
        reason: second.reason,
      },
      combined: {
        title: `${first.service} + ${second.service} Linked Package`,
        coins: totalCoins,
        usdAmount: totalCoins * 50,
        estimatedTurnaround: first.estimatedTurnaround || "8–12 Business Days",
        includesPodSupervision: totalCoins > 20,
        deliverables: chosen.flatMap((c) => c.deliverables || []).slice(0, 6),
        requiredFromBusiness: Array.from(
          new Set(chosen.flatMap((c) => c.requiredFromBusiness || []))
        ).slice(0, 4),
      },
      walletCoverageMessage:
        availableCoins >= totalCoins
          ? `Your wallet covers this ${totalCoins}-Coin plan.`
          : `Top up ${totalCoins - availableCoins} Coins to launch all selected deliverables.`,
    };
    await handleFindBothCreatives(multiPayload);
  };

  const handleTogglePill = (questionId: string, pill: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: prev[questionId] === pill ? "" : pill,
    }));
  };

  const handleSubmitDiagnosticAnswers = (questions: DiagnosticQuestion[]) => {
    const answeredItems = questions
      .map((q) => {
        const ans = selectedAnswers[q.id];
        return ans ? `${q.question}\n→ ${ans}` : null;
      })
      .filter(Boolean);

    if (answeredItems.length === 0) return;

    const formattedMessage = `Diagnostic Specifications:\n${answeredItems.join("\n\n")}`;
    handleSendMessage(formattedMessage);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = Math.max(0, 3 - attachedImages.length);
    const validFiles = files.slice(0, remainingSlots);

    for (const file of validFiles) {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Please upload JPG, PNG, or WebP images.");
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg("Each image must be 8MB or smaller.");
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(",")[1] || "";
        setAttachedImages((prev) => [
          ...prev.slice(0, 2),
          {
            file,
            previewUrl: dataUrl,
            base64,
            name: file.name,
            mimeType: file.type || "image/jpeg",
          },
        ]);
      };
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAttachedImage = (idxToRemove: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== idxToRemove));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Trigger Stage 4: Match 3 vetted creatives for quoted project scope
  const handleFindCreatives = async (scope: ScopedProject) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: "Yes, find my 3 vetted creatives →",
    };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);

    try {
      const res = await fetch("/api/peach-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "find_creatives",
          currentScope: scope,
          message: "Yes, find my creatives",
          history: newHistory.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          clientContext: {
            availableCoins,
            hasSubscription: Boolean(hasActiveSubscription),
            subscriptionPlan: subscriptionPlan ?? null,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not match creatives.");

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer || "Here are 3 vetted specialists ready to take on this scope.",
        headline: data.headline || "3 Vetted Creatives Ready for Your Project",
        mode: "matched_creatives",
        scope: data.scope || scope,
        matchedCreatives: Array.isArray(data.matchedCreatives) ? data.matchedCreatives : [],
        showCreatives: true,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to match creatives.");
    } finally {
      setLoading(false);
    }
  };

  // Multi-Service: User chooses Just [Service A] or Just [Service B] before matching creatives
  const handleChooseSingleFromMulti = async (opt: ServiceOptionQuote) => {
    const singleScope: ScopedProject = {
      serviceKey: opt.serviceKey,
      title: opt.title,
      category: opt.category,
      coins: opt.coins,
      usdAmount: opt.usdAmount,
      deliverables: opt.deliverables,
      requiredFromBusiness: opt.requiredFromBusiness,
      estimatedTurnaround: opt.estimatedTurnaround,
      revisionRounds: 3,
      reason: opt.reason,
    };
    await handleFindCreatives(singleScope);
  };

  // Multi-Service: User chooses Both Together -> Hybrid OR Split Specialist matching
  const handleFindBothCreatives = async (quote: MultiServiceQuotePayload) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: `Both Together: ${quote.serviceA.serviceName} + ${quote.serviceB.serviceName} (${quote.combined.coins} Coins)`,
    };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);

    try {
      const res = await fetch("/api/peach-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "find_both_creatives",
          multiServiceQuote: quote,
          message: `Match creatives for both ${quote.serviceA.serviceName} and ${quote.serviceB.serviceName}`,
          history: newHistory.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          clientContext: {
            availableCoins,
            hasSubscription: Boolean(hasActiveSubscription),
            subscriptionPlan: subscriptionPlan ?? null,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not match multi-service creatives.");

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer || "Here are your matched creatives for both disciplines.",
        headline: data.headline || "Matched Creatives for Both Services",
        mode: "matched_both_creatives",
        matchStrategy: data.matchStrategy || "split",
        multiServiceQuote: data.multiServiceQuote || quote,
        hybridCreatives: Array.isArray(data.hybridCreatives) ? data.hybridCreatives : [],
        serviceACreatives: Array.isArray(data.serviceACreatives) ? data.serviceACreatives : [],
        serviceBCreatives: Array.isArray(data.serviceBCreatives) ? data.serviceBCreatives : [],
        includesPodSupervision: Boolean(data.includesPodSupervision),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to match multi-service creatives.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? prompt).trim();
    const hasImages = attachedImages.length > 0;
    if ((!text && !hasImages) || loading) return;

    setErrorMsg("");
    setSuccessMsg("");

    const currentAttached = [...attachedImages];
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text || "Attached visual reference for Peachy™ review",
      uploadedImages: currentAttached.map((img) => ({
        url: img.previewUrl,
        name: img.name,
      })),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setPrompt("");
    setAttachedImages([]);
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
          message: text || "Please analyze these reference images and advise on scope.",
          history: historyPayload,
          referenceImages: currentAttached.map((img) => ({
            data: img.base64,
            mimeType: img.mimeType,
            name: img.name,
          })),
          clientContext: {
            availableCoins,
            hasSubscription: Boolean(hasActiveSubscription),
            subscriptionPlan: subscriptionPlan ?? null,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Peachy™ could not process your message.");

      if (Array.isArray(data.uploadedImageUrls) && data.uploadedImageUrls.length > 0) {
        setCurrentReferenceUrls((prev) => [...prev, ...data.uploadedImageUrls]);
      }

      if (data.rateLimit || data.error === "rate_limit") {
        const fallbackMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            data.answer ||
            "Peachy™ is experiencing high volume right now—click **Ask an Art Director** in the top bar and our team will scope your project for free.",
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

      if (data.mode === "mixed_scope") {
        const mixedScopeMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.answer || "Mixed scope request notice.",
          headline: data.headline || "Mixed Service Request",
          mode: "mixed_scope",
          isRateLimit: false,
          showFeedbackButton: true,
          quickReplies: Array.isArray(data.quickReplies) ? data.quickReplies : ["Go to Peach Business Feedback →"],
          diagnosticQuestions: null,
          scope: null,
          matchedCreatives: [],
          showCreatives: false,
        };
        setMessages((prev) => [...prev, mixedScopeMsg]);
        return;
      }

      if (data.mode === "out_of_scope" || data.showFeedbackButton) {
        const outOfScopeMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            data.answer ||
            "We currently do not offer this service in Version 1, but you can submit this to our **Peach Business** feedback tab to let our team know it's something you want to see in the app. Every piece of feedback helps us grow—so you are growing with us!",
          headline: data.headline || "Service Outside Version 1 Catalog",
          mode: "out_of_scope",
          isRateLimit: false,
          showFeedbackButton: true,
          diagnosticQuestions: null,
          scope: null,
          matchedCreatives: [],
          showCreatives: false,
        };
        setMessages((prev) => [...prev, outOfScopeMsg]);
        return;
      }

      if (data.mode === "advice") {
        const adviceMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.answer || "Here is my creative direction advice for your project.",
          headline: data.headline || "Peachy™ · Creative Director Advice",
          mode: "advice",
          isRateLimit: false,
          quickReplies: Array.isArray(data.quickReplies) ? data.quickReplies : ["Scope a Website Project", "Scope Brand Identity", "Ask Another Question"],
          diagnosticQuestions: null,
          scope: null,
          matchedCreatives: [],
          showCreatives: false,
        };
        setMessages((prev) => [...prev, adviceMsg]);
        return;
      }

      if (data.mode === "multi_service_quote" && data.multiServiceQuote) {
        const msgId = `assistant-${Date.now()}`;
        const multiQuoteMsg: ChatMessage = {
          id: msgId,
          role: "assistant",
          content: data.answer || "Here is your itemized multi-service breakdown.",
          headline: data.headline || "Itemized Multi-Service Quote",
          mode: "multi_service_quote",
          multiServiceQuote: data.multiServiceQuote,
          projectPlan: data.projectPlan || null,
          diagnosticQuestions: null,
          scope: null,
          matchedCreatives: [],
          showCreatives: false,
        };
        if (data.projectPlan) {
          setPlanSelections((prev) => ({
            ...prev,
            [msgId]: buildInitialPlanSelection(data.projectPlan),
          }));
        }
        setMessages((prev) => [...prev, multiQuoteMsg]);
        return;
      }

      const hasCreatives = Array.isArray(data.matchedCreatives) && data.matchedCreatives.length > 0;
      const isPriceQuote = data.mode === "price_quote" || (data.scope && !hasCreatives);
      const msgId = `assistant-${Date.now()}`;

      const assistantMsg: ChatMessage = {
        id: msgId,
        role: "assistant",
        content: data.answer || "Here is your recommended project scope.",
        headline: data.headline,
        mode: isPriceQuote ? "price_quote" : hasCreatives ? "matched_creatives" : data.mode || "diagnostic",
        isRateLimit: false,
        showFeedbackButton: Boolean(data.showFeedbackButton),
        diagnosticQuestions: Array.isArray(data.diagnosticQuestions) ? data.diagnosticQuestions : null,
        scope: data.scope || null,
        projectPlan: data.projectPlan || null,
        findCreativesPrompt: data.findCreativesPrompt || "Want me to find 3 vetted creatives for this project?",
        matchedCreatives: hasCreatives ? data.matchedCreatives : [],
        showCreatives: hasCreatives,
      };

      if (data.projectPlan) {
        setPlanSelections((prev) => ({
          ...prev,
          [msgId]: buildInitialPlanSelection(data.projectPlan),
        }));
      }

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
              "Peachy™ is experiencing high volume right now—click **Ask an Art Director** in the top bar and our team will scope your project for free.",
          },
        ]);
      } else {
        setErrorMsg(err?.message || "Failed to consult Peachy™. Please try again.");
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content:
              "I'm right here! Tell me what you're building today—or drop a screenshot if you're not sure what to call it—and I'll help you scope it right.",
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

  // Step 1: Open Confirmation Modal (NEVER deducts coins on first click)
  const handleOpenConfirmation = (creative: MatchedCreative, scope: ScopedProject) => {
    setSelectedCandidateForConfirmation({ type: "single", creative, scope });
  };

  const handleOpenSplitConfirmation = (
    creativeA: MatchedCreative,
    creativeB: MatchedCreative,
    multiServiceQuote: MultiServiceQuotePayload
  ) => {
    setSelectedCandidateForConfirmation({
      type: "split",
      creativeA,
      creativeB,
      multiServiceQuote,
    });
  };

  // Step 2: Confirm Selection -> Deduct Project Coins, Create Active Project & Design Agreement, Navigate to Workspace
  const handleConfirmAndOpenProject = async (creative: MatchedCreative, currentScope: ScopedProject) => {
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
          includesPodSupervision: Boolean(currentScope.includesPodSupervision || currentScope.coins > 20),
          selectedCreativeId: creative.id,
          selectedCreativeName: creative.name,
          matchScore: creative.match_score,
          matchReason: creative.match_reason,
          referenceImageUrls: currentReferenceUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project and dispatch agreement.");

      setAvailableCoins((prev) => Math.max(0, prev - currentScope.coins));

      const confirmMsg: ChatMessage = {
        id: `confirmed-${Date.now()}`,
        role: "assistant",
        headline: "Project Workspace Created & Confirmed",
        mode: "project_confirmed",
        createdProjectId: data.project.id,
        content: `Project **${currentScope.title}** is confirmed and active! Your Creative Brief Sheet and Design Agreement have been dispatched to **${creative.name}**. Coins are reserved for your active project—review proofs before sign-off.`,
      };
      setMessages((prev) => [...prev, confirmMsg]);

      setSelectedCandidateForConfirmation(null);
      setSuccessMsg(`Matched with ${creative.name}! Opening your new Project Workspace...`);

      router.push(`/projects/${data.project.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to dispatch match invitation.");
      setSubmittingOffer(null);
    }
  };

  // Step 2B: Confirm Split Linked Multi-Service Projects
  const handleConfirmSplitProjects = async (
    creativeA: MatchedCreative,
    creativeB: MatchedCreative,
    quote: MultiServiceQuotePayload
  ) => {
    setSubmittingOffer("split-pod");
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/projects/ai-create-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isMultiServiceSplit: true,
          serviceA: {
            title: quote.serviceA.title,
            category: quote.serviceA.category,
            serviceKey: quote.serviceA.serviceKey,
            coins: quote.serviceA.coins,
            deliverables: quote.serviceA.deliverables,
            requiredFromBusiness: quote.serviceA.requiredFromBusiness,
            estimatedTurnaround: quote.serviceA.estimatedTurnaround,
            selectedCreativeId: creativeA.id,
            selectedCreativeName: creativeA.name,
            matchScore: creativeA.match_score,
            matchReason: creativeA.match_reason,
          },
          serviceB: {
            title: quote.serviceB.title,
            category: quote.serviceB.category,
            serviceKey: quote.serviceB.serviceKey,
            coins: quote.serviceB.coins,
            deliverables: quote.serviceB.deliverables,
            requiredFromBusiness: quote.serviceB.requiredFromBusiness,
            estimatedTurnaround: quote.serviceB.estimatedTurnaround,
            selectedCreativeId: creativeB.id,
            selectedCreativeName: creativeB.name,
            matchScore: creativeB.match_score,
            matchReason: creativeB.match_reason,
          },
          referenceImageUrls: currentReferenceUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create linked projects.");

      setAvailableCoins((prev) => Math.max(0, prev - quote.combined.coins));

      const confirmMsg: ChatMessage = {
        id: `confirmed-split-${Date.now()}`,
        role: "assistant",
        headline: "Linked Multi-Service Pod Created",
        mode: "project_confirmed",
        createdProjectId: data.project.id,
        createdLinkedProjects: data.linkedProjects || [],
        content: `Both linked projects are live with **${creativeA.name}** (${quote.serviceA.serviceName}) and **${creativeB.name}** (${quote.serviceB.serviceName})!${
          data.podSupervision ? " **Art Director Pod Supervision** is included free." : ""
        }`,
      };
      setMessages((prev) => [...prev, confirmMsg]);

      setSelectedCandidateForConfirmation(null);
      setSuccessMsg(`Linked projects launched with ${creativeA.name} & ${creativeB.name}! Opening workspace...`);

      router.push(`/projects/${data.project.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to launch linked projects.");
      setSubmittingOffer(null);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        role: "assistant",
        content: `Hey there! I'm **Peachy™**, your Creative Director for Peach Network. Tell me what you're building today—or drop a screenshot if you're not sure what to call it—and I'll help you scope it right and match you with vetted US creatives.`,
      },
    ]);
    setSelectedAnswers({});
    setAttachedImages([]);
    setCurrentReferenceUrls([]);
    setErrorMsg("");
    setSuccessMsg("");
  };

  return (
    <div className="bg-white border border-[#F7DFD0] rounded-3xl overflow-hidden flex flex-col shadow-[0_12px_32px_rgba(232,93,59,0.08)]">
      {/* 1. TOPBAR - Peachy™ · Creative Director AI */}
      <header className="px-6 py-4 bg-white border-b border-[#F7DFD0] text-[#231714] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <img
            src="/images/peachy-avatar.jpg"
            alt="Peachy™ Creative Director"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-2xl object-cover border-2 border-[#FF5E3A] bg-[#FFF6EE] shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/Creative2.jpg";
            }}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#231714]">
                Peachy™ · Creative Director AI
              </span>
              <span className="text-xs font-bold tracking-wide text-[#231714] bg-[#FFD8BE] px-2.5 py-0.5 rounded-full">
                Peach Match AI™ v1.1
              </span>
            </div>
            <div className="text-[14px] text-[#4A3B36] font-medium truncate mt-0.5">
              Project Planner · 1 Peach Coin = $50 USD · 3 Revisions Included · 100% Ownership
            </div>
          </div>
        </div>

        {/* Right Actions: Wallet balance + New Chat */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF6EE] text-xs font-bold text-[#231714] border border-[#F7DFD0] tabular-nums">
            <Wallet className="w-3.5 h-3.5 text-[#FF5E3A]" strokeWidth={1.5} />
            <span>{availableCoins} Coins</span>
            <span className="text-[#4A3B36] font-medium">(${(availableCoins * 50).toLocaleString()})</span>
          </div>

          <button
            type="button"
            onClick={handleResetChat}
            className="inline-flex items-center px-4 py-2 rounded-2xl bg-[#231714] hover:bg-[#3A2722] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            title="Start a fresh project planning conversation"
          >
            New Chat
          </button>
        </div>
      </header>

      {/* STATUS NOTICES */}
      {errorMsg && (
        <div className="px-6 py-3 bg-rose-50 border-b border-rose-200 text-sm text-rose-900 font-semibold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg("")} className="text-rose-800 hover:text-rose-950 font-bold cursor-pointer">
            Close
          </button>
        </div>
      )}

      {successMsg && (
        <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-200 text-sm text-emerald-950 font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg("")} className="text-emerald-800 hover:text-emerald-950 font-bold cursor-pointer">
            Close
          </button>
        </div>
      )}

      {/* 2. CHAT STREAM - Internal scroll only */}
      <div
        ref={chatScrollContainerRef}
        className="p-5 sm:p-6 space-y-5 max-h-[560px] overflow-y-auto bg-[#FFF6EE]/65 scrollbar-thin"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 text-[15px] ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <img
                src="/images/peachy-avatar.jpg"
                alt="Peachy™"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-[#FF5E3A] bg-[#FFF6EE] shrink-0 mt-0.5"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/Creative2.jpg";
                }}
              />
            )}

            <div
              className={`rounded-3xl leading-relaxed text-[15px] ${
                msg.role === "user"
                  ? "bg-[#231714] text-white px-5 py-3.5 max-w-xl font-medium rounded-tr-sm shadow-xs"
                  : "bg-white border border-[#F7DFD0] text-[#231714] p-5 max-w-2xl rounded-tl-sm space-y-3.5 shadow-[0_6px_18px_rgba(232,93,59,0.05)]"
              }`}
            >
              {/* Optional punchy diagnosis headline */}
              {msg.headline && (
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#FF5E3A]">
                  {msg.headline}
                </div>
              )}

              {/* User attached reference images thumbnails */}
              {msg.uploadedImages && msg.uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {msg.uploadedImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={img.name || `Reference ${idx + 1}`}
                      className="w-16 h-16 rounded-xl object-cover border border-white/40 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() =>
                        setPreviewImage({
                          url: img.url,
                          title: img.name || "Visual Reference",
                          creativeName: "Client Reference Upload",
                        })
                      }
                    />
                  ))}
                </div>
              )}

              {/* Message text - clean bold markdown formatting, zero raw asterisks */}
              <div
                className={`whitespace-pre-wrap leading-relaxed text-[15px] ${
                  msg.role === "user" ? "text-white font-semibold" : "text-[#4A3B36]"
                }`}
              >
                {renderFormattedMessage(msg.content)}
              </div>

              {/* Quick-Reply Pills for Advice Mode */}
              {msg.mode === "advice" && msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="pt-2.5 border-t border-[#F7DFD0] flex flex-wrap gap-2">
                  {msg.quickReplies.map((qr, qri) => (
                    <button
                      key={qri}
                      type="button"
                      onClick={() => handleSendMessage(qr)}
                      disabled={loading}
                      className="px-3.5 py-1.5 rounded-full bg-[#FFD8BE] hover:bg-[#FF5E3A] text-[#231714] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {qr} &rarr;
                    </button>
                  ))}
                </div>
              )}

              {/* Mixed Scope Quick Replies */}
              {msg.mode === "mixed_scope" && msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="pt-2.5 border-t border-[#F7DFD0] flex flex-wrap gap-2">
                  {msg.quickReplies.map((qr, qri) => (
                    <button
                      key={qri}
                      type="button"
                      onClick={() => {
                        if (qr.toLowerCase().includes("feedback")) {
                          router.push("/business/peach-business#feedback");
                        } else {
                          handleSendMessage(qr);
                        }
                      }}
                      disabled={loading}
                      className="px-3.5 py-2 rounded-full bg-[#FFD8BE] hover:bg-[#FF5E3A] text-[#231714] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}

              {/* Inline Art Director Action on Rate Limit / High Volume */}
              {msg.isRateLimit && (
                <div className="pt-2 border-t border-[#F7DFD0] flex items-center gap-3 flex-wrap">
                  <AskArtDirectorButton businessName={businessName} />
                  <span className="text-xs text-[#4A3B36] font-medium">
                    Free scoping guidance with a senior creative director
                  </span>
                </div>
              )}

              {/* Quick Button to Peach Business Feedback Tab for Out-of-Scope Requests */}
              {(msg.mode === "out_of_scope" || msg.showFeedbackButton) && (
                <div className="pt-2.5 border-t border-[#F7DFD0] flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => router.push("/business/peach-business#feedback")}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#231714] hover:bg-[#3A2722] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Go to Peach Business Feedback</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                  <span className="text-xs text-[#4A3B36] font-medium">
                    Tell our team what features or disciplines you want next
                  </span>
                </div>
              )}

              {/* PROJECT WORKSPACE CONFIRMED CARD */}
              {msg.mode === "project_confirmed" && msg.createdProjectId && (
                <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-4 sm:p-5 space-y-3 mt-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#FF5E3A] text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" strokeWidth={2} />
                    </span>
                    <span className="text-xs font-extrabold text-[#231714] uppercase tracking-wide">
                      {msg.createdLinkedProjects && msg.createdLinkedProjects.length > 1
                        ? "Linked Multi-Service Projects Created"
                        : "Project Workspace Created & Confirmed"}
                    </span>
                  </div>
                  <p className="text-sm text-[#4A3B36] leading-relaxed font-medium">
                    Your Creative Brief and Design Agreement have been dispatched to your creative team. Coins are reserved for your active project—review proofs before sign-off.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.createdLinkedProjects && msg.createdLinkedProjects.length > 1 ? (
                      msg.createdLinkedProjects.map((lp) => (
                        <button
                          key={lp.id}
                          type="button"
                          onClick={() => router.push(`/projects/${lp.id}`)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FF5E3A] hover:bg-[#E84D2B] text-white text-sm font-bold transition-colors cursor-pointer"
                        >
                          <span>Open {lp.title} ({lp.coins} Coins)</span>
                          <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                      ))
                    ) : (
                      <button
                        type="button"
                        onClick={() => router.push(`/projects/${msg.createdProjectId}`)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF5E3A] hover:bg-[#E84D2B] text-white text-sm font-bold transition-colors cursor-pointer"
                      >
                        <span>Open Project Workspace</span>
                        <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* MULTI-SERVICE ITEMIZED QUOTE & WALLET COVERAGE CHECK (BEFORE SHOWING CREATIVES) */}
              {msg.mode === "multi_service_quote" && msg.multiServiceQuote && (() => {
                const mq = msg.multiServiceQuote;
                const combinedDeficit = Math.max(0, mq.combined.coins - availableCoins);
                return (
                  <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-4 sm:p-5 space-y-3.5 mt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#F7DFD0]">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-white bg-[#FF5E3A] px-2.5 py-0.5 rounded-full">
                        Itemized Multi-Service Quote
                      </span>
                      {mq.combined.includesPodSupervision && (
                        <span className="text-xs font-extrabold uppercase tracking-wider bg-[#231714] text-white px-2.5 py-0.5 rounded-full">
                          Free Art Director Pod Supervision (&gt;20 Coins)
                        </span>
                      )}
                    </div>

                    {/* 3 Option Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="bg-white border border-[#F7DFD0] rounded-2xl p-3.5 space-y-1">
                        <span className="text-[11px] font-extrabold uppercase text-[#FF5E3A]">Option 1</span>
                        <h4 className="text-sm font-extrabold text-[#231714]">{mq.serviceA.serviceName} Only</h4>
                        <div className="text-sm font-extrabold text-[#231714] tabular-nums">
                          {mq.serviceA.coins} Coins <span className="text-xs font-semibold text-[#4A3B36]">(${mq.serviceA.usdAmount.toLocaleString()})</span>
                        </div>
                        <p className="text-xs text-[#4A3B36] leading-snug">{mq.serviceA.title}</p>
                      </div>

                      <div className="bg-white border border-[#F7DFD0] rounded-2xl p-3.5 space-y-1">
                        <span className="text-[11px] font-extrabold uppercase text-[#FF5E3A]">Option 2</span>
                        <h4 className="text-sm font-extrabold text-[#231714]">{mq.serviceB.serviceName} Only</h4>
                        <div className="text-sm font-extrabold text-[#231714] tabular-nums">
                          {mq.serviceB.coins} Coins <span className="text-xs font-semibold text-[#4A3B36]">(${mq.serviceB.usdAmount.toLocaleString()})</span>
                        </div>
                        <p className="text-xs text-[#4A3B36] leading-snug">{mq.serviceB.title}</p>
                      </div>

                      <div className="bg-white border-2 border-[#FF5E3A] rounded-2xl p-3.5 space-y-1">
                        <span className="text-[11px] font-extrabold uppercase text-[#FF5E3A]">Option 3 &middot; Recommended</span>
                        <h4 className="text-sm font-extrabold text-[#231714]">Both Together</h4>
                        <div className="text-sm font-extrabold text-[#FF5E3A] tabular-nums">
                          {mq.combined.coins} Coins <span className="text-xs font-semibold text-[#4A3B36]">(${mq.combined.usdAmount.toLocaleString()})</span>
                        </div>
                        <p className="text-xs text-[#4A3B36] leading-snug">
                          Coordinated launch{mq.combined.includesPodSupervision ? " + Free Pod Supervision" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Live Wallet Coverage Banner */}
                    <div className="rounded-2xl p-3.5 border border-[#F7DFD0] bg-white text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <strong className="block text-xs font-extrabold uppercase tracking-wider text-[#231714]">
                          Live Wallet Check: {availableCoins} Coins (${(availableCoins * 50).toLocaleString()}) Available
                        </strong>
                        <span className="text-xs sm:text-sm text-[#4A3B36] leading-snug">
                          {combinedDeficit === 0
                            ? `Your wallet covers Both Together (${mq.combined.coins} Coins) right now.`
                            : `Top up ${combinedDeficit} Coins ($${(combinedDeficit * 50).toLocaleString()}) to launch Both Together, or start with a single discipline below.`}
                        </span>
                      </div>
                      {combinedDeficit > 0 && (
                        <button
                          type="button"
                          onClick={() => handleInstantTopUp(combinedDeficit)}
                          disabled={topUpLoading}
                          className="px-4 py-2 rounded-2xl bg-[#231714] hover:bg-[#3A2722] text-white text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          {topUpLoading ? "Topping Up..." : `Top Up ${combinedDeficit} Coins`}
                        </button>
                      )}
                    </div>

                    {/* Choice Buttons BEFORE Showing Any Creatives */}
                    <div className="pt-1 space-y-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#231714] block">
                        What would you like to book first?
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleChooseSingleFromMulti(mq.serviceA)}
                          disabled={loading}
                          className="px-4 py-2 rounded-full bg-[#FFD8BE] hover:bg-[#FFC7A2] text-[#231714] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Just {mq.serviceA.serviceName} ({mq.serviceA.coins} Coins) &rarr;
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChooseSingleFromMulti(mq.serviceB)}
                          disabled={loading}
                          className="px-4 py-2 rounded-full bg-[#FFD8BE] hover:bg-[#FFC7A2] text-[#231714] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Just {mq.serviceB.serviceName} ({mq.serviceB.coins} Coins) &rarr;
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFindBothCreatives(mq)}
                          disabled={loading}
                          className="px-4 py-2 rounded-full bg-[#FF5E3A] hover:bg-[#E84D2B] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Both Together ({mq.combined.coins} Coins) &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* MATCHED BOTH CREATIVES: HYBRID OR SPLIT SPECIALIST POD */}
              {msg.mode === "matched_both_creatives" && msg.multiServiceQuote && (() => {
                const mq = msg.multiServiceQuote;
                const combinedDeficit = Math.max(0, mq.combined.coins - availableCoins);
                const picks = splitSelections[msg.id] || {};
                const selectedA = picks.creativeA;
                const selectedB = picks.creativeB;

                return (
                  <div className="pt-2 space-y-4">
                    {msg.includesPodSupervision && (
                      <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-3.5 text-sm text-[#231714] font-bold">
                        Art Director Pod Supervision Included Free &mdash; Combined scope exceeds 20 Coins ({mq.combined.coins} Coins total).
                      </div>
                    )}

                    {combinedDeficit > 0 && (
                      <div className="bg-[#FFF6EE] border border-[#FF5E3A] rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-[#231714]">
                        <div>
                          <strong className="font-extrabold block">
                            Need {combinedDeficit} More Coins to Launch Both Together
                          </strong>
                          <span className="text-[#4A3B36]">
                            Combined total is {mq.combined.coins} Coins (${mq.combined.usdAmount.toLocaleString()}), and you currently have {availableCoins} Coins.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInstantTopUp(combinedDeficit)}
                          disabled={topUpLoading}
                          className="px-4 py-2 rounded-2xl bg-[#231714] hover:bg-[#3A2722] text-white text-sm font-bold shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          {topUpLoading ? "Processing..." : `Top Up ${combinedDeficit} Coins ($${combinedDeficit * 50})`}
                        </button>
                      </div>
                    )}

                    {/* Hybrid Specialists if verified in BOTH */}
                    {msg.matchStrategy === "hybrid" && msg.hybridCreatives && msg.hybridCreatives.length > 0 && (
                      <div className="space-y-2.5 bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-4">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF5E3A] block">
                          Hybrid Specialists Verified in Both Disciplines
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {msg.hybridCreatives.map((creative) => (
                            <div
                              key={creative.id}
                              className="bg-white border border-[#F7DFD0] rounded-2xl p-3.5 flex flex-col justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={creative.avatar_url || "/Creative2.jpg"}
                                  alt={creative.name}
                                  className="w-10 h-10 rounded-full object-cover border border-[#F7DFD0]"
                                />
                                <div className="min-w-0 flex-1">
                                  <strong className="text-sm font-extrabold text-[#231714] block truncate">{creative.name}</strong>
                                  <span className="text-xs text-[#4A3B36] block truncate">{creative.headline}</span>
                                  <span className="text-xs font-bold text-[#FF5E3A]">{creative.hub || "Birmingham Hub"}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenConfirmation(creative, {
                                    serviceKey: mq.serviceA.serviceKey,
                                    title: mq.combined.title,
                                    category: `${mq.serviceA.category} + ${mq.serviceB.category}`,
                                    coins: mq.combined.coins,
                                    usdAmount: mq.combined.usdAmount,
                                    deliverables: mq.combined.deliverables,
                                    requiredFromBusiness: mq.combined.requiredFromBusiness,
                                    estimatedTurnaround: mq.combined.estimatedTurnaround,
                                    revisionRounds: 3,
                                    reason: `Hybrid multi-service build (${mq.serviceA.serviceName} + ${mq.serviceB.serviceName})`,
                                    includesPodSupervision: mq.combined.includesPodSupervision,
                                  })
                                }
                                className="w-full py-2.5 rounded-2xl bg-[#FF5E3A] hover:bg-[#E84D2B] text-white text-sm font-bold cursor-pointer"
                              >
                                Select Hybrid Specialist {creative.name}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Split Specialist Section 1: Service A */}
                    <div className="space-y-2.5 bg-white border border-[#F7DFD0] rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[#231714]">
                          1. Pick Your {mq.serviceA.serviceName} Creative ({mq.serviceA.coins} Coins)
                        </span>
                        {selectedA && (
                          <span className="text-xs font-extrabold text-[#FF5E3A]">
                            Selected: {selectedA.name}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        {(msg.serviceACreatives || []).slice(0, 3).map((creative) => {
                          const isPicked = selectedA?.id === creative.id;
                          return (
                            <button
                              key={creative.id}
                              type="button"
                              onClick={() =>
                                setSplitSelections((prev) => ({
                                  ...prev,
                                  [msg.id]: { ...prev[msg.id], creativeA: creative },
                                }))
                              }
                              className={`text-left rounded-2xl p-3 border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                                isPicked
                                  ? "bg-[#FFF6EE] border-[#FF5E3A] ring-1 ring-[#FF5E3A]"
                                  : "bg-white border-[#F7DFD0] hover:border-[#FF5E3A]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={creative.avatar_url || "/Creative2.jpg"}
                                  alt={creative.name}
                                  className="w-9 h-9 rounded-full object-cover border border-[#F7DFD0] shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <strong className="text-sm font-extrabold text-[#231714] block truncate">{creative.name}</strong>
                                  <span className="text-xs text-[#4A3B36] block truncate">{creative.headline}</span>
                                  <span className="text-xs font-bold text-[#FF5E3A]">{creative.hub || "Birmingham Hub"}</span>
                                </div>
                              </div>
                              <div className="text-xs text-[#4A3B36] line-clamp-2">{creative.featured_work?.title}</div>
                              <div
                                className={`text-center py-1.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1 ${
                                  isPicked
                                    ? "bg-[#FF5E3A] text-white"
                                    : "bg-[#FFD8BE] text-[#231714]"
                                }`}
                              >
                                {isPicked && <Check className="w-3.5 h-3.5" strokeWidth={2.25} />}
                                <span>{isPicked ? "Selected for Part 1" : `Pick ${creative.name.split(" ")[0]}`}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Split Specialist Section 2: Service B */}
                    <div className="space-y-2.5 bg-white border border-[#F7DFD0] rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[#231714]">
                          2. Pick Your {mq.serviceB.serviceName} Creative ({mq.serviceB.coins} Coins)
                        </span>
                        {selectedB && (
                          <span className="text-xs font-extrabold text-[#FF5E3A]">
                            Selected: {selectedB.name}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        {(msg.serviceBCreatives || []).slice(0, 3).map((creative) => {
                          const isPicked = selectedB?.id === creative.id;
                          return (
                            <button
                              key={creative.id}
                              type="button"
                              onClick={() =>
                                setSplitSelections((prev) => ({
                                  ...prev,
                                  [msg.id]: { ...prev[msg.id], creativeB: creative },
                                }))
                              }
                              className={`text-left rounded-2xl p-3 border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                                isPicked
                                  ? "bg-[#FFF6EE] border-[#FF5E3A] ring-1 ring-[#FF5E3A]"
                                  : "bg-white border-[#F7DFD0] hover:border-[#FF5E3A]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={creative.avatar_url || "/Creative2.jpg"}
                                  alt={creative.name}
                                  className="w-9 h-9 rounded-full object-cover border border-[#F7DFD0] shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <strong className="text-sm font-extrabold text-[#231714] block truncate">{creative.name}</strong>
                                  <span className="text-xs text-[#4A3B36] block truncate">{creative.headline}</span>
                                  <span className="text-xs font-bold text-[#FF5E3A]">{creative.hub || "Birmingham Hub"}</span>
                                </div>
                              </div>
                              <div className="text-xs text-[#4A3B36] line-clamp-2">{creative.featured_work?.title}</div>
                              <div
                                className={`text-center py-1.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1 ${
                                  isPicked
                                    ? "bg-[#FF5E3A] text-white"
                                    : "bg-[#FFD8BE] text-[#231714]"
                                }`}
                              >
                                {isPicked && <Check className="w-3.5 h-3.5" strokeWidth={2.25} />}
                                <span>{isPicked ? "Selected for Part 2" : `Pick ${creative.name.split(" ")[0]}`}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Launch Split Linked Pod CTA */}
                    <div className="bg-[#231714] text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs sm:text-sm space-y-0.5">
                        <strong className="block font-extrabold text-white">
                          Linked Multi-Service Pod ({mq.combined.coins} Coins / ${mq.combined.usdAmount.toLocaleString()} USD)
                        </strong>
                        <span className="text-[#FFD8BE]">
                          {selectedA ? selectedA.name : `Select ${mq.serviceA.serviceName} creative`} +{" "}
                          {selectedB ? selectedB.name : `Select ${mq.serviceB.serviceName} creative`}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={!selectedA || !selectedB || Boolean(submittingOffer)}
                        onClick={() => {
                          if (selectedA && selectedB) {
                            handleOpenSplitConfirmation(selectedA, selectedB, mq);
                          }
                        }}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold tracking-wide shrink-0 transition-colors inline-flex items-center gap-1.5 ${
                          !selectedA || !selectedB || Boolean(submittingOffer)
                            ? "bg-white/20 text-white/75 cursor-not-allowed"
                            : "bg-[#FF5E3A] hover:bg-[#E84D2B] text-white cursor-pointer"
                        }`}
                      >
                        <span>Review &amp; Launch Linked Projects</span>
                        <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* DIAGNOSTIC QUESTIONS WITH APRICOT BLUSH -> CORAL PILLS */}
              {msg.diagnosticQuestions && msg.diagnosticQuestions.length > 0 && (
                <div className="pt-3 border-t border-[#F7DFD0] space-y-3.5">
                  {msg.diagnosticQuestions.map((dq) => (
                    <div key={dq.id} className="space-y-2">
                      <span className="text-sm font-bold text-[#231714] block">
                        {dq.question}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {dq.pills.map((pill, pi) => {
                          const isSelected = selectedAnswers[dq.id] === pill;
                          return (
                            <button
                              key={pi}
                              type="button"
                              onClick={() => handleTogglePill(dq.id, pill)}
                              disabled={loading}
                              className={`text-left px-4 py-2 rounded-full text-xs sm:text-sm transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                                isSelected
                                  ? "bg-[#FF5E3A] text-white font-bold shadow-xs"
                                  : "bg-[#FFD8BE] hover:bg-[#FFC7A2] text-[#231714] font-semibold"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />}
                              <span>{pill}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Submit Answers & Get Pricing button */}
                  <div className="pt-3 border-t border-[#F7DFD0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="text-xs text-[#4A3B36] font-semibold tabular-nums">
                      <span>
                        {msg.diagnosticQuestions.filter((q) => selectedAnswers[q.id]).length} of{" "}
                        {msg.diagnosticQuestions.length} requirements selected
                      </span>
                    </div>

                    {(() => {
                      const answeredCount = msg.diagnosticQuestions!.filter((q) => selectedAnswers[q.id]).length;
                      const isDisabled = loading || answeredCount === 0;
                      return (
                        <button
                          type="button"
                          onClick={() => handleSubmitDiagnosticAnswers(msg.diagnosticQuestions!)}
                          disabled={isDisabled}
                          className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                            isDisabled
                              ? "bg-[#FFD8BE]/60 text-[#4A3B36] cursor-not-allowed"
                              : "bg-[#FF5E3A] hover:bg-[#E84D2B] text-white cursor-pointer"
                          }`}
                        >
                          <span>Submit Answers &amp; Get Pricing</span>
                          <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ONE SINGLE DIGESTIBLE PEACH PROJECT PLAN CARD */}
              {msg.projectPlan && msg.projectPlan.recommendedItems?.length > 0 && (() => {
                const plan = msg.projectPlan;
                const selMap = planSelections[msg.id] || buildInitialPlanSelection(plan);
                const selectedItems = plan.recommendedItems.filter((it) => Boolean(selMap[it.id]));
                const selectedCoins = selectedItems.reduce((sum, it) => sum + it.coins, 0);
                const selectedUsd = selectedCoins * 50;
                const planDeficit = Math.max(0, selectedCoins - availableCoins);
                const detailsExpanded = Boolean(expandedPlanDetails[msg.id]);
                const combinedDeliverables = Array.from(
                  new Set(
                    selectedItems.flatMap((it) => it.deliverables || []).concat(msg.scope?.deliverables || [])
                  )
                );
                const combinedRequirements = Array.from(
                  new Set(
                    selectedItems
                      .flatMap((it) => it.requiredFromBusiness || [])
                      .concat(msg.scope?.requiredFromBusiness || [])
                  )
                );

                return (
                  <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-4 sm:p-5 space-y-3.5 mt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#F7DFD0]">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF5E3A] block">
                          Live Peach Project Plan
                        </span>
                        <h4 className="text-base font-extrabold text-[#231714] mt-0.5">
                          {plan.goalSummary}
                        </h4>
                      </div>
                      {plan.clientBudgetCoins && (
                        <span className="text-xs font-bold text-[#231714] bg-[#FFD8BE] px-3 py-1 rounded-full tabular-nums">
                          Target Budget: {plan.clientBudgetCoins} Coins (${(plan.clientBudgetCoins * 50).toLocaleString()})
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {plan.recommendedItems.map((item) => {
                        const checked = Boolean(selMap[item.id]);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleTogglePlanItem(msg.id, item.id, plan)}
                            className={`w-full text-left rounded-2xl p-3.5 border transition-colors cursor-pointer flex items-start gap-3 ${
                              checked
                                ? "bg-white border-[#FF5E3A]"
                                : "bg-white/75 border-[#F7DFD0] hover:border-[#FFAE78]"
                            }`}
                          >
                            <span className="mt-0.5 text-[#FF5E3A] shrink-0">
                              {checked ? (
                                <CheckSquare className="w-5 h-5" strokeWidth={1.75} />
                              ) : (
                                <Square className="w-5 h-5 text-[#4A3B36]" strokeWidth={1.5} />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-sm font-extrabold text-[#231714]">
                                  {item.package || item.service}
                                </span>
                                <span className="text-sm font-extrabold text-[#FF5E3A] tabular-nums">
                                  {item.coins} Coins (${(item.usd || item.coins * 50).toLocaleString()})
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#4A3B36]">
                                <span className="px-2 py-0.5 rounded-full bg-[#FFD8BE] text-[#231714] font-bold">
                                  {item.status === "optional" ? "Brand Readiness Optional" : "Recommended"}
                                </span>
                                <span>{item.estimatedTurnaround}</span>
                              </div>
                              {item.reason && (
                                <p className="text-xs text-[#4A3B36] mt-1 leading-snug">
                                  {item.reason}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* COLLAPSIBLE DELIVERABLES & REQUIREMENTS (CLOSED BY DEFAULT) */}
                    {(combinedDeliverables.length > 0 || combinedRequirements.length > 0) && (
                      <div className="bg-white border border-[#F7DFD0] rounded-2xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedPlanDetails((prev) => ({
                              ...prev,
                              [msg.id]: !detailsExpanded,
                            }))
                          }
                          className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs font-extrabold text-[#231714] hover:bg-[#FFF6EE]/60 transition-colors cursor-pointer"
                        >
                          <span>View Included Deliverables &amp; Requirements</span>
                          <ChevronDown
                            className={`w-4 h-4 text-[#FF5E3A] transition-transform ${
                              detailsExpanded ? "rotate-180" : ""
                            }`}
                            strokeWidth={1.75}
                          />
                        </button>

                        {detailsExpanded && (
                          <div className="px-3.5 pb-3.5 pt-2 border-t border-[#F7DFD0] space-y-3 text-xs text-[#4A3B36]">
                            {combinedDeliverables.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[11px] font-extrabold uppercase text-[#231714] block">
                                  Included Deliverables (3 Revisions + Full Rights)
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {combinedDeliverables.map((deliv, di) => (
                                    <div key={di} className="flex items-start gap-1.5">
                                      <Check className="w-3.5 h-3.5 text-[#FF5E3A] shrink-0 mt-0.5" strokeWidth={2} />
                                      <span className="leading-snug">{deliv}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {combinedRequirements.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[11px] font-extrabold uppercase text-[#FF5E3A] block">
                                  What We Need From You
                                </span>
                                {combinedRequirements.map((req, ri) => (
                                  <div key={ri} className="flex items-start gap-1.5">
                                    <ArrowRight className="w-3.5 h-3.5 text-[#FF5E3A] shrink-0 mt-0.5" strokeWidth={1.75} />
                                    <span>{req}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2.5 border-t border-[#F7DFD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs sm:text-sm text-[#4A3B36] tabular-nums">
                        <strong className="text-[#231714] font-extrabold block">
                          Selected Total: {selectedCoins} Peach Coins (${selectedUsd.toLocaleString()} USD)
                        </strong>
                        <span>
                          {selectedCoins === 0
                            ? "Check at least one item above to continue."
                            : planDeficit === 0
                            ? `Wallet ready: ${availableCoins} Coins available · Review proofs before sign-off.`
                            : `You have ${availableCoins} Coins (${planDeficit} more needed to launch).`}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {planDeficit > 0 && selectedCoins > 0 && (
                          <button
                            type="button"
                            onClick={() => handleInstantTopUp(planDeficit)}
                            disabled={topUpLoading}
                            className="px-4 py-2.5 rounded-2xl bg-[#231714] hover:bg-[#3A2722] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {topUpLoading ? "Topping Up..." : `Top Up ${planDeficit} Coins`}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleLaunchFromProjectPlan(plan, msg.id)}
                          disabled={loading || selectedItems.length === 0}
                          className="px-5 py-2.5 rounded-2xl bg-[#FF5E3A] hover:bg-[#E84D2B] disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer inline-flex items-center gap-2 shrink-0"
                        >
                          <span>
                            {selectedItems.length > 1
                              ? `Yes, Find My Creatives (${selectedItems.length})`
                              : "Yes, Find My Creatives"}
                          </span>
                          <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* FALLBACK SINGLE CARD ONLY WHEN NO PROJECT PLAN OBJECT EXISTS */}
              {!msg.projectPlan && msg.scope && (!msg.matchedCreatives || msg.matchedCreatives.length === 0) && (() => {
                const requiredCoins = msg.scope.coins;
                const deficitCoins = Math.max(0, requiredCoins - availableCoins);
                const detailsExpanded = Boolean(expandedPlanDetails[msg.id]);

                return (
                  <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-4 sm:p-5 space-y-3 mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#F7DFD0]">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF5E3A] block">
                          Live Peach Project Plan
                        </span>
                        <h3 className="text-base font-extrabold text-[#231714] mt-0.5">
                          {msg.scope.title}
                        </h3>
                        <div className="text-xs text-[#4A3B36] font-semibold mt-0.5">
                          {msg.scope.category} &bull; {msg.scope.estimatedTurnaround}
                        </div>
                      </div>

                      <div className="flex items-baseline gap-1.5 bg-white px-3.5 py-2 rounded-2xl border border-[#F7DFD0] self-start sm:self-auto tabular-nums">
                        <span className="text-lg font-extrabold text-[#FF5E3A]">
                          {msg.scope.coins} Coins
                        </span>
                        <span className="text-xs text-[#4A3B36] font-bold">
                          (${(msg.scope.usdAmount || msg.scope.coins * 50).toLocaleString()} USD)
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-[#F7DFD0] rounded-2xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPlanDetails((prev) => ({
                            ...prev,
                            [msg.id]: !detailsExpanded,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs font-extrabold text-[#231714] cursor-pointer"
                      >
                        <span>View Included Deliverables &amp; Requirements</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#FF5E3A] transition-transform ${
                            detailsExpanded ? "rotate-180" : ""
                          }`}
                          strokeWidth={1.75}
                        />
                      </button>

                      {detailsExpanded && (
                        <div className="px-3.5 pb-3.5 pt-2 border-t border-[#F7DFD0] space-y-3 text-xs text-[#4A3B36]">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {msg.scope.deliverables?.map((deliv, di) => (
                              <div key={di} className="flex items-start gap-1.5">
                                <Check className="w-3.5 h-3.5 text-[#FF5E3A] shrink-0 mt-0.5" strokeWidth={2} />
                                <span>{deliv}</span>
                              </div>
                            ))}
                          </div>
                          {msg.scope.requiredFromBusiness && msg.scope.requiredFromBusiness.length > 0 && (
                            <div className="space-y-1 pt-1">
                              <span className="text-[11px] font-extrabold uppercase text-[#FF5E3A] block">
                                What We Need From You
                              </span>
                              {msg.scope.requiredFromBusiness.map((req, ri) => (
                                <div key={ri} className="flex items-start gap-1.5">
                                  <ArrowRight className="w-3.5 h-3.5 text-[#FF5E3A] shrink-0 mt-0.5" strokeWidth={1.75} />
                                  <span>{req}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#F7DFD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-[#4A3B36] tabular-nums">
                        {deficitCoins === 0
                          ? `Wallet ready: ${availableCoins} Coins available.`
                          : `You have ${availableCoins} Coins (${deficitCoins} more needed).`}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {deficitCoins > 0 && (
                          <button
                            type="button"
                            onClick={() => handleInstantTopUp(deficitCoins)}
                            disabled={topUpLoading}
                            className="px-4 py-2.5 rounded-2xl bg-[#231714] hover:bg-[#3A2722] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            {topUpLoading ? "Topping Up..." : `Top Up ${deficitCoins} Coins`}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleFindCreatives(msg.scope!)}
                          disabled={loading}
                          className="px-5 py-2.5 rounded-2xl bg-[#FF5E3A] hover:bg-[#E84D2B] disabled:opacity-50 text-white text-xs sm:text-sm font-bold cursor-pointer inline-flex items-center gap-2 shrink-0"
                        >
                          <span>Yes, Find My Creatives</span>
                          <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* COMPACT TOP-UP NOTICE DURING MATCHED CREATIVES IF SHORT ON COINS */}
              {msg.scope && msg.matchedCreatives && msg.matchedCreatives.length > 0 && availableCoins < msg.scope.coins && (
                <div className="bg-[#FFF6EE] border border-[#FF5E3A] rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-2">
                  <div className="text-xs text-[#231714] font-semibold tabular-nums">
                    This scope needs <strong>{msg.scope.coins} Coins</strong> &mdash; top up{" "}
                    <strong>{msg.scope.coins - availableCoins} Coins</strong> to launch right away.
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInstantTopUp(msg.scope!.coins - availableCoins)}
                    disabled={topUpLoading}
                    className="px-4 py-2 bg-[#231714] hover:bg-[#3A2722] text-white rounded-2xl text-xs font-bold cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {topUpLoading ? "Processing..." : `Top Up ${msg.scope.coins - availableCoins} Coins`}
                  </button>
                </div>
              )}

              {/* 3 SKILL-ACCURATE MATCHED CREATIVES (STAGE 4 ONLY) */}
              {msg.scope && msg.matchedCreatives && msg.matchedCreatives.length > 0 && (
                <div className="pt-2 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#231714]">
                      3 Vetted Creatives Ready for this Exact Scope
                    </span>
                    <span className="text-xs text-[#4A3B36] font-semibold">
                      Ranked by verified portfolio &amp; skill fit
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {msg.matchedCreatives.slice(0, 3).map((creative) => {
                      const isSubmitting = submittingOffer === creative.id;
                      const hubName = creative.hub || "Birmingham Hub";

                      return (
                        <div
                          key={creative.id}
                          className="bg-white border border-[#F7DFD0] hover:border-[#FF5E3A] rounded-2xl p-4 flex flex-col justify-between transition-all shadow-[0_6px_18px_rgba(232,93,59,0.05)]"
                        >
                          <div>
                            {/* Creative Header */}
                            <div className="flex items-center gap-3 mb-2.5">
                              <img
                                src={creative.avatar_url || "/Creative2.jpg"}
                                alt={creative.name}
                                className="w-10 h-10 rounded-full object-cover border border-[#F7DFD0]"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <strong className="text-xs font-extrabold text-[#231714] truncate block">
                                    {creative.name}
                                  </strong>
                                  <span className="text-[11px] font-extrabold text-[#FF5E3A] bg-[#FFF6EE] border border-[#F7DFD0] px-1.5 py-0.5 rounded-full shrink-0 tabular-nums">
                                    {creative.match_score}%
                                  </span>
                                </div>
                                <div className="text-xs text-[#4A3B36] truncate">
                                  {creative.headline}
                                </div>
                                <div className="text-[11px] text-[#FF5E3A] font-bold uppercase tracking-wider mt-0.5">
                                  {hubName}
                                </div>
                              </div>
                            </div>

                            {/* Match reason based on skill & history */}
                            <div className="p-2.5 bg-[#FFF6EE] border border-[#F7DFD0] rounded-xl text-xs text-[#4A3B36] leading-snug mb-2.5">
                              <strong className="text-[#FF5E3A] block uppercase font-extrabold text-[10px]">
                                Verified Skill Fit
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
                                className="relative rounded-xl overflow-hidden h-20 bg-[#FFF6EE] border border-[#F7DFD0] cursor-pointer group mb-3"
                              >
                                <img
                                  src={creative.featured_work.image_url}
                                  alt={creative.featured_work.title}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-[#231714]/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-center text-white">
                                  <span className="text-[10px] font-bold">Past Work</span>
                                  <span className="text-xs font-semibold truncate max-w-full">{creative.featured_work.title}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Match / Action Button: OPENS CONFIRMATION MODAL (NEVER deducts coins on first click) */}
                          <div className="pt-2 border-t border-[#F7DFD0]">
                            <button
                              type="button"
                              onClick={() => handleOpenConfirmation(creative, msg.scope!)}
                              disabled={isSubmitting}
                              className="w-full py-2.5 bg-[#FF5E3A] hover:bg-[#E84D2B] text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 text-center flex items-center justify-center gap-1.5"
                            >
                              <span>Select {creative.name}</span>
                              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
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

        {/* Loading Indicator with Peachy™ Avatar & Animated Bubble */}
        {loading && (
          <div className="flex items-start gap-3 text-sm">
            <img
              src="/images/peachy-avatar.jpg"
              alt="Peachy™"
              className="w-9 h-9 rounded-full object-cover border border-[#FF5E3A] shrink-0 mt-0.5"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/Creative2.jpg";
              }}
            />
            <div className="bg-white border border-[#F7DFD0] rounded-2xl p-4 sm:p-5 rounded-tl-sm shadow-[0_6px_18px_rgba(232,93,59,0.05)] text-sm text-[#231714] font-bold flex items-center gap-3">
              <div className="flex items-center gap-1 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E3A] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFAE78] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2.5 h-2.5 rounded-full bg-[#231714] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-[#231714] font-extrabold">
                Scoping your project plan and matching vetted creatives...
              </span>
            </div>
          </div>
        )}

      </div>

      {/* 3. DOCKED SPACIOUS WHITE INPUT BAR WITH PAPERCLIP & CORAL SEND BUTTON */}
      <div className="p-5 sm:p-6 bg-white border-t border-[#F7DFD0]">
        {attachedImages.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 mb-3 p-3 bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl">
            <span className="text-xs font-extrabold uppercase text-[#FF5E3A] tracking-wider mr-1">
              Visual References ({attachedImages.length}/3):
            </span>
            {attachedImages.map((img, idx) => (
              <div key={idx} className="relative group shrink-0">
                <img
                  src={img.previewUrl}
                  alt={img.name}
                  className="w-14 h-14 rounded-xl object-cover border border-[#F7DFD0]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAttachedImage(idx)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#231714] text-white flex items-center justify-center hover:bg-[#FF5E3A] transition-colors cursor-pointer"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" strokeWidth={1.75} />
                </button>
                <span className="text-xs text-[#4A3B36] truncate max-w-[64px] block mt-0.5">
                  {img.name}
                </span>
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative bg-white border border-[#F7DFD0] focus-within:border-[#FF5E3A] rounded-2xl p-3.5 transition-all shadow-2xs"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <textarea
            ref={textareaRef}
            rows={2}
            value={prompt}
            onChange={handleTextareaChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Describe your project, budget, or brand goal (e.g. 'Website for my bakery, budget $1,500')..."
            className="w-full bg-transparent px-1 py-1 text-[15px] text-[#231714] placeholder:text-[#4A3B36]/65 focus:outline-hidden resize-none leading-relaxed min-h-[56px] max-h-[140px]"
          />

          <div className="flex items-center justify-between gap-3 pt-2.5 mt-1 border-t border-[#F7DFD0]/70">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || attachedImages.length >= 3}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFF6EE] hover:bg-[#FFD8BE] border border-[#F7DFD0] text-[#231714] text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title={attachedImages.length >= 3 ? "Maximum 3 reference images attached" : "Attach reference image (PNG, JPG, WebP)"}
              aria-label="Attach reference image"
            >
              <Paperclip className="w-4 h-4 text-[#4A3B36]" strokeWidth={1.5} />
              <span>Attach Reference</span>
            </button>

            <button
              type="submit"
              disabled={loading || (!prompt.trim() && attachedImages.length === 0)}
              className="px-6 py-2.5 rounded-2xl bg-[#FF5E3A] hover:bg-[#E84D2B] disabled:opacity-55 text-white text-sm font-bold shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              title="Send message (Enter)"
              aria-label="Send message to Peachy™"
            >
              <span>{loading ? "Sending..." : "Send"}</span>
              {!loading && <ArrowRight className="w-4 h-4" strokeWidth={1.75} />}
            </button>
          </div>
        </form>
      </div>

      {/* 4. MINIMAL AGENCY CREDIT FOOTER */}
      <footer className="px-5 py-2.5 bg-[#FFF6EE] border-t border-[#F7DFD0] text-center text-xs sm:text-sm text-[#4A3B36]">
        <span className="font-semibold tracking-wide text-[#4A3B36]">
          Created by Sweet As A Peach Creative Agency
        </span>
      </footer>

      {/* 6. 1-STEP CONFIRMATION MODAL (BEFORE DEDUCTING COINS) */}
      {selectedCandidateForConfirmation && (() => {
        const isSplit = selectedCandidateForConfirmation.type === "split";
        const requiredCoins = isSplit
          ? selectedCandidateForConfirmation.multiServiceQuote.combined.coins
          : selectedCandidateForConfirmation.scope.coins;
        const usdTotal = isSplit
          ? selectedCandidateForConfirmation.multiServiceQuote.combined.usdAmount
          : selectedCandidateForConfirmation.scope.usdAmount || requiredCoins * 50;
        const includesPod = isSplit
          ? selectedCandidateForConfirmation.multiServiceQuote.combined.includesPodSupervision
          : Boolean(selectedCandidateForConfirmation.scope.includesPodSupervision || requiredCoins > 20);

        return (
          <div
            className="fixed inset-0 z-[110] bg-[#231714]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedCandidateForConfirmation(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#F7DFD0] space-y-5 relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[#F7DFD0] pb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider bg-[#FF5E3A] text-white px-2.5 py-0.5 rounded-full">
                    Step 1 of 1 &bull; Confirmation
                  </span>
                  <h3 className="text-lg font-extrabold text-[#231714] mt-1.5">
                    {isSplit ? "Confirm Linked Multi-Service Pod" : "Confirm Creative Selection"}
                  </h3>
                  <p className="text-sm text-[#4A3B36] font-medium">
                    Review your project and creative details before Coins are reserved for your active project.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCandidateForConfirmation(null)}
                  className="w-8 h-8 rounded-full bg-[#FFF6EE] hover:bg-[#FFD8BE] text-[#231714] flex items-center justify-center transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {isSplit ? (
                <div className="space-y-3">
                  {/* Split Creative A */}
                  <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-3.5 flex items-center gap-3">
                    <img
                      src={selectedCandidateForConfirmation.creativeA.avatar_url || "/Creative2.jpg"}
                      alt={selectedCandidateForConfirmation.creativeA.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-[#FF5E3A] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-extrabold uppercase text-[#FF5E3A]">
                        Project 1 &bull; {selectedCandidateForConfirmation.multiServiceQuote.serviceA.serviceName} ({selectedCandidateForConfirmation.multiServiceQuote.serviceA.coins} Coins)
                      </div>
                      <strong className="text-sm font-extrabold text-[#231714] block truncate">
                        {selectedCandidateForConfirmation.creativeA.name}
                      </strong>
                      <div className="text-xs text-[#4A3B36] truncate">
                        {selectedCandidateForConfirmation.multiServiceQuote.serviceA.title}
                      </div>
                    </div>
                  </div>

                  {/* Split Creative B */}
                  <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-3.5 flex items-center gap-3">
                    <img
                      src={selectedCandidateForConfirmation.creativeB.avatar_url || "/Creative2.jpg"}
                      alt={selectedCandidateForConfirmation.creativeB.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-[#FF5E3A] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-extrabold uppercase text-[#FF5E3A]">
                        Project 2 &bull; {selectedCandidateForConfirmation.multiServiceQuote.serviceB.serviceName} ({selectedCandidateForConfirmation.multiServiceQuote.serviceB.coins} Coins)
                      </div>
                      <strong className="text-sm font-extrabold text-[#231714] block truncate">
                        {selectedCandidateForConfirmation.creativeB.name}
                      </strong>
                      <div className="text-xs text-[#4A3B36] truncate">
                        {selectedCandidateForConfirmation.multiServiceQuote.serviceB.title}
                      </div>
                    </div>
                  </div>

                  {includesPod && (
                    <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-3 text-sm text-[#231714] font-bold">
                      Art Director Pod Supervision Included Free (&gt;20 Coins)
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Selected Creative Details Card */}
                  <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-4 flex items-center gap-3.5">
                    <img
                      src={selectedCandidateForConfirmation.creative.avatar_url || "/Creative2.jpg"}
                      alt={selectedCandidateForConfirmation.creative.name}
                      className="w-13 h-13 rounded-full object-cover border-2 border-[#FF5E3A] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF5E3A]">
                        Selected Creative
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-sm font-extrabold text-[#231714] truncate">
                          {selectedCandidateForConfirmation.creative.name}
                        </strong>
                        <span className="text-[11px] font-extrabold text-[#FF5E3A] bg-white border border-[#F7DFD0] px-2 py-0.5 rounded-full shrink-0 tabular-nums">
                          {selectedCandidateForConfirmation.creative.match_score}% Match
                        </span>
                      </div>
                      <div className="text-xs text-[#4A3B36] font-medium truncate">
                        {selectedCandidateForConfirmation.creative.headline} &bull; {selectedCandidateForConfirmation.creative.hub || "Birmingham Hub"}
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="bg-[#FFF6EE]/60 border border-[#F7DFD0] rounded-2xl p-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#4A3B36]">Project:</span>
                      <strong className="text-xs sm:text-sm font-extrabold text-[#231714] text-right">
                        {selectedCandidateForConfirmation.scope.title} ({selectedCandidateForConfirmation.scope.estimatedTurnaround})
                      </strong>
                    </div>
                    <p className="text-xs text-[#4A3B36] leading-relaxed font-medium">
                      Category: <strong className="text-[#231714]">{selectedCandidateForConfirmation.scope.category}</strong> &bull; 3 Included Revisions &bull; 100% Ownership Transfer
                    </p>
                  </div>
                </>
              )}

              {/* Pricing & Balance Calculation Card */}
              <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-4 space-y-2 tabular-nums">
                <div className="flex items-center justify-between text-xs sm:text-sm text-[#4A3B36]">
                  <span className="font-semibold">Total Cost:</span>
                  <strong className="text-sm font-extrabold text-[#231714]">
                    {requiredCoins} Peach Coins (${usdTotal.toLocaleString()} USD)
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-[#4A3B36] pt-1.5 border-t border-[#F7DFD0]">
                  <span>Your Current Wallet Balance:</span>
                  <span className="font-bold text-[#231714]">{availableCoins} Coins</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-[#231714] font-extrabold pt-1.5 border-t border-[#F7DFD0]">
                  <span>Your Balance After:</span>
                  <span>
                    {availableCoins >= requiredCoins
                      ? `${availableCoins - requiredCoins} Coins`
                      : `Deficit: ${requiredCoins - availableCoins} Coins needed`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
                {availableCoins >= requiredCoins ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (isSplit) {
                        handleConfirmSplitProjects(
                          selectedCandidateForConfirmation.creativeA,
                          selectedCandidateForConfirmation.creativeB,
                          selectedCandidateForConfirmation.multiServiceQuote
                        );
                      } else {
                        handleConfirmAndOpenProject(
                          selectedCandidateForConfirmation.creative,
                          selectedCandidateForConfirmation.scope
                        );
                      }
                    }}
                    disabled={Boolean(submittingOffer)}
                    className="flex-1 py-3 px-5 rounded-2xl bg-[#FF5E3A] hover:bg-[#E84D2B] disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>
                      {submittingOffer
                        ? "Reserving Project Coins..."
                        : isSplit
                        ? "Confirm & Open My Projects"
                        : "Confirm & Open My Project"}
                    </span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleInstantTopUp(requiredCoins - availableCoins)}
                    disabled={topUpLoading}
                    className="flex-1 py-3 px-5 rounded-2xl bg-[#FF5E3A] hover:bg-[#E84D2B] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>
                      {topUpLoading
                        ? "Processing..."
                        : `Top Up ${requiredCoins - availableCoins} Coins & Confirm`}
                    </span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCandidateForConfirmation(null)}
                  disabled={Boolean(submittingOffer)}
                  className="py-3 px-5 rounded-2xl bg-white hover:bg-[#FFF6EE] text-[#231714] border border-[#F7DFD0] text-xs sm:text-sm font-bold transition-all cursor-pointer text-center"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 7. LIGHTBOX MODAL FOR PORTFOLIO SAMPLES & REFERENCES */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[110] bg-[#231714]/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl border border-[#F7DFD0] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-80 bg-[#231714] flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-full max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-[#231714]/80 text-white text-xs font-bold hover:bg-[#FF5E3A] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="p-5 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-extrabold text-[#231714]">
                  {previewImage.title}
                </h4>
                <p className="text-xs text-[#4A3B36] font-semibold">
                  By {previewImage.creativeName} &bull; {previewImage.industry || "Commercial Reference"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 bg-[#231714] hover:bg-[#3A2722] text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer"
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
