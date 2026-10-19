"use client";

import { useEffect, useState } from "react";

export default function MatchWorkbench({ projectId }: { projectId: string }) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [payouts, setPayouts] = useState<Record<string,string>>({});

  async function rank() {
    setLoading(true);
    const r = await fetch("/api/admin/matches/rank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId })
    });
    const body = await r.json();
    setLoading(false);
    if (!r.ok) return setMessage(body.error ?? "Could not rank matches.");
    setMatches(body.ranked ?? []);
  }

  useEffect(() => { rank(); }, [projectId]);

  async function sendOffer(match: any) {
    const dollars = Number(payouts[match.creativeId] ?? "");
    if (!dollars || dollars <= 0) {
      setMessage("Enter the creative payout before sending the offer.");
      return;
    }

    const r = await fetch("/api/admin/matches/send-offer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        creativeId: match.creativeId,
        payoutCents: Math.round(dollars * 100),
        matchScore: match.score,
        reasons: match.reasons
      })
    });

    const body = await r.json();
    if (!r.ok) return setMessage(body.error ?? "Could not send offer.");
    setMessage(`Private offer sent to ${match.name}. It expires in 72 hours.`);
  }

  return (
    <section className="card" style={{marginTop:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
        <div>
          <p className="muted">RANKED CREATIVES</p>
          <h2 style={{marginTop:0}}>Peach Match Results</h2>
        </div>
        <button className="btn btn-outline" onClick={rank}>Refresh Matches</button>
      </div>

      {loading && <p>Finding the best Peaches… 🍑</p>}

      {!loading && matches.map((m, i) => (
        <div key={m.creativeId} className="card" style={{marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
            <div>
              <span className="pill">#{i+1} · {m.score}% MATCH</span>
              <h3>{m.name}</h3>
              <p className="muted">{m.primarySpecialty} · Peach {m.level} · Reliability {Math.round(m.reliability)}%</p>
              <p className="muted">{m.activeProjects} active project(s)</p>
              <ul>
                {m.reasons.slice(0,5).map((r:string) => <li key={r}>{r}</li>)}
              </ul>
            </div>
            <div style={{minWidth:220}}>
              <label>
                <strong>Creative payout</strong>
                <input
                  className="field"
                  inputMode="decimal"
                  placeholder="75.00"
                  value={payouts[m.creativeId] ?? ""}
                  onChange={(e) => setPayouts({...payouts,[m.creativeId]:e.target.value})}
                />
              </label>
              <button className="btn btn-primary" onClick={() => sendOffer(m)}>
                Send Private Offer
              </button>
            </div>
          </div>
        </div>
      ))}

      {!loading && matches.length===0 && (
        <div className="card" style={{marginTop:12}}>
          <h3>No qualified match yet.</h3>
          <p className="muted">Adjust specialty/level requirements or recruit another creative into the Network.</p>
        </div>
      )}

      {message && <p style={{marginTop:16}}>{message}</p>}
    </section>
  );
}
