"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SERVICE_GUIDE } from "@/lib/project-pricing";
import { CameraIcon, GlobeIcon, PaletteIcon, PenIcon, SparkIcon, VideoIcon } from "../../components/icons";

type ServiceKey = keyof typeof SERVICE_GUIDE;

type CategoryKey = "design" | "web" | "brand" | "video" | "photo" | "not_sure";

const CATEGORY_META: Record<CategoryKey, { label: string; icon: ReactNode; keys: ServiceKey[] }> = {
  design: { label: "Design", icon: <PenIcon />, keys: ["social_graphic","flyer","business_card","banner","carousel","newsletter","brochure","presentation"] },
  web: { label: "Website", icon: <GlobeIcon />, keys: ["small_web_update","landing_page","homepage_refresh","multipage_refresh"] },
  brand: { label: "Brand & Illustration", icon: <PaletteIcon />, keys: ["logo_refresh","new_logo","illustration"] },
  video: { label: "Video & Motion", icon: <VideoIcon />, keys: ["simple_reel","advanced_video","motion_graphic","logo_animation","promo_video"] },
  photo: { label: "Photography", icon: <CameraIcon />, keys: ["mini_photo","brand_photo"] },
  not_sure: { label: "Not Sure Yet", icon: <SparkIcon />, keys: [] },
};

export default function ProjectBuilder({ availableCoins }: { availableCoins: number }) {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryKey>("design");
  const [serviceKey, setServiceKey] = useState<ServiceKey>("flyer");
  const [complexity, setComplexity] = useState<"standard"|"expanded">("standard");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [revisions, setRevisions] = useState(2);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  const service = SERVICE_GUIDE[serviceKey];
  const estimate = useMemo(() => complexity === "expanded" ? service.max : service.min, [service, complexity]);
  const isRange = service.min !== service.max;
  const canAfford = availableCoins >= estimate;

  function selectCategory(next: CategoryKey) {
    setCategory(next);
    if (next !== "not_sure" && CATEGORY_META[next].keys.length) {
      setServiceKey(CATEGORY_META[next].keys[0]);
    }
  }

  async function submit() {
    setBusy(true); setFeedback("");
    try {
      if (!title.trim()) throw new Error("Give your project a short name.");
      if (!description.trim()) throw new Error("Tell Peach a little about what you need.");
      if (category === "not_sure") throw new Error("Choose the closest project category for now. You can explain the rest in the project details.");

      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceKey,
          complexity,
          title: title.trim(),
          description: description.trim(),
          category: CATEGORY_META[category].label,
          dueAt: deadline ? new Date(`${deadline}T17:00:00`).toISOString() : null,
          revisionRounds: revisions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "We could not create the project.");
      router.push(`/projects/${data.project.id}?created=1`);
      router.refresh();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setBusy(false); }
  }

  return <div className="project-builder">
    <div className="builder-layout">
      <div className="builder-form">
        <section className="builder-block">
          <h2>1. What are we making?</h2>
          <p>Pick the closest category. Peach uses this to guide the scope and match.</p>
          <div className="category-grid">
            {(Object.entries(CATEGORY_META) as [CategoryKey, typeof CATEGORY_META[CategoryKey]][]).map(([key, item]) => <button type="button" key={key} className={`category-button ${category === key ? "active" : ""}`} onClick={() => selectCategory(key)}>{item.icon}<strong>{item.label}</strong></button>)}
          </div>

          {category !== "not_sure" && <div className="service-grid">
            {CATEGORY_META[category].keys.map((key) => {
              const item = SERVICE_GUIDE[key];
              return <button type="button" className={`service-button ${serviceKey === key ? "active" : ""}`} key={key} onClick={() => setServiceKey(key)}><span>{item.label}</span><span>{item.min === item.max ? `${item.min} coin${item.min === 1 ? "" : "s"}` : `${item.min}–${item.max} coins`}</span></button>;
            })}
          </div>}
        </section>

        <section className="builder-block">
          <h2>2. Tell Peach about it.</h2>
          <p>Enough detail for a creative to understand the job — no giant brief required.</p>
          <label><strong>Project name</strong><input className="field" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Example: Fall Menu Flyer" /></label>
          <label><strong>What do you need?</strong><textarea className="field" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Example: I need a fall menu flyer for Facebook and print. I already have the menu copy and logo." /></label>
          <label><strong>How involved is this project?</strong>
            <select className="field" value={complexity} onChange={e=>setComplexity(e.target.value as "standard"|"expanded")}>
              <option value="standard">Standard — straightforward scope</option>
              <option value="expanded">Expanded — more content, detail or complexity</option>
            </select>
          </label>
        </section>

        <section className="builder-block">
          <h2>3. Timing & revisions.</h2>
          <p>Peach will use these details when sending the opportunity to a matched creative.</p>
          <div className="grid grid-2">
            <label><strong>Ideal deadline</strong><input className="field" type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} /></label>
            <label><strong>Revision rounds</strong><select className="field" value={revisions} onChange={e=>setRevisions(Number(e.target.value))}><option value={1}>1 round</option><option value={2}>2 rounds</option><option value={3}>3 rounds</option></select></label>
          </div>
        </section>
      </div>

      <aside className="coin-summary">
        <small>LIVE PEACH ESTIMATE</small>
        <div className="coin-number">{estimate}</div>
        <strong>Peach Coin{estimate === 1 ? "" : "s"}</strong>
        <p>{service.label}{isRange ? ` normally falls between ${service.min}–${service.max} coins.` : " has a set starting coin value."}</p>
        <hr/>
        <div className="summary-line"><span>Your wallet</span><strong>{availableCoins} coins</strong></div>
        <div className="summary-line"><span>After estimated hold</span><strong>{Math.max(0,availableCoins-estimate)} coins</strong></div>
        <div className="summary-line"><span>Revisions</span><strong>{revisions} round{revisions===1?"":"s"}</strong></div>
        {!canAfford && <div className="review-banner">You can still save the request, but you’ll need more Peach Coins before a project can be fully committed.</div>}
        <button type="button" className="btn btn-soft btn-large" style={{width:"100%",marginTop:16}} onClick={submit} disabled={busy}>{busy ? "Creating…" : "Find My Creative →"}</button>
        {feedback && <div className="submit-feedback" role="status">{feedback}</div>}
      </aside>
    </div>
  </div>;
}
