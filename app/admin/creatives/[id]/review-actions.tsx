"use client";

import { useState } from "react";

type PeachLevel = "seed" | "sapling" | "tree" | "blossom" | "root";

export default function CreativeReviewActions({
  creativeId,
  applicationId,
  currentLevel,
  currentStatus,
  existingNotes
}: {
  creativeId: string;
  applicationId?: string;
  currentLevel?: PeachLevel | null;
  currentStatus: string;
  existingNotes: string;
}) {
  const [level, setLevel] = useState<PeachLevel>(currentLevel ?? "sapling");
  const [notes, setNotes] = useState(existingNotes);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function act(action: "approve" | "needs_more_work" | "reject") {
    setBusy(true);
    setMessage("");

    const response = await fetch("/api/admin/creative-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creativeId,
        applicationId,
        action,
        level,
        notes
      })
    });

    const body = await response.json();
    setBusy(false);

    if (!response.ok) {
      setMessage(body.error ?? "Could not update application.");
      return;
    }

    if (action === "approve") {
      setMessage(`Approved as Peach ${level[0].toUpperCase() + level.slice(1)}.`);
    } else if (action === "needs_more_work") {
      setMessage("Marked as Needs More Work.");
    } else {
      setMessage("Application rejected.");
    }
  }

  return (
    <section className="card" style={{marginTop:18}}>
      <p className="muted">PEACH DECISION</p>
      <h2>Assign level and review.</h2>

      <label>
        <strong>Starting Peach Level</strong>
        <select className="field" value={level} onChange={(e) => setLevel(e.target.value as PeachLevel)}>
          <option value="seed">Peach Seed</option>
          <option value="sapling">Peach Sapling</option>
          <option value="tree">Peach Tree</option>
          <option value="blossom">Peach Blossom</option>
          <option value="root">Peach Root</option>
        </select>
      </label>

      <label>
        <strong>Private admin notes</strong>
        <textarea
          className="field"
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Portfolio quality, communication, strengths, concerns..."
        />
      </label>

      <div style={{background:"#fff3e8",padding:16,borderRadius:16,marginBottom:16}}>
        <strong>Peach controls level assignment.</strong>
        <p style={{marginBottom:0}}>
          Applicants cannot change their own Peach Level. Approval is handled through a trusted server route and logged.
        </p>
      </div>

      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button className="btn btn-primary" onClick={() => act("approve")} disabled={busy}>
          Approve Creative
        </button>
        <button className="btn btn-outline" onClick={() => act("needs_more_work")} disabled={busy}>
          Needs More Work
        </button>
        <button className="btn btn-outline" onClick={() => act("reject")} disabled={busy}>
          Reject
        </button>
      </div>

      {message && <p style={{marginTop:16}}>{message}</p>}
    </section>
  );
}
