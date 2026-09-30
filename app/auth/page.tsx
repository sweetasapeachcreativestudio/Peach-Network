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
    <main className="auth-page">
      <section className="auth-brand-panel auth-impact-panel">
        <PeachBrand full />
        <div className="impact-visual">
          <span className="impact-badge">✦ Client Impact Spotlight • Birmingham, AL</span>
          <span className="impact-sticker">🍑 Design that moves communities</span>
          <img className="impact-image" src="/lillian-project.jpg" alt="Empower Her Heart client project spotlight"/>
          <div className="impact-glass">
            <small>REAL CLIENT • REAL IMPACT</small>
            <h2>Empower Her Heart • Mobile UI &amp; Web Portal</h2>
            <p>Lillian Hewitt, CEO (Black Women&apos;s Heart Health, LLC)</p>
            <span>10 Peach Coins • Delivered in 5 Days</span>
          </div>
        </div>
        <div className="auth-side-note">Powered by Sweet As A Peach Creative Agency</div>
      </section>

      <section className="auth-form-wrap">
        <div className="auth-top">
          <Link href="/" className="text-link">← Back to Peach</Link>
        </div>

        <div className="auth-card">
          <span className="eyebrow">{mode === "signin" ? "RETURNING MEMBER" : "JOIN PEACH NETWORK"}</span>
          <h2>Where Southern creativity creates real impact.</h2>
          <p>{mode === "signin" ? "Welcome back. Sign in to continue to your Peach workspace." : "Choose your side of the network and create your account."}</p>
          <div className="auth-role-segment" aria-label="Peach Network role">
            <button type="button" className={role==="business"?"active":""} onClick={()=>setRole("business")}>🏢 Peach Partner</button>
            <button type="button" className={role==="creative"?"active":""} onClick={()=>setRole("creative")}>🎨 Peach Creative</button>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Account action">
            <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setCheckEmail(false); setMessage(""); }}>Create Account</button>
            <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setCheckEmail(false); setMessage(""); }}>Sign In</button>
          </div>

          {mode === "signup" && !checkEmail && (
            <>
              <label>
                <strong>Your name</strong>
                <input className="field" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" autoComplete="name" />
              </label>

              {role === "business" && (
                <label>
                  <strong>Business name</strong>
                  <input className="field" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business name" autoComplete="organization" />
                </label>
              )}
            </>
          )}

          {!checkEmail && (
            <>
              <label>
                <strong>Email</strong>
                <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </label>
              <label>
                <strong>Password</strong>
                <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8+ characters" autoComplete={mode === "signin" ? "current-password" : "new-password"} />
              </label>
              {mode === "signin" && <div style={{textAlign:"right",marginTop:-6,marginBottom:14}}><Link href="/auth/forgot-password" className="text-link">Forgot password?</Link></div>}
              <button className="btn btn-primary btn-large" style={{width:"100%"}} onClick={submit} disabled={busy}>
                {busy ? "Working…" : mode === "signup" ? (role === "business" ? "Create Business Account" : "Apply to Peach Network") : "Sign In"}
              </button>
            </>
          )}

          {checkEmail && (
            <div className="auth-check-email">
              <h3>Check your email.</h3>
              <p>Confirm <strong>{email}</strong>. The confirmation link will return you to Peach Network automatically.</p>
              <button type="button" className="btn btn-outline" style={{marginTop:16}} onClick={() => { setCheckEmail(false); setMode("signin"); }}>I already confirmed → Sign In</button>
            </div>
          )}

          {message && !checkEmail && <div className="auth-message" role="status">{message}</div>}
          {message && checkEmail && <div className="auth-message" role="status">{message}</div>}
        </div>
      </section>
    </main>
  );
}

export default function AuthPage() {
  return <Suspense fallback={<main className="shell"><p>Loading Peach Network…</p></main>}><AuthContent /></Suspense>;
}
