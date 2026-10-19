"use client";

import React, { useState, useEffect } from "react";
import { Check, Sparkles, FileText, Printer, Share2, Smartphone, ShieldCheck, ArrowRight } from "lucide-react";

export default function PeachPressHeroAnimation() {
  // Animation phase: 0 = Brief & Stamp Pressing, 1 = Fanned Deliverables & Pre-Flight Locked
  const [phase, setPhase] = useState<0 | 1>(0);
  const [stampActive, setStampActive] = useState(false);

  useEffect(() => {
    // 4-second seamless loop:
    // 0.0s - 1.8s: Brief displayed, peach stamp pulses down & presses ("Scope Locked & Funded")
    // 1.8s - 3.8s: Smooth transformation into 3 fanned-out deliverables with CMYK crop marks & green checkmark
    // 3.8s - 4.0s: Reset transition to brief
    const stampTimer = setTimeout(() => {
      setStampActive(true);
    }, 600);

    const fanTimer = setTimeout(() => {
      setPhase(1);
    }, 1800);

    const resetTimer = setTimeout(() => {
      setStampActive(false);
      setPhase(0);
    }, 4000);

    const interval = setInterval(() => {
      setStampActive(false);
      setPhase(0);
      setTimeout(() => setStampActive(true), 600);
      setTimeout(() => setPhase(1), 1800);
    }, 4000);

    return () => {
      clearTimeout(stampTimer);
      clearTimeout(fanTimer);
      clearTimeout(resetTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full max-w-[560px] mx-auto select-none">
      {/* Dual-layer container with Warm Cream / Stone surface & Crisp Shadow */}
      <div className="relative rounded-xl border border-[#E2E8F0] bg-[#FAF8F5] p-3.5 sm:p-5 shadow-xl shadow-[#142B20]/5 backdrop-blur-sm">
        
        {/* Status Bar */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5733] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF5733]"></span>
            </span>
            <span className="text-[11px] font-bold tracking-wider text-[#142B20] uppercase font-mono">
              PEACH DISPATCH ENGINE • AUTOMATED PRE-FLIGHT
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0F172A]/60 font-mono">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${phase === 1 ? "bg-emerald-500" : "bg-amber-500"}`}></span>
            {phase === 0 ? "PRESSING" : "VERIFIED"}
          </div>
        </div>

        {/* Stage Content: Left Brief vs Right Deliverables Fan-out */}
        <div className="relative min-h-[340px] sm:min-h-[360px] flex items-center justify-center overflow-hidden rounded-lg bg-white/70 border border-[#E2E8F0] p-3 sm:p-5">
          
          {/* Ambient subtle backlighting */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FF5733]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#142B20]/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* ============================================================ */}
          {/* STEP 1: The Client Brief Card + Pulsing Coral Peach Stamp */}
          {/* ============================================================ */}
          <div
            className={`absolute inset-x-3 sm:inset-x-6 top-4 bottom-4 transition-all duration-700 ease-out flex flex-col justify-between ${
              phase === 0
                ? "opacity-100 scale-100 translate-x-0 pointer-events-auto"
                : "opacity-0 scale-95 -translate-x-6 pointer-events-none"
            }`}
          >
            {/* Unpolished Brief Card Header */}
            <div className="border border-dashed border-[#CBD5E1] bg-white rounded-lg p-4 sm:p-5 shadow-xs relative">
              
              {/* Draft Stamp Tag */}
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-[#FAF8F5] text-[#0F172A] border border-[#E2E8F0]">
                  <FileText className="w-3 h-3 text-[#FF5733]" />
                  RAW CLIENT BRIEF
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  UNCHECKED DRAFT
                </span>
              </div>

              {/* Brief Title */}
              <h4 className="text-base sm:text-lg font-bold text-[#0F172A] mb-1">
                Grand Opening Kit • 2 Coins ($100)
              </h4>
              <p className="text-xs text-[#0F172A]/70 mb-3">
                Client: Artisan Market Launch • High-res print &amp; multi-channel social assets.
              </p>

              {/* Minimal Brief Checklist */}
              <div className="space-y-1.5 font-mono text-xs text-[#0F172A]/80 border-t border-[#E2E8F0] pt-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-dashed border-stone-400 rounded-sm inline-flex items-center justify-center text-[9px] text-stone-400">1</span>
                  <span>Print Flyer (Event Poster, 8.5x11, 300 DPI CMYK)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-dashed border-stone-400 rounded-sm inline-flex items-center justify-center text-[9px] text-stone-400">2</span>
                  <span>Social Square (Instagram Feed, 1080x1080)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-dashed border-stone-400 rounded-sm inline-flex items-center justify-center text-[9px] text-stone-400">3</span>
                  <span>Story Asset (Instagram &amp; TikTok, 1080x1920)</span>
                </div>
              </div>

              {/* Stamp Target Area */}
              <div className="mt-4 pt-3 border-t border-dashed border-[#CBD5E1] flex items-center justify-between text-xs">
                <span className="text-stone-500 font-mono text-[11px]">DISPATCH PROTOCOL:</span>
                <span className="font-semibold text-[#142B20] text-[11px]">Direct Talent Matching</span>
              </div>
            </div>

            {/* The Coral Peach Stamp / Token pressing down with tactile haptic bounce */}
            <div className="relative flex items-center justify-center py-2">
              <div
                className={`transition-all duration-500 ease-out flex items-center gap-3 px-4 py-2.5 rounded-lg border shadow-lg ${
                  stampActive
                    ? "scale-105 bg-[#FF5733] border-[#FF5733] text-white shadow-[#FF5733]/30 translate-y-0"
                    : "scale-90 bg-white border-[#E2E8F0] text-[#0F172A] -translate-y-2 opacity-80"
                }`}
              >
                {/* Tactile Peach Emblem */}
                <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${stampActive ? "bg-white text-[#FF5733]" : "bg-[#FF5733]/10 text-[#FF5733]"}`}>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C9.5 2 7.5 3.5 7.5 5.5C7.5 6 7.7 6.5 8 6.9C5.5 7.7 3.5 10.4 3.5 13.5C3.5 17.6 7.3 21 12 21C16.7 21 20.5 17.6 20.5 13.5C20.5 10.4 18.5 7.7 16 6.9C16.3 6.5 16.5 6 16.5 5.5C16.5 3.5 14.5 2 12 2ZM12 4C13.1 4 14 4.7 14 5.5C14 5.8 13.9 6.1 13.7 6.3C13.2 6.1 12.6 6 12 6C11.4 6 10.8 6.1 10.3 6.3C10.1 6.1 10 5.8 10 5.5C10 4.7 10.9 4 12 4Z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-black tracking-wider uppercase">
                    {stampActive ? "Scope Locked & Funded" : "Applying Quality Stamp..."}
                  </div>
                  <div className={`text-[10px] font-mono ${stampActive ? "text-white/90" : "text-stone-500"}`}>
                    2 Peach Coins ($100) Pre-Authorized
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* STEP 2: The Fanned-Out 3-Card Stack of Commercial Deliverables */}
          {/* ============================================================ */}
          <div
            className={`w-full h-full flex flex-col justify-between transition-all duration-700 ease-out ${
              phase === 1
                ? "opacity-100 scale-100 translate-x-0 pointer-events-auto"
                : "opacity-0 scale-95 translate-x-6 pointer-events-none"
            }`}
          >
            {/* The 3 Fanned Cards Container */}
            <div className="relative h-[255px] sm:h-[265px] w-full flex items-center justify-center">

              {/* CARD 3 (Back): 9:16 Story format (1080x1920) */}
              <div
                className="absolute w-[140px] sm:w-[155px] h-[215px] sm:h-[230px] rounded-lg bg-[#0F172A] text-white border border-slate-700 p-2.5 shadow-md flex flex-col justify-between transition-transform duration-700 ease-out"
                style={{
                  transform: phase === 1 ? "translateX(78px) translateY(-8px) rotate(7deg) scale(0.9)" : "translateX(0) translateY(0) rotate(0)",
                  zIndex: 10,
                }}
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-b border-slate-800 pb-1">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-2.5 h-2.5 text-[#FF5733]" />
                    9:16
                  </span>
                  <span>STORY</span>
                </div>
                <div className="text-center py-2">
                  <div className="text-[10px] font-black uppercase text-[#FF5733] tracking-widest">LIVE EVENT</div>
                  <div className="text-xs font-bold leading-tight mt-0.5">Grand Opening</div>
                  <div className="text-[9px] text-slate-300 font-mono mt-1">SWIPE UP &bull; TICKETS</div>
                </div>
                <div className="bg-slate-800/80 rounded px-1.5 py-1 text-[8px] font-mono text-center text-slate-300">
                  1080 &times; 1920 PX
                </div>
              </div>

              {/* CARD 2 (Middle): 1:1 Social Square (1080x1080) */}
              <div
                className="absolute w-[165px] sm:w-[185px] h-[165px] sm:h-[185px] rounded-lg bg-[#142B20] text-white border border-[#214332] p-3 shadow-lg flex flex-col justify-between transition-transform duration-700 ease-out"
                style={{
                  transform: phase === 1 ? "translateX(-65px) translateY(-14px) rotate(-6deg) scale(0.95)" : "translateX(0) translateY(0) rotate(0)",
                  zIndex: 20,
                }}
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-emerald-300 border-b border-emerald-900/60 pb-1">
                  <span className="flex items-center gap-1">
                    <Share2 className="w-2.5 h-2.5 text-[#FF5733]" />
                    1:1 FEED
                  </span>
                  <span>1080 &times; 1080</span>
                </div>
                <div className="py-1">
                  <div className="text-[10px] font-mono text-amber-300 font-bold">OCTOBER LAUNCH</div>
                  <div className="text-sm font-extrabold leading-tight text-white mt-0.5">ARTISAN NIGHT MARKET</div>
                  <div className="text-[9px] text-emerald-200/80 mt-1">Food &bull; Music &bull; Local Makers</div>
                </div>
                <div className="flex items-center justify-between text-[8px] font-mono text-emerald-300">
                  <span>@PEACHNETWORK</span>
                  <span className="text-[#FF5733] font-bold">RGB OPTIMIZED</span>
                </div>
              </div>

              {/* CARD 1 (Front): 300 DPI CMYK Print Flyer with Press Bleed Crop Marks */}
              <div
                className="relative w-[190px] sm:w-[215px] h-[230px] sm:h-[245px] rounded-lg bg-white text-[#0F172A] border border-[#CBD5E1] p-3 shadow-2xl flex flex-col justify-between transition-transform duration-700 ease-out"
                style={{
                  transform: phase === 1 ? "translateX(0px) translateY(8px) rotate(0deg) scale(1)" : "translateX(0) translateY(0) rotate(0)",
                  zIndex: 30,
                }}
              >
                {/* 4 Corner Press Bleed Marks (The 300 DPI Crop Marks) */}
                <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-slate-400"></div>
                <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-slate-400"></div>
                <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-slate-400"></div>
                <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-slate-400"></div>

                {/* Print Header with DPI Specs */}
                <div>
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-500 border-b border-slate-200 pb-1 mb-1.5">
                    <span className="flex items-center gap-1 text-[#142B20]">
                      <Printer className="w-2.5 h-2.5 text-[#FF5733]" />
                      300 DPI CMYK
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 px-1 rounded text-[8px] font-bold">
                      BLEED +0.125&quot;
                    </span>
                  </div>

                  {/* Flyer Artwork Sample */}
                  <div className="bg-[#FAF8F5] rounded border border-[#E2E8F0] p-2 text-center">
                    <div className="text-[9px] font-mono font-bold text-[#FF5733] uppercase tracking-wider">
                      OFFICIAL INVITATION
                    </div>
                    <div className="text-xs sm:text-sm font-black text-[#142B20] leading-tight">
                      GRAND OPENING GALA
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">
                      The Rotary Club Pavilion &bull; Birmingham
                    </div>
                  </div>
                </div>

                {/* CMYK Color Calibration Bars */}
                <div className="my-1 py-1 border-y border-dashed border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-mono text-slate-400">CALIBRATION BARS</span>
                    <span className="text-[8px] font-mono text-slate-500">ISO 12647-2</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1.5 w-full">
                    <div className="bg-cyan-500 rounded-xs" title="Cyan"></div>
                    <div className="bg-fuchsia-500 rounded-xs" title="Magenta"></div>
                    <div className="bg-yellow-400 rounded-xs" title="Yellow"></div>
                    <div className="bg-black rounded-xs" title="Key/Black"></div>
                  </div>
                </div>

                {/* Front Card Footer */}
                <div className="flex items-center justify-between pt-1 text-[9px] font-mono font-bold text-slate-600">
                  <span>8.5 &times; 11 IN PRINT</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" /> PRE-FLIGHT OK
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Footer Pill (No rounded pills - clean corporate badge) */}
            <div className="mt-2 pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Scope Locked &bull; 300 DPI CMYK Pre-Flight Passed</span>
              </div>
              <span className="text-[10px] font-mono text-[#0F172A]/50 uppercase font-semibold">
                READY FOR DOWNLOAD
              </span>
            </div>
          </div>
        </div>

        {/* Deliverables Meta Indicator Strip */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
          <div className="bg-white border border-[#E2E8F0] rounded p-1.5 text-[#0F172A]">
            <div className="font-bold text-[#142B20]">1. PRINT FLYER</div>
            <div className="text-slate-500">300 DPI Bleed</div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded p-1.5 text-[#0F172A]">
            <div className="font-bold text-[#142B20]">2. FEED SQUARE</div>
            <div className="text-slate-500">1080&times;1080 PX</div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded p-1.5 text-[#0F172A]">
            <div className="font-bold text-[#142B20]">3. STORY ASSET</div>
            <div className="text-slate-500">9:16 Vertical</div>
          </div>
        </div>

      </div>
    </div>
  );
}
