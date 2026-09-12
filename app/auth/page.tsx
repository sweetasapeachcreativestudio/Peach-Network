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

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", me.user.id)
          .single();

        if (profileError) {
          router.push("/account");
        } else if (profile?.role === "creative") {
          router.push("/creative");
        } else if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/business");
        }
        router.refresh();
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
      <section className="auth-brand-panel">
        <PeachBrand full />
        <div className="auth-brand-copy">
          <span className="eyebrow" style={{color:"#ffd1ba"}}>WELCOME TO THE NETWORK</span>
          <h1>{mode === "signin" ? "Come back in." : "Creative work belongs in the right hands."}</h1>
          <p>{mode === "signin" ? "Your projects, matches, messages and Peach Coins are waiting." : "Businesses find vetted creative talent. Creatives find real work and room to grow."}</p>
        </div>
        <img className="v12-auth-human" src="/brand/login-creative.jpg" alt="Creative professional at work"/><div className="auth-side-note">Powered by Sweet As A Peach Creative Agency</div>
      </section>

      <section className="auth-form-wrap">
        <div className="auth-top">
          <Link href="/" className="text-link">← Back to Peach</Link>
        </div>

        <div className="auth-card">
          <span className="eyebrow">{mode === "signin" ? "RETURNING MEMBER" : "JOIN PEACH NETWORK"}</span>
          <h2>{mode === "signin" ? "Welcome back." : "Let’s get you in the right place."}</h2>
          <p>{mode === "signin" ? "Sign in with the email you used to join Peach Network." : "Choose how you’re joining, then create your account."}</p>

          <div className="auth-tabs" role="tablist" aria-label="Account action">
            <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setCheckEmail(false); setMessage(""); }}>Create Account</button>
            <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setCheckEmail(false); setMessage(""); }}>Sign In</button>
          </div>

          {mode === "signup" && !checkEmail && (
            <>
              <div className="role-selector">
                <button type="button" className={`role-option ${role === "business" ? "active" : ""}`} onClick={() => setRole("business")}>
                  <strong>I’m a business owner</strong>
                  <span>I need creative help.</span>
                </button>
                <button type="button" className={`role-option ${role === "creative" ? "active" : ""}`} onClick={() => setRole("creative")}>
                  <strong>I’m a creative</strong>
                  <span>I want matched opportunities.</span>
                </button>
              </div>

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
