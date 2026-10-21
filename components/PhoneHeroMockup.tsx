"use client";

import React, { useState } from "react";
import Image from "next/image";

type AppTab = "project" | "chat" | "vault";

interface ChatMessage {
  id: string;
  sender: "creative" | "client" | "system";
  text: string;
  time: string;
}

export default function PhoneHeroMockup() {
  const [activeTab, setActiveTab] = useState<AppTab>("project");
  const [approved, setApproved] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [downloadedItem, setDownloadedItem] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "creative",
      text: "Hey! I just uploaded Proof v2 with the vector badge and full CMYK color specs.",
      time: "9:38 AM",
    },
    {
      id: "2",
      sender: "client",
      text: "Looks fantastic Jose! The typography fits the Bessemer signage layout.",
      time: "9:40 AM",
    },
    {
      id: "3",
      sender: "system",
      text: "Pre-Flight Review Available · Ready for client sign-off",
      time: "9:41 AM",
    },
  ]);

  const handleQuickSend = (text: string) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "client",
      text,
      time: "Just now",
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleDownload = (itemName: string) => {
    setDownloadedItem(itemName);
    setTimeout(() => setDownloadedItem(null), 2000);
  };

  return (
    <div className="w-full flex flex-col justify-center items-center py-2 select-none relative">
      {/* Hardware-Accelerated Smooth Floating iPhone Chassis (Zero JS-loop overhead) */}
      <div className="animate-smooth-float relative w-[310px] sm:w-[340px] rounded-[44px] p-[10px] bg-slate-900 shadow-2xl shadow-slate-950/30 border border-slate-700/60">
        {/* Hardware side button accents */}
        <div className="absolute -left-[4px] top-[95px] w-[3px] h-[22px] bg-slate-600 rounded-l" />
        <div className="absolute -left-[4px] top-[130px] w-[3px] h-[42px] bg-slate-600 rounded-l" />
        <div className="absolute -left-[4px] top-[180px] w-[3px] h-[42px] bg-slate-600 rounded-l" />
        <div className="absolute -right-[4px] top-[145px] w-[3px] h-[55px] bg-slate-600 rounded-r" />

        {/* Screen Display — Inside the Peach Network App */}
        <div className="relative w-full bg-white rounded-[36px] overflow-hidden flex flex-col border border-slate-100 shadow-inner min-h-[560px]">
          {/* iOS Top Bar */}
          <div className="pt-3 px-6 pb-2 flex items-center justify-between text-slate-800 bg-white">
            <span className="text-[11px] font-semibold tracking-tight">9:41</span>
            <div className="w-[74px] h-[18px] bg-black rounded-full" />
            <span className="text-[10px] font-semibold tracking-wider text-slate-500">5G</span>
          </div>

          {/* App Header — Workspace Brand Mark */}
          <div className="px-5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-white">
            <img
              src="/brand/peach-network-logo.png"
              alt="Peach Network"
              className="h-6 w-auto object-contain"
            />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Client Workspace</span>
            </div>
          </div>

          {/* App Views Navigation — Clean Typographic Tabs, Zero Pills */}
          <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-slate-100 bg-slate-50/70">
            <button
              type="button"
              onClick={() => setActiveTab("project")}
              className={`text-xs font-semibold pb-1.5 transition-colors relative ${
                activeTab === "project"
                  ? "text-slate-900 font-bold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Active Project
              {activeTab === "project" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4381C]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`text-xs font-semibold pb-1.5 transition-colors relative ${
                activeTab === "chat"
                  ? "text-slate-900 font-bold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Creative Chat
              {activeTab === "chat" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4381C]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("vault")}
              className={`text-xs font-semibold pb-1.5 transition-colors relative ${
                activeTab === "vault"
                  ? "text-slate-900 font-bold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Brand Vault
              {activeTab === "vault" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4381C]" />
              )}
            </button>
          </div>

          {/* Screen Content Body */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* VIEW 1: ACTIVE PROJECT ROOM */}
            {activeTab === "project" && (
              <div className="space-y-4">
                {/* Project Header */}
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#1E3A8A] font-bold">
                    Project Room #1042
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    Brand Identity &amp; Vector Kit
                  </h3>
                </div>

                {/* Assigned Local Creative Card */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                    <Image
                      src="/jose-creative.jpg"
                      alt="Jose Garcia"
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900">
                      Jose Garcia
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">
                      Illustrator &amp; Art Director &middot; Troy Univ
                    </div>
                    <div className="text-[10px] text-blue-700 font-semibold mt-0.5">
                      Matched Local Creative
                    </div>
                  </div>
                </div>

                {/* Deliverable Proof Review */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex justify-between items-center">
                    <span>Proof v2 Uploaded</span>
                    <button
                      type="button"
                      onClick={() => setIsZoomed(!isZoomed)}
                      className="text-[#D4381C] text-[11px] font-semibold hover:underline"
                    >
                      {isZoomed ? "Reset View" : "Tap to Inspect"}
                    </button>
                  </div>

                  <div
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group"
                  >
                    <Image
                      src="/project 7.jpg"
                      alt="Deliverable Proof"
                      fill
                      className={`object-cover transition-transform duration-200 ${
                        isZoomed ? "scale-115" : "group-hover:scale-105"
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/75 text-white text-[10px] rounded font-mono">
                      Pre-Flight Passed
                    </div>
                  </div>
                </div>

                {/* Project Milestone */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Milestone Status</span>
                  <span className="font-bold text-slate-900">4 Project Coins Allocated</span>
                </div>

                {/* Direct Action */}
                <button
                  type="button"
                  onClick={() => setApproved(!approved)}
                  className={`w-full py-3 rounded-lg text-xs font-bold transition-colors ${
                    approved
                      ? "bg-emerald-600 text-white"
                      : "bg-[#D4381C] hover:bg-[#BF2E14] text-white shadow-sm"
                  }`}
                >
                  {approved ? "✓ Deliverables Accepted & Completed" : "Review Deliverables"}
                </button>
              </div>
            )}

            {/* VIEW 2: CREATIVE CHAT */}
            {activeTab === "chat" && (
              <div className="space-y-3 flex flex-col h-full justify-between">
                <div className="space-y-2.5">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100 pb-1">
                    Direct Creative Channel
                  </div>

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                        msg.sender === "client"
                          ? "bg-[#1E3A8A] text-white rounded-tr-sm ml-auto"
                          : msg.sender === "creative"
                          ? "bg-slate-100 text-slate-800 rounded-tl-sm"
                          : "bg-blue-50 text-blue-900 border border-blue-200 text-center mx-auto max-w-[95%] text-[10px]"
                      }`}
                    >
                      {msg.sender === "creative" && (
                        <div className="text-[10px] font-bold text-[#1E3A8A] mb-0.5">
                          Jose Garcia
                        </div>
                      )}
                      {msg.text}
                    </div>
                  ))}
                </div>

                {/* Quick Reply Simulation */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="text-[10px] text-slate-400 font-medium">Quick Replies:</div>
                  <div className="flex flex-wrap gap-1">
                    {["Looks ready!", "Sign off now", "Send vectors"].map((quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => handleQuickSend(quick)}
                        className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                      >
                        {quick}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: BRAND VAULT */}
            {activeTab === "vault" && (
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#1E3A8A] font-bold">
                    Brand Vault
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    Client Assets Stored
                  </h3>
                </div>

                {/* File list */}
                <div className="space-y-2 pt-1">
                  {[
                    { name: "Logo_Master_Vector.svg", sub: "Scalable Vector Master" },
                    { name: "Brand_Styleguide.pdf", sub: "Print & Screen Color Specs" },
                    { name: "Apparel_Press_Pack.zip", sub: "Vector Asset Package" },
                  ].map((file) => (
                    <div
                      key={file.name}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{file.name}</div>
                        <div className="text-[10px] text-slate-500">{file.sub}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownload(file.name)}
                        className="font-bold text-[#D4381C] hover:text-[#BF2E14] text-[11px] transition-colors"
                      >
                        {downloadedItem === file.name ? "✓ Saved" : "Download"}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-center text-[11px] text-slate-500 font-medium">
                  Assets remain permanently stored in your Vault.
                </div>
              </div>
            )}
          </div>

          {/* Bottom Home Indicator */}
          <div className="pb-3 pt-2 flex items-center justify-center bg-white border-t border-slate-100">
            <div className="w-24 h-1 bg-slate-300 rounded-full" />
          </div>
        </div>
      </div>

      {/* Static Crisp Hardware Shadow */}
      <div className="w-[240px] h-4 bg-slate-900/20 blur-md rounded-full pointer-events-none mt-2" />
    </div>
  );
}
