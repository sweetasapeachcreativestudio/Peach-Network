"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="pn-root">
      <style>{`
        html { scroll-behavior: smooth; }
        section[id] { scroll-margin-top: 90px; }

        .pn-root {
          min-height: 100vh;
          background-color: #FFF8F4;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #17271E;
        }

        .pn-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 248, 244, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1.5px solid rgba(232, 93, 63, 0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
        }

        .pn-header-logo {
          height: 48px;
          width: auto;
        }

        .pn-nav-links {
          display: none;
          align-items: center;
          gap: 20px;
        }
        @media (min-width: 860px) {
          .pn-nav-links {
            display: flex;
          }
        }

        .pn-nav-link {
          font-size: 14px;
          font-weight: 750;
          color: #2D4236;
          text-decoration: none;
        }

        .pn-signin-btn {
          height: 40px;
          padding: 0 18px;
          border-radius: 99px;
          background: #FFFFFF;
          border: 1.5px solid rgba(232, 93, 63, 0.35);
          color: #17271E;
          font-size: 13.5px;
          font-weight: 750;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        /* HIDE HAMBURGER ON DESKTOP */
        .pn-menu-btn {
          background: #FFFFFF;
          border: 1.5px solid rgba(232, 93, 63, 0.28);
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
        }
        @media (min-width: 860px) {
          .pn-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 859px) {
          .pn-signin-btn {
            display: none !important;
          }
        }

        .pn-menu-bar {
          width: 18px;
          height: 2px;
          background-color: #E85D3F;
          border-radius: 2px;
        }

        /* HERO */
        .pn-hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 24px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: center;
        }
        @media (min-width: 900px) {
          .pn-hero {
            grid-template-columns: 1.1fr 0.9fr;
          }
        }

        .pn-badge {
          display: inline-block;
          background: #FFE8DC;
          color: #C2410C;
          font-size: 12px;
          font-weight: 800;
          padding: 6px 14px;
          border-radius: 99px;
          margin-bottom: 16px;
        }

        .pn-hero-title {
          font-size: clamp(34px, 4.5vw, 54px);
          font-weight: 850;
          line-height: 1.15;
          margin: 0 0 16px 0;
          color: #17271E;
        }
        .pn-hero-title span {
          color: #E85D3F;
        }

        .pn-hero-desc {
          font-size: 17px;
          line-height: 1.6;
          color: #4B6355;
          margin: 0 0 28px 0;
        }

        .pn-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        .pn-btn-primary {
          height: 52px;
          padding: 0 26px;
          border-radius: 99px;
          background: linear-gradient(135deg, #E85D3F 0%, #D44B2D 100%);
          color: #FFFFFF;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 20px rgba(232, 93, 63, 0.35);
        }

        .pn-btn-secondary {
          height: 52px;
          padding: 0 24px;
          border-radius: 99px;
          background: #FFFFFF;
          border: 1.5px solid #06B6D4;
          color: #0284C7;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        /* SPOTLIGHT CARD */
        .pn-spotlight {
          background: #FFFFFF;
          border-radius: 24px;
          border: 2px solid rgba(232, 93, 63, 0.2);
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(23, 39, 30, 0.08);
        }
        .pn-spotlight img {
          width: 100%;
          height: 380px;
          object-fit: cover;
          display: block;
        }
        .pn-spotlight-info {
          padding: 20px;
        }
      `}</style>

      {/* HEADER */}
      <header className="pn-header">
        <Link href="/">
          <img src="/peach-app-logo.png" alt="Peach Network" className="pn-header-logo" />
        </Link>

        <nav className="pn-nav-links">
          <a href="#creatives" className="pn-nav-link">Our Creatives</a>
          <a href="#pricing" className="pn-nav-link">Coins & Pricing</a>
          <a href="https://www.youtube.com/@SweetAsapeachCS" target="_blank" rel="noreferrer" className="pn-nav-link">
            ▶ YouTube
          </a>
          <Link href="/signin?mode=login" className="pn-signin-btn">
            Sign In
          </Link>
        </nav>

        <button
          className="pn-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          <span className="pn-menu-bar" />
          <span className="pn-menu-bar" />
          <span className="pn-menu-bar" />
        </button>
      </header>

      {/* HERO SECTION */}
      <section className="pn-hero">
        <div>
          <div className="pn-badge">✦ Southern Creative Network</div>
          <h1 className="pn-hero-title">
            Vetted Creatives You Can Trust at <span>Affordable Prices.</span>
          </h1>
          <p className="pn-hero-desc">
            More Creatives. Stronger Businesses. A Sweeter South. Good design done right, with real Southern hospitality. No agency retainers, zero bidding wars.
          </p>

          <div className="pn-hero-actions">
            {/* Takes business straight to setup */}
            <Link href="/signin?role=partner&mode=signup" className="pn-btn-primary">
              ⚡ Start a Project (From $50)
            </Link>

            {/* Smoothly scrolls to creatives */}
            <a href="#creatives" className="pn-btn-secondary">
              ✨ Meet Our Creatives
            </a>
          </div>
        </div>

        {/* CREATIVE SPOTLIGHT CARD */}
        <div id="creatives" className="pn-spotlight">
          <img src="/josedesk.jpg" alt="Jose M. - Video Editor & Illustrator" />
          <div className="pn-spotlight-info">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 850 }}>Jose M.</h3>
              <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: 800 }}>● Available Now</span>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748B" }}>
              Video Editor • Illustrator • Graphic & Motion Designer • 2026 ADDY® Award Winner
            </p>
          </div>
        </div>
      </section>

      {/* PRICING ANCHOR */}
      <section id="pricing" style={{ padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 850, margin: "0 0 8px 0" }}>
          1 Peach Coin = 1 Finished Deliverable
        </h2>
        <p style={{ color: "#556B60", margin: "0 0 24px 0" }}>
          Flat coin pricing with fast 24–48h turnaround.
        </p>
        <Link href="/signin?role=partner&mode=signup" className="pn-btn-primary">
          Start Your Project (60-Second Setup)
        </Link>
      </section>
    </main>
  );
}
