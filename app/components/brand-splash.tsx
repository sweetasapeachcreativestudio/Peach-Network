"use client";

import React, { useEffect, useState } from "react";

export default function BrandSplash() {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Cinematic hold for 3.2s, smooth fade transition, unmount at 3.9s
    const fadeTimer = setTimeout(() => setFading(true), 3200);
    const removeTimer = setTimeout(() => setShow(false), 3900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`pn-orchard-splash ${fading ? "pn-splash-exit" : ""}`} aria-hidden="true">
      <style>{`
        .pn-orchard-splash {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #FAF6F0;
          background-image: 
            radial-gradient(at 15% 15%, rgba(232, 139, 104, 0.12) 0px, transparent 55%),
            radial-gradient(at 85% 85%, rgba(24, 34, 29, 0.08) 0px, transparent 55%);
          padding: 24px;
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 1;
          transform: scale(1);
          pointer-events: auto;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", sans-serif;
          overflow: hidden;
        }

        .pn-splash-exit {
          opacity: 0;
          transform: scale(1.03);
          pointer-events: none;
        }

        /* Ambient warm sunlight halo */
        .pn-sunlight-halo {
          position: absolute;
          width: 460px;
          height: 460px;
          background: radial-gradient(circle, rgba(232, 139, 104, 0.18) 0%, rgba(255, 159, 125, 0.08) 45%, rgba(250, 246, 240, 0) 70%);
          border-radius: 50%;
          filter: blur(40px);
          pointer-events: none;
          animation: pnHaloPulse 5s ease-in-out infinite alternate;
        }

        @keyframes pnHaloPulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.18); opacity: 1; }
        }

        /* Tree Branches Swaying in Southern Breeze */
        .pn-branch {
          position: absolute;
          pointer-events: none;
          z-index: 1;
          transform-origin: top;
        }

        .pn-branch-left {
          top: -20px;
          left: -40px;
          width: 320px;
          animation: pnSwayLeft 6s ease-in-out infinite alternate;
        }

        .pn-branch-right {
          top: -30px;
          right: -40px;
          width: 340px;
          animation: pnSwayRight 7.5s ease-in-out infinite alternate;
        }

        @keyframes pnSwayLeft {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(2.5deg) scale(1.02); }
          100% { transform: rotate(-1.5deg) scale(0.99); }
        }

        @keyframes pnSwayRight {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(-3deg) scale(1.03); }
          100% { transform: rotate(2deg) scale(0.98); }
        }

        /* Central Stage */
        .pn-stage {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .pn-logo-svg {
          width: min(520px, 88vw);
          height: auto;
          overflow: visible;
          filter: drop-shadow(0 14px 28px rgba(24, 34, 29, 0.08));
        }

        /* Letters Sliding In */
        .pn-slide-left {
          animation: pnSlideInLeft 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .pn-slide-right {
          animation: pnSlideInRight 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .pn-drop-cap {
          animation: pnDropCap 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.2s;
        }

        @keyframes pnSlideInLeft {
          0% { transform: translateX(-120px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes pnSlideInRight {
          0% { transform: translateX(120px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes pnDropCap {
          0% { transform: translateY(-40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        /* The 4 Peach Steps Whipping in Sequentially */
        .pn-step {
          opacity: 0;
          animation: pnWhipStep 0.65s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
        .pn-step-1 { animation-delay: 0.45s; }
        .pn-step-2 { animation-delay: 0.58s; }
        .pn-step-3 { animation-delay: 0.71s; }
        .pn-step-4 { animation-delay: 0.84s; }

        @keyframes pnWhipStep {
          0% {
            transform: translateX(-80px) skewX(-20deg);
            opacity: 0;
          }
          40% { opacity: 1; }
          100% {
            transform: translateX(0) skewX(0);
            opacity: 1;
          }
        }

        /* NETWORK Subtitle */
        .pn-network-text {
          opacity: 0;
          animation: pnFadeUpNetwork 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards 1.05s;
        }

        @keyframes pnFadeUpNetwork {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Editorial Tagline */
        .pn-tagline-text {
          margin-top: 28px;
          font-family: Georgia, "Playfair Display", serif;
          font-style: italic;
          font-size: 18px;
          color: #2E4B3D;
          opacity: 0;
          transform: translateY(10px);
          animation: pnFadeUpTagline 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards 1.25s;
          text-align: center;
        }

        @keyframes pnFadeUpTagline {
          to { opacity: 0.95; transform: translateY(0); }
        }

        /* Minimalist Orchard Loader */
        .pn-loader-wrap {
          margin-top: 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          opacity: 0;
          animation: pnFadeInLoader 0.6s ease forwards 1.45s;
        }

        @keyframes pnFadeInLoader { to { opacity: 1; } }

        .pn-loader-track {
          width: 140px;
          height: 3px;
          background: #EAE0D5;
          border-radius: 99px;
          overflow: hidden;
          position: relative;
        }

        .pn-loader-fill {
          height: 100%;
          background: linear-gradient(90deg, #E88B68, #FF9F7D);
          border-radius: 99px;
          position: absolute;
          animation: pnLoaderSlide 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }

        @keyframes pnLoaderSlide {
          0% { left: -40%; width: 25%; }
          50% { left: 35%; width: 50%; }
          100% { left: 100%; width: 25%; }
        }

        .pn-loader-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #9B8E85;
        }
      `}</style>

      {/* Ambient warm sunlight halo */}
      <div className="pn-sunlight-halo" />

      {/* Left Swaying Peach Tree Branch */}
      <svg className="pn-branch pn-branch-left" viewBox="0 0 300 240" fill="none">
        <path d="M-20 -10 C 60 40, 140 30, 220 100 C 250 125, 270 160, 290 200" stroke="#2B3E34" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.35" />
        <path d="M 120 35 C 160 80, 180 120, 200 150" stroke="#2B3E34" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.25" />
        <path d="M 160 30 C 180 20, 210 25, 225 45 C 205 55, 175 50, 160 30 Z" fill="#2E4B3D" opacity="0.4" />
        <path d="M 210 90 C 235 80, 265 85, 280 105 C 260 115, 230 110, 210 90 Z" fill="#3D5A4C" opacity="0.35" />
        <path d="M 170 120 C 190 110, 220 115, 235 135 C 215 145, 185 140, 170 120 Z" fill="#2E4B3D" opacity="0.45" />
        <path d="M 260 170 C 280 160, 305 165, 315 185 C 295 195, 270 190, 260 170 Z" fill="#3D5A4C" opacity="0.3" />
        <circle cx="185" cy="65" r="14" fill="#E88B68" opacity="0.45" />
        <circle cx="230" cy="130" r="16" fill="#F09B7A" opacity="0.5" />
      </svg>

      {/* Right Swaying Peach Tree Branch */}
      <svg className="pn-branch pn-branch-right" viewBox="0 0 320 260" fill="none">
        <path d="M 330 -10 C 240 50, 160 40, 90 120 C 60 155, 40 190, 20 230" stroke="#2B3E34" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.35" />
        <path d="M 140 40 C 120 30, 90 35, 75 55 C 95 65, 125 60, 140 40 Z" fill="#2E4B3D" opacity="0.4" />
        <path d="M 90 110 C 65 100, 35 105, 20 125 C 40 135, 70 130, 90 110 Z" fill="#3D5A4C" opacity="0.35" />
        <path d="M 50 180 C 30 170, 5 175, -5 195 C 15 205, 40 200, 50 180 Z" fill="#2E4B3D" opacity="0.35" />
        <circle cx="110" cy="80" r="15" fill="#E88B68" opacity="0.45" />
        <circle cx="65" cy="150" r="13" fill="#F09B7A" opacity="0.45" />
      </svg>

      <div className="pn-stage">
        {/* EXACT PEACH NETWORK LOGO VECTOR */}
        <svg className="pn-logo-svg" viewBox="0 0 600 240" fill="none">
          {/* P and E: Slide in from Left */}
          <g className="pn-slide-left">
            {/* P */}
            <path d="M 40 40 L 105 40 C 130 40 145 52 145 78 C 145 104 130 116 105 116 L 68 116 L 68 190 C 58 190 48 192 40 195 Z M 68 64 L 68 92 L 102 92 C 114 92 121 86 121 78 C 121 70 114 64 102 64 Z" fill="#18221D" />
            {/* E */}
            <path d="M 152 40 L 210 40 L 210 65 L 180 65 L 180 102 L 206 102 L 206 126 L 180 126 L 180 162 L 212 162 L 212 187 C 192 187 170 188 152 190 Z" fill="#18221D" />
          </g>

          {/* A: Dark Top Cap & Right Slanted Leg */}
          <g className="pn-drop-cap">
            <path d="M 235 40 L 275 40 L 295 186 C 275 186 260 186 248 186 L 243 148 L 235 148 Z" fill="#18221D" />
          </g>

          {/* A: 4 Peach Steps Whipping in from Left */}
          <g>
            <rect className="pn-step pn-step-1" x="226" y="65" width="38" height="24" rx="1" fill="#E88B68" />
            <rect className="pn-step pn-step-2" x="221" y="93" width="46" height="24" rx="1" fill="#E88B68" />
            <rect className="pn-step pn-step-3" x="216" y="121" width="38" height="24" rx="1" fill="#E88B68" />
            <rect className="pn-step pn-step-4" x="214" y="149" width="28" height="25" rx="1" fill="#E88B68" />
          </g>

          {/* C and H: Slide in from Right */}
          <g className="pn-slide-right">
            {/* C */}
            <path d="M 360 40 C 330 40 305 60 305 113 C 305 166 330 186 360 186 C 374 186 388 182 396 176 L 396 150 C 388 156 376 160 364 160 C 344 160 332 144 332 113 C 332 82 344 66 364 66 C 376 66 388 70 396 76 L 396 50 C 388 44 374 40 360 40 Z" fill="#18221D" />
            {/* H */}
            <path d="M 405 40 L 432 40 L 432 100 L 468 100 L 468 40 L 495 40 L 495 195 C 487 192 478 190 468 190 L 468 126 L 432 126 L 432 189 C 422 188 413 188 405 189 Z" fill="#18221D" />
          </g>

          {/* NETWORK (Sage Green) */}
          <g className="pn-network-text">
            <text x="50%" y="228" textAnchor="middle" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontSize="28" fontWeight="800" letterSpacing="0.48em" fill="#6B8576">
              NETWORK
            </text>
          </g>
        </svg>

        {/* Tagline */}
        <div className="pn-tagline-text">Good ideas find good people.</div>

        {/* Minimalist Studio Loader */}
        <div className="pn-loader-wrap">
          <div className="pn-loader-track">
            <div className="pn-loader-fill" />
          </div>
          <div className="pn-loader-label">Loading...</div>
        </div>
      </div>
    </div>
  );
}
