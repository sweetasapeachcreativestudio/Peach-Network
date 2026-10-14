"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

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
    image: "/Creative5.jpg"
  },
  {
    role: "Designers",
    headline: "Create. Collaborate. Grow.",
    image: "/hero-bg.png"
  },
  {
    role: "Video Editors",
    headline: "Turn your talent into opportunity.",
    image: "/Creative 3.jpg"
  },
  {
    role: "Writers",
    headline: "Your words matter here.",
    image: "/Creative 4.jpg"
  },
  {
    role: "Businesses",
    headline: "Find the right creative. Get it done.",
    image: "/brand/business-owner.jpg"
  }
];

interface HeroDemo {
  id: number;
  discipline: string;
  icon: string;
  client: string;
  project: string;
  coins: number;
  dollarValue: string;
  turnaround: string;
  deliverables: string[];
  matches: { name: string; specialty: string; fit: string; status: string }[];
}

const HERO_DEMOS: HeroDemo[] = [
  {
    id: 1,
    discipline: "Product Photo",
    icon: "📸",
    client: "Local Culinary & Artisan Market",
    project: "Event Flyer Kit & Commercial Photo Suite",
    coins: 2,
    dollarValue: "$100",
    turnaround: "48 Hours",
    deliverables: ["1 Commercial Print Flyer (CMYK)", "Instagram Square & Story", "Hi-Res Studio Handoff"],
    matches: [
      { name: "Marcus T.", specialty: "Commercial & Product Photo", fit: "99% Fit", status: "Selected" },
      { name: "Elena R.", specialty: "Lifestyle & Food Photography", fit: "97% Fit", status: "Available" },
      { name: "Devon S.", specialty: "Studio Lighting & Color Grading", fit: "95% Fit", status: "Available" },
    ],
  },
  {
    id: 2,
    discipline: "Brand Identity",
    icon: "🎨",
    client: "Runa Streetwear Apparel",
    project: "Moon Iconography & Streetwear Apparel Suite",
    coins: 6,
    dollarValue: "$300",
    turnaround: "4–5 Days",
    deliverables: ["Primary & Submark Vector Logos", "Apparel Vector Artwork", "Brand Vault Source Archive"],
    matches: [
      { name: "Simone K.", specialty: "Senior Brand & Apparel Designer", fit: "98% Fit", status: "Selected" },
      { name: "Andre L.", specialty: "Typography & Vector Artist", fit: "96% Fit", status: "Available" },
      { name: "Jordan M.", specialty: "Packaging & Print Specialist", fit: "95% Fit", status: "Available" },
    ],
  },
  {
    id: 3,
    discipline: "Mobile & Web UI",
    icon: "💻",
    client: "Lillian Hewitt, Black Women's Heart Health",
    project: "Responsive Health Portal & Mobile UI Prototype",
    coins: 10,
    dollarValue: "$500",
    turnaround: "5–7 Days",
    deliverables: ["Responsive Web Dashboard", "Mobile App Figma Prototype", "Developer Handoff Kit"],
    matches: [
      { name: "Maya B.", specialty: "Product & UI/UX Designer", fit: "99% Fit", status: "Selected" },
      { name: "Chris W.", specialty: "Design Systems & Tailwind UI", fit: "97% Fit", status: "Available" },
      { name: "Taylor N.", specialty: "Interactive Prototyping Lead", fit: "94% Fit", status: "Available" },
    ],
  },
];

export default function HomePage() {
  const [selected, setSelected] = useState<ProjectItem | null>(null);
  const [pricingTab, setPricingTab] = useState<"project" | "membership">("project");
  const [activeHeroTab, setActiveHeroTab] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroTab((prev) => (prev + 1) % HERO_DEMOS.length);
    }, 4800);
    return () => clearInterval(timer);
  }, []);

  const currentHero = HERO_DEMOS[activeHeroTab];

  return (
    <main className="ph">

      <style>{`
        :root {
          --ph-green: #0d2f24;
          --ph-green-mid: #164335;
          --ph-green-soft: #edf5f1;
          --ph-blue-cyan: #70eaff;
          --ph-blue-deep: #0284c7;
          --ph-blue-sky: #38bdf8;
          --ph-blue-navy: #034870;
          --ph-blue-ice: #e0f2fe;
          --ph-blue-soft: #f0f9ff;
          --ph-peach-soft: #fff5ed;
          --ph-peach-border: #fed7aa;
          --ph-peach-warm: #ffe8df;
          --ph-coral: #e54307;
          --ph-coral-light: #ff7547;
          --ph-coral-soft: #ffe8df;
          --ph-ink: #0f241a;
          --ph-muted: #4e6157;
          --ph-border: #dbe7e2;
          --ph-shadow-sm: 0 4px 16px rgba(2, 132, 199, 0.06);
          --ph-shadow-lg: 0 24px 60px rgba(2, 132, 199, 0.16);
        }

        * {
          box-sizing: border-box;
        }

        .ph {
          min-height: 100vh;
          /* Rich Southern sky-blue mist seamlessly blending with warm fresh peach */
          background: linear-gradient(135deg, #e3f4fd 0%, #f1f9fe 22%, #fff5ed 52%, #eaf6fc 82%, #fff0e4 100%);
          color: var(--ph-ink);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          overflow-x: hidden;
          line-height: 1.5;
        }

        /* Top Announcement Strip with Southern Blue & Green Accent */
        .ph-topbar {
          background: linear-gradient(90deg, #092c4c 0%, #0369a1 40%, #0d2f24 100%);
          color: #f0f9ff;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          letter-spacing: 0.02em;
        }

        .ph-topbar strong {
          color: var(--ph-blue-cyan);
        }

        /* Header Navigation */
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
          gap: 12px;
        }

        .ph-login-link {
          color: #0369a1;
          text-decoration: none;
          font-weight: 850;
          font-size: 14px;
          padding: 9px 20px;
          border-radius: 999px;
          background: #ffffff;
          border: 1.5px solid #bae6fd;
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.08);
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
        }

        .ph-login-link:hover {
          background: #f0f9ff;
          border-color: #38bdf8;
          color: #0284c7;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.15);
        }

        .ph-pill {
          padding: 10px 22px;
          border: 1px solid var(--ph-border);
          border-radius: 999px;
          background-color: var(--ph-blue-cyan);
          color: var(--ph-coral);
          font-weight: 850;
          font-size: 14px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 14px rgba(112, 234, 255, 0.45);
          transition: all 0.2s ease;
        }

        .ph-pill:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(112, 234, 255, 0.65);
        }

        /* Hero Section (One-Screen AppThink & Zoom Style) */
        .ph-hero-sec {
          max-width: 1240px;
          margin: 0 auto;
          min-height: calc(88vh - 116px);
          padding: 16px 24px 34px;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 36px;
          align-items: center;
          position: relative;
        }

        .ph-kicker {
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #0284c7;
          background: #e0f2fe;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1.5px solid #70eaff;
          margin-bottom: 18px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 10px rgba(112, 234, 255, 0.3);
        }

        .ph-kicker-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0284c7;
          box-shadow: 0 0 8px #70eaff;
          display: inline-block;
          animation: dotPulse 2s infinite ease-in-out;
        }

        .ph-hero-title {
          font-size: clamp(40px, 4.8vw, 62px);
          line-height: 1.06;
          letter-spacing: -0.04em;
          color: var(--ph-green);
          font-weight: 900;
          margin: 0 0 16px;
        }

        .ph-hero-title span {
          display: block;
          color: var(--ph-coral);
        }

        .ph-hero-sub {
          font-size: 17px;
          line-height: 1.55;
          color: var(--ph-muted);
          max-width: 500px;
          margin: 0 0 26px;
        }

        .ph-hero-sub strong {
          color: var(--ph-green);
        }

        .ph-hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 24px;
        }

        .ph-btn-primary {
          min-height: 52px;
          padding: 0 32px;
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

        .ph-btn-primary:hover {
          background: var(--ph-green-mid);
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(13, 47, 36, 0.3);
        }

        .ph-btn-secondary {
          min-height: 52px;
          padding: 0 26px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 15px;
          background: #ffffff;
          color: #0369a1;
          border: 1.5px solid #bae6fd;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.08);
          transition: all 0.2s ease;
        }

        .ph-btn-secondary:hover {
          background: #f0f9ff;
          border-color: #38bdf8;
          color: #0284c7;
          transform: translateY(-1px);
        }

        .ph-hero-trust {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 12.5px;
          color: #526b60;
          font-weight: 700;
          flex-wrap: wrap;
        }

        .ph-hero-trust-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        /* Hero Interactive Stage (Seamlessly Blended in Hero Viewport) */
        .ph-stage-container {
          position: relative;
          width: 100%;
          max-width: 530px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ph-ambient-glow {
          position: absolute;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(112, 234, 255, 0.45) 0%, rgba(56, 189, 248, 0.28) 35%, rgba(254, 215, 170, 0.32) 65%, transparent 75%);
          filter: blur(52px);
          animation: ambientBlueGlow 6s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .ph-live-stage {
          position: relative;
          width: 100%;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(112, 234, 255, 0.7);
          border-radius: 28px;
          padding: 20px 22px;
          box-shadow: 0 24px 60px rgba(2, 132, 199, 0.14), 0 4px 16px rgba(13, 47, 36, 0.05);
          animation: stageFloat 5.5s ease-in-out infinite;
          z-index: 2;
        }

        /* Top Bar inside the stage */
        .ph-stage-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid #e0f2fe;
          margin-bottom: 12px;
        }

        .ph-stage-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 850;
          color: #0369a1;
          background: #e0f2fe;
          padding: 4px 12px;
          border-radius: 999px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .ph-stage-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
          display: inline-block;
          animation: dotPulse 1.8s infinite ease-in-out;
        }

        .ph-stage-counter {
          font-size: 11.5px;
          font-weight: 700;
          color: #64748b;
        }

        /* Interactive Discipline Switcher Tabs */
        .ph-stage-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
        }

        .ph-stage-tab {
          flex: 1;
          padding: 7px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid #dbeafe;
          background: #f8fafc;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .ph-stage-tab.active {
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: #ffffff;
          border-color: #0284c7;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);
        }

        /* Active Project Overview Card */
        .ph-stage-card {
          background: linear-gradient(135deg, #f0f9ff 0%, #fff7ed 100%);
          border: 1.5px solid #bae6fd;
          border-radius: 16px;
          padding: 14px 16px;
          margin-bottom: 12px;
        }

        .ph-stage-card-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
        }

        .ph-stage-client {
          font-size: 11px;
          font-weight: 850;
          text-transform: uppercase;
          color: #0284c7;
          letter-spacing: 0.05em;
        }

        .ph-stage-project-name {
          font-size: 14.5px;
          font-weight: 850;
          color: var(--ph-green);
          margin: 2px 0 6px;
        }

        .ph-stage-coin-badge {
          background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%);
          border: 1.5px solid #70eaff;
          border-radius: 12px;
          padding: 5px 10px;
          text-align: right;
          box-shadow: 0 3px 10px rgba(112, 234, 255, 0.35);
        }

        .ph-stage-coin-val {
          font-size: 15px;
          font-weight: 900;
          color: var(--ph-coral);
          line-height: 1.1;
        }

        .ph-stage-coin-usd {
          font-size: 10.5px;
          font-weight: 700;
          color: #0369a1;
        }

        .ph-stage-deliverables {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }

        .ph-stage-deliv-tag {
          font-size: 10.5px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 2px 7px;
          border-radius: 6px;
        }

        /* 3-Match Creative Candidates List */
        .ph-stage-matches {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-bottom: 12px;
        }

        .ph-stage-match-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 11px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 11px;
          transition: all 0.2s ease;
        }

        .ph-stage-match-row.active {
          border-color: #38bdf8;
          background: #f0f9ff;
          box-shadow: 0 3px 10px rgba(56, 189, 248, 0.15);
        }

        .ph-stage-match-info {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .ph-stage-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #70eaff 0%, #0284c7 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10.5px;
          font-weight: 900;
        }

        .ph-stage-creative-name {
          font-size: 12px;
          font-weight: 850;
          color: var(--ph-green);
          line-height: 1.2;
        }

        .ph-stage-creative-spec {
          font-size: 10.5px;
          color: #64748b;
        }

        .ph-stage-match-pill {
          font-size: 10.5px;
          font-weight: 850;
          padding: 2px 7px;
          border-radius: 999px;
          background: #dcfce7;
          color: #166534;
        }

        .ph-stage-match-pill.blue {
          background: #e0f2fe;
          color: #0369a1;
        }

        /* Stage Footer */
        .ph-stage-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid #e0f2fe;
          font-size: 11.5px;
          color: #475569;
          font-weight: 700;
        }

        .ph-stage-footer strong {
          color: #0284c7;
        }

        /* Floating AppThink-Style Badges hovering around the stage */
        .ph-float-tag-top {
          position: absolute;
          top: -14px;
          right: -14px;
          background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%);
          color: #ffffff;
          padding: 7px 16px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 850;
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.35);
          animation: pillHover1 3.8s ease-in-out infinite alternate;
          z-index: 10;
          pointer-events: none;
        }

        .ph-float-tag-bottom {
          position: absolute;
          bottom: -14px;
          left: -14px;
          background: #ffffff;
          color: var(--ph-coral);
          border: 1.5px solid #fed7aa;
          padding: 7px 16px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 850;
          box-shadow: 0 8px 20px rgba(229, 67, 7, 0.15);
          animation: pillHover2 4.2s ease-in-out infinite alternate;
          z-index: 10;
          pointer-events: none;
        }

        /* Animations */
        @keyframes stageFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes ambientBlueGlow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.72;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.95;
          }
        }

        @keyframes pillHover1 {
          0% {
            transform: translateY(0px) translateX(0px);
          }
          100% {
            transform: translateY(-8px) translateX(4px);
          }
        }

        @keyframes pillHover2 {
          0% {
            transform: translateY(0px) translateX(0px);
          }
          100% {
            transform: translateY(6px) translateX(-4px);
          }
        }

        @keyframes dotPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(0.85);
          }
        }

        /* Section Headings */
        .ph-section-header {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 30px;
          padding: 0 16px;
        }

        .ph-section-header h2 {
          font-size: clamp(28px, 3.4vw, 40px);
          font-weight: 900;
          color: var(--ph-green);
          letter-spacing: -0.03em;
          margin: 0 0 10px;
        }

        .ph-section-header p {
          color: var(--ph-muted);
          font-size: 16px;
          margin: 0;
        }

        /* 3 Core Pillars (AppThink Structured Feature Grid) */
        .ph-pillars-sec {
          max-width: 1240px;
          margin: 0 auto 60px;
          padding: 0 24px;
        }

        .ph-pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .ph-pillar-card {
          background: #ffffff;
          border: 1.5px solid var(--ph-border);
          border-radius: 22px;
          padding: 26px 22px;
          box-shadow: var(--ph-shadow-sm);
          transition: transform 0.2s ease;
        }

        .ph-pillar-card:hover {
          transform: translateY(-3px);
        }

        .ph-pillar-num {
          font-size: 12px;
          font-weight: 900;
          color: var(--ph-blue-deep);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }

        .ph-pillar-card h3 {
          font-size: 18px;
          font-weight: 850;
          color: var(--ph-green);
          margin: 0 0 8px;
        }

        .ph-pillar-card p {
          margin: 0;
          font-size: 14px;
          color: var(--ph-muted);
          line-height: 1.5;
        }

        /* 5 Creative Disciplines */
        .ph-disciplines-sec {
          max-width: 1240px;
          margin: 0 auto 60px;
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
          box-shadow: var(--ph-shadow-sm);
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease;
        }

        .ph-discipline-card:hover {
          transform: translateY(-4px);
        }

        .ph-discipline-img-wrap {
          width: 100%;
          height: 160px;
          background: #f1ede8;
          overflow: hidden;
        }

        .ph-discipline-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          display: block;
        }

        .ph-discipline-body {
          padding: 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
        }

        .ph-discipline-body h4 {
          margin: 0 0 4px;
          font-size: 14.5px;
          font-weight: 850;
          color: var(--ph-green);
        }

        .ph-discipline-body p {
          margin: 0;
          font-size: 12px;
          color: var(--ph-muted);
          line-height: 1.4;
        }

        /* Why Businesses Love Peach Coins */
        .ph-reasons-sec {
          max-width: 1240px;
          margin: 0 auto 60px;
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
          border-radius: 20px;
          padding: 24px 20px;
          box-shadow: var(--ph-shadow-sm);
          border-top: 4px solid var(--ph-blue-deep);
        }

        .ph-reason-card:nth-child(2) {
          border-top-color: var(--ph-blue-cyan);
        }

        .ph-reason-card:nth-child(3) {
          border-top-color: var(--ph-green);
        }

        .ph-reason-card:nth-child(4) {
          border-top-color: var(--ph-coral);
        }

        .ph-reason-card h4 {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 850;
          color: var(--ph-green);
        }

        .ph-reason-card p {
          margin: 0;
          font-size: 13.5px;
          color: var(--ph-muted);
          line-height: 1.5;
        }

        /* Peach Coin Pricing (Compact & Clean) */
        .ph-pricing-sec {
          background: var(--ph-green);
          color: #ffffff;
          padding: 60px 24px;
          margin-bottom: 60px;
        }

        .ph-pricing-inner {
          max-width: 1100px;
          margin: auto;
        }

        .ph-pricing-header {
          text-align: center;
          max-width: 660px;
          margin: 0 auto 28px;
        }

        .ph-pricing-header h2 {
          font-size: clamp(28px, 3.4vw, 40px);
          font-weight: 900;
          letter-spacing: -0.025em;
          margin: 0 0 10px;
        }

        .ph-pricing-header p {
          color: #d1ded8;
          font-size: 16px;
          margin: 0;
        }

        .ph-switch-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 28px;
        }

        .ph-switch {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.12);
          padding: 4px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .ph-switch-btn {
          padding: 8px 24px;
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
          gap: 14px;
          margin-bottom: 24px;
        }

        .ph-compact-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 20px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .ph-compact-card.featured {
          background: rgba(255, 255, 255, 0.14);
          border-color: var(--ph-blue-cyan);
        }

        .ph-compact-tag {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.06em;
          color: var(--ph-blue-cyan);
          text-transform: uppercase;
        }

        .ph-compact-price {
          font-size: 28px;
          font-weight: 900;
          color: #ffffff;
          margin: 4px 0 2px;
        }

        .ph-compact-title {
          font-size: 15px;
          font-weight: 850;
          margin: 4px 0 6px;
        }

        .ph-compact-desc {
          font-size: 12.5px;
          color: #c7d6cf;
          line-height: 1.45;
          margin: 0 0 12px;
        }

        .ph-compact-meta {
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 11.5px;
          color: #9cb3a8;
          font-weight: 600;
        }

        /* Membership Grid */
        .ph-membership-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .ph-membership-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 22px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .ph-membership-card.featured {
          background: rgba(255, 255, 255, 0.14);
          border-color: var(--ph-blue-cyan);
        }

        .ph-pop-tag {
          position: absolute;
          top: -10px;
          right: 18px;
          background: var(--ph-blue-cyan);
          color: #0c4a6e;
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
          font-size: 32px;
          font-weight: 900;
          margin: 6px 0;
        }

        .ph-plan-price span {
          font-size: 13px;
          font-weight: 600;
          color: #a4beaf;
        }

        .ph-plan-coins {
          font-size: 13.5px;
          font-weight: 800;
          color: var(--ph-blue-cyan);
          margin-bottom: 10px;
        }

        .ph-plan-desc {
          font-size: 12.5px;
          color: #c7d6cf;
          line-height: 1.45;
          margin: 0;
        }

        .ph-pricing-footer {
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 18px;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
        }

        .ph-pricing-footer-text {
          font-size: 13.5px;
          color: #e2ede8;
        }

        /* Work Showcase */
        .ph-work-sec {
          max-width: 1240px;
          margin: 0 auto 60px;
          padding: 0 24px;
        }

        .ph-workhead {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 22px;
        }

        .ph-workhead h2 {
          font-size: clamp(26px, 3.2vw, 36px);
          font-weight: 900;
          color: var(--ph-green);
          margin: 0 0 4px;
        }

        .ph-workhead p {
          color: var(--ph-muted);
          font-size: 15px;
          margin: 0;
        }

        .ph-track {
          display: flex;
          gap: 18px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding: 4px 2px 20px;
          -webkit-overflow-scrolling: touch;
        }

        .ph-card {
          flex: 0 0 330px;
          scroll-snap-align: start;
          border: 1px solid var(--ph-border);
          border-radius: 22px;
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
          height: 200px;
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
          font-size: 16px;
          font-weight: 850;
          color: var(--ph-green);
          margin: 4px 0;
          line-height: 1.3;
        }

        .ph-card-client {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 12px;
        }

        .ph-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          padding-top: 12px;
          border-top: 1px solid #f4ebe4;
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
          margin: 0 auto 60px;
          padding: 0 24px;
        }

        .ph-skyline-card {
          background: linear-gradient(180deg, #fff2e8 0%, #ffd8c4 100%);
          border: 1.5px solid #fed7aa;
          border-radius: 32px;
          padding: 42px 32px 0;
          overflow: hidden;
          text-align: center;
          position: relative;
        }

        .ph-agency-tag {
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--ph-blue-deep);
          margin-bottom: 10px;
          display: block;
        }

        .ph-skyline-title {
          font-size: clamp(28px, 3.4vw, 42px);
          font-weight: 900;
          color: var(--ph-green);
          margin: 0 0 12px;
          letter-spacing: -0.025em;
        }

        .ph-skyline-title span {
          color: var(--ph-coral);
          font-family: Georgia, serif;
          font-style: italic;
          font-weight: 400;
        }

        .ph-skyline-sub {
          font-size: 16px;
          color: #624b40;
          max-width: 620px;
          margin: 0 auto 28px;
          line-height: 1.55;
        }

        .ph-skyline-actions {
          display: flex;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 30px;
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
          padding: 38px 24px;
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
          font-size: 13px;
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
            width: 150px;
            height: 75px;
          }

          .ph-navlinks {
            right: 12px;
            gap: 8px;
          }

          .ph-login-link {
            font-size: 13px;
            padding: 6px 10px;
          }

          .ph-pill {
            padding: 8px 16px;
            font-size: 13px;
          }

          .ph-hero-sec {
            grid-template-columns: 1fr;
            min-height: auto;
            padding: 16px 16px 36px;
            gap: 28px;
          }

          .ph-stage-container {
            max-width: 100%;
          }

          .ph-float-tag-top {
            right: 0px;
            top: -10px;
          }

          .ph-float-tag-bottom {
            left: 0px;
            bottom: -10px;
          }

          .ph-pillars-grid {
            grid-template-columns: 1fr;
            gap: 14px;
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
          <Link href="/auth?mode=signin" className="ph-login-link">
            Log In
          </Link>
          <Link
            href="/auth?mode=signup"
            className="ph-pill"
            style={{ backgroundColor: "#70eaff", color: "#e54307" }}
          >
            Start a Project &rarr;
          </Link>
        </div>
      </header>

      {/* Hero Section (One-Screen AppThink-Style Animated Hero with Southern Blue & Peach Tones) */}
      <section className="ph-hero-sec">
        <div>
          <span className="ph-kicker">
            <span className="ph-kicker-dot"></span>
            BIRMINGHAM&rsquo;S CREATIVE MARKETPLACE
          </span>

          <h1 className="ph-hero-title">
            Helping Brands <br />
            <span>Grow Sweeter.</span>
          </h1>

          <p className="ph-hero-sub">
            Built by <strong>Sweet As A Peach Creative Agency</strong>.<br />
            Connecting businesses with vetted Southern creatives through transparent Peach Coins and zero bidding wars.
          </p>

          <div className="ph-hero-actions">
            <Link href="/auth?mode=signup" className="ph-btn-primary">
              Start a Project &rarr;
            </Link>
            <Link href="/apply" className="ph-btn-secondary">
              Join the Creative Network
            </Link>
          </div>

          <div className="ph-hero-trust">
            <span className="ph-hero-trust-item">
              <span>🪙</span> 1 Coin = $50 Fixed
            </span>
            <span className="ph-hero-trust-item">
              <span>⚡</span> 3-Match in 24h
            </span>
            <span className="ph-hero-trust-item">
              <span>🔒</span> Protected Escrow
            </span>
          </div>
        </div>

        {/* Seamlessly Integrated Peach Network 3-Match Stage in the Hero Screen */}
        <div className="ph-stage-container">
          <div className="ph-ambient-glow"></div>

          {/* Floating contextual badges hovering smoothly around the stage */}
          <div className="ph-float-tag-top">
            🪙 1 Coin = $50 Standard Rate
          </div>
          <div className="ph-float-tag-bottom">
            🔒 Escrow Protected &bull; Vault Storage
          </div>

          {/* Interactive Live Match & Vending Card */}
          <div className="ph-live-stage">
            {/* Stage Top Bar */}
            <div className="ph-stage-topbar">
              <div className="ph-stage-badge">
                <span className="ph-stage-status-dot"></span>
                Peach Match Engine
              </div>
              <div className="ph-stage-counter">
                Active in 205 Area &bull; 100% Vetted
              </div>
            </div>

            {/* Clickable / Auto-cycling Project Tabs */}
            <div className="ph-stage-tabs">
              {HERO_DEMOS.map((demo, idx) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => setActiveHeroTab(idx)}
                  className={`ph-stage-tab ${activeHeroTab === idx ? "active" : ""}`}
                >
                  <span>{demo.icon}</span>
                  <span>{demo.discipline}</span>
                </button>
              ))}
            </div>

            {/* Active Project Card */}
            <div className="ph-stage-card">
              <div className="ph-stage-card-head">
                <div>
                  <div className="ph-stage-client">{currentHero.client}</div>
                  <div className="ph-stage-project-name">{currentHero.project}</div>
                </div>
                <div className="ph-stage-coin-badge">
                  <div className="ph-stage-coin-val">{currentHero.coins} Coins</div>
                  <div className="ph-stage-coin-usd">{currentHero.dollarValue} Total</div>
                </div>
              </div>

              <div className="ph-stage-deliverables">
                {currentHero.deliverables.map((item, i) => (
                  <span key={i} className="ph-stage-deliv-tag">{item}</span>
                ))}
              </div>
            </div>

            {/* Curated 3-Match Creative Candidates */}
            <div className="ph-stage-matches">
              {currentHero.matches.map((cand, idx) => (
                <div
                  key={idx}
                  className={`ph-stage-match-row ${idx === 0 ? "active" : ""}`}
                >
                  <div className="ph-stage-match-info">
                    <div className="ph-stage-avatar">
                      {cand.name.charAt(0)}
                    </div>
                    <div>
                      <div className="ph-stage-creative-name">
                        {cand.name}
                        {idx === 0 && (
                          <span style={{ marginLeft: "6px", fontSize: "10.5px", color: "var(--ph-coral)", fontWeight: "800" }}>
                            &bull; Top Pick
                          </span>
                        )}
                      </div>
                      <div className="ph-stage-creative-spec">{cand.specialty}</div>
                    </div>
                  </div>
                  <span className={`ph-stage-match-pill ${idx === 0 ? "" : "blue"}`}>
                    {cand.fit}
                  </span>
                </div>
              ))}
            </div>

            {/* Stage Footer Status */}
            <div className="ph-stage-footer">
              <div>
                Turnaround: <strong>{currentHero.turnaround}</strong>
              </div>
              <div>
                Status: <strong style={{ color: "var(--ph-coral)" }}>Ready to Match</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Pillars (AppThink Structured Feature Grid) */}
      <section className="ph-pillars-sec">
        <div className="ph-pillars-grid">
          <div className="ph-pillar-card">
            <span className="ph-pillar-num">Pillar 01</span>
            <h3>Fixed Currency</h3>
            <p>1 Peach Coin = $50 standard creative value. Zero bidding wars, no hourly creep, and guaranteed rate integrity.</p>
          </div>
          <div className="ph-pillar-card">
            <span className="ph-pillar-num">Pillar 02</span>
            <h3>Curated 3-Match</h3>
            <p>Intelligent matching presents exactly 3 vetted local creatives with clear differences. Work starts in 24 hours.</p>
          </div>
          <div className="ph-pillar-card">
            <span className="ph-pillar-num">Pillar 03</span>
            <h3>Protected Payout &amp; Vault</h3>
            <p>Funds are held securely in escrow until you approve. Vector source files are stored permanently in your Brand Vault.</p>
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

      {/* Why Businesses Love Peach Coins */}
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
                  <div className="ph-compact-tag" style={{ color: "var(--ph-blue-cyan)" }}>Most Popular</div>
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
              style={{ backgroundColor: "var(--ph-blue-cyan)", color: "var(--ph-coral)", padding: "9px 20px" }}
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
