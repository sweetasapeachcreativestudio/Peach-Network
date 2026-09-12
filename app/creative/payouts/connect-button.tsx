"use client";

import { useState } from "react";

export default function ConnectButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function connect() {
    setBusy(true);
    setMessage("");

    const response = await fetch("/api/stripe/connect-onboarding", {
      method: "POST"
    });

    const body = await response.json();
    setBusy(false);

    if (!response.ok) {
      setMessage(body.error ?? "Could not open payout setup.");
      return;
    }

    window.location.href = body.url;
  }

  return (
    <>
      <button className="btn btn-primary" onClick={connect} disabled={busy}>
        {busy ? "Opening Stripe..." : "Set Up Bank Payouts"}
      </button>
      {message && <p>{message}</p>}
    </>
  );
}
