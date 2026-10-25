"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, AlertCircle, X, RotateCw, CheckCircle2 } from "lucide-react";

interface DisputeModalProps {
  projectId: string;
  projectTitle: string;
  coinAmount: number;
  isOpen: boolean;
  onClose: () => void;
}

export function DisputeModal({
  projectId,
  projectTitle,
  coinAmount,
  isOpen,
  onClose,
}: DisputeModalProps) {
  const router = useRouter();
  const [statement, setStatement] = useState("");
  const [requestedResolution, setRequestedResolution] = useState<"full_refund" | "half_refund" | "new_creative">("full_refund");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!statement.trim()) {
      setErrorMsg("Please provide an explanation of why you are requesting a dispute.");
      return;
    }

    setBusy(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/disputes/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          statement: statement.trim(),
          requestedResolution,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit dispute.");

      setSuccess(true);
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit dispute.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl relative animate-in fade-in zoom-in-95">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Peach Escrow Protection</span>
        </div>

        <h2 className="text-xl font-extrabold text-stone-950 tracking-tight">
          Submit Project Dispute
        </h2>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
          Active projects cannot be directly cancelled once underway. Your case is submitted directly to the
          Peach Admin review dashboard for resolution. Coins remain protected in escrow.
        </p>

        <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-3 my-3.5 text-xs text-stone-700 space-y-1">
          <div className="font-bold text-stone-900 truncate">Project: {projectTitle}</div>
          <div className="text-stone-600">
            Escrow Commitment: <strong className="text-stone-900 tabular-nums">{coinAmount} Coins</strong> ($
            {(coinAmount * 50).toLocaleString()} USD)
          </div>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2 text-xs text-emerald-900">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <strong className="block text-sm font-bold">Dispute Submitted to Admins</strong>
            <p className="text-stone-600">
              Our support team has been notified and will review project updates, messages, and deliverables.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-900 block mb-1">
                Why are you disputing or requesting cancellation? <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Explain the issue (e.g. creative unresponsive, deliverables do not meet agreed brief, scope disagreement)..."
                className="w-full bg-[#FAF8F5] focus:bg-white border border-stone-200 focus:border-[#EB6244] rounded-xl p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-all leading-relaxed"
              />
            </div>

            <div>
              <label className="font-bold text-stone-900 block mb-1">
                What resolution are you requesting?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRequestedResolution("full_refund")}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                    requestedResolution === "full_refund"
                      ? "bg-[#173328] text-white border-[#173328]"
                      : "bg-[#FAF8F5] text-stone-700 border-stone-200 hover:bg-white"
                  }`}
                >
                  <strong className="block text-xs font-bold">Full Refund</strong>
                  <span className="text-[10px] opacity-80">100% coins back to wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestedResolution("half_refund")}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                    requestedResolution === "half_refund"
                      ? "bg-[#173328] text-white border-[#173328]"
                      : "bg-[#FAF8F5] text-stone-700 border-stone-200 hover:bg-white"
                  }`}
                >
                  <strong className="block text-xs font-bold">Half Refund</strong>
                  <span className="text-[10px] opacity-80">50% to you / 50% creative</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestedResolution("new_creative")}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                    requestedResolution === "new_creative"
                      ? "bg-[#173328] text-white border-[#173328]"
                      : "bg-[#FAF8F5] text-stone-700 border-stone-200 hover:bg-white"
                  }`}
                >
                  <strong className="block text-xs font-bold">New Creative</strong>
                  <span className="text-[10px] opacity-80">Reassign from network</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="px-4 py-2 text-stone-600 hover:text-stone-900 font-bold hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || !statement.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting to Admins…</span>
                  </>
                ) : (
                  <span>Submit Dispute to HQ</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
