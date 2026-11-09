"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CreativeCandidate {
  id: string;
  name: string;
  avatar_url: string;
  headline: string;
  hub: string;
  reliability_score: number;
  match_score: number;
}

const HUB_CREATIVES_FALLBACK: CreativeCandidate[] = [
  {
    id: "cr_maya",
    name: "Maya Brooks",
    avatar_url: "/people/maya.jpg",
    headline: "Brand & Campaign Identity",
    hub: "Atlanta Hub",
    reliability_score: 99,
    match_score: 98,
  },
  {
    id: "cr_jordan",
    name: "Jordan Ellis",
    avatar_url: "/Creative1.JPG",
    headline: "Sports & Event Graphics",
    hub: "Birmingham Hub",
    reliability_score: 96,
    match_score: 95,
  },
  {
    id: "cr_nia",
    name: "Nia Carter",
    avatar_url: "/Creative2.jpg",
    headline: "Web & Digital Experience",
    hub: "Birmingham Hub",
    reliability_score: 98,
    match_score: 94,
  },
  {
    id: "cr_elijah",
    name: "Elijah Vance",
    avatar_url: "/people/elijah.jpg",
    headline: "Packaging & Print Production",
    hub: "Birmingham Hub",
    reliability_score: 98,
    match_score: 93,
  },
  {
    id: "cr_sophie",
    name: "Sophie Chen",
    avatar_url: "/people/sophie.jpg",
    headline: "Custom Illustration & Editorial",
    hub: "Huntsville Hub",
    reliability_score: 99,
    match_score: 92,
  },
  {
    id: "cr_avery",
    name: "Avery Thomas",
    avatar_url: "/Creative 3.jpg",
    headline: "Short-Form Video & Motion",
    hub: "Montgomery Hub",
    reliability_score: 97,
    match_score: 91,
  },
];

interface DoorDashDispatchTrackerProps {
  projectId: string;
  projectTitle: string;
  category: string;
  coins: number;
  creativeName?: string | null;
  creativeAvatar?: string | null;
  creativeSpecialty?: string | null;
  creativeHub?: string | null;
  status: string;
  onAccepted?: () => void;
}

export function DoorDashDispatchTracker({
  projectId,
  projectTitle,
  category,
  coins,
  creativeName = "Jordan Ellis",
  creativeAvatar = "/Creative1.JPG",
  creativeSpecialty = "Commercial Graphics",
  creativeHub = "Birmingham Hub",
  status,
  onAccepted,
}: DoorDashDispatchTrackerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAlternativeCreatives, setShowAlternativeCreatives] = useState(false);
  const [activeStep, setActiveStep] = useState(2); // Step 3: Creative Reviewing Brief
  const [currentCreative, setCurrentCreative] = useState({
    name: creativeName || "Jordan Ellis",
    avatar: creativeAvatar || "/Creative1.JPG",
    specialty: creativeSpecialty || "Commercial Graphics",
    hub: creativeHub || "Birmingham Hub",
  });
  const [notice, setNotice] = useState("");

  // DoorDash timeline stages
  const steps = [
    {
      title: "Project Dispatched",
      desc: `${coins} Coins held in escrow`,
      status: "done",
    },
    {
      title: `Routing to ${currentCreative.name}`,
      desc: `${currentCreative.hub} roster`,
      status: "done",
    },
    {
      title: "Creative Reviewing Brief",
      desc: "24-hour acceptance clock running",
      status: activeStep === 2 ? "active" : activeStep > 2 ? "done" : "pending",
    },
    {
      title: "Workspace Kickoff",
      desc: "Live board, files & revisions",
      status: activeStep >= 3 ? "done" : "pending",
    },
  ];

  // Creative accepts the offer
  const handleSimulateAccept = async () => {
    setLoading(true);
    setNotice("");
    try {
      const res = await fetch("/api/projects/simulate-acceptance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, action: "accept" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not accept offer.");

      setActiveStep(3);
      setNotice("Offer accepted! Entering active project room...");
      setTimeout(() => {
        if (onAccepted) onAccepted();
        router.refresh();
      }, 700);
    } catch (err: any) {
      setNotice(err.message || "Action failed.");
      setLoading(false);
    }
  };

  // Creative declines / choose another creative
  const handleSimulateDecline = async () => {
    setLoading(true);
    setNotice("");
    try {
      const res = await fetch("/api/projects/simulate-acceptance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, action: "decline" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not decline.");

      setShowAlternativeCreatives(true);
      setNotice("Creative was unavailable. Choose another creative from the Hub below:");
    } catch (err: any) {
      setNotice(err.message || "Action failed.");
    } finally {
      setLoading(false);
    }
  };

  // Switch to another creative from Hub
  const handleSelectAlternativeCreative = async (cand: CreativeCandidate) => {
    setLoading(true);
    setNotice("");
    try {
      const res = await fetch("/api/projects/request-creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, creativeId: cand.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not assign alternative creative.");

      setCurrentCreative({
        name: cand.name,
        avatar: cand.avatar_url,
        specialty: cand.headline,
        hub: cand.hub,
      });
      setShowAlternativeCreatives(false);
      setActiveStep(2);
      setNotice(`Dispatched to ${cand.name} (${cand.hub}). 24-hour acceptance clock restarted.`);
      router.refresh();
    } catch (err: any) {
      setNotice(err.message || "Failed to switch creative.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-[#C84E2D] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 my-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F2C2B2]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-white bg-[#C84E2D] px-2.5 py-0.5 rounded-full">
              Live Dispatch Tracker
            </span>
            <span className="text-xs text-slate-500 font-bold">
              DoorDash-Style Match Flow
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
            {projectTitle}
          </h2>
          <div className="text-xs text-slate-600 font-semibold mt-0.5">
            {category} &bull; <strong className="text-[#C84E2D]">{coins} Peach Coins</strong> (${coins * 50} USD held in escrow) &bull; 3 Revisions Included
          </div>
        </div>

        <Link
          href="/business/projects"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto"
        >
          &larr; All Projects
        </Link>
      </div>

      {notice && (
        <div className="p-3.5 bg-[#FFF2EB] border-l-4 border-[#C84E2D] rounded-r-xl text-xs text-slate-800 font-bold">
          {notice}
        </div>
      )}

      {/* DOORDASH STYLE DISPATCH PROGRESS TRACKER */}
      <div className="bg-[#FFF8F5] border border-[#F2C2B2] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#A33B1E]">
          <span>Dispatch Timeline</span>
          <span className="animate-pulse">Live Status: Awaiting Creative Acceptance</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {steps.map((st, idx) => {
            const isDone = st.status === "done";
            const isActive = st.status === "active";
            return (
              <div
                key={idx}
                className={`relative p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isDone
                    ? "bg-white border-emerald-300 text-slate-900"
                    : isActive
                    ? "bg-white border-[#C84E2D] ring-2 ring-[#C84E2D]/20 text-slate-950 shadow-xs"
                    : "bg-stone-50/70 border-slate-200 text-slate-400"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        isDone
                          ? "bg-emerald-600 text-white"
                          : isActive
                          ? "bg-[#C84E2D] text-white animate-bounce"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isDone ? "✓" : idx + 1}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-black text-[#C84E2D] bg-[#FFF2EB] px-1.5 py-0.5 rounded uppercase">
                        Current
                      </span>
                    )}
                  </div>
                  <strong className="text-xs font-black block mt-1 leading-snug">
                    {st.title}
                  </strong>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DISPATCHED CREATIVE CARD */}
      <div className="bg-white border-2 border-[#F2C2B2] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentCreative.avatar}
            alt={currentCreative.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#C84E2D] shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-base font-black text-slate-950">
                {currentCreative.name}
              </strong>
              <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#C84E2D] px-2 py-0.5 rounded-full">
                {currentCreative.hub}
              </span>
            </div>
            <div className="text-xs text-slate-600 font-semibold">
              {currentCreative.specialty}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Assigned via Peach Match AI &bull; 24-hour acceptance window in effect
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSimulateAccept}
            disabled={loading}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer transition-colors"
          >
            {loading ? "Accepting..." : "Creative Accepts Offer (Kickoff Project)"}
          </button>
          <button
            type="button"
            onClick={handleSimulateDecline}
            disabled={loading}
            className="px-3.5 py-2.5 bg-[#FFF2EB] hover:bg-[#FFE3D6] text-[#C84E2D] border border-[#E9A995] rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Choose Another Creative
          </button>
        </div>
      </div>

      {/* ALTERNATIVE CREATIVES FROM HUB (IF CREATIVE UNAVAILABLE OR REQUESTED) */}
      {showAlternativeCreatives && (
        <div className="p-5 bg-[#FFF8F5] border-2 border-[#C84E2D] rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight">
              Select Another Creative from the Hub:
            </h3>
            <p className="text-xs text-slate-600">
              Pick another approved specialist to dispatch this project to immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {HUB_CREATIVES_FALLBACK.filter((c) => c.name !== currentCreative.name).slice(0, 3).map((cand) => (
              <div
                key={cand.id}
                className="bg-white border border-[#E9A995] rounded-xl p-3.5 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={cand.avatar_url}
                    alt={cand.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <strong className="text-xs font-black text-slate-950 truncate block">
                      {cand.name}
                    </strong>
                    <div className="text-[11px] text-slate-500 truncate">
                      {cand.headline}
                    </div>
                    <div className="text-[10px] text-[#C84E2D] font-black uppercase">
                      {cand.hub}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectAlternativeCreative(cand)}
                  disabled={loading}
                  className="w-full py-2 bg-[#C84E2D] hover:bg-[#A33B1E] text-white rounded-lg text-xs font-black transition-colors cursor-pointer"
                >
                  Dispatch to {cand.name.split(" ")[0]}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
