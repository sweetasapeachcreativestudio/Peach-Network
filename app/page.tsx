"use client";

import React, { useState } from "react";
import Link from "next/link";
import BrandSplash from "./components/brand-splash";

const RECENT_PROJECTS = [
  {
    id: 1,
    title: "Lawson State Community College",
    category: "Social Media Campaign & Templates",
    deliverable: "Social 4-Pack • 3 Coins",
    image: "/projects/project-lawson-state.png",
    accent: "#F3C64F",
    bgGradient: "linear-gradient(135deg, #0A2E50 0%, #031526 100%)",
    icon: "🎓",
    tag: "Higher Education",
    headline: "Opportunity Lives Here",
    desc: "Branded student spotlights, culinary program announcements, and high-engagement Instagram templates.",
  },
  {
    id: 2,
    title: "Bessemer Area Chamber of Commerce",
    category: "Full Brand Identity & Merch Kit",
    deliverable: "Mini Brand Kit • 6 Coins",
    image: "/projects/project-bessemer-brand.png",
    accent: "#60A5FA",
    bgGradient: "linear-gradient(135deg, #133E8D 0%, #091B42 100%)",
    icon: "🏛️",
    tag: "Civic & Chamber",
    headline: "Building Connections That Matter",
    desc: "Official municipal seal, reception dimensional signage, business stationery, and member merchandise.",
  },
  {
    id: 3,
    title: "Reignbows Children's Boutique",
    category: "E-Commerce Storefront & Mobile UI",
    deliverable: "Web Platform • 10 Coins",
    image: "/projects/project-reignbows.png",
    accent: "#FBBF24",
    bgGradient: "linear-gradient(135deg, #D9531E 0%, #872800 100%)",
    icon: "👶",
    tag: "Retail & E-Comm",
    headline: "Cozy Never Goes Out of Style",
    desc: "Custom Shopify store, mobile-optimized checkout, and autumn lookbook product bundles.",
  },
  {
    id: 4,
    title: "Bessemer Chamber of Commerce",
    category: "Official Website & Member Portal",
    deliverable: "Web Experience • 10 Coins",
    image: "/projects/project-bessemer-web.png",
    accent: "#38BDF8",
    bgGradient: "linear-gradient(135deg, #0369A1 0%, #082F49 100%)",
    icon: "🌐",
    tag: "Web Experience",
    headline: "Empowering Local Businesses",
    desc: "Member portal with directory listings, event ticketing, and community sponsorship hubs.",
  },
  {
    id: 5,
    title: "New Joy Fellowship Baptist Church",
    category: "Event Program & Editorial Print Kit",
    deliverable: "Editorial Print • 4 Coins",
    image: "/projects/project-church-program.png",
    accent: "#E879F9",
    bgGradient: "linear-gradient(135deg, #6B21A8 0%, #3B0764 100%)",
    icon: "⛪",
    tag: "Faith & Community",
    headline: "Friends & Family Day 2026",
    desc: "Commemorative service booklets, floral announcements, and community invitations.",
  },
  {
    id: 6,
    title: "New Joy Fellowship BBQ Fundraiser",
    category: "Fundraiser Menu Board & Signage",
    deliverable: "Print Signage • 2 Coins",
    image: "/projects/project-church-menu.png",
    accent: "#FB923C",
    bgGradient: "linear-gradient(135deg, #7C2D12 0%, #391104 100%)",
    icon: "🍗",
    tag: "Event & Food",
    headline: "Food • Faith • Community",
    desc: "Woodgrain outdoor event signage, combo menu displays, and sponsor banners.",
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

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

        /* SOUTHERN CREATIVE STUDIO TEXTURE & LIGHTING */
        .pn-studio-lighting {
          position: absolute;
          inset: 0;
          height: 850px;
          background: 
            radial-gradient(circle at 12% 14%, rgba(254, 237, 226, 0.8) 0%, transparent 45%),
            radial-gradient(circle at 86% 22%, rgba(247, 209, 188, 0.55) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.5) 0%, transparent 65%);
          pointer-events: none;
          z-index: 1;
        }

        /* Subtle grid background for architectural creative design flavor */
        .pn-grid-texture {
          position: absolute;
          inset: 0;
          height: 850px;
          background-size: 32px 32px;
          background-image: 
            linear-gradient(to right, rgba(232, 139, 104, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(232, 139, 104, 0.06) 1px, transparent 1px);
          mask-image: linear-gradient(180deg, black 0%, black 70%, transparent 100%);
          -webkit-mask-image: linear-gradient(180deg, black 0%, black 70%, transparent 100%);
          pointer-events: none;
          z-index: 1;
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
          border-bottom: 1.5px solid rgba(232, 139, 104, 0.18);
        }

        .pn-header-logo-link {
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        .pn-header-logo {
          height: clamp(44px, 5.2vw, 56px);
          width: auto;
          display: block;
          filter: drop-shadow(0 4px 12px rgba(24, 34, 29, 0.08));
        }

        .pn-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .pn-top-signin-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 22px;
          font-size: 14px;
          font-weight: 700;
          color: #1E3A2B;
          background: rgba(255, 255, 255, 0.95);
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
          background: rgba(255, 255, 255, 0.95);
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
          min-height: calc(88vh - 84px);
        }

        @media (min-width: 960px) {
          .pn-hero-section {
            grid-template-columns: 1.1fr 0.9fr;
            gap: 60px;
            padding: 44px 24px 76px 24px;
          }
        }

        /* LEFT HERO COLUMN */
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
          border: 1.5px solid #E88B68;
          border-radius: 100px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 800;
          color: #E85D3F;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 20px;
          box-shadow: 0 4px 16px rgba(232, 93, 63, 0.12);
        }

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
          position: relative;
        }

        .pn-hero-lead {
          font-size: clamp(16px, 2.2vw, 19px);
          line-height: 1.55;
          color: #3F5448;
          font-weight: 500;
          margin: 0 0 28px 0;
          max-width: 540px;
        }

        /* Creative Pricing Pill Badge */
        .pn-value-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.9);
          border: 1.5px dashed #E88B68;
          padding: 8px 18px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 700;
          color: #9C3D15;
          margin-bottom: 30px;
          box-shadow: 0 4px 14px rgba(232, 139, 104, 0.12);
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
          max-width: 460px;
          aspect-ratio: 4 / 5.2;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 
            0 28px 65px rgba(24, 45, 33, 0.2),
            0 8px 24px rgba(232, 139, 104, 0.25);
          border: 4px solid #FFFFFF;
          background: linear-gradient(145deg, #2D4236 0%, #15241C 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        /* Jose's Photo with multi-name auto-fallback */
        .pn-spotlight-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          display: block;
          z-index: 1;
        }

        /* Stylish fallback portrait artwork if photo is still uploading */
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
          background: linear-gradient(135deg, #E88B68 0%, #D45B38 100%);
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

        /* Top Pill Kicker on Card */
        .pn-spotlight-top-tag {
          position: absolute;
          top: 18px;
          left: 18px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(24, 51, 36, 0.88);
          backdrop-filter: blur(10px);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          z-index: 5;
        }

        /* Floating Trust Plate at bottom of Jose's Card */
        .pn-spotlight-plate {
          position: relative;
          z-index: 5;
          margin: 16px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1.5px solid rgba(232, 139, 104, 0.38);
          border-radius: 22px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0 12px 32px rgba(24, 34, 29, 0.18);
        }

        .pn-plate-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pn-plate-name {
          font-size: 18px;
          font-weight: 850;
          color: #1A2821;
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
          background: #F1F5F9;
          color: #334155;
          font-size: 11px;
          font-weight: 750;
          padding: 4px 9px;
          border-radius: 6px;
        }

        .pn-plate-location {
          font-size: 11px;
          color: #556B60;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }

        /* THREE-STEP HOW IT WORKS STRIP */
        .pn-how-it-works-strip {
          max-width: 1280px;
          margin: 0 auto 50px auto;
          padding: 0 24px;
        }

        .pn-strip-card {
          background: #FFFFFF;
          border: 1.5px solid rgba(232, 139, 104, 0.28);
          border-radius: 24px;
          padding: 24px 32px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          box-shadow: 0 10px 30px rgba(24, 34, 29, 0.05);
        }

        @media (min-width: 768px) {
          .pn-strip-card {
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
          }
        }

        .pn-step-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .pn-step-num {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: #FDF0E7;
          border: 1px solid #E88B68;
          color: #E85D3F;
          font-size: 16px;
          font-weight: 850;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pn-step-title {
          font-size: 15px;
          font-weight: 800;
          color: #1A2821;
          margin-bottom: 4px;
        }
        .pn-step-desc {
          font-size: 13px;
          line-height: 1.45;
          color: #5F7368;
          margin: 0;
        }

        /* SECTION 2: SLIDING PROJECT EXAMPLES */
        .pn-projects-section {
          width: 100%;
          padding: 60px 0 80px 0;
          background: linear-gradient(180deg, rgba(250, 242, 235, 0) 0%, #FFFFFF 40%, #FFFFFF 100%);
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
          mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
        }

        .pn-marquee-track {
          display: flex;
          gap: 24px;
          width: max-content;
          animation: pnMarquee 44s linear infinite;
        }
        .pn-marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes pnMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* STYLED EDITORIAL PROJECT CARDS */
        .pn-project-card {
          width: 360px;
          background: #FAF2EB;
          border-radius: 24px;
          overflow: hidden;
          border: 1.5px solid rgba(232, 139, 104, 0.24);
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

        /* Mockup Header that looks like a finished agency artifact */
        .pn-card-media {
          width: 100%;
          height: 230px;
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

        /* Rich Editorial Mockup Fallback Graphics */
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
          background: rgba(24, 51, 36, 0.92);
          backdrop-filter: blur(8px);
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          padding: 6px 12px;
          border-radius: 99px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          z-index: 2;
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
          z-index: 2;
        }

        .pn-card-body {
          padding: 20px 22px 24px 22px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .pn-card-client-title {
          font-size: 18px;
          font-weight: 850;
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

      {/* Atmospheric lighting & grid textures */}
      <div className="pn-studio-lighting" />
      <div className="pn-grid-texture" />

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
            <span>✦</span>
            Birmingham's Creative Marketplace
          </div>

          <h1 className="pn-hero-title">
            The right creative.<br />
            Right when you <span className="pn-accent">need them.</span>
          </h1>

          <p className="pn-hero-lead">
            Vetted creatives. Quality work for fair prices. Connecting Southern businesses with top-tier local design, branding, and web talent.
          </p>

          {/* Tangible Value Proposition Pill */}
          <div className="pn-value-pill">
            <span>🪙</span>
            <span><strong>1 Coin = 1 Finished Deliverable</strong> • No Retainers • No Hourly Creep</span>
          </div>

          <div className="pn-hero-actions">
            <Link href="/match" className="pn-btn-green">
              Find a Creative
            </Link>
            <Link href="/apply" className="pn-btn-peach">
              Join the Network
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: CREATIVE SPOTLIGHT (JOSE) */}
        <div className="pn-hero-visual-wrap">
          <div className="pn-spotlight-card">
            {/* Top Tag */}
            <div className="pn-spotlight-top-tag">
              <span>✦</span> Creative Spotlight
            </div>

            {/* Stylized fallback if photo file is still uploading */}
            <div className="pn-spotlight-placeholder-artwork">
              <div className="pn-placeholder-avatar">JM</div>
              <div className="pn-placeholder-title">Jose M.</div>
              <div className="pn-placeholder-sub">Video Editor & Illustrator</div>
            </div>

            {/* Photo with multi-name fallback chain */}
            {!imageError && (
              <img
                src="/jose-creative.jpg"
                alt="Jose M. - Video Editor, Illustrator & Graphic Designer in Birmingham & Troy AL"
                className="pn-spotlight-img"
                onError={(e) => {
                  const target = e.currentTarget;
                  // Try alternative names if the user uploaded with different names
                  if (!target.src.includes('jose.jpg') && !target.src.includes('Brown')) {
                    target.src = '/jose.jpg';
                  } else if (!target.src.includes('Brown')) {
                    target.src = '/Brown and White Minimalist Packaging Mockup Instagram Post.jpg';
                  } else {
                    setImageError(true);
                  }
                }}
              />
            )}

            {/* Floating Trust Plate at bottom of Jose's Card */}
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
                Video Editor • Illustrator • Graphic Designer
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

      {/* THREE-STEP PROCESS STRIP */}
      <section className="pn-how-it-works-strip">
        <div className="pn-strip-card">
          <div className="pn-step-item">
            <div className="pn-step-num">1</div>
            <div>
              <div className="pn-step-title">Choose Your Deliverable</div>
              <p className="pn-step-desc">Pick fixed-price Coin packages from simple flyers to full websites.</p>
            </div>
          </div>
          <div className="pn-step-item">
            <div className="pn-step-num">2</div>
            <div>
              <div className="pn-step-title">Matched in 24 Hours</div>
              <p className="pn-step-desc">Pair with vetted talent like Jose tailored specifically to your project.</p>
            </div>
          </div>
          <div className="pn-step-item">
            <div className="pn-step-num">3</div>
            <div>
              <div className="pn-step-title">75% Payout to Creators</div>
              <p className="pn-step-desc">Your investment directly fuels Alabama's local creative economy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* INFINITE SLIDING MARQUEE: RECENT WORK FROM THE NETWORK */}
      <section className="pn-projects-section">
        <div className="pn-projects-header">
          <div className="pn-projects-kicker">✦ Real Deliverables • Real Impact ✦</div>
          <h2 className="pn-projects-title">Recent Work from the Network</h2>
          <p className="pn-projects-subtitle">
            Explore actual deliverables crafted for Birmingham institutions, civic chambers, community programs, and local brands.
          </p>
        </div>

        {/* Continuous Looping Track */}
        <div className="pn-marquee-wrap">
          <div className="pn-marquee-track">
            {/* Loop Set 1 */}
            {RECENT_PROJECTS.map((proj) => (
              <div key={proj.id} className="pn-project-card">
                <div className="pn-card-media" style={{ background: proj.bgGradient }}>
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="pn-card-img"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
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
                  <h3 className="pn-card-client-title">{proj.title}</h3>
                  <div className="pn-card-deliverable-label">{proj.category}</div>
                  <p className="pn-card-desc">{proj.desc}</p>
                </div>
              </div>
            ))}

            {/* Loop Set 2 (for seamless infinite loop) */}
            {RECENT_PROJECTS.map((proj) => (
              <div key={`dup-${proj.id}`} className="pn-project-card">
                <div className="pn-card-media" style={{ background: proj.bgGradient }}>
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="pn-card-img"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
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
