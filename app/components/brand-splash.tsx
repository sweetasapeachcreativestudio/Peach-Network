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

  // Hold for 3.6s, then fade out smoothly into the app
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
            radial-gradient(at 15% 15%, rgba(232, 139, 104, 0.16) 0px, transparent 55%),
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

        /* Floating Faded Peaches Background */
        .pn-peach-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .pn-faded-shape {
          position: absolute;
          fill: none;
          stroke: #E88B68;
          stroke-width: 2.2;
          opacity: 0.12;
          filter: blur(1px);
        }

        .p-pos-1 { top: 10%; left: 8%; width: 130px; height: 130px; animation: floatAnim1 14s ease-in-out infinite alternate; }
        .p-pos-2 { top: 68%; left: 10%; width: 90px; height: 90px; animation: floatAnim2 18s ease-in-out infinite alternate; }
        .p-pos-3 { top: 14%; right: 9%; width: 150px; height: 150px; animation: floatAnim3 16s ease-in-out infinite alternate; }
        .p-pos-4 { top: 72%; right: 12%; width: 105px; height: 105px; animation: floatAnim1 19s ease-in-out infinite alternate-reverse; }
        .p-pos-5 { top: 45%; left: 46%; width: 210px; height: 210px; opacity: 0.05; filter: blur(2.5px); animation: floatAnim2 22s ease-in-out infinite alternate; }

        @keyframes floatAnim1 {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-26px) rotate(8deg) scale(1.04); }
          100% { transform: translateY(14px) rotate(-6deg) scale(0.96); }
        }
        @keyframes floatAnim2 {
          0% { transform: translateY(0) rotate(0deg) scale(0.95); }
          50% { transform: translateY(22px) rotate(-10deg) scale(1.04); }
          100% { transform: translateY(-18px) rotate(6deg) scale(1); }
        }
        @keyframes floatAnim3 {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-35px) rotate(-12deg); }
          100% { transform: translateY(18px) rotate(8deg); }
        }

        /* Ambient soft lighting */
        .pn-glow {
          position: absolute;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(232, 139, 104, 0.22) 0%, rgba(250, 246, 240, 0) 70%);
          border-radius: 50%;
          filter: blur(50px);
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

        /* The Exact Logo Image */
        .pn-logo-container {
          position: relative;
          display: inline-block;
          opacity: 0;
          transform: translateY(10px) scale(0.95);
          animation: logoSmoothIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.2s;
          filter: drop-shadow(0 14px 28px rgba(24, 34, 29, 0.08));
        }

        .pn-logo-img {
          display: block;
          max-width: min(520px, 88vw);
          height: auto;
          object-fit: contain;
        }

        @keyframes logoSmoothIn {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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
          animation: fadeTagline 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.9s;
          text-align: center;
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
          animation: fadePill 0.75s ease forwards 1.1s;
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

      {/* Background Floating Faded Peaches */}
      <div className="pn-peach-bg">
        <svg className="pn-faded-shape p-pos-1" viewBox="0 0 100 100">
          <path d="M50 20 C 35 20, 20 30, 20 50 C 20 70, 35 85, 50 85 C 65 85, 80 70, 80 50 C 80 30, 65 20, 50 20 Z" />
          <path d="M50 20 C 50 35, 48 55, 40 65" strokeLinecap="round" />
          <path d="M50 20 C 55 10, 70 8, 75 14 C 76 22, 65 28, 55 24 Z" fill="rgba(46, 75, 61, 0.18)" stroke="none" />
        </svg>

        <svg className="pn-faded-shape p-pos-2" viewBox="0 0 100 100">
          <path d="M50 20 C 35 20, 20 30, 20 50 C 20 70, 35 85, 50 85 C 65 85, 80 70, 80 50 C 80 30, 65 20, 50 20 Z" />
          <path d="M50 20 C 50 35, 48 55, 40 65" strokeLinecap="round" />
        </svg>

        <svg className="pn-faded-shape p-pos-3" viewBox="0 0 100 100">
          <path d="M50 20 C 35 20, 20 30, 20 50 C 20 70, 35 85, 50 85 C 65 85, 80 70, 80 50 C 80 30, 65 20, 50 20 Z" />
          <path d="M50 20 C 55 10, 70 8, 75 14 C 76 22, 65 28, 55 24 Z" fill="rgba(46, 75, 61, 0.18)" stroke="none" />
        </svg>

        <svg className="pn-faded-shape p-pos-4" viewBox="0 0 100 100">
          <path d="M50 20 C 35 20, 20 30, 20 50 C 20 70, 35 85, 50 85 C 65 85, 80 70, 80 50 C 80 30, 65 20, 50 20 Z" />
        </svg>

        <svg className="pn-faded-shape p-pos-5" viewBox="0 0 100 100">
          <path d="M50 20 C 35 20, 20 30, 20 50 C 20 70, 35 85, 50 85 C 65 85, 80 70, 80 50 C 80 30, 65 20, 50 20 Z" />
        </svg>
      </div>

      <div className="pn-lockup">
        {/* YOUR EXACT LOGO IMAGE FILE */}
        <div className="pn-logo-container">
          <img
            src="/peach-app-logo.png"
            alt="Peach Network"
            className="pn-logo-img"
          />
        </div>

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
