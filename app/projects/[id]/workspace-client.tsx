"use client";
import { useState } from "react";

export default function WorkspaceClient({projectId,role,status}:{projectId:string;role:"business"|"creative"|"admin";status:string}){
  const [message,setMessage]=useState("");
  const [note,setNote]=useState("");
  const [stage,setStage]=useState("designing");
  const [progress,setProgress]=useState(55);
  const [feedback,setFeedback]=useState("");
  const [busy,setBusy]=useState(false);

  async function post(url:string,body:Record<string,unknown>){
    setBusy(true);setFeedback("");
    try{
      const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data=await r.json();
      if(!r.ok)throw new Error(data.error??"Something went wrong.");
      window.location.reload();
    }catch(err){setFeedback(err instanceof Error?err.message:"Something went wrong.");setBusy(false)}
  }

  async function send(){
    if(!message.trim())return;
    await post("/api/projects/messages",{projectId,body:message.trim()});
  }

  return <>
    <div className="chat-compose"><input className="field" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Message your Peach project team…" onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}}/><button className="btn btn-primary" disabled={busy||!message.trim()} onClick={send}>Send</button></div>
    {feedback&&<div className="auth-message" style={{margin:14}}>{feedback}</div>}

    {role==="creative"&&!["completed","cancelled"].includes(status)&&<div className="action-card" style={{margin:14}}><span className="eyebrow">PEACH CHECK-IN</span><h3>Show the work moving.</h3><p>Update the stage and add a short note. The business will see it in the progress history.</p><select className="field" value={stage} onChange={e=>{const v=e.target.value;setStage(v);setProgress(v==="concept"?30:v==="designing"?55:v==="proof_ready"?80:100)}}><option value="concept">Concept / research · 30%</option><option value="designing">Creating · 55%</option><option value="proof_ready">Proof ready · 80%</option><option value="final_delivery">Final delivery · 100%</option></select><textarea className="field" value={note} onChange={e=>setNote(e.target.value)} placeholder="What did you complete? What should the client know?"/><button className="btn btn-soft" disabled={busy||!note.trim()} onClick={()=>post("/api/projects/check-in",{projectId,stage,progress,note})}>Submit Check-In</button></div>}

    {role==="business"&&status==="submitted"&&<div className="action-card" style={{margin:14}}><span className="eyebrow">FINAL DELIVERY</span><h3>Ready to approve?</h3><p>Approval closes the creative work stage and moves the project toward completion.</p><button className="btn btn-soft" disabled={busy} onClick={()=>post("/api/projects/approve",{projectId})}>Approve Final Delivery</button></div>}
  </>;
}
