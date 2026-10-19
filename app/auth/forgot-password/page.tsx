"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PeachBrand } from "../../components/brand";

export default function ForgotPassword(){
 const supabase=useMemo(()=>createClient(),[]);const[email,setEmail]=useState("");const[msg,setMsg]=useState("");const[busy,setBusy]=useState(false);
 async function send(){setBusy(true);setMsg("");const{error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`});setMsg(error?error.message:"Check your email. We sent you a secure Peach password reset link.");setBusy(false);}
 return <main className="auth-page"><section className="auth-brand-panel"><PeachBrand full/><div className="auth-brand-copy"><span className="eyebrow" style={{color:"#ffd1ba"}}>ACCOUNT HELP</span><h1>We’ll get you back in.</h1><p>Reset your password securely, then return to your Peach Network account.</p></div><img className="v12-auth-human" src="/brand/login-creative.jpg" alt="Creative professional at work"/><div className="auth-side-note">Powered by Sweet As A Peach Creative Agency</div></section><section className="auth-form-wrap"><div className="auth-top"><Link href="/auth?mode=signin" className="text-link">← Back to Sign In</Link></div><div className="auth-card"><span className="eyebrow">RESET PASSWORD</span><h2>Forgot your password?</h2><p>Enter the email connected to your Peach Network account.</p><label><strong>Email</strong><input className="field" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/></label><button className="btn btn-primary btn-large" style={{width:"100%"}} onClick={send} disabled={busy||!email.trim()}>{busy?"Sending…":"Send Reset Link"}</button>{msg&&<div className="auth-message" role="status">{msg}</div>}</div></section></main>
}