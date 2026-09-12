"use client";
import { useEffect, useState } from "react";

type Match={id:string;name:string;peach_level:string;headline:string;city?:string;state?:string;specialties:string[];portfolio_highlights:string[];certifications:string[];mentor_name?:string;score:number;reason:string;demo_only:boolean};

const DEMO_FACES=["/people/maya.jpg","/people/elijah.jpg","/people/sophie.jpg","/people/darius.jpg"];

export default function MatchShortlist({projectId}:{projectId:string}){
 const [matches,setMatches]=useState<Match[]>([]); const [mode,setMode]=useState(""); const [busy,setBusy]=useState(true); const [error,setError]=useState("");
 async function run(){setBusy(true);setError("");try{const r=await fetch("/api/projects/ai-match",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId})});const d=await r.json();if(!r.ok)throw new Error(d.error??"Peach Match could not run.");setMatches(d.matches??[]);setMode(d.mode??"smart-beta");}catch(e){setError(e instanceof Error?e.message:"Peach Match could not run.");}finally{setBusy(false)}}
 useEffect(()=>{run()},[projectId]);
 return <section className="match-lab card">
   <div className="match-lab-head"><div><span className="eyebrow">PEACH MATCH · BETA</span><h2>Your curated creative shortlist.</h2><p>Peach reads the project, then weighs specialty, portfolio relevance, training, availability and reliability. Experience level is not allowed to bury promising beginners.</p></div><button className="btn btn-outline btn-small" onClick={run} disabled={busy}>{busy?"Matching…":"Run Match Again"}</button></div>
   {busy&&<div className="ai-thinking"><div className="match-bars"><i/><i/><i/></div><strong>Peach is reading your project…</strong><span>Comparing fit without opening a public bidding pool.</span></div>}
   {error&&<div className="auth-message">{error}</div>}
   {!busy&&matches.length>0&&<><div className="match-mode-note">{mode==="ai"?"AI-assisted ranking is active.":"Peach Smart Match is active while live AI ranking is in beta setup."} Demo profiles are clearly marked and cannot receive paid work.</div><div className="match-results">{matches.map((m,index)=><article className={`match-result ${index===0?"top-match":""}`} key={m.id}>
     <div className="match-score"><strong>{m.score}%</strong><span>match</span></div>
     <div className="match-person"><div className="demo-avatar human">{m.demo_only?<img src={DEMO_FACES[index%DEMO_FACES.length]} alt=""/>:m.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</div><div><div className="match-name-line"><h3>{m.name}</h3>{m.demo_only&&<span className="demo-badge">DEMO</span>}</div><p>{m.headline}</p><small>{m.city}{m.state?`, ${m.state}`:""} · Peach {m.peach_level}</small></div></div>
     <div className="match-tags">{m.specialties.slice(0,3).map(s=><span key={s}>{s}</span>)}</div>
     <p className="match-reason">{m.reason}</p>
     {m.portfolio_highlights?.[0]&&<div className="portfolio-peek"><strong>Relevant work</strong><span>{m.portfolio_highlights.slice(0,2).join(" · ")}</span></div>}
     {m.mentor_name&&<small className="mentor-note">Mentored by {m.mentor_name}</small>}
   </article>)}</div></>}
 </section>
}
