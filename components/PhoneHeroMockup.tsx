"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Download,
  Star,
  Check,
  Smartphone,
  Eye,
  Sliders,
  Award,
  MapPin,
  Zap
} from "lucide-react";

export interface ShowcaseProject {
  id: string;
  tabLabel: string;
  title: string;
  client: string;
  category: string;
  creative: string;
  creativeRole: string;
  creativeSchool: string;
  status: string;
  turnaround: string;
  image: string;
  tags: string[];
}

export const SHOWCASE_ITEMS: ShowcaseProject[] = [
  {
    id: "proj-1",
    tabLabel: "Runa Logo",
    title: "Runa Logo & Vector Kit",
    client: "Runa",
    category: "Logo & Vector Kit",
    creative: "Jose Garcia",
    creativeRole: "Illustrator & Video Editor",
    creativeSchool: "ADDY Winner • Troy University",
    status: "ADDY-Winning Vector Kit",
    turnaround: "4 Days",
    image: "/project 7.jpg",
    tags: ["Logo & Vector Kit", "Jose Garcia", "ADDY Winner", "Troy University"],
  },
  {
    id: "proj-2",
    tabLabel: "Empower Her Heart",
    title: "Empower Her Heart",
    client: "Lillian Hewitt • Black Women's Heart Health",
    category: "UI/UX & Art Direction",
    creative: "Stephanie Stewart",
    creativeRole: "UI/UX Designer & Art Director",
    creativeSchool: "Troy University",
    status: "UI/UX & Art Direction Verified",
    turnaround: "5 Days",
    image: "/lillian-project.jpg",
    tags: ["UI/UX Design", "Stephanie Stewart", "Art Direction", "Troy University"],
  },
  {
    id: "proj-3",
    tabLabel: "Bessemer Chamber",
    title: "Bessemer Chamber Logo & Brand Kit",
    client: "Bessemer Area Chamber of Commerce",
    category: "Logo & Brand Kit",
    creative: "Donovan",
    creativeRole: "Graphic Designer",
    creativeSchool: "Studying at SCAD",
    status: "Scope Locked • 300 DPI Pre-Flight",
    turnaround: "48 Hours",
    image: "/Project 3.png",
    tags: ["Logo & Brand Kit", "Donovan", "SCAD", "Identity System"],
  },
];

export default function PhoneHeroMockup() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [downloadTapped, setDownloadTapped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-cycle through projects every 5 seconds if not actively interacting
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered]);

  // Handle smooth 3D mouse tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Constrain tilt angle for refined corporate feel
    const tiltX = ((y - centerY) / centerY) * -12;
    const tiltY = ((x - centerX) / centerX) * 14;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const current = SHOWCASE_ITEMS[activeIdx];

  const handleDownload = () => {
    setDownloadTapped(true);
    setTimeout(() => setDownloadTapped(false), 1600);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[500px] mx-auto py-6 flex items-center justify-center select-none"
      style={{ perspective: "1200px" }}
    >
      {/* Ambient background glows with warm peach and luminous aqua/blue */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[540px] bg-gradient-to-tr from-[#38BDF8]/20 via-[#FFD8C2]/30 to-[#2563EB]/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Floating Card 1: Top Left - 100% Vetted Talent & Ready to work creatives */}
      <div
        className="hidden sm:flex absolute -left-8 top-10 z-20 items-center gap-3 bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-xl shadow-slate-900/5 px-4 py-3 rounded-xl transition-transform duration-500 ease-out hover:scale-105 cursor-pointer"
        style={{
          transform: `translate3d(${tilt.y * -0.6}px, ${tilt.x * -0.6}px, 40px)`,
        }}
      >
        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#142B20]">100% Vetted Talent</span>
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] font-bold font-mono ml-0.5 text-slate-700">5.0</span>
            </div>
          </div>
          <p className="text-[11px] text-blue-600 font-semibold flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Ready to work creatives
          </p>
        </div>
      </div>

      {/* Floating Card 2: Bottom Right - Scope Locked & Fast Process */}
      <div
        className="hidden sm:flex absolute -right-6 bottom-16 z-20 items-center gap-2.5 bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-xl shadow-slate-900/5 px-3.5 py-2.5 rounded-xl transition-transform duration-500 ease-out hover:scale-105"
        style={{
          transform: `translate3d(${tilt.y * 0.6}px, ${tilt.x * 0.6}px, 45px)`,
        }}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 text-cyan-200 flex items-center justify-center text-xs shadow-xs font-bold">
          <Zap className="w-4 h-4 text-cyan-300" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-[#142B20] leading-none">Scope Locked &bull; Fast Process</div>
          <div className="text-[9px] text-blue-600 font-semibold mt-0.5">Quick Turnaround &bull; Pre-Flight</div>
        </div>
      </div>

      {/* Floating Badge 3: Top Right - Birmingham Hub / Fast Process */}
      <div
        className="hidden sm:inline-flex absolute right-0 top-6 z-20 items-center gap-1.5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white border border-sky-400/40 px-3 py-1.5 rounded-lg shadow-lg text-[11px] font-bold tracking-wide transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${tilt.y * 0.5}px, ${tilt.x * 0.5}px, 35px)`,
        }}
      >
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        Birmingham Hub &bull; Fast Process
      </div>

      {/* 3D Tilted Floating iPhone Chassis */}
      <div
        className="relative transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(20px)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Soft realistic drop shadow under phone */}
        <div className="absolute inset-0 translate-y-8 bg-slate-900/25 blur-2xl rounded-[50px] scale-95 pointer-events-none" />

        {/* iPhone Outer Hardware Body */}
        <div className="relative w-[295px] sm:w-[320px] h-[610px] sm:h-[640px] rounded-[50px] p-[10px] bg-gradient-to-b from-[#334155] via-[#1E293B] to-[#0F172A] shadow-2xl border-[3px] border-[#475569]/40 ring-1 ring-white/20">
          
          {/* Hardware buttons on edges */}
          <div className="absolute -left-[5px] top-[115px] w-[3px] h-[26px] bg-[#475569] rounded-l" />
          <div className="absolute -left-[5px] top-[155px] w-[3px] h-[50px] bg-[#475569] rounded-l" />
          <div className="absolute -left-[5px] top-[215px] w-[3px] h-[50px] bg-[#475569] rounded-l" />
          <div className="absolute -right-[5px] top-[175px] w-[3px] h-[68px] bg-[#475569] rounded-r" />

          {/* Inner Screen Bezel */}
          <div className="relative w-full h-full bg-[#FAF8F5] rounded-[40px] overflow-hidden flex flex-col justify-between border border-slate-900/20 shadow-inner">
            
            {/* Dynamic Glass Reflection Stripe (shifts with tilt) */}
            <div
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none transition-transform duration-200"
              style={{
                transform: `translateX(${tilt.y * 3}px) translateY(${tilt.x * 3}px)`,
              }}
            />

            {/* Top Status Area & Dynamic Island */}
            <div className="relative z-30 pt-3 px-6 pb-2 flex items-center justify-between text-[#0F172A]">
              <span className="text-[11px] font-bold font-mono tracking-tight">9:41</span>
              
              {/* Dynamic Island */}
              <div className="w-[90px] h-[22px] bg-black rounded-full flex items-center justify-between px-2 shadow-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-[#142B20] border border-slate-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF5733]" />
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700">
                <span>5G</span>
                <span className="w-3.5 h-2.5 border border-slate-700 rounded-xs flex items-center p-0.5">
                  <span className="w-full h-full bg-[#142B20]" />
                </span>
              </div>
            </div>

            {/* In-App Header with Authentic Peach Network Mark */}
            <div className="px-4 py-2 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/brand/peach-network-logo.png"
                  alt="Peach Network"
                  className="h-6 w-auto object-contain"
                />
                <span className="text-[9px] font-bold text-[#FF5733] bg-[#FF5733]/10 border border-[#FF5733]/20 uppercase tracking-wider font-mono px-1.5 py-0.5 rounded">
                  Live Hub
                </span>
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE
              </span>
            </div>

            {/* Interactive Screen Scroll Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              
              {/* Project Selector Pills (Interactive) */}
              <div className="grid grid-cols-3 gap-1.5 pb-1">
                {SHOWCASE_ITEMS.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveIdx(idx)}
                    className={`text-[10px] font-bold py-1.5 px-1 rounded-md transition-all text-center leading-tight truncate ${
                      activeIdx === idx
                        ? "bg-[#142B20] text-white shadow-xs border border-[#FF5733]"
                        : "bg-white text-slate-600 border border-[#E2E8F0] hover:bg-slate-50"
                    }`}
                  >
                    {item.tabLabel}
                  </button>
                ))}
              </div>

              {/* Active Project Card */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden transition-all duration-300">
                {/* Deliverable Image Preview */}
                <div className="relative h-36 w-full bg-slate-100 overflow-hidden group">
                  <Image
                    src={current.image}
                    alt={current.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Category Pill on Image */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white">
                    <span className="text-[10px] font-bold font-mono uppercase bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded">
                      {current.category}
                    </span>
                    <span className="text-[10px] font-bold bg-[#FF5733] px-2 py-0.5 rounded shadow-xs">
                      {current.turnaround}
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-3">
                  <div className="text-[10px] font-medium text-slate-500">{current.client}</div>
                  <h4 className="text-xs font-bold text-[#0F172A] truncate mt-0.5">{current.title}</h4>

                  {/* Creative Specialist Row with School / Accolades */}
                  <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#142B20] text-[#FF5733] text-[10px] font-bold flex items-center justify-center border border-[#FF5733]/30">
                        {current.creative[0]}
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-[#142B20] leading-none">{current.creative}</div>
                        <div className="text-[9px] text-slate-500">{current.creativeSchool}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      Vetted
                    </span>
                  </div>

                  {/* Deliverables Tags */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {current.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-medium bg-[#FAF8F5] text-slate-600 border border-[#E2E8F0] px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status / Scope Lock Indicator */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-[#142B20] text-white p-2.5 rounded-lg flex items-center justify-between shadow-xs border border-blue-700/40">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                      {current.status}
                    </div>
                    <div className="text-[9px] text-blue-100 font-medium">Fast process &bull; Pre-Flight Passed</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
              </div>

              {/* Interactive Download Handoff Action — Bold Coral CTA */}
              <button
                onClick={handleDownload}
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm ${
                  downloadTapped
                    ? "bg-emerald-600 text-white scale-98"
                    : "bg-[#FF5733] hover:bg-[#E04826] text-white shadow-md hover:shadow-lg"
                }`}
              >
                {downloadTapped ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white animate-bounce" />
                    Deliverables Handoff Ready!
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-white" />
                    Download Finished Assets
                  </>
                )}
              </button>

            </div>

            {/* Bottom iOS Home Indicator */}
            <div className="py-2 flex items-center justify-center bg-white/70 backdrop-blur-xs">
              <div className="w-28 h-1 bg-slate-400 rounded-full" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
