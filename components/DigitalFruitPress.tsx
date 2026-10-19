"use client";

import React, { useState, useEffect } from "react";

type AnimationStage = "brief" | "pressing" | "fanned" | "locked";
type ActiveView = "auto" | "fan" | "flyer" | "square" | "story";

export default function DigitalFruitPress() {
  const [stage, setStage] = useState<AnimationStage>("brief");
  const [activeView, setActiveView] = useState<ActiveView>("auto");
  const [isHovered, setIsHovered] = useState(false);
  const [isPressingTrigger, setIsPressingTrigger] = useState(false);

  // Auto-play the transformation cycle when activeView === "auto"
  useEffect(() => {
    if (activeView !== "auto" || isHovered) return;

    const timer1 = setTimeout(() => setStage("pressing"), 2200);
    const timer2 = setTimeout(() => setStage("fanned"), 3200);
    const timer3 = setTimeout(() => setStage("locked"), 4600);
    const timer4 = setTimeout(() => setStage("brief"), 8200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [stage, activeView, isHovered]);

  const handleManualPress = () => {
    setIsPressingTrigger(true);
    setStage("pressing");
    setTimeout(() => {
      setStage("fanned");
      setTimeout(() => {
        setStage("locked");
        setIsPressingTrigger(false);
      }, 1200);
    }, 900);
  };

  const isFannedOrLocked = stage === "fanned" || stage === "locked" || activeView !== "auto";

  return (
    <div
      className="fruit-press-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        .fruit-press-container {
          position: relative;
          width: 100%;
          max-width: 540px;
          margin: 0 auto;
        }

        /* Ambient Glow Backdrop */
        .fp-ambient-glow {
          position: absolute;
          inset: -16px;
          border-radius: 36px;
          background: radial-gradient(circle at 45% 40%, rgba(229, 67, 7, 0.22) 0%, rgba(112, 234, 255, 0.28) 42%, rgba(56, 189, 248, 0.12) 70%, transparent 85%);
          filter: blur(40px);
          pointer-events: none;
          z-index: 0;
          animation: fpGlowPulse 6s ease-in-out infinite alternate;
        }

        @keyframes fpGlowPulse {
          0% { opacity: 0.7; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1.04); }
        }

        /* Dual-layer interactive canvas card with clean cream/stone surface */
        .fp-canvas-card {
          position: relative;
          z-index: 2;
          background: #faf8f5;
          border: 1.5px solid #e7ded4;
          border-radius: 28px;
          padding: 20px 22px 18px;
          box-shadow: 0 20px 48px -12px rgba(13, 47, 36, 0.14),
                      0 4px 16px rgba(2, 132, 199, 0.08),
                      inset 0 1px 0 rgba(255, 255, 255, 0.9);
          overflow: hidden;
        }

        /* Top control header */
        .fp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid #eee5dc;
          margin-bottom: 16px;
        }

        .fp-title-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0d2f24;
          background: #f0ebe4;
          padding: 5px 12px;
          border-radius: 999px;
          border: 1px solid #ded4c9;
        }

        .fp-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #e54307;
          box-shadow: 0 0 8px #e54307;
          animation: dotBlink 1.8s infinite ease-in-out;
        }

        @keyframes dotBlink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .fp-press-action-btn {
          font-size: 11.5px;
          font-weight: 800;
          color: #e54307;
          background: #fff0e7;
          border: 1px solid #ffd4bd;
          padding: 5px 12px;
          border-radius: 999px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s ease;
        }

        .fp-press-action-btn:hover {
          background: #ffe3d2;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(229, 67, 7, 0.18);
        }

        /* Main Transformation Stage Viewport */
        .fp-stage-viewport {
          position: relative;
          min-height: 290px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 0;
        }

        /* 1. Unpolished Raw Brief Card (Left or Centered initially) */
        .fp-raw-brief {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          border: 2px dashed #d1c7bc;
          border-radius: 18px;
          padding: 18px 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .fp-raw-brief.fade-out {
          opacity: 0.15;
          transform: scale(0.94) translateY(8px);
          filter: grayscale(80%) blur(1px);
          pointer-events: none;
        }

        .fp-brief-tag {
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #8c7d6e;
          display: inline-block;
          margin-bottom: 6px;
        }

        .fp-brief-title {
          font-size: 17px;
          font-weight: 850;
          color: #1a2e26;
          margin: 0 0 4px;
        }

        .fp-brief-subtitle {
          font-size: 12px;
          color: #6d7f76;
          margin: 0 0 14px;
        }

        .fp-brief-checklist {
          list-style: none;
          padding: 0;
          margin: 0 0 14px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .fp-brief-checklist li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #3f5249;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .fp-brief-box {
          width: 14px;
          height: 14px;
          border: 1.5px dashed #99aab3;
          border-radius: 3px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .fp-brief-meta-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px dashed #e2dcd4;
          font-size: 11px;
          font-weight: 700;
          color: #8c7d6e;
        }

        .fp-draft-stamp {
          border: 1px solid #d97706;
          color: #b45309;
          background: #fef3c7;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* 2. The Glowing Minimalist Coral Peach Stamp / Token */
        .fp-peach-stamp-layer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 20;
        }

        .fp-peach-stamp {
          width: 108px;
          height: 108px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff7547 0%, #e54307 65%, #c23300 100%);
          box-shadow: 0 0 32px rgba(229, 67, 7, 0.6),
                      0 12px 28px rgba(13, 47, 36, 0.35),
                      inset 0 2px 4px rgba(255, 255, 255, 0.6),
                      inset 0 -3px 6px rgba(0, 0, 0, 0.3);
          border: 3px solid #ffeedb;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* Rotating ring around the stamp */
        .fp-stamp-ring {
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          border: 1.5px dashed rgba(229, 67, 7, 0.4);
          animation: fpRotateRing 14s linear infinite;
        }

        @keyframes fpRotateRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .fp-stamp-haptic-bounce {
          animation: hapticPressBounce 0.75s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes hapticPressBounce {
          0% {
            transform: translateY(-80px) scale(1.18);
            opacity: 0;
          }
          40% {
            transform: translateY(0px) scale(0.90, 1.12);
            opacity: 1;
          }
          65% {
            transform: translateY(-8px) scale(1.06, 0.96);
          }
          85% {
            transform: translateY(2px) scale(0.98, 1.02);
          }
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.95;
          }
        }

        /* Shockwave ripple when stamp presses down */
        .fp-shockwave {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid #ff7547;
          animation: fpRipple 0.8s ease-out forwards;
        }

        @keyframes fpRipple {
          0% {
            transform: scale(0.6);
            opacity: 0.9;
          }
          100% {
            transform: scale(3.2);
            opacity: 0;
          }
        }

        /* 3. Fanned-out Deliverables Stack (Crisp Commercial Assets) */
        .fp-fanned-container {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .fp-deliverable-card {
          position: absolute;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 14px 34px -6px rgba(13, 47, 36, 0.16),
                      0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.55s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          cursor: pointer;
        }

        /* Deliverable 1: Top - 300 DPI Event Flyer with Crop Marks */
        .fp-card-flyer {
          width: 250px;
          height: 250px;
          border: 1px solid #e2dcd4;
          background: #ffffff;
          z-index: 14;
          transform: translateY(-8px) rotate(-3.5deg) scale(0.98);
        }

        .fp-card-flyer.active,
        .fp-card-flyer:hover {
          transform: translateY(-16px) rotate(0deg) scale(1.03);
          z-index: 25;
          box-shadow: 0 20px 45px rgba(13, 47, 36, 0.22);
        }

        /* Real Printer Bleed Crop Marks in 4 Corners */
        .fp-crop-mark {
          position: absolute;
          width: 14px;
          height: 14px;
          pointer-events: none;
        }
        .fp-crop-tl { top: 6px; left: 6px; border-top: 1.5px solid #000; border-left: 1.5px solid #000; }
        .fp-crop-tr { top: 6px; right: 6px; border-top: 1.5px solid #000; border-right: 1.5px solid #000; }
        .fp-crop-bl { bottom: 6px; left: 6px; border-bottom: 1.5px solid #000; border-left: 1.5px solid #000; }
        .fp-crop-br { bottom: 6px; right: 6px; border-bottom: 1.5px solid #000; border-right: 1.5px solid #000; }

        .fp-flyer-content {
          padding: 22px 18px 14px;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
        }

        .fp-flyer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8.5px;
          font-weight: 850;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #0369a1;
          border-bottom: 1px solid #e0f2fe;
          padding-bottom: 4px;
        }

        .fp-flyer-title {
          font-size: 15px;
          font-weight: 900;
          color: #0d2f24;
          line-height: 1.15;
          margin: 6px 0 3px;
        }

        .fp-flyer-sub {
          font-size: 10px;
          font-weight: 700;
          color: #e54307;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .fp-flyer-detail {
          font-size: 9.5px;
          color: #556960;
          line-height: 1.35;
          margin-bottom: 8px;
        }

        /* CMYK Calibration Swatches at flyer footer */
        .fp-cmyk-bar {
          display: flex;
          gap: 3px;
          align-items: center;
          margin-top: auto;
          padding-top: 6px;
          border-top: 1px solid #f1ece4;
        }

        .fp-cmyk-swatch {
          width: 10px;
          height: 8px;
          border-radius: 2px;
        }

        .fp-cmyk-c { background: #00ffff; }
        .fp-cmyk-m { background: #ff00ff; }
        .fp-cmyk-y { background: #ffff00; }
        .fp-cmyk-k { background: #111111; }

        .fp-cmyk-label {
          font-size: 8px;
          font-weight: 800;
          color: #8c7d6e;
          margin-left: 6px;
          letter-spacing: 0.06em;
        }

        /* Deliverable 2: Middle - 1:1 Social Square formatted for feeds */
        .fp-card-square {
          width: 230px;
          height: 230px;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #0d2f24 100%);
          border: 1.5px solid #70eaff;
          color: #ffffff;
          z-index: 12;
          transform: translateX(65px) translateY(12px) rotate(4deg) scale(0.95);
        }

        .fp-card-square.active,
        .fp-card-square:hover {
          transform: translateX(70px) translateY(0px) rotate(0deg) scale(1.02);
          z-index: 24;
          box-shadow: 0 20px 45px rgba(2, 132, 199, 0.35);
        }

        .fp-square-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
        }

        .fp-square-badge {
          font-size: 8.5px;
          font-weight: 850;
          color: #70eaff;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .fp-square-h {
          font-size: 14px;
          font-weight: 900;
          line-height: 1.2;
          color: #ffffff;
          margin: 6px 0;
        }

        .fp-square-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 9.5px;
          font-weight: 700;
          color: #e0f2fe;
          border-top: 1px solid rgba(112, 234, 255, 0.3);
          padding-top: 6px;
        }

        /* Deliverable 3: Bottom - 9:16 Story Flyer */
        .fp-card-story {
          width: 170px;
          height: 250px;
          background: linear-gradient(180deg, #fff7ed 0%, #ffe4d6 55%, #fed7aa 100%);
          border: 1.5px solid #fdba74;
          z-index: 10;
          transform: translateX(-80px) translateY(18px) rotate(-7deg) scale(0.92);
        }

        .fp-card-story.active,
        .fp-card-story:hover {
          transform: translateX(-80px) translateY(4px) rotate(0deg) scale(1.02);
          z-index: 23;
          box-shadow: 0 18px 40px rgba(229, 67, 7, 0.25);
        }

        .fp-story-content {
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
          text-align: center;
        }

        .fp-story-badge {
          font-size: 8.5px;
          font-weight: 850;
          color: #c2410c;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .fp-story-title {
          font-size: 12px;
          font-weight: 900;
          color: #0d2f24;
          line-height: 1.2;
          margin: 4px 0;
        }

        .fp-story-cta {
          background: #e54307;
          color: #ffffff;
          font-size: 9.5px;
          font-weight: 850;
          padding: 6px 12px;
          border-radius: 999px;
          box-shadow: 0 4px 10px rgba(229, 67, 7, 0.3);
          display: inline-block;
          margin: 0 auto;
        }

        /* 4. Scope Locked & Pre-Flight Check Status Bar */
        .fp-lock-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          border: 1px solid #d1fae5;
          border-radius: 14px;
          padding: 9px 14px;
          margin-top: 14px;
          box-shadow: 0 3px 10px rgba(16, 185, 129, 0.08);
          transition: all 0.4s ease;
        }

        .fp-lock-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .fp-check-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
          animation: checkPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes checkPop {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .fp-lock-text {
          font-size: 12px;
          font-weight: 850;
          color: #065f46;
        }

        .fp-lock-sub {
          font-size: 10.5px;
          color: #047857;
          font-weight: 600;
        }

        .fp-lock-pill {
          font-size: 10px;
          font-weight: 850;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          padding: 3px 8px;
          border-radius: 999px;
        }

        /* Interactive Filter Tabs to Inspect Deliverables */
        .fp-tab-row {
          display: flex;
          gap: 6px;
          margin-top: 12px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .fp-tab-btn {
          flex: 1;
          padding: 6px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid #ded4c9;
          background: #f7f3ee;
          color: #556960;
          cursor: pointer;
          white-space: nowrap;
          text-align: center;
          transition: all 0.2s ease;
        }

        .fp-tab-btn:hover {
          background: #ebe4dc;
          color: #0d2f24;
        }

        .fp-tab-btn.active {
          background: #0d2f24;
          color: #ffffff;
          border-color: #0d2f24;
          box-shadow: 0 4px 12px rgba(13, 47, 36, 0.2);
        }

        @media (max-width: 600px) {
          .fp-canvas-card {
            padding: 16px 14px 14px;
          }

          .fp-stage-viewport {
            min-height: 270px;
          }

          .fp-card-flyer {
            width: 210px;
            height: 220px;
          }

          .fp-card-square {
            width: 190px;
            height: 190px;
            transform: translateX(40px) translateY(12px) rotate(4deg) scale(0.95);
          }

          .fp-card-story {
            width: 140px;
            height: 210px;
            transform: translateX(-55px) translateY(18px) rotate(-7deg) scale(0.92);
          }
        }
      `}</style>

      {/* Ambient Radial Sky & Peach Glow */}
      <div className="fp-ambient-glow" />

      {/* Main Canvas Card with Dual-Layer Depth */}
      <div className="fp-canvas-card">
        {/* Top Header */}
        <div className="fp-header">
          <div className="fp-title-badge">
            <span className="fp-pulse-dot" />
            Digital Fruit Press™ &bull; Raw Idea to Asset
          </div>
          <button
            type="button"
            className="fp-press-action-btn"
            onClick={handleManualPress}
            title="Click to press the peach stamp and transform the raw brief"
          >
            <span>🍑</span>
            <span>Press Stamp</span>
          </button>
        </div>

        {/* Viewport Stage where transformation occurs */}
        <div className="fp-stage-viewport">
          {/* Stage 1: Unpolished Raw Brief Outline */}
          <div className={`fp-raw-brief ${isFannedOrLocked ? "fade-out" : ""}`}>
            <span className="fp-brief-tag">Intake Draft #082 &bull; Unpolished Concept</span>
            <h3 className="fp-brief-title">Grand Opening Event Collateral</h3>
            <p className="fp-brief-subtitle">Birmingham Artisan &amp; Culinary Market Launch</p>

            <ul className="fp-brief-checklist">
              <li>
                <span className="fp-brief-box">□</span>
                <span>8.5&quot; &times; 11&quot; Print Flyer (300 DPI with Bleed)</span>
              </li>
              <li>
                <span className="fp-brief-box">□</span>
                <span>1:1 Feed Post (1080&times;1080 for Instagram)</span>
              </li>
              <li>
                <span className="fp-brief-box">□</span>
                <span>9:16 Vertical Story Flyer (1080&times;1920)</span>
              </li>
            </ul>

            <div className="fp-brief-meta-bar">
              <span>Awaiting Creative Direction</span>
              <span className="fp-draft-stamp">Raw Brief</span>
            </div>
          </div>

          {/* Stage 2: The Glowing Minimalist Coral Peach Stamp / Token */}
          {(stage === "pressing" || isPressingTrigger) && (
            <div className="fp-peach-stamp-layer">
              <div className="fp-shockwave" />
              <div className="fp-peach-stamp fp-stamp-haptic-bounce">
                <div className="fp-stamp-ring" />
                {/* Minimalist Sculpted Coral Peach */}
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" }}
                >
                  <path
                    d="M24 10C24 10 16 4 10 8C4 12 6 22 10 30C14 38 21 42 24 42C27 42 34 38 38 30C42 22 44 12 38 8C32 4 24 10 24 10Z"
                    fill="#FFEED4"
                  />
                  <path
                    d="M24 10C24 10 24 24 24 42"
                    stroke="#E54307"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M24 10C27 6 34 5 36 7C38 9 36 14 32 15C28 16 24 10 24 10Z"
                    fill="#10B981"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Stage 3: Stack of 3 Polished Commercial Deliverables Fanning Out */}
          {isFannedOrLocked && (
            <div className="fp-fanned-container">
              {/* Deliverable 3: 9:16 Story Flyer (Bottom / Left) */}
              <div
                className={`fp-deliverable-card fp-card-story ${
                  activeView === "story" ? "active" : ""
                }`}
                onClick={() => setActiveView("story")}
                title="9:16 Vertical Story Flyer"
              >
                <div className="fp-story-content">
                  <div className="fp-story-badge">9:16 Story Format</div>
                  <div>
                    <div style={{ fontSize: "16px", marginBottom: "2px" }}>🎪</div>
                    <div className="fp-story-title">MARKET OPENING</div>
                    <div style={{ fontSize: "9px", color: "#7c2d12", fontWeight: 700 }}>
                      THIS WEEKEND ONLY
                    </div>
                  </div>
                  <div>
                    <div className="fp-story-cta">Tap for RSVP &rarr;</div>
                    <div style={{ fontSize: "8px", color: "#9a3412", marginTop: "4px" }}>
                      1080 &times; 1920
                    </div>
                  </div>
                </div>
              </div>

              {/* Deliverable 2: 1:1 Social Square (Middle / Right) */}
              <div
                className={`fp-deliverable-card fp-card-square ${
                  activeView === "square" ? "active" : ""
                }`}
                onClick={() => setActiveView("square")}
                title="1:1 Feed Post"
              >
                <div className="fp-square-content">
                  <div className="fp-square-badge">1:1 Feed &bull; 1080 &times; 1080</div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#70eaff", fontWeight: 800 }}>
                      SAVE THE DATE
                    </div>
                    <div className="fp-square-h">
                      BIRMINGHAM ARTISAN MARKET
                    </div>
                    <div style={{ fontSize: "10px", color: "#e0f2fe" }}>
                      Downtown 19th Street &bull; Oct 25–26
                    </div>
                  </div>
                  <div className="fp-square-footer">
                    <span>@BhamCreativeMarket</span>
                    <span style={{ color: "#70eaff" }}>Verified Spec &bull; RGB</span>
                  </div>
                </div>
              </div>

              {/* Deliverable 1: Top - 300 DPI Event Flyer with Crop Marks */}
              <div
                className={`fp-deliverable-card fp-card-flyer ${
                  activeView === "flyer" ? "active" : ""
                }`}
                onClick={() => setActiveView("flyer")}
                title="300 DPI Commercial Print Flyer with Crop Marks"
              >
                {/* 4 Press Bleed Crop Marks */}
                <div className="fp-crop-mark fp-crop-tl" />
                <div className="fp-crop-mark fp-crop-tr" />
                <div className="fp-crop-mark fp-crop-bl" />
                <div className="fp-crop-mark fp-crop-br" />

                <div className="fp-flyer-content">
                  <div className="fp-flyer-header">
                    <span>Commercial Print Flyer</span>
                    <span>300 DPI &bull; 0.125&quot; Bleed</span>
                  </div>

                  <div>
                    <div className="fp-flyer-sub">Grand Opening Weekend</div>
                    <div className="fp-flyer-title">
                      BIRMINGHAM ARTISAN MARKET
                    </div>
                    <div className="fp-flyer-detail">
                      Live Music &bull; Local Makers &bull; Chef Tastings
                      <br />
                      <strong>Saturday &amp; Sunday &bull; 11AM &ndash; 6PM</strong>
                    </div>
                  </div>

                  <div className="fp-cmyk-bar">
                    <div className="fp-cmyk-swatch fp-cmyk-c" title="Cyan" />
                    <div className="fp-cmyk-swatch fp-cmyk-m" title="Magenta" />
                    <div className="fp-cmyk-swatch fp-cmyk-y" title="Yellow" />
                    <div className="fp-cmyk-swatch fp-cmyk-k" title="Black" />
                    <span className="fp-cmyk-label">CMYK Pre-Flight Certified</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Scope Locked Status Bar */}
        <div className="fp-lock-bar">
          <div className="fp-lock-left">
            <span className="fp-check-icon">&#10003;</span>
            <div>
              <div className="fp-lock-text">
                Scope Locked &bull; 300 DPI CMYK Pre-Flight Passed
              </div>
              <div className="fp-lock-sub">
                Handcrafted by Vetted Birmingham Creatives
              </div>
            </div>
          </div>
          <span className="fp-lock-pill">Commercial Grade</span>
        </div>

        {/* Interactive Deliverable Selector Tabs */}
        <div className="fp-tab-row">
          <button
            type="button"
            className={`fp-tab-btn ${activeView === "auto" ? "active" : ""}`}
            onClick={() => setActiveView("auto")}
          >
            Auto Animation
          </button>
          <button
            type="button"
            className={`fp-tab-btn ${activeView === "fan" ? "active" : ""}`}
            onClick={() => setActiveView("fan")}
          >
            Fan View
          </button>
          <button
            type="button"
            className={`fp-tab-btn ${activeView === "flyer" ? "active" : ""}`}
            onClick={() => setActiveView("flyer")}
          >
            300 DPI Flyer
          </button>
          <button
            type="button"
            className={`fp-tab-btn ${activeView === "square" ? "active" : ""}`}
            onClick={() => setActiveView("square")}
          >
            1:1 Feed Post
          </button>
          <button
            type="button"
            className={`fp-tab-btn ${activeView === "story" ? "active" : ""}`}
            onClick={() => setActiveView("story")}
          >
            9:16 Story
          </button>
        </div>
      </div>
    </div>
  );
}
