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
    <div className={`pn-splash-viewport ${fading ? "pn-splash-exit" : ""}`} aria-hidden="true">
      <style>{`
        .pn-splash-viewport {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #FAF6F0;
          background-image: 
            radial-gradient(at 20% 20%, rgba(232, 93, 63, 0.08) 0px, transparent 50%),
            radial-gradient(at 80% 80%, rgba(22, 46, 34, 0.07) 0px, transparent 50%);
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

        /* Ambient studio lighting halo */
        .pn-halo-glow {
          position: absolute;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(232, 93, 63, 0.16) 0%, rgba(255, 123, 84, 0.07) 45%, rgba(250, 246, 240, 0) 70%);
          border-radius: 50%;
          filter: blur(40px);
          pointer-events: none;
          animation: pnHaloPulse 4s ease-in-out infinite alternate;
        }

        @keyframes pnHaloPulse {
          0% { transform: scale(0.85); opacity: 0.6; }
          100% { transform: scale(1.15); opacity: 1; }
        }

        .pn-stage {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* Wordmark Row */
        .pn-wordmark-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 48px;
          font-weight: 900;
          letter-spacing: 0.16em;
          color: #162E22;
          position: relative;
        }

        /* Letters with optical blur release */
        .pn-glyph {
          display: inline-block;
          opacity: 0;
          filter: blur(6px);
          transform: translateY(10px) scale(0.95);
          animation: pnGlyphSnap 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .pn-glyph-p { animation-delay: 0.8s; }
        .pn-glyph-e { animation-delay: 0.88s; }
        .pn-glyph-c { animation-delay: 0.88s; }
        .pn-glyph-h { animation-delay: 0.8s; }

        @keyframes pnGlyphSnap {
          to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0) scale(1);
          }
        }

        /* The Stylized 'A' Epicenter */
        .pn-epicenter-a {
          position: relative;
          width: 50px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pn-a-vector {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        /* Kinetic whipping legs */
        .pn-whip-leg {
          stroke: #162E22;
          stroke-width: 5.2;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 110;
          stroke-dashoffset: 110;
          animation: pnLegDraw 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .pn-whip-leg-l { animation-delay: 0.15s; }
        .pn-whip-leg-r { animation-delay: 0.28s; }

        @keyframes pnLegDraw {
          0% { stroke-dashoffset: 110; opacity: 0; }
          25% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }

        /* Dynamic crossbar slices with velocity skew */
        .pn-slice-strand {
          stroke-linecap: round;
          stroke-dasharray: 70;
          stroke-dashoffset: 70;
          animation: pnSliceWhip 0.75s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }

        .pn-slice-1 { stroke: #E85D3F; stroke-width: 4.2; animation-delay: 0.48s; }
        .pn-slice-2 { stroke: #FF7B54; stroke-width: 3.5; animation-delay: 0.6s; }
        .pn-slice-3 { stroke: #FFA07A; stroke-width: 2.8; animation-delay: 0.72s; }

        @keyframes pnSliceWhip {
          0% {
            stroke-dashoffset: 70;
            transform: translateX(-22px) skewX(-26deg);
            opacity: 0;
          }
          45% { opacity: 1; }
          100% {
            stroke-dashoffset: 0;
            transform: translateX(0) skewX(0);
            opacity: 1;
          }
        }

        /* Central shockwave ripple when the A snaps */
        .pn-shockwave {
          position: absolute;
          width: 18px;
          height: 18px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 2px solid #E85D3F;
          opacity: 0;
          pointer-events: none;
          animation: pnShockwaveBurst 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.85s;
        }

        @keyframes pnShockwaveBurst {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0.95; }
          50% { opacity: 0.4; }
          100% { transform: translate(-50%, -50%) scale(6.5); opacity: 0; }
        }

        .pn-crown-dot {
          fill: #E85D3F;
          transform-origin: 25px 8px;
          animation: pnCrownSnap 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.82s;
          opacity: 0;
        }

        @keyframes pnCrownSnap {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.45); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* Cinematic tracking subtitle */
        .pn-cinema-sub {
          margin-top: 10px;
          font-size: 13px;
          font-weight: 800;
          color: #E85D3F;
          opacity: 0;
          transform: translateY(6px);
          letter-spacing: 0.2em;
          animation: pnTrackOut 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards 1.05s;
        }

        @keyframes pnTrackOut {
          to {
            opacity: 1;
            transform: translateY(0);
            letter-spacing: 0.58em;
            margin-left: 0.58em;
          }
        }

        /* Editorial Tagline */
        .pn-tagline-text {
          margin-top: 36px;
          font-family: Georgia, "Playfair Display", serif;
          font-style: italic;
          font-size: 18px;
          color: #2E4B3D;
          opacity: 0;
          transform: translateY(12px);
          animation: pnTaglineUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards 1.35s;
          text-align: center;
        }

        @keyframes pnTaglineUp {
          to {
            opacity: 0.95;
            transform: translateY(0);
          }
        }

        /* Hairline Luxury Progress Loader */
        .pn-loader-container {
          margin-top: 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          opacity: 0;
          animation: pnLoaderIn 0.7s ease forwards 1.55s;
        }

        @keyframes pnLoaderIn {
          to { opacity: 1; }
        }

        .pn-hairline-track {
          width: 160px;
          height: 3px;
          background: #EFE6DC;
          border-radius: 99px;
          overflow: hidden;
          position: relative;
        }

        .pn-hairline-fill {
          height: 100%;
          background: linear-gradient(90deg, #E85D3F, #FF7B54);
          border-radius: 99px;
          position: absolute;
          animation: pnHairlineSlide 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }

        @keyframes pnHairlineSlide {
          0% { left: -40%; width: 25%; }
          50% { left: 35%; width: 50%; }
          100% { left: 100%; width: 25%; }
        }

        .pn-status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #9B8E85;
        }

        .pn-pulsing-pip {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #E85D3F;
          animation: pnPipPulse 1.4s ease-in-out infinite;
        }

        @keyframes pnPipPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.25); }
        }
      `}</style>

      {/* Ambient background studio glow */}
      <div className="pn-halo-glow" />

      <div className="pn-stage">
        {/* Wordmark Row */}
        <div className="pn-wordmark-row">
          <span className="pn-glyph pn-glyph-p">P</span>
          <span className="pn-glyph pn-glyph-e">E</span>

          {/* Dynamic Whipping 'A' with Shockwave */}
          <div className="pn-epicenter-a">
            <svg className="pn-a-vector" viewBox="0 0 50 60">
              <path className="pn-whip-leg pn-whip-leg-l" d="M 25 7 L 7 53" fill="none" />
              <path className="pn-whip-leg pn-whip-leg-r" d="M 25 7 L 43 53" fill="none" />
              <path className="pn-slice-strand pn-slice-1" d="M 13 37 L 37 37" fill="none" />
              <path className="pn-slice-strand pn-slice-2" d="M 17 28 L 33 28" fill="none" />
              <path className="pn-slice-strand pn-slice-3" d="M 21 20 L 29 20" fill="none" />
              <circle className="pn-crown-dot" cx="25" cy="8" r="3.2" />
            </svg>
            <div className="pn-shockwave" />
          </div>

          <span className="pn-glyph pn-glyph-c">C</span>
          <span className="pn-glyph pn-glyph-h">H</span>
        </div>

        {/* Cinematic Expanded Subtitle */}
        <div className="pn-cinema-sub">NETWORK</div>

        {/* Editorial Italic Tagline */}
        <p className="pn-tagline-text">Good ideas find good people.</p>

        {/* Minimalist Studio Loader */}
        <div className="pn-loader-container">
          <div className="pn-hairline-track">
            <div className="pn-hairline-fill" />
          </div>
          <div className="pn-status-badge">
            <span className="pn-pulsing-pip" />
            <span>Curating Talent</span>
          </div>
        </div>
      </div>
    </div>
  );
}
