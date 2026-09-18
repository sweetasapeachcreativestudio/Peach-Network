"use client";

import React, { useState } from "react";
import Link from "next/link";
import BrandSplash from "./components/brand-splash";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="pn-home-root">
      {/* Cinematic Splash Screen */}
      <BrandSplash />

      {/* Main Hero Section */}
      <section className="pn-hero-container">
        <style>{`
          .pn-home-root {
            min-height: 100vh;
            background-color: #F7E7DE;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", sans-serif;
          }

          .pn-hero-container {
            position: relative;
            min-height: 100vh;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background-color: #F7E7DE;
            background-image: url('/hero-bg.png');
            background-size: cover;
            background-position: center top;
            background-repeat: no-repeat;
            overflow: hidden;
            padding: 24px 20px 40px 20px;
            box-sizing: border-box;
          }

          /* Ambient gradient overlay to keep text crisp over the desk & laptop */
          .pn-hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              180deg, 
              rgba(255, 255, 255, 0.1) 0%, 
              rgba(250, 237, 229, 0.15) 35%, 
              rgba(247, 229, 219, 0.9) 68%, 
              #F7E5DB 96%
            );
            pointer-events: none;
            z-index: 1;
          }

          /* Top Header: Logo + Hamburger */
          .pn-header {
            position: relative;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            max-width: 1140px;
            margin: 0 auto;
          }

          .pn-header-logo {
            height: 38px;
            width: auto;
            display: block;
          }

          .pn-menu-btn {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(232, 139, 104, 0.25);
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
            cursor: pointer;
            transition: all 0.2s ease;
            padding: 0;
          }
          .pn-menu-btn:hover {
            background: #FFFFFF;
            transform: scale(1.04);
          }
          .pn-menu-bar {
            width: 20px;
            height: 2px;
            background-color: #1E3A2B;
            border-radius: 2px;
          }

          /* Hero Content Area */
          .pn-hero-content {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 520px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
            padding-top: 190px; /* Space for the creative's face above */
          }

          /* Eyebrow Badge */
          .pn-eyebrow-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(255, 255, 255, 0.88);
            border: 1px solid rgba(232, 139, 104, 0.38);
            backdrop-filter: blur(8px);
            color: #E85D3F;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.04em;
            padding: 6px 14px;
            border-radius: 99px;
            margin-bottom: 14px;
            box-shadow: 0 4px 12px rgba(232, 139, 104, 0.12);
          }

          /* Bold Headline */
          .pn-hero-headline {
            font-size: clamp(34px, 7.5vw, 46px);
            font-weight: 800;
            line-height: 1.1;
            letter-spacing: -0.02em;
            color: #1A2821;
            margin: 0 0 14px 0;
          }

          /* Subhead */
          .pn-hero-subhead {
            font-size: clamp(15px, 3.8vw, 17px);
            line-height: 1.45;
            color: #4A5B52;
            font-weight: 500;
            margin: 0 0 28px 0;
            max-width: 440px;
          }

          /* Button Stack */
          .pn-btn-group {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 12px;
          }

          /* Button 1: Solid Forest Green */
          .pn-btn-primary {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 54px;
            background-color: #1E3A2B;
            color: #FFFFFF;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 0.01em;
            border-radius: 99px;
            text-decoration: none;
            box-shadow: 0 8px 20px rgba(30, 58, 43, 0.22);
            transition: all 0.2s ease;
            border: none;
            cursor: pointer;
          }
          .pn-btn-primary:hover {
            background-color: #152B1F;
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(30, 58, 43, 0.28);
          }

          /* Button 2: Outlined Soft Cream/Peach Pill */
          .pn-btn-secondary {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 54px;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(8px);
            color: #1E3A2B;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 0.01em;
            border-radius: 99px;
            text-decoration: none;
            border: 1.5px solid rgba(232, 139, 104, 0.35);
            box-shadow: 0 4px 12px rgba(24, 34, 29, 0.04);
            transition: all 0.2s ease;
            cursor: pointer;
          }
          .pn-btn-secondary:hover {
            background: #FFFFFF;
            border-color: #E85D3F;
            transform: translateY(-2px);
            box-shadow: 0 8px 18px rgba(232, 139, 104, 0.15);
          }

          /* Sign In link */
          .pn-signin-wrap {
            margin-top: 18px;
            width: 100%;
            text-align: center;
          }
          .pn-signin-link {
            font-size: 14px;
            color: #5F7368;
            text-decoration: none;
            transition: color 0.2s ease;
          }
          .pn-signin-link strong {
            color: #1E3A2B;
            font-weight: 700;
            text-decoration: underline;
            text-underline-offset: 3px;
          }
          .pn-signin-link:hover {
            color: #E85D3F;
          }

          /* Desktop View */
          @media (min-width: 768px) {
            .pn-hero-container {
              padding: 32px 48px;
              background-position: right 25% top;
            }
            .pn-hero-content {
              margin: auto 0;
              padding-top: 60px;
              max-width: 580px;
            }
            .pn-btn-group {
              flex-direction: row;
              width: auto;
            }
            .pn-btn-primary, .pn-btn-secondary {
              width: 220px;
            }
            .pn-signin-wrap {
              text-align: left;
              padding-left: 8px;
            }
          }
        `}</style>

        {/* Contrast Overlay */}
        <div className="pn-hero-overlay" />

        {/* Top Header */}
        <header className="pn-header">
          <Link href="/">
            <img
              src="/peach-app-logo.png"
              alt="Peach Network"
              className="pn-header-logo"
            />
          </Link>
          <button 
            className="pn-menu-btn" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="pn-menu-bar" />
            <span className="pn-menu-bar" />
            <span className="pn-menu-bar" />
          </button>
        </header>

        {/* Hero Copy & CTA Buttons */}
        <div className="pn-hero-content">
          <div className="pn-eyebrow-badge">
            <span>✦</span> Birmingham's Creative Marketplace
          </div>

          <h1 className="pn-hero-headline">
            The right creative.<br />
            Right when you need them.
          </h1>

          <p className="pn-hero-subhead">
            Vetted creatives. Quality work for fair prices. Connecting Southern businesses with top-tier local design talent.
          </p>

          <div className="pn-btn-group">
            <Link href="/match" className="pn-btn-primary">
              Find a Creative
            </Link>
            <Link href="/apply" className="pn-btn-secondary">
              Join the Network
            </Link>
          </div>

          <div className="pn-signin-wrap">
            <Link href="/signin" className="pn-signin-link">
              Already have an account? <strong>Sign in</strong>
            </Link>
          </div>
        </div>

        {/* Balance Spacer */}
        <div style={{ position: "relative", zIndex: 10, height: 1 }} />
      </section>
    </main>
  );
}
