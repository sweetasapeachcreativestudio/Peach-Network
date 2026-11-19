"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OfferActions({
  offerId,
  projectId,
  payoutCents,
  briefDraft = false,
}: {
  offerId: string;
  projectId?: string;
  payoutCents: number;
  briefDraft?: boolean;
}) {
  const router = useRouter();
  const [showCounter, setShowCounter] = useState(false);
  const [counter, setCounter] = useState((payoutCents / 100).toFixed(2));
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function respond(action: "accept" | "decline" | "counter") {
    setBusy(true);
    setMessage("");

    if (action === "decline" && projectId) {
      const declineRes = await fetch("/api/projects/contract/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          reason: reason || "Creative declined opportunity from matches page.",
        }),
      });
      if (declineRes.ok) {
        setBusy(false);
        setMessage("Opportunity declined. Client's escrow Coins have been refunded.");
        router.refresh();
        return;
      }
    }

    const r = await fetch("/api/offers/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offerId,
        action,
        counterPayoutCents: action === "counter" ? Math.round(Number(counter) * 100) : undefined,
        counterReason: action === "counter" ? reason : undefined,
      }),
    });
    const body = await r.json();
    setBusy(false);
    if (!r.ok) return setMessage(body.error ?? "Could not respond.");

    if (action === "accept") {
      router.push(projectId ? `/projects/${projectId}` : "/creative/projects");
      router.refresh();
      return;
    }
    setMessage(action === "decline" ? "Offer declined." : "Counteroffer sent to Peach.");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {!briefDraft && (
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 !text-white text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            onClick={() => respond("accept")}
            disabled={busy}
          >
            Quick Accept ${(payoutCents / 100).toFixed(2)}
          </button>
        )}
        <button
          type="button"
          className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          onClick={() => setShowCounter(!showCounter)}
          disabled={busy}
        >
          Counter Offer
        </button>
        <button
          type="button"
          className="px-3.5 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          onClick={() => respond("decline")}
          disabled={busy}
        >
          Decline
        </button>
      </div>

      {showCounter && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 mt-2">
          <label className="block space-y-1 text-xs font-bold text-stone-800">
            <span>Requested payout ($ USD)</span>
            <input
              className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
              value={counter}
              onChange={(e) => setCounter(e.target.value)}
            />
          </label>
          <label className="block space-y-1 text-xs font-bold text-stone-800">
            <span>Why?</span>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the scope, time, or complexity behind your counter."
            />
          </label>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-[#173328] !text-white text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            onClick={() => respond("counter")}
            disabled={busy}
          >
            Send Counteroffer
          </button>
          <p className="text-[11px] text-stone-500">
            Peach has up to 72 hours to respond before the current offer expires.
          </p>
        </div>
      )}

      {message && <p className="text-xs font-semibold text-stone-700">{message}</p>}
    </div>
  );
}
