"use client";

import { useState } from "react";
import { CheckCircle2, RotateCw, RefreshCw, Undo2, Percent } from "lucide-react";

export default function ResolutionClient({
  disputeId,
  maxCoins,
}: {
  disputeId: string;
  maxCoins: number;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");

  async function handleResolve(type: "full_refund" | "half_refund" | "send_new_creative") {
    setBusy(true);
    setMsg("");

    let coinsReturned = 0;
    let payoutCents = 0;

    if (type === "full_refund") {
      coinsReturned = maxCoins;
      payoutCents = 0;
    } else if (type === "half_refund") {
      coinsReturned = Math.ceil(maxCoins / 2);
      // Remaining half in cash for creative (5000 cents/coin * 0.75 payout standard)
      const creativeCoins = Math.floor(maxCoins / 2);
      payoutCents = Math.round(creativeCoins * 5000 * 0.75);
    } else if (type === "send_new_creative") {
      coinsReturned = 0;
      payoutCents = 0;
    }

    try {
      const r = await fetch("/api/admin/disputes/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disputeId,
          resolutionType: type,
          coinsReturned,
          payoutCents,
          note: note.trim() || `Admin resolved as ${type.replaceAll("_", " ")}`,
        }),
      });

      const b = await r.json();
      if (!r.ok) throw new Error(b.error || "Could not resolve dispute.");

      setMsg("✓ Resolution successfully executed!");
      setTimeout(() => (location.href = "/admin/disputes"), 1000);
    } catch (e: any) {
      setMsg(e.message || "Could not resolve dispute.");
      setBusy(false);
    }
  }

  return (
    <section className="card" style={{ marginTop: 20, padding: 22 }}>
      <h2>Admin Resolution Decisions</h2>
      <p className="muted" style={{ fontSize: 13, margin: "6px 0 16px" }}>
        Choose one of the 3 administrative actions to settle this project dispute:
      </p>

      <div style={{ marginBottom: 16 }}>
        <label>
          <strong>Internal Admin Resolution Note</strong>
          <textarea
            className="field"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add context for this resolution decision..."
          />
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {/* Button 1: Full Refund */}
        <button
          type="button"
          disabled={busy}
          onClick={() => handleResolve("full_refund")}
          className="btn"
          style={{
            background: "#b91c1c",
            color: "white",
            padding: "14px 16px",
            borderRadius: 12,
            fontWeight: 800,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 900 }}>1. Full Refund</div>
          <small style={{ display: "block", fontSize: 11, opacity: 0.9, marginTop: 4 }}>
            Return all {maxCoins} coins (${maxCoins * 50}) to client. Mark project cancelled.
          </small>
        </button>

        {/* Button 2: Half Refund */}
        <button
          type="button"
          disabled={busy}
          onClick={() => handleResolve("half_refund")}
          className="btn"
          style={{
            background: "#d97706",
            color: "white",
            padding: "14px 16px",
            borderRadius: 12,
            fontWeight: 800,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 900 }}>2. Half Refund (50/50 Split)</div>
          <small style={{ display: "block", fontSize: 11, opacity: 0.9, marginTop: 4 }}>
            Return {Math.ceil(maxCoins / 2)} coins to client, pay creative cash for work done.
          </small>
        </button>

        {/* Button 3: Send a New Creative */}
        <button
          type="button"
          disabled={busy}
          onClick={() => handleResolve("send_new_creative")}
          className="btn"
          style={{
            background: "#15803d",
            color: "white",
            padding: "14px 16px",
            borderRadius: 12,
            fontWeight: 800,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 900 }}>3. Send a New Creative</div>
          <small style={{ display: "block", fontSize: 11, opacity: 0.9, marginTop: 4 }}>
            Unassign current creative and reset to matching from ecosystem.
          </small>
        </button>
      </div>

      {busy && (
        <p style={{ marginTop: 12, color: "#4b5563", fontSize: 12 }}>
          Executing atomic dispute resolution…
        </p>
      )}

      {msg && (
        <p
          style={{
            marginTop: 12,
            fontWeight: 700,
            fontSize: 13,
            color: msg.includes("✓") ? "#15803d" : "#b91c1c",
          }}
        >
          {msg}
        </p>
      )}
    </section>
  );
}
