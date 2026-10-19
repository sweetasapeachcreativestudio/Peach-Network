"use client";
import {useEffect,useState} from "react";

export default function PayoutStatusCard(){
  const [data,setData]=useState<any>(null);
  useEffect(()=>{fetch("/api/stripe/connect-status").then(r=>r.json()).then(setData)},[]);
  const label=!data?"Checking…":data.status==="ready"?"Ready to Receive Payments":data.status==="not_started"?"Not Started":data.status==="restricted"?"Action Required":"Information Needed";
  return <div className="card" style={{marginBottom:18}}>
    <p className="muted">PAYOUT SETUP</p>
    <div className="big">{label}</div>
    {data?.ready && <p>✓ Your Stripe payout account is ready.</p>}
    {data?.currentlyDue?.length>0 && <p className="muted">Stripe still needs additional information before payouts can be enabled.</p>}
  </div>
}
