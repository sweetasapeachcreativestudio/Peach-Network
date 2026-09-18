"use client";

import React, { useEffect, useState } from "react";

const SCROLLING_TEXTS = [
  "Grabbing our MacBooks...",
  "Cleaning our iPads...",
  "Feeding our creatives...",
  "Brewing the sweet tea...",
];

export default function BrandSplash() {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [textFade, setTextFade] = useState(false);

  // Cycle the quirky phrases every 1.5s
  useEffect(() => {
    const textTimer = setInterval(() => {
      setTextFade(true);
      setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % SCROLLING_TEXTS.length);
        setTextFade(false);
      }, 250);
    }, 1500);

    return () => clearInterval(textTimer);
  }, []);

  // Hold for 4.2s, then smooth fade exit into the app
  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 4200);
    const removeTimer = setTimeout(() => setShow(false), 4900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`pn-cinematic-viewport ${fading ? "pn-splash-exit" : ""}`} aria-hidden="true">
      <style>{`
        .pn-cinematic-viewport {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #FDF0E7 0%, #F9DDD0 55%, #F4C7B5 100%);
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

        /* Twinkling Magical Sparkles */
        .pn-sparkle {
          position: absolute;
          color: #FFFFFF;
          font-size: 16px;
          opacity: 0;
          pointer-events: none;
          animation: pnTwinkle 3.5s ease-in-out infinite;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.9), 0 0 20px rgba(232, 139, 104, 0.7);
          z-index: 3;
        }
        .pn-sp-1 { top: 18%; right: 24%; font-size: 24px; animation-delay: 0.2s; }
        .pn-sp-2 { top: 36%; left: 16%; font-size: 15px; animation-delay: 1.4s; }
        .pn-sp-3 { top: 46%; right: 18%; font-size: 20px; animation-delay: 0.8s; }
        .pn-sp-4 { top: 60%; left: 22%; font-size: 16px; animation-delay: 2.1s; }

        @keyframes pnTwinkle {
          0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
          50% { opacity: 0.95; transform: scale(1.25) rotate(45deg); }
        }

        /* Ambient glowing halo */
        .pn-warm-halo {
          position: absolute;
          width: 540px;
          height: 540px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(232, 139, 104, 0.22) 40%, rgba(253, 240, 231, 0) 70%);
          border-radius: 50%;
          filter: blur(50px);
          pointer-events: none;
          animation: pnHaloPulse 5s ease-in-out infinite alternate;
        }

        @keyframes pnHaloPulse {
          0% { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.18); opacity: 1; }
        }

        /* Central Stage - Elevated to balance bottom peaches */
        .pn-stage {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-top: -50px;
        }

        /* Dynamic Logo with Spring Entrance & Continuous Float */
        .pn-logo-wrap {
          position: relative;
          display: inline-block;
          filter: drop-shadow(0 18px 34px rgba(24, 34, 29, 0.12));
          animation: 
            pnLogoSpring 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.2s,
            pnLogoFloat 4s ease-in-out infinite 1.2s;
          opacity: 0;
          transform: translateY(20px) scale(0.85);
        }

        @keyframes pnLogoSpring {
          0% { opacity: 0; transform: translateY(30px) scale(0.82); }
          70% { transform: translateY(-6px) scale(1.04); opacity: 1; }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes pnLogoFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }

        .pn-logo-img {
          display: block;
          width: min(580px, 88vw);
          height: auto;
          object-fit: contain;
        }

        /* Shimmer beam across logo */
        .pn-logo-wrap::after {
          content: "";
          position: absolute;
          top: 0;
          left: -140%;
          width: 80%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.65),
            rgba(255, 185, 150, 0.4),
            transparent
          );
          transform: skewX(-25deg);
          animation: pnGlint 1.8s ease-out forwards 0.85s;
          pointer-events: none;
        }

        @keyframes pnGlint {
          0% { left: -140%; }
          100% { left: 250%; }
        }

        /* Single Line Tagline - Tight Proximity to Logo */
        .pn-tagline-single {
          margin-top: 14px;
          font-family: Georgia, "Playfair Display", serif;
          font-style: italic;
          font-size: clamp(20px, 4vw, 26px);
          color: #24352C;
          letter-spacing: 0.01em;
          white-space: nowrap;
          opacity: 0;
          transform: translateY(8px);
          animation: pnFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.65s;
        }

        /* Moving Words - Bigger & Moved Closer Up */
        .pn-scroller-capsule {
          margin-top: 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 28px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(232, 139, 104, 0.38);
          border-radius: 99px;
          box-shadow: 0 6px 24px rgba(232, 139, 104, 0.18);
          opacity: 0;
          transform: translateY(8px);
          animation: pnFadeIn 0.8s ease forwards 0.85s;
        }

        .pn-scroller-pip {
          width: 9px;
          height: 9px;
          background: #E85D3F;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(232, 93, 63, 0.7);
          animation: pnPipBlink 1.4s ease-in-out infinite;
        }

        @keyframes pnPipBlink {
          0%, 100% { transform: scale(0.9); opacity: 0.45; }
          50% { transform: scale(1.35); opacity: 1; }
        }

        .pn-scroller-label {
          font-size: clamp(15px, 3vw, 17px);
          font-weight: 700;
          color: #3C2E28;
          letter-spacing: 0.02em;
          min-width: 250px;
          text-align: center;
          transition: opacity 0.25s ease, transform 0.25s ease;
          opacity: 1;
          transform: translateY(0);
        }

        .pn-scroller-label.pn-hidden {
          opacity: 0;
          transform: translateY(-5px);
        }

        /* Powered By Subtitle */
        .pn-powered {
          margin-top: 14px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #6B8576;
          opacity: 0;
          animation: pnFadeIn 0.8s ease forwards 1.05s;
        }

        @keyframes pnFadeIn {
          to { opacity: 0.95; transform: translateY(0); }
        }

        /* Bottom Peaches Composition */
        .pn-bottom-peaches {
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: min(880px, 100vw);
          height: 250px;
          pointer-events: none;
          z-index: 2;
        }
      `}</style>

      {/* Warm sunlight halo */}
      <div className="pn-warm-halo" />

      {/* Floating Sparkles */}
      <div className="pn-sparkle pn-sp-1">✦</div>
      <div className="pn-sparkle pn-sp-2">✦</div>
      <div className="pn-sparkle pn-sp-3">✦</div>
      <div className="pn-sparkle pn-sp-4">✦</div>

      <div className="pn-stage">
        {/* Dynamic Logo with Spring Entrance & Light Shimmer */}
        <div className="pn-logo-wrap">
          <img
            src="/peach-app-logo.png"
            alt="Peach Network"
            className="pn-logo-img"
          />
        </div>

        {/* Tagline in ONE Single Line - Close to Logo */}
        <div className="pn-tagline-single">Good ideas find good people.</div>

        {/* Bigger, Closer Scrolling Words */}
        <div className="pn-scroller-capsule">
          <span className="pn-scroller-pip" />
          <span className={`pn-scroller-label ${textFade ? "pn-hidden" : ""}`}>
            {SCROLLING_TEXTS[textIndex]}
          </span>
        </div>

        {/* Powered By Sweet As A Peach Creative Agency */}
        <div className="pn-powered">
          Powered by Sweet As A Peach Creative Agency
        </div>
      </div>

      {/* Peaches at the Bottom (Matching Your Reference Image) */}
      <svg className="pn-bottom-peaches" viewBox="0 0 900 280" fill="none">
        <defs>
          <radialGradient id="peachSkin" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFA07A" />
            <stop offset="45%" stopColor="#FA8072" />
            <stop offset="85%" stopColor="#E85D3F" />
            <stop offset="100%" stopColor="#B83A20" />
          </radialGradient>
          <radialGradient id="peachFlesh" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD194" />
            <stop offset="50%" stopColor="#FFA751" />
            <stop offset="85%" stopColor="#E86E38" />
            <stop offset="100%" stopColor="#C44D25" />
          </radialGradient>
          <radialGradient id="peachPit" cx="45%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#9C3B00" />
            <stop offset="70%" stopColor="#6E2C00" />
            <stop offset="100%" stopColor="#3E1A00" />
          </radialGradient>
          <linearGradient id="leafGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#558B2F" />
            <stop offset="50%" stopColor="#2E7D32" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
        </defs>

        {/* Background Soft Peach Halos */}
        <circle cx="120" cy="220" r="110" fill="url(#peachSkin)" opacity="0.8" />
        <circle cx="780" cy="230" r="120" fill="url(#peachSkin)" opacity="0.8" />

        {/* Orchard Green Leaves Framing */}
        <path d="M 160 180 C 130 110, 200 60, 260 80 C 230 130, 210 170, 160 180 Z" fill="url(#leafGreen)" />
        <path d="M 160 180 Q 210 120 260 80" stroke="#7CB342" strokeWidth="2" fill="none" opacity="0.7" />
        <path d="M 230 140 C 280 110, 340 140, 360 190 C 310 190, 260 170, 230 140 Z" fill="url(#leafGreen)" />

        <path d="M 740 190 C 770 120, 700 70, 640 90 C 670 140, 690 180, 740 190 Z" fill="url(#leafGreen)" />
        <path d="M 670 150 C 620 120, 560 150, 540 200 C 590 200, 640 180, 670 150 Z" fill="url(#leafGreen)" />

        {/* Center-Left Whole Peach */}
        <circle cx="280" cy="220" r="95" fill="url(#peachSkin)" />
        <path d="M 280 125 C 290 160, 275 210, 255 260" stroke="#B83A20" strokeWidth="4" strokeLinecap="round" opacity="0.55" />

        {/* Center Sliced Peach Half */}
        <g transform="translate(450, 210) rotate(-10)">
          <ellipse cx="0" cy="0" rx="98" ry="92" fill="#E85D3F" />
          <ellipse cx="-1" cy="1" rx="90" ry="84" fill="url(#peachFlesh)" />
          <path d="M 0 -70 Q 0 0 -50 -40 M 0 -70 Q 0 0 50 -40 M -65 0 Q 0 0 -45 50 M 65 0 Q 0 0 45 50" stroke="#FFE082" strokeWidth="2.5" opacity="0.45" strokeLinecap="round" />
          <ellipse cx="0" cy="2" rx="36" ry="42" fill="url(#peachPit)" />
          <ellipse cx="0" cy="2" rx="28" ry="34" fill="#4A1E05" opacity="0.8" />
          <path d="M -8 -15 Q 0 0 -6 18 M 8 -15 Q 0 0 6 18" stroke="#8D3800" strokeWidth="2.5" fill="none" opacity="0.7" />
        </g>

        {/* Center-Right Whole Peach */}
        <circle cx="620" cy="230" r="90" fill="url(#peachSkin)" />
        <path d="M 620 140 C 610 170, 625 220, 640 270" stroke="#B83A20" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
      </svg>
    </div>
  );
}
