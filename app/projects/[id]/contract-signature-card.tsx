"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ScrollText,
  Briefcase,
  Sparkles,
} from "lucide-react";

export interface ContractPartySignature {
  name: string;
  signedAt: string;
}

interface ContractSignatureCardProps {
  projectId: string;
  projectTitle: string;
  category: string;
  coins: number;
  dueAt?: string | null;
  businessName: string;
  creativeName: string;
  creativeHub?: string;
  creativeSpecialty?: string;
  description?: string | null;
  currentStatus: string;
  userRole: "business" | "creative" | "admin";
  briefLocked?: boolean;
  initialClientSignature?: ContractPartySignature | null;
  initialCreativeSignature?: ContractPartySignature | null;
  onBriefLocked?: () => void;
}

interface SignatureState {
  bothSigned: boolean;
  clientSignature: ContractPartySignature | null;
  creativeSignature: ContractPartySignature | null;
}

export function ContractSignatureCard({
  projectId,
  projectTitle,
  category,
  coins,
  dueAt,
  businessName,
  creativeName,
  creativeHub = "Birmingham Hub",
  creativeSpecialty = "Commercial Specialist",
  description,
  currentStatus,
  userRole,
  briefLocked = true,
  initialClientSignature = null,
  initialCreativeSignature = null,
  onBriefLocked,
}: ContractSignatureCardProps) {
  const router = useRouter();

  const [clientSignerName, setClientSignerName] = useState(
    initialClientSignature?.name || ""
  );
  const [clientTermsAccepted, setClientTermsAccepted] = useState(false);
  const [creativeSignerName, setCreativeSignerName] = useState(
    initialCreativeSignature?.name || creativeName
  );
  const [creativeTermsAccepted, setCreativeTermsAccepted] = useState(false);
  const [signingRole, setSigningRole] = useState<"business" | "creative" | null>(null);
  const [declining, setDeclining] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  const alreadyActiveStatus = [
    "accepted",
    "in_progress",
    "waiting_on_client",
    "proof_uploaded",
    "revisions",
    "submitted",
    "approved",
    "completed",
  ].includes(currentStatus);

  const [sigState, setSigState] = useState<SignatureState>({
    bothSigned: Boolean(
      alreadyActiveStatus || (initialClientSignature && initialCreativeSignature)
    ),
    clientSignature:
      initialClientSignature ||
      (alreadyActiveStatus
        ? { name: businessName, signedAt: new Date().toISOString() }
        : null),
    creativeSignature:
      initialCreativeSignature ||
      (alreadyActiveStatus
        ? { name: creativeName, signedAt: new Date().toISOString() }
        : null),
  });

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch(`/api/projects/contract/sign?projectId=${projectId}`);
        const data = await res.json();
        if (res.ok && data) {
          if (data.clientSignature || data.creativeSignature || data.bothSigned) {
            setSigState({
              bothSigned: Boolean(data.bothSigned),
              clientSignature: data.clientSignature || null,
              creativeSignature: data.creativeSignature || null,
            });
          }
        }
      } catch {
        // retain initial state
      }
    }
    loadStatus();
  }, [projectId]);

  const handleSign = async (roleToSign: "business" | "creative") => {
    if (roleToSign === "business" && userRole !== "business" && userRole !== "admin") {
      setErrorMsg("Only the Business Owner can sign the Business Owner signature field.");
      return;
    }
    if (roleToSign === "creative" && userRole !== "creative") {
      setErrorMsg("Only the assigned Creative can sign the Creative signature field.");
      return;
    }

    const nameToSign = (roleToSign === "business" ? clientSignerName : creativeSignerName).trim();
    if (!nameToSign) {
      setErrorMsg("Please enter your typed full legal name to sign.");
      return;
    }

    if (roleToSign === "business" && !clientTermsAccepted) {
      setErrorMsg(
        "Please check the box confirming you have reviewed the Creative Brief and agree to the Peach Network Project Terms & Policies."
      );
      return;
    }

    if (roleToSign === "creative" && !creativeTermsAccepted) {
      setErrorMsg(
        "Please check the box confirming you have reviewed the Creative Brief and agree to the Peach Network Project Terms & Policies."
      );
      return;
    }

    setSigningRole(roleToSign);
    setErrorMsg("");
    setInfoMsg("");

    try {
      const res = await fetch("/api/projects/contract/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          signerRole: roleToSign,
          signerName: nameToSign,
          termsAccepted: true,
          signatureData: `Digital verification via Peach Network Auth (${Date.now()})`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sign contract.");

      const updatedSig = {
        name: data.signedName || nameToSign,
        signedAt: data.signedAt || new Date().toISOString(),
      };

      if (roleToSign === "business") {
        onBriefLocked?.();
      }

      setSigState((prev) => {
        const nextClient = roleToSign === "business" ? updatedSig : prev.clientSignature;
        const nextCreative = roleToSign === "creative" ? updatedSig : prev.creativeSignature;
        const nextBoth = Boolean(data.bothSigned || (nextClient && nextCreative));

        if (nextBoth && !prev.bothSigned) {
          setShowCelebration(true);
        }

        return {
          bothSigned: nextBoth,
          clientSignature: nextClient,
          creativeSignature: nextCreative,
        };
      });

      setInfoMsg(
        roleToSign === "business" && !data.bothSigned
          ? `Contract signed! Waiting on ${creativeName}'s signature to unlock the Active Workspace.`
          : "Contract signed!"
      );

      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not sign contract.");
    } finally {
      setSigningRole(null);
    }
  };

  const handleDeclineContract = async () => {
    setDeclining(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/projects/contract/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          reason: declineReason.trim() || "Creative declined the project scope.",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not decline contract.");

      setInfoMsg(
        `Project declined. ${data.refundedCoins || coins} Peach Coins were automatically refunded to ${businessName}.`
      );
      setShowDeclineConfirm(false);
      router.push("/creative/projects");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not decline contract.");
    } finally {
      setDeclining(false);
    }
  };

  const deliverables = (() => {
    if (!description)
      return [
        "High-impact commercial deliverable",
        "100% vector master source files (.AI, .SVG)",
        "Commercial usage rights release",
      ];
    const lines = description.split("\n");
    const items: string[] = [];
    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith("•") || t.startsWith("-")) {
        const cleaned = t.replace(/^[•\-]\s*/, "");
        if (cleaned && !cleaned.toLowerCase().includes("category")) {
          items.push(cleaned);
        }
      }
    }
    return items.length > 0
      ? items.slice(0, 6)
      : ["Complete commercial production deliverable", "Print/web source assets", "Full ownership transfer"];
  })();

  const isClientSigned = Boolean(sigState.clientSignature);
  const isCreativeSigned = Boolean(sigState.creativeSignature);
  const isBothSigned = sigState.bothSigned;

  return (
    <div className="relative bg-white border-2 border-[#C84E2D] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 my-6 overflow-hidden">
      {/* DUAL SIGNATURE CELEBRATION BANNER */}
      <AnimatePresence>
        {(showCelebration || (isBothSigned && currentStatus === "in_progress")) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 bg-gradient-to-r from-[#FFF0EA] via-[#FFE3D6] to-[#FFF5F0] border-2 border-[#C84E2D] rounded-2xl shadow-md text-center space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#C84E2D] !text-white text-white text-xs font-black uppercase tracking-wider rounded-full shadow-2xs">
              <span>Dual Digital Signatures Complete</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#0B2D22]">
              You&apos;re Officially Paired! Workspace &amp; Brand Vault Unlocked
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto font-medium leading-relaxed">
              <strong>{businessName}</strong> and <strong>{creativeName}</strong> have both signed the Design Contract. Live chat, file uploads, and Brand Vault access are active!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <span className="px-3 py-1 bg-white rounded-xl text-xs font-bold text-emerald-800 border border-emerald-300">
                ✓ Business Owner: {sigState.clientSignature?.name}
              </span>
              <span className="px-3 py-1 bg-white rounded-xl text-xs font-bold text-emerald-800 border border-emerald-300">
                ✓ Creative: {sigState.creativeSignature?.name}
              </span>
              <span className="px-3 py-1 bg-white rounded-xl text-xs font-bold text-[#C84E2D] border border-[#F2C2B2]">
                {coins} Peach Coins (${coins * 50} USD) Reserved
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F2C2B2]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider !text-white text-white bg-[#C84E2D] px-2.5 py-0.5 rounded-full">
              Two-Sided Design Contract
            </span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {isBothSigned
                ? "Active Contract · Workspace Open"
                : isClientSigned
                ? `Business Signed · Waiting on ${creativeName}`
                : "Ready for Signatures"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
            {projectTitle}
          </h2>
          <div className="text-xs text-slate-600 font-semibold mt-0.5">
            {category} &bull; <strong className="text-[#C84E2D]">{coins} Peach Coins</strong> (${coins * 50} USD reserved) &bull; 3 Revisions Included &bull; 100% Transfer
          </div>
        </div>

        <div className="text-left sm:text-right text-xs shrink-0">
          <span className="text-slate-500 font-bold block">Target Turnaround</span>
          <strong className="text-slate-900 font-black">
            {dueAt
              ? new Date(dueAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  timeZone: "America/Chicago",
                })
              : "3–5 Business Days"}
          </strong>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-100 border-l-4 border-rose-500 text-xs text-rose-950 font-bold rounded-r-xl">
          {errorMsg}
        </div>
      )}

      {infoMsg && (
        <div className="p-3 bg-emerald-100 border-l-4 border-emerald-600 text-xs text-emerald-950 font-bold rounded-r-xl">
          {infoMsg}
        </div>
      )}

      {/* DELIVERABLES & GUARANTEES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#FFF9F6] border border-[#F2C2B2] rounded-2xl p-4 space-y-2">
          <span className="text-[10px] font-black uppercase text-[#C84E2D] block tracking-wider">
            Scope Deliverables Breakdown:
          </span>
          <div className="space-y-1.5 text-xs text-slate-700">
            {deliverables.map((deliv, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-emerald-700 font-black shrink-0">&bull;</span>
                <span className="leading-snug">{deliv}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#FFF9F6] border border-[#F2C2B2] rounded-2xl p-4 space-y-2">
          <span className="text-[10px] font-black uppercase text-[#A33B1E] block tracking-wider">
            Peach Network Contract Guarantees:
          </span>
          <ul className="space-y-1.5 text-xs text-slate-700">
            <li className="flex items-start gap-1.5">
              <span className="text-[#C84E2D] font-black">&rarr;</span>
              <span>
                <strong>100% Ownership:</strong> Source files &amp; commercial rights transfer on completion.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#C84E2D] font-black">&rarr;</span>
              <span>
                <strong>Auto Brand Vault Security:</strong> Vault opens only while this contract is active and closes on completion.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#C84E2D] font-black">&rarr;</span>
              <span>
                <strong>Peach Project Protection:</strong> If the creative declines, 100% of your Coins refund automatically.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3-WAY CONTRACT TERMS & POLICIES (SCROLLABLE BOX RIGHT ABOVE SIGNATURE BOXES) */}
      <div className="bg-[#FAF8F5] border-2 border-[#E9A995] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 bg-[#FFF2EC] border-b border-[#E9A995] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-[#C84E2D] shrink-0" />
            <h3 className="text-xs sm:text-sm font-black text-slate-950 uppercase tracking-wide">
              Peach Network Project Agreement &amp; Policies
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#A33B1E]">
            Scroll &amp; review all 3 protections before signing
          </span>
        </div>

        <div
          tabIndex={0}
          aria-label="Peach Network Project Agreement and Policies"
          className="max-h-72 overflow-y-auto p-5 space-y-5 text-xs text-stone-700 leading-relaxed"
        >
          {/* Pillar 1: Protecting the Business Owner */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#173328]">
              <Briefcase className="w-4 h-4 text-[#C84E2D] shrink-0" />
              <h4 className="text-xs font-black uppercase tracking-wider">
                Protecting the Business Owner
              </h4>
            </div>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>
                <strong>Full Ownership at Completion:</strong> Upon final deliverable sign-off, the business owner receives commercial usage rights, agreed source files, and/or administrative website ownership transfer.
              </li>
              <li>
                <strong>Included Revisions:</strong> Projects include up to <strong>3 revision rounds</strong> within the signed Creative Brief before final sign-off.
              </li>
              <li>
                <strong>Creative Response Guarantee:</strong> If a creative fails to send their kickoff message within <strong>5 hours</strong> of accepting or stops responding, the business owner can request a re-match or Coin credit to their wallet.
              </li>
            </ol>
          </div>

          {/* Pillar 2: Protecting the Creative */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#173328]">
              <Sparkles className="w-4 h-4 text-[#C84E2D] shrink-0" />
              <h4 className="text-xs font-black uppercase tracking-wider">
                Protecting the Creative
              </h4>
            </div>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>
                <strong>50/50 Milestone Payout:</strong> 50% of the creative&apos;s payout unlocks after contract signature and the 5-hour kickoff message; the remaining 50% releases upon final deliverable approval.
              </li>
              <li>
                <strong>Scope Boundary:</strong> Work is strictly limited to the signed Creative Brief (page count, photo limit, digital-only vs. physical print). Any extra work requires an approved <strong>Add-On / Extra Coins</strong>.
              </li>
              <li>
                <strong>Client Asset &amp; Timeline Rule:</strong> Turnaround clocks start once the client supplies required base assets (logos, copy, shoot address, or Brand Vault access); client delays pause the deadline clock.
              </li>
              <li>
                <strong>Portfolio Rights:</strong> Creatives may display completed, public-facing work in their Peach Network portfolio unless agreed otherwise in writing.
              </li>
            </ol>
          </div>

          {/* Pillar 3: Protecting Peach Network */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#173328]">
              <ShieldCheck className="w-4 h-4 text-[#C84E2D] shrink-0" />
              <h4 className="text-xs font-black uppercase tracking-wider">
                Protecting Peach Network (Sweet As A Peach Creative Agency)
              </h4>
            </div>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>
                <strong>On-Platform Policy:</strong> All project communication, file handoffs, add-ons, and Coin payments must stay inside Peach Network. Off-platform deals void platform support and milestone protection.
              </li>
              <li>
                <strong>Independent Creatives:</strong> Vetted creatives are independent commercial artists, not employees of Peach Network.
              </li>
              <li>
                <strong>Brand Vault Confidentiality:</strong> Creatives receive temporary access to the client&apos;s Brand Vault strictly for the active project; access closes automatically upon completion and assets may not be reused elsewhere.
              </li>
              <li>
                <strong>Art Director Mediation:</strong> In the event of a dispute, either party may request review by a Peach Network Art Director, who will resolve milestone payouts fairly based on the signed Creative Brief and on-platform chat records.
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* STRICT TWO-SIDED DIGITAL SIGNATURE CONSOLE */}
      <div className="bg-white border-2 border-[#F2C2B2] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F2C2B2]">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-tight">
              Two-Sided Design Contract Signatures
            </h3>
            <p className="text-xs text-slate-600">
              Each party signs only their own side. The Active Workspace &amp; Brand Vault unlock once both signatures are recorded.
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase self-start sm:self-auto ${
              isBothSigned
                ? "bg-emerald-600 !text-white text-white"
                : "bg-amber-100 text-amber-900 border border-amber-300"
            }`}
          >
            {isBothSigned ? "Both Parties Signed ✓" : "Awaiting Signatures"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. BUSINESS OWNER SIGNATURE */}
          <div
            className={`p-4 rounded-xl border-2 transition-all ${
              isClientSigned
                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                : "bg-[#FFF9F6] border-[#F2C2B2] text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <strong className="text-xs font-black uppercase tracking-wider">
                1. Business Owner Signature
              </strong>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded ${
                  isClientSigned ? "bg-emerald-200 text-emerald-900" : "bg-amber-100 text-amber-900"
                }`}
              >
                {isClientSigned ? "Signed ✓" : "Signature Required"}
              </span>
            </div>

            {isClientSigned ? (
              <div className="space-y-1 text-xs">
                <div className="font-serif italic text-base text-emerald-950 font-bold border-b border-emerald-200 pb-1">
                  {sigState.clientSignature?.name}
                </div>
                <div className="text-[10px] text-emerald-800">
                  Signed on {new Date(sigState.clientSignature?.signedAt || "").toLocaleString()} CT
                </div>
                <div className="text-[10px] text-emerald-700">
                  Verified Business Owner &bull; Peach Project Protection Active
                </div>
              </div>
            ) : userRole === "business" || userRole === "admin" ? (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor={`business-legal-name-${projectId}`}
                    className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Typed Full Legal Name
                  </label>
                  <input
                    id={`business-legal-name-${projectId}`}
                    type="text"
                    value={clientSignerName}
                    onChange={(e) => setClientSignerName(e.target.value)}
                    placeholder="Type your full legal name"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E9A995] rounded-lg text-slate-950 focus:outline-none focus:border-[#C84E2D]"
                  />
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer select-none bg-white border border-[#F2C2B2] rounded-xl p-3">
                  <input
                    type="checkbox"
                    checked={clientTermsAccepted}
                    onChange={(e) => setClientTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#C84E2D] accent-[#C84E2D] shrink-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-800 font-medium leading-snug">
                    I have reviewed the Creative Brief and agree to the Peach Network Project Terms &amp; Policies.
                  </span>
                </label>

                {!briefLocked && (
                  <p className="text-[11px] text-[#A33B1E] font-semibold">
                    Signing will also lock your current Creative Brief and send it to {creativeName} for their signature.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => handleSign("business")}
                  disabled={
                    signingRole === "business" ||
                    !clientSignerName.trim() ||
                    !clientTermsAccepted
                  }
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#C84E2D] hover:bg-[#A33B1E] !text-white text-white text-xs font-black rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {signingRole === "business" ? "Recording Signature..." : "Sign Contract →"}
                  </span>
                </button>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-600 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Waiting on <strong>{businessName}</strong> to sign the Business Owner side.
                </span>
              </div>
            )}
          </div>

          {/* 2. CREATIVE SIGNATURE */}
          <div
            className={`p-4 rounded-xl border-2 transition-all ${
              isCreativeSigned
                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                : "bg-[#FFF9F6] border-[#F2C2B2] text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <strong className="text-xs font-black uppercase tracking-wider">
                2. Creative Signature
              </strong>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded ${
                  isCreativeSigned ? "bg-emerald-200 text-emerald-900" : "bg-amber-100 text-amber-900"
                }`}
              >
                {isCreativeSigned ? "Signed ✓" : "Locked · Read-Only"}
              </span>
            </div>

            {isCreativeSigned ? (
              <div className="space-y-1 text-xs">
                <div className="font-serif italic text-base text-emerald-950 font-bold border-b border-emerald-200 pb-1">
                  {sigState.creativeSignature?.name}
                </div>
                <div className="text-[10px] text-emerald-800">
                  Signed on {new Date(sigState.creativeSignature?.signedAt || "").toLocaleString()} CT
                </div>
                <div className="text-[10px] text-emerald-700">
                  Assigned Creative &bull; {creativeHub}
                </div>
              </div>
            ) : userRole === "creative" ? (
              !briefLocked && !isClientSigned ? (
                <div className="bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-600 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Waiting on <strong>{businessName}</strong> to finalize the Creative Brief or sign their side before you can sign or decline.
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-[11px] text-slate-600">
                    Review the Creative Brief and Project Agreement &amp; Policies, then choose <strong>Sign &amp; Accept</strong> or <strong>Decline</strong> (which refunds the client&apos;s Coins).
                  </p>
                  <div>
                    <label
                      htmlFor={`creative-legal-name-${projectId}`}
                      className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1"
                    >
                      Typed Full Legal Name
                    </label>
                    <input
                      id={`creative-legal-name-${projectId}`}
                      type="text"
                      value={creativeSignerName}
                      onChange={(e) => setCreativeSignerName(e.target.value)}
                      placeholder="Type your full legal name"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E9A995] rounded-lg focus:outline-none focus:border-[#C84E2D]"
                    />
                  </div>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none bg-white border border-[#F2C2B2] rounded-xl p-2.5">
                    <input
                      type="checkbox"
                      checked={creativeTermsAccepted}
                      onChange={(e) => setCreativeTermsAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[#0B2D22] accent-[#0B2D22] shrink-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-800 font-medium leading-snug">
                      I have reviewed the Creative Brief and agree to the Peach Network Project Terms &amp; Policies.
                    </span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => handleSign("creative")}
                      disabled={
                        signingRole === "creative" ||
                        declining ||
                        !creativeSignerName.trim() ||
                        !creativeTermsAccepted
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#0B2D22] hover:bg-[#164e3f] !text-white text-white text-xs font-black rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{signingRole === "creative" ? "Signing..." : "Sign & Accept"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeclineConfirm((v) => !v)}
                      disabled={signingRole === "creative" || declining}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-black rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>

                  {showDeclineConfirm && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-2 mt-2">
                      <p className="text-[11px] font-bold text-rose-900">
                        Declining releases this project and automatically refunds {coins} Peach Coins to {businessName}.
                      </p>
                      <input
                        type="text"
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        placeholder="Optional note for client (e.g. schedule conflict)"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-rose-300 rounded-lg"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowDeclineConfirm(false)}
                          className="px-3 py-1.5 text-xs font-bold text-stone-600 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDeclineContract}
                          disabled={declining}
                          className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 !text-white text-white text-xs font-black cursor-pointer disabled:opacity-50"
                        >
                          {declining ? "Refunding..." : "Confirm Decline & Refund"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              /* BUSINESS OWNER READ-ONLY LOCKED CREATIVE FIELD */
              <div className="bg-white border border-amber-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Waiting on {creativeName}&apos;s signature</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  This signature field is strictly locked on your view. {creativeName} ({creativeSpecialty}, {creativeHub}) signs directly from their Creative account, and we&apos;ll notify you as soon as they sign.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
