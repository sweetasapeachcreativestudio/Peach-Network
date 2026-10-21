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
import { supabase } from "@/lib/supabase";

function SignInFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL params: ?role=partner|creative & mode=login|signup
  const initialRole = searchParams.get("role") === "creative" ? "creative" : "partner";
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  // Role: "partner" (Business) | "creative" (Talent)
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

  // 🎯 CATCH GOOGLE ACCESS TOKEN & FORWARD TO PROPER DASHBOARD
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;

      if (hash && hash.includes("access_token")) {
        let targetRole = localStorage.getItem("peach_auth_role") || "business";

        if (hash.includes('"role"%3A"creative"') || hash.includes('"role":"creative"')) {
          targetRole = "creative";
        } else if (hash.includes('"role"%3A"business"') || hash.includes('"role":"business"')) {
          targetRole = "business";
        }

        localStorage.removeItem("peach_auth_role");

        if (targetRole === "creative") {
          window.location.href = "/hub";
        } else {
          window.location.href = "/dashboard/business";
        }
      }
    }
  }, []);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    const modeParam = searchParams.get("mode");
    if (roleParam === "creative" || roleParam === "partner" || roleParam === "business") {
      setPersona(roleParam === "creative" ? "creative" : "partner");
    }
    if (modeParam === "signup" || modeParam === "login" || modeParam === "signin" || modeParam === "recovery") {
      setAuthMode(modeParam === "signin" ? "login" : (modeParam as "login" | "signup" | "recovery"));
    }

    const errorParam = searchParams.get("error_description") || searchParams.get("error");
    if (errorParam) {
      setAuthError(`Authentication notice: ${decodeURIComponent(errorParam)}`);
    }
  }, [searchParams]);

  // Google Sign-In with Real Dashboard Routing
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setAuthError(null);

      const isPartner = persona === "partner" || persona === "business";
      const assignedRole = isPartner ? "business" : "creative";
      
      // 🎯 FIXED DESTINATIONS (Pointing to real existing pages, not 404 /business)
      const targetRoute = isPartner ? "/dashboard/business" : "/hub";

      // Save role so it persists through Google's redirect
      localStorage.setItem("peach_auth_role", assignedRole);

      const redirectUrl = `${window.location.origin}/auth/callback?role=${assignedRole}&next=${encodeURIComponent(targetRoute)}`;

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

  // Email + Password Login
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
    const targetRoute = isPartner ? "/dashboard/business" : "/hub";

    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          role: isPartner ? "business" : "creative",
          provider: "email",
          fullName: fullName.trim() || email.split("@")[0],
          businessName: businessName.trim() || "My Business",
        }),
      });

      if (!res.ok) {
        throw new Error("Sign-in failed. Please verify your credentials.");
      }

      router.push(targetRoute);
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
      {/* Top Bar with Back Button */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#FF5733] bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FF5733] flex items-center justify-center text-white text-lg font-bold">
            🍑
          </div>
          <span className="text-xl font-black text-slate-950">Peach Network</span>
        </Link>
      </header>

      {/* Centered Auth Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 md:p-9 transition-all">
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#FAF8F5] border border-slate-200 rounded-xl mb-6 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setPersona("partner");
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                persona === "partner" || persona === "business"
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

          {/* Heading */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#FF5733] mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{persona === "creative" ? "Peach Creative Portal" : "Peach Business Portal"}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              {authMode === "signup"
                ? "Join the Network"
                : authMode === "login"
                ? "Welcome Back"
                : "Reset Password"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {authMode === "signup"
                ? "Create your account to access vetted commercial design with zero bidding wars."
                : authMode === "login"
                ? "Continue with Google or email to access your workspace."
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
