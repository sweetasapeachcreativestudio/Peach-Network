"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PeachBrand, PoweredBy } from "../../components/brand";

export default function CreativeApply() {
  const router = useRouter();
  const [specialty, setSpecialty] = useState("Graphic Design");
  const [experience, setExperience] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [tools, setTools] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("AL");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitApplication() {
    setBusy(true); setMessage("");
    try {
      if (!portfolioUrl.trim()) throw new Error("Add a portfolio link so Peach can review your work.");
      if (!experience.trim()) throw new Error("Tell Peach a little about your experience.");
      const res = await fetch("/api/creative/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialty, experience, portfolioUrl, tools, city, state }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit your application.");
      router.push("/creative/status");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not submit your application.");
    } finally { setBusy(false); }
  }

  return <main className="shell" style={{maxWidth:920}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}><PeachBrand full/><Link href="/account" className="text-link">Account</Link></div>
    <div className="builder-heading"><span className="eyebrow">CREATIVE APPLICATION</span><h1>Show Peach what you do best.</h1><p>This is how Peach learns your specialty, reviews your work and assigns your starting Peach level.</p></div>
    <section className="card" style={{display:"grid",gap:10}}>
      <div className="grid grid-2">
        <label><strong>Primary specialty</strong><select className="field" value={specialty} onChange={e=>setSpecialty(e.target.value)}><option>Graphic Design</option><option>Web Design</option><option>Video Editing</option><option>Animation / Motion</option><option>Photography</option><option>Illustration</option></select></label>
        <label><strong>Portfolio URL</strong><input className="field" value={portfolioUrl} onChange={e=>setPortfolioUrl(e.target.value)} placeholder="https://yourportfolio.com"/></label>
      </div>
      <label><strong>Your experience</strong><textarea className="field" value={experience} onChange={e=>setExperience(e.target.value)} placeholder="What kind of work do you do? What kinds of clients or projects have you worked on?"/></label>
      <label><strong>Software / equipment</strong><input className="field" value={tools} onChange={e=>setTools(e.target.value)} placeholder="Adobe Creative Cloud, Figma, camera kit, editing setup…"/></label>
      <div className="grid grid-2"><label><strong>City</strong><input className="field" value={city} onChange={e=>setCity(e.target.value)} placeholder="Birmingham"/></label><label><strong>State</strong><input className="field" value={state} onChange={e=>setState(e.target.value)} placeholder="AL"/></label></div>
      <div className="auth-message"><strong>Peach assigns the level.</strong><br/>Seed, Sapling, Tree, Blossom or Root is based on portfolio strength, experience and reliability — creatives do not self-select.</div>
      <button className="btn btn-primary btn-large" onClick={submitApplication} disabled={busy}>{busy?"Submitting…":"Submit to Peach Review"}</button>
      {message&&<div className="auth-message">{message}</div>}
    </section>
    <div style={{marginTop:20}}><PoweredBy/></div>
  </main>;
}
