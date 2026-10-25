"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RotateCw, XCircle, Check } from "lucide-react";

interface MatchActionsProps {
  projectId: string;
  creativeId?: string;
  isBatchControl?: boolean;
}

export default function MatchActions({
  projectId,
  creativeId,
  isBatchControl = false,
}: MatchActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [cancelled, setCancelled] = useState(false);

  // Send offer to selected creative
  async function chooseCreative() {
    if (!creativeId) return;
    setBusy(true);
    setMsg("");

    try {
      const res = await fetch("/api/projects/request-creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, creativeId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send invitation.");

      setMsg("Request sent! The creative has 24 hours to accept or decline.");
      router.refresh();
    } catch (err: any) {
      setMsg(err.message || "Failed to invite creative.");
    } finally {
      setBusy(false);
    }
  }

  // Refresh and get 3 new candidates
  async function refreshNextBatch() {
    setBusy(true);
    setMsg("");

    try {
      const res = await fetch("/api/projects/ai-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, batchRefresh: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not refresh creatives.");

      router.refresh();
    } catch (err: any) {
      setMsg(err.message || "Failed to load new creatives.");
    } finally {
      setBusy(false);
    }
  }

  // Cancel creative search
  async function cancelSearch() {
    if (!confirm("Are you sure you want to cancel this creative search? Any coins committed in escrow will be returned to your available wallet balance.")) {
      return;
    }

    setBusy(true);
    setMsg("");

    try {
      const res = await fetch("/api/projects/cancel-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not cancel search.");

      setCancelled(true);
      router.push("/business");
      router.refresh();
    } catch (err: any) {
      setMsg(err.message || "Failed to cancel search.");
      setBusy(false);
    }
  }

  if (isBatchControl) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
        <button
          type="button"
          onClick={cancelSearch}
          disabled={busy || cancelled}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        >
          <XCircle className="w-4 h-4 text-stone-400 hover:text-red-600" />
          <span>Cancel Search</span>
        </button>

        <button
          type="button"
          onClick={refreshNextBatch}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          {busy ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Fetching New Matches…</span>
            </>
          ) : (
            <>
              <RotateCw className="w-3.5 h-3.5" />
              <span>Show 3 New Creatives →</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      <button
        type="button"
        disabled={busy}
        onClick={chooseCreative}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EB6244] hover:bg-[#d85538] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
      >
        {busy ? (
          <>
            <RotateCw className="w-4 h-4 animate-spin" />
            <span>Sending Offer…</span>
          </>
        ) : (
          <>
            <span>Choose This Creative (24h to Accept)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>

      {msg && (
        <p className="text-xs text-stone-600 leading-relaxed text-center font-medium">
          {msg}
        </p>
      )}
    </div>
  );
}