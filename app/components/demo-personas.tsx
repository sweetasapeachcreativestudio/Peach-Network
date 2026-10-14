"use client";

import { useState } from "react";

type PersonaId = "maya" | "jordan" | "alex";
type Mode = "guided" | "live";

const personas: {
  id: PersonaId;
  name: string;
  role: string;
  business: string;
  specialty: string;
  initials: string;
  accent: string;
  prompt: string;
  result: string;
}[] = [
  {
    id: "maya",
    name: "Maya Brooks",
    role: "Website Designer",
    business: "Bloom & Root Plant Shop",
    specialty: "Website structure, page planning, and web content",
    initials: "MB",
    accent: "sage",
    prompt: "I need a welcoming website for Bloom & Root Plant Shop. We sell houseplants, beginner plant kits, and offer plant-care consultations. Most customers are new plant owners.",
    result: "PROJECT BRIEF — BLOOM & ROOT\n\nGoal: Help new plant owners discover products and book consultations.\nSuggested pages: Home, Shop, Plant-Care Consultations, About, FAQ, Contact.\nVisual direction: Natural greens, warm cream, clear product photography, friendly headings, and simple navigation.\nUseful next questions: Will customers check out online? What platform will the shop use? Are consultation bookings already managed by a tool?\nNext step: Confirm the sitemap and required features before design begins.",
  },
  {
    id: "jordan",
    name: "Jordan Ellis",
    role: "Graphic Designer",
    business: "Fresh Press Juice Bar",
    specialty: "Campaign graphics, flyers, and social content",
    initials: "JE",
    accent: "orange",
    prompt: "Fresh Press Juice Bar is launching a strawberry-peach smoothie. We need a flyer and social graphic for young professionals. Make it feel fresh, energetic, and easy to read.",
    result: "CAMPAIGN BRIEF — FRESH PRESS\n\nGoal: Promote the new strawberry-peach smoothie and encourage in-store orders.\nDeliverables: One promotional flyer and one social graphic adapted to the selected platform.\nVisual direction: Juicy fruit photography, bold headline, peach and berry accents, strong contrast, and a clear call to action.\nContent to confirm: Price, launch date, store address, offer details, and social dimensions.\nNext step: Gather the logo and brand colors, then prepare a first concept for review.",
  },
  {
    id: "alex",
    name: "Alex Morgan",
    role: "Logo Designer",
    business: "Golden Hour Candle Co.",
    specialty: "Logo briefs, brand personality, and identity direction",
    initials: "AM",
    accent: "gold",
    prompt: "I'm starting Golden Hour Candle Co. and need a logo. I want the brand to feel warm, premium, calm, and handcrafted without looking too fancy or generic.",
    result: "LOGO DESIGN BRIEF — GOLDEN HOUR\n\nBrand personality: Warm, premium, calm, and handcrafted.\nAudience: People shopping for home fragrance and thoughtful gifts.\nCreative directions to explore: A refined wordmark, a simple sun or glow-inspired symbol, and a compact mark for candle labels.\nInitial palette: Amber, warm ivory, and deep brown; check contrast on labels and packaging.\nAvoid: Overly detailed flames, generic stock symbols, and thin details that disappear at small sizes.\nNext step: Confirm business name styling, intended uses, and preferred direction before sketching concepts.",
  },
];

export function DemoPersonas() {
  const [selected, setSelected] = useState<PersonaId>("maya");
  const [mode, setMode] = useState<Mode>("guided");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const persona = personas.find((item) => item.id === selected) ?? personas[0];

  function runGuided(id: PersonaId) {
    const chosen = personas.find((item) => item.id === id) ?? personas[0];
    setSelected(id);
    setMode("guided");
    setPrompt(chosen.prompt);
    setResult(chosen.result);
    setError("");
  }

  async function runLive(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prompt.trim()) {
      setError("Enter a project idea first.");
      return;
    }
    setLoading(true);
    setError("");
    setResult("");
    try {
      const response = await fetch("/api/demo-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId: selected, prompt: prompt.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Peach AI couldn't answer right now.");
      setResult(data.answer);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="pn-demo-section" aria-labelledby="pn-demo-title">
      <div className="pn-demo-heading">
        <div>
          <span className="pn-demo-eyebrow">PEACH NETWORK PLAYGROUND</span>
          <h2 id="pn-demo-title">Meet the demo creatives</h2>
          <p>Explore how Peach AI can turn a business idea into a clearer creative brief. These fictional examples never create real projects or spend Peach Coins.</p>
        </div>
        <span className="pn-demo-pill">DEMO DATA</span>
      </div>

      <div className="pn-demo-cards">
        {personas.map((item) => (
          <article className={`pn-demo-card ${selected === item.id ? "is-selected" : ""}`} key={item.id}>
            <div className={`pn-demo-avatar ${item.accent}`} aria-hidden="true">{item.initials}</div>
            <div className="pn-demo-card-copy">
              <h3>{item.name}</h3>
              <span className="pn-demo-role">{item.role}</span>
              <p className="pn-demo-business">{item.business}</p>
              <p className="pn-demo-specialty">{item.specialty}</p>
            </div>
            <button className="pn-demo-button" type="button" onClick={() => runGuided(item.id)}>Try guided demo <span aria-hidden="true">→</span></button>
          </article>
        ))}
      </div>

      <div className="pn-demo-workspace">
        <div className="pn-demo-workspace-heading">
          <div>
            <span className="pn-demo-eyebrow">TRY IT YOURSELF</span>
            <h3>See Peach AI in action</h3>
          </div>
          <div className="pn-demo-mode-switch" role="group" aria-label="Demo mode">
            <button type="button" className={mode === "guided" ? "active" : ""} onClick={() => { setMode("guided"); setError(""); }}>Guided demo</button>
            <button type="button" className={mode === "live" ? "active" : ""} onClick={() => { setMode("live"); setResult(""); setError(""); }}>Live AI</button>
          </div>
        </div>

        <div className="pn-demo-selected">
          <span className={`pn-demo-avatar small ${persona.accent}`} aria-hidden="true">{persona.initials}</span>
          <div><strong>{persona.name}</strong><span>{persona.role} · {persona.business}</span></div>
          <label className="pn-demo-select-label">Persona
            <select value={selected} onChange={(event) => { setSelected(event.target.value as PersonaId); setResult(""); setError(""); }}>
              {personas.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
          </label>
        </div>

        {mode === "guided" ? (
          <div className="pn-demo-guided">
            <div className="pn-demo-prompt-label">SAMPLE CLIENT REQUEST</div>
            <p className="pn-demo-prompt">{persona.prompt}</p>
            <button type="button" className="pn-demo-primary" onClick={() => runGuided(selected)}>Generate sample brief <span aria-hidden="true">✦</span></button>
          </div>
        ) : (
          <form className="pn-demo-live-form" onSubmit={runLive}>
            <label htmlFor="pn-demo-live-prompt">Describe what the client needs</label>
            <textarea id="pn-demo-live-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={1200} placeholder={`Example: ${persona.prompt}`} rows={3} />
            <div className="pn-demo-form-footer"><span>{prompt.length}/1200 characters · Demo only</span><button className="pn-demo-primary" type="submit" disabled={loading}>{loading ? "Thinking…" : "Ask Peach AI"} <span aria-hidden="true">✦</span></button></div>
          </form>
        )}

        {error && <div className="pn-demo-error" role="alert">{error}</div>}
        {result && <div className="pn-demo-result" aria-live="polite"><div className="pn-demo-result-title"><span aria-hidden="true">🍑</span><div><strong>{mode === "guided" ? "Prepared example result" : "Peach AI response"}</strong><span>{mode === "guided" ? "A sample to help explain the workflow" : "Generated from your prompt"}</span></div></div><pre>{result}</pre><span className="pn-demo-disclaimer">Fictional demo content. Review AI suggestions before using them in real client work.</span></div>}
      </div>
    </section>
  );
}
