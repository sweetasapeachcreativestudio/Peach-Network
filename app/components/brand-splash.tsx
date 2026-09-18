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

  // Cycle the scrolling words every 1.5s
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

  // Hold for 3.8s, then smooth fade exit into the app
  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 3800);
    const removeTimer = setTimeout(() => setShow(false), 4500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`pn-screen-1-root ${fading ? "pn-screen-1-exit" : ""}`} aria-hidden="true">
      <style>{`
        .pn-screen-1-root {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          background-color: #FAF6F0;
          background-image: 
            radial-gradient(at 20% 20%, rgba(232, 139, 104, 0.12) 0px, transparent 50%),
            radial-gradient(at 80% 80%, rgba(24, 34, 29, 0.06) 0px, transparent 50%);
          padding: 48px 24px;
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 1;
          transform: scale(1);
          pointer-events: auto;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", sans-serif;
          overflow: hidden;
        }

        .pn-screen-1-exit {
          opacity: 0;
          transform: scale(1.02);
          pointer-events: none;
        }

        .pn-top-spacer {
          height: 20px;
        }

        .pn-screen-1-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 620px;
          text-align: center;
        }

        /* The Exact Logo */
        .pn-mockup-logo-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          opacity: 0;
          transform: translateY(15px) scale(0.95);
          animation: logoSmoothIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.2s;
        }

        .pn-mockup-logo {
          display: block;
          width: min(540px, 86vw);
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 12px 24px rgba(24, 34, 29, 0.07));
        }

        @keyframes logoSmoothIn {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* The Two-Line Tagline from Screen 1 */
        .pn-screen-1-tagline {
          margin-top: 36px;
          font-family: Georgia, "Playfair Display", serif;
          font-style: italic;
          font-size: clamp(22px, 4.5vw, 32px);
          line-height: 1.35;
          color: #24352C;
          opacity: 0;
          transform: translateY(12px);
          animation: taglineFadeIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.85s;
        }

        @keyframes taglineFadeIn {
          to {
            opacity: 0.95;
            transform: translateY(0);
          }
        }

        /* Scrolling Phrases */
        .pn-screen-1-loading-area {
          margin-top: 40px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 24px;
          background: rgba(253, 251, 247, 0.92);
          border: 1px solid rgba(232, 139, 104, 0.25);
          border-radius: 99px;
          box-shadow: 0 4px 16px rgba(44, 36, 32, 0.04);
          opacity: 0;
          transform: translateY(10px);
          animation: loaderAreaFade 0.8s ease forwards 1.1s;
        }

        @keyframes loaderAreaFade {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pn-screen-1-pip {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #E88B68;
          animation: pipBlink 1.4s ease-in-out infinite;
        }

        @keyframes pipBlink {
          0%, 100% { transform: scale(0.85); opacity: 0.4; }
          50% { transform: scale(1.3); opacity: 1; }
        }

        .pn-screen-1-phrase {
          font-size: clamp(14px, 2.8vw, 16px);
          font-weight: 600;
          color: #4A3E38;
          letter-spacing: 0.02em;
          min-width: 240px;
          text-align: center;
          transition: opacity 0.25s ease, transform 0.25s ease;
          opacity: 1;
          transform: translateY(0);
        }

        .pn-screen-1-phrase.pn-phrase-hidden {
          opacity: 0;
          transform: translateY(-6px);
        }

        /* Bottom Footer */
        .pn-screen-1-footer {
          font-size: clamp(10px, 2vw, 12px);
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #6B8576;
          opacity: 0;
          animation: footerFadeIn 0.8s ease forwards 1.3s;
          text-align: center;
        }

        @keyframes footerFadeIn {
          to {
            opacity: 0.8;
          }
        }
      `}</style>

      {/* Top spacer */}
      <div className="pn-top-spacer" />

      {/* Screen 1 Center Stage */}
      <div className="pn-screen-1-center">
        {/* Exact Logo File */}
        <div className="pn-mockup-logo-wrap">
          <img
            src="/peach-app-logo.png"
            alt="Peach Network"
            className="pn-mockup-logo"
          />
        </div>

        {/* The Two-Line Tagline from Screen 1 */}
        <div className="pn-screen-1-tagline">
          Good ideas<br />
          find good people.
        </div>

        {/* The Scrolling Creative Words */}
        <div className="pn-screen-1-loading-area">
          <span className="pn-screen-1-pip" />
          <span className={`pn-screen-1-phrase ${textFade ? "pn-phrase-hidden" : ""}`}>
            {SCROLLING_TEXTS[textIndex]}
          </span>
        </div>
      </div>

      {/* Bottom: Powered by Sweet As A Peach Creative Agency */}
      <div className="pn-screen-1-footer">
        Powered by Sweet As A Peach Creative Agency
      </div>
    </div>
  );
}
