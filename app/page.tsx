"use client";

import React, { useState } from "react";
import Link from "next/link";
import BrandSplash from "./components/brand-splash";

interface ProjectItem {
  id: number;
  title: string;
  client: string;
  category: string;
  coins: number;
  turnaround: string;
  image: string;
  description: string;
  specs: string[];
}

const PROJECTS: ProjectItem[] = [
  {
    id: 1,
    title: "Empower Her Heart Mobile UI & Web Portal",
    client: "Lillian Hewitt, Black Women's Heart Health, LLC",
    category: "Mobile UI & Web Experience",
    coins: 10,
    turnaround: "5 Days",
    image: "/lillian-project.jpg",
    description: "A responsive digital experience and mobile health prototype created for a Birmingham founder.",
    specs: ["Responsive Web Portal", "Mobile App UI Prototype", "Custom Interface Assets", "Launch-ready design handoff"]
  },
  {
    id: 2,
    title: "Runa Cultural Brand & Moon Iconography",
    client: "Runa Streetwear Apparel",
    category: "Brand Identity & Apparel",
    coins: 6,
    turnaround: "3 Days",
    image: "/project 7.jpg",
    description: "A distinctive crescent-moon identity system and apparel artwork built around the brand's visual story.",
    specs: ["Primary & Submark Logos", "Apparel Vector Artwork", "Typography System", "Print-ready files"]
  },
  {
    id: 3,
    title: "Bessemer Chamber Brand & Web Kit",
    client: "Bessemer Area Chamber of Commerce",
    category: "Brand Identity & Web UI",
    coins: 8,
    turnaround: "5–7 Days",
    image: "/Project 3.png",
    description: "A civic identity system and web presence designed to make local business resources easier to navigate.",
    specs: ["Primary civic identity", "Supporting collateral", "Brand palette & guides", "Production vector files"]
  },
  {
    id: 4,
    title: "Lawson State Student Campaign",
    client: "Lawson State Community College",
    category: "Social Media Campaign",
    coins: 3,
    turnaround: "48 Hours",
    image: "/Project 1.png",
    description: "A cohesive social campaign highlighting student achievement and program opportunities across Birmingham.",
    specs: ["4 social media designs", "Feed & story formats", "Brand guidelines styling", "Editable source files"]
  },
  {
    id: 5,
    title: "New Joy Fellowship Program Suite",
    client: "New Joy Fellowship Baptist Church",
    category: "Editorial & Print Design",
    coins: 4,
    turnaround: "48–72 Hours",
    image: "/Project 4.png",
    description: "A coordinated print and digital event suite for a historic Birmingham community congregation.",
    specs: ["Print-ready program (300 DPI)", "Digital mobile version", "Social announcement graphics", "Archive vector files"]
  },
  {
    id: 6,
    title: "Grand Opening Campaign Kit",
    client: "Woodlawn Bakehouse & Artisan Market",
    category: "Print & Social Launch Kit",
    coins: 2,
    turnaround: "3–4 Days",
    image: "/Project 2.png",
    description: "Pre-scoped flagship campaign kit: 1 high-res print flyer with 300 DPI press bleeds + 2 promotional social assets.",
    specs: ["1 Commercial Print Flyer (CMYK)", "1 Instagram Square (1080x1080)", "1 Instagram Story (1080x1920)", "Stored in client Brand Vault"]
  }
];

const DISCIPLINES = [
  {
    role: "Photographers",
    headline: "Showcase your work. Get hired.",
    image: "/Creative5.jpg",
    tag: "Photography"
  },
  {
    role: "Designers & Brand",
    headline: "Create. Collaborate. Grow.",
    image: "/hero-bg.png",
    tag: "Brand & Graphic"
  },
  {
    role: "Video Creators",
    headline: "Turn your talent into opportunity.",
    image: "/Creative 3.jpg",
    tag: "Video & Motion"
  },
  {
    role: "Writers & Storytellers",
    headline: "Your words matter here.",
    image: "/Creative 4.jpg",
    tag: "Copy & Story"
  },
  {
    role: "Local Businesses",
    headline: "Find the right creative. Get it done.",
    image: "/brand/business-owner.jpg",
    tag: "Birmingham Merchants"
  }
];

const PACKAGES = [
  {
    name: "Quick Graphic / Menu Insert",
    coins: "1 Coin",
    price: "$50",
    payout: "$37.50 creative net",
    turnaround: "24–48 Hours",
    description: "Perfect for single event flyers, menu updates, specials, or social story promotions."
  },
  {
    name: "Grand Opening Campaign Kit (Flagship)",
    coins: "2 Coins",
    price: "$100",
    payout: "$75.00 creative net",
    turnaround: "3–4 Days",
    description: "Our most popular package: 1 print-ready flyer (300 DPI CMYK) + 2 matched social media assets.",
    highlight: true
  },
  {
    name: "Complete Brand Identity Starter",
    coins: "4 Coins",
    price: "$200",
    payout: "$150.00 creative net",
    turnaround: "5–7 Days",
    description: "Primary logo, mark, typography pairings, color palette, and vector brand file packaging."
  },
  {
    name: "Full Packaging & Storefront Suite",
    coins: "8 Coins",
    price: "$400",
    payout: "$300.00 creative net",
    turnaround: "10–12 Days",
    description: "Complete packaging layout, retail window graphics, branded merchandise, and print production prep."
  }
];

export default function HomePage() {
  const [selected, setSelected] = useState<ProjectItem | null>(null);
  const [audienceTab, setAudienceTab] = useState<"business" | "creative">("business");

  return (
    <main className="ph">
      <BrandSplash />

      <style>{`
        :root {
          --ph-green: #0d2f24;
          --ph-green-light: #173c2a;
          --ph-green-soft: #23523c;
          --ph-orange: #f08a62;
          --ph-orange-deep: #e85d3f;
          --ph-peach-soft: #fff2e9;
          --ph-cream: #fffaf5;
          --ph-cream-card: #ffffff;
          --ph-ink: #17271e;
          --ph-muted: #56685f;
          --ph-border: #ebdcd3;
          --ph-border-soft: #f3e9e2;
          --ph-cyan: #70eaff;
          --ph-burnt-orange: #e54307;
        }

        * {
          box-sizing: border-box;
        }

        .ph {
          min-height: 100vh;
          background: var(--ph-cream);
          color: var(--ph-ink);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          overflow-x: hidden;
          line-height: 1.5;
        }

        /* Top Announcement Strip */
        .ph-topbar {
          background: var(--ph-green);
          color: #f7ede6;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          letter-spacing: 0.02em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .ph-topbar strong {
          color: #fed7aa;
        }

        /* Nav Header */
        .ph-nav {
          min-height: 116px;
          max-width: 1220px;
          margin: auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .ph-logo-link {
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .ph-logo {
          width: 200px;
          height: 100px;
          display: block;
          margin: 0 auto;
          object-fit: contain;
          transition: transform 0.2s ease;
        }

        .ph-logo:hover {
          transform: scale(1.02);
        }

        .ph-navlinks {
          position: absolute;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ph-link {
          color: var(--ph-green);
          text-decoration: none;
          font-weight: 800;
          font-size: 14px;
          transition: color 0.15s ease;
        }

        .ph-link:hover {
          color: var(--ph-orange-deep);
        }

        .ph-pill {
          padding: 11px 22px;
          border: 1px solid var(--ph-border);
          border-radius: 999px;
          background-color: var(--ph-cyan);
          color: var(--ph-burnt-orange);
          font-weight: 850;
          font-size: 14px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(112, 234, 255, 0.35);
        }

        .ph-pill:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(112, 234, 255, 0.45);
        }

        /* Hero Section */
        .ph-hero {
          max-width: 1220px;
          margin: auto;
          padding: 36px 24px 64px;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 56px;
          align-items: center;
        }

        .ph-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c2410c;
          background: #ffedd5;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid #fed7aa;
          margin-bottom: 16px;
        }

        .ph-hero h1 {
          font-size: clamp(40px, 4.8vw, 64px);
          line-height: 1.05;
          letter-spacing: -0.04em;
          margin: 0 0 18px;
          color: var(--ph-green);
          font-weight: 900;
        }

        .ph-hero h1 em {
          font-family: Georgia, serif;
          font-weight: 400;
          font-style: italic;
          color: var(--ph-orange-deep);
        }

        .ph-heart {
          display: inline-block;
          font-style: normal;
          color: var(--ph-orange);
          margin-left: 4px;
        }

        .ph-sub {
          font-size: 18px;
          line-height: 1.6;
          color: var(--ph-muted);
          max-width: 580px;
          margin: 0 0 28px;
        }

        .ph-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          align-items: center;
        }

        .ph-primary {
          min-height: 52px;
          padding: 0 28px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 850;
          font-size: 15px;
          background: var(--ph-green);
          color: #ffffff;
          text-decoration: none;
          box-shadow: 0 10px 24px rgba(13, 47, 36, 0.22);
          transition: all 0.2s ease;
        }

        .ph-primary:hover {
          background: var(--ph-green-light);
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(13, 47, 36, 0.3);
        }

        .ph-secondary {
          min-height: 52px;
          padding: 0 24px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 15px;
          background: #ffffff;
          color: var(--ph-green);
          border: 1.5px solid var(--ph-border);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .ph-secondary:hover {
          border-color: var(--ph-orange);
          color: var(--ph-orange-deep);
          background: #fff8f3;
        }

        /* Hero Visual Card */
        .ph-hero-visual {
          position: relative;
          padding: 8px;
          border-radius: 32px;
          background: linear-gradient(145deg, #fed7aa, #bae6fd);
          box-shadow: 0 24px 50px rgba(13, 47, 36, 0.12);
        }

        .ph-hero-img {
          width: 100%;
          aspect-ratio: 4/4;
          object-fit: cover;
          display: block;
          border-radius: 26px;
        }

        .ph-badge-float {
          position: absolute;
          left: 20px;
          bottom: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(14px);
          border-radius: 18px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 8px 24px rgba(13, 47, 36, 0.08);
        }

        .ph-badge-title {
          font-size: 13px;
          font-weight: 850;
          color: var(--ph-green);
        }

        .ph-badge-sub {
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
        }

        .ph-coin-pill {
          background: #fff0e6;
          color: var(--ph-burnt-orange);
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          border: 1px solid #ffd8c4;
        }

        /* Value Props Ribbon */
        .ph-ribbon {
          max-width: 1220px;
          margin: 0 auto 56px;
          padding: 0 24px;
        }

        .ph-ribbon-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          background: #ffffff;
          padding: 24px;
          border-radius: 24px;
          border: 1px solid var(--ph-border);
          box-shadow: 0 10px 30px rgba(13, 47, 36, 0.04);
        }

        .ph-prop {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .ph-prop-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: #fff2e9;
          color: var(--ph-orange-deep);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          border: 1px solid #fed7aa;
        }

        .ph-prop h3 {
          margin: 0 0 3px;
          font-size: 15px;
          font-weight: 850;
          color: var(--ph-green);
        }

        .ph-prop p {
          margin: 0;
          font-size: 12.5px;
          color: var(--ph-muted);
          line-height: 1.45;
        }

        /* Dual Audience Section */
        .ph-audience-sec {
          max-width: 1220px;
          margin: 0 auto 72px;
          padding: 0 24px;
        }

        .ph-section-header {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 36px;
        }

        .ph-section-header h2 {
          font-size: clamp(28px, 3.5vw, 42px);
          font-weight: 900;
          color: var(--ph-green);
          letter-spacing: -0.03em;
          margin: 8px 0 12px;
        }

        .ph-section-header p {
          color: var(--ph-muted);
          font-size: 16px;
          margin: 0;
        }

        .ph-tabs {
          display: inline-flex;
          background: #efe4dc;
          padding: 5px;
          border-radius: 999px;
          margin-bottom: 32px;
        }

        .ph-tab-btn {
          padding: 10px 24px;
          border-radius: 999px;
          border: none;
          background: transparent;
          font-weight: 850;
          font-size: 14px;
          color: var(--ph-muted);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ph-tab-btn.active {
          background: var(--ph-green);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(13, 47, 36, 0.18);
        }

        .ph-audience-card {
          background: #ffffff;
          border: 1.5px solid var(--ph-border);
          border-radius: 28px;
          padding: 36px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          box-shadow: 0 16px 40px rgba(13, 47, 36, 0.05);
        }

        .ph-features-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ph-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .ph-check {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #dcfce7;
          color: #166534;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .ph-feature-item strong {
          color: var(--ph-green);
          font-size: 14px;
          display: block;
        }

        .ph-feature-item span {
          color: var(--ph-muted);
          font-size: 13px;
        }

        .ph-quote-box {
          background: var(--ph-peach-soft);
          border: 1px solid #ffd8c4;
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .ph-quote-box blockquote {
          margin: 0 0 16px;
          font-size: 15px;
          font-style: italic;
          color: #4a2e23;
          line-height: 1.6;
        }

        .ph-quote-author {
          font-size: 12px;
          font-weight: 850;
          color: var(--ph-burnt-orange);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* 5 Creative Disciplines Grid */
        .ph-disciplines-sec {
          max-width: 1220px;
          margin: 0 auto 72px;
          padding: 0 24px;
        }

        .ph-disciplines-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }

        .ph-discipline-card {
          background: #ffffff;
          border: 1px solid var(--ph-border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 22px rgba(13, 47, 36, 0.04);
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .ph-discipline-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 30px rgba(13, 47, 36, 0.09);
        }

        .ph-discipline-img {
          width: 100%;
          height: 140px;
          object-fit: cover;
          display: block;
        }

        .ph-discipline-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
        }

        .ph-discipline-tag {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--ph-orange-deep);
          margin-bottom: 4px;
        }

        .ph-discipline-body h4 {
          margin: 0 0 6px;
          font-size: 14px;
          font-weight: 850;
          color: var(--ph-green);
        }

        .ph-discipline-body p {
          margin: 0;
          font-size: 11.5px;
          color: var(--ph-muted);
          line-height: 1.4;
        }

        /* Peach Coins Section */
        .ph-coins-sec {
          background: var(--ph-green);
          color: #ffffff;
          padding: 72px 24px;
          margin-bottom: 72px;
        }

        .ph-coins-inner {
          max-width: 1220px;
          margin: auto;
        }

        .ph-coins-header {
          text-align: center;
          max-width: 740px;
          margin: 0 auto 48px;
        }

        .ph-coins-header h2 {
          font-size: clamp(30px, 3.8vw, 44px);
          font-weight: 900;
          letter-spacing: -0.03em;
          margin: 10px 0 14px;
        }

        .ph-coins-header p {
          color: #d1ded8;
          font-size: 17px;
          margin: 0;
          line-height: 1.6;
        }

        .ph-pkg-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        .ph-pkg-card {
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 22px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .ph-pkg-card.highlight {
          background: rgba(255, 255, 255, 0.12);
          border-color: #fed7aa;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
        }

        .ph-pkg-badge {
          position: absolute;
          top: -11px;
          right: 18px;
          background: #fdba74;
          color: #7c2d12;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 3px 10px;
          border-radius: 999px;
        }

        .ph-pkg-coins {
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.08em;
          color: #fed7aa;
          text-transform: uppercase;
        }

        .ph-pkg-price {
          font-size: 32px;
          font-weight: 900;
          color: #ffffff;
          margin: 4px 0;
        }

        .ph-pkg-card h3 {
          font-size: 16px;
          font-weight: 800;
          margin: 8px 0;
          line-height: 1.3;
        }

        .ph-pkg-desc {
          font-size: 12.5px;
          color: #c7d6cf;
          line-height: 1.5;
          margin: 0 0 16px;
        }

        .ph-pkg-meta {
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 11px;
          color: #9cb3a8;
          display: flex;
          justify-content: space-between;
        }

        .ph-split-banner {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 18px;
          padding: 20px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .ph-split-text {
          font-size: 13.5px;
          color: #e2ede8;
          max-width: 800px;
        }

        .ph-split-text strong {
          color: #fed7aa;
        }

        /* Work Showcase */
        .ph-work-sec {
          max-width: 1220px;
          margin: 0 auto 72px;
          padding: 0 24px;
        }

        .ph-workhead {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 28px;
        }

        .ph-track {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding: 6px 2px 24px;
          -webkit-overflow-scrolling: touch;
        }

        .ph-card {
          flex: 0 0 340px;
          scroll-snap-align: start;
          border: 1px solid var(--ph-border);
          border-radius: 24px;
          overflow: hidden;
          background: #ffffff;
          cursor: pointer;
          text-align: left;
          padding: 0;
          box-shadow: 0 8px 24px rgba(13, 47, 36, 0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .ph-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(13, 47, 36, 0.1);
        }

        .ph-card img {
          width: 100%;
          height: 230px;
          object-fit: cover;
          display: block;
        }

        .ph-cardbody {
          padding: 18px;
        }

        .ph-cat {
          font-size: 11px;
          font-weight: 900;
          color: #0284c7;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .ph-card h3 {
          font-size: 17px;
          font-weight: 850;
          color: var(--ph-green);
          margin: 6px 0 4px;
          line-height: 1.3;
        }

        .ph-card-client {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .ph-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--ph-border-soft);
        }

        .ph-meta-time {
          color: var(--ph-muted);
          font-weight: 600;
        }

        .ph-price {
          color: var(--ph-burnt-orange);
          font-weight: 900;
          font-size: 13px;
        }

        /* Skyline Banner */
        .ph-skyline-banner {
          max-width: 1220px;
          margin: 0 auto 72px;
          padding: 0 24px;
        }

        .ph-skyline-card {
          background: linear-gradient(180deg, #fff2e9 0%, #ffdecb 100%);
          border: 1px solid #fed7aa;
          border-radius: 32px;
          padding: 44px 36px 0;
          overflow: hidden;
          text-align: center;
          position: relative;
        }

        .ph-skyline-title {
          font-size: clamp(26px, 3.2vw, 38px);
          font-weight: 900;
          color: var(--ph-green);
          margin: 0 0 10px;
          letter-spacing: -0.03em;
        }

        .ph-skyline-title span {
          color: var(--ph-burnt-orange);
          font-family: Georgia, serif;
          font-style: italic;
          font-weight: 400;
        }

        .ph-skyline-sub {
          font-size: 16px;
          color: #6c4e41;
          max-width: 640px;
          margin: 0 auto 28px;
          line-height: 1.6;
        }

        .ph-skyline-actions {
          display: flex;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }

        .ph-skyline-svg {
          width: 100%;
          max-height: 140px;
          object-fit: cover;
          display: block;
          opacity: 0.95;
        }

        /* Modal */
        .ph-modal {
          position: fixed;
          inset: 0;
          z-index: 120;
          background: rgba(11, 24, 18, 0.78);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
        }

        .ph-dialog {
          width: min(900px, 100%);
          max-height: 90vh;
          overflow: auto;
          background: #ffffff;
          border-radius: 26px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
        }

        .ph-dialog-media {
          background: #13251c;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ph-dialog-media img {
          width: 100%;
          max-height: 540px;
          object-fit: contain;
          border-radius: 16px;
        }

        .ph-dialog-info {
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .ph-close {
          float: right;
          border: 0;
          background: #f1f5f9;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          cursor: pointer;
          font-size: 18px;
          font-weight: bold;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ph-dialog-info h2 {
          font-size: 24px;
          font-weight: 850;
          color: var(--ph-green);
          margin: 16px 0 4px;
          line-height: 1.3;
        }

        .ph-dialog-info p {
          color: var(--ph-muted);
          line-height: 1.6;
          font-size: 14px;
        }

        .ph-specs {
          padding-left: 18px;
          color: #334155;
          line-height: 1.8;
          font-size: 13px;
          margin: 16px 0;
        }

        .ph-dialog-price {
          padding: 14px 18px;
          background: #fff7ed;
          border-radius: 14px;
          color: #9a3412;
          font-weight: 900;
          margin: 16px 0 20px;
          font-size: 14px;
          border: 1px solid #fed7aa;
        }

        /* Footer */
        .ph-footer {
          border-top: 1px solid var(--ph-border);
          background: #ffffff;
          padding: 48px 24px 36px;
        }

        .ph-footer-inner {
          max-width: 1220px;
          margin: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
        }

        .ph-footer-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ph-footer-copy {
          font-size: 13px;
          color: #64748b;
        }

        .ph-footer-links {
          display: flex;
          gap: 20px;
          font-size: 13px;
          font-weight: 700;
          color: var(--ph-green);
        }

        .ph-footer-links a {
          text-decoration: none;
          color: inherit;
        }

        .ph-footer-links a:hover {
          color: var(--ph-orange-deep);
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .ph-nav {
            min-height: 90px;
            padding: 8px 16px;
          }

          .ph-logo {
            width: 160px;
            height: 80px;
          }

          .ph-navlinks {
            right: 16px;
          }

          .ph-navlinks .ph-link {
            display: none;
          }

          .ph-hero {
            grid-template-columns: 1fr;
            padding: 24px 18px 48px;
            gap: 36px;
          }

          .ph-hero-img {
            aspect-ratio: 4/3.2;
          }

          .ph-ribbon-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .ph-audience-card {
            grid-template-columns: 1fr;
            padding: 24px;
          }

          .ph-disciplines-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .ph-pkg-grid {
            grid-template-columns: 1fr;
          }

          .ph-dialog {
            grid-template-columns: 1fr;
          }

          .ph-dialog-media {
            max-height: 40vh;
          }

          .ph-dialog-info {
            padding: 24px;
          }

          .ph-card {
            flex-basis: 86vw;
          }
        }
      `}</style>

      {/* Top Banner Ribbon */}
      <div className="ph-topbar">
        <span>🍑 Birmingham Creative Guild &bull; Curated Matching &bull; <strong>1 Peach Coin = $50</strong></span>
      </div>

      {/* Navigation Header */}
      <header className="ph-nav">
        <Link href="/" className="ph-logo-link">
          <img
            src="/peach-app-logo.png"
            className="ph-logo"
            alt="Peach Network"
            style={{ width: "200px", height: "100px" }}
          />
        </Link>
        <div className="ph-navlinks">
          <Link href="/auth?mode=signin" className="ph-link">
            Sign In
          </Link>
          <Link
            href="/auth?mode=signup"
            className="ph-pill ph-link"
            style={{ backgroundColor: "#70eaff", color: "#e54307" }}
          >
            Start a Project &rarr;
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="ph-hero">
        <div>
          <span className="ph-kicker">
            <span>🍑</span> Birmingham&rsquo;s Vetted Creative Guild
          </span>
          <h1>
            The right creative. <br />
            <em>Right when you need them.</em>
            <span className="ph-heart">&hearts;</span>
          </h1>
          <p className="ph-sub">
            Stop searching for one person to do everything. We connect Birmingham businesses with vetted Southern creatives who specialize in design, websites, photography, and video &mdash; all with zero bidding wars, pre-scoped Peach Coin pricing, and protected payouts.
          </p>

          <div className="ph-actions">
            <Link href="/auth?mode=signup" className="ph-primary">
              Start a Project &rarr;
            </Link>
            <Link href="/apply" className="ph-secondary">
              Join as a Creative &rarr;
            </Link>
            <a href="#how-it-works" className="ph-link" style={{ fontSize: "14px", marginLeft: "4px" }}>
              How Peach Coins Work
            </a>
          </div>
        </div>

        <div className="ph-hero-visual">
          <img
            src="/hero-bg.png"
            alt="Southern creative talent working at desk"
            className="ph-hero-img"
          />
          <div className="ph-badge-float">
            <div>
              <div className="ph-badge-title">Good ideas grow here. &hearts;</div>
              <div className="ph-badge-sub">Woodlawn &bull; Avondale &bull; Loft District &bull; Downtown</div>
            </div>
            <span className="ph-coin-pill">2 Coins &bull; $100</span>
          </div>
        </div>
      </section>

      {/* Three Pillars Value Proposition */}
      <section className="ph-ribbon">
        <div className="ph-ribbon-grid">
          <div className="ph-prop">
            <div className="ph-prop-icon">🎯</div>
            <div>
              <h3>Curated 3-Match</h3>
              <p>No 40+ cut-and-paste pitches. Our algorithm returns exactly 3 vetted local creatives with clear creative differences.</p>
            </div>
          </div>
          <div className="ph-prop">
            <div className="ph-prop-icon">🪙</div>
            <div>
              <h3>Fixed Peach Coins</h3>
              <p>1 Coin = $50 project value. Know your exact total cost upfront without hourly billing surprises or scope creep.</p>
            </div>
          </div>
          <div className="ph-prop">
            <div className="ph-prop-icon">🛡️</div>
            <div>
              <h3>Protected Payment &amp; Vault</h3>
              <p>Upfront client funding held safely; payout released upon final approval. Vector assets saved forever in your Brand Vault.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Audience Section: Businesses vs Creatives */}
      <section className="ph-audience-sec" id="how-it-works">
        <div className="ph-section-header">
          <span className="ph-kicker">Built for Both Sides of the South</span>
          <h2>A Marketplace Where Everyone Thrives</h2>
          <p>
            Generic freelance apps create an offshore race-to-the-bottom. Peach Network brings accountability, living wages, and reliable deliverables back home.
          </p>
          <div style={{ marginTop: "24px" }}>
            <div className="ph-tabs">
              <button
                className={`ph-tab-btn ${audienceTab === "business" ? "active" : ""}`}
                onClick={() => setAudienceTab("business")}
              >
                For Local Businesses
              </button>
              <button
                className={`ph-tab-btn ${audienceTab === "creative" ? "active" : ""}`}
                onClick={() => setAudienceTab("creative")}
              >
                For Southern Creatives
              </button>
            </div>
          </div>
        </div>

        {audienceTab === "business" ? (
          <div className="ph-audience-card">
            <div>
              <h3 style={{ fontSize: "22px", fontWeight: "900", color: "var(--ph-green)", margin: "0 0 16px" }}>
                Eliminate Hiring Risk for Your Business
              </h3>
              <ul className="ph-features-list">
                <li className="ph-feature-item">
                  <div className="ph-check">&check;</div>
                  <div>
                    <strong>1-Click Plain English Requests</strong>
                    <span>Describe what you need in plain English. We scope the deliverables into fixed Peach Coins.</span>
                  </div>
                </li>
                <li className="ph-feature-item">
                  <div className="ph-check">&check;</div>
                  <div>
                    <strong>Fast 3&ndash;5 Business Day Turnarounds</strong>
                    <span>No waiting weeks for ghosted replies. Get matched and review Round 1 proofs in days.</span>
                  </div>
                </li>
                <li className="ph-feature-item">
                  <div className="ph-check">&check;</div>
                  <div>
                    <strong>300 DPI CMYK Pre-Flight Verification</strong>
                    <span>Files are pre-checked before handoff so local print shops never kick back your collateral.</span>
                  </div>
                </li>
                <li className="ph-feature-item">
                  <div className="ph-check">&check;</div>
                  <div>
                    <strong>Persistent Brand Vault</strong>
                    <span>Never lose your high-res logo or source files again. Stored safely in your account forever.</span>
                  </div>
                </li>
              </ul>
              <div style={{ marginTop: "28px" }}>
                <Link href="/auth?mode=signup" className="ph-primary">
                  Start a Project as a Business &rarr;
                </Link>
              </div>
            </div>

            <div className="ph-quote-box">
              <blockquote>
                &ldquo;We needed a grand opening campaign for our bakery. Instead of scrolling through 50 random proposals, Peach gave us three talented local designers who understood Birmingham. Done in 4 days!&rdquo;
              </blockquote>
              <div>
                <div className="ph-quote-author">Marcus Chen</div>
                <div style={{ fontSize: "12px", color: "#785f54" }}>Woodlawn Bakehouse &bull; Birmingham, AL</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="ph-audience-card">
            <div>
              <h3 style={{ fontSize: "22px", fontWeight: "900", color: "var(--ph-green)", margin: "0 0 16px" }}>
                Anti-Exploitation Creative Protection
              </h3>
              <ul className="ph-features-list">
                <li className="ph-feature-item">
                  <div className="ph-check">&check;</div>
                  <div>
                    <strong>Zero Unpaid Proposal Drafting</strong>
                    <span>Never design free specs or compete in bidding wars. 100% of client inquiries are funded briefs.</span>
                  </div>
                </li>
                <li className="ph-feature-item">
                  <div className="ph-check">&check;</div>
                  <div>
                    <strong>Guaranteed 75% Net Take-Home</strong>
                    <span>Clear, locked payouts ($75 net on 2 coins, $150 on 4 coins) deposited directly to your wallet.</span>
                  </div>
                </li>
                <li className="ph-feature-item">
                  <div className="ph-check">&check;</div>
                  <div>
                    <strong>Calm 24-Hour Decision Window</strong>
                    <span>Receive curated client requests with all brand vectors already collected. No panic timers.</span>
                  </div>
                </li>
                <li className="ph-feature-item">
                  <div className="ph-check">&check;</div>
                  <div>
                    <strong>Guild Mentorship &amp; Level Accreditation</strong>
                    <span>Level 1 to Level 5 Guild ranks that unlock higher tier corporate, civic, and packaging briefs.</span>
                  </div>
                </li>
              </ul>
              <div style={{ marginTop: "28px" }}>
                <Link href="/apply" className="ph-primary">
                  Apply to Join the Guild &rarr;
                </Link>
              </div>
            </div>

            <div className="ph-quote-box">
              <blockquote>
                &ldquo;I spent years chasing down invoices and writing unpaid proposals. On Peach Network, every brief is pre-scoped with client money already held in escrow. I just design and get paid.&rdquo;
              </blockquote>
              <div>
                <div className="ph-quote-author">Stephanie Williams</div>
                <div style={{ fontSize: "12px", color: "#785f54" }}>Brand &amp; Packaging Designer &bull; Avondale Guild Hub</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5 Disciplines Showcase */}
      <section className="ph-disciplines-sec">
        <div className="ph-section-header">
          <span className="ph-kicker">Vetted Guild Disciplines</span>
          <h2>Whatever Your Brand Needs, Handled by Experts</h2>
          <p>Local specialists across Alabama and the South ready to bring your vision to life.</p>
        </div>

        <div className="ph-disciplines-grid">
          {DISCIPLINES.map((d, i) => (
            <div key={i} className="ph-discipline-card">
              <img src={d.image} alt={d.role} className="ph-discipline-img" />
              <div className="ph-discipline-body">
                <div>
                  <div className="ph-discipline-tag">{d.tag}</div>
                  <h4>{d.role}</h4>
                  <p>{d.headline}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Peach Coin Token Economics */}
      <section className="ph-coins-sec">
        <div className="ph-coins-inner">
          <div className="ph-coins-header">
            <span className="ph-kicker" style={{ background: "rgba(255,255,255,0.15)", color: "#fed7aa", borderColor: "rgba(255,255,255,0.2)" }}>
              The Creative Vending Machine of the South
            </span>
            <h2>Transparent Peach Coin Pricing</h2>
            <p>
              Peach Coins turn creative services into predictable project units. Drop in the coins your project needs, get matched with vetted talent, and move the work forward without hourly guessing.
            </p>
          </div>

          <div className="ph-pkg-grid">
            {PACKAGES.map((pkg, idx) => (
              <div key={idx} className={`ph-pkg-card ${pkg.highlight ? "highlight" : ""}`}>
                {pkg.highlight && <span className="ph-pkg-badge">Most Popular</span>}
                <div>
                  <div className="ph-pkg-coins">{pkg.coins}</div>
                  <div className="ph-pkg-price">{pkg.price}</div>
                  <h3>{pkg.name}</h3>
                  <p className="ph-pkg-desc">{pkg.description}</p>
                </div>
                <div className="ph-pkg-meta">
                  <span>{pkg.turnaround}</span>
                  <span style={{ color: "#fdba74", fontWeight: "bold" }}>{pkg.payout}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="ph-split-banner">
            <div className="ph-split-text">
              <strong>Why the 75 / 25 Split Works:</strong> Creatives willingly accept the platform fee because they incur zero business development costs, spend zero hours bidding, receive guaranteed payment protection, and have all vector brand assets pre-collected in the client&rsquo;s Brand Vault.
            </div>
            <Link
              href="/auth?mode=signup"
              className="ph-pill"
              style={{ backgroundColor: "var(--ph-cyan)", color: "var(--ph-burnt-orange)", padding: "10px 22px" }}
            >
              Start a Project with Peach Coins &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Work from the Network (Interactive Gallery) */}
      <section className="ph-work-sec">
        <div className="ph-workhead">
          <div>
            <span className="ph-kicker">Real Birmingham Case Studies</span>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: "900", color: "var(--ph-green)", margin: "8px 0 6px" }}>
              Work From the Network
            </h2>
            <p style={{ color: "var(--ph-muted)", margin: 0, fontSize: "15px" }}>
              Swipe through real client deliverables. Tap any project for technical specs and coin cost.
            </p>
          </div>
          <span style={{ fontSize: "13px", color: "var(--ph-muted)", fontWeight: "600" }}>Swipe &rarr;</span>
        </div>

        <div className="ph-track">
          {PROJECTS.map((p) => (
            <button key={p.id} className="ph-card" onClick={() => setSelected(p)}>
              <img src={p.image} alt={p.title} />
              <div className="ph-cardbody">
                <div className="ph-cat">{p.category}</div>
                <h3>{p.title}</h3>
                <div className="ph-card-client">{p.client}</div>
                <div className="ph-meta">
                  <span className="ph-meta-time">&bull; {p.turnaround}</span>
                  <span className="ph-price">{p.coins} Peach Coins</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Birmingham Pride Skyline Banner */}
      <section className="ph-skyline-banner">
        <div className="ph-skyline-card">
          <h2 className="ph-skyline-title">
            Making brands <span>sweeter.</span> &hearts;
          </h2>
          <p className="ph-skyline-sub">
            From the historic brick lofts of Downtown Birmingham to Avondale bakeries, Woodlawn markets, and Bessemer shops &mdash; keeping creative capital circulating right here in Jefferson County.
          </p>

          <div className="ph-skyline-actions">
            <Link href="/auth?mode=signup" className="ph-primary">
              Post Your First Project &rarr;
            </Link>
            <Link href="/apply" className="ph-secondary">
              Apply to the Guild
            </Link>
          </div>

          {/* Birmingham Skyline SVG Silhouette with Vulcan statue and bridge */}
          <svg className="ph-skyline-svg" viewBox="0 0 1200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 240h1200v-30h-40l-8-12h-22l-14 18h-46v-38l-40-20v58h-26v-70h-18v70h-16v-40h-24v40h-18v-86h-24v86h-14v-110h-32v110h-16v-60h-28v60h-20v-130h-44v130h-16v-80h-30v80h-18v-145h-50v145h-20v-90h-34v90h-16v-120h-42v120h-18v-65h-32v65h-24v-45h-28v45h-22v-95h-46v95h-18v-70h-36v70h-18v-40h-28v40h-20v-55h-34v55H0v30z"
              fill="#f08a62"
              fillOpacity="0.85"
            />
            {/* Vulcan Statue Silhouette on the left */}
            <path
              d="M75 140c0-6 5-11 11-11s11 5 11 11-5 11-11 11-11-5-11-11zm11 15c-12 0-22 10-22 22v43h44v-43c0-12-10-22-22-22zm-3-55l16-24 10 7-16 24-10-7zm-14 120h34v30H69v-30z"
              fill="#e54307"
              fillOpacity="0.9"
            />
          </svg>
        </div>
      </section>

      {/* Modal Dialog for Project Inspection */}
      {selected && (
        <div className="ph-modal" onClick={() => setSelected(null)}>
          <div className="ph-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="ph-dialog-media">
              <img src={selected.image} alt={selected.title} />
            </div>
            <div className="ph-dialog-info">
              <div>
                <button className="ph-close" onClick={() => setSelected(null)} aria-label="Close">
                  &times;
                </button>
                <span className="ph-cat">{selected.category}</span>
                <h2>{selected.title}</h2>
                <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>
                  {selected.client}
                </div>
                <p>{selected.description}</p>
                <ul className="ph-specs">
                  {selected.specs.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
                <div className="ph-dialog-price">
                  {selected.coins} Peach Coins &bull; Turnaround: {selected.turnaround}
                </div>
              </div>
              <Link
                href="/auth?mode=signup"
                className="ph-primary"
                onClick={() => setSelected(null)}
                style={{ textAlign: "center" }}
              >
                Start a Similar Project &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="ph-footer">
        <div className="ph-footer-inner">
          <div className="ph-footer-left">
            <span style={{ fontSize: "22px" }}>🍑</span>
            <div>
              <strong style={{ color: "var(--ph-green)", fontSize: "15px" }}>Peach Network</strong>
              <div className="ph-footer-copy">Birmingham Creative Guild &bull; Powered by Sweet As A Peach</div>
            </div>
          </div>
          <div className="ph-footer-links">
            <Link href="/business">Business Hub</Link>
            <Link href="/creative">Creative Portal</Link>
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/peach-coins">Coin Rules</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
