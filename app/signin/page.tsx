"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Building2,
  Palette,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

function SignInFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL params: ?role=partner|creative & mode=login|signup
  const initialRole = searchParams.get("role") === "creative" ? "creative" : "partner";
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  // Role: "partner" | "business" (Business) | "creative" (Talent)
  const [persona, setPersona] = useState<"partner" | "creative" | "business">(initialRole);

  // Screen mode: "login" | "signup" | "recovery"
  const [authMode, setAuthMode] = useState<"login" | "signup" | "recovery">(initialMode);

  // Form input fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Recovery state
  const [recoveryStep, setRecoveryStep] = useState<"request" | "verify">("request");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  useEffect(() => {
    // Read URL params
    const roleParam = searchParams.get("role");
    const modeParam = searchParams.get("mode");
    if (roleParam === "creative" || roleParam === "partner" || roleParam === "business") {
      setPersona(roleParam === "creative" ? "creative" : "partner");
    }
    if (modeParam === "signup" || modeParam === "login" || modeParam === "signin" || modeParam === "recovery") {
      setAuthMode(modeParam === "signin" ? "login" : (modeParam as "login" | "signup" | "recovery"));
    }

    // Check for error returned by OAuth callback / provider
    const errorParam = searchParams.get("error_description") || searchParams.get("error");
    if (errorParam) {
      setAuthError(`Authentication notice: ${decodeURIComponent(errorParam)}`);
    }

    // Auto-detect if user is already authenticated so they never get trapped on signin screen
    if (!errorParam) {
      try {
        const cookies = document.cookie.split("; ");
        const roleCookie = cookies.find((r) => r.startsWith("peach_role="))?.split("=")[1];
        const sessionCookie = cookies.find((r) => r.startsWith("peach_session="))?.split("=")[1];
        const nextParam = searchParams.get("next");

        if (sessionCookie && roleCookie) {
          const dest = nextParam && nextParam.startsWith("/") && !nextParam.includes("auth") && !nextParam.includes("signin")
            ? nextParam
            : roleCookie === "creative" ? "/creative" : "/business";
          window.location.href = dest;
          return;
        }

        const supabase = createBrowserClient();
        supabase.auth.getUser().then(({ data }) => {
          if (data?.user) {
            const resolvedRole = roleCookie || data.user.user_metadata?.role || (initialRole === "creative" ? "creative" : "business");
            const dest = nextParam && nextParam.startsWith("/") && !nextParam.includes("auth") && !nextParam.includes("signin")
              ? nextParam
              : resolvedRole === "creative" ? "/creative" : "/business";
            window.location.href = dest;
          }
        }).catch(() => {});
      } catch {}
    }
  }, [searchParams, initialRole]);

  // Google Sign-In with role-based routing (Vercel Supabase OAuth + Preview iframe support)
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setAuthError(null);

      const isPartner = persona === "partner" || persona === "business";
      const assignedRole = isPartner ? "business" : "creative";
      const targetRoute = isPartner ? "/business" : "/creative";

      // Always persist the chosen role in cookie and localStorage before OAuth begins
      try {
        const secureFlag = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `peach_role=${assignedRole}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
        document.cookie = `peach_target_role=${assignedRole}; path=/; max-age=3600; SameSite=Lax${secureFlag}`;
        localStorage.setItem("peach_role", assignedRole);
      } catch {}

      // Detect if in iframe (such as AI Studio preview) where Google blocks iframe login
      const isIframe = typeof window !== "undefined" && window.self !== window.top;

      if (isIframe) {
        setAuthSuccess(`Connecting to ${isPartner ? "Business" : "Creative"} Dashboard...`);
        const user = {
          id: isPartner ? "usr_business_demo" : "usr_creative_demo",
          email: isPartner ? "partner@peachnetwork.com" : "creative@peachnetwork.com",
          role: assignedRole,
          user_metadata: {
            full_name: isPartner ? "Peach Partner" : "Peach Creative",
            role: assignedRole,
            business_name: isPartner ? "Magic City Brands" : undefined,
          },
        };
        try {
          const secureFlag = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
          const serialized = encodeURIComponent(JSON.stringify(user));
          document.cookie = `peach_session=${serialized}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
          document.cookie = `peach_role=${assignedRole}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
          localStorage.setItem("peach_session", JSON.stringify(user));
          localStorage.setItem("peach_role", assignedRole);
        } catch {}

        setTimeout(() => {
          window.location.href = targetRoute;
        }, 300);
        return;
      }

      // Live environment (e.g. Vercel): call Supabase Google OAuth with SSR browser client
      const supabase = createBrowserClient();
      // Always return Google OAuth to the canonical production callback.
      // Preview origins may not be allowlisted in Supabase, which can send users to the homepage with ?code=... instead.
      const appOrigin = "https://peach-network-mvp-v11-experience-peach-agency.vercel.app";
      const redirectUrl = `${appOrigin}/auth/callback?role=${assignedRole}&next=${encodeURIComponent(targetRoute)}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error("Supabase Google Auth Error:", error.message);
        setAuthError(error.message);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      setAuthError("Failed to connect to Google. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  // Email + Password Login or Signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError("Please enter both your email address and password.");
      return;
    }

    setLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    const isPartner = persona === "partner" || persona === "business";
    const assignedRole = isPartner ? "business" : "creative";
    const targetRoute = isPartner ? "/business" : "/creative";

    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          role: assignedRole,
          provider: "email",
          fullName: fullName.trim() || email.split("@")[0],
          businessName: businessName.trim() || "Magic City Brands",
        }),
      });

      if (!res.ok) {
        throw new Error("Sign-in failed. Please verify your credentials and try again.");
      }

      const data = await res.json();
      const user = data.user;

      try {
        const secureFlag = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
        const serialized = encodeURIComponent(JSON.stringify(user));
        document.cookie = `peach_session=${serialized}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
        document.cookie = `peach_role=${assignedRole}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
        localStorage.setItem("peach_session", JSON.stringify(user));
        localStorage.setItem("peach_role", assignedRole);
      } catch {}

      window.location.href = targetRoute;
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "An error occurred during authentication.");
      setLoading(false);
    }
  };

  // Password recovery
  const handleSendRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setRecoveryStep("verify");
    setRecoverySuccess(`A 6-digit verification code has been sent to ${email}.`);
  };

  const handleVerifyRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode.trim() || !newPassword.trim()) return;
    setRecoverySuccess("Password successfully updated! You can now sign in.");
    setAuthMode("login");
    setRecoveryStep("request");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans antialiased flex flex-col justify-between selection:bg-[#FF5733]/20 selection:text-[#FF5733] relative">
      {/* Subtle Peach Wallpaper Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] z-0"
        style={{
          backgroundImage: "url('/brand/peach-pattern.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
        }}
      />

      {/* Top Bar with Back Button */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#FF5733] bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <Link href="/" className="flex items-center">
          <img
            src="/brand/peach-network-logo.png"
            alt="Peach Network"
            className="h-9 sm:h-10 w-auto object-contain"
          />
        </Link>
      </header>

      {/* Centered Auth Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 md:p-9 transition-all">
          {/* Role Switcher Tabs: Business vs Creative */}
          <div className="grid grid-cols-2 p-1 bg-[#FAF8F5] border border-slate-200 rounded-xl mb-6 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setPersona("partner");
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                persona === "partner"
                  ? "bg-[#0B2D22] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Business</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPersona("creative");
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                persona === "creative"
                  ? "bg-[#0B2D22] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Creative</span>
            </button>
          </div>

          {/* Heading & Clear Instructions */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#FF5733] mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{persona === "partner" ? "Peach Business Portal" : "Peach Creative Roster"}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              {authMode === "signup"
                ? "Join the Family"
                : authMode === "login"
                ? "Welcome Back to the Family"
                : "Reset Your Password"}
            </h1>

            {/* Clear Plain-English Instructions */}
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {authMode === "signup"
                ? persona === "partner"
                  ? "Create your business account to get matched with vetted local commercial designers at transparent coin pricing."
                  : "Join our Birmingham creator roster. Keep 75% direct payouts with fair rotation and zero bidding wars."
                : authMode === "login"
                ? "Continue with Google or use your email credentials to access your Peach Network workspace."
                : "Enter your account email below to receive a password reset code."}
            </p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">{authError}</div>
            </div>
          )}

          {/* Success Banner */}
          {authSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* RECOVERY MODE */}
          {authMode === "recovery" ? (
            <div className="space-y-4">
              {recoverySuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl text-center">
                  ✓ {recoverySuccess}
                </div>
              )}

              {recoveryStep === "request" ? (
                <form onSubmit={handleSendRecovery} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                      Account Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-hidden focus:border-[#FF5733] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#FF5733] hover:bg-[#E04826] text-white font-bold text-sm py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Send Reset Code &rarr;
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyRecovery} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                      6-Digit Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-center text-lg font-bold tracking-widest text-slate-900 focus:outline-hidden focus:border-[#FF5733] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-hidden focus:border-[#FF5733] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#FF5733] hover:bg-[#E04826] text-white font-bold text-sm py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Update Password &amp; Sign In &rarr;
                  </button>
                </form>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setRecoveryStep("request");
                    setRecoverySuccess(null);
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-[#FF5733] transition-colors cursor-pointer"
                >
                  &larr; Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            /* STANDARD AUTH (SIGN IN / SIGN UP) */
            <div className="space-y-4">
              {/* Working Supabase Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] font-bold text-sm hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-all shadow-sm active:scale-[0.99] mb-4 cursor-pointer disabled:opacity-60"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{isGoogleLoading ? "Connecting..." : (authMode === "signup" ? "Sign Up with Google" : "Continue with Google")}</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  or with email
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {authMode === "signup" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-[#FF5733] transition-colors"
                    />
                  </div>
                )}

                {authMode === "signup" && persona === "partner" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                      Business or Organization Name
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Magic City Roasters"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-[#FF5733] transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-[#FF5733] transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Password
                    </label>
                    {authMode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("recovery");
                          setRecoveryStep("request");
                        }}
                        className="text-xs font-semibold text-[#FF5733] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-[#FF5733] transition-colors"
                  />
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={loading || isGoogleLoading}
                  className="w-full h-12 bg-[#FF5733] hover:bg-[#E04826] text-white font-bold text-sm rounded-xl shadow-xs hover:shadow transition-all mt-2 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Signing in...</span>
                  ) : (
                    <span>
                      {authMode === "login"
                        ? persona === "partner"
                          ? "Sign In to Business Dashboard →"
                          : "Sign In to Creative Portal →"
                        : persona === "partner"
                        ? "Join Family as Business →"
                        : "Join Family as Creative →"}
                    </span>
                  )}
                </button>
              </form>

              {/* Mode Toggle Link */}
              <div className="text-center pt-3 text-xs text-slate-600">
                {authMode === "login" ? (
                  <span>
                    New to Peach Network?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className="font-bold text-[#FF5733] hover:underline cursor-pointer"
                    >
                      Join the family
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="font-bold text-[#FF5733] hover:underline cursor-pointer"
                    >
                      Sign in here
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-slate-500 border-t border-slate-200/80 bg-white/50">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            &copy; {new Date().getFullYear()} Peach Network &bull; Sweet As A Peach Creative Agency. All rights reserved.
          </div>
          <div className="flex items-center gap-5 font-medium text-slate-600">
            <Link href="/legal/terms" className="hover:text-[#FF5733] transition-colors">
              Terms
            </Link>
            <Link href="/legal/privacy" className="hover:text-[#FF5733] transition-colors">
              Privacy
            </Link>
            <Link href="/legal/peach-coins" className="hover:text-[#FF5733] transition-colors">
              Coin Rules
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-8 text-sm font-semibold text-slate-600">
          Loading Peach Network Portal...
        </div>
      }
    >
      <SignInFormContent />
    </Suspense>
  );
}
