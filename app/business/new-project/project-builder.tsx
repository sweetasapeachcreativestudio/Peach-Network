"use client";
import {useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {SERVICE_GUIDE} from "@/lib/project-pricing";

type ServiceKey=keyof typeof SERVICE_GUIDE;
type Step="idea"|"format"|"style"|"details"|"timing"|"review";

function inferService(text:string):ServiceKey{
 const q=text.toLowerCase();
 if(q.includes("flyer")||q.includes("poster"))return "flyer";
 if(q.includes("logo"))return q.includes("refresh")?"logo_refresh":"new_logo";
 if(q.includes("landing"))return "landing_page";
 if(q.includes("website")||q.includes("web"))return "small_web_update";
 if(q.includes("reel"))return "simple_reel";
 if(q.includes("video"))return "promo_video";
 if(q.includes("photo"))return "mini_photo";
 if(q.includes("brochure"))return "brochure";
 if(q.includes("presentation")||q.includes("pitch deck"))return "presentation";
 if(q.includes("social"))return "social_graphic";
 return "social_graphic";
}
function categoryFor(k:ServiceKey){if(String(k).includes("web")||k==="landing_page"||k==="homepage_refresh"||k==="multipage_refresh")return"Website";if(String(k).includes("video")||String(k).includes("reel")||String(k).includes("motion")||String(k).includes("animation"))return"Video & Motion";if(String(k).includes("photo"))return"Photography";if(String(k).includes("logo")||k==="illustration")return"Brand & Illustration";return"Design"}

export default function ProjectBuilder({availableCoins}:{availableCoins:number}){
 const router=useRouter(); const[matching,setMatching]=useState(false); const[step,setStep]=useState<Step>("idea"); const[idea,setIdea]=useState(""); const[serviceKey,setServiceKey]=useState<ServiceKey>("flyer"); const[format,setFormat]=useState(""); const[style,setStyle]=useState(""); const[details,setDetails]=useState(""); const[deadline,setDeadline]=useState(""); const[busy,setBusy]=useState(false); const[msg,setMsg]=useState("");
 const service=SERVICE_GUIDE[serviceKey]; const estimate=service.min; const progress={idea:16,format:34,style:52,details:70,timing:86,review:100}[step];
 function begin(){if(!idea.trim()){setMsg("Tell Peach what you need first.");return}setServiceKey(inferService(idea));setMsg("");setStep("format")}
 async function submit(){setBusy(true);setMatching(true);setMsg("");try{const title=idea.trim().split(/[.!?]/)[0].slice(0,72)||service.label;const description=[idea,format&&`Format: ${format}`,style&&`Style: ${style}`,details&&`Details to print/use: ${details}`].filter(Boolean).join("\n\n");const r=await fetch("/api/projects/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({serviceKey,complexity:"standard",title,description,category:categoryFor(serviceKey),dueAt:deadline?new Date(`${deadline}T17:00:00`).toISOString():null,revisionRounds:2})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not create project.");await fetch("/api/projects/ai-match",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:d.project.id})});router.push(`/business/matches?project=${d.project.id}`);router.refresh()}catch(e){setMsg(e instanceof Error?e.message:"Something went wrong.");setMatching(false)}finally{setBusy(false)}}
 const summary=useMemo(()=>[{k:"Project",v:service.label},{k:"Format",v:format||"—"},{k:"Style",v:style||"—"},{k:"Deadline",v:deadline?new Date(deadline+"T12:00:00").toLocaleDateString():"Flexible"},{k:"Estimate",v:`${estimate} Peach Coin${estimate===1?"":"s"}`}],[service,format,style,deadline,estimate]);
 return <>{matching&&<div className="pn-match-overlay"><div className="pn-match-loader"><div className="pn-peach-pulse">🍑</div><h2>Finding your perfect matches…</h2><p>Peach is comparing your brief with available creatives, specialties, experience and fit.</p><div className="pn-search-dots"><i/><i/><i/></div></div></div>}<div className="pn-ai-builder">
  <section className="pn-ai-conversation">
   <div className="pn-ai-progress"><span style={{width:`${progress}%`}}/></div>
   <div className="pn-ai-person"><b>🍑</b><div><strong>Peach AI</strong><small>60-second project setup</small></div></div>
   {step==="idea"&&<div className="pn-ai-step"><h2>What are we creating today?</h2><p>Just tell me normally. You don't need to know design terminology.</p><textarea className="field" autoFocus value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Example: I need a flyer for my restaurant's grand opening next Saturday."/><button className="btn btn-primary btn-large" onClick={begin}>That’s it →</button></div>}
   {step==="format"&&<div className="pn-ai-step"><h2>Got it. Where will people see it?</h2><p>I think this is closest to <strong>{service.label}</strong>. Pick the main format.</p><div className="pn-choice-grid">{["Instagram / Social","Print","Both print + social","Website / Digital","Not sure"].map(x=><button className={format===x?"active":""} onClick={()=>{setFormat(x);setStep("style")}} key={x}>{x}</button>)}</div></div>}
   {step==="style"&&<div className="pn-ai-step"><h2>What should it feel like?</h2><p>This helps me find creatives whose work actually fits your project.</p><div className="pn-choice-grid">{["Bold + Fun","Clean + Modern","Luxury","Southern / Homegrown","Professional","I'll describe it"].map(x=><button key={x} className={style===x?"active":""} onClick={()=>{setStyle(x);setStep("details")}}>{x}</button>)}</div></div>}
   {step==="details"&&<div className="pn-ai-step"><h2>What absolutely needs to be on it?</h2><p>Put names, dates, address, phone, prices, wording, QR instructions or anything the creative must use here.</p><textarea className="field" value={details} onChange={e=>setDetails(e.target.value)} placeholder="Grand opening October 12 · 123 Main St · 205-555-0123…"/><button className="btn btn-primary btn-large" onClick={()=>setStep("timing")}>Continue →</button></div>}
   {step==="timing"&&<div className="pn-ai-step"><h2>When do you need it?</h2><p>If there's no hard deadline, you can leave this blank.</p><input className="field" type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}/><button className="btn btn-primary btn-large" onClick={()=>setStep("review")}>Build my brief →</button></div>}
   {step==="review"&&<div className="pn-ai-step"><span className="eyebrow">PEACH BUILT YOUR BRIEF</span><h2>Ready to find your Peach?</h2><p>I have enough to post this project and look for three creatives who fit the work.</p><button className="btn btn-primary btn-large" onClick={submit} disabled={busy}>{busy?"Posting + matching…":"Post Project & Find My Matches →"}</button></div>}
   {msg&&<div className="submit-feedback">{msg}</div>}
  </section>
  <aside className="pn-ai-brief"><small>LIVE PROJECT BRIEF</small><h3>{idea.trim()?idea.trim().slice(0,55):"Your project"}</h3>{summary.map(x=><div className="summary-line" key={x.k}><span>{x.k}</span><strong>{x.v}</strong></div>)}<hr/><div className="pn-ai-wallet"><span>Your wallet</span><b>{availableCoins} coins</b></div><p>Peach will show scope, payout and deadline to matched creatives before they accept.</p></aside>
 </div></>
}}