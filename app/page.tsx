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
    turnaround: "5–7 Days",
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
    turnaround: "4–5 Days",
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
    title: "Student Campaign & Announcement Suite",
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
    title: "Church Program & Civic Event Suite",
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
    title: "Custom Event Flyer Kit",
    client: "Local Culinary & Artisan Market",
    category: "Print & Social Launch Kit",
    coins: 2,
    turnaround: "48 Hours",
    image: "/Project 2.png",
    description: "Pre-scoped event kit: 1 high-res print flyer with 300 DPI press bleeds + matching Instagram square and story.",
    specs: ["1 Commercial Print Flyer (CMYK)", "1 Instagram Square (1080x1080)", "1 Instagram Story (1080x1920)", "Stored in Brand Vault"]
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
    role: "Designers",
    headline: "Create. Collaborate. Grow.",
    image: "/hero-bg.png",
    tag: "Brand & Graphic"
  },
  {
    role: "Video Editors",
    headline: "Turn your talent into opportunity.",
    image: "/Creative 3.jpg",
    tag: "Video & Motion"
  },
  {
    role: "Writers",
    headline: "Your words matter here.",
    image: "/Creative 4.jpg",
    tag: "Copy & Story"
  },
  {
    role: "Businesses",
    headline: "Find the right creative. Get it done.",
    image: "/brand/business-owner.jpg",
    tag: "Birmingham Merchants"
  }
];

export default function HomePage() {
  const [selected, setSelected] = useState<ProjectItem | null>(null);
  const [pricingTab, setPricingTab] = useState<"project" | "membership">("project");
  const [canvasTab, setCanvasTab] = useState<"brief" | "matches" | "vault">("brief");

  return (
    <main className="ph">
      <BrandSplash />

      <style>{`
        :root {
          --ph-green: #0d2f24;
          --ph-green-mid: #173c2a;
          --ph-green-soft: #f0f7f3;
          --ph-orange: #f08a62;
          --ph-orange-deep: #e85d3f;
          --ph-coral: #e54307;
          --ph-coral-soft: #fff1eb;
          --ph-peach: #fed7aa;
          --ph-peach-soft: #fff6ee;
          --ph-cream: #fffaf5;
          --ph-blue-light: #70eaff;
          --ph-blue-soft: #eafaff;
          --ph-blue-accent: #0284c7;
          --ph-ink: #17271e;
          --ph-muted: #55675e;
          --ph-border: #e8dbd2;
          --ph-border-soft: #f4ebe4;
          --ph-shadow: 0 16px 40px rgba(13, 47, 36, 0.07);
          --ph-shadow-sm: 0 4px 16px rgba(13, 47, 36, 0.04);
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

        /* Top Announcement Ribbon */
        .ph-topbar {
          background: var(--ph-green);
          color: #f7ede6;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          letter-spacing: 0.02em;
        }

        .ph-topbar strong {
          color: var(--ph-peach);
        }

        /* Nav Header */
        .ph-nav {
          min-height: 116px;
          max-width: 1240px;
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
          color: var(--ph-coral);
        }

        .ph-pill {
          padding: 10px 20px;
          border: 1px solid var(--ph-border);
          border-radius: 999px;
          background-color: var(--ph-blue-light);
          color: var(--ph-coral);
          font-weight: 850;
          font-size: 14px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 14px rgba(112, 234, 255, 0.35);
          transition: all 0.2s ease;
        }

        .ph-pill:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(112, 234, 255, 0.45);
        }

        /* Hero Section (AppThink & Zoom Notes Combo) */
        .ph-hero-sec {
          max-width: 1240px;
          margin: 0 auto 56px;
          padding: 24px 24px 0;
        }

        .ph-hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 48px;
          align-items: center;
          margin-bottom: 40px;
        }

        .ph-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid var(--ph-border);
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 11.5px;
          font-weight: 850;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ph-green);
          box-shadow: var(--ph-shadow-sm);
          margin-bottom: 16px;
        }

        .ph-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
        }

        .ph-hero-title {
          font-size: clamp(38px, 4.2vw, 56px);
          line-height: 1.08;
          letter-spacing: -0.035em;
          color: var(--ph-green);
          font-weight: 900;
          margin: 0 0 16px;
        }

        .ph-hero-title em {
          font-family: Georgia, serif;
          font-style: italic;
          font-weight: 400;
          color: var(--ph-coral);
        }

        .ph-hero-sub {
          font-size: 17px;
          line-height: 1.55;
          color: var(--ph-muted);
          max-width: 540px;
          margin: 0 0 28px;
        }

        .ph-hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 32px;
        }

        .ph-btn-primary {
          min-height: 50px;
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
          box-shadow: 0 8px 20px rgba(13, 47, 36, 0.2);
          transition: all 0.2s ease;
        }

        .ph-btn-primary:hover {
          background: var(--ph-green-mid);
          transform: translateY(-1px);
        }

        .ph-btn-secondary {
          min-height: 50px;
          padding: 0 24px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 15px;
          background: #ffffff;
          color: var(--ph-coral);
          border: 1.5px solid #ffcca8;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .ph-btn-secondary:hover {
          background: var(--ph-peach-soft);
          border-color: var(--ph-orange);
        }

        /* AppThink / Zoom Stats Strip */
        .ph-hero-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid var(--ph-border);
        }

        .ph-stat-item strong {
          display: block;
          font-size: 16px;
          font-weight: 900;
          color: var(--ph-green);
        }

        .ph-stat-item span {
          font-size: 12px;
          color: var(--ph-muted);
        }

        /* Interactive Canvas Demo (Zoom Notes / AppThink Widget) */
        .ph-canvas-card {
          background: #ffffff;
          border: 1.5px solid var(--ph-border);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: var(--ph-shadow);
          display: flex;
          flex-direction: column;
        }

        .ph-canvas-header {
          background: #faf6f0;
          padding: 12px 18px;
          border-bottom: 1px solid var(--ph-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ph-window-dots {
          display: flex;
          gap: 6px;
        }

        .ph-window-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #e2d7ce;
        }

        .ph-canvas-title {
          font-size: 12px;
          font-weight: 850;
          color: var(--ph-green);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .ph-canvas-tabs {
          display: flex;
          background: #ffffff;
          border-bottom: 1px solid var(--ph-border);
          padding: 6px 12px 0;
          gap: 6px;
        }

        .ph-canvas-tab-btn {
          padding: 8px 16px;
          border: none;
          background: transparent;
          font-size: 12.5px;
          font-weight: 750;
          color: var(--ph-muted);
          border-bottom: 2.5px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .ph-canvas-tab-btn.active {
          color: var(--ph-coral);
          border-bottom-color: var(--ph-coral);
        }

        .ph-canvas-body {
          padding: 20px;
          min-height: 290px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* Brief Canvas View */
        .ph-brief-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--ph-border-soft);
          margin-bottom: 14px;
        }

        .ph-brief-name {
          font-size: 15px;
          font-weight: 850;
          color: var(--ph-green);
        }

        .ph-brief-tag {
          background: var(--ph-coral-soft);
          color: var(--ph-coral);
          font-size: 11px;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 999px;
        }

        .ph-checklist {
          list-style: none;
          padding: 0;
          margin: 0 0 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ph-check-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--ph-ink);
        }

        .ph-check-icon {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #dcfce7;
          color: #166534;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 900;
          flex-shrink: 0;
        }

        /* Matching Canvas View */
        .ph-match-cards {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ph-match-card-item {
          background: #faf7f2;
          border: 1px solid var(--ph-border);
          border-radius: 14px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ph-match-card-item.selected {
          border-color: var(--ph-coral);
          background: #fff8f5;
        }

        .ph-match-name {
          font-size: 13px;
          font-weight: 850;
          color: var(--ph-green);
        }

        .ph-match-spec {
          font-size: 11.5px;
          color: var(--ph-muted);
        }

        .ph-match-score {
          font-size: 11px;
          font-weight: 900;
          color: #166534;
          background: #dcfce7;
          padding: 3px 8px;
          border-radius: 999px;
        }

        /* Vault Canvas View */
        .ph-vault-files {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .ph-vault-file {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 12px;
        }

        .ph-vault-file strong {
          color: var(--ph-green);
          display: block;
          font-size: 12.5px;
        }

        .ph-vault-file span {
          color: #64748b;
          font-size: 11px;
        }

        .ph-canvas-footer {
          background: #fbf8f4;
          border-top: 1px solid var(--ph-border);
          padding: 10px 16px;
          font-size: 12px;
          color: var(--ph-muted);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ph-canvas-footer strong {
          color: var(--ph-coral);
        }

        /* 4-Step Process Bar (Zoom / AppThink Style) */
        .ph-process-sec {
          max-width: 1240px;
          margin: 0 auto 56px;
          padding: 0 24px;
        }

        .ph-process-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .ph-process-card {
          background: #ffffff;
          border: 1px solid var(--ph-border);
          border-radius: 18px;
          padding: 22px 18px;
          box-shadow: var(--ph-shadow-sm);
          position: relative;
        }

        .ph-step-num {
          font-size: 12px;
          font-weight: 900;
          color: var(--ph-coral);
          background: var(--ph-coral-soft);
          padding: 3px 8px;
          border-radius: 6px;
          display: inline-block;
          margin-bottom: 10px;
        }

        .ph-process-card h4 {
          margin: 0 0 6px;
          font-size: 15px;
          font-weight: 850;
          color: var(--ph-green);
        }

        .ph-process-card p {
          margin: 0;
          font-size: 12.5px;
          color: var(--ph-muted);
          line-height: 1.45;
        }

        /* 5 Creative Disciplines */
        .ph-disciplines-sec {
          max-width: 1240px;
          margin: 0 auto 56px;
          padding: 0 24px;
        }

        .ph-section-header {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 28px;
          padding: 0 16px;
        }

        .ph-section-header h2 {
          font-size: clamp(26px, 3.2vw, 36px);
          font-weight: 900;
          color: var(--ph-green);
          letter-spacing: -0.025em;
          margin: 0 0 8px;
        }

        .ph-section-header p {
          color: var(--ph-muted);
          font-size: 15px;
          margin: 0;
        }

        .ph-disciplines-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        .ph-discipline-card {
          background: #ffffff;
          border: 1px solid var(--ph-border);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: var(--ph-shadow-sm);
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease;
        }

        .ph-discipline-card:hover {
          transform: translateY(-3px);
        }

        .ph-discipline-img-wrap {
          width: 100%;
          height: 150px;
          background: #f1ede8;
          overflow: hidden;
        }

        .ph-discipline-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          display: block;
        }

        .ph-discipline-body {
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
        }

        .ph-discipline-body h4 {
          margin: 0 0 3px;
          font-size: 14px;
          font-weight: 850;
          color: var(--ph-green);
        }

        .ph-discipline-body p {
          margin: 0;
          font-size: 11.5px;
          color: var(--ph-muted);
          line-height: 1.35;
        }

        /* Why Businesses Love Peach Coins (Clear, Trustworthy Value) */
        .ph-reasons-sec {
          max-width: 1240px;
          margin: 0 auto 56px;
          padding: 0 24px;
        }

        .ph-reasons-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .ph-reason-card {
          background: #ffffff;
          border: 1px solid var(--ph-border);
          border-radius: 18px;
          padding: 20px;
          box-shadow: var(--ph-shadow-sm);
          border-top: 4px solid var(--ph-orange);
        }

        .ph-reason-card:nth-child(2) {
          border-top-color: var(--ph-blue-light);
        }

        .ph-reason-card:nth-child(3) {
          border-top-color: var(--ph-green);
        }

        .ph-reason-card:nth-child(4) {
          border-top-color: var(--ph-coral);
        }

        .ph-reason-card h4 {
          margin: 0 0 6px;
          font-size: 15px;
          font-weight: 850;
          color: var(--ph-green);
        }

        .ph-reason-card p {
          margin: 0;
          font-size: 13px;
          color: var(--ph-muted);
          line-height: 1.45;
        }

        /* Peach Coin Pricing (Simplified & Compact) */
        .ph-pricing-sec {
          background: var(--ph-green);
          color: #ffffff;
          padding: 56px 24px;
          margin-bottom: 56px;
        }

        .ph-pricing-inner {
          max-width: 1100px;
          margin: auto;
        }

        .ph-pricing-header {
          text-align: center;
          max-width: 660px;
          margin: 0 auto 24px;
        }

        .ph-pricing-header h2 {
          font-size: clamp(28px, 3.4vw, 38px);
          font-weight: 900;
          letter-spacing: -0.025em;
          margin: 0 0 8px;
        }

        .ph-pricing-header p {
          color: #d1ded8;
          font-size: 15.5px;
          margin: 0;
        }

        .ph-switch-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .ph-switch {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.12);
          padding: 4px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .ph-switch-btn {
          padding: 8px 22px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: #e2ede8;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .ph-switch-btn.active {
          background: #ffffff;
          color: var(--ph-green);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        /* Project Cards */
        .ph-price-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .ph-compact-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 18px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .ph-compact-card.featured {
          background: rgba(255, 255, 255, 0.14);
          border-color: var(--ph-peach);
        }

        .ph-compact-tag {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.06em;
          color: var(--ph-peach);
          text-transform: uppercase;
        }

        .ph-compact-price {
          font-size: 26px;
          font-weight: 900;
          color: #ffffff;
          margin: 2px 0;
        }

        .ph-compact-title {
          font-size: 14px;
          font-weight: 850;
          margin: 4px 0 6px;
        }

        .ph-compact-desc {
          font-size: 12px;
          color: #c7d6cf;
          line-height: 1.45;
          margin: 0 0 10px;
        }

        .ph-compact-meta {
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 11px;
          color: #9cb3a8;
          font-weight: 600;
        }

        /* Membership Grid */
        .ph-membership-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .ph-membership-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 20px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .ph-membership-card.featured {
          background: rgba(255, 255, 255, 0.14);
          border-color: var(--ph-peach);
        }

        .ph-pop-tag {
          position: absolute;
          top: -10px;
          right: 16px;
          background: var(--ph-peach);
          color: #7c2d12;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 3px 10px;
          border-radius: 999px;
        }

        .ph-plan-name {
          font-size: 16px;
          font-weight: 850;
          color: #ffffff;
        }

        .ph-plan-price {
          font-size: 30px;
          font-weight: 900;
          margin: 4px 0;
        }

        .ph-plan-price span {
          font-size: 13px;
          font-weight: 600;
          color: #a4beaf;
        }

        .ph-plan-coins {
          font-size: 13px;
          font-weight: 800;
          color: var(--ph-peach);
          margin-bottom: 10px;
        }

        .ph-plan-desc {
          font-size: 12px;
          color: #c7d6cf;
          line-height: 1.45;
          margin: 0;
        }

        .ph-pricing-footer {
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 16px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .ph-pricing-footer-text {
          font-size: 13px;
          color: #e2ede8;
        }

        /* Work Showcase */
        .ph-work-sec {
          max-width: 1240px;
          margin: 0 auto 56px;
          padding: 0 24px;
        }

        .ph-workhead {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 18px;
        }

        .ph-workhead h2 {
          font-size: clamp(24px, 3vw, 34px);
          font-weight: 900;
          color: var(--ph-green);
          margin: 0 0 4px;
        }

        .ph-workhead p {
          color: var(--ph-muted);
          font-size: 14.5px;
          margin: 0;
        }

        .ph-track {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding: 4px 2px 18px;
          -webkit-overflow-scrolling: touch;
        }

        .ph-card {
          flex: 0 0 320px;
          scroll-snap-align: start;
          border: 1px solid var(--ph-border);
          border-radius: 20px;
          overflow: hidden;
          background: #ffffff;
          cursor: pointer;
          text-align: left;
          padding: 0;
          box-shadow: var(--ph-shadow-sm);
          transition: transform 0.2s ease;
        }

        .ph-card:hover {
          transform: translateY(-3px);
        }

        .ph-card img {
          width: 100%;
          height: 190px;
          object-fit: cover;
          display: block;
        }

        .ph-cardbody {
          padding: 16px;
        }

        .ph-cat {
          font-size: 10.5px;
          font-weight: 900;
          color: var(--ph-blue-accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .ph-card h3 {
          font-size: 15px;
          font-weight: 850;
          color: var(--ph-green);
          margin: 4px 0;
          line-height: 1.3;
        }

        .ph-card-client {
          font-size: 11.5px;
          color: #64748b;
          margin-bottom: 10px;
        }

        .ph-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11.5px;
          padding-top: 10px;
          border-top: 1px solid var(--ph-border-soft);
        }

        .ph-meta-time {
          color: var(--ph-muted);
          font-weight: 600;
        }

        .ph-price {
          color: var(--ph-coral);
          font-weight: 900;
        }

        /* Skyline Banner */
        .ph-skyline-banner {
          max-width: 1240px;
          margin: 0 auto 56px;
          padding: 0 24px;
        }

        .ph-skyline-card {
          background: linear-gradient(180deg, #fff2e8 0%, #ffd8c4 100%);
          border: 1.5px solid #fed7aa;
          border-radius: 28px;
          padding: 38px 28px 0;
          overflow: hidden;
          text-align: center;
          position: relative;
        }

        .ph-agency-tag {
          font-size: 11.5px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--ph-coral);
          margin-bottom: 8px;
          display: block;
        }

        .ph-skyline-title {
          font-size: clamp(26px, 3.2vw, 38px);
          font-weight: 900;
          color: var(--ph-green);
          margin: 0 0 10px;
          letter-spacing: -0.025em;
        }

        .ph-skyline-title span {
          color: var(--ph-coral);
          font-family: Georgia, serif;
          font-style: italic;
          font-weight: 400;
        }

        .ph-skyline-sub {
          font-size: 15.5px;
          color: #624b40;
          max-width: 600px;
          margin: 0 auto 24px;
          line-height: 1.55;
        }

        .ph-skyline-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 26px;
        }

        .ph-skyline-svg {
          width: 100%;
          max-height: 120px;
          object-fit: cover;
          display: block;
        }

        /* Modal Dialog */
        .ph-modal {
          position: fixed;
          inset: 0;
          z-index: 120;
          background: rgba(13, 47, 36, 0.75);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .ph-dialog {
          width: min(840px, 100%);
          max-height: 90vh;
          overflow: auto;
          background: #ffffff;
          border-radius: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
        }

        .ph-dialog-media {
          background: #11281e;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ph-dialog-media img {
          width: 100%;
          max-height: 480px;
          object-fit: contain;
          border-radius: 14px;
        }

        .ph-dialog-info {
          padding: 30px 26px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .ph-close {
          float: right;
          border: 0;
          background: #f1f5f9;
          border-radius: 50%;
          width: 34px;
          height: 34px;
          cursor: pointer;
          font-size: 18px;
          font-weight: bold;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ph-dialog-info h2 {
          font-size: 21px;
          font-weight: 850;
          color: var(--ph-green);
          margin: 14px 0 4px;
          line-height: 1.3;
        }

        .ph-dialog-info p {
          color: var(--ph-muted);
          line-height: 1.55;
          font-size: 13.5px;
        }

        .ph-specs {
          padding-left: 18px;
          color: #334155;
          line-height: 1.7;
          font-size: 12.5px;
          margin: 14px 0;
        }

        .ph-dialog-price {
          padding: 12px 16px;
          background: #fff7ed;
          border-radius: 12px;
          color: #9a3412;
          font-weight: 900;
          margin: 14px 0 18px;
          font-size: 13.5px;
          border: 1px solid #fed7aa;
        }

        /* Footer */
        .ph-footer {
          border-top: 1px solid var(--ph-border);
          background: #ffffff;
          padding: 36px 24px;
        }

        .ph-footer-inner {
          max-width: 1240px;
          margin: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
        }

        .ph-footer-copy {
          font-size: 12.5px;
          color: #64748b;
        }

        .ph-footer-links {
          display: flex;
          gap: 18px;
          font-size: 13px;
          font-weight: 700;
          color: var(--ph-green);
        }

        .ph-footer-links a {
          text-decoration: none;
          color: inherit;
        }

        .ph-footer-links a:hover {
          color: var(--ph-coral);
        }

        /* Mobile Optimization */
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
            right: 14px;
          }

          .ph-navlinks .ph-link {
            display: none;
          }

          .ph-hero-grid {
            grid-template-columns: 1fr;
            gap: 28px;
            margin-bottom: 24px;
          }

          .ph-hero-stats {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .ph-process-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .ph-disciplines-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .ph-reasons-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .ph-price-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .ph-membership-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .ph-dialog {
            grid-template-columns: 1fr;
          }

          .ph-dialog-media {
            max-height: 35vh;
          }

          .ph-dialog-info {
            padding: 20px;
          }

          .ph-card {
            flex-basis: 82vw;
          }
        }
      `}</style>

      {/* Top Announcement Strip */}
      <div className="ph-topbar">
        Birmingham&rsquo;s Creative Marketplace &bull; <strong>1 Peach Coin = $50</strong> &bull; Clear Project Value
      </div>

      {/* Nav Header */}
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

      {/* Hero Section (AppThink + Zoom Notes Combo) */}
      <section className="ph-hero-sec">
        <div className="ph-hero-grid">
          <div>
            <div className="ph-live-badge">
              <span className="ph-live-dot"></span>
              Birmingham&rsquo;s Creative Marketplace
            </div>

            <h1 className="ph-hero-title">
              Real creative talent. <br />
              <em>Right when you need them.</em>
            </h1>

            <p className="ph-hero-sub">
              The structured creative marketplace and digital coin engine built for Birmingham. Businesses get agency-grade marketing deliverables with zero bidding wars, while Southern creatives earn protected 75% payouts.
            </p>

            <div className="ph-hero-actions">
              <Link href="/auth?mode=signup" className="ph-btn-primary">
                Hire Creative Talent &rarr;
              </Link>
              <Link href="/apply" className="ph-btn-secondary">
                Join the Creative Network
              </Link>
            </div>

            {/* AppThink-Style Key Metrics */}
            <div className="ph-hero-stats">
              <div className="ph-stat-item">
                <strong>1 Coin = $50</strong>
                <span>Predictable Value</span>
              </div>
              <div className="ph-stat-item">
                <strong>3 Curated</strong>
                <span>Zero Bidding Wars</span>
              </div>
              <div className="ph-stat-item">
                <strong>75% Direct</strong>
                <span>Creator Take-Home</span>
              </div>
              <div className="ph-stat-item">
                <strong>100% Escrow</strong>
                <span>Payment Protected</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Canvas Demo (Zoom Notes / AppThink Style) */}
          <div className="ph-canvas-card">
            <div className="ph-canvas-header">
              <div className="ph-window-dots">
                <span className="ph-window-dot"></span>
                <span className="ph-window-dot"></span>
                <span className="ph-window-dot"></span>
              </div>
              <div className="ph-canvas-title">Peach Project Canvas</div>
              <span style={{ fontSize: "11px", color: "#166534", fontWeight: "700" }}>● Active Brief</span>
            </div>

            <div className="ph-canvas-tabs">
              <button
                className={`ph-canvas-tab-btn ${canvasTab === "brief" ? "active" : ""}`}
                onClick={() => setCanvasTab("brief")}
              >
                1. Scoped Brief
              </button>
              <button
                className={`ph-canvas-tab-btn ${canvasTab === "matches" ? "active" : ""}`}
                onClick={() => setCanvasTab("matches")}
              >
                2. Curated 3-Match
              </button>
              <button
                className={`ph-canvas-tab-btn ${canvasTab === "vault" ? "active" : ""}`}
                onClick={() => setCanvasTab("vault")}
              >
                3. Brand Vault
              </button>
            </div>

            <div className="ph-canvas-body">
              {canvasTab === "brief" && (
                <div>
                  <div className="ph-brief-row">
                    <div>
                      <div className="ph-brief-name">Event Campaign Kit</div>
                      <div style={{ fontSize: "12px", color: "var(--ph-muted)" }}>Flagship Deliverable Package</div>
                    </div>
                    <span className="ph-brief-tag">2 Coins &bull; $100</span>
                  </div>

                  <ul className="ph-checklist">
                    <li className="ph-check-item">
                      <span className="ph-check-icon">&check;</span>
                      <span>1 Commercial Print Flyer (8.5&times;11, 300 DPI CMYK Bleeds)</span>
                    </li>
                    <li className="ph-check-item">
                      <span className="ph-check-icon">&check;</span>
                      <span>1 Instagram Square Post (1080&times;1080)</span>
                    </li>
                    <li className="ph-check-item">
                      <span className="ph-check-icon">&check;</span>
                      <span>1 Instagram Story Graphic (1080&times;1920)</span>
                    </li>
                    <li className="ph-check-item">
                      <span className="ph-check-icon">&check;</span>
                      <span>2 Included Revision Rounds &bull; 48-Hour SLA</span>
                    </li>
                  </ul>
                </div>
              )}

              {canvasTab === "matches" && (
                <div>
                  <div style={{ fontSize: "12px", color: "var(--ph-muted)", marginBottom: "10px" }}>
                    Algorithm returns exactly 3 vetted local creatives (Zero bidding wars):
                  </div>
                  <div className="ph-match-cards">
                    <div className="ph-match-card-item selected">
                      <div>
                        <div className="ph-match-name">Stephanie W. &bull; Brand &amp; Packaging</div>
                        <div className="ph-match-spec">Verified Pro &bull; 18 Completed &bull; 100% On-Time</div>
                      </div>
                      <span className="ph-match-score">98% Match</span>
                    </div>
                    <div className="ph-match-card-item">
                      <div>
                        <div className="ph-match-name">Andre V. &bull; Editorial &amp; Typography</div>
                        <div className="ph-match-spec">Verified Pro &bull; 14 Completed &bull; 4.9 Rating</div>
                      </div>
                      <span className="ph-match-score">94% Match</span>
                    </div>
                    <div className="ph-match-card-item">
                      <div>
                        <div className="ph-match-name">Elena R. &bull; Social &amp; Motion Visuals</div>
                        <div className="ph-match-spec">Verified Pro &bull; 21 Completed &bull; 5.0 Rating</div>
                      </div>
                      <span className="ph-match-score">91% Match</span>
                    </div>
                  </div>
                </div>
              )}

              {canvasTab === "vault" && (
                <div>
                  <div style={{ fontSize: "12px", color: "var(--ph-muted)", marginBottom: "10px" }}>
                    Persistent client assets saved forever (No print shop rejections):
                  </div>
                  <div className="ph-vault-files">
                    <div className="ph-vault-file">
                      <strong>Brand Logo Vector</strong>
                      <span>.SVG / .AI &bull; Transparent</span>
                    </div>
                    <div className="ph-vault-file">
                      <strong>Press-Ready PDF</strong>
                      <span>300 DPI CMYK &bull; With Bleeds</span>
                    </div>
                    <div className="ph-vault-file">
                      <strong>Color Codes &amp; Fonts</strong>
                      <span>HEX, RGB &bull; Type Kit</span>
                    </div>
                    <div className="ph-vault-file">
                      <strong>Social Assets Kit</strong>
                      <span>High-Res PNGs &bull; Ready</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="ph-canvas-footer">
                <span>Status: <strong>Funds Protected in Escrow</strong></span>
                <span style={{ color: "var(--ph-green)", fontWeight: "700" }}>Payout on Sign-off</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Process Bar (Zoom / AppThink Style) */}
      <section className="ph-process-sec">
        <div className="ph-process-grid">
          <div className="ph-process-card">
            <span className="ph-step-num">Step 01</span>
            <h4>Drop in Peach Coins</h4>
            <p>1 Coin = $50. Simple fixed packages with zero hourly surprises or haggling.</p>
          </div>
          <div className="ph-process-card">
            <span className="ph-step-num">Step 02</span>
            <h4>Curated 3-Match</h4>
            <p>We present 3 vetted local specialists with clear styles. No 40+ generic cut-and-paste bids.</p>
          </div>
          <div className="ph-process-card">
            <span className="ph-step-num">Step 03</span>
            <h4>Collaborate in Canvas</h4>
            <p>Review draft proofs, check 300 DPI print standards, and get 2 included revision rounds.</p>
          </div>
          <div className="ph-process-card">
            <span className="ph-step-num">Step 04</span>
            <h4>Approve &amp; Vault</h4>
            <p>Funds release upon your final approval. Source vectors are permanently stored in your Brand Vault.</p>
          </div>
        </div>
      </section>

      {/* 5 Creative Disciplines */}
      <section className="ph-disciplines-sec">
        <div className="ph-section-header">
          <h2>Creative Support for Your Business</h2>
          <p>Skilled professionals ready to bring your vision to life.</p>
        </div>

        <div className="ph-disciplines-grid">
          {DISCIPLINES.map((d, i) => (
            <div key={i} className="ph-discipline-card">
              <div className="ph-discipline-img-wrap">
                <img src={d.image} alt={d.role} className="ph-discipline-img" />
              </div>
              <div className="ph-discipline-body">
                <div>
                  <h4>{d.role}</h4>
                  <p>{d.headline}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Businesses Love Peach Coins (AppThink Feature Comparison) */}
      <section className="ph-reasons-sec">
        <div className="ph-section-header">
          <h2>Why Businesses Love Peach Coins</h2>
          <p>Simple, predictable project units that eliminate hiring headaches.</p>
        </div>

        <div className="ph-reasons-grid">
          <div className="ph-reason-card">
            <h4>Cost Control</h4>
            <p>Know exactly how much you are spending on every project before work begins. No runaway hourly invoices.</p>
          </div>
          <div className="ph-reason-card">
            <h4>True Flexibility</h4>
            <p>Use coins when you need them, for what you need. From single flyers to full website refreshes.</p>
          </div>
          <div className="ph-reason-card">
            <h4>Vetted Creatives</h4>
            <p>Work with talented, hand-reviewed creatives who know local print standards and brand design.</p>
          </div>
          <div className="ph-reason-card">
            <h4>Focus on Growth</h4>
            <p>We handle scoping and quality reviews so you can stay 100% focused on running your business.</p>
          </div>
        </div>
      </section>

      {/* Peach Coin Menu & Pricing (Streamlined & Non-Overwhelming) */}
      <section className="ph-pricing-sec">
        <div className="ph-pricing-inner">
          <div className="ph-pricing-header">
            <h2>Peach Coin Pricing</h2>
            <p>1 Peach Coin = $50 Standard Creative Value. Choose how you want to work.</p>
          </div>

          <div className="ph-switch-wrap">
            <div className="ph-switch">
              <button
                className={`ph-switch-btn ${pricingTab === "project" ? "active" : ""}`}
                onClick={() => setPricingTab("project")}
              >
                By the Project (Pay-As-You-Go)
              </button>
              <button
                className={`ph-switch-btn ${pricingTab === "membership" ? "active" : ""}`}
                onClick={() => setPricingTab("membership")}
              >
                Monthly Memberships
              </button>
            </div>
          </div>

          {pricingTab === "project" ? (
            <div className="ph-price-grid">
              <div className="ph-compact-card">
                <div>
                  <div className="ph-compact-tag">Quick Tasks</div>
                  <div className="ph-compact-price">$50</div>
                  <div className="ph-compact-title">1 Peach Coin</div>
                  <p className="ph-compact-desc">Social media graphics, menu price updates, event flyers, or web banner edits.</p>
                </div>
                <div className="ph-compact-meta">24–48h Turnaround</div>
              </div>

              <div className="ph-compact-card featured">
                <div>
                  <div className="ph-compact-tag" style={{ color: "var(--ph-peach)" }}>Most Popular</div>
                  <div className="ph-compact-price">$100</div>
                  <div className="ph-compact-title">2 Peach Coins</div>
                  <p className="ph-compact-desc">Event Flyer Kit: Print-ready 8.5x11 flyer (300 DPI) + matching Instagram square &amp; story.</p>
                </div>
                <div className="ph-compact-meta">48h Turnaround</div>
              </div>

              <div className="ph-compact-card">
                <div>
                  <div className="ph-compact-tag">Brand Starters</div>
                  <div className="ph-compact-price">$300</div>
                  <div className="ph-compact-title">6 Peach Coins</div>
                  <p className="ph-compact-desc">Mini Brand Kit: Primary logo, secondary badge, typography kit, color palette &amp; SVGs.</p>
                </div>
                <div className="ph-compact-meta">4–5 Days Turnaround</div>
              </div>

              <div className="ph-compact-card">
                <div>
                  <div className="ph-compact-tag">Web &amp; Prototypes</div>
                  <div className="ph-compact-price">$500</div>
                  <div className="ph-compact-title">10 Peach Coins</div>
                  <p className="ph-compact-desc">Full responsive desktop &amp; mobile Figma design prototype with developer handoff.</p>
                </div>
                <div className="ph-compact-meta">5–7 Days Turnaround</div>
              </div>
            </div>
          ) : (
            <div className="ph-membership-grid">
              <div className="ph-membership-card">
                <div>
                  <div className="ph-plan-name">Essentials</div>
                  <div className="ph-plan-price">$499 <span>/month</span></div>
                  <div className="ph-plan-coins">10 Peach Coins Monthly</div>
                  <p className="ph-plan-desc">For everyday creative needs, menu updates, and weekly social promo graphics.</p>
                </div>
                <div style={{ marginTop: "16px" }}>
                  <Link href="/auth?mode=signup" className="ph-pill" style={{ display: "inline-block", textAlign: "center", width: "100%" }}>
                    Choose Essentials &rarr;
                  </Link>
                </div>
              </div>

              <div className="ph-membership-card featured">
                <span className="ph-pop-tag">Most Popular</span>
                <div>
                  <div className="ph-plan-name">Growth</div>
                  <div className="ph-plan-price">$1,099 <span>/month</span></div>
                  <div className="ph-plan-coins">24 Coins (+4 Bonus Coins)</div>
                  <p className="ph-plan-desc">For growing businesses needing parallel design requests and faster turnaround priority.</p>
                </div>
                <div style={{ marginTop: "16px" }}>
                  <Link href="/auth?mode=signup" className="ph-pill" style={{ display: "inline-block", textAlign: "center", width: "100%" }}>
                    Choose Growth &rarr;
                  </Link>
                </div>
              </div>

              <div className="ph-membership-card">
                <div>
                  <div className="ph-plan-name">Partner</div>
                  <div className="ph-plan-price">$2,199 <span>/month</span></div>
                  <div className="ph-plan-coins">50 Coins (+10 Bonus Coins)</div>
                  <p className="ph-plan-desc">Full creative team replacement for high-volume content, video, and campaigns.</p>
                </div>
                <div style={{ marginTop: "16px" }}>
                  <Link href="/auth?mode=signup" className="ph-pill" style={{ display: "inline-block", textAlign: "center", width: "100%" }}>
                    Choose Partner &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="ph-pricing-footer">
            <div className="ph-pricing-footer-text">
              <strong>Protected Payments:</strong> 100% of coin funds are held securely until you review and sign off on your deliverable.
            </div>
            <Link
              href="/auth?mode=signup"
              className="ph-pill"
              style={{ backgroundColor: "var(--ph-blue-light)", color: "var(--ph-coral)", padding: "9px 20px" }}
            >
              Get Started with Peach Coins &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Real Work Gallery */}
      <section className="ph-work-sec">
        <div className="ph-workhead">
          <div>
            <h2>Work From the Network</h2>
            <p>Swipe through real client deliverables. Tap any project to view details.</p>
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
                  <span className="ph-meta-time">{p.turnaround}</span>
                  <span className="ph-price">{p.coins} Peach Coins</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Birmingham Skyline Banner */}
      <section className="ph-skyline-banner">
        <div className="ph-skyline-card">
          <span className="ph-agency-tag">Powered by Sweet As A Peach Creative Agency</span>
          <h2 className="ph-skyline-title">
            Making brands <span>sweeter.</span> &hearts;
          </h2>
          <p className="ph-skyline-sub">
            Keeping creative talent and marketing capital thriving right here in Birmingham and across the South.
          </p>

          <div className="ph-skyline-actions">
            <Link href="/auth?mode=signup" className="ph-btn-primary">
              Post Your Project &rarr;
            </Link>
            <Link href="/apply" className="ph-btn-secondary">
              Apply to Be a Creative
            </Link>
          </div>

          {/* Birmingham Skyline Silhouette */}
          <svg className="ph-skyline-svg" viewBox="0 0 1200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 220h1200v-25h-40l-8-12h-22l-14 18h-46v-34l-40-18v52h-26v-65h-18v65h-16v-38h-24v38h-18v-80h-24v80h-14v-102h-32v102h-16v-55h-28v55h-20v-120h-44v120h-16v-75h-30v75h-18v-135h-50v135h-20v-85h-34v85h-16v-110h-42v110h-18v-60h-32v60h-24v-42h-28v42h-22v-88h-46v88h-18v-65h-36v65h-18v-38h-28v38h-20v-50h-34v50H0v25z"
              fill="#f08a62"
              fillOpacity="0.8"
            />
            <path
              d="M75 125c0-6 5-11 11-11s11 5 11 11-5 11-11 11-11-5-11-11zm11 14c-11 0-20 9-20 20v38h40v-38c0-11-9-20-20-20zm-3-50l15-22 9 6-15 22-9-6zm-13 110h30v26H70v-26z"
              fill="#e54307"
              fillOpacity="0.9"
            />
          </svg>
        </div>
      </section>

      {/* Modal Dialog */}
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
                <div style={{ color: "#64748b", fontSize: "12.5px", fontWeight: "600", marginBottom: "10px" }}>
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
                className="ph-btn-primary"
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
          <div>
            <strong style={{ color: "var(--ph-green)", fontSize: "15px" }}>Peach Network</strong>
            <div className="ph-footer-copy">Powered by Sweet As A Peach Creative Agency &bull; Birmingham, Alabama</div>
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
