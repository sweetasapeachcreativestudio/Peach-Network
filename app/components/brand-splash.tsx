"use client";

import React, { useEffect, useState } from "react";

const SCROLLING_TEXTS = [
  "Grabbing our MacBooks...",
  "Cleaning our iPads...",
  "Feeding our creatives...",
];

export default function BrandSplash() {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [textFade, setTextFade] = useState(false);

  // Cycle the 3 exact phrases every 1.4s
  useEffect(() => {
    const textTimer = setInterval(() => {
      setTextFade(true);
      setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % SCROLLING_TEXTS.length);
        setTextFade(false);
      }, 200);
    }, 1400);

    return () => clearInterval(textTimer);
  }, []);

  // Hold for 3.6s, then fade out smoothly
  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 3600);
    const removeTimer = setTimeout(() => setShow(false), 4200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`pn-splash-root ${fading ? "pn-splash-exit" : ""}`} aria-hidden="true">
      <style>{`
        .pn-splash-root {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #FAF6F0;
          background-image: 
            radial-gradient(at 15% 15%, rgba(232, 139, 104, 0.14) 0px, transparent 55%),
            radial-gradient(at 85% 85%, rgba(24, 34, 29, 0.08) 0px, transparent 55%);
          padding: 24px;
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 1;
          transform: scale(1);
          pointer-events: auto;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          overflow: hidden;
        }

        .pn-splash-exit {
          opacity: 0;
          transform: scale(1.02);
          pointer-events: none;
        }

        /* Ambient soft lighting */
        .pn-glow {
          position: absolute;
          width: 440px;
          height: 440px;
          background: radial-gradient(circle, rgba(232, 139, 104, 0.2) 0%, rgba(250, 246, 240, 0) 70%);
          border-radius: 50%;
          filter: blur(45px);
          pointer-events: none;
        }

        .pn-lockup {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* The Main PEACH Wordmark */
        .pn-wordmark {
          display: flex;
          align-items: baseline;
          justify-content: center;
          font-size: clamp(54px, 13vw, 76px);
          font-weight: 900;
          color: #18221D;
          line-height: 1;
          letter-spacing: -0.02em;
          filter: drop-shadow(0 12px 24px rgba(24, 34, 29, 0.08));
        }

        /* PE and CH sliding in from opposite sides */
        .pn-slide-pe {
          display: inline-block;
          animation: slidePeIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .pn-slide-ch {
          display: inline-block;
          animation: slideChIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slidePeIn {
          0% { transform: translateX(-60px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideChIn {
          0% { transform: translateX(60px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        /* The Exact Stylized 'A' Glyph */
        .pn-glyph-a {
          display: inline-block;
          height: 0.88em;
          width: 0.88em;
          vertical-align: -0.04em;
          margin: 0 -0.02em;
          position: relative;
        }

        .pn-a-svg {
          width: 100%;
          height: 100%;
          display: block;
          overflow: visible;
        }

        /* The Dark Pillar dropping down */
        .pn-a-pillar {
          animation: pillarDrop 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.15s;
        }

        @keyframes pillarDrop {
          0% { transform: translateY(-25px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        /* The 4 Peach Stepped Lines Whipping into the A */
        .pn-bar {
          opacity: 0;
          animation: whipBar 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }

        .pn-bar-1 { animation-delay: 0.45s; }
        .pn-bar-2 { animation-delay: 0.58s; }
        .pn-bar-3 { animation-delay: 0.71s; }
        .pn-bar-4 { animation-delay: 0.84s; }

        @keyframes whipBar {
          0% {
            transform: translateX(-50px) skewX(-20deg);
            opacity: 0;
          }
          40% { opacity: 1; }
          100% {
            transform: translateX(0) skewX(0);
            opacity: 1;
          }
        }

        /* NETWORK Subtitle */
        .pn-network {
          margin-top: 10px;
          font-size: clamp(14px, 3.2vw, 19px);
          font-weight: 800;
          letter-spacing: 0.52em;
          margin-left: 0.52em;
          color: #6B8576;
          opacity: 0;
          transform: translateY(6px);
          animation: fadeNetwork 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.95s;
        }

        @keyframes fadeNetwork {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Editorial Tagline */
        .pn-tagline {
          margin-top: 24px;
          font-family: Georgia, serif;
          font-style: italic;
          font-size: 18px;
          color: #2B3D33;
          opacity: 0;
          transform: translateY(8px);
          animation: fadeTagline 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards 1.1s;
        }

        @keyframes fadeTagline {
          to {
            opacity: 0.95;
            transform: translateY(0);
          }
        }

        /* Quirky Scrolling Text Area */
        .pn-scroller-wrap {
          margin-top: 32px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 22px;
          background: rgba(253, 251, 247, 0.9);
          border: 1px solid rgba(232, 139, 104, 0.28);
          border-radius: 99px;
          box-shadow: 0 4px 14px rgba(44, 36, 32, 0.04);
          opacity: 0;
          animation: fadePill 0.75s ease forwards 1.25s;
        }

        @keyframes fadePill {
          to { opacity: 1; }
        }

        .pn-scroller-dot {
          width: 7px;
          height: 7px;
          background-color: #E88B68;
          border-radius: 50%;
          animation: dotBlink 1.4s ease-in-out infinite;
        }

        @keyframes dotBlink {
          0%, 100% { transform: scale(0.85); opacity: 0.4; }
          50% { transform: scale(1.3); opacity: 1; }
        }

        .pn-scroller-text {
          font-size: 13px;
          font-weight: 600;
          color: #4A3E38;
          letter-spacing: 0.02em;
          min-width: 210px;
          text-align: center;
          transition: opacity 0.2s ease, transform 0.2s ease;
          opacity: 1;
          transform: translateY(0);
        }

        .pn-scroller-text.pn-hide {
          opacity: 0;
          transform: translateY(-5px);
        }
      `}</style>

      {/* Ambient warm glow */}
      <div className="pn-glow" />

      <div className="pn-lockup">
        {/* Wordmark Assembly */}
        <div className="pn-wordmark">
          {/* PE slides in from left */}
          <span className="pn-slide-pe">PE</span>

          {/* Exact Logo A */}
          <span className="pn-glyph-a">
            <svg className="pn-a-svg" viewBox="0 0 100 100" fill="none">
              {/* Dark Right Pillar & Top Cap */}
              <path
                className="pn-a-pillar"
                d="M 12 0 L 100 0 L 100 100 L 64 100 L 52 35 L 12 35 Z"
                fill="#18221D"
              />

              {/* The 4 Exact Horizontal Peach Bars from your logo */}
              <rect className="pn-bar pn-bar-1" x="6" y="39" width="46" height="12" fill="#E88B68" />
              <rect className="pn-bar pn-bar-2" x="4" y="54" width="60" height="12" fill="#E88B68" />
              <rect className="pn-bar pn-bar-3" x="2" y="69" width="48" height="12" fill="#E88B68" />
              <rect className="pn-bar pn-bar-4" x="0" y="84" width="36" height="14" fill="#E88B68" />
            </svg>
          </span>

          {/* CH slides in from right */}
          <span className="pn-slide-ch">CH</span>
        </div>

        {/* NETWORK in Sage Green */}
        <div className="pn-network">NETWORK</div>

        {/* Editorial Tagline */}
        <div className="pn-tagline">Good ideas find good people.</div>

        {/* Scrolling Quirky Creative Lines */}
        <div className="pn-scroller-wrap">
          <span className="pn-scroller-dot" />
          <span className={`pn-scroller-text ${textFade ? "pn-hide" : ""}`}>
            {SCROLLING_TEXTS[textIndex]}
          </span>
        </div>
      </div>
    </div>
  );
}
