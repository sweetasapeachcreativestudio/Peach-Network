"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Calendar, Star, ArrowRight, X, ChevronRight, Users, Award } from "lucide-react";

interface Announcement {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  dateOrSubtitle: string;
  description: string;
  actionText: string;
  actionHref: string;
  icon: React.ReactNode;
}

const defaultAnnouncements: Announcement[] = [
  {
    id: "event-1",
    badge: "Upcoming Event",
    badgeColor: "bg-orange-50 text-[#EB6244] border-orange-200",
    title: "Peach Birmingham Commercial Design Mixer & Pitch Night",
    dateOrSubtitle: "Thursday, Nov 14 · 6:30 PM CST · The Battery, Birmingham",
    description:
      "Connect with vetted local creative directors, commercial photographers, and brand strategists. Free admission for Peach Network business partners.",
    actionText: "Reserve Business Pass",
    actionHref: "/network",
    icon: <Calendar className="w-4 h-4 text-[#EB6244]" />,
  },
  {
    id: "spotlight-1",
    badge: "Highlighted Creative",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    title: "Creative Spotlight: Maya Patel – Packaging & 3D Render Lead",
    dateOrSubtitle: "✦ Peach Verified Pro · 100% On-Time Delivery · 24 Completed Commercial Briefs",
    description:
      "Specializing in retail beverage packaging, custom die-lines, and 3D mockups for regional consumer product brands in the Southeast.",
    actionText: "View Featured Work",
    actionHref: "/network?highlight=maya",
    icon: <Award className="w-4 h-4 text-emerald-600" />,
  },
  {
    id: "sprint-1",
    badge: "Business Opportunity",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    title: "Q4 Commercial Packaging & Holiday Retail Sprints",
    dateOrSubtitle: "Priority local creative matches now open for seasonal retail rollouts",
    description:
      "Get guaranteed 5-day turnaround on festive packaging, holiday menu rollouts, and gift packaging before print vendor deadlines.",
    actionText: "Scope Sprint with AI",
    actionHref: "#peach-match-ai",
    icon: <Sparkles className="w-4 h-4 text-blue-600" />,
  },
];

export function EventAnnouncements() {
  const [activeTab, setActiveTab] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const current = defaultAnnouncements[activeTab];

  return (
    <div className="bg-gradient-to-r from-[#FAF8F5] via-[#FFFBF7] to-[#F7F2EB] border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 shadow-2xs relative overflow-hidden transition-all">
      {/* Top Controls: Badges + Switcher + Dismiss */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DFD3]/70">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {defaultAnnouncements.map((ann, idx) => (
            <button
              key={ann.id}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === idx
                  ? "bg-[#173328] text-white shadow-2xs"
                  : "bg-white/80 hover:bg-white text-stone-700 border border-[#E8DFD3]"
              }`}
            >
              <span>{ann.badge}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-[11px] text-stone-500 font-medium">
            {activeTab + 1} of {defaultAnnouncements.length}
          </span>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            title="Dismiss announcement banner"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="flex items-center gap-1 font-bold text-stone-900">
              {current.icon}
              <span>{current.badge}</span>
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-600 font-semibold">{current.dateOrSubtitle}</span>
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-stone-950 tracking-tight leading-snug">
            {current.title}
          </h3>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
            {current.description}
          </p>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center gap-2 pt-1 md:pt-0">
          <Link
            href={current.actionHref}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#EB6244] hover:bg-[#d85538] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all whitespace-nowrap"
          >
            <span>{current.actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
