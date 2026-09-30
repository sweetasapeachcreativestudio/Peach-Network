"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PeachBrand } from "../components/brand";

type Role = "business" | "creative";

function AuthContent() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = params.get("role") === "creative" ? "creative" : "business";
  const initialMode = params.get("mode") === "signin" ? "signin" : "signup";

  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [role, setRole] = useState<Role>(initialRole);
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setRole(initialRole);
    setMode(initialMode);
  }, [initialRole, initialMode]);

  async function googleSignIn() {
    setMessage("");
    const googleNext = mode === "signup" && role === "creative" ? "/creative/apply" : "/account";
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(googleNext)}&role=${role}`, queryParams: { access_type: "offline", prompt: "select_account" } } });
    if (error) setMessage(error.message);
  }

  async function submit() {
    setBusy(true);
    setMessage("");

    try {
      if (!email.trim() || !password) throw new Error("Enter your email and password.");

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: me } = await supabase.auth.getUser();
        if (!me.user) throw new Error("We could not load your account.");

        window.location.href = "/account";
        return;
      }

      if (!fullName.trim()) throw new Error("Enter your name.");
      if (role === "business" && !businessName.trim()) throw new Error("Enter your business name.");

      const nextPath = role === "creative" ? "/creative/apply" : "/business";
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: fullName.trim(),
            role,
            business_name: role === "business" ? businessName.trim() : null,
          },
        },
      });

      if (error) throw error;

      if (!data.session) {
        setCheckEmail(true);
        setMessage("We sent you a confirmation link. Tap it and Peach will bring you back into the right setup screen.");
      } else {
        router.push(nextPath);
        router.refresh();
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="pn-login-page">
      <div className="pn-login-ambient" />
      <div className="pn-login-shell">
        <section className="pn-login-showcase">
          <div className="pn-login-badges">
            <span className="pn-login-impact">✦ Client Impact Spotlight • Birmingham, AL</span>
            <span className="pn-login-real">🍑 Real Client • Real Impact</span>
          </div>
          <div className="pn-login-photo-wrap">
            <img src="/lillian-project.jpg" alt="Lillian Hewitt - Empower Her Heart project" className="pn-login-photo"/>
          </div>
          <div className="pn-login-project-card">
            <small>FINISHED DELIVERABLE</small>
            <h2>Empower Her Heart • Mobile UI &amp; Web Portal</h2>
            <p>Lillian Hewitt, CEO &amp; Founder (Black Women&apos;s Heart Health, LLC)</p>
            <div><span>🪙 10 Peach Coins</span><b>Full Prototype &amp; Launch Kit</b></div>
          </div>
        </section>

        <section className="pn-login-form-panel">
          <div className="pn-login-logo"><Link href="/"><PeachBrand full /></Link></div>
          <div className="pn-login-role">
            <button type="button" className={role==="business"?"active partner":""} onClick={()=>setRole("business")}>🏢 Peach Partner</button>
            <button type="button" className={role==="creative"?"active creative":""} onClick={()=>setRole("creative")}>🎨 Peach Creative</button>
          </div>
          <span className="eyebrow">{mode==="signin"?"WELCOME BACK":"JOIN PEACH NETWORK"}</span>
          <h1>Where Southern creativity creates real impact.</h1>
          <p className="pn-login-sub">{role==="business"?"Find vetted creative talent, manage projects and keep great work moving.":"Build your portfolio, get matched to real opportunities and grow inside Peach Hub."}</p>

          <div className="auth-tabs" role="tablist" aria-label="Account action">
            <button type="button" className={mode==="signin"?"active":""} onClick={()=>{setMode("signin");setCheckEmail(false);setMessage("")}}>Sign In</button>
            <button type="button" className={mode==="signup"?"active":""} onClick={()=>{setMode("signup");setCheckEmail(false);setMessage("")}}>Create Account</button>
          </div>

          {!checkEmail&&<>
            <button type="button" className="pn-google-btn" onClick={googleSignIn}>
              <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
              Continue with Google
            </button>
            <div className="pn-login-divider"><span>or with email</span></div>

            {mode==="signup"&&<>
              <label><strong>Your name</strong><input className="field" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full name" autoComplete="name"/></label>
              {role==="business"&&<label><strong>Business name</strong><input className="field" value={businessName} onChange={e=>setBusinessName(e.target.value)} placeholder="Business name" autoComplete="organization"/></label>}
            </>}
            <label><strong>Email</strong><input className="field" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/></label>
            <label><strong>Password</strong><input className="field" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="8+ characters" autoComplete={mode==="signin"?"current-password":"new-password"}/></label>
            {mode==="signin"&&<div className="pn-login-forgot"><Link href="/auth/forgot-password" className="text-link">Forgot password?</Link></div>}
            <button className="btn btn-primary btn-large pn-login-submit" onClick={submit} disabled={busy}>{busy?"Working…":mode==="signup"?(role==="business"?"Create Peach Partner Account":"Apply as a Peach Creative"):"Sign In →"}</button>
          </>}

          {checkEmail&&<div className="auth-check-email"><h3>Check your email.</h3><p>Confirm <strong>{email}</strong>. The confirmation link will return you to Peach Network automatically.</p><button type="button" className="btn btn-outline" onClick={()=>{setCheckEmail(false);setMode("signin")}}>I already confirmed → Sign In</button></div>}
          {message&&<div className="auth-message" role="status">{message}</div>}
          <Link href="/" className="pn-login-home">← Back to Peach Network</Link>
        </section>
      </div>
    </main>
  );}

export default function AuthPage() {
  return <Suspense fallback={<main className="shell"><p>Loading Peach Network…</p></main>}><AuthContent /></Suspense>;
}
