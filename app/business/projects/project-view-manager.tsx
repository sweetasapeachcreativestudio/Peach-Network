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

function getStatusMeta(status: string) {
  if (status === "proof_uploaded" || status === "submitted") {
    return {
      text: "Action Needed",
      subtext: "Proof ready for review",
      textColor: "text-amber-800",
      dotColor: "bg-amber-500",
      priority: 1,
      isReview: true,
    };
  }
  if (status === "waiting_on_client") {
    return {
      text: "Action Needed",
      subtext: "Feedback requested",
      textColor: "text-amber-800",
      dotColor: "bg-amber-500",
      priority: 1,
      isReview: true,
    };
  }
  if (status === "accepted") {
    return {
      text: "Kickoff Ready",
      subtext: "Creative connected",
      textColor: "text-emerald-800",
      dotColor: "bg-emerald-500",
      priority: 2,
      isReview: false,
    };
  }
  if (status === "revisions") {
    return {
      text: "In Revision",
      subtext: "Designer applying edits",
      textColor: "text-blue-800",
      dotColor: "bg-blue-500",
      priority: 3,
      isReview: false,
    };
  }
  if (status === "in_progress") {
    return {
      text: "In Progress",
      subtext: "Active production",
      textColor: "text-stone-700",
      dotColor: "bg-stone-500",
      priority: 3,
      isReview: false,
    };
  }
  if (status === "matching" || status === "offer_sent") {
    return {
      text: "Matching Creative",
      subtext: "Arranging creative match",
      textColor: "text-orange-800",
      dotColor: "bg-orange-500",
      priority: 4,
      isReview: false,
    };
  }
  if (status === "completed") {
    return {
      text: "Delivered & Approved",
      subtext: "Deliverables archived",
      textColor: "text-emerald-800",
      dotColor: "bg-emerald-600",
      priority: 5,
      isReview: false,
    };
  }
  if (status === "cancelled") {
    return {
      text: "Cancelled",
      subtext: "Coins credited",
      textColor: "text-stone-500",
      dotColor: "bg-stone-400",
      priority: 6,
      isReview: false,
    };
  }
  return {
    text: roomStatus(status),
    subtext: "",
    textColor: "text-stone-700",
    dotColor: "bg-stone-500",
    priority: 5,
    isReview: false,
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
      const pA = getStatusMeta(a.status).priority;
      const pB = getStatusMeta(b.status).priority;
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
      {/* REFINED DESKTOP & MOBILE CONTROL BAR                           */}
      {/* ============================================================== */}
      <div className="bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Row 1: Segmented View Switcher + Search & Filter Controls */}
        <div className="p-3 sm:p-4 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FAF8F5]/70">
          {/* Segmented View Switcher */}
          <div className="inline-flex p-1 bg-stone-200/60 rounded-xl w-full md:w-auto">
            {/* Active Projects Tab */}
            <button
              type="button"
              onClick={() => handleToggleView("active")}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-initial ${
                viewMode === "active"
                  ? "bg-[#173328] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Active Collaborations</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                  viewMode === "active" ? "bg-white/20 text-white" : "bg-stone-200 text-stone-700"
                }`}
              >
                {activeProjects.length}
              </span>
              {needsReviewCount > 0 && viewMode !== "active" && (
                <span className="w-2 h-2 rounded-full bg-amber-400" title={`${needsReviewCount} projects need review`} />
              )}
            </button>

            {/* Archived Projects Tab */}
            <button
              type="button"
              onClick={() => handleToggleView("archived")}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-initial ${
                viewMode === "archived"
                  ? "bg-[#173328] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5 shrink-0" />
              <span>Completed Archive</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                  viewMode === "archived" ? "bg-white/20 text-white" : "bg-stone-200 text-stone-700"
                }`}
              >
                {archivedProjects.length}
              </span>
            </button>

            {/* All Projects Tab */}
            <button
              type="button"
              onClick={() => handleToggleView("all")}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-initial ${
                viewMode === "all"
                  ? "bg-[#173328] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              <span>All ({initialProjects.length})</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto md:max-w-md flex-1">
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  viewMode === "archived"
                    ? "Search archived titles or designers..."
                    : "Search active projects or keywords..."
                }
                className="w-full bg-white border border-stone-200 rounded-xl pl-8 pr-7 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-[#EB6244] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              )}
            </div>

            {allCategories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-xs text-stone-700 font-semibold focus:outline-hidden focus:border-[#EB6244] cursor-pointer shrink-0 max-w-[140px] truncate"
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

        {/* Row 2: Sub-Filter Tabs & Scope Summary */}
        <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 text-xs bg-white">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {viewMode === "active" && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSubFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                    activeSubFilter === "all"
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                >
                  All Active ({activeProjects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubFilter("review")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    activeSubFilter === "review"
                      ? "bg-amber-600 text-white"
                      : "text-amber-800 bg-amber-50 hover:bg-amber-100/80"
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Needs Review ({needsReviewCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubFilter("in_progress")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                    activeSubFilter === "in_progress"
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                >
                  In Production ({activeProjects.filter((p) => ["in_progress", "revisions"].includes(p.status)).length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubFilter("kickoff")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                    activeSubFilter === "kickoff"
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                >
                  Kickoff &amp; Matching ({activeProjects.filter((p) => ["accepted", "matching", "offer_sent"].includes(p.status)).length})
                </button>
              </>
            )}

            {viewMode === "archived" && (
              <>
                <button
                  type="button"
                  onClick={() => setArchiveSubFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                    archiveSubFilter === "all"
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                >
                  All Archived ({archivedProjects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setArchiveSubFilter("completed")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    archiveSubFilter === "completed"
                      ? "bg-emerald-700 text-white"
                      : "text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed &amp; Approved ({completedCount})</span>
                </button>
                {archivedProjects.some((p) => p.status === "cancelled") && (
                  <button
                    type="button"
                    onClick={() => setArchiveSubFilter("cancelled")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                      archiveSubFilter === "cancelled"
                        ? "bg-stone-900 text-white"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                    }`}
                  >
                    Cancelled
                  </button>
                )}
              </>
            )}

            {viewMode === "all" && (
              <span className="text-xs text-stone-500 font-medium py-1">
                Showing all {initialProjects.length} workspace projects
              </span>
            )}
          </div>

          <div className="shrink-0 text-xs font-semibold text-stone-600">
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
      {/* 1. ACTIVE TASKS VIEW (Desktop Horizontal Layout)               */}
      {/* ============================================================== */}
      {viewMode === "active" && (
        <div className="space-y-3.5">
          {filteredActive.length > 0 ? (
            <div className="space-y-3">
              {filteredActive.map((project) => {
                const statusMeta = getStatusMeta(project.status);
                const isActionNeeded = statusMeta.isReview;
                const creativeName = project.assigned_creative_id
                  ? creativeNames[project.assigned_creative_id] || "Assigned Creative"
                  : null;

                return (
                  <article
                    key={project.id}
                    className={`group bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-2xs hover:shadow-xs relative ${
                      isActionNeeded
                        ? "border-amber-300/80 bg-[#FFFDF9] ring-1 ring-amber-100"
                        : project.status === "accepted"
                        ? "border-emerald-200/90 bg-[#FBFDFB]"
                        : "border-stone-200/90 hover:border-stone-300"
                    }`}
                  >
                    {/* Horizontal Split for Desktop */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left Column: Metadata Kicker, Title, Description, and Creative */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        {/* Status Kicker with Zero-Pill Typography */}
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 font-bold ${statusMeta.textColor}`}>
                            <span className={`w-2 h-2 rounded-full ${statusMeta.dotColor}`} />
                            <span>{statusMeta.text}</span>
                          </span>
                          <span className="text-stone-300" aria-hidden="true">·</span>
                          <span className="font-semibold text-stone-600">{project.category}</span>
                          {project.due_at && (
                            <>
                              <span className="text-stone-300" aria-hidden="true">·</span>
                              <span className="text-stone-500 font-medium">
                                Due {new Date(project.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-extrabold text-stone-950 tracking-tight leading-snug group-hover:text-[#EB6244] transition-colors">
                          <Link href={`/projects/${project.id}`}>
                            {project.title}
                          </Link>
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed max-w-2xl">
                          {project.description ||
                            "Review project specifications, communicate with your creative, and inspect active proofs in your room."}
                        </p>

                        {/* Creative Lead & Revisions Info */}
                        <div className="flex items-center gap-3 text-xs text-stone-600 pt-1 flex-wrap">
                          <span className="text-stone-400">Assigned:</span>
                          {creativeName ? (
                            <span className="font-bold text-stone-850 flex items-center gap-1">
                              <span className="text-[#EB6244]">✦</span> {creativeName}
                            </span>
                          ) : (
                            <span className="font-semibold text-amber-800">
                              Matching local creative
                            </span>
                          )}
                          {project.revision_rounds !== undefined && (
                            <>
                              <span className="text-stone-300" aria-hidden="true">·</span>
                              <span className="text-stone-500">{project.revision_rounds} revision rounds agreed</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Column: Coin Escrow & Action CTAs */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100 shrink-0">
                        <div className="text-left lg:text-right">
                          <div className="flex items-center lg:justify-end gap-1.5 text-stone-950 font-extrabold text-sm sm:text-base tabular-nums">
                            <Coins className="w-4 h-4 text-[#EB6244] shrink-0" />
                            <span>{project.coin_amount} Coins</span>
                          </div>
                          <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">held in secure escrow</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/projects/${project.id}#chat`}
                            className="px-3 py-2 text-stone-600 hover:text-stone-950 font-bold text-xs hover:bg-stone-100 rounded-xl transition-colors whitespace-nowrap"
                          >
                            Message
                          </Link>
                          <Link
                            href={`/projects/${project.id}`}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow whitespace-nowrap ${
                              isActionNeeded
                                ? "bg-[#EB6244] hover:bg-[#d85538] text-white"
                                : "bg-[#173328] hover:bg-[#234b3c] text-white"
                            }`}
                          >
                            <span>{isActionNeeded ? "Review Proof" : "Open Room"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-8 sm:p-10 text-center space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#EB6244] mx-auto flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-stone-950">
                {searchQuery || selectedCategory !== "all"
                  ? "No active projects match your search."
                  : "No active projects right now."}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                {searchQuery || selectedCategory !== "all"
                  ? "Try resetting your filter or search terms."
                  : "Start your next design request to match with a local vetted commercial designer."}
              </p>
              <div className="pt-2 flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleToggleView("archived")}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  View Completed Archive ({archivedProjects.length})
                </button>
                <Link
                  href="/business/new-project"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EB6244] hover:bg-[#d85538] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start a Project</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. ARCHIVED PROJECTS VIEW (Desktop Refined Layout)              */}
      {/* ============================================================== */}
      {viewMode === "archived" && (
        <div className="space-y-3.5">
          {/* Archive Banner Header */}
          <div className="bg-gradient-to-br from-[#FAF8F5] via-[#F8F4EE] to-[#EFE7DA] border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#167b5c] uppercase tracking-wider">
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>Historical Deliverables Archive</span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-stone-950">
                  Completed &amp; Approved Deliverables
                </h2>
                <p className="text-xs text-stone-600 max-w-lg leading-relaxed">
                  Final proofs, vector assets, and commercial files remain preserved here indefinitely.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <Link
                  href="/business/vault"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-850 text-xs font-bold rounded-xl shadow-2xs transition-colors"
                >
                  <span>Brand Vault ({assetCount})</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Archived Project Cards */}
          {filteredArchived.length > 0 ? (
            <div className="space-y-3">
              {filteredArchived.map((project) => {
                const creativeName = project.assigned_creative_id
                  ? creativeNames[project.assigned_creative_id] || "Peach Designer"
                  : "Creative Partner";

                const isCompleted = project.status === "completed";

                return (
                  <article
                    key={project.id}
                    className="group bg-white rounded-2xl border border-stone-200/90 hover:border-stone-300 p-4 sm:p-5 transition-all shadow-2xs hover:shadow-xs relative"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left Column */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Delivered &amp; Approved</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 font-bold text-stone-500">
                              <Archive className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span>Cancelled</span>
                            </span>
                          )}
                          <span className="text-stone-300" aria-hidden="true">·</span>
                          <span className="font-semibold text-stone-600">{project.category}</span>
                          <span className="text-stone-300" aria-hidden="true">·</span>
                          <span className="text-stone-500 font-medium">
                            {new Date(project.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-extrabold text-stone-950 tracking-tight leading-snug group-hover:text-[#EB6244] transition-colors">
                          <Link href={`/projects/${project.id}`}>
                            {project.title}
                          </Link>
                        </h3>

                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed max-w-2xl">
                          {project.description ||
                            "Final proofs, design assets, and collaboration records preserved in archive."}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-stone-600 pt-1 flex-wrap">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Delivered by <strong className="text-stone-850 font-bold">{creativeName}</strong></span>
                          <span className="text-stone-300" aria-hidden="true">·</span>
                          <span className="text-stone-500">Final files preserved in Brand Vault</span>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100 shrink-0">
                        <div className="text-left lg:text-right">
                          <div className="flex items-center lg:justify-end gap-1.5 text-stone-700 font-bold text-xs sm:text-sm tabular-nums">
                            <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{project.coin_amount} Coins</span>
                          </div>
                          <span className="text-[11px] text-stone-400 font-medium">released to designer</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href="/business/vault"
                            className="px-3 py-2 text-xs font-bold text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-colors whitespace-nowrap"
                          >
                            Brand Vault
                          </Link>
                          <Link
                            href={`/projects/${project.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#173328] hover:bg-[#234b3c] text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow whitespace-nowrap"
                          >
                            <span>Room &amp; Files</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-8 sm:p-10 text-center space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                <FolderArchive className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-stone-950">
                {searchQuery || selectedCategory !== "all"
                  ? "No archived projects match your search."
                  : "No completed projects in the archive yet."}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                {searchQuery || selectedCategory !== "all"
                  ? "Try resetting your search query or category filter."
                  : "Once active tasks reach final client sign-off, their deliverables are stored here."}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleToggleView("active")}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
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
        <div className="space-y-3">
          {filteredAll.map((project) => {
            const isArchived = ["completed", "cancelled"].includes(project.status);
            const statusMeta = getStatusMeta(project.status);
            const creativeName = project.assigned_creative_id
              ? creativeNames[project.assigned_creative_id] || "Assigned Creative"
              : "Finding Creative";

            return (
              <div
                key={project.id}
                className="bg-white border border-stone-200/90 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className={`inline-flex items-center gap-1.5 font-bold ${statusMeta.textColor}`}>
                      <span className={`w-2 h-2 rounded-full ${statusMeta.dotColor}`} />
                      <span>{statusMeta.text}</span>
                    </span>
                    <span className="text-stone-300" aria-hidden="true">·</span>
                    <span className="font-semibold text-stone-600">{project.category}</span>
                    {isArchived && (
                      <>
                        <span className="text-stone-300" aria-hidden="true">·</span>
                        <span className="text-emerald-700 font-semibold text-[11px]">Archived</span>
                      </>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-stone-950 truncate">{project.title}</h4>
                  <p className="text-xs text-stone-500">
                    Creative: {creativeName} &bull; {project.coin_amount} Coins
                  </p>
                </div>

                <div className="self-end sm:self-auto shrink-0">
                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#EB6244] hover:text-[#d85538] px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <span>{isArchived ? "Archive" : "Room"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
