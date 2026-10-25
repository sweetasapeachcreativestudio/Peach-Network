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
  Filter,
  ArrowRight,
  ExternalLink,
  Coins,
  FileCheck,
  Plus,
  AlertCircle,
  Archive,
  ChevronRight,
  Clock,
  RotateCcw,
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
      text: "Action Needed: Proof Ready for Review",
      color: "bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-200",
      dot: "bg-amber-500",
      priority: 1,
    };
  }
  if (status === "waiting_on_client") {
    return {
      text: "Action Needed: Waiting on Your Feedback",
      color: "bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-200",
      dot: "bg-amber-500",
      priority: 1,
    };
  }
  if (status === "accepted") {
    return {
      text: "Kickoff Ready: Creative Assigned",
      color: "bg-emerald-50 text-emerald-900 border-emerald-200",
      dot: "bg-emerald-500",
      priority: 2,
    };
  }
  if (status === "revisions") {
    return {
      text: "Creative Applying Your Revisions",
      color: "bg-blue-50 text-blue-900 border-blue-200",
      dot: "bg-blue-500",
      priority: 3,
    };
  }
  if (status === "in_progress") {
    return {
      text: "Work in Progress",
      color: "bg-slate-100 text-slate-800 border-slate-200",
      dot: "bg-slate-500",
      priority: 3,
    };
  }
  if (status === "matching" || status === "offer_sent") {
    return {
      text: "Peach Match in Motion",
      color: "bg-orange-50 text-orange-900 border-orange-200",
      dot: "bg-orange-500",
      priority: 4,
    };
  }
  if (status === "completed") {
    return {
      text: "Delivered & Approved",
      color: "bg-emerald-50 text-emerald-900 border-emerald-300",
      dot: "bg-emerald-600",
      priority: 5,
    };
  }
  if (status === "cancelled") {
    return {
      text: "Cancelled & Refunded",
      color: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
      priority: 6,
    };
  }
  return {
    text: roomStatus(status),
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

  // Primary React state for toggling views without page reload
  const [viewMode, setViewMode] = useState<"active" | "archived" | "all">(
    initialView === "archived" || initialView === "archive"
      ? "archived"
      : initialView === "all"
      ? "all"
      : "active"
  );

  // Sub-filters & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubFilter, setActiveSubFilter] = useState<string>("all");
  const [archiveSubFilter, setArchiveSubFilter] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Sync initial query param if user lands with ?view=archived
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

  // Listen for global custom event so external elements can trigger state switch
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

  // Handler for visual filter bar tabs (toggles view state with zero page reload)
  const handleToggleView = (mode: "active" | "archived" | "all") => {
    setViewMode(mode);
    // Quietly update the browser history URL without triggering a Next.js RSC fetch or reload
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

  // Available categories for dropdown filter
  const allCategories = useMemo(() => {
    const set = new Set(initialProjects.map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [initialProjects]);

  // Filtered Active Projects
  const filteredActive = useMemo(() => {
    let list = [...activeProjects];

    // Priority sort: items needing review first, then kickoff, in_progress, matching
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

    // Sort by latest completed date first
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

  // All Projects
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
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* VISUAL FILTER BAR: SEPARATES ACTIVE TASKS FROM ARCHIVED WORK   */}
      {/* ============================================================== */}
      <div className="bg-white border-2 border-[#e7e1d9] rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
        {/* Top Filter Bar Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Segmented Mode Switcher (Pure React State, Zero Reload) */}
          <div className="inline-flex p-1.5 bg-[#FAF8F5] border border-slate-200 rounded-xl shadow-2xs self-start sm:self-auto">
            {/* Active Projects Tab */}
            <button
              type="button"
              onClick={() => handleToggleView("active")}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "active"
                  ? "bg-[#0B2D22] text-white shadow-sm ring-1 ring-[#0B2D22]"
                  : "text-slate-600 hover:text-slate-950 hover:bg-white/70"
              }`}
              aria-label="View active projects"
            >
              <div className="relative flex items-center justify-center">
                <Layers className="w-4 h-4" />
                {needsReviewCount > 0 && viewMode !== "active" && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
              <span>Active Tasks</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
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
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "archived"
                  ? "bg-[#0B2D22] text-white shadow-sm ring-1 ring-[#0B2D22]"
                  : "text-slate-600 hover:text-slate-950 hover:bg-white/70"
              }`}
              aria-label="View archived projects"
            >
              <FolderArchive className="w-4 h-4 text-[#167b5c]" />
              <span>Archived Projects</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
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
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "all"
                  ? "bg-[#0B2D22] text-white shadow-sm ring-1 ring-[#0B2D22]"
                  : "text-slate-600 hover:text-slate-950 hover:bg-white/70"
              }`}
              aria-label="View all projects"
            >
              <span>All ({initialProjects.length})</span>
            </button>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex items-center gap-2.5 flex-1 max-w-lg">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  viewMode === "archived"
                    ? "Search archived titles or creatives..."
                    : "Search active projects or keywords..."
                }
                className="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl pl-9 pr-7 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#EB6244] transition-colors"
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

            {/* Category Dropdown Filter */}
            {allCategories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#FAF8F5] border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 font-semibold focus:outline-hidden focus:border-[#EB6244] cursor-pointer"
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

        {/* Sub-Filters Ribbon: Mode-Specific Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100 text-xs">
          {/* Active Mode Sub-Filters */}
          {viewMode === "active" && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setActiveSubFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeSubFilter === "all"
                    ? "bg-[#EB6244] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Active ({activeProjects.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveSubFilter("review")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
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
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
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
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeSubFilter === "kickoff"
                    ? "bg-[#EB6244] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Matching &amp; Kickoff ({activeProjects.filter((p) => ["accepted", "matching", "offer_sent"].includes(p.status)).length})
              </button>
            </div>
          )}

          {/* Archived Mode Sub-Filters */}
          {viewMode === "archived" && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Archive Filter:
              </span>
              <button
                type="button"
                onClick={() => setArchiveSubFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
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
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  archiveSubFilter === "completed"
                    ? "bg-[#167b5c] text-white"
                    : "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Completed Deliveries ({completedCount})</span>
              </button>
              {archivedProjects.some((p) => p.status === "cancelled") && (
                <button
                  type="button"
                  onClick={() => setArchiveSubFilter("cancelled")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    archiveSubFilter === "cancelled"
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Cancelled ({archivedProjects.filter((p) => p.status === "cancelled").length})
                </button>
              )}
            </div>
          )}

          {viewMode === "all" && (
            <div className="text-[11px] text-slate-500 font-medium">
              Showing all historical projects across active and archived states ({initialProjects.length} total)
            </div>
          )}

          {/* Mode Description & Direct Switch Link */}
          <div className="text-[11px] text-slate-600 font-medium flex items-center gap-2">
            {viewMode === "active" ? (
              <button
                type="button"
                onClick={() => handleToggleView("archived")}
                className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View {completedCount} completed project{completedCount === 1 ? "" : "s"} in archive →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleView("active")}
                className="text-[#EB6244] hover:text-[#d85538] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>← Back to {activeProjects.length} active task{activeProjects.length === 1 ? "" : "s"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: ACTIVE TASKS (Prioritizes Active & Action-Needed Work)   */}
      {/* ============================================================== */}
      {viewMode === "active" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span>Active Collaborations in Motion</span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {filteredActive.length} shown
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tasks sorted by urgency: proof reviews and client check-ins are prioritized first.
              </p>
            </div>
            <Link
              href="/business/new-project"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EB6244] hover:bg-[#d85538] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start Project</span>
            </Link>
          </div>

          {filteredActive.length > 0 ? (
            <div className="grid gap-3.5">
              {filteredActive.map((project) => {
                const urgency = getUrgencyBadge(project.status);
                const isActionNeeded = reviewStatuses.includes(project.status);
                const creativeName = project.assigned_creative_id
                  ? creativeNames[project.assigned_creative_id] || "Assigned Creative"
                  : null;

                return (
                  <article
                    key={project.id}
                    className={`bg-white rounded-2xl border p-5 transition-all shadow-xs hover:shadow-md ${
                      isActionNeeded
                        ? "border-amber-400 bg-[#fffdf9] ring-2 ring-amber-100"
                        : project.status === "accepted"
                        ? "border-emerald-300 bg-[#fafdfb]"
                        : "border-[#e7e1d9]"
                    }`}
                  >
                    {/* Top Row: Urgency Badge, Category, Peach Coins */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border ${urgency.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
                          {urgency.text}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {project.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1 text-[#EB6244]">
                          <Coins className="w-3.5 h-3.5" />
                          <span>{project.coin_amount} Peach Coins</span>
                        </span>
                        {project.due_at && (
                          <span className="text-slate-400 font-normal">
                            &bull; Due {new Date(project.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="mb-3">
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {project.description || "Open the project room to review briefs, proofs, and communication."}
                      </p>
                    </div>

                    {/* Footer Row: Creative Name & Action Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="font-semibold text-slate-500 text-[11px]">Creative:</span>
                        {creativeName ? (
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <span>✦</span>
                            <span>{creativeName}</span>
                          </span>
                        ) : (
                          <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                            Peach Match in progress
                          </span>
                        )}
                        {project.revision_rounds > 0 && (
                          <span className="text-[11px] text-slate-400">
                            &bull; {project.revision_rounds} revision round{project.revision_rounds === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/projects/${project.id}#chat`}
                          className="px-3 py-1.5 text-slate-700 hover:text-slate-950 font-bold text-xs hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Message
                        </Link>
                        <Link
                          href={`/projects/${project.id}`}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                            isActionNeeded
                              ? "bg-[#EB6244] hover:bg-[#d85538] text-white"
                              : "bg-[#0B2D22] hover:bg-[#164e3c] text-white"
                          }`}
                        >
                          <span>{isActionNeeded ? "Review Proof" : "Open Project Room"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-[#e7e1d9] rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#EB6244] mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {searchQuery || selectedCategory !== "all"
                  ? "No active projects match your filters."
                  : "No active projects in motion."}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || selectedCategory !== "all"
                  ? "Try resetting your search query or category filter."
                  : "All current requests may be completed. You can view finished projects in the archive or start a new request."}
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleView("archived")}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  View Completed Archive ({archivedProjects.length})
                </button>
                <Link
                  href="/business/new-project"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EB6244] hover:bg-[#d85538] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start New Project</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: ARCHIVED & COMPLETED PROJECTS (Dedicated Archive View)  */}
      {/* ============================================================== */}
      {viewMode === "archived" && (
        <div className="space-y-4">
          {/* Archive Explainer Banner */}
          <div className="bg-gradient-to-br from-[#FAF8F5] via-[#F8F4EE] to-[#EFE7DA] border-2 border-[#e7e1d9] rounded-2xl p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#167b5c] uppercase tracking-wider">
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>Permanent Project Archive &bull; {businessName}</span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Completed &amp; Delivered Work
                </h2>
                <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                  Every completed collaboration is permanently archived here. All final vector files, approved
                  proofs, and commercial production packages remain downloadable anytime and sync directly into your Brand Vault.
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                <Link
                  href="/business/vault"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-2xs transition-colors"
                >
                  <span>Brand Vault ({assetCount} assets)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <span className="text-[11px] font-semibold text-slate-500">
                  {completedCount} approved project{completedCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>

          {/* Archived Project Cards */}
          {filteredArchived.length > 0 ? (
            <div className="grid gap-3.5">
              {filteredArchived.map((project) => {
                const creativeName = project.assigned_creative_id
                  ? creativeNames[project.assigned_creative_id] || "Peach Creative"
                  : "Creative Partner";

                const isCompleted = project.status === "completed";

                return (
                  <article
                    key={project.id}
                    className="bg-white rounded-2xl border border-[#e7e1d9] hover:border-slate-300 p-5 transition-all shadow-xs hover:shadow-md"
                  >
                    {/* Top Row: Completed Badge, Category, Date */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-900 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Delivered &amp; Approved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200">
                            <Archive className="w-3.5 h-3.5 text-slate-400" />
                            <span>Cancelled</span>
                          </span>
                        )}

                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {project.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1 text-slate-700 font-bold">
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                          <span>{project.coin_amount} Coins</span>
                        </span>
                        <span>&bull;</span>
                        <span>
                          {project.due_at
                            ? `Delivered ${new Date(project.due_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}`
                            : `Archived ${new Date(project.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}`}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="mb-3">
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {project.description || "Complete production files, design specs, and final proof sign-offs are archived in the room."}
                      </p>
                    </div>

                    {/* Archive Info & Quick Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Delivered by {creativeName}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          &bull; Full proof &amp; chat history preserved
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/business/new-project?category=${encodeURIComponent(project.category)}&title=${encodeURIComponent(`Follow-up: ${project.title}`)}`}
                          className="px-3 py-1.5 text-slate-600 hover:text-[#EB6244] font-bold text-xs hover:bg-orange-50 rounded-lg transition-colors hidden sm:inline-flex"
                        >
                          + Re-order / Similar
                        </Link>

                        <Link
                          href="/business/vault"
                          className="px-3 py-1.5 text-slate-700 hover:text-slate-950 font-bold text-xs hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Vault Assets
                        </Link>

                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B2D22] hover:bg-[#164e3c] text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                        >
                          <span>View Room &amp; Files</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-[#e7e1d9] rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                <FolderArchive className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {searchQuery || selectedCategory !== "all"
                  ? "No archived projects match your search."
                  : "No completed projects in the archive yet."}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search terms or clearing the category filter."
                  : "Once active tasks reach final approval and sign-off, their complete deliverables will be permanently archived here."}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleToggleView("active")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>Switch to Active Tasks ({activeProjects.length})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: ALL PROJECTS (Complete Workspace Index)                 */}
      {/* ============================================================== */}
      {viewMode === "all" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span>Complete Project Index</span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {filteredAll.length} total
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full chronological overview of active and historical requests for {businessName}.
              </p>
            </div>
            <Link
              href="/business/new-project"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EB6244] hover:bg-[#d85538] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start Project</span>
            </Link>
          </div>

          <div className="grid gap-3">
            {filteredAll.map((project) => {
              const isArchived = ["completed", "cancelled"].includes(project.status);
              const urgency = getUrgencyBadge(project.status);
              const creativeName = project.assigned_creative_id
                ? creativeNames[project.assigned_creative_id] || "Assigned Creative"
                : "Finding Creative";

              return (
                <div
                  key={project.id}
                  className="bg-white border border-[#e7e1d9] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${urgency.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
                        {urgency.text}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {project.category}
                      </span>
                      {isArchived && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          Archived
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{project.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Creative: {creativeName} &bull; {project.coin_amount} Coins &bull;{" "}
                      {new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#EB6244] hover:text-[#d85538] px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <span>{isArchived ? "View Archive" : "Open Room"}</span>
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
