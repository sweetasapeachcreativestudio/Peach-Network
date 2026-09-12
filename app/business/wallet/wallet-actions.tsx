"use client";

import { useState } from "react";

export default function WalletActions() {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function checkout(kind: "membership" | "pack", key: string) {
    setBusy(`${kind}:${key}`);
    setMessage("");

    const response = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, key })
    });

    const body = await response.json();
    setBusy(null);

    if (!response.ok) {
      setMessage(body.error ?? "Could not start checkout.");
      return;
    }

    window.location.href = body.url;
  }

  return (
    <>
      <section className="card" style={{marginTop:18}}>
        <p className="muted">MEMBERSHIPS</p>
        <div className="grid grid-3">
          <div className="card">
            <h3>Essentials</h3>
            <div className="big">$499</div>
            <p>5 coins / month · cap 7</p>
            <button className="btn btn-primary" onClick={() => checkout("membership","essentials")} disabled={!!busy}>
              {busy === "membership:essentials" ? "Opening..." : "Choose Essentials"}
            </button>
          </div>
          <div className="card">
            <span className="pill">MOST POPULAR</span>
            <h3>Growth</h3>
            <div className="big">$1,099</div>
            <p>10 coins / month · cap 14</p>
            <button className="btn btn-primary" onClick={() => checkout("membership","growth")} disabled={!!busy}>
              {busy === "membership:growth" ? "Opening..." : "Choose Growth"}
            </button>
          </div>
          <div className="card">
            <h3>Partner</h3>
            <div className="big">$2,199</div>
            <p>20 coins / month · cap 28</p>
            <button className="btn btn-primary" onClick={() => checkout("membership","partner")} disabled={!!busy}>
              {busy === "membership:partner" ? "Opening..." : "Choose Partner"}
            </button>
          </div>
        </div>
      </section>

      <section className="card" style={{marginTop:18}}>
        <p className="muted">PEACH PACKS · NO MEMBERSHIP REQUIRED</p>
        <div className="grid grid-3">
          <button className="btn btn-outline" onClick={() => checkout("pack","pack3")} disabled={!!busy}>3 Coins · $425</button>
          <button className="btn btn-outline" onClick={() => checkout("pack","pack5")} disabled={!!busy}>5 Coins · $675</button>
          <button className="btn btn-outline" onClick={() => checkout("pack","pack10")} disabled={!!busy}>10 Coins · $1,250</button>
        </div>
        <p className="muted" style={{fontSize:13,marginTop:12}}>
          Tax, when applicable, is calculated separately at checkout. Peach Coins are service credits, not cash.
        </p>
      </section>

      {message && <div className="card" style={{marginTop:18}}>{message}</div>}
    </>
  );
}
