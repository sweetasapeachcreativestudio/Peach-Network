"use client";

import React, { useState } from "react";
import Link from "next/link";
import BrandSplash from "./components/brand-splash";

const RECENT_PROJECTS = [
  {
    id: 1,
    title: "Runa Cultural Brand & Moon Iconography",
    category: "Brand Identity & Custom Iconography",
    deliverable: "Mini Brand Kit • 6 Coins",
    creator: "Crafted by Jose M.",
    image: "/project 7.jpg",
    altImages: ["/project-7.jpg", "/project7.jpg", "/projects/project 7.jpg"],
    accent: "#0284C7",
    bgGradient: "linear-gradient(135deg, #0C4A6E 0%, #032338 100%)",
    icon: "🌙",
    tag: "Identity & Apparel",
    headline: "Ancient Heritage • Modern Minimalist Seal",
    desc: "Handcrafted crescent moon emblem with intricate indigenous motifs and custom typography for streetwear.",
  },
  {
    id: 2,
    title: "The Guardian's Portal Concept Art",
    category: "Original Editorial & Concept Illustration",
    deliverable: "Editorial Illustration • 4 Coins",
    creator: "Crafted by Jose M.",
    image: "/Project 6.jpg",
    altImages: ["/project-6.jpg", "/project6.jpg", "/projects/Project 6.jpg"],
    accent: "#8B5CF6",
    bgGradient: "linear-gradient(135deg, #3B0764 0%, #150226 100%)",
    icon: "⚔️",
    tag: "Concept Illustration",
    headline: "Atmospheric Visual Storytelling",
    desc: "Cinematic vector keyframe depicting a cloaked knight facing a luminous spectral rift with custom lighting.",
  },
  {
    id: 3,
    title: "Bessemer Chamber of Commerce Web Portal",
    category: "Web UI Design & Civic Platform",
    deliverable: "Web Experience • 10 Coins",
    creator: "Peach Web Studio",
    image: "/project 8.jpg",
    altImages: ["/project-8.jpg", "/project8.jpg", "/projects/project 8.jpg"],
    accent: "#06B6D4",
    bgGradient: "linear-gradient(135deg, #164E63 0%, #082733 100%)",
    icon: "💻",
    tag: "Civic & Web",
    headline: "Building Connections That Matter",
    desc: "Full responsive municipal digital experience presented live to civic leadership in Bessemer, AL.",
  },
  {
    id: 4,
    title: "Remy Event Center Luxury Wedding Stationery",
    category: "Editorial Print & Event Suite",
    deliverable: "Editorial Print • 4 Coins",
    creator: "Peach Print Lab",
    image: "/project 9.jpg",
    altImages: ["/project-9.jpg", "/project9.jpg", "/projects/project 9.jpg"],
    accent: "#F59E0B",
    bgGradient: "linear-gradient(135deg, #78350F 0%, #361704 100%)",
    icon: "💌",
    tag: "Luxury Print & Event",
    headline: "Lewis / Lee Wedding • Birmingham, AL",
    desc: "Luxury foiled reception detail cards, hotel accommodation inserts, and gift registry stationery printed locally.",
  },
  {
    id: 5,
    title: "Lawson State Community College",
    category: "Social Media Campaign & Templates",
    deliverable: "Social 4-Pack • 3 Coins",
    creator: "Peach Creative Network",
    image: "/Project 1.png",
    altImages: ["/project-1.png", "/projects/Project 1.png", "/projects/project-lawson-state.png"],
    accent: "#F3C64F",
    bgGradient: "linear-gradient(135deg, #0A2E50 0%, #031526 100%)",
    icon: "🎓",
    tag: "Higher Education",
    headline: "Opportunity Lives Here",
    desc: "Branded student spotlights, culinary program announcements, and high-engagement Instagram templates.",
  },
  {
    id: 6,
    title: "New Joy Fellowship BBQ Fundraiser",
    category: "Fundraiser Menu Board & Signage",
    deliverable: "Print Signage • 2 Coins",
    creator: "Peach Creative Network",
    image: "/Project 2.png",
    altImages: ["/project-2.png", "/projects/Project 2.png", "/projects/project-church-menu.png"],
    accent: "#FB923C",
    bgGradient: "linear-gradient(135deg, #7C2D12 0%, #391104 100%)",
    icon: "🍗",
    tag: "Event & Food",
    headline: "Food • Faith • Community",
    desc: "Woodgrain outdoor event signage, combo menu displays, and on-site sponsor banners.",
  },
  {
    id: 7,
    title: "Bessemer Area Chamber of Commerce Brand Kit",
    category: "Full Brand Identity & Merch Kit",
    deliverable: "Mini Brand Kit • 6 Coins",
    creator: "Peach Creative Network",
    image: "/Project 3.png",
    altImages: ["/project-3.png", "/projects/Project 3.png", "/projects/project-bessemer-brand.png"],
    accent: "#60A5FA",
    bgGradient: "linear-gradient(135deg, #133E8D 0%, #091B42 100%)",
    icon: "🏛️",
    tag: "Civic & Chamber",
    headline: "Official Municipal Brand Seal",
    desc: "Official municipal seal, reception dimensional signage, business stationery, and member merchandise.",
  },
  {
    id: 8,
    title: "New Joy Fellowship Baptist Church",
    category: "Event Program & Editorial Print Kit",
    deliverable: "Editorial Print • 4 Coins",
    creator: "Peach Creative Network",
    image: "/Project 4.png",
    altImages: ["/project-4.png", "/projects/Project 4.png", "/projects/project-church-program.png"],
    accent: "#E879F9",
    bgGradient: "linear-gradient(135deg, #6B21A8 0%, #3B0764 100%)",
    icon: "⛪",
    tag: "Faith & Community",
    headline: "Friends & Family Day 2026",
    desc: "Commemorative service booklets, floral announcements, and community invitations.",
  },
];

const CREATIVE_SNAPS = [
  {
    image: "/Creative1.jpg",
    altImages: ["/creative1.jpg", "/Creative 1.jpg"],
    caption: "Sweet As A Peach Team & Brand Ambassadors at Local Event",
    role: "Studio Community & Pop-Up Merch",
    accent: "#E85D3F",
    icon: "🍑",
  },
  {
    image: "/Creative2.jpg",
    altImages: ["/creative2.jpg", "/Creative 2.jpg"],
    caption: "UI/UX & Web Pro in the Zone on Turquoise Setup",
    role: "Digital Design & Storefronts",
    accent: "#06B6D4",
    icon: "💻",
  },
  {
    image: "/Creative 3.jpg",
    altImages: ["/Creative-3.jpg", "/creative3.jpg", "/Creative3.jpg"],
    caption: "Creative Team in Studio Review & Project Brainstorm",
    role: "Brand Strategy & Review",
    accent: "#16A34A",
    icon: "✨",
  },
  {
    image: "/Creative 4.jpg",
    altImages: ["/Creative-4.jpg", "/creative4.jpg", "/Creative4.jpg"],
    caption: "Videographer Capturing Church Sanctuary & Stained Glass",
    role: "On-Location Church Videography",
    accent: "#0284C7",
    icon: "🎥",
  },
  {
    image: "/Creative5.jpg",
    altImages: ["/creative5.jpg", "/Creative 5.jpg"],
    caption: "Video Director & Camera Operator Directing Outdoor Shoot",
    role: "Commercial Video Production",
    accent: "#E85D3F",
    icon: "🎬",
  },
  {
    image: "/creative 6.jpg",
    altImages: ["/Creative-6.jpg", "/creative6.jpg", "/Creative 6.jpg"],
    caption: "Field Director at Local Community Venue Shoot",
    role: "Event Storytelling & Film",
    accent: "#F59E0B",
    icon: "📍",
  },
];

const ALACARTE_ITEMS = [
  {
    coins: 1,
    price: "$50",
    name: "Quick Graphic / Ad",
    subtitle: "Fast single graphic deliverable",
    turnaround: "24h Turnaround",
    icon: "⚡",
    includes: [
      "1 Custom branded promotional graphic",
      "Sized for Instagram, Facebook, or web banner",
      "High-res PNG, JPG + editable source files",
      "2 Minor revision rounds included",
    ],
    popular: false,
    cta: "Order 1 Job ($50)",
  },
  {
    coins: 2,
    price: "$100",
    name: "Custom Event Flyer Kit",
    subtitle: "Our most requested local package",
    turnaround: "24–48h Turnaround",
    icon: "🎨",
    includes: [
      "Print-ready 8.5\" x 11\" PDF with 300 DPI bleeds",
      "Matching Instagram Square (1:1) version",
      "Matching Instagram Story (9:16) version",
      "2 Revision rounds on copy & layout",
    ],
    popular: true,
    cta: "Order 1 Job ($100)",
  },
  {
    coins: 3,
    price: "$150",
    name: "Social Media 4-Pack",
    subtitle: "A month of cohesive social presence",
    turnaround: "48h Turnaround",
    icon: "📱",
    includes: [
      "4 Custom branded social templates / posts",
      "Cohesive brand colors, fonts & photo styling",
      "Editable Canva or Figma handover files",
      "Captions & hashtag suggestions included",
    ],
    popular: false,
    cta: "Order 1 Job ($150)",
  },
  {
    coins: 4,
    price: "$200",
    name: "Editorial Program / Menu",
    subtitle: "Multi-page booklets & event menus",
    turnaround: "48–72h Turnaround",
    icon: "📖",
    includes: [
      "Multi-page commemorative service program or menu",
      "High-res 300 DPI print-ready PDF with crop marks",
      "Digital flipbook / mobile-friendly PDF copy",
      "Typography hierarchy & photo layout polish",
    ],
    popular: false,
    cta: "Order 1 Job ($200)",
  },
  {
    coins: 6,
    price: "$300",
    name: "Mini Brand Identity Kit",
    subtitle: "The foundational visual system",
    turnaround: "3–5 Business Days",
    icon: "✨",
    includes: [
      "Primary logo + secondary submark / favicon",
      "Official brand color hex palette & typography suite",
      "Social media profile & cover asset pack",
      "1-Page Brand Identity Guide PDF",
    ],
    popular: false,
    cta: "Order 1 Job ($300)",
  },
  {
    coins: 10,
    price: "$500",
    name: "Web Experience & Storefront",
    subtitle: "Custom agency-grade web UI design",
    turnaround: "5–7 Business Days",
    icon: "💻",
    includes: [
      "Full responsive desktop & mobile page designs",
      "Shopify, WordPress, or custom web architecture",
      "Interactive prototype & developer handover specs",
      "Senior Creative Mentor art-directed review",
    ],
    popular: false,
    cta: "Order 1 Job ($500)",
  },
];

const MEMBERSHIP_TIERS = [
  {
    id: "essentials",
    name: "Essentials Tier",
    price: "$499",
    cadence: "/ month",
    coins: "10 Peach Coins",
    valueTag: "$49.90 / coin",
    desc: "Perfect for solo entrepreneurs, churches, and local shops needing steady monthly marketing graphics.",
    features: [
      "10 Peach Coins refreshed monthly ($500 value)",
      "1 active request at a time",
      "48-hour draft turnaround SLA",
      "Active Rollover Banking (bank up to 20 unused coins)",
      "Permanent Brand Asset Vault access",
      "Full commercial source files included",
    ],
    popular: false,
    cta: "Start Essentials",
  },
  {
    id: "growth",
    name: "Growth Tier",
    price: "$1,099",
    cadence: "/ month",
    coins: "24 + 4 Bonus = 28 Coins",
    valueTag: "Most Popular • Save 20%",
    desc: "For growing businesses running active marketing campaigns, product launches, and weekly content.",
    features: [
      "28 Total Coins per month ($1,400 deliverable value)",
      "2 active requests in parallel",
      "24–48 hour fast-track turnaround",
      "Dedicated Creative Match (consistent brand voice)",
      "Active Rollover Banking (bank up to 48 coins)",
      "10% discount on extra coin top-ups",
    ],
    popular: true,
    cta: "Start Growth Plan",
  },
  {
    id: "partner",
    name: "Partner Tier",
    price: "$2,199",
    cadence: "/ month",
    coins: "50 + 10 Bonus = 60 Coins",
    valueTag: "Best Value • Agency Alternative",
    desc: "A full outsourced creative department for high-growth companies, institutions, and civic organizations.",
    features: [
      "60 Total Coins per month ($3,000 deliverable value)",
      "3–4 active requests in parallel",
      "24-hour priority queue & rush options",
      "Dedicated Brand Pod (Art Director + Specialist)",
      "Active Rollover Banking (bank up to 100 coins)",
      "Quarterly 1-on-1 Creative Strategy Review",
    ],
    popular: false,
    cta: "Start Partner Plan",
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [pricingTab, setPricingTab] = useState<"alacarte" | "membership">("alacarte");

  return (
    <main className="pn-home-root">
      {/* Cinematic Splash Screen */}
      <BrandSplash />

      <style>{`
        .pn-home-root {
          min-height: 100vh;
          background-color: #FFF8F4;
          color: #17271E;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* REPEATING WATERMARK TEXTURE */
        .pn-repeating-watermark {
          position: absolute;
          inset: 0;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          opacity: 0.035;
          background-image: repeating-linear-gradient(
            -45deg,
            #E85D3F,
            #E85D3F 100px,
            transparent 100px,
            transparent 200px
          );
        }

        /* VIBRANT WARM PEACH, SKY BLUE & EVERGREEN LIGHTING */
        .pn-studio-lighting {
          position: absolute;
          inset: 0;
          height: 1100px;
          background: 
            radial-gradient(circle at 14% 12%, rgba(254, 215, 170, 0.65) 0%, transparent 45%),
            radial-gradient(circle at 86% 18%, rgba(6, 182, 212, 0.22) 0%, transparent 48%),
            radial-gradient(circle at 50% 45%, rgba(255, 237, 213, 0.5) 0%, transparent 65%),
            radial-gradient(circle at 80% 65%, rgba(22, 163, 74, 0.12) 0%, transparent 45%);
          pointer-events: none;
          z-index: 1;
        }

        .pn-grid-texture {
          position: absolute;
          inset: 0;
          height: 1100px;
          background-size: 34px 34px;
          background-image: 
            linear-gradient(to right, rgba(232, 93, 63, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.07) 1px, transparent 1px);
          mask-image: linear-gradient(180deg, black 0%, black 75%, transparent 100%);
          -webkit-mask-image: linear-gradient(180deg, black 0%, black 75%, transparent 100%);
          pointer-events: none;
          z-index: 1;
        }

        /* RUNNING KINETIC BRAND TICKER */
        .pn-brand-ticker {
          background: linear-gradient(90deg, #E85D3F 0%, #FB923C 35%, #06B6D4 70%, #16A34A 100%);
          color: #FFFFFF;
          padding: 8px 0;
          font-size: 11.5px;
          font-weight: 850;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          overflow: hidden;
          white-space: nowrap;
          display: flex;
          position: relative;
          z-index: 95;
          box-shadow: 0 2px 10px rgba(232, 93, 63, 0.25);
        }
        .pn-ticker-track {
          display: inline-flex;
          gap: 32px;
          animation: pnTicker 28s linear infinite;
        }
        @keyframes pnTicker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
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
          padding: 16px 24px;
          box-sizing: border-box;
          background: rgba(255, 248, 244, 0.94);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1.5px solid rgba(232, 93, 63, 0.2);
        }

        .pn-header-logo-link {
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        .pn-header-logo {
          height: clamp(52px, 6vw, 68px);
          width: auto;
          display: block;
          filter: drop-shadow(0 4px 14px rgba(232, 93, 63, 0.22));
          transition: transform 0.2s ease;
        }
        .pn-header-logo:hover {
          transform: scale(1.02);
        }

        .pn-header-nav-links {
          display: none;
          align-items: center;
          gap: 24px;
        }
        @media (min-width: 860px) {
          .pn-header-nav-links {
            display: flex;
          }
        }
        .pn-h-link {
          font-size: 14px;
          font-weight: 750;
          color: #2D4236;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .pn-h-link:hover {
          color: #E85D3F;
        }

        .pn-yt-nav-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
          font-size: 12px;
          font-weight: 800;
          padding: 6px 14px;
          border-radius: 99px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .pn-yt-nav-pill:hover {
          background: #DC2626;
          color: #FFFFFF;
          transform: translateY(-1px);
        }

        .pn-header-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .pn-top-signin-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 22px;
          font-size: 13.5px;
          font-weight: 750;
          color: #17271E;
          background: #FFFFFF;
          border: 1.5px solid rgba(232, 93, 63, 0.28);
          border-radius: 99px;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 10px rgba(232, 93, 63, 0.08);
        }
        .pn-top-signin-btn:hover {
          background: #FFF0E6;
          border-color: #E85D3F;
          color: #E85D3F;
          transform: translateY(-1px);
        }

        .pn-menu-btn {
          background: #FFFFFF;
          border: 1.5px solid rgba(232, 93, 63, 0.28);
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
          background: #FFF0E6;
          border-color: #E85D3F;
          transform: scale(1.04);
        }
        .pn-menu-bar {
          width: 20px;
          height: 2.2px;
          background-color: #E85D3F;
          border-radius: 2px;
        }

        /* HERO SECTION */
        .pn-hero-section {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 24px 64px 24px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: center;
          min-height: calc(88vh - 120px);
        }

        @media (min-width: 960px) {
          .pn-hero-section {
            grid-template-columns: 1.15fr 0.85fr;
            gap: 60px;
            padding: 40px 24px 80px 24px;
          }
        }

        .pn-hero-text-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .pn-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFFFFF;
          border: 1.5px solid #FDBA74;
          border-radius: 100px;
          padding: 8px 20px;
          font-size: 13px;
          font-weight: 850;
          color: #E85D3F;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 18px;
          box-shadow: 0 4px 16px rgba(232, 93, 63, 0.16);
        }

        .pn-hero-title {
          font-size: clamp(38px, 5.2vw, 64px);
          line-height: 1.05;
          font-weight: 850;
          letter-spacing: -0.03em;
          color: #17271E;
          margin: 0 0 18px 0;
        }
        .pn-hero-title span.pn-accent {
          color: #E85D3F;
          font-style: italic;
          font-family: Georgia, "Playfair Display", serif;
          font-weight: 400;
        }

        /* CORE VALUE PROPOSITION */
        .pn-hero-lead {
          font-size: clamp(18px, 2.3vw, 22px);
          line-height: 1.45;
          color: #C2410C;
          font-weight: 850;
          margin: 0 0 10px 0;
          max-width: 600px;
        }
        .pn-hero-lead-sub {
          font-size: 15.5px;
          line-height: 1.55;
          color: #3B4E44;
          margin: 0 0 24px 0;
          max-width: 550px;
        }

        .pn-value-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #FFFFFF;
          border: 1.5px solid #FDBA74;
          padding: 10px 20px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 750;
          color: #9C3D15;
          margin-bottom: 28px;
          box-shadow: 0 4px 16px rgba(232, 93, 63, 0.12);
        }

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

        .pn-btn-hero-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 56px;
          padding: 0 34px;
          background: linear-gradient(135deg, #E85D3F 0%, #D44B2D 100%);
          color: #FFFFFF;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.01em;
          border-radius: 99px;
          text-decoration: none;
          box-shadow: 0 10px 24px rgba(232, 93, 63, 0.38);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
          cursor: pointer;
        }
        .pn-btn-hero-primary:hover {
          background: linear-gradient(135deg, #F06A4D 0%, #E85D3F 100%);
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(232, 93, 63, 0.48);
        }

        .pn-btn-hero-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 56px;
          padding: 0 32px;
          background: #FFFFFF;
          color: #0369A1;
          font-size: 16px;
          font-weight: 750;
          letter-spacing: 0.01em;
          border-radius: 99px;
          text-decoration: none;
          border: 1.5px solid #38BDF8;
          box-shadow: 0 4px 14px rgba(6, 182, 212, 0.15);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .pn-btn-hero-secondary:hover {
          background: #E0F2FE;
          border-color: #0284C7;
          color: #0284C7;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(6, 182, 212, 0.25);
        }

        /* RIGHT HERO COLUMN: CREATIVE SPOTLIGHT CARD */
        .pn-hero-visual-wrap {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .pn-spotlight-card {
          position: relative;
          width: 100%;
          max-width: 480px;
          aspect-ratio: 4 / 4.9;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 
            0 28px 65px rgba(23, 39, 30, 0.18),
            0 8px 28px rgba(232, 93, 63, 0.25);
          border: 4px solid #FFFFFF;
          background: linear-gradient(145deg, #2D4236 0%, #15241C 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .pn-spotlight-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          display: block;
          z-index: 1;
        }

        .pn-spotlight-placeholder-artwork {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-bottom: 120px;
          color: #FFFFFF;
          z-index: 0;
          background: radial-gradient(circle at 50% 35%, #3C5849 0%, #17271E 100%);
        }
        .pn-placeholder-avatar {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FB923C 0%, #E85D3F 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 42px;
          font-weight: 850;
          color: #FFFFFF;
          box-shadow: 0 12px 30px rgba(0,0,0,0.3);
          border: 4px solid rgba(255, 255, 255, 0.3);
          margin-bottom: 14px;
        }
        .pn-placeholder-title {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .pn-placeholder-sub {
          font-size: 13px;
          color: #A3C2B1;
          margin-top: 4px;
        }

        .pn-spotlight-top-tag {
          position: absolute;
          top: 18px;
          left: 18px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(232, 93, 63, 0.95);
          backdrop-filter: blur(10px);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.35);
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          box-shadow: 0 4px 12px rgba(232, 93, 63, 0.35);
          z-index: 5;
        }

        .pn-spotlight-plate {
          position: relative;
          z-index: 5;
          margin: 16px;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1.5px solid rgba(232, 93, 63, 0.35);
          border-radius: 22px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0 12px 32px rgba(23, 39, 30, 0.16);
        }

        .pn-plate-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pn-plate-name {
          font-size: 18px;
          font-weight: 850;
          color: #17271E;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pn-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #E8F5E9;
          color: #15803D;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 99px;
          letter-spacing: 0.02em;
        }
        .pn-green-dot {
          width: 6px;
          height: 6px;
          background: #16A34A;
          border-radius: 50%;
        }

        .pn-plate-role {
          font-size: 12px;
          font-weight: 700;
          color: #E85D3F;
          letter-spacing: 0.02em;
        }

        .pn-plate-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 3px;
        }

        .pn-award-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #FFF8E1;
          color: #92400E;
          font-size: 11px;
          font-weight: 750;
          padding: 4px 9px;
          border-radius: 6px;
          border: 1px solid #FDE68A;
        }

        .pn-stat-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #E0F2FE;
          color: #0369A1;
          font-size: 11px;
          font-weight: 750;
          padding: 4px 9px;
          border-radius: 6px;
          border: 1px solid #BAE6FD;
        }

        .pn-plate-location {
          font-size: 11px;
          color: #4B6355;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }

        /* YOUTUBE BANNER CALLOUT */
        .pn-yt-feature-banner {
          max-width: 1280px;
          margin: 0 auto 60px auto;
          padding: 0 24px;
          position: relative;
          z-index: 10;
        }
        .pn-yt-card {
          background: linear-gradient(135deg, #182820 0%, #0F1E16 60%, #991B1B 100%);
          border-radius: 28px;
          padding: 28px 32px;
          color: #FFFFFF;
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
          justify-content: space-between;
          border: 2px solid rgba(239, 68, 68, 0.35);
          box-shadow: 0 16px 40px rgba(0,0,0,0.2);
        }
        @media (min-width: 768px) {
          .pn-yt-card {
            flex-direction: row;
            text-align: left;
          }
        }
        .pn-yt-left {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .pn-yt-play-icon {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          background: #DC2626;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: #FFFFFF;
          box-shadow: 0 8px 24px rgba(220, 38, 38, 0.45);
          flex-shrink: 0;
        }
        .pn-yt-info h3 {
          font-size: 20px;
          font-weight: 850;
          margin: 0 0 4px 0;
        }
        .pn-yt-info p {
          font-size: 13.5px;
          color: #FECACA;
          margin: 0;
          max-width: 600px;
          line-height: 1.5;
        }
        .pn-yt-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 48px;
          padding: 0 28px;
          background: #FFFFFF;
          color: #DC2626;
          font-size: 14px;
          font-weight: 850;
          border-radius: 99px;
          text-decoration: none;
          white-space: nowrap;
          box-shadow: 0 6px 18px rgba(0,0,0,0.18);
          transition: all 0.2s ease;
        }
        .pn-yt-btn:hover {
          background: #FEE2E2;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(220, 38, 38, 0.35);
        }

        /* SECTION: CREATIVES IN ACTION GALLERY */
        .pn-action-gallery-section {
          width: 100%;
          padding: 70px 24px;
          background: #FFFFFF;
          position: relative;
        }
        .pn-gallery-container {
          max-width: 1280px;
          margin: 0 auto;
        }
        .pn-gallery-header {
          text-align: center;
          max-width: 780px;
          margin: 0 auto 40px auto;
        }
        .pn-gallery-kicker {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #E0F2FE;
          border: 1px solid #BAE6FD;
          color: #0284C7;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 99px;
          margin-bottom: 14px;
        }
        .pn-gallery-title {
          font-size: clamp(30px, 4.2vw, 44px);
          font-weight: 850;
          letter-spacing: -0.02em;
          color: #17271E;
          margin: 0 0 12px 0;
        }
        .pn-gallery-title span {
          color: #0284C7;
          font-style: italic;
          font-family: Georgia, "Playfair Display", serif;
        }
        .pn-gallery-sub {
          font-size: 16px;
          color: #4B6355;
          margin: 0;
          line-height: 1.55;
        }

        .pn-gallery-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 600px) {
          .pn-gallery-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 992px) {
          .pn-gallery-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .pn-gallery-card {
          background: #FFF8F4;
          border: 1.5px solid rgba(232, 93, 63, 0.2);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }
        .pn-gallery-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(6, 182, 212, 0.18);
          border-color: #06B6D4;
        }

        .pn-gallery-media {
          width: 100%;
          height: 230px;
          position: relative;
          background: #E2E8F0;
          overflow: hidden;
        }
        .pn-gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }
        .pn-gallery-card:hover .pn-gallery-img {
          transform: scale(1.05);
        }
        .pn-gallery-role-pill {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.95);
          color: #0369A1;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 99px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .pn-gallery-meta {
          padding: 18px 20px;
        }
        .pn-gallery-caption {
          font-size: 14px;
          font-weight: 750;
          color: #17271E;
          line-height: 1.45;
          margin: 0;
        }

        /* SECTION: PITCH DECK BREAKDOWN */
        .pn-deck-section {
          width: 100%;
          padding: 80px 24px;
          background: linear-gradient(180deg, #FFFFFF 0%, #FFF8F4 100%);
          position: relative;
        }

        .pn-deck-container {
          max-width: 1240px;
          margin: 0 auto;
        }

        .pn-deck-header {
          text-align: center;
          max-width: 820px;
          margin: 0 auto 50px auto;
        }

        .pn-deck-motto {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFF0E6;
          border: 1.5px solid #FDBA74;
          color: #C2410C;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 18px;
          border-radius: 99px;
          margin-bottom: 16px;
          box-shadow: 0 4px 14px rgba(232, 93, 63, 0.12);
        }

        .pn-deck-title {
          font-size: clamp(30px, 4.2vw, 48px);
          font-weight: 850;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #17271E;
          margin: 0 0 16px 0;
        }
        .pn-deck-title span {
          color: #E85D3F;
          font-style: italic;
          font-family: Georgia, "Playfair Display", serif;
        }

        .pn-deck-sub {
          font-size: 17px;
          line-height: 1.6;
          color: #4B6355;
          margin: 0;
        }

        .pn-deck-matrix {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 880px) {
          .pn-deck-matrix {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .pn-matrix-card {
          background: #FFFFFF;
          border: 1.5px solid rgba(232, 93, 63, 0.18);
          border-radius: 28px;
          padding: 32px 26px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(23, 39, 30, 0.04);
          position: relative;
        }

        .pn-matrix-card.is-winner {
          background: linear-gradient(180deg, #FFFFFF 0%, #FFF7F2 100%);
          border: 2.5px solid #E85D3F;
          box-shadow: 0 18px 48px rgba(232, 93, 63, 0.22);
          transform: scale(1.02);
        }

        .pn-winner-badge {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #E85D3F 0%, #D44B2D 100%);
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 16px;
          border-radius: 99px;
          box-shadow: 0 4px 14px rgba(232, 93, 63, 0.4);
          white-space: nowrap;
        }

        .pn-matrix-tag {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }
        .pn-mt-gray { color: #64748B; }
        .pn-mt-peach { color: #E85D3F; }

        .pn-matrix-title {
          font-size: 22px;
          font-weight: 850;
          color: #17271E;
          margin: 0 0 14px 0;
        }

        .pn-matrix-price {
          font-size: 14px;
          font-weight: 700;
          color: #4B6355;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(232, 93, 63, 0.15);
        }

        .pn-matrix-points {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
          font-size: 13px;
          line-height: 1.45;
        }

        .pn-mp-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .pn-mp-con {
          color: #EF4444;
          font-weight: 900;
          font-size: 15px;
          flex-shrink: 0;
        }
        .pn-mp-pro {
          color: #16A34A;
          font-weight: 900;
          font-size: 15px;
          flex-shrink: 0;
        }

        /* SECTION: PEACH MATCH AI */
        .pn-ai-section {
          width: 100%;
          padding: 80px 24px;
          background: linear-gradient(180deg, #FFF8F4 0%, #FFFFFF 100%);
          position: relative;
        }

        .pn-ai-container {
          max-width: 1240px;
          margin: 0 auto;
        }

        .pn-ai-header {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 40px auto;
        }

        .pn-ai-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #E0F2FE;
          border: 1.5px solid #BAE6FD;
          color: #0284C7;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 18px;
          border-radius: 99px;
          margin-bottom: 14px;
          box-shadow: 0 4px 14px rgba(6, 182, 212, 0.15);
        }

        .pn-ai-title {
          font-size: clamp(30px, 4.2vw, 46px);
          font-weight: 850;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #17271E;
          margin: 0 0 14px 0;
        }
        .pn-ai-title span {
          color: #E85D3F;
          font-style: italic;
          font-family: Georgia, "Playfair Display", serif;
        }

        .pn-ai-subtitle {
          font-size: 16px;
          line-height: 1.55;
          color: #4B6355;
          margin: 0;
        }

        .pn-ai-flow-card {
          background: #FFFFFF;
          border: 2px solid rgba(6, 182, 212, 0.35);
          border-radius: 32px;
          padding: 36px 28px;
          box-shadow: 0 20px 48px rgba(6, 182, 212, 0.08);
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          align-items: center;
        }

        @media (min-width: 992px) {
          .pn-ai-flow-card {
            grid-template-columns: 1.05fr auto 1.15fr;
            gap: 28px;
            padding: 44px 40px;
          }
        }

        .pn-mock-brief-card {
          background: #F0FDF4;
          border: 1.5px solid #86EFAC;
          border-radius: 22px;
          padding: 24px;
          box-shadow: 0 8px 24px rgba(22, 163, 74, 0.06);
        }
        .pn-brief-header-pill {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #166534;
          background: #DCFCE7;
          padding: 4px 10px;
          border-radius: 99px;
          margin-bottom: 10px;
        }
        .pn-brief-title {
          font-size: 17px;
          font-weight: 850;
          color: #17271E;
          margin: 0 0 10px 0;
          line-height: 1.35;
        }
        .pn-brief-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .pn-b-tag {
          font-size: 11px;
          background: #FFFFFF;
          border: 1px solid #86EFAC;
          color: #15803D;
          padding: 4px 9px;
          border-radius: 6px;
          font-weight: 700;
        }

        .pn-ai-connector {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .pn-ai-pulse-orb {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06B6D4 0%, #E85D3F 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-size: 24px;
          box-shadow: 0 0 28px rgba(6, 182, 212, 0.45);
        }
        .pn-ai-engine-label {
          font-size: 12px;
          font-weight: 850;
          color: #17271E;
          text-align: center;
        }

        .pn-mock-match-card {
          background: #FFFFFF;
          border: 2px solid #0284C7;
          border-radius: 22px;
          padding: 24px;
          box-shadow: 0 12px 30px rgba(2, 132, 199, 0.15);
          position: relative;
        }
        .pn-match-score-badge {
          position: absolute;
          top: -12px;
          right: 18px;
          background: #0284C7;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 850;
          padding: 4px 12px;
          border-radius: 99px;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
        }
        .pn-match-creative-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        .pn-match-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06B6D4 0%, #0284C7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-weight: 850;
          font-size: 17px;
        }
        .pn-match-creative-name {
          font-size: 16px;
          font-weight: 850;
          color: #17271E;
        }
        .pn-match-creative-skills {
          font-size: 12px;
          color: #0284C7;
          font-weight: 750;
        }

        .pn-match-badges-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }
        .pn-m-badge {
          font-size: 11px;
          font-weight: 750;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .pn-mb-green { background: #E8F5E9; color: #166534; }
        .pn-mb-gold { background: #FFF8E1; color: #92400E; border: 1px solid #FDE68A; }
        .pn-mb-blue { background: #E0F2FE; color: #0369A1; border: 1px solid #BAE6FD; }

        /* SECTION: RECENT PROJECTS SLIDER */
        .pn-projects-section {
          width: 100%;
          padding: 60px 0 80px 0;
          background: #FFF8F4;
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
          color: #17271E;
          letter-spacing: -0.02em;
          margin: 0 0 12px 0;
        }

        .pn-projects-subtitle {
          font-size: 16px;
          color: #4B6355;
          max-width: 650px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .pn-marquee-wrap {
          display: flex;
          width: 100%;
          overflow: hidden;
          position: relative;
          mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
        }

        .pn-marquee-track {
          display: flex;
          gap: 24px;
          width: max-content;
          animation: pnMarquee 50s linear infinite;
        }
        .pn-marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes pnMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .pn-project-card {
          width: 380px;
          background: #FFFFFF;
          border-radius: 24px;
          overflow: hidden;
          border: 1.5px solid rgba(232, 93, 63, 0.22);
          box-shadow: 0 10px 30px rgba(23, 39, 30, 0.06);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
        }
        .pn-project-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 18px 40px rgba(232, 93, 63, 0.22);
          border-color: #E85D3F;
        }

        .pn-card-media {
          width: 100%;
          height: 250px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 24px;
          box-sizing: border-box;
          text-align: center;
        }

        .pn-card-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
          z-index: 1;
        }
        .pn-project-card:hover .pn-card-img {
          transform: scale(1.04);
        }

        .pn-editorial-artwork {
          position: relative;
          z-index: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: #FFFFFF;
        }
        .pn-art-icon {
          font-size: 32px;
          margin-bottom: 8px;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));
        }
        .pn-art-headline {
          font-size: 18px;
          font-weight: 850;
          letter-spacing: -0.01em;
          line-height: 1.25;
          max-width: 260px;
          margin-bottom: 6px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .pn-art-client {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.9;
        }

        .pn-card-coin-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(232, 93, 63, 0.95);
          backdrop-filter: blur(8px);
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          padding: 6px 12px;
          border-radius: 99px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          box-shadow: 0 4px 12px rgba(232, 93, 63, 0.3);
          z-index: 2;
        }

        .pn-card-tag-badge {
          position: absolute;
          bottom: 14px;
          left: 14px;
          background: rgba(255, 255, 255, 0.95);
          color: #C2410C;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 5px 12px;
          border-radius: 99px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          z-index: 2;
        }

        .pn-card-body {
          padding: 20px 22px 24px 22px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .pn-card-creator-credit {
          font-size: 11.5px;
          font-weight: 800;
          color: #0284C7;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }

        .pn-card-client-title {
          font-size: 18px;
          font-weight: 850;
          color: #17271E;
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
          color: #4B6355;
          margin: 0;
        }

        /* SECTION: CREATIVE ECOSYSTEM */
        .pn-ecosystem-section {
          width: 100%;
          padding: 85px 24px;
          background: linear-gradient(180deg, #FFFFFF 0%, #FFF8F4 100%);
          position: relative;
        }

        .pn-eco-container {
          max-width: 1240px;
          margin: 0 auto;
        }

        .pn-eco-header {
          text-align: center;
          max-width: 820px;
          margin: 0 auto 50px auto;
        }

        .pn-eco-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFF0E6;
          border: 1.5px solid #FDBA74;
          color: #C2410C;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 18px;
          border-radius: 99px;
          margin-bottom: 16px;
          box-shadow: 0 4px 14px rgba(232, 93, 63, 0.12);
        }

        .pn-eco-title {
          font-size: clamp(32px, 4.5vw, 48px);
          font-weight: 850;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #17271E;
          margin: 0 0 16px 0;
        }
        .pn-eco-title span {
          color: #E85D3F;
          font-style: italic;
          font-family: Georgia, "Playfair Display", serif;
        }

        .pn-eco-sub {
          font-size: 16px;
          line-height: 1.6;
          color: #4B6355;
          margin: 0;
        }

        .pn-ladder-title-row {
          text-align: center;
          margin-bottom: 24px;
        }
        .pn-ladder-title-row h3 {
          font-size: 22px;
          font-weight: 850;
          color: #17271E;
          margin: 0 0 6px 0;
        }
        .pn-ladder-title-row p {
          font-size: 14px;
          color: #64748B;
          margin: 0;
        }

        .pn-ladder-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 48px;
        }
        @media (min-width: 820px) {
          .pn-ladder-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .pn-ladder-card {
          background: #FFFFFF;
          border: 1.5px solid rgba(232, 93, 63, 0.22);
          border-radius: 24px;
          padding: 28px 24px;
          box-shadow: 0 10px 24px rgba(23, 39, 30, 0.04);
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .pn-ladder-card.is-spotlight {
          border-color: #E85D3F;
          background: #FFF9F5;
        }

        .pn-ladder-step-num {
          font-size: 11px;
          font-weight: 850;
          color: #E85D3F;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .pn-ladder-name {
          font-size: 19px;
          font-weight: 850;
          color: #17271E;
          margin: 0 0 8px 0;
        }
        .pn-ladder-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 99px;
          margin-bottom: 12px;
          width: fit-content;
        }
        .pn-lb-orange { background: #FFEDD5; color: #9A3412; }
        .pn-lb-peach { background: #FED7AA; color: #C2410C; }
        .pn-lb-gold { background: #FEF3C7; color: #92400E; }

        .pn-ladder-desc {
          font-size: 13px;
          color: #475569;
          line-height: 1.5;
          margin: 0;
        }

        .pn-engines-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }
        @media (min-width: 860px) {
          .pn-engines-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .pn-engine-card {
          background: #FFFFFF;
          border: 1.5px solid rgba(232, 93, 63, 0.22);
          border-radius: 26px;
          padding: 32px 26px;
          box-shadow: 0 10px 28px rgba(232, 93, 63, 0.06);
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease;
        }
        .pn-engine-card:hover {
          transform: translateY(-4px);
          border-color: #06B6D4;
        }

        .pn-engine-icon-box {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          background: #FFF0E6;
          border: 1px solid #FDBA74;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin-bottom: 18px;
        }

        .pn-engine-title {
          font-size: 20px;
          font-weight: 850;
          color: #17271E;
          margin: 0 0 10px 0;
        }
        .pn-engine-desc {
          font-size: 13px;
          color: #4B6355;
          line-height: 1.55;
          margin: 0 0 16px 0;
          flex-grow: 1;
        }
        .pn-engine-perks {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 12px;
          color: #334155;
          font-weight: 700;
        }

        .pn-eco-cta-bar {
          background: linear-gradient(135deg, #182820 0%, #0F1E16 100%);
          border-radius: 28px;
          padding: 32px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 18px;
          box-shadow: 0 16px 40px rgba(23, 39, 30, 0.25);
          border: 2px solid rgba(232, 93, 63, 0.4);
        }
        @media (min-width: 768px) {
          .pn-eco-cta-bar {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
          }
        }
        .pn-eco-cta-text h4 {
          font-size: 20px;
          font-weight: 850;
          color: #FFFFFF;
          margin: 0 0 6px 0;
        }
        .pn-eco-cta-text p {
          font-size: 14px;
          color: #CFE0D6;
          margin: 0;
          max-width: 650px;
        }
        .pn-eco-apply-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 52px;
          padding: 0 32px;
          background: linear-gradient(135deg, #E85D3F 0%, #D44B2D 100%);
          color: #FFFFFF;
          font-size: 15px;
          font-weight: 800;
          border-radius: 99px;
          text-decoration: none;
          white-space: nowrap;
          box-shadow: 0 8px 20px rgba(232, 93, 63, 0.4);
          transition: all 0.2s ease;
        }
        .pn-eco-apply-btn:hover {
          background: linear-gradient(135deg, #F06A4D 0%, #E85D3F 100%);
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(232, 93, 63, 0.5);
        }

        /* SECTION: PRICING ARCHITECTURE */
        .pn-pricing-section {
          width: 100%;
          padding: 85px 24px 110px 24px;
          background-color: #FFF8F4;
          position: relative;
          box-sizing: border-box;
        }

        .pn-pricing-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .pn-ad-callout-card {
          background: linear-gradient(135deg, #182820 0%, #0F1E16 100%);
          color: #FFFFFF;
          border-radius: 32px;
          padding: 40px 32px;
          margin-bottom: 64px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(23, 39, 30, 0.28);
          border: 2px solid rgba(232, 93, 63, 0.35);
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
          align-items: center;
        }

        @media (min-width: 900px) {
          .pn-ad-callout-card {
            grid-template-columns: 1.35fr 0.65fr;
            padding: 50px 48px;
          }
        }

        .pn-ad-callout-text h3 {
          font-size: clamp(26px, 3.8vw, 40px);
          font-weight: 850;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin: 0 0 16px 0;
          color: #FFFFFF;
        }
        .pn-ad-callout-text h3 span {
          color: #FFA585;
          font-style: italic;
          font-family: Georgia, "Playfair Display", serif;
        }

        .pn-ad-callout-text p {
          font-size: clamp(15px, 2vw, 17px);
          line-height: 1.6;
          color: #CFE0D6;
          margin: 0;
          max-width: 640px;
        }

        .pn-ad-action-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
        }

        @media (min-width: 900px) {
          .pn-ad-action-box {
            align-items: flex-end;
          }
        }

        .pn-tap-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #E85D3F 0%, #D44B2D 100%);
          color: #FFFFFF;
          padding: 16px 36px;
          font-size: 16px;
          font-weight: 800;
          border-radius: 99px;
          text-decoration: none;
          box-shadow: 0 10px 24px rgba(232, 93, 63, 0.4);
          transition: all 0.2s ease;
          width: 100%;
          text-align: center;
          box-sizing: border-box;
        }
        .pn-tap-btn:hover {
          background: linear-gradient(135deg, #F06A4D 0%, #E85D3F 100%);
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(232, 93, 63, 0.5);
        }

        .pn-ad-tagline-sub {
          font-size: 12px;
          color: #A3C2B1;
          letter-spacing: 0.04em;
        }

        .pn-pricing-header {
          text-align: center;
          max-width: 780px;
          margin: 0 auto 40px auto;
        }

        .pn-pricing-kicker {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FFFFFF;
          border: 1.5px solid #FDBA74;
          color: #C2410C;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 99px;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(232, 93, 63, 0.1);
        }

        .pn-pricing-title {
          font-size: clamp(32px, 4.5vw, 48px);
          font-weight: 850;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #17271E;
          margin: 0 0 16px 0;
        }
        .pn-pricing-title span {
          color: #E85D3F;
          font-style: italic;
          font-family: Georgia, "Playfair Display", serif;
        }

        .pn-pricing-subtitle {
          font-size: clamp(16px, 2vw, 18px);
          line-height: 1.6;
          color: #4B6355;
          margin: 0;
        }

        .pn-toggle-container {
          display: flex;
          justify-content: center;
          margin-bottom: 48px;
        }

        .pn-toggle-shell {
          background: #FFFFFF;
          border: 1.5px solid rgba(232, 93, 63, 0.35);
          padding: 6px;
          border-radius: 99px;
          display: inline-flex;
          gap: 6px;
          box-shadow: 0 6px 20px rgba(23, 39, 30, 0.06);
        }

        .pn-toggle-btn {
          padding: 12px 24px;
          border-radius: 99px;
          font-size: 14px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          background: transparent;
          color: #4B6355;
        }
        .pn-toggle-btn.is-active {
          background: linear-gradient(135deg, #E85D3F 0%, #D44B2D 100%);
          color: #FFFFFF;
          box-shadow: 0 4px 14px rgba(232, 93, 63, 0.3);
        }

        .pn-alacarte-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 640px) {
          .pn-alacarte-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .pn-alacarte-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .pn-coin-card {
          background: #FFFFFF;
          border: 1.5px solid rgba(232, 93, 63, 0.24);
          border-radius: 28px;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          box-shadow: 0 12px 36px rgba(23, 39, 30, 0.06);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pn-coin-card:hover {
          transform: translateY(-6px);
          border-color: #E85D3F;
          box-shadow: 0 20px 48px rgba(232, 93, 63, 0.18);
        }

        .pn-coin-card.is-popular {
          border: 2.5px solid #E85D3F;
          background: linear-gradient(180deg, #FFFFFF 0%, #FFF8F4 100%);
          box-shadow: 0 16px 44px rgba(232, 93, 63, 0.2);
        }

        .pn-popular-pill {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #E85D3F 0%, #D44B2D 100%);
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 16px;
          border-radius: 99px;
          box-shadow: 0 4px 14px rgba(232, 93, 63, 0.4);
          white-space: nowrap;
        }

        .pn-card-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .pn-coin-amount-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FFF0E6;
          border: 1px solid #FDBA74;
          color: #C2410C;
          font-size: 13px;
          font-weight: 850;
          padding: 6px 14px;
          border-radius: 99px;
        }

        .pn-turnaround-pill {
          font-size: 11px;
          font-weight: 700;
          color: #15803D;
          background: #E8F5E9;
          padding: 4px 10px;
          border-radius: 99px;
        }

        .pn-card-price-display {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 8px;
        }
        .pn-price-dollars {
          font-size: 38px;
          font-weight: 900;
          color: #17271E;
          letter-spacing: -0.03em;
        }
        .pn-price-cents {
          font-size: 14px;
          color: #6B8576;
          font-weight: 700;
        }

        .pn-card-service-title {
          font-size: 20px;
          font-weight: 850;
          color: #17271E;
          margin: 0 0 6px 0;
          line-height: 1.25;
        }

        .pn-card-service-sub {
          font-size: 13px;
          color: #4B6355;
          margin: 0 0 20px 0;
          line-height: 1.45;
        }

        .pn-card-divider {
          width: 100%;
          height: 1px;
          background: rgba(232, 93, 63, 0.18);
          margin-bottom: 20px;
        }

        .pn-features-list {
          list-style: none;
          padding: 0;
          margin: 0 0 28px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pn-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: #33443C;
          line-height: 1.45;
        }

        .pn-feature-check {
          color: #15803D;
          font-size: 14px;
          font-weight: 900;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .pn-card-order-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 50px;
          border-radius: 99px;
          font-size: 15px;
          font-weight: 750;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .pn-btn-card-primary {
          background-color: #182820;
          color: #FFFFFF;
          box-shadow: 0 8px 18px rgba(23, 39, 30, 0.2);
        }
        .pn-btn-card-primary:hover {
          background-color: #0F1E16;
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(23, 39, 30, 0.28);
        }
        .pn-btn-card-peach {
          background: linear-gradient(135deg, #E85D3F 0%, #D44B2D 100%);
          color: #FFFFFF;
          box-shadow: 0 8px 20px rgba(232, 93, 63, 0.3);
        }
        .pn-btn-card-peach:hover {
          background: linear-gradient(135deg, #F06A4D 0%, #E85D3F 100%);
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(232, 93, 63, 0.4);
        }

        .pn-membership-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
        }

        @media (min-width: 900px) {
          .pn-membership-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .pn-membership-card {
          background: #FFFFFF;
          border: 1.5px solid rgba(232, 93, 63, 0.25);
          border-radius: 32px;
          padding: 38px 30px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          box-shadow: 0 12px 36px rgba(23, 39, 30, 0.06);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pn-membership-card:hover {
          transform: translateY(-8px);
          border-color: #06B6D4;
          box-shadow: 0 24px 50px rgba(6, 182, 212, 0.2);
        }
        .pn-membership-card.is-popular {
          border: 2.5px solid #E85D3F;
          background: linear-gradient(180deg, #FFFFFF 0%, #FFF7F2 100%);
          box-shadow: 0 18px 48px rgba(232, 93, 63, 0.22);
        }

        .pn-tier-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FFF0E6;
          border: 1px solid #FDBA74;
          color: #C2410C;
          font-size: 12px;
          font-weight: 850;
          padding: 5px 14px;
          border-radius: 99px;
          margin-bottom: 14px;
        }

        .pn-tier-price-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 8px;
        }
        .pn-tier-price {
          font-size: 44px;
          font-weight: 900;
          color: #17271E;
          letter-spacing: -0.03em;
        }
        .pn-tier-cadence {
          font-size: 15px;
          font-weight: 700;
          color: #6B8576;
        }

        .pn-tier-title {
          font-size: 22px;
          font-weight: 850;
          color: #17271E;
          margin: 0 0 8px 0;
        }

        .pn-tier-desc {
          font-size: 13px;
          color: #4B6355;
          line-height: 1.5;
          margin: 0 0 24px 0;
        }

        .pn-pricing-guarantee-banner {
          margin-top: 56px;
          background: #FFFFFF;
          border: 1.5px solid rgba(232, 93, 63, 0.3);
          border-radius: 28px;
          padding: 28px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 18px;
          box-shadow: 0 10px 30px rgba(232, 93, 63, 0.08);
        }

        @media (min-width: 768px) {
          .pn-pricing-guarantee-banner {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
          }
        }

        .pn-guarantee-text h4 {
          font-size: 17px;
          font-weight: 850;
          color: #17271E;
          margin: 0 0 4px 0;
        }
        .pn-guarantee-text p {
          font-size: 13px;
          color: #4B6355;
          margin: 0;
          max-width: 680px;
        }

        .pn-guarantee-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 50px;
          padding: 0 30px;
          background: linear-gradient(135deg, #E85D3F 0%, #D44B2D 100%);
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 750;
          border-radius: 99px;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s ease;
          box-shadow: 0 6px 18px rgba(232, 93, 63, 0.35);
        }
        .pn-guarantee-btn:hover {
          background: linear-gradient(135deg, #F06A4D 0%, #E85D3F 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(232, 93, 63, 0.45);
        }

        /* FOOTER */
        .pn-footer {
          background: #15241C;
          color: #FFFFFF;
          padding: 50px 24px;
          border-top: 3px solid #E85D3F;
        }
        .pn-footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 30px;
          align-items: center;
          text-align: center;
        }
        @media (min-width: 768px) {
          .pn-footer-inner {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
          }
        }
        .pn-footer-left h4 {
          font-size: 20px;
          font-weight: 850;
          margin: 0 0 8px 0;
          color: #FFA585;
        }
        .pn-footer-left p {
          font-size: 13.5px;
          color: #A3C2B1;
          margin: 0;
        }
        .pn-footer-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .pn-footer-link {
          color: #FFFFFF;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 750;
          transition: color 0.2s ease;
        }
        .pn-footer-link:hover {
          color: #E85D3F;
        }

        /* DRAWER NAVIGATION */
        .pn-nav-overlay {
          position: fixed;
          inset: 0;
          background: rgba(23, 39, 30, 0.5);
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
          background-color: #FFF8F4;
          z-index: 101;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: -10px 0 30px rgba(0,0,0,0.12);
          border-left: 2px solid rgba(232, 93, 63, 0.25);
        }
        .pn-nav-drawer.is-open {
          transform: translateX(0);
        }

        .pn-drawer-close {
          align-self: flex-end;
          background: none;
          border: none;
          font-size: 1.6rem;
          color: #E85D3F;
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
          color: #17271E;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .pn-drawer-link:hover {
          color: #E85D3F;
        }
      `}</style>

      {/* Atmospheric lighting & grid textures */}
      <div className="pn-repeating-watermark" />
      <div className="pn-studio-lighting" />
      <div className="pn-grid-texture" />

      {/* RUNNING KINETIC BRAND TICKER */}
      <div className="pn-brand-ticker">
        <div className="pn-ticker-track">
          <span>🍑 SWEET AS A PEACH ✦ THE CREATIVE MARKETPLACE OF THE SOUTH</span>
          <span>✦ VETTED CREATIVES YOU CAN TRUST AT AFFORDABLE PRICES</span>
          <span>✦ 1 COIN = 1 FINISHED DELIVERABLE</span>
          <span>✦ 24–48H TURNAROUND</span>
          <span>✦ 75% DIRECT CREATOR PAYOUT</span>
          <span>✦ NO RETAINERS ✦ BIRMINGHAM & BEYOND</span>
          <span>🍑 SWEET AS A PEACH ✦ THE CREATIVE MARKETPLACE OF THE SOUTH</span>
          <span>✦ VETTED CREATIVES YOU CAN TRUST AT AFFORDABLE PRICES</span>
          <span>✦ 1 COIN = 1 FINISHED DELIVERABLE</span>
          <span>✦ 24–48H TURNAROUND</span>
          <span>✦ 75% DIRECT CREATOR PAYOUT</span>
          <span>✦ NO RETAINERS ✦ BIRMINGHAM & BEYOND</span>
        </div>
      </div>

      {/* TOP HEADER */}
      <header className="pn-header">
        <Link href="/" className="pn-header-logo-link">
          <img
            src="/peach-app-logo.png"
            alt="Peach Network"
            className="pn-header-logo"
          />
        </Link>

        <nav className="pn-header-nav-links">
          <a href="#work" className="pn-h-link">Work</a>
          <a href="#creatives" className="pn-h-link">Creatives</a>
          <a href="#pricing" className="pn-h-link">Pricing</a>
          <a href="#ecosystem" className="pn-h-link">Academy & Hub</a>
          <a
            href="https://youtube.com/PeachNetwork"
            target="_blank"
            rel="noopener noreferrer"
            className="pn-yt-nav-pill"
          >
            <span>▶</span> YouTube
          </a>
        </nav>

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

      {/* HERO SECTION */}
      <section className="pn-hero-section">
        {/* LEFT COLUMN: Copy & Actions */}
        <div className="pn-hero-text-wrap">
          <div className="pn-hero-eyebrow">
            <span>🍑</span>
            The Creative Marketplace of the South
          </div>

          <h1 className="pn-hero-title">
            The right creative.<br />
            Right when you <span className="pn-accent">need them.</span>
          </h1>

          <p className="pn-hero-lead">
            Vetted Creatives You Can Trust at Affordable Prices.
          </p>
          <p className="pn-hero-lead-sub">
            More Creatives. Stronger Businesses. A Sweeter South. Good design done right, with real Southern hospitality. No agency retainers, zero bidding wars.
          </p>

          <div className="pn-value-pill">
            <span>🪙</span>
            <span><strong>1 Coin = 1 Finished Deliverable</strong> • Flat Pricing • 24–48h Turnaround</span>
          </div>

          <div className="pn-hero-actions">
            <Link href="/match" className="pn-btn-hero-primary">
              <span>⚡</span> Start a Project (From $50)
            </Link>
            <a href="#creatives" className="pn-btn-hero-secondary">
              <span>✨</span> Meet Our Creatives
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: CREATIVE SPOTLIGHT (JOSE AT HIS STUDIO DESK) */}
        <div className="pn-hero-visual-wrap">
          <div className="pn-spotlight-card">
            <div className="pn-spotlight-top-tag">
              <span>✦</span> Creative Spotlight
            </div>

            <div className="pn-spotlight-placeholder-artwork">
              <div className="pn-placeholder-avatar">JM</div>
              <div className="pn-placeholder-title">Jose M.</div>
              <div className="pn-placeholder-sub">Video Editor & Illustrator</div>
            </div>

            {!imageError && (
              <img
                src="/Josedesk.jpg"
                alt="Jose M. - Video Editor, Illustrator & Motion Designer"
                className="pn-spotlight-img"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('josedesk.jpg') && !target.src.includes('jose-creative') && !target.src.includes('jose.jpg')) {
                    target.src = '/josedesk.jpg';
                  } else if (!target.src.includes('jose-creative') && !target.src.includes('jose.jpg')) {
                    target.src = '/jose-creative.jpg';
                  } else if (!target.src.includes('jose.jpg')) {
                    target.src = '/jose.jpg';
                  } else {
                    setImageError(true);
                  }
                }}
              />
            )}

            <div className="pn-spotlight-plate">
              <div className="pn-plate-header">
                <div className="pn-plate-name">
                  Jose M.
                  <span style={{ fontSize: "14px" }}>🎖️</span>
                </div>
                <div className="pn-status-pill">
                  <span className="pn-green-dot" />
                  Available Now
                </div>
              </div>

              <div className="pn-plate-role">
                Video Editor • Illustrator • Graphic & Motion Designer
              </div>

              <div className="pn-plate-badges">
                <span className="pn-award-badge">
                  🏆 2026 ADDY® Award Winner
                </span>
                <span className="pn-stat-badge">
                  ⭐ 5.0 (5 Projects Completed)
                </span>
              </div>

              <div className="pn-plate-location">
                📍 Birmingham & Troy, AL Area
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YOUTUBE FEATURE BANNER: SEE OUR CREATIVES IN ACTION */}
      <section className="pn-yt-feature-banner">
        <div className="pn-yt-card">
          <div className="pn-yt-left">
            <div className="pn-yt-play-icon">▶</div>
            <div className="pn-yt-info">
              <h3>Watch Our Creatives in Action on YouTube</h3>
              <p>
                Follow our official YouTube channel to watch behind-the-scenes shoots, client case studies, design breakdowns, and creative tutorials across Alabama and the South.
              </p>
            </div>
          </div>
          <a
            href="https://youtube.com/PeachNetwork"
            target="_blank"
            rel="noopener noreferrer"
            className="pn-yt-btn"
          >
            <span>▶</span> Watch youtube.com/PeachNetwork
          </a>
        </div>
      </section>

      {/* MEET OUR CREATIVES IN ACTION (REAL TEAM GALLERY) */}
      <section id="creatives" className="pn-action-gallery-section">
        <div className="pn-gallery-container">
          <div className="pn-gallery-header">
            <div className="pn-gallery-kicker">✦ Real Talent • Real Studios ✦</div>
            <h2 className="pn-gallery-title">
              Meet the Creatives Behind <span>Sweet As A Peach</span>
            </h2>
            <p className="pn-gallery-sub">
              No anonymous overseas bots. Meet the vetted videographers, brand illustrators, print specialists, and web designers bringing Southern businesses to life.
            </p>
          </div>

          <div className="pn-gallery-grid">
            {CREATIVE_SNAPS.map((snap, idx) => (
              <div key={idx} className="pn-gallery-card">
                <div className="pn-gallery-media">
                  <img
                    src={snap.image}
                    alt={snap.caption}
                    className="pn-gallery-img"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const next = snap.altImages.find((src) => !target.src.includes(src));
                      if (next) {
                        target.src = next;
                      }
                    }}
                  />
                  <div className="pn-gallery-role-pill">
                    <span>{snap.icon}</span> {snap.role}
                  </div>
                </div>
                <div className="pn-gallery-meta">
                  <p className="pn-gallery-caption">{snap.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PITCH DECK BREAKDOWN: WHY PEACH NETWORK? */}
      <section className="pn-deck-section">
        <div className="pn-deck-container">
          <div className="pn-deck-header">
            <div className="pn-deck-motto">✦ The Pitch Deck Breakdown ✦</div>
            <h2 className="pn-deck-title">
              Why Peach Network? <span>The Sweeter Alternative.</span>
            </h2>
            <p className="pn-deck-sub">
              Traditional agencies drain your budget. Gig apps drain your patience. We built Peach Network to give you vetted agency polish at transparent, affordable coin rates.
            </p>
          </div>

          <div className="pn-deck-matrix">
            {/* Column 1: Traditional Agencies */}
            <div className="pn-matrix-card">
              <div className="pn-matrix-tag pn-mt-gray">The Old Agency Way</div>
              <h3 className="pn-matrix-title">Traditional Agencies</h3>
              <div className="pn-matrix-price">💸 $3,000 – $5,000 / mo retainers</div>
              <ul className="pn-matrix-points">
                <li className="pn-mp-item"><span className="pn-mp-con">✕</span> <span>Prohibitive monthly retainers locking you in</span></li>
                <li className="pn-mp-item"><span className="pn-mp-con">✕</span> <span>Bloated overhead, middle management & meetings</span></li>
                <li className="pn-mp-item"><span className="pn-mp-con">✕</span> <span>Slow 3–4 week timelines for simple flyers or ads</span></li>
                <li className="pn-mp-item"><span className="pn-mp-con">✕</span> <span>Priced out for churches, nonprofits & local shops</span></li>
              </ul>
            </div>

            {/* Column 2: Global Gig Platforms */}
            <div className="pn-matrix-card">
              <div className="pn-matrix-tag pn-mt-gray">Open Freelance Platforms</div>
              <h3 className="pn-matrix-title">Fiverr & Upwork</h3>
              <div className="pn-matrix-price">⚠️ Hourly Creep & Hidden Fees</div>
              <ul className="pn-matrix-points">
                <li className="pn-mp-item"><span className="pn-mp-con">✕</span> <span>50+ spam bids & bot proposals to sort through</span></li>
                <li className="pn-mp-item"><span className="pn-mp-con">✕</span> <span>Unvetted quality, stolen templates & ghosting</span></li>
                <li className="pn-mp-item"><span className="pn-mp-con">✕</span> <span>Unpredictable hourly billing creep and scope creep</span></li>
                <li className="pn-mp-item"><span className="pn-mp-con">✕</span> <span>20–30% platform cuts taken out of creators&apos; pockets</span></li>
              </ul>
            </div>

            {/* Column 3: The Peach Network (THE WINNER) */}
            <div className="pn-matrix-card is-winner">
              <div className="pn-winner-badge">✦ The Southern Sweet Spot ✦</div>
              <div className="pn-matrix-tag pn-mt-peach">Vetted & Curated</div>
              <h3 className="pn-matrix-title">Peach Network</h3>
              <div className="pn-matrix-price" style={{ color: "#E85D3F", fontWeight: 800 }}>
                🪙 Flat Coins ($50 base) • 75% to Talent
              </div>
              <ul className="pn-matrix-points">
                <li className="pn-mp-item"><span className="pn-mp-pro">✓</span> <span><strong>Vetted Creatives You Can Trust</strong> at affordable rates</span></li>
                <li className="pn-mp-item"><span className="pn-mp-pro">✓</span> <span>Zero bidding wars—Peach Match AI pairs you in 60 seconds</span></li>
                <li className="pn-mp-item"><span className="pn-mp-pro">✓</span> <span>Fast 24–48 hour turnaround with 2 revision rounds</span></li>
                <li className="pn-mp-item"><span className="pn-mp-pro">✓</span> <span><strong>75% Creator Payout</strong> keeps local Southern talent thriving</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: PEACH MATCH AI */}
      <section className="pn-ai-section">
        <div className="pn-ai-container">
          <div className="pn-ai-header">
            <div className="pn-ai-kicker">✦ Smart Niche Matching ✦</div>
            <h2 className="pn-ai-title">
              How Peach Match AI <span>Pairs Your Project</span>
            </h2>
            <p className="pn-ai-subtitle">
              Say goodbye to 50 spam bids. Tell us what you need in 60 seconds, and our AI pairs your project with a creator who specializes in that exact medium.
            </p>
          </div>

          <div className="pn-ai-flow-card">
            {/* Step 1: Brief */}
            <div className="pn-mock-brief-card">
              <span className="pn-brief-header-pill">1. Your 60-Second Brief</span>
              <h4 className="pn-brief-title">"Youth Basketball Tournament Event Poster & Social Media Graphics Pack"</h4>
              <div className="pn-brief-tags">
                <span className="pn-b-tag">🏀 Sports & Event Design</span>
                <span className="pn-b-tag">⚡ 24–48h Turnaround</span>
                <span className="pn-b-tag">🪙 2 Coins ($100)</span>
              </div>
            </div>

            {/* Step 2: AI Engine */}
            <div className="pn-ai-connector">
              <div className="pn-ai-pulse-orb">🍑</div>
              <div className="pn-ai-engine-label">
                Peach Match AI™<br />
                <span style={{ color: "#E85D3F", fontWeight: 700 }}>Niche & Skill Matched</span>
              </div>
            </div>

            {/* Step 3: Match */}
            <div className="pn-mock-match-card">
              <div className="pn-match-score-badge">99% Best Match</div>
              <div className="pn-match-creative-row">
                <div className="pn-match-avatar">MR</div>
                <div>
                  <div className="pn-match-creative-name">Marcus R.</div>
                  <div className="pn-match-creative-skills">Specialty: Sports Graphics & Poster Illustrator</div>
                </div>
              </div>
              <div className="pn-match-badges-grid">
                <span className="pn-m-badge pn-mb-gold">🏆 Featured Sports Illustrator</span>
                <span className="pn-m-badge pn-mb-green">⭐ 5.0 (18 Projects)</span>
                <span className="pn-m-badge pn-mb-blue">⚡ 24h Delivery Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFINITE SLIDING MARQUEE: RECENT WORK */}
      <section id="work" className="pn-projects-section">
        <div className="pn-projects-header">
          <div className="pn-projects-kicker">✦ Real Deliverables • Real Impact ✦</div>
          <h2 className="pn-projects-title">Recent Work from the Network</h2>
          <p className="pn-projects-subtitle">
            Explore actual deliverables crafted for Southern businesses, community programs, civic chambers, and original creative brands—featuring illustrations by Jose M.
          </p>
        </div>

        <div className="pn-marquee-wrap">
          <div className="pn-marquee-track">
            {RECENT_PROJECTS.map((proj) => (
              <div key={proj.id} className="pn-project-card">
                <div className="pn-card-media" style={{ background: proj.bgGradient }}>
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="pn-card-img"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const next = proj.altImages.find((src) => !target.src.includes(src));
                      if (next) {
                        target.src = next;
                      } else {
                        target.style.display = 'none';
                      }
                    }}
                  />
                  <div className="pn-editorial-artwork">
                    <div className="pn-art-icon">{proj.icon}</div>
                    <div className="pn-art-headline">{proj.headline}</div>
                    <div className="pn-art-client">{proj.title}</div>
                  </div>
                  <div className="pn-card-coin-badge">{proj.deliverable}</div>
                  <div className="pn-card-tag-badge">{proj.tag}</div>
                </div>
                <div className="pn-card-body">
                  <div className="pn-card-creator-credit">{proj.creator}</div>
                  <h3 className="pn-card-client-title">{proj.title}</h3>
                  <div className="pn-card-deliverable-label">{proj.category}</div>
                  <p className="pn-card-desc">{proj.desc}</p>
                </div>
              </div>
            ))}

            {/* Duplicate for infinite loop */}
            {RECENT_PROJECTS.map((proj) => (
              <div key={`dup-${proj.id}`} className="pn-project-card">
                <div className="pn-card-media" style={{ background: proj.bgGradient }}>
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="pn-card-img"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const next = proj.altImages.find((src) => !target.src.includes(src));
                      if (next) {
                        target.src = next;
                      } else {
                        target.style.display = 'none';
                      }
                    }}
                  />
                  <div className="pn-editorial-artwork">
                    <div className="pn-art-icon">{proj.icon}</div>
                    <div className="pn-art-headline">{proj.headline}</div>
                    <div className="pn-art-client">{proj.title}</div>
                  </div>
                  <div className="pn-card-coin-badge">{proj.deliverable}</div>
                  <div className="pn-card-tag-badge">{proj.tag}</div>
                </div>
                <div className="pn-card-body">
                  <div className="pn-card-creator-credit">{proj.creator}</div>
                  <h3 className="pn-card-client-title">{proj.title}</h3>
                  <div className="pn-card-deliverable-label">{proj.category}</div>
                  <p className="pn-card-desc">{proj.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: CREATIVE ECOSYSTEM */}
      <section id="ecosystem" className="pn-ecosystem-section">
        <div className="pn-eco-container">
          <div className="pn-eco-header">
            <div className="pn-eco-kicker">✦ For Creatives, By Creatives ✦</div>
            <h2 className="pn-eco-title">
              A Home Where <span>Southern Talent Thrives</span>
            </h2>
            <p className="pn-eco-sub">
              We rejected the race-to-the-bottom freelancing apps. Peach Network is an incubator and community where designers earn a transparent 75% payout, receive senior mentorship, and level up through real-world work.
            </p>
          </div>

          {/* Vetting Ladder */}
          <div className="pn-ladder-title-row">
            <h3>The 3-Tier Creator Growth Ladder</h3>
            <p>You apply, our creative directors review your portfolio, and we place you on an active career trajectory:</p>
          </div>

          <div className="pn-ladder-grid">
            <div className="pn-ladder-card">
              <div className="pn-ladder-step-num">Level 1</div>
              <h4 className="pn-ladder-name">Rising Creative</h4>
              <div className="pn-ladder-badge pn-lb-orange">Apprentice Track</div>
              <p className="pn-ladder-desc">
                Emerging designers and recent graduates paired with Senior Mentors on entry tasks (1–2 Coin graphics) while sharpening their craft through Academy masterclasses.
              </p>
            </div>

            <div className="pn-ladder-card is-spotlight">
              <div className="pn-ladder-step-num">Level 2</div>
              <h4 className="pn-ladder-name">Verified Pro</h4>
              <div className="pn-ladder-badge pn-lb-peach">Specialist Track</div>
              <p className="pn-ladder-desc">
                Proven designers with demonstrated mastery in specific niches (sports flyers, church media, menus, web). Matched directly to client tickets with full 75% deliverable payouts.
              </p>
            </div>

            <div className="pn-ladder-card">
              <div className="pn-ladder-step-num">Level 3</div>
              <h4 className="pn-ladder-name">Senior Mentor</h4>
              <div className="pn-ladder-badge pn-lb-gold">Art Director Track</div>
              <p className="pn-ladder-desc">
                ADDY® award winners and studio veterans who direct complex brand systems, conduct QA reviews before client delivery, and mentor rising designers.
              </p>
            </div>
          </div>

          {/* 3 Ecosystem Engines */}
          <div className="pn-engines-grid">
            <div className="pn-engine-card">
              <div className="pn-engine-icon-box">🎓</div>
              <h4 className="pn-engine-title">The Peach Academy</h4>
              <p className="pn-engine-desc">
                Practical, agency-grade skill workshops. Master 300 DPI print-bleed setups, typography hierarchy, packaging dielines, and effective client communication.
              </p>
              <ul className="pn-engine-perks">
                <li>✓ Live mentor portfolio critique nights</li>
                <li>✓ Agency file-prep certification</li>
                <li>✓ Unlocks higher-tier coin projects</li>
              </ul>
            </div>

            <div className="pn-engine-card">
              <div className="pn-engine-icon-box">🍑</div>
              <h4 className="pn-engine-title">The Peach Hub</h4>
              <p className="pn-engine-desc">
                The creative clubhouse for Southern designers. Say goodbye to isolating solo freelancing—collaborate, share assets, and bounce ideas off peers.
              </p>
              <ul className="pn-engine-perks">
                <li>✓ Curated font vaults & mockup library</li>
                <li>✓ Pre-delivery peer feedback channels</li>
                <li>✓ Local print shop vendor discounts</li>
              </ul>
            </div>

            <div className="pn-engine-card">
              <div className="pn-engine-icon-box">🏆</div>
              <h4 className="pn-engine-title">Sponsored Challenges</h4>
              <p className="pn-engine-desc">
                Daily and weekly design competitions sponsored by real businesses. Win cash prizes, build your portfolio with real-world briefs, and get hired.
              </p>
              <ul className="pn-engine-perks">
                <li>✓ Cash prizes ($100 – $500+) & Peach Coins</li>
                <li>✓ Real business briefs (logos, merch, flyers)</li>
                <li>✓ High client discovery & follow-on gigs</li>
              </ul>
            </div>
          </div>

          {/* Creator Banner */}
          <div className="pn-eco-cta-bar">
            <div className="pn-eco-cta-text">
              <h4>Ready to do your best work with fair 75% payouts?</h4>
              <p>
                No bidding wars, no pay-to-work fees, and no race to the bottom. Apply today and join the premier creative network of the South.
              </p>
            </div>
            <Link href="/apply" className="pn-eco-apply-btn">
              <span>🍑</span> Apply as a Creative
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION: PRICING ARCHITECTURE */}
      <section id="pricing" className="pn-pricing-section">
        <div className="pn-pricing-container">
          
          {/* COMMERCIAL ADVERTISEMENT CALLOUT */}
          <div className="pn-ad-callout-card">
            <div className="pn-ad-callout-text">
              <h3>
                That project you&apos;ve been putting off? <br />
                <span>Get it done today with just the tap of a button.</span>
              </h3>
              <p>
                No more waiting weeks for agency callbacks or wading through 50 unvetted bids online. Choose your deliverable, tap submit, and get matched with an award-winning creative in 24 hours.
              </p>
            </div>
            <div className="pn-ad-action-box">
              <Link href="/match" className="pn-tap-btn">
                <span>⚡</span> Tap to Start a Project
              </Link>
              <span className="pn-ad-tagline-sub">Vetted Talent • 24–48h Turnaround • 75% Creative Payout</span>
            </div>
          </div>

          {/* PRICING HEADER */}
          <div className="pn-pricing-header">
            <div className="pn-pricing-kicker">✦ Simple, Transparent Pricing ✦</div>
            <h2 className="pn-pricing-title">
              Clear Pricing. <span>Zero Surprises.</span>
            </h2>
            <p className="pn-pricing-subtitle">
              Need just one flyer or menu? Go <strong>À La Carte</strong>. Need a continuous stream of creative work every month? Save with our <strong>Monthly Membership Tiers</strong>.
            </p>
          </div>

          {/* INTERACTIVE TOGGLE: À LA CARTE vs MEMBERSHIP */}
          <div className="pn-toggle-container">
            <div className="pn-toggle-shell">
              <button
                className={`pn-toggle-btn ${pricingTab === "alacarte" ? "is-active" : ""}`}
                onClick={() => setPricingTab("alacarte")}
              >
                🪙 À La Carte (Pay-As-You-Go)
              </button>
              <button
                className={`pn-toggle-btn ${pricingTab === "membership" ? "is-active" : ""}`}
                onClick={() => setPricingTab("membership")}
              >
                🚀 Monthly Membership Tiers
              </button>
            </div>
          </div>

          {/* TAB 1: À LA CARTE SERVICES */}
          {pricingTab === "alacarte" && (
            <div className="pn-alacarte-grid">
              {ALACARTE_ITEMS.map((item, idx) => (
                <div key={idx} className={`pn-coin-card ${item.popular ? "is-popular" : ""}`}>
                  {item.popular && <div className="pn-popular-pill">Most Popular Choice</div>}
                  
                  <div>
                    <div className="pn-card-top-row">
                      <div className="pn-coin-amount-badge">
                        <span>🪙</span> {item.coins} Peach {item.coins === 1 ? "Coin" : "Coins"}
                      </div>
                      <div className="pn-turnaround-pill">{item.turnaround}</div>
                    </div>

                    <div className="pn-card-price-display">
                      <span className="pn-price-dollars">{item.price}</span>
                      <span className="pn-price-cents">total fixed price</span>
                    </div>

                    <h3 className="pn-card-service-title">{item.name}</h3>
                    <p className="pn-card-service-sub">{item.subtitle}</p>

                    <div className="pn-card-divider" />

                    <ul className="pn-features-list">
                      {item.includes.map((feat, fIdx) => (
                        <li key={fIdx} className="pn-feature-item">
                          <span className="pn-feature-check">✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href="/match"
                    className={`pn-card-order-btn ${item.popular ? "pn-btn-card-peach" : "pn-btn-card-primary"}`}
                  >
                    {item.cta}
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: MONTHLY MEMBERSHIP TIERS */}
          {pricingTab === "membership" && (
            <div className="pn-membership-grid">
              {MEMBERSHIP_TIERS.map((tier) => (
                <div key={tier.id} className={`pn-membership-card ${tier.popular ? "is-popular" : ""}`}>
                  {tier.popular && <div className="pn-popular-pill">Recommended Plan</div>}

                  <div>
                    <div className="pn-tier-badge">
                      <span>✦</span> {tier.valueTag}
                    </div>

                    <div className="pn-tier-price-row">
                      <span className="pn-tier-price">{tier.price}</span>
                      <span className="pn-tier-cadence">{tier.cadence}</span>
                    </div>

                    <h3 className="pn-tier-title">{tier.name}</h3>
                    <div style={{ color: "#E85D3F", fontWeight: "800", fontSize: "14px", marginBottom: "8px" }}>
                      🪙 {tier.coins}
                    </div>
                    <p className="pn-tier-desc">{tier.desc}</p>

                    <div className="pn-card-divider" />

                    <ul className="pn-features-list">
                      {tier.features.map((feat, fIdx) => (
                        <li key={fIdx} className="pn-feature-item">
                          <span className="pn-feature-check">✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href="/match"
                    className={`pn-card-order-btn ${tier.popular ? "pn-btn-card-peach" : "pn-btn-card-primary"}`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Guarantee Banner */}
          <div className="pn-pricing-guarantee-banner">
            <div className="pn-guarantee-text">
              <h4>🛡 100% Agency Quality Guarantee & 75% Payout</h4>
              <p>
                Every project includes 2 revision rounds and direct art-direction oversight. Best of all: 75% of your investment stays directly in the hands of Southern creators.
              </p>
            </div>
            <Link href="/match" className="pn-guarantee-btn">
              Get Matched Today
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pn-footer">
        <div className="pn-footer-inner">
          <div className="pn-footer-left">
            <h4>Sweet As A Peach Creative Network</h4>
            <p>More Creatives. Stronger Businesses. A Sweeter South. • Headquarters: Birmingham, AL</p>
          </div>
          <div className="pn-footer-right">
            <a
              href="https://youtube.com/PeachNetwork"
              target="_blank"
              rel="noopener noreferrer"
              className="pn-footer-link"
            >
              ▶ YouTube: youtube.com/PeachNetwork
            </a>
            <Link href="/about" className="pn-footer-link">About</Link>
            <Link href="/match" className="pn-footer-link">Find a Creative</Link>
            <Link href="/apply" className="pn-footer-link">Apply</Link>
            <Link href="/signin" className="pn-footer-link">Sign In</Link>
          </div>
        </div>
      </footer>

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
          <a href="#work" className="pn-drawer-link" onClick={() => setMenuOpen(false)}>
            Recent Work
          </a>
          <a href="#creatives" className="pn-drawer-link" onClick={() => setMenuOpen(false)}>
            Creatives in Action
          </a>
          <a href="#pricing" className="pn-drawer-link" onClick={() => setMenuOpen(false)}>
            Pricing
          </a>
          <a href="#ecosystem" className="pn-drawer-link" onClick={() => setMenuOpen(false)}>
            Academy & Hub
          </a>
          <a
            href="https://youtube.com/PeachNetwork"
            target="_blank"
            rel="noopener noreferrer"
            className="pn-drawer-link"
            onClick={() => setMenuOpen(false)}
            style={{ color: "#DC2626" }}
          >
            ▶ Watch YouTube
          </a>
          <Link href="/apply" className="pn-drawer-link" onClick={() => setMenuOpen(false)}>
            Apply as a Creative
          </Link>
          <Link href="/signin" className="pn-drawer-link" onClick={() => setMenuOpen(false)}>
            Sign In
          </Link>
        </nav>
      </aside>
    </main>
  );
}
