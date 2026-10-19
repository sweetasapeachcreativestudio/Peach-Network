"use client";
import {useState} from "react";
export default function ResolutionClient({disputeId,maxCoins}:{disputeId:string;maxCoins:number}){
  const [type,setType]=useState("full_refund"),[coins,setCoins]=useState(maxCoins),[payout,setPayout]=useState("0"),[note,setNote]=useState(""),[msg,setMsg]=useState("");
  async function resolve(){
    const r=await fetch("/api/admin/disputes/resolve",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      disputeId,resolutionType:type,coinsReturned:Number(coins),payoutCents:Math.round(Number(payout)*100),note
    })});
    const b=await r.json();setMsg(r.ok?"Resolution saved.":b.error??"Could not resolve.");
    if(r.ok)setTimeout(()=>location.href="/admin/disputes",700);
  }
  return <section className="card" style={{marginTop:16}}>
    <h2>Peach Resolution</h2>
    <select className="field" value={type} onChange={e=>setType(e.target.value)}>
      <option value="full_refund">Full coin return</option><option value="partial_refund">Partial coin return</option>
      <option value="creative_paid">Creative paid / no coin return</option><option value="split">Split resolution</option>
      <option value="continue">Continue project</option>
    </select>
    <label><strong>Coins returned to business</strong><input className="field" type="number" min="0" max={maxCoins} value={coins} onChange={e=>setCoins(Number(e.target.value))}/></label>
    <label><strong>Creative cash awarded</strong><input className="field" inputMode="decimal" value={payout} onChange={e=>setPayout(e.target.value)}/></label>
    <label><strong>Internal resolution note</strong><textarea className="field" rows={4} value={note} onChange={e=>setNote(e.target.value)}/></label>
    <button className="btn btn-primary" onClick={resolve}>Lock Resolution</button>{msg&&<p>{msg}</p>}
  </section>
}
