"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SignInFormContent() {
  const searchParams = useSearchParams();

  // Read URL options: ?role=partner|creative & mode=login|signup
  const initialRole = searchParams.get("role") === "creative" ? "creative" : "partner";
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  // Role selection: "partner" (Business/Church) | "creative" (Freelancer/Designer)
  const [persona, setPersona] = useState<"partner" | "creative">(initialRole);

  // Screen mode: "login" (Welcome back) | "signup" (First time) | "recovery" (Lost password)
  const [authMode, setAuthMode] = useState<"login" | "signup" | "recovery">(initialMode);

  // Input fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [specialty, setSpecialty] = useState("graphic_design");

  // Lost password recovery state
  const [recoveryStep, setRecoveryStep] = useState<"request" | "verify">("request");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);

  // Low coin balance alert (< 5 coins)
  const [coinBalance] = useState<number>(3);
  const [showLowCoinModal, setShowLowCoinModal] = useState(false);
  const [dontNotifyAgain, setDontNotifyAgain] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);

  // Success message
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    const modeParam = searchParams.get("mode");
    if (roleParam === "creative" || roleParam === "partner") {
      setPersona(roleParam);
    }
    if (modeParam === "signup" || modeParam === "login" || modeParam === "recovery") {
      setAuthMode(modeParam);
    }
  }, [searchParams]);

  // Handle Log In or Sign Up
  const handleSignInOrSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (persona === "partner") {
      if ((authMode === "signup" || coinBalance < 5) && !dontNotifyAgain && !notificationDismissed) {
        setShowLowCoinModal(true);
      } else {
        setAuthSuccess(`Welcome back, Peach Partner! Loading your business dashboard...`);
      }
    } else {
      if (authMode === "signup") {
        setAuthSuccess(`Application submitted! A Senior Creative Mentor will review your portfolio within 24–48 hours.`);
      } else {
        setAuthSuccess(`Welcome back, Peach Creative! Loading your creative briefs...`);
      }
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = () => {
    if (persona === "partner") {
      if (coinBalance < 5 && !dontNotifyAgain && !notificationDismissed) {
        setShowLowCoinModal(true);
      } else {
        setAuthSuccess(`Google account verified! Welcome back, Peach Partner.`);
      }
    } else {
      setAuthSuccess(`Google account verified! Welcome back, Peach Creative.`);
    }
  };

  // Lost Password: Send Code
  const handleSendRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setRecoveryStep("verify");
    setRecoveryMessage(`We just sent a 6-digit recovery code to ${email}. Check your inbox or spam folder!`);
  };

  // Lost Password: Reset and Sign In
  const handleVerifyRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode || !newPassword) return;
    setRecoveryMessage(null);
    setAuthSuccess(`Password successfully reset! You can now log into your Peach account.`);
    setAuthMode("login");
    setRecoveryStep("request");
  };

  return (
    <div className="pn-auth-page">
      <style>{`
        .pn-auth-page {
          min-height: 100vh;
          width: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background-color: #FFF8F4;
          overflow-x: hidden;
        }

        /* BRAND GRADIENT BACKDROP */
        .pn-auth-backdrop {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background: 
            radial-gradient(circle at 12% 15%, rgba(254, 215, 170, 0.75) 0%, transparent 45%),
            radial-gradient(circle at 88% 12%, rgba(6, 182, 212, 0.28) 0%, transparent 45%),
            radial-gradient(circle at 15% 85%, rgba(22, 163, 74, 0.18) 0%, transparent 50%),
            radial-gradient(circle at 88% 85%, rgba(251, 146, 60, 0.35) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 237, 213, 0.5) 0%, transparent 65%);
        }

        .pn-auth-brand-header {
          position: relative;
          z-index: 10;
          margin-bottom: 20px;
          text-align: center;
        }
        .pn-auth-logo {
          height: 56px;
          width: auto;
          display: inline-block;
          filter: drop-shadow(0 4px 14px rgba(232, 93, 63, 0.2));
        }

        /* MAIN CARD */
        .pn-auth-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 960px;
          background: #FFFFFF;
          border-radius: 32px;
          box-shadow: 0 24px 60px rgba(23, 39, 30, 0.08);
          border: 2px solid rgba(232, 93, 63, 0.22);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr;
        }
        @media (min-width: 860px) {
          .pn-auth-card {
            grid-template-columns: 0.9fr 1.1fr;
          }
        }

        /* LEFT SIDEBAR */
        .pn-auth-sidebar {
          background: linear-gradient(145deg, #182820 0%, #0F1E16 60%, #152E20 100%);
          color: #FFFFFF;
          padding: 40px 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }
        .pn-sidebar-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.12);
          color: #FFA585;
          font-size: 11.5px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 99px;
          margin-bottom: 20px;
        }
        .pn-sidebar-title {
          font-size: clamp(24px, 3.2vw, 34px);
          font-weight: 850;
          line-height: 1.18;
          margin: 0 0 14px 0;
          color: #FFFFFF;
        }
        .pn-sidebar-title span {
          color: #FFA585;
          font-style: italic;
          font-family: Georgia, serif;
        }
        .pn-sidebar-desc {
          font-size: 14px;
          line-height: 1.6;
          color: #CFE0D6;
          margin: 0 0 24px 0;
        }
        .pn-sidebar-highlights {
          display: flex;
          flex-direction: column;
          gap: 12px;
          list-style: none;
          padding: 0;
          margin: 0 0 28px 0;
          font-size: 13.5px;
          color: #E2ECE5;
        }
        .pn-sh-icon {
          color: #06B6D4;
          font-weight: 900;
          margin-right: 8px;
        }
        .pn-sidebar-footer {
          padding-top: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12.5px;
          color: #94A3B8;
        }

        /* RIGHT FORM */
        .pn-auth-form-wrap {
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        @media (min-width: 600px) {
          .pn-auth-form-wrap {
            padding: 40px 44px;
          }
        }

        /* ROLE TABS */
        .pn-persona-toggle-box {
          display: flex;
          background: #FFF0E6;
          border: 1.5px solid #FDBA74;
          padding: 4px;
          border-radius: 99px;
          margin-bottom: 20px;
        }
        .pn-p-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 42px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 800;
          border: none;
          background: transparent;
          color: #64748B;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pn-p-btn.is-active {
          background: #FFFFFF;
          color: #17271E;
          box-shadow: 0 4px 12px rgba(232, 93, 63, 0.15);
        }
        .pn-p-btn.is-active.is-partner { color: #C2410C; }
        .pn-p-btn.is-active.is-creative { color: #0284C7; }

        .pn-form-greeting {
          font-size: 12px;
          font-weight: 850;
          text-transform: uppercase;
          color: #E85D3F;
          margin-bottom: 4px;
        }
        .pn-form-title {
          font-size: 24px;
          font-weight: 850;
          color: #17271E;
          margin: 0 0 6px 0;
        }
        .pn-form-sub {
          font-size: 13.5px;
          color: #556B60;
          margin: 0 0 16px 0;
        }

        /* CREATIVE CALLOUT */
        .pn-creative-process-banner {
          background: #F0F9FF;
          border: 1.5px solid #BAE6FD;
          border-radius: 16px;
          padding: 14px 16px;
          margin-bottom: 18px;
        }
        .pn-cp-title {
          font-size: 12.5px;
          font-weight: 850;
          color: #0369A1;
          margin: 0 0 6px 0;
        }
        .pn-cp-steps {
          display: grid;
          gap: 4px;
          font-size: 11.5px;
          color: #0C4A6E;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        /* GOOGLE BUTTON */
        .pn-google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          height: 48px;
          border-radius: 99px;
          border: 1.5px solid #CBD5E1;
          background: #FFFFFF;
          color: #1E293B;
          font-size: 14px;
          font-weight: 750;
          cursor: pointer;
          margin-bottom: 16px;
          transition: background 0.2s ease;
        }
        .pn-google-btn:hover {
          background: #F8FAFC;
        }

        .pn-auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: #94A3B8;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .pn-auth-divider::before,
        .pn-auth-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #E2E8F0;
        }

        .pn-auth-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .pn-input-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .pn-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pn-label {
          font-size: 13px;
          font-weight: 750;
          color: #17271E;
        }
        .pn-forgot-link {
          font-size: 12px;
          font-weight: 700;
          color: #E85D3F;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
        }
        .pn-input {
          height: 48px;
          border-radius: 12px;
          border: 1.5px solid #CBD5E1;
          padding: 0 16px;
          font-size: 14.5px;
          outline: none;
          box-sizing: border-box;
        }
        .pn-input:focus {
          border-color: #E85D3F;
        }
        .pn-select {
          height: 48px;
          border-radius: 12px;
          border: 1.5px solid #CBD5E1;
          padding: 0 14px;
          font-size: 13.5px;
          outline: none;
          background: #FFFFFF;
        }

        .pn-submit-btn {
          height: 50px;
          border-radius: 99px;
          background: linear-gradient(135deg, #E85D3F 0%, #D44B2D 100%);
          color: #FFFFFF;
          font-size: 15px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          margin-top: 6px;
        }
        .pn-switch-mode-bar {
          margin-top: 16px;
          text-align: center;
          font-size: 13px;
          color: #556B60;
        }
        .pn-switch-link {
          color: #E85D3F;
          font-weight: 800;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
        }

        /* RECOVERY CARD */
        .pn-recovery-card {
          background: #FFF8F4;
          border: 1.5px solid #FDBA74;
          border-radius: 18px;
          padding: 20px;
          margin-top: 6px;
        }
        .pn-rc-title {
          font-size: 16px;
          font-weight: 850;
          color: #C2410C;
          margin: 0 0 12px 0;
        }
        .pn-notice-banner {
          background: #FEF3C7;
          border: 1.5px solid #FCD34D;
          border-radius: 12px;
          padding: 12px 14px;
          color: #92400E;
          font-size: 12.5px;
          font-weight: 700;
          margin-bottom: 14px;
        }
        .pn-success-banner {
          margin-top: 16px;
          background: #ECFDF5;
          border: 1.5px solid #6EE7B7;
          border-radius: 14px;
          padding: 14px 16px;
          color: #065F46;
          font-size: 13px;
          font-weight: 700;
        }

        /* MODAL */
        .pn-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(23, 39, 30, 0.6);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .pn-modal-dialog {
          background: #FFFFFF;
          border-radius: 28px;
          border: 2px solid #E85D3F;
          max-width: 580px;
          width: 100%;
          padding: 32px 28px;
        }
        .pn-modal-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .pn-modal-icon { font-size: 26px; }
        .pn-modal-title { font-size: 19px; font-weight: 850; margin: 0; }
        .pn-modal-body { font-size: 13.5px; color: #4B6355; line-height: 1.5; margin-bottom: 20px; }
        .pn-modal-options-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 18px;
        }
        @media (min-width: 540px) {
          .pn-modal-options-grid { grid-template-columns: 1fr 1fr; }
        }
        .pn-m-option {
          border: 1.5px solid #CBD5E1;
          border-radius: 18px;
          padding: 16px;
          background: #FFF8F4;
        }
        .pn-mo-title { font-size: 14.5px; font-weight: 850; margin-bottom: 4px; }
        .pn-mo-price { font-size: 12.5px; font-weight: 800; color: #C2410C; margin-bottom: 6px; }
        .pn-mo-desc { font-size: 11.5px; color: #556B60; line-height: 1.4; margin-bottom: 12px; }
        .pn-mo-btn {
          width: 100%;
          height: 38px;
          border-radius: 99px;
          font-size: 12.5px;
          font-weight: 800;
          border: none;
          cursor: pointer;
        }
        .pn-mo-btn-peach { background: #E85D3F; color: #FFFFFF; }
        .pn-mo-btn-outline { background: #FFFFFF; color: #17271E; border: 1px solid #CBD5E1; }
        .pn-opt-out-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 14px;
        }
        .pn-checkbox { width: 18px; height: 18px; accent-color: #E85D3F; cursor: pointer; }
        .pn-opt-out-label { font-size: 12px; color: #334155; }
        .pn-modal-dismiss-btn {
          width: 100%;
          height: 42px;
          border-radius: 99px;
          background: #F1F5F9;
          color: #475569;
          font-size: 13.5px;
          font-weight: 750;
          border: none;
          cursor: pointer;
        }
      `}</style>

      <div className="pn-auth-backdrop" />

      {/* Top Logo */}
      <div className="pn-auth-brand-header">
        <Link href="/">
          <img src="/peach-app-logo.png" alt="Peach Network" className="pn-auth-logo" />
        </Link>
      </div>

      <div className="pn-auth-card">
        {/* Left Side: Persona Explanations */}
        <div className="pn-auth-sidebar">
          <div className="pn-sidebar-content">
            <div className="pn-sidebar-badge">
              <span>✦</span> {persona === "partner" ? "For Businesses & Churches" : "For Southern Creators"}
            </div>

            {persona === "partner" ? (
              <>
                <h2 className="pn-sidebar-title">
                  Start your project with <span>vetted talent.</span>
                </h2>
                <p className="pn-sidebar-desc">
                  Simple, honest, and reliable. Southern businesses use Peach Coins to get high-impact flyers, brand kits, and video editing done without agency retainers or hidden markups.
                </p>
                <ul className="pn-sidebar-highlights">
                  <li><span className="pn-sh-icon">✓</span><strong>1 Peach Coin = 1 Finished Deliverable</strong></li>
                  <li><span className="pn-sh-icon">✓</span>Matched with local talent from Birmingham, Troy, & the South</li>
                  <li><span className="pn-sh-icon">✓</span>Senior Art Director quality-assurance on every file</li>
                </ul>
              </>
            ) : (
              <>
                <h2 className="pn-sidebar-title">
                  Where Southern creators <span>get respected.</span>
                </h2>
                <p className="pn-sidebar-desc">
                  No unpaid spec work, no platform fees, and no race to the bottom. Get paired with vetted clients and keep 75% of deliverable payouts.
                </p>
                <ul className="pn-sidebar-highlights">
                  <li><span className="pn-sh-icon">✓</span><strong>75% Direct Deliverable Payout</strong> straight to you</li>
                  <li><span className="pn-sh-icon">✓</span>Career ladder: Apprentice → Verified Pro → Senior Mentor</li>
                  <li><span className="pn-sh-icon">✓</span>Peach Hub asset vault & sponsor challenge access</li>
                </ul>
              </>
            )}
          </div>

          <div className="pn-sidebar-footer">
            <span>Peach Network Secure Portal</span>
            <Link href="/" style={{ color: "#FFA585", textDecoration: "none", fontWeight: 700 }}>
              ← Return Home
            </Link>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="pn-auth-form-wrap">
          {/* Persona Switcher Tabs */}
          <div className="pn-persona-toggle-box">
            <button
              type="button"
              className={`pn-p-btn ${persona === "partner" ? "is-active is-partner" : ""}`}
              onClick={() => {
                setPersona("partner");
                setAuthSuccess(null);
                setRecoveryMessage(null);
              }}
            >
              <span>🏢</span> Peach Partner (Business)
            </button>
            <button
              type="button"
              className={`pn-p-btn ${persona === "creative" ? "is-active is-creative" : ""}`}
              onClick={() => {
                setPersona("creative");
                setAuthSuccess(null);
                setRecoveryMessage(null);
              }}
            >
              <span>🎨</span> Peach Creative (Talent)
            </button>
          </div>

          {/* Form Header */}
          {authMode === "recovery" ? (
            <>
              <div className="pn-form-greeting">Trouble Signing In?</div>
              <h1 className="pn-form-title">Password Recovery</h1>
              <p className="pn-form-sub">
                {recoveryStep === "request"
                  ? "Enter your email to receive a 6-digit recovery code."
                  : "Enter the 6-digit code sent to your email to set a new password."}
              </p>
            </>
          ) : persona === "partner" ? (
            authMode === "login" ? (
              <>
                <div className="pn-form-greeting">Peach Partner Portal</div>
                <h1 className="pn-form-title">Welcome back, Peach Partner</h1>
                <p className="pn-form-sub">Sign in to request deliverables, review files, or manage coins.</p>
              </>
            ) : (
              <>
                <div className="pn-form-greeting">Start A Project • Fast 60-Second Setup</div>
                <h1 className="pn-form-title">Sign Up to Start Your Project</h1>
                <p className="pn-form-sub">Easy onboarding for businesses, churches, and local organizers.</p>
              </>
            )
          ) : (
            authMode === "login" ? (
              <>
                <div className="pn-form-greeting">Creator Roster Portal</div>
                <h1 className="pn-form-title">Welcome back, Peach Creative</h1>
                <p className="pn-form-sub">Sign in to access your creative tickets, briefs, and Peach Hub.</p>
              </>
            ) : (
              <>
                <div className="pn-form-greeting">Join The Roster</div>
                <h1 className="pn-form-title">Apply to Join the Network</h1>
                <p className="pn-form-sub">Submit your portfolio for evaluation by our Senior Mentors.</p>
              </>
            )
          )}

          {/* Creative Onboarding Process Callout */}
          {persona === "creative" && authMode === "signup" && (
            <div className="pn-creative-process-banner">
              <div className="pn-cp-title">
                ⏱ Application Takes ~3 Minutes • How It Works:
              </div>
              <ul className="pn-cp-steps">
                <li><strong>1. Submit Portfolio:</strong> Share your best design links and specialties.</li>
                <li><strong>2. Review:</strong> Mentor evaluation completed in 24–48 hours.</li>
                <li><strong>3. Placement:</strong> Placed on the 3-Tier Ladder (Rising, Pro, or Senior).</li>
              </ul>
            </div>
          )}

          {/* FORGOT PASSWORD TROUBLESHOOTER */}
          {authMode === "recovery" ? (
            <div className="pn-recovery-card">
              <h3 className="pn-rc-title">🔑 Reset Your Password</h3>

              {recoveryMessage && (
                <div className="pn-notice-banner">
                  ✓ {recoveryMessage}
                </div>
              )}

              {recoveryStep === "request" ? (
                <form onSubmit={handleSendRecoveryCode} className="pn-auth-form">
                  <div className="pn-input-group">
                    <label className="pn-label">Enter Your Account Email</label>
                    <input
                      type="email"
                      required
                      placeholder="you@company.com"
                      className="pn-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="pn-submit-btn">
                    Send 6-Digit Lost Password Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyRecoveryCode} className="pn-auth-form">
                  <div className="pn-input-group">
                    <label className="pn-label">Enter 6-Digit Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      className="pn-input"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      style={{ letterSpacing: "0.2em", textAlign: "center", fontSize: "18px", fontWeight: 800 }}
                    />
                  </div>
                  <div className="pn-input-group">
                    <label className="pn-label">Choose New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="pn-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="pn-submit-btn">
                    Save Password & Sign In
                  </button>
                </form>
              )}

              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <button
                  type="button"
                  className="pn-switch-link"
                  onClick={() => {
                    setAuthMode("login");
                    setRecoveryStep("request");
                    setRecoveryMessage(null);
                  }}
                >
                  ← Back to Welcome Back Sign In
                </button>
              </div>
            </div>
          ) : (
            /* STANDARD SIGN IN / SIGN UP */
            <>
              {/* Google Button */}
              <button type="button" className="pn-google-btn" onClick={handleGoogleSignIn}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>{authMode === "signup" ? "Sign Up with Google" : "Continue with Google"}</span>
              </button>

              <div className="pn-auth-divider">Or with email & password</div>

              <form className="pn-auth-form" onSubmit={handleSignInOrSignUp}>
                {authMode === "signup" && (
                  <div className="pn-input-group">
                    <label className="pn-label">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      className="pn-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                )}

                {authMode === "signup" && persona === "partner" && (
                  <div className="pn-input-group">
                    <label className="pn-label">Business or Church Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Red Mountain BBQ or Grace Fellowship"
                      className="pn-input"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                )}

                {authMode === "signup" && persona === "creative" && (
                  <>
                    <div className="pn-input-group">
                      <label className="pn-label">Portfolio Link / Instagram</label>
                      <input
                        type="url"
                        required
                        placeholder="https://behance.net/you or yoursite.com"
                        className="pn-input"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                      />
                    </div>
                    <div className="pn-input-group">
                      <label className="pn-label">Creative Specialty</label>
                      <select
                        className="pn-select"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                      >
                        <option value="graphic_design">Graphic & Event Flyer Design</option>
                        <option value="illustration">Brand Identity & Illustration</option>
                        <option value="video_editing">Video Editing & Motion Graphics</option>
                        <option value="web_ui">Web & Storefront UI Design</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="pn-input-group">
                  <label className="pn-label">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="pn-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="pn-input-group">
                  <div className="pn-label-row">
                    <label className="pn-label">Password</label>
                    {authMode === "login" && (
                      <button
                        type="button"
                        className="pn-forgot-link"
                        onClick={() => {
                          setAuthMode("recovery");
                          setRecoveryStep("request");
                          setRecoveryMessage(null);
                        }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="pn-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="pn-submit-btn">
                  {persona === "partner"
                    ? authMode === "login"
                      ? "Sign In as Peach Partner"
                      : "Start Project • Complete Setup"
                    : authMode === "login"
                    ? "Sign In as Peach Creative"
                    : "Submit Creative Application"}
                </button>
              </form>

              {/* Mode Switcher */}
              <div className="pn-switch-mode-bar">
                {authMode === "login" ? (
                  <span>
                    New to Peach Network?{" "}
                    <button
                      type="button"
                      className="pn-switch-link"
                      onClick={() => setAuthMode("signup")}
                    >
                      {persona === "partner" ? "Sign up now (60 seconds)" : "Apply to join the roster"}
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="pn-switch-link"
                      onClick={() => setAuthMode("login")}
                    >
                      Welcome back, sign in here
                    </button>
                  </span>
                )}
              </div>
            </>
          )}

          {authSuccess && (
            <div className="pn-success-banner">
              ✓ {authSuccess}
            </div>
          )}
        </div>
      </div>

      {/* LOW COIN BALANCE / MEMBERSHIP PROMPT */}
      {showLowCoinModal && (
        <div className="pn-modal-backdrop">
          <div className="pn-modal-dialog">
            <div className="pn-modal-header">
              <span className="pn-modal-icon">🪙</span>
              <div>
                <h3 className="pn-modal-title">Hey Peach Partner, your coins are getting low!</h3>
                <span style={{ fontSize: "12px", color: "#E85D3F", fontWeight: 800 }}>
                  Current Balance: {coinBalance} Peach Coins remaining
                </span>
              </div>
            </div>

            <p className="pn-modal-body">
              Want to keep your deliverables moving fast? Start a <strong>Monthly Membership</strong> to get discounted coins and rollover banking, or grab an à la carte top-up.
            </p>

            <div className="pn-modal-options-grid">
              <div className="pn-m-option" style={{ border: "2px solid #E85D3F" }}>
                <div>
                  <div className="pn-mo-title">Monthly Membership</div>
                  <div className="pn-mo-price">From $499 / mo (10 Coins)</div>
                  <p className="pn-mo-desc">
                    ✓ Save up to 20% on all deliverables<br />
                    ✓ Unused coins roll over each month<br />
                    ✓ 24–48h priority queue access
                  </p>
                </div>
                <button
                  type="button"
                  className="pn-mo-btn pn-mo-btn-peach"
                  onClick={() => {
                    setShowLowCoinModal(false);
                    setAuthSuccess("Redirecting to Monthly Membership plans...");
                  }}
                >
                  Explore Memberships
                </button>
              </div>

              <div className="pn-m-option">
                <div>
                  <div className="pn-mo-title">À La Carte Top-Up</div>
                  <div className="pn-mo-price">From $50 / Coin</div>
                  <p className="pn-mo-desc">
                    ✓ Pay only for what you need today<br />
                    ✓ Instant coins added to your vault<br />
                    ✓ No monthly commitment
                  </p>
                </div>
                <button
                  type="button"
                  className="pn-mo-btn pn-mo-btn-outline"
                  onClick={() => {
                    setShowLowCoinModal(false);
                    setAuthSuccess("Opening Coin Top-Up cashier...");
                  }}
                >
                  Top Up Coins
                </button>
              </div>
            </div>

            <div className="pn-opt-out-row">
              <input
                type="checkbox"
                id="dontNotifyCheckbox"
                className="pn-checkbox"
                checked={dontNotifyAgain}
                onChange={(e) => setDontNotifyAgain(e.target.checked)}
              />
              <label htmlFor="dontNotifyCheckbox" className="pn-opt-out-label">
                <strong>Don&apos;t show this notification again</strong>
                <span style={{ display: "block", fontSize: "11px", color: "#64748B", marginTop: 2 }}>
                  You can re-enable low coin balance alerts anytime in your Account Settings.
                </span>
              </label>
            </div>

            <button
              type="button"
              className="pn-modal-dismiss-btn"
              onClick={() => {
                setShowLowCoinModal(false);
                setNotificationDismissed(true);
                setAuthSuccess("Welcome back, Peach Partner! Loading dashboard...");
              }}
            >
              Continue to Dashboard for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading Peach Portal...</div>}>
      <SignInFormContent />
    </Suspense>
  );
}
