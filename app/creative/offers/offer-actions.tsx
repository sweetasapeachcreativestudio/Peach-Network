"use client";

import { useState } from "react";

export default function OfferActions({ offerId, payoutCents }: { offerId:string; payoutCents:number }) {
  const [showCounter,setShowCounter]=useState(false);
  const [counter,setCounter]=useState((payoutCents/100).toFixed(2));
  const [reason,setReason]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  async function respond(action:"accept"|"decline"|"counter"){
    setBusy(true); setMessage("");
    const r=await fetch("/api/offers/respond",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        offerId,action,
        counterPayoutCents:action==="counter"?Math.round(Number(counter)*100):undefined,
        counterReason:action==="counter"?reason:undefined
      })
    });
    const body=await r.json();
    setBusy(false);
    if(!r.ok) return setMessage(body.error??"Could not respond.");

    if(action==="accept") {
      window.location.href="/creative";
      return;
    }
    setMessage(action==="decline"?"Offer declined.":"Counteroffer sent to Peach.");
  }

  return <div>
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      <button className="btn btn-primary" onClick={()=>respond("accept")} disabled={busy}>Accept ${(payoutCents/100).toFixed(2)}</button>
      <button className="btn btn-outline" onClick={()=>setShowCounter(!showCounter)} disabled={busy}>Counter Offer</button>
      <button className="btn btn-outline" onClick={()=>respond("decline")} disabled={busy}>Decline</button>
    </div>
    {showCounter && <div className="card" style={{marginTop:12}}>
      <label><strong>Requested payout</strong><input className="field" value={counter} onChange={e=>setCounter(e.target.value)} /></label>
      <label><strong>Why?</strong><textarea className="field" rows={3} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Explain the scope, time, or complexity behind your counter." /></label>
      <button className="btn btn-primary" onClick={()=>respond("counter")} disabled={busy}>Send Counteroffer</button>
      <p className="muted">Peach has up to 72 hours to respond before the current offer expires.</p>
    </div>}
    {message && <p>{message}</p>}
  </div>
}
