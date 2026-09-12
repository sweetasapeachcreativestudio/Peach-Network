import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rankDemoCreatives, type DemoCreative } from "@/lib/beta-match";

function extractOutputText(payload:any){
  if(typeof payload?.output_text==="string") return payload.output_text;
  const chunks:string[]=[];
  for(const item of payload?.output??[]) for(const c of item?.content??[]) if(typeof c?.text==="string") chunks.push(c.text);
  return chunks.join("\n");
}

export async function POST(request:Request){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const {projectId}=await request.json(); const admin=createAdminClient();
 const {data:project}=await admin.from("projects").select("id,title,description,category,business_id,due_at,revision_rounds,coin_amount").eq("id",projectId).single();
 if(!project)return NextResponse.json({error:"Project not found."},{status:404});
 const {data:business}=await admin.from("businesses").select("owner_user_id").eq("id",project.business_id).single();
 const {data:profile}=await admin.from("profiles").select("role").eq("id",user.id).single();
 if(business?.owner_user_id!==user.id&&profile?.role!=="admin")return NextResponse.json({error:"Project owner required."},{status:403});
 const [{data:demos},{data:realRows}]=await Promise.all([admin.from("demo_creatives").select("*").eq("available_for_projects",true),admin.from("creatives").select("id,user_id,primary_specialty,secondary_specialties,tools,industries,city,state,peach_level,bio,education_level,education_detail,portfolio_url,remote_available,mentor_name,reliability_score,available_for_projects").eq("application_status","approved").eq("available_for_projects",true)]);
 const realIds=(realRows??[]).map((c:any)=>c.id); const userIds=(realRows??[]).map((c:any)=>c.user_id);
 const [{data:realNames},{data:realWork},{data:realCerts}]=await Promise.all([userIds.length?admin.from("profiles").select("id,full_name").in("id",userIds):Promise.resolve({data:[]}),realIds.length?admin.from("creative_featured_work").select("creative_id,title,tags").in("creative_id",realIds):Promise.resolve({data:[]}),realIds.length?admin.from("creative_certifications").select("creative_id,title").in("creative_id",realIds):Promise.resolve({data:[]})]);
 const nameMap=new Map((realNames??[]).map((p:any)=>[p.id,p.full_name]));
 const real:DemoCreative[]=(realRows??[]).map((c:any)=>({id:c.id,name:nameMap.get(c.user_id)||"Peach Creative",peach_level:c.peach_level||"seed",headline:c.primary_specialty||"Multidisciplinary Creative",city:c.city,state:c.state,remote_available:c.remote_available!==false,specialties:[c.primary_specialty,...(c.secondary_specialties??[])].filter(Boolean),tools:c.tools??[],industries:c.industries??[],bio:c.bio,portfolio_highlights:(realWork??[]).filter((w:any)=>w.creative_id===c.id).map((w:any)=>w.title),certifications:(realCerts??[]).filter((x:any)=>x.creative_id===c.id).map((x:any)=>x.title),education:[c.education_level,c.education_detail].filter(Boolean).join(" · "),mentor_name:c.mentor_name,reliability_score:c.reliability_score,available_for_projects:c.available_for_projects,demo_only:false}));
 const pool=[...real,...((demos??[]) as DemoCreative[])];
 const fallback=rankDemoCreatives(`${project.category} ${project.title} ${project.description??""}`, pool);

 // Optional live AI reranking. The beta remains functional without a separate API key.
 const apiKey=process.env.OPENAI_API_KEY;
 if(!apiKey) return NextResponse.json({ok:true,mode:"smart-beta",matches:fallback});
 try{
   const compact=fallback.concat(pool.filter(d=>!fallback.some(f=>f.id===d.id)).slice(0,5)).map(c=>({id:c.id,name:c.name,level:c.peach_level,headline:c.headline,specialties:c.specialties,industries:c.industries,portfolio:c.portfolio_highlights,certifications:c.certifications,reliability:c.reliability_score}));
   const prompt=`You are Peach Match, a fair creative matching assistant. Rank the best 3 creatives for this project. Do not automatically favor seniority. Give emerging Seed/Sapling creatives a fair chance when their portfolio and specialty fit. Return ONLY valid JSON in the shape {"matches":[{"id":"uuid","score":92,"reason":"short explanation"}]}.\nPROJECT:${JSON.stringify(project)}\nCREATIVES:${JSON.stringify(compact)}`;
   const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-5.6-luna",input:prompt,reasoning:{effort:"low"},max_output_tokens:600})});
   if(!r.ok) throw new Error(`AI response ${r.status}`);
   const payload=await r.json(); const text=extractOutputText(payload).replace(/^```json\s*|```$/g,"").trim(); const parsed=JSON.parse(text);
   const byId=new Map(pool.map(c=>[c.id,c]));
   const aiMatches=(parsed.matches??[]).map((m:any)=>{const c=byId.get(m.id);return c?{...c,score:Math.max(50,Math.min(99,Number(m.score)||80)),reason:String(m.reason||"Strong fit for the project."),hits:[]}:null}).filter(Boolean).slice(0,3);
   if(aiMatches.length) return NextResponse.json({ok:true,mode:"ai",matches:aiMatches});
 }catch(error){console.error("Peach AI fallback",error)}
 return NextResponse.json({ok:true,mode:"smart-beta",matches:fallback});
}
