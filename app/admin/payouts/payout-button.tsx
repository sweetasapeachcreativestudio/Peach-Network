"use client";
import {useState} from "react";
export default function PayoutButton({payoutId}:{payoutId:string}){
 const [msg,setMsg]=useState("");
 async function pay(){setMsg("Checking payout account…");const r=await fetch("/api/admin/payouts/execute",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({payoutId})});const b=await r.json();setMsg(r.ok?"Payment sent through Stripe Connect.":b.error??"Payment failed.");if(r.ok)setTimeout(()=>location.reload(),800)}
 return <><button className="btn btn-primary" onClick={pay}>Send Payout</button>{msg&&<p className="muted">{msg}</p>}</>;
}
