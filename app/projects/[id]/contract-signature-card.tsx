"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

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
  isClient: boolean;
}

interface SignatureState {
  bothSigned: boolean;
  clientSignature: { name: string; signedAt: string } | null;
  creativeSignature: { name: string; signedAt: string } | null;
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
  isClient,
}: ContractSignatureCardProps) {
  const router = useRouter();

  const [clientSignerName, setClientSignerName] = useState(businessName);
  const [creativeSignerName, setCreativeSignerName] = useState(creativeName);
  const [signingRole, setSigningRole] = useState<"business" | "creative" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  const [sigState, setSigState] = useState<SignatureState>({
    bothSigned: ["in_progress", "proof_uploaded", "revisions", "submitted", "approved", "completed"].includes(currentStatus),
    clientSignature: ["in_progress", "proof_uploaded", "revisions", "submitted", "approved", "completed"].includes(currentStatus)
      ? { name: businessName, signedAt: new Date().toISOString() }
      : null,
    creativeSignature: ["in_progress", "proof_uploaded", "revisions", "submitted", "approved", "completed"].includes(currentStatus)
      ? { name: creativeName, signedAt: new Date().toISOString() }
      : null,
  });

  // Fetch contract status on mount
  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch(`/api/projects/contract/sign?projectId=${projectId}`);
        const data = await res.json();
        if (res.ok && data) {
          if (data.clientSignature || data.creativeSignature) {
            setSigState({
              bothSigned: Boolean(data.bothSigned),
              clientSignature: data.clientSignature,
              creativeSignature: data.creativeSignature,
            });
          }
        }
      } catch (err) {
        // use initial state
      }
    }
    loadStatus();
  }, [projectId]);

  // Handle digital signing
  const handleSign = async (role: "business" | "creative") => {
    setSigningRole(role);
    setErrorMsg("");

    const nameToSign = role === "business" ? clientSignerName : creativeSignerName;

    try {
      const res = await fetch("/api/projects/contract/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          signerRole: role,
          signerName: nameToSign,
          signatureData: `Digital verification via Peach Network Auth (${Date.now()})`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sign contract.");

      const updatedSig = {
        name: data.signedName || nameToSign,
        signedAt: data.signedAt || new Date().toISOString(),
      };

      setSigState((prev) => {
        const nextClient = role === "business" ? updatedSig : prev.clientSignature;
        const nextCreative = role === "creative" ? updatedSig : prev.creativeSignature;
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

      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not sign contract.");
    } finally {
      setSigningRole(null);
    }
  };

  // Deliverables list parsed from brief
  const deliverables = (() => {
    if (!description) return ["High-impact commercial deliverable", "100% vector master source files (.AI, .SVG)", "Commercial usage rights release"];
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
      {/* CUTE CELEBRATION MODAL / BANNER (TRIGGERED ON DUAL SIGNATURE) */}
      <AnimatePresence>
        {(showCelebration || (isBothSigned && currentStatus === "in_progress")) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 bg-gradient-to-r from-[#FFF0EA] via-[#FFE3D6] to-[#FFF5F0] border-2 border-[#C84E2D] rounded-2xl shadow-md text-center space-y-3 relative overflow-hidden"
          >
            {/* Animated confetti particle chips */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
              <span className="absolute top-2 left-6 text-xl animate-bounce">🍑</span>
              <span className="absolute top-8 right-12 text-lg animate-pulse">✨</span>
              <span className="absolute bottom-4 left-1/4 text-2xl animate-spin">🎉</span>
              <span className="absolute top-3 right-1/3 text-xl animate-bounce">🎨</span>
              <span className="absolute bottom-3 right-8 text-xl">🍑</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#C84E2D] text-white text-xs font-black uppercase tracking-wider rounded-full shadow-2xs">
              <span>Dual Digital Signatures Complete</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#0B2D22]">
              🎉 You're Officially Paired! Contract Signed &amp; Milestones Activated! Let the creative magic begin! 🍑
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto font-medium leading-relaxed">
              <strong>{businessName}</strong> and <strong>{creativeName}</strong> have both digitally signed the 2026 Master Creative Brief. Escrow is secured, milestones are live, and the creative clock is running!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <span className="px-3 py-1 bg-white rounded-xl text-xs font-bold text-emerald-800 border border-emerald-300">
                ✓ Client Signed: {sigState.clientSignature?.name}
              </span>
              <span className="px-3 py-1 bg-white rounded-xl text-xs font-bold text-emerald-800 border border-emerald-300">
                ✓ Designer Signed: {sigState.creativeSignature?.name}
              </span>
              <span className="px-3 py-1 bg-white rounded-xl text-xs font-bold text-[#C84E2D] border border-[#F2C2B2]">
                {coins} Peach Coins (${coins * 50} USD) In Escrow
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F2C2B2]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#C84E2D] px-2.5 py-0.5 rounded-full">
              Official Creative Brief &amp; Scope Contract
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {isBothSigned ? "Active Contract · Work Commenced" : "Pending Dual Digital Signatures"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
            {projectTitle}
          </h2>
          <div className="text-xs text-slate-600 font-semibold mt-0.5">
            {category} &bull; <strong className="text-[#C84E2D]">{coins} Peach Coins</strong> (${coins * 50} USD in escrow) &bull; 3 Revisions Included &bull; 100% Transfer
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right text-xs">
            <span className="text-slate-500 font-bold block">Target Turnaround</span>
            <strong className="text-slate-900 font-black">
              {dueAt ? new Date(dueAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" }) : "3–5 Business Days"}
            </strong>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-100 border-l-4 border-rose-500 text-xs text-rose-950 font-bold rounded-r-xl">
          {errorMsg}
        </div>
      )}

      {/* CREATIVE BRIEF DELIVERABLES & REQUIREMENTS PREVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deliverables */}
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

        {/* Contract Guarantees */}
        <div className="bg-[#FFF9F6] border border-[#F2C2B2] rounded-2xl p-4 space-y-2">
          <span className="text-[10px] font-black uppercase text-[#A33B1E] block tracking-wider">
            Peach Network 2026 Guarantees:
          </span>
          <ul className="space-y-1.5 text-xs text-slate-700">
            <li className="flex items-start gap-1.5">
              <span className="text-[#C84E2D] font-black">&rarr;</span>
              <span><strong>100% Administrative Ownership:</strong> All live sites, master vector source files, and accounts transfer to business upon sign-off.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#C84E2D] font-black">&rarr;</span>
              <span><strong>Protected Escrow:</strong> Creative is paid only after final deliverables meet agreed brief.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#C84E2D] font-black">&rarr;</span>
              <span><strong>3 Revision Rounds:</strong> Guaranteed revision rounds included in this coin price.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* DUAL DIGITAL SIGNATURE CONSOLE */}
      <div className="bg-white border-2 border-[#F2C2B2] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F2C2B2]">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-tight">
              Dual Digital Sign-off Required to Begin Work
            </h3>
            <p className="text-xs text-slate-600">
              Both the business owner and the assigned creative must digitally sign below to activate the project milestones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                isBothSigned
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}
            >
              {isBothSigned ? "Both Parties Signed ✓" : "Awaiting Signatures"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. CLIENT DIGITAL SIGNATURE */}
          <div className={`p-4 rounded-xl border-2 transition-all ${
            isClientSigned
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : "bg-[#FFF9F6] border-[#F2C2B2] text-slate-900"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <strong className="text-xs font-black uppercase tracking-wider">
                1. Client Digital Signature
              </strong>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                isClientSigned ? "bg-emerald-200 text-emerald-900" : "bg-amber-100 text-amber-900"
              }`}>
                {isClientSigned ? "Signed ✓" : "Pending Sign-off"}
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
                  Authority: Business Client &bull; Funds Committed to Escrow
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-600">
                  By signing, {businessName} accepts the scope of work and authorizes the escrow milestones.
                </p>
                <input
                  type="text"
                  value={clientSignerName}
                  onChange={(e) => setClientSignerName(e.target.value)}
                  placeholder="Enter full name to digitally sign"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E9A995] rounded-lg focus:outline-none focus:border-[#C84E2D]"
                />
                <button
                  type="button"
                  onClick={() => handleSign("business")}
                  disabled={signingRole === "business" || !clientSignerName.trim()}
                  className="w-full py-2 bg-[#C84E2D] hover:bg-[#A33B1E] text-white text-xs font-black rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {signingRole === "business" ? "Recording Signature..." : "Digitally Sign as Client"}
                </button>
              </div>
            )}
          </div>

          {/* 2. CREATIVE DIGITAL SIGNATURE */}
          <div className={`p-4 rounded-xl border-2 transition-all ${
            isCreativeSigned
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : "bg-[#FFF9F6] border-[#F2C2B2] text-slate-900"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <strong className="text-xs font-black uppercase tracking-wider">
                2. Creative Designer Digital Signature
              </strong>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                isCreativeSigned ? "bg-emerald-200 text-emerald-900" : "bg-amber-100 text-amber-900"
              }`}>
                {isCreativeSigned ? "Signed ✓" : "Pending Sign-off"}
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
                  Role: Assigned Designer &bull; {creativeHub}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-600">
                  Assigned creative: <strong>{creativeName}</strong> ({creativeSpecialty}, {creativeHub}).
                </p>
                <input
                  type="text"
                  value={creativeSignerName}
                  onChange={(e) => setCreativeSignerName(e.target.value)}
                  placeholder="Creative full name"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E9A995] rounded-lg focus:outline-none focus:border-[#C84E2D]"
                />
                <button
                  type="button"
                  onClick={() => handleSign("creative")}
                  disabled={signingRole === "creative" || !creativeSignerName.trim()}
                  className="w-full py-2 bg-[#0B2D22] hover:bg-[#164e3f] text-white text-xs font-black rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {signingRole === "creative" ? "Recording Signature..." : "Digitally Sign as Designer"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
