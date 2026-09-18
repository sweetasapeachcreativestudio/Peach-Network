"use client";

import React, { useEffect, useState } from "react";

const PHRASES = [
  "Brewing the sweet tea...",
  "Grabbing our MacBooks...",
  "Sharpening our Apple Pencils...",
  "Finding our creative friends...",
  "Curating Southern magic...",
  "Warming up the canvas...",
];

export default function BrandSplash() {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [phraseFade, setPhraseFade] = useState(false);

  // Cycle quirky phrases every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseFade(true);
      setTimeout(() => {
        setPhraseIdx((prev) => (prev + 1) % PHRASES.length);
        setPhraseFade(false);
      }, 250);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Hold for 3.6s, then smooth fade exit
  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 3600);
    const removeTimer = setTimeout(() => setShow(false), 4300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`pn-viewport ${fading ? "pn-exit" : ""}`} aria-hidden="true">
      <style>{`
        .pn-viewport {
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
            radial-gradient(at 85% 85%, rgba(24, 34, 29, 0.09) 0px, transparent 55%);
          padding: 24px;
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 1;
          transform: scale(1);
          pointer-events: auto;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", sans-serif;
          overflow: hidden;
        }

        .pn-exit {
          opacity: 0;
          transform: scale(1.03);
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

        /* Ambient studio glow */
        .pn-halo {
          position: absolute;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(232, 139, 104, 0.22) 0%, rgba(255, 160, 122, 0.08) 50%, rgba(250, 246, 240, 0) 70%);
          border-radius: 50%;
          filter: blur(50px);
          pointer-events: none;
          animation: haloPulse 4s ease-in-out infinite alternate;
        }

        @keyframes haloPulse {
          0% { transform: scale(0.88); opacity: 0.55; }
          100% { transform: scale(1.15); opacity: 0.9; }
        }

        /* Center Stage */
        .pn-stage {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* The Wordmark Lockup */
        .pn-word-row {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 6px;
          font-size: clamp(52px, 12vw, 76px);
          font-weight: 900;
          line-height: 0.88;
          color: #18221D;
          font-family: -apple-system, BlinkMacSystemFont, "Arial Black", Impact, sans-serif;
          letter-spacing: -0.01em;
          filter: drop-shadow(0 14px 28px rgba(24, 34, 29, 0.09));
          opacity: 0;
          transform: translateY(12px) scale(0.94);
          animation: logoEntrance 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.25s;
        }

        @keyframes logoEntrance {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Arched baseline curve */
        .pn-c-p { transform: translateY(3px); }
        .pn-c-e { transform: translateY(0px); }
        .pn-c-c { transform: translateY(0px); }
        .pn-c-h { transform: translateY(3px); }

        /* The Custom Stylized 'A' */
        .pn-c-a {
          position: relative;
          width: clamp(56px, 13vw, 72px);
          height: clamp(60px, 14vw, 78px);
          display: flex;
          align-items: flex-end;
          margin: 0 2px;
        }

        .pn-a-svg-inner {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        /* Network Subtitle */
        .pn-sub-network {
          margin-top: 12px;
          font-size: clamp(14px, 3.2vw, 20px);
          font-weight: 800;
          color: #6B8576;
          letter-spacing: 0.52em;
          margin-left: 0.52em;
          opacity: 0;
          transform: translateY(6px);
          animation: subEntrance 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.95s;
        }

        @keyframes subEntrance {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Editorial Tagline */
        .pn-tagline-style {
          margin-top: 26px;
          font-family: Georgia, "Playfair Display", serif;
          font-style: italic;
          font-size: 18px;
          color: #2B3D33;
          opacity: 0;
          transform: translateY(10px);
          animation: tagEntrance 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards 1.15s;
          text-align: center;
        }

        @keyframes tagEntrance {
          to {
            opacity: 0.95;
            transform: translateY(0);
          }
        }

        /* Quirky Rolling Loading Capsule */
        .pn-capsule {
          margin-top: 36px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px;
          background: rgba(253, 251, 247, 0.9);
          border: 1px solid rgba(232, 139, 104, 0.25);
          border-radius: 99px;
          box-shadow: 0 4px 14px rgba(44, 36, 32, 0.04);
          opacity: 0;
          animation: capEntrance 0.8s ease forwards 1.35s;
        }

        @keyframes capEntrance {
          to { opacity: 1; }
        }

        .pn-pulse {
          width: 8px;
          height: 8px;
          background-color: #E88B68;
          border-radius: 50%;
          animation: pulseDot 1.4s ease-in-out infinite;
        }

        @keyframes pulseDot {
          0%, 100% { transform: scale(0.85); opacity: 0.4; }
          50% { transform: scale(1.3); opacity: 1; }
        }

        .pn-quote {
          font-size: 13px;
          font-weight: 600;
          color: #4A3E38;
          letter-spacing: 0.02em;
          min-width: 230px;
          text-align: center;
          transition: opacity 0.25s ease, transform 0.25s ease;
          opacity: 1;
          transform: translateY(0);
        }

        .pn-quote.pn-hidden {
          opacity: 0;
          transform: translateY(-6px);
        }
      `}</style>

      {/* Floating Faded Peaches Background */}
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
          <path d="M50 20 C 50 35, 48 55, 40 65" strokeLinecap="round" />
          <path d="M50 20 C 55 10, 70 8, 75 14 C 76 22, 65 28, 55 24 Z" fill="rgba(46, 75, 61, 0.18)" stroke="none" />
        </svg>

        <svg className="pn-faded-shape p-pos-4" viewBox="0 0 100 100">
          <path d="M50 20 C 35 20, 20 30, 20 50 C 20 70, 35 85, 50 85 C 65 85, 80 70, 80 50 C 80 30, 65 20, 50 20 Z" />
        </svg>

        <svg className="pn-faded-shape p-pos-5" viewBox="0 0 100 100">
          <path d="M50 20 C 35 20, 20 30, 20 50 C 20 70, 35 85, 50 85 C 65 85, 80 70, 80 50 C 80 30, 65 20, 50 20 Z" />
        </svg>
      </div>

      <div className="pn-stage">
        {/* Ambient warm glow */}
        <div className="pn-halo" />

        {/* Wordmark Lockup */}
        <div className="pn-word-row">
          <span className="pn-c-p">P</span>
          <span className="pn-c-e">E</span>

          {/* Precision Stylized 'A' */}
          <div className="pn-c-a">
            <svg className="pn-a-svg-inner" viewBox="0 0 70 75" fill="none">
              {/* Dark Top Roof and Right Pillar */}
              <path d="M 0 0 L 70 0 L 70 75 L 42 75 L 36 28 L 0 28 Z" fill="#18221D" />

              {/* 4 Peach Stepped Horizontal Bars */}
              <rect x="0" y="32" width="38" height="8.5" rx="1" fill="#E88B68" />
              <rect x="0" y="42.5" width="48" height="8.5" rx="1" fill="#E88B68" />
              <rect x="0" y="53" width="38" height="8.5" rx="1" fill="#E88B68" />
              <rect x="0" y="63.5" width="28" height="9.5" rx="1" fill="#E88B68" />
            </svg>
          </div>

          <span className="pn-c-c">C</span>
          <span className="pn-c-h">H</span>
        </div>

        {/* Subtitle: NETWORK */}
        <div className="pn-sub-network">NETWORK</div>

        {/* Editorial Tagline */}
        <div className="pn-tagline-style">Good ideas find good people.</div>

        {/* Quirky Rolling Loading Capsule */}
        <div className="pn-capsule">
          <span className="pn-pulse" />
          <span className={`pn-quote ${phraseFade ? "pn-hidden" : ""}`}>
            {PHRASES[phraseIdx]}
          </span>
        </div>
      </div>
    </div>
  );
}
