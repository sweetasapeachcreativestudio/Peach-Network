"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { validatePhotoFileMeta } from "@/lib/photo-upload-guide";
import { PhotoUploadGuide } from "@/app/components/photo-upload-guide";

type Props={role:"business"|"creative";initial:any;certifications?:any[];featured?:any[]};
const join=(v:any)=>Array.isArray(v)?v.join(", "):v??"";
export default function ProfileEditor({role,initial,certifications=[],featured=[]}:Props){
 const router = useRouter();
 const [form,setForm]=useState<any>(initial);const[busy,setBusy]=useState(false);const[msg,setMsg]=useState("");const fileRef=useRef<HTMLInputElement>(null);const[work,setWork]=useState({title:"",description:"",projectUrl:"",tags:""});
 const set=(k:string,v:any)=>setForm((x:any)=>({...x,[k]:v}));
 async function upload(){
  const f=fileRef.current?.files?.[0];
  if(!f)return;
  const slot=role==="business"?"logo":"avatar";
  const check=validatePhotoFileMeta(f,slot);
  if(!check.ok){
   setMsg(check.error||"Unsupported image format.");
   if(fileRef.current)fileRef.current.value="";
   return;
  }
  setBusy(true);
  setMsg("");
  const fd=new FormData();
  fd.append("file",f);
  fd.append("slot",slot);
  fd.append("role",role);
  try{
   const r=await fetch("/api/profile/media",{method:"POST",headers:{"x-peach-role":role},body:fd});
   const d=await r.json();
   if(!r.ok)throw new Error(d.error||"Upload failed.");
   const nextForm=role==="business"?{...form,logoUrl:d.url}:{...form,avatarUrl:d.url};
   setForm(nextForm);
   const saveRes=await fetch("/api/profile/update",{method:"POST",headers:{"Content-Type":"application/json","x-peach-role":role},body:JSON.stringify(nextForm)});
   if(saveRes.ok){
    setMsg("Photo uploaded and saved to your profile.");
    router.refresh();
   }else{
    setMsg("Image uploaded. Click Save Profile to keep it.");
   }
  }catch(e){
   setMsg(e instanceof Error?e.message:"Upload failed.");
  }finally{
   setBusy(false);
   if(fileRef.current)fileRef.current.value="";
  }
 }
 async function addWork(){setBusy(true);setMsg("");try{const r=await fetch("/api/profile/featured-work",{method:"POST",headers:{"Content-Type":"application/json","x-peach-role":role},body:JSON.stringify(work)});const d=await r.json();if(!r.ok)throw new Error(d.error);setMsg("Featured project added ✓");router.refresh()}catch(e){setMsg(e instanceof Error?e.message:"Could not add project.")}finally{setBusy(false)}}
 async function save(){setBusy(true);setMsg("");try{const r=await fetch("/api/profile/update",{method:"POST",headers:{"Content-Type":"application/json","x-peach-role":role},body:JSON.stringify(form)});const d=await r.json();if(!r.ok)throw new Error(d.error);setMsg("Profile saved ✓");router.refresh()}catch(e){setMsg(e instanceof Error?e.message:"Could not save.")}finally{setBusy(false)}}
 const avatar=form.logoUrl||form.avatarUrl;
 return <div className="profile-edit-grid">
  <section className="profile-identity-card"><div className="profile-photo">{avatar?<img src={avatar} alt="Profile"/>:role==="business"?<img src="/brand/business-owner.jpg" alt="Example business profile"/>:<img src="/brand/hero-creative.jpg" alt="Example creative profile"/>}</div>{!avatar&&<span className="v12-example-tag">EXAMPLE PHOTO · REPLACE ME</span>}<h2>{form.fullName||form.businessName||"Peach Member"}</h2><p>{role==="creative"?(form.primarySpecialty||"Creative profile"):(form.businessName||"Business profile")}</p><input ref={fileRef} type="file" accept={role==="business"?".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml":".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"} className="visually-hidden" onChange={upload}/><button className="btn btn-outline" onClick={()=>fileRef.current?.click()} disabled={busy}>{busy?"Uploading…":role==="business"?"Upload business logo":"Add profile photo"}</button><small>{role==="business"?"PNG, JPG, WEBP or SVG · up to 15 MB":"PNG, JPG or WEBP · up to 15 MB"}</small>{msg&&<div className="auth-message mt-3 text-left">{msg}</div>}<div className="mt-4 text-left w-full"><PhotoUploadGuide defaultOpen={false} variant={role==="business"?"full":"avatar-only"}/></div></section>
  <section className="profile-form-card"><div className="profile-form-head"><div><span className="eyebrow">PROFILE DETAILS</span><h2>Help Peach understand you.</h2><p>{role==="creative"?"The more useful detail you add, the better Peach Match can understand your real strengths.":"Business context helps Peach recommend the right creative support faster."}</p></div><button className="btn btn-primary" onClick={save} disabled={busy}>{busy?"Saving…":"Save Profile"}</button></div>
  <div className="form-grid"><label>Full name<input className="field" value={form.fullName||""} onChange={e=>set("fullName",e.target.value)}/></label><label>Phone (Mobile)<input className="field" value={form.phone||""} onChange={e=>set("phone",e.target.value)} placeholder="(205) 555-0199"/><small className="field-help" style={{color:"#C84E2D",fontWeight:700}}>Used for instant SMS alerts on new messages &amp; proofs</small></label></div>
  {role==="business"?<>
   <div className="form-grid"><label>Business name<input className="field" value={form.businessName||""} onChange={e=>set("businessName",e.target.value)}/></label><label>Industry<input className="field" value={form.industry||""} onChange={e=>set("industry",e.target.value)} placeholder="Beauty, restaurant, nonprofit…"/></label></div>
   <label>Tell Peach about your business<textarea className="field" value={form.description||""} onChange={e=>set("description",e.target.value)} placeholder="What do you sell, who do you serve, and what kind of creative support matters most?"/></label>
   <div className="form-grid"><label>Website<input className="field" value={form.website||""} onChange={e=>set("website",e.target.value)} placeholder="https://"/></label><label>Preferred contact<input className="field" value={form.preferredContact||""} onChange={e=>set("preferredContact",e.target.value)} placeholder="Email, phone, project chat"/></label></div>
   <label>Common creative needs<input className="field" value={form.commonNeeds||""} onChange={e=>set("commonNeeds",e.target.value)} placeholder="social graphics, website edits, video, photography"/><small className="field-help">Separate with commas.</small></label>
   <label>Address (optional)<input className="field" value={form.addressLine1||""} onChange={e=>set("addressLine1",e.target.value)}/></label><div className="form-grid three"><label>City<input className="field" value={form.city||""} onChange={e=>set("city",e.target.value)}/></label><label>State<input className="field" value={form.state||""} onChange={e=>set("state",e.target.value)}/></label><label>ZIP<input className="field" value={form.postalCode||""} onChange={e=>set("postalCode",e.target.value)}/></label></div>
  </>:<>
   <label>Creative bio<textarea className="field" value={form.bio||""} onChange={e=>set("bio",e.target.value)} placeholder="What do you make best? What style, industries or problems are you especially good at?"/></label>
   <div className="form-grid"><label>Primary specialty<input className="field" value={form.primarySpecialty||""} onChange={e=>set("primarySpecialty",e.target.value)} placeholder="Sports graphic design"/></label><label>Other specialties<input className="field" value={form.secondarySpecialties||""} onChange={e=>set("secondarySpecialties",e.target.value)} placeholder="flyers, social media, illustration"/></label></div>
   <div className="form-grid"><label>Tools<input className="field" value={form.tools||""} onChange={e=>set("tools",e.target.value)} placeholder="Photoshop, Illustrator, Figma"/></label><label>Industries<input className="field" value={form.industries||""} onChange={e=>set("industries",e.target.value)} placeholder="sports, beauty, food"/></label></div>
   <div className="form-grid"><label>Portfolio link<input className="field" value={form.portfolioUrl||""} onChange={e=>set("portfolioUrl",e.target.value)} placeholder="https://"/></label><label>Availability<input className="field" value={form.availabilityText||""} onChange={e=>set("availabilityText",e.target.value)} placeholder="Evenings + weekends, 2 projects/month…"/></label></div>
   <div className="form-grid"><label>Education level<input className="field" value={form.educationLevel||""} onChange={e=>set("educationLevel",e.target.value)} placeholder="High school, certificate, college…"/></label><label>School / program<input className="field" value={form.educationDetail||""} onChange={e=>set("educationDetail",e.target.value)} placeholder="Program, major or training"/></label></div>
   <div className="form-grid"><label>Mentor name<input className="field" value={form.mentorName||""} onChange={e=>set("mentorName",e.target.value)} placeholder="If applicable"/></label><label>Mentorship notes<input className="field" value={form.mentorshipNotes||""} onChange={e=>set("mentorshipNotes",e.target.value)} placeholder="What did you focus on?"/></label></div>
   <div className="form-grid three"><label>City<input className="field" value={form.city||""} onChange={e=>set("city",e.target.value)}/></label><label>State<input className="field" value={form.state||""} onChange={e=>set("state",e.target.value)}/></label><label>Service radius<input className="field" type="number" value={form.serviceRadiusMiles||""} onChange={e=>set("serviceRadiusMiles",e.target.value)} placeholder="Miles"/></label></div>
   <label className="switch-line"><input type="checkbox" checked={!!form.remoteAvailable} onChange={e=>set("remoteAvailable",e.target.checked)}/><span><strong>Available for remote work</strong><small>Peach can include you in matches outside your area.</small></span></label>
   <div className="growth-card"><span className="eyebrow">PEACH GROWTH</span><h3>Your learning becomes part of your creative story.</h3><div className="growth-grid"><div><small>PEACH LEVEL</small><strong>{form.peachLevel?`Peach ${form.peachLevel}`:"Pending review"}</strong></div><div><small>MENTOR</small><strong>{form.mentorName||"Not assigned"}</strong></div><div><small>CERTIFICATIONS</small><strong>{certifications.length}</strong></div></div>{certifications.length>0&&<div className="cert-list">{certifications.map(c=><span key={c.id}>✓ {c.title}</span>)}</div>}<p>Featured project uploads and Peach Academy certificates will continue building this profile as the ecosystem grows.</p></div>
   <div className="featured-work"><h3>Work I’m proud of</h3><p className="muted">Add a few projects so Peach Match can understand what you can actually do — not just your job title.</p>{featured.map(w=><div key={w.id}><strong>{w.title}</strong><span>{w.description}{w.project_url?` · ${w.project_url}`:""}</span></div>)}<div className="featured-add"><input className="field" value={work.title} onChange={e=>setWork({...work,title:e.target.value})} placeholder="Project title"/><textarea className="field" value={work.description} onChange={e=>setWork({...work,description:e.target.value})} placeholder="What did you create?"/><input className="field" value={work.projectUrl} onChange={e=>setWork({...work,projectUrl:e.target.value})} placeholder="Project or portfolio link"/><input className="field" value={work.tags} onChange={e=>setWork({...work,tags:e.target.value})} placeholder="sports, flyer, Photoshop"/><button className="btn btn-outline" type="button" onClick={addWork} disabled={busy||!work.title.trim()}>Add Featured Project</button></div></div>
  </>}
  {msg&&<div className="auth-message">{msg}</div>}</section>
 </div>;
}
