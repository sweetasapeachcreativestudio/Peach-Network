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

  // Cycle the status text every 1.5s
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

  // Show splash for 4.2s, then smooth fade exit into app
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
          /* Uses your photo with fallback matching warm peach tone */
          background-color: #F7DDD2;
          background-image: url('/peach-splash-bg.png');
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
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

        /* Subtle soft warm radial bloom in the center behind the logo */
        .pn-center-glow {
          position: absolute;
          width: min(650px, 92vw);
          height: min(650px, 92vw);
          background: radial-gradient(circle, rgba(255, 255, 255, 0.55) 0%, rgba(247, 221, 210, 0.35) 45%, transparent 75%);
          border-radius: 50%;
          filter: blur(40px);
          pointer-events: none;
          z-index: 2;
        }

        /* Twinkling Magical Sparkles drifting in the light */
        .pn-sparkle {
          position: absolute;
          color: #FFFFFF;
          pointer-events: none;
          animation: pnTwinkle 3.6s ease-in-out infinite;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.95), 0 0 20px rgba(232, 139, 104, 0.75);
          z-index: 3;
        }
        .pn-sp-1 { top: 22%; right: 26%; font-size: 24px; animation-delay: 0.2s; }
        .pn-sp-2 { top: 38%; left: 20%; font-size: 16px; animation-delay: 1.4s; }
        .pn-sp-3 { top: 48%; right: 22%; font-size: 20px; animation-delay: 0.8s; }
        .pn-sp-4 { top: 62%; left: 25%; font-size: 15px; animation-delay: 2.1s; }

        @keyframes pnTwinkle {
          0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
          50% { opacity: 0.95; transform: scale(1.25) rotate(45deg); }
        }

        /* Perfectly Centered Stage Area */
        .pn-stage {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          /* Balanced slightly above the desk items */
          margin-top: -30px;
        }

        /* Dynamic Spring Entrance & Float */
        .pn-logo-wrap {
          position: relative;
          display: inline-block;
          filter: drop-shadow(0 18px 30px rgba(24, 34, 29, 0.15));
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
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }

        .pn-logo-img {
          display: block;
          width: min(540px, 86vw);
          height: auto;
          object-fit: contain;
        }

        /* Golden shimmer beam passing across logo */
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
            rgba(255, 255, 255, 0.75),
            rgba(255, 205, 175, 0.45),
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

        /* Tagline in ONE Single Line - Close to Logo */
        .pn-tagline-single {
          margin-top: 14px;
          font-family: Georgia, "Playfair Display", serif;
          font-style: italic;
          font-size: clamp(20px, 3.8vw, 26px);
          color: #24352C;
          letter-spacing: 0.01em;
          white-space: nowrap;
          text-shadow: 0 2px 10px rgba(255, 255, 255, 0.85);
          opacity: 0;
          transform: translateY(8px);
          animation: pnFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.65s;
        }

        /* Frosted Glass Scroller Capsule */
        .pn-scroller-capsule {
          margin-top: 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 28px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1.5px solid rgba(232, 139, 104, 0.35);
          border-radius: 99px;
          box-shadow: 0 8px 26px rgba(24, 34, 29, 0.1);
          opacity: 0;
          transform: translateY(8px);
          animation: pnFadeIn 0.8s ease forwards 0.85s;
        }

        .pn-scroller-pip {
          width: 9px;
          height: 9px;
          background: #E85D3F;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(232, 93, 63, 0.8);
          animation: pnPipBlink 1.4s ease-in-out infinite;
        }

        @keyframes pnPipBlink {
          0%, 100% { transform: scale(0.9); opacity: 0.45; }
          50% { transform: scale(1.35); opacity: 1; }
        }

        .pn-scroller-label {
          font-size: clamp(15px, 2.8vw, 17px);
          font-weight: 700;
          color: #2E221D;
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
          color: #4A6354;
          text-shadow: 0 1px 6px rgba(255, 255, 255, 0.8);
          opacity: 0;
          animation: pnFadeIn 0.8s ease forwards 1.05s;
        }

        @keyframes pnFadeIn {
          to { opacity: 0.95; transform: translateY(0); }
        }
      `}</style>

      {/* Center soft lighting bloom */}
      <div className="pn-center-glow" />

      {/* Floating Sparkles in sunlight */}
      <div className="pn-sparkle pn-sp-1">✦</div>
      <div className="pn-sparkle pn-sp-2">✦</div>
      <div className="pn-sparkle pn-sp-3">✦</div>
      <div className="pn-sparkle pn-sp-4">✦</div>

      {/* Centered Content Area */}
      <div className="pn-stage">
        {/* Dynamic Logo with Spring & Light Sweep */}
        <div className="pn-logo-wrap">
          <img
            src="/peach-app-logo.png"
            alt="Peach Network"
            className="pn-logo-img"
          />
        </div>

        {/* Tagline in ONE Single Line */}
        <div className="pn-tagline-single">Good ideas find good people.</div>

        {/* Status Scroller */}
        <div className="pn-scroller-capsule">
          <span className="pn-scroller-pip" />
          <span className={`pn-scroller-label ${textFade ? "pn-hidden" : ""}`}>
            {SCROLLING_TEXTS[textIndex]}
          </span>
        </div>

        {/* Powered By */}
        <div className="pn-powered">
          Powered by Sweet As A Peach Creative Agency
        </div>
      </div>
    </div>
  );
}
