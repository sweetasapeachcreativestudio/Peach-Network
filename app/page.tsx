"use client";

import React, { useState } from "react";
import Link from "next/link";
import BrandSplash from "./components/brand-splash";

const RECENT_PROJECTS = [
  {
    id: 1,
    title: "Lawson State Community College",
    category: "Social Media Campaign & Templates",
    deliverable: "Social Media 4-Pack • 3 Coins",
    image: "/projects/project-lawson-state.png",
    fallbackBg: "linear-gradient(135deg, #0D3B66 0%, #001E3D 100%)",
    tag: "Higher Education",
    desc: "Branded student success spotlights, culinary program features, and event social templates.",
  },
  {
    id: 2,
    title: "Bessemer Area Chamber of Commerce",
    category: "Full Brand Identity & Merch System",
    deliverable: "Mini Brand Kit • 6 Coins",
    image: "/projects/project-bessemer-brand.png",
    fallbackBg: "linear-gradient(135deg, #1E40AF 0%, #0F172A 100%)",
    tag: "Civic & Chamber",
    desc: "Official seal, reception signage, business stationery, apparel embroidery, and member merchandise.",
  },
  {
    id: 3,
    title: "Reignbows Children's Boutique",
    category: "E-Commerce Storefront & Mobile UI",
    deliverable: "Web Experience • 10 Coins",
    image: "/projects/project-reignbows.png",
    fallbackBg: "linear-gradient(135deg, #E65C00 0%, #F9D423 100%)",
    tag: "Retail & E-Commerce",
    desc: "Responsive Shopify desktop & mobile store with seasonal lookbooks and product bundle carts.",
  },
  {
    id: 4,
    title: "Bessemer Chamber of Commerce",
    category: "Official Website & Member Portal",
    deliverable: "Web Platform • 10 Coins",
    image: "/projects/project-bessemer-web.png",
    fallbackBg: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
    tag: "Web & Portal",
    desc: "'Building Connections That Matter' responsive portal with membership onboarding and event calendar.",
  },
  {
    id: 5,
    title: "New Joy Fellowship Baptist Church",
    category: "Event Program & Editorial Print Kit",
    deliverable: "Print Collateral • 4 Coins",
    image: "/projects/project-church-program.png",
    fallbackBg: "linear-gradient(135deg, #8B5CF6 0%, #4C1D95 100%)",
    tag: "Faith & Community",
    desc: "Friends & Family Day 2026 commemorative order of service, program booklet, and social invitations.",
  },
  {
    id: 6,
    title: "New Joy Fellowship BBQ Fundraiser",
    category: "Fundraiser Menu Board & Signage",
    deliverable: "Event Signage • 2 Coins",
    image: "/projects/project-church-menu.png",
    fallbackBg: "linear-gradient(135deg, #78350F 0%, #451A03 100%)",
    tag: "Community Event",
    desc: "High-contrast woodgrain event menu board, combo meal pricing, and on-site sponsorship signage.",
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="pn-home-root">
      {/* Cinematic Splash Screen */}
      <BrandSplash />

      <style>{`
        .pn-home-root {
          min-height: 100vh;
          background-color: #FAF2EB;
          color: #1A2821;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* TOP NAVIGATION HEADER */
        .pn-header {
          position: sticky;
          top: 0;
          z-index: 90;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 20px 24px;
          box-sizing: border-box;
          background: rgba(250, 242, 235, 0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(232, 139, 104, 0.18);
        }

        /* MUCH BIGGER LOGO */
        .pn-header-logo-link {
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        .pn-header-logo {
          height: clamp(44px, 5vw, 56px);
          width: auto;
          display: block;
          filter: drop-shadow(0 4px 12px rgba(24, 34, 29, 0.08));
        }

        /* TOP RIGHT NAV GROUP */
        .pn-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Prominent Sign In at Top Right */
        .pn-top-signin-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 22px;
          font-size: 14px;
          font-weight: 700;
          color: #1E3A2B;
          background: rgba(255, 255, 255, 0.9);
          border: 1.5px solid rgba(30, 58, 43, 0.2);
          border-radius: 99px;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(30, 58, 43, 0.04);
        }
        .pn-top-signin-btn:hover {
          background: #FFFFFF;
          border-color: #E85D3F;
          color: #E85D3F;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(232, 93, 63, 0.15);
        }

        .pn-menu-btn {
          background: rgba(255, 255, 255, 0.9);
          border: 1.5px solid rgba(232, 139, 104, 0.28);
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
          border-color: #E85D3F;
          transform: scale(1.04);
        }
        .pn-menu-bar {
          width: 20px;
          height: 2.2px;
          background-color: #1E3A2B;
          border-radius: 2px;
        }

        /* HERO SECTION (2-COLUMN EDITORIAL ON DESKTOP) */
        .pn-hero-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 24px 64px 24px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: center;
          min-height: calc(88vh - 84px);
        }

        @media (min-width: 960px) {
          .pn-hero-section {
            grid-template-columns: 1.08fr 0.92fr;
            gap: 64px;
            padding: 48px 24px 80px 24px;
          }
        }

        /* LEFT HERO COLUMN */
        .pn-hero-text-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        /* Elevated Eyebrow Badge */
        .pn-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFFFFF;
          border: 1.5px solid #E88B68;
          border-radius: 100px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 800;
          color: #E85D3F;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 22px;
          box-shadow: 0 4px 16px rgba(232, 93, 63, 0.12);
        }
        .pn-eyebrow-spark {
          color: #E85D3F;
          font-size: 14px;
        }

        /* Headline */
        .pn-hero-title {
          font-size: clamp(38px, 5.2vw, 62px);
          line-height: 1.08;
          font-weight: 850;
          letter-spacing: -0.03em;
          color: #162B20;
          margin: 0 0 20px 0;
        }
        .pn-hero-title span.pn-accent {
          color: #E85D3F;
          font-style: italic;
          font-family: Georgia, "Playfair Display", serif;
          font-weight: 400;
        }

        /* Subhead */
        .pn-hero-lead {
          font-size: clamp(16px, 2.2vw, 19px);
          line-height: 1.55;
          color: #40554A;
          font-weight: 500;
          margin: 0 0 34px 0;
          max-width: 540px;
        }

        /* Action Buttons */
        .pn-hero-actions {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
        }

        @media (min-width: 520px) {
          .pn-hero-actions {
            flex-direction: row;
            width: auto;
          }
        }

        .pn-btn-green {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 56px;
          padding: 0 34px;
          background-color: #183324;
          color: #FFFFFF;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.01em;
          border-radius: 99px;
          text-decoration: none;
          box-shadow: 0 10px 24px rgba(24, 51, 36, 0.22);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
          cursor: pointer;
        }
        .pn-btn-green:hover {
          background-color: #0F2217;
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(24, 51, 36, 0.3);
        }

        .pn-btn-peach {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 56px;
          padding: 0 34px;
          background: #FFFFFF;
          color: #183324;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.01em;
          border-radius: 99px;
          text-decoration: none;
          border: 1.5px solid rgba(232, 139, 104, 0.5);
          box-shadow: 0 4px 14px rgba(232, 139, 104, 0.1);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .pn-btn-peach:hover {
          background: #FFF9F5;
          border-color: #E85D3F;
          color: #E85D3F;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(232, 139, 104, 0.18);
        }

        /* RIGHT HERO COLUMN: The Smiling Creative Woman */
        .pn-hero-visual-wrap {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .pn-portrait-frame {
          position: relative;
          width: 100%;
          max-width: 480px;
          aspect-ratio: 4 / 5;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 
            0 24px 60px rgba(30, 58, 43, 0.18),
            0 4px 16px rgba(232, 139, 104, 0.2);
          border: 4px solid #FFFFFF;
          background: #EED7CA;
        }

        .pn-portrait-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          /* Specifically targets her face so she is 100% visible */
          object-position: center 25%;
          display: block;
        }

        /* Floating Trust Pill Badge */
        .pn-floating-badge {
          position: absolute;
          bottom: 24px;
          left: 24px;
          right: 24px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(232, 139, 104, 0.35);
          border-radius: 20px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 12px 30px rgba(24, 34, 29, 0.12);
        }

        .pn-badge-avatar-ring {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #E85D3F;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-weight: 800;
          font-size: 16px;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(232, 93, 63, 0.3);
        }

        .pn-badge-text-title {
          font-size: 13px;
          font-weight: 800;
          color: #1A2821;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pn-badge-online-dot {
          width: 7px;
          height: 7px;
          background: #10B981;
          border-radius: 50%;
          display: inline-block;
        }
        .pn-badge-text-sub {
          font-size: 11px;
          color: #5F7368;
          margin-top: 2px;
        }

        /* SECTION 2: SLIDING PROJECT EXAMPLES ("THIS COULD BE YOU") */
        .pn-projects-section {
          width: 100%;
          padding: 60px 0 80px 0;
          background: linear-gradient(180deg, rgba(250, 242, 235, 0) 0%, #FFFFFF 35%, #FFFFFF 100%);
          position: relative;
          overflow: hidden;
        }

        .pn-projects-header {
          max-width: 1280px;
          margin: 0 auto 36px auto;
          padding: 0 24px;
          text-align: center;
        }

        .pn-projects-kicker {
          font-size: 12px;
          font-weight: 800;
          color: #E85D3F;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .pn-projects-title {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          color: #1A2821;
          letter-spacing: -0.02em;
          margin: 0 0 12px 0;
        }

        .pn-projects-subtitle {
          font-size: 16px;
          color: #556B60;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.5;
        }

        /* Infinite Sliding Track */
        .pn-marquee-wrap {
          display: flex;
          width: 100%;
          overflow: hidden;
          position: relative;
          mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
        }

        .pn-marquee-track {
          display: flex;
          gap: 24px;
          width: max-content;
          animation: pnMarquee 42s linear infinite;
        }
        .pn-marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes pnMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Project Card Design */
        .pn-project-card {
          width: 360px;
          background: #FAF2EB;
          border-radius: 24px;
          overflow: hidden;
          border: 1.5px solid rgba(232, 139, 104, 0.22);
          box-shadow: 0 10px 30px rgba(24, 34, 29, 0.07);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
        }
        .pn-project-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 18px 40px rgba(232, 93, 63, 0.16);
          border-color: #E85D3F;
        }

        .pn-card-media {
          width: 100%;
          height: 230px;
          position: relative;
          overflow: hidden;
          background-color: #1E293B;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pn-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .pn-project-card:hover .pn-card-img {
          transform: scale(1.05);
        }

        .pn-card-coin-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(24, 51, 36, 0.9);
          backdrop-filter: blur(8px);
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          padding: 6px 12px;
          border-radius: 99px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }

        .pn-card-tag-badge {
          position: absolute;
          bottom: 14px;
          left: 14px;
          background: rgba(255, 255, 255, 0.95);
          color: #E85D3F;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 5px 12px;
          border-radius: 99px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .pn-card-body {
          padding: 20px 22px 24px 22px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .pn-card-client-title {
          font-size: 18px;
          font-weight: 800;
          color: #1A2821;
          margin: 0 0 6px 0;
          line-height: 1.3;
        }

        .pn-card-deliverable-label {
          font-size: 13px;
          font-weight: 700;
          color: #E85D3F;
          margin-bottom: 10px;
        }

        .pn-card-desc {
          font-size: 13px;
          line-height: 1.5;
          color: #556B60;
          margin: 0;
        }

        /* DRAWER NAVIGATION */
        .pn-nav-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 51, 36, 0.45);
          backdrop-filter: blur(6px);
          z-index: 100;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .pn-nav-overlay.is-open {
          opacity: 1;
          pointer-events: auto;
        }

        .pn-nav-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 320px;
          background-color: #FAF2EB;
          z-index: 101;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: -10px 0 30px rgba(0,0,0,0.12);
        }
        .pn-nav-drawer.is-open {
          transform: translateX(0);
        }

        .pn-drawer-close {
          align-self: flex-end;
          background: none;
          border: none;
          font-size: 1.6rem;
          color: #1E3A2B;
          cursor: pointer;
          margin-bottom: 36px;
          padding: 4px;
        }

        .pn-drawer-links {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .pn-drawer-link {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1E3A2B;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .pn-drawer-link:hover {
          color: #E85D3F;
        }
      `}</style>

      {/* TOP HEADER */}
      <header className="pn-header">
        <Link href="/" className="pn-header-logo-link">
          <img
            src="/peach-app-logo.png"
            alt="Peach Network"
            className="pn-header-logo"
          />
        </Link>

        <div className="pn-header-right">
          <Link href="/signin" className="pn-top-signin-btn">
            Sign In
          </Link>

          <button
            className="pn-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <span className="pn-menu-bar" />
            <span className="pn-menu-bar" />
            <span className="pn-menu-bar" />
          </button>
        </div>
      </header>

      {/* TWO-COLUMN EDITORIAL HERO SECTION */}
      <section className="pn-hero-section">
        {/* LEFT COLUMN: Copy & Actions */}
        <div className="pn-hero-text-wrap">
          <div className="pn-hero-eyebrow">
            <span className="pn-eyebrow-spark">✦</span>
            Birmingham's Creative Marketplace
          </div>

          <h1 className="pn-hero-title">
            The right creative.<br />
            Right when you <span className="pn-accent">need them.</span>
          </h1>

          <p className="pn-hero-lead">
            Vetted creatives. Quality work for fair prices. Connecting Southern businesses with top-tier local design, branding, and web talent.
          </p>

          <div className="pn-hero-actions">
            <Link href="/match" className="pn-btn-green">
              Find a Creative
            </Link>
            <Link href="/apply" className="pn-btn-peach">
              Join the Network
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: The Smiling Creative Woman */}
        <div className="pn-hero-visual-wrap">
          <div className="pn-portrait-frame">
            <img
              src="/hero-creative.jpg"
              alt="Vetted Birmingham Creative smiling at laptop"
              className="pn-portrait-img"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('hero-bg.png')) {
                  target.src = '/hero-bg.png';
                }
              }}
            />

            {/* Floating Trust Card */}
            <div className="pn-floating-badge">
              <div className="pn-badge-avatar-ring">✦</div>
              <div>
                <div className="pn-badge-text-title">
                  <span className="pn-badge-online-dot" />
                  Birmingham Talent Network
                </div>
                <div className="pn-badge-text-sub">
                  Vetted Designers • 24–48h Turnaround • 75% Payout
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFINITE SLIDING MARQUEE: RECENT WORK FROM THE NETWORK */}
      <section className="pn-projects-section">
        <div className="pn-projects-header">
          <div className="pn-projects-kicker">✦ This Could Be Your Next Project ✦</div>
          <h2 className="pn-projects-title">Recent Work from the Network</h2>
          <p className="pn-projects-subtitle">
            Explore deliverables crafted for Birmingham institutions, civic chambers, community programs, and growing regional brands.
          </p>
        </div>

        {/* Continuous Looping Track */}
        <div className="pn-marquee-wrap">
          <div className="pn-marquee-track">
            {/* First Loop Set */}
            {RECENT_PROJECTS.map((proj) => (
              <div key={proj.id} className="pn-project-card">
                <div className="pn-card-media" style={{ background: proj.fallbackBg }}>
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="pn-card-img"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="pn-card-coin-badge">{proj.deliverable}</div>
                  <div className="pn-card-tag-badge">{proj.tag}</div>
                </div>
                <div className="pn-card-body">
                  <h3 className="pn-card-client-title">{proj.title}</h3>
                  <div className="pn-card-deliverable-label">{proj.category}</div>
                  <p className="pn-card-desc">{proj.desc}</p>
                </div>
              </div>
            ))}

            {/* Duplicate Set for Seamless Continuous Loop */}
            {RECENT_PROJECTS.map((proj) => (
              <div key={`dup-${proj.id}`} className="pn-project-card">
                <div className="pn-card-media" style={{ background: proj.fallbackBg }}>
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="pn-card-img"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="pn-card-coin-badge">{proj.deliverable}</div>
                  <div className="pn-card-tag-badge">{proj.tag}</div>
                </div>
                <div className="pn-card-body">
                  <h3 className="pn-card-client-title">{proj.title}</h3>
                  <div className="pn-card-deliverable-label">{proj.category}</div>
                  <p className="pn-card-desc">{proj.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE DRAWER NAVIGATION */}
      <div
        className={`pn-nav-overlay ${menuOpen ? "is-open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />
      <aside className={`pn-nav-drawer ${menuOpen ? "is-open" : ""}`}>
        <button
          className="pn-drawer-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Close Navigation"
        >
          ✕
        </button>
        <nav className="pn-drawer-links">
          <Link href="/" className="pn-drawer-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link href="/match" className="pn-drawer-link" onClick={() => setMenuOpen(false)}>
            Find a Creative
          </Link>
          <Link href="/apply" className="pn-drawer-link" onClick={() => setMenuOpen(false)}>
            Join the Network
          </Link>
          <Link href="/about" className="pn-drawer-link" onClick={() => setMenuOpen(false)}>
            About Us
          </Link>
          <Link href="/signin" className="pn-drawer-link" onClick={() => setMenuOpen(false)}>
            Sign In
          </Link>
        </nav>
      </aside>
    </main>
  );
}
