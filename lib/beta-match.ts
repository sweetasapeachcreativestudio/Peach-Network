export type DemoCreative = {
  id:string; name:string; peach_level:string; headline:string; city?:string|null; state?:string|null;
  remote_available:boolean; specialties:string[]; tools:string[]; industries:string[]; bio?:string|null;
  portfolio_highlights:string[]; certifications:string[]; education?:string|null; mentor_name?:string|null;
  reliability_score:number|string; available_for_projects:boolean; demo_only:boolean;
};

const STOP=new Set(["the","and","for","with","that","this","need","want","from","have","make","create","please","someone","designer","creative","project","my","our","a","an","to","of","in","on","is","it"]);
const SYNONYMS:Record<string,string[]>={
  website:["web","website","wix","shopify","landing","homepage","ux","ecommerce"],
  sports:["sports","basketball","football","athlete","tournament","game","team"],
  flyer:["flyer","poster","event","announcement","promo"],
  video:["video","reel","reels","edit","editing","motion","tiktok","instagram"],
  brand:["brand","branding","logo","identity","campaign"],
  photo:["photo","photography","photoshoot","product","portrait"],
  social:["social","instagram","facebook","post","carousel","content"],
};

function tokens(text:string){return [...new Set(text.toLowerCase().replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(t=>t.length>2&&!STOP.has(t)))];}
function expanded(text:string){const base=tokens(text); const out=new Set(base); for(const t of base){for(const [k,vals] of Object.entries(SYNONYMS)){if(t===k||vals.includes(t)){out.add(k);vals.forEach(v=>out.add(v));}}} return [...out];}

export function rankDemoCreatives(projectText:string, creatives:DemoCreative[]){
 const wants=expanded(projectText);
 return creatives.filter(c=>c.available_for_projects).map(c=>{
   const corpus=[c.headline,c.bio??"",...(c.specialties??[]),...(c.tools??[]),...(c.industries??[]),...(c.portfolio_highlights??[]),...(c.certifications??[])].join(" ").toLowerCase();
   const hits=wants.filter(t=>corpus.includes(t));
   const specialtyHits=(c.specialties??[]).filter(s=>wants.some(t=>s.toLowerCase().includes(t)||t.includes(s.toLowerCase())));
   const portfolioHits=(c.portfolio_highlights??[]).filter(s=>wants.some(t=>s.toLowerCase().includes(t)));
   const beginnerBoost=["seed","sapling"].includes(c.peach_level)?5:0;
   const reliability=Math.min(8,Math.max(0,(Number(c.reliability_score)-90)*0.8));
   const raw=52+Math.min(25,hits.length*5)+Math.min(10,specialtyHits.length*5)+Math.min(6,portfolioHits.length*3)+beginnerBoost+reliability;
   const score=Math.max(58,Math.min(98,Math.round(raw)));
   const reasonParts=[] as string[];
   if(specialtyHits[0]) reasonParts.push(`specializes in ${specialtyHits[0]}`);
   if(portfolioHits[0]) reasonParts.push(`has relevant work like “${portfolioHits[0]}”`);
   if(["seed","sapling"].includes(c.peach_level)) reasonParts.push("is a vetted rising Peach with strong fit");
   if(c.certifications?.length) reasonParts.push(`has Peach training`);
   const reason=reasonParts.length?`Peach matched this creative because they ${reasonParts.slice(0,3).join(", ")}.`:`Peach matched this creative based on specialty, portfolio relevance, availability and reliability.`;
   return {...c,score,reason,hits:hits.slice(0,6)};
 }).sort((a,b)=>b.score-a.score).slice(0,3);
}
