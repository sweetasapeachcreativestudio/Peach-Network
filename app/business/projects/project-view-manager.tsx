"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FolderArchive,
  Layers,
  Sparkles,
  CheckCircle2,
  Search,
  ArrowRight,
  ExternalLink,
  Coins,
  FileCheck,
  Plus,
  AlertCircle,
  Archive,
  ChevronRight,
  Filter,
} from "lucide-react";
import { roomStatus } from "@/lib/project-room";

export interface ProjectItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  coin_amount: number;
  due_at: string | null;
  created_at: string;
  assigned_creative_id: string | null;
  revision_rounds: number;
}

interface ProjectViewManagerProps {
  initialProjects: ProjectItem[];
  creativeNames: Record<string, string>;
  initialView?: string;
  businessName: string;
  assetCount?: number;
}

const reviewStatuses = ["proof_uploaded", "submitted", "waiting_on_client"];

function getUrgencyBadge(status: string) {
  if (status === "proof_uploaded" || status === "submitted") {
    return {
      text: "Action Needed",
      subtext: "Proof ready for review",
      color: "bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-200/70",
      dot: "bg-amber-500",
      priority: 1,
    };
  }
  if (status === "waiting_on_client") {
    return {
      text: "Action Needed",
      subtext: "Feedback requested",
      color: "bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-200/70",
      dot: "bg-amber-500",
      priority: 1,
    };
  }
  if (status === "accepted") {
    return {
      text: "Kickoff Ready",
      subtext: "Creative connected",
      color: "bg-emerald-50 text-emerald-900 border-emerald-300",
      dot: "bg-emerald-500",
      priority: 2,
    };
  }
  if (status === "revisions") {
    return {
      text: "In Revision",
      subtext: "Designer applying edits",
      color: "bg-blue-50 text-blue-900 border-blue-200",
      dot: "bg-blue-500",
      priority: 3,
    };
  }
  if (status === "in_progress") {
    return {
      text: "In Progress",
      subtext: "Active production",
      color: "bg-slate-100 text-slate-800 border-slate-200",
      dot: "bg-slate-500",
      priority: 3,
    };
  }
  if (status === "matching" || status === "offer_sent") {
    return {
      text: "Matching",
      subtext: "Arranging creative match",
      color: "bg-orange-50 text-orange-900 border-orange-200",
      dot: "bg-orange-500",
      priority: 4,
    };
  }
  if (status === "completed") {
    return {
      text: "Delivered & Approved",
      subtext: "Deliverables archived",
      color: "bg-emerald-50 text-emerald-900 border-emerald-300",
      dot: "bg-emerald-600",
      priority: 5,
    };
  }
  if (status === "cancelled") {
    return {
      text: "Cancelled",
      subtext: "Coins credited",
      color: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
      priority: 6,
    };
  }
  return {
    text: roomStatus(status),
    subtext: "",
    color: "bg-slate-100 text-slate-800 border-slate-200",
    dot: "bg-slate-500",
    priority: 5,
  };
}

export function ProjectViewManager({
  initialProjects,
  creativeNames,
  initialView = "active",
  businessName,
  assetCount = 0,
}: ProjectViewManagerProps) {
  const searchParams = useSearchParams();

  // Primary React state for view toggling without any page reload
  const [viewMode, setViewMode] = useState<"active" | "archived" | "all">(
    initialView === "archived" || initialView === "archive"
      ? "archived"
      : initialView === "all"
      ? "all"
      : "active"
  );

  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubFilter, setActiveSubFilter] = useState<string>("all");
  const [archiveSubFilter, setArchiveSubFilter] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Keep state synchronized if URL view parameter changes
  useEffect(() => {
    const v = searchParams.get("view");
    if (v === "archived" || v === "archive") {
      setViewMode("archived");
    } else if (v === "all") {
      setViewMode("all");
    } else if (v === "active") {
      setViewMode("active");
    }
  }, [searchParams]);

  // Global listener for zero-reload switches from external buttons
  useEffect(() => {
    const handleCustomViewSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<"active" | "archived" | "all">;
      if (customEvent.detail) {
        setViewMode(customEvent.detail);
      }
    };
    window.addEventListener("peach:switch-project-view", handleCustomViewSwitch);
    return () => {
      window.removeEventListener("peach:switch-project-view", handleCustomViewSwitch);
    };
  }, []);

  // Instant view switcher (pure React state, no page reload)
  const handleToggleView = (mode: "active" | "archived" | "all") => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("view", mode);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    }
  };

  // Groupings
  const activeProjects = useMemo(
    () => initialProjects.filter((p) => !["completed", "cancelled"].includes(p.status)),
    [initialProjects]
  );

  const archivedProjects = useMemo(
    () => initialProjects.filter((p) => ["completed", "cancelled"].includes(p.status)),
    [initialProjects]
  );

  const completedCount = useMemo(
    () => archivedProjects.filter((p) => p.status === "completed").length,
    [archivedProjects]
  );

  const needsReviewCount = useMemo(
    () => activeProjects.filter((p) => reviewStatuses.includes(p.status)).length,
    [activeProjects]
  );

  // Available categories
  const allCategories = useMemo(() => {
    const set = new Set(initialProjects.map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [initialProjects]);

  // Filtered Active Projects (Urgency sorted)
  const filteredActive = useMemo(() => {
    let list = [...activeProjects];

    list.sort((a, b) => {
      const pA = getUrgencyBadge(a.status).priority;
      const pB = getUrgencyBadge(b.status).priority;
      if (pA !== pB) return pA - pB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    if (activeSubFilter === "review") {
      list = list.filter((p) => reviewStatuses.includes(p.status));
    } else if (activeSubFilter === "in_progress") {
      list = list.filter((p) => ["in_progress", "revisions"].includes(p.status));
    } else if (activeSubFilter === "kickoff") {
      list = list.filter((p) => ["accepted", "matching", "offer_sent"].includes(p.status));
    }

    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.assigned_creative_id &&
            (creativeNames[p.assigned_creative_id] || "").toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeProjects, activeSubFilter, selectedCategory, searchQuery, creativeNames]);

  // Filtered Archived Projects
  const filteredArchived = useMemo(() => {
    let list = [...archivedProjects];

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (archiveSubFilter === "completed") {
      list = list.filter((p) => p.status === "completed");
    } else if (archiveSubFilter === "cancelled") {
      list = list.filter((p) => p.status === "cancelled");
    }

    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.assigned_creative_id &&
            (creativeNames[p.assigned_creative_id] || "").toLowerCase().includes(q))
      );
    }

    return list;
  }, [archivedProjects, archiveSubFilter, selectedCategory, searchQuery, creativeNames]);

  // Filtered All Projects
  const filteredAll = useMemo(() => {
    let list = [...initialProjects];
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [initialProjects, selectedCategory, searchQuery]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ============================================================== */}
      {/* ADAPTIVE VISUAL FILTER BAR (Desktop, iPad, and Mobile Ready)    */}
      {/* ============================================================== */}
      <div className="bg-white border border-[#e7e1d9] rounded-2xl p-3 sm:p-4 md:p-5 shadow-xs">
        {/* Row 1: Segmented View Switcher + Search/Category controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Segmented Toggle: Adapts cleanly from phone to iPad to desktop */}
          <div className="grid grid-cols-3 p-1 bg-[#FAF8F5] border border-slate-200/90 rounded-xl w-full md:w-auto shadow-2xs">
            {/* Active Projects Tab */}
            <button
              type="button"
              onClick={() => handleToggleView("active")}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === "active"
                  ? "bg-[#0B2D22] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-white/80"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 shrink-0" />
                {needsReviewCount > 0 && viewMode !== "active" && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
              <span className="hidden sm:inline">Active Tasks</span>
              <span className="sm:hidden">Active</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  viewMode === "active"
                    ? "bg-[#167b5c] text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {activeProjects.length}
              </span>
            </button>

            {/* Archived Projects Tab */}
            <button
              type="button"
              onClick={() => handleToggleView("archived")}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === "archived"
                  ? "bg-[#0B2D22] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-white/80"
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5 text-[#167b5c] shrink-0" />
              <span className="hidden sm:inline">Archived</span>
              <span className="sm:hidden">Archive</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  viewMode === "archived"
                    ? "bg-[#167b5c] text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {archivedProjects.length}
              </span>
            </button>

            {/* All Projects Tab */}
            <button
              type="button"
              onClick={() => handleToggleView("all")}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === "all"
                  ? "bg-[#0B2D22] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-white/80"
              }`}
            >
              <span>All ({initialProjects.length})</span>
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex items-center gap-2 w-full md:w-auto md:flex-1 md:max-w-md">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  viewMode === "archived"
                    ? "Search archived titles or designers..."
                    : "Search active projects or keywords..."
                }
                className="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#EB6244] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            {allCategories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#FAF8F5] border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-700 font-semibold focus:outline-hidden focus:border-[#EB6244] cursor-pointer shrink-0 max-w-[130px] sm:max-w-none truncate"
              >
                <option value="all">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Row 2: Sub-Filter Pills Ribbon (Horizontally scrollable on mobile/iPad, cleanly wrapping on desktop) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 mt-2.5 border-t border-slate-100 text-xs">
          {/* Sub-Filters Ribbon with smooth scroll on iPad/Phone */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-1 px-1">
            {viewMode === "active" && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSubFilter("all")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer text-[11px] sm:text-xs ${
                    activeSubFilter === "all"
                      ? "bg-[#EB6244] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All ({activeProjects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubFilter("review")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer text-[11px] sm:text-xs ${
                    activeSubFilter === "review"
                      ? "bg-[#EB6244] text-white"
                      : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <span>Needs Review ({needsReviewCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubFilter("in_progress")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer text-[11px] sm:text-xs ${
                    activeSubFilter === "in_progress"
                      ? "bg-[#EB6244] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  In Progress ({activeProjects.filter((p) => ["in_progress", "revisions"].includes(p.status)).length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubFilter("kickoff")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer text-[11px] sm:text-xs ${
                    activeSubFilter === "kickoff"
                      ? "bg-[#EB6244] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Kickoff ({activeProjects.filter((p) => ["accepted", "matching", "offer_sent"].includes(p.status)).length})
                </button>
              </>
            )}

            {viewMode === "archived" && (
              <>
                <button
                  type="button"
                  onClick={() => setArchiveSubFilter("all")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer text-[11px] sm:text-xs ${
                    archiveSubFilter === "all"
                      ? "bg-[#0B2D22] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Archived ({archivedProjects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setArchiveSubFilter("completed")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer text-[11px] sm:text-xs ${
                    archiveSubFilter === "completed"
                      ? "bg-[#167b5c] text-white"
                      : "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Completed ({completedCount})</span>
                </button>
                {archivedProjects.some((p) => p.status === "cancelled") && (
                  <button
                    type="button"
                    onClick={() => setArchiveSubFilter("cancelled")}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer text-[11px] sm:text-xs ${
                      archiveSubFilter === "cancelled"
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Cancelled
                  </button>
                )}
              </>
            )}

            {viewMode === "all" && (
              <span className="text-[11px] text-slate-500 font-medium">
                {initialProjects.length} total projects across workspace
              </span>
            )}
          </div>

          {/* View Switch Shortcut */}
          <div className="shrink-0 text-[11px] font-semibold text-slate-600 self-end sm:self-auto">
            {viewMode === "active" ? (
              <button
                type="button"
                onClick={() => handleToggleView("archived")}
                className="text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View {completedCount} in archive →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleView("active")}
                className="text-[#EB6244] hover:text-[#d85538] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>← Back to {activeProjects.length} active tasks</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. ACTIVE TASKS VIEW (Responsive Card Grid)                     */}
      {/* ============================================================== */}
      {viewMode === "active" && (
        <div className="space-y-3.5 sm:space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span>Active Collaborations</span>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {filteredActive.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
                Tasks needing your proof review or feedback are prioritized at the top.
              </p>
            </div>
            <Link
              href="/business/new-project"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EB6244] hover:bg-[#d85538] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start Project</span>
            </Link>
          </div>

          {filteredActive.length > 0 ? (
            <div className="grid gap-3 sm:gap-3.5">
              {filteredActive.map((project) => {
                const urgency = getUrgencyBadge(project.status);
                const isActionNeeded = reviewStatuses.includes(project.status);
                const creativeName = project.assigned_creative_id
                  ? creativeNames[project.assigned_creative_id] || "Assigned Creative"
                  : null;

                return (
                  <article
                    key={project.id}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-2xs hover:shadow-sm ${
                      isActionNeeded
                        ? "border-amber-400 bg-[#fffdfa] ring-2 ring-amber-100"
                        : project.status === "accepted"
                        ? "border-emerald-300 bg-[#fafdfb]"
                        : "border-[#e7e1d9]"
                    }`}
                  >
                    {/* Top Topline: Status Badge, Category, Due date */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border ${urgency.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
                          <span>{urgency.text}</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {project.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1 text-[#EB6244]">
                          <Coins className="w-3.5 h-3.5 shrink-0" />
                          <span>{project.coin_amount} Coins</span>
                        </span>
                        {project.due_at && (
                          <span className="text-slate-400 font-normal text-[11px] hidden xs:inline">
                            &bull; Due {new Date(project.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="mb-2.5">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {project.description || "Review project specifications, communicate with your creative, and inspect active proofs."}
                      </p>
                    </div>

                    {/* Footer Row: Designer & Actions */}
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 text-[11px] sm:text-xs truncate">
                        <span className="text-slate-400">Creative:</span>
                        {creativeName ? (
                          <span className="font-bold text-slate-800 truncate">
                            ✦ {creativeName}
                          </span>
                        ) : (
                          <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-semibold text-[11px]">
                            Matching
                          </span>
                        )}
                        {project.due_at && (
                          <span className="text-slate-400 xs:hidden">
                            &bull; Due {new Date(project.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end xs:self-auto shrink-0">
                        <Link
                          href={`/projects/${project.id}#chat`}
                          className="px-2.5 py-1.5 text-slate-600 hover:text-slate-950 font-bold text-xs hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Message
                        </Link>
                        <Link
                          href={`/projects/${project.id}`}
                          className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                            isActionNeeded
                              ? "bg-[#EB6244] hover:bg-[#d85538] text-white"
                              : "bg-[#0B2D22] hover:bg-[#164e3c] text-white"
                          }`}
                        >
                          <span>{isActionNeeded ? "Review Proof" : "Open Room"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-[#e7e1d9] rounded-2xl p-6 sm:p-8 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#EB6244] mx-auto flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                {searchQuery || selectedCategory !== "all"
                  ? "No active projects match your search."
                  : "No active projects right now."}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || selectedCategory !== "all"
                  ? "Try resetting your filter or search terms."
                  : "Start your next design request to match with a local vetted commercial designer."}
              </p>
              <div className="pt-1 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleView("archived")}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  View Archive ({archivedProjects.length})
                </button>
                <Link
                  href="/business/new-project"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#EB6244] hover:bg-[#d85538] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start Project</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. ARCHIVED PROJECTS VIEW (Clean Responsive Layout)             */}
      {/* ============================================================== */}
      {viewMode === "archived" && (
        <div className="space-y-3.5 sm:space-y-4">
          {/* Archive Banner Header */}
          <div className="bg-gradient-to-br from-[#FAF8F5] via-[#F8F4EE] to-[#EFE7DA] border border-[#e7e1d9] rounded-2xl p-3.5 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#167b5c] uppercase tracking-wider">
                  <FolderArchive className="w-3 h-3" />
                  <span>Historical Deliverables Archive</span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Completed &amp; Approved Deliverables
                </h2>
                <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
                  Final proofs, vector assets, and commercial licenses remain preserved here indefinitely.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <Link
                  href="/business/vault"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-2xs transition-colors"
                >
                  <span>Brand Vault ({assetCount})</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Archived Project Cards */}
          {filteredArchived.length > 0 ? (
            <div className="grid gap-3 sm:gap-3.5">
              {filteredArchived.map((project) => {
                const creativeName = project.assigned_creative_id
                  ? creativeNames[project.assigned_creative_id] || "Peach Designer"
                  : "Creative Partner";

                const isCompleted = project.status === "completed";

                return (
                  <article
                    key={project.id}
                    className="bg-white rounded-2xl border border-[#e7e1d9] hover:border-slate-300 p-4 sm:p-5 transition-all shadow-2xs hover:shadow-xs"
                  >
                    {/* Top Row: Completed badge, category, date */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Delivered &amp; Approved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200">
                            <Archive className="w-3 h-3 text-slate-400" />
                            <span>Cancelled</span>
                          </span>
                        )}

                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {project.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1 text-slate-700 font-bold">
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                          <span>{project.coin_amount} Coins</span>
                        </span>
                        <span className="hidden xs:inline">&bull;</span>
                        <span className="text-[11px] hidden xs:inline">
                          {new Date(project.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="mb-2.5">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {project.description || "Final proofs, design files, and communication history preserved."}
                      </p>
                    </div>

                    {/* Footer Row */}
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 text-[11px] sm:text-xs">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Delivered by <strong className="text-slate-800">{creativeName}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 self-end xs:self-auto shrink-0">
                        <Link
                          href={`/business/new-project?category=${encodeURIComponent(project.category)}&title=${encodeURIComponent(`Follow-up: ${project.title}`)}`}
                          className="px-2.5 py-1.5 text-slate-600 hover:text-[#EB6244] font-bold text-xs hover:bg-orange-50 rounded-lg transition-colors hidden sm:inline-flex"
                        >
                          + Similar
                        </Link>

                        <Link
                          href="/business/vault"
                          className="px-2.5 py-1.5 text-slate-700 hover:text-slate-950 font-bold text-xs hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Vault
                        </Link>

                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#0B2D22] hover:bg-[#164e3c] text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                        >
                          <span>Room &amp; Files</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-[#e7e1d9] rounded-2xl p-6 sm:p-8 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                <FolderArchive className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                {searchQuery || selectedCategory !== "all"
                  ? "No archived projects match your search."
                  : "No completed projects in the archive yet."}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || selectedCategory !== "all"
                  ? "Try resetting your search query or category filter."
                  : "Once active tasks reach final sign-off, their deliverables are stored here."}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleToggleView("active")}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Switch to Active Tasks ({activeProjects.length})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ALL PROJECTS VIEW (Complete Chronological List)              */}
      {/* ============================================================== */}
      {viewMode === "all" && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>All Workspace Projects</span>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredAll.length}
              </span>
            </h2>
            <Link
              href="/business/new-project"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EB6244] hover:bg-[#d85538] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start Project</span>
            </Link>
          </div>

          <div className="grid gap-2.5">
            {filteredAll.map((project) => {
              const isArchived = ["completed", "cancelled"].includes(project.status);
              const urgency = getUrgencyBadge(project.status);
              const creativeName = project.assigned_creative_id
                ? creativeNames[project.assigned_creative_id] || "Assigned Creative"
                : "Finding Creative";

              return (
                <div
                  key={project.id}
                  className="bg-white border border-[#e7e1d9] rounded-xl p-3.5 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-md text-[10px] font-extrabold uppercase border ${urgency.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
                        <span>{urgency.text}</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {project.category}
                      </span>
                      {isArchived && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                          Archived
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{project.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Creative: {creativeName} &bull; {project.coin_amount} Coins
                    </p>
                  </div>

                  <div className="self-end xs:self-auto shrink-0">
                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#EB6244] hover:text-[#d85538] px-2.5 py-1 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <span>{isArchived ? "Archive" : "Room"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
