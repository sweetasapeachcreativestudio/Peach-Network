"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowIcon, SparkIcon } from "./icons";

export default function PeachMatchLauncher({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [brief, setBrief] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = brief.trim();
    const url = value ? `/business/new-project?brief=${encodeURIComponent(value)}` : "/business/new-project";
    router.push(url);
  }

  return (
    <form className={`v12-match-launcher ${compact ? "compact" : ""}`} onSubmit={submit}>
      <div className="v12-match-label"><SparkIcon /> PEACH MATCH AI <span>BETA</span></div>
      {!compact && <h2>Tell Peach what you need. We’ll find the people.</h2>}
      <div className="v12-match-input-row">
        <textarea
          rows={compact ? 2 : 3}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Try: I need someone to create reels for my restaurant launch…"
          aria-label="Describe the creative help you need"
        />
        <button type="submit" aria-label="Start Peach Match"><ArrowIcon /></button>
      </div>
      {!compact && <p>Peach compares specialty, portfolio fit, level, availability and reliability — then gives you a small shortlist, not a bidding pile.</p>}
    </form>
  );
}
