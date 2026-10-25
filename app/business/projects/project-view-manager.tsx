"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FolderArchive,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Coins,
  FileCheck,
  Plus,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
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

function getUrgencyBadge(status: string) {
  if (status === "proof_uploaded" || status === "submitted") {
    return {
      text: "Action Required: Proof Ready for Review",
      color: "bg-amber-50 text-amber-900 border-amber-200",
      dot: "bg-amber-500",
      priority: 1,
    };
  }
  if (status === "waiting_on_client") {
    return {
      text: "Creative Waiting on Your Feedback",
      color: "bg-amber-50 text-amber-900 border-amber-200",
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
      color: "bg-emerald-50 text-emerald-900 border-emerald-200",
      dot: "bg-emerald-600",
      priority: 5,
    };
  }
  if (status === "cancelled") {
    return {
      text: "Cancelled & Coins Credited",
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
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read view from URL query param if present
  const queryView = searchParams.get("view");
  const [activeTab, setActiveTab] = useState<"active" | "archived" | "all">(
    queryView === "archived" || queryView === "archive"
      ? "archived"
      : queryView === "all"
      ? "all"
      : (initialView as "active" | "archived" | "all") || "active"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubFilter, setActiveSubFilter] = useState<string>("all");
  const [archiveSubFilter, setArchiveSubFilter] = useState<string>("all");

  // Keep state synchronized if URL view parameter changes
  useEffect(() => {
    const v = searchParams.get("view");
    if (v === "archived" || v === "archive") {
      setActiveTab("archived");
    } else if (v === "all") {
      setActiveTab("all");
    } else if (v === "active") {
      setActiveTab("active");
    }
  }, [searchParams]);

  // Tab switch handler with URL update
  const handleTabChange = (tab: "active" | "archived" | "all") => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("view", tab);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
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

  const archivedCoinsTotal = useMemo(
    () => archivedProjects.reduce((sum, p) => sum + (p.coin_amount || 0), 0),
    [archivedProjects]
  );

  // Sorting & Filtering for Active View
  const filteredActive = useMemo(() => {
    let list = [...activeProjects];

    // Priority sort: Review ready first, then accepted, then in_progress, then matching
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
  }, [activeProjects, activeSubFilter, searchQuery, creativeNames]);

  // Filtering for Archived View
  const filteredArchived = useMemo(() => {
    let list = [...archivedProjects];

    // Sort by latest completed date first
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (archiveSubFilter === "completed") {
      list = list.filter((p) => p.status === "completed");
    } else if (archiveSubFilter === "cancelled") {
      list = list.filter((p) => p.status === "cancelled");
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
  }, [archivedProjects, archiveSubFilter, searchQuery, creativeNames]);

  // Combined View
  const filteredAll = useMemo(() => {
    let list = [...initialProjects];
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
  }, [initialProjects, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Controls: Dedicated Filter Tabs + Search */}
      <div className="bg-white border border-[#e7e1d9] rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Main View Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] border border-[#e7e1d9] rounded-xl self-start md:self-auto shadow-2xs">
            <button
              type="button"
              onClick={() => handleTabChange("active")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "active"
                  ? "bg-[#0B2D22] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Active Tasks</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                  activeTab === "active"
                    ? "bg-[#167b5c] text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {activeProjects.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("archived")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "archived"
                  ? "bg-[#0B2D22] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Archived Projects</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                  activeTab === "archived"
                    ? "bg-[#167b5c] text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {archivedProjects.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#0B2D22] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>All ({initialProjects.length})</span>
            </button>
          </div>

          {/* Quick Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "archived"
                  ? "Search archived titles, categories, or creatives..."
                  : "Search active projects, categories, or keywords..."
              }
              className="w-full bg-[#FAF8F5] border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#EB6244] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Sub-Filters: Specific to current view */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100 text-xs">
          {activeTab === "active" && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Filter Active:
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
                <span>
                  Needs Review ({activeProjects.filter((p) => reviewStatuses.includes(p.status)).length})
                </span>
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
                Matching & Kickoff ({activeProjects.filter((p) => ["accepted", "matching", "offer_sent"].includes(p.status)).length})
              </button>
            </div>
          )}

          {activeTab === "archived" && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Filter Archive:
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

          {activeTab === "all" && (
            <div className="text-[11px] text-slate-500 font-medium">
              Showing complete workspace history ({initialProjects.length} total projects)
            </div>
          )}

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {activeProjects.length} Active Collaborations
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <FolderArchive className="w-3 h-3 text-[#167b5c]" />
              {completedCount} Delivered Projects
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. ACTIVE TASKS VIEW (Prioritizes Active & Action-Needed Work)   */}
      {/* ============================================================== */}
      {activeTab === "active" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Active Projects in Motion
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Proof reviews, creative check-ins, and active project rooms requiring your attention.
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
                        ? "border-amber-300 bg-[#fffdf9] ring-2 ring-amber-100"
                        : project.status === "accepted"
                        ? "border-emerald-300 bg-[#fafdfb]"
                        : "border-[#e7e1d9]"
                    }`}
                  >
                    {/* Header Row: Status & Badge */}
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
                        {project.description || "Open the project room to review files, feedback, and active timelines."}
                      </p>
                    </div>

                    {/* Footer Row: Creative attribution & Action Link */}
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
                {searchQuery ? "No active projects match your search." : "No active projects right now."}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? "Try adjusting your search terms or switch to the Archived tab to view finished work."
                  : "Every project starts with an idea. Submit a request to get matched with vetted local commercial designers."}
              </p>
              <div className="pt-2">
                <Link
                  href="/business/new-project"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EB6244] hover:bg-[#d85538] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start a New Project</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. DEDICATED ARCHIVE VIEW (Completed Deliverables & History)    */}
      {/* ============================================================== */}
      {activeTab === "archived" && (
        <div className="space-y-4">
          {/* Archive Explainer Hero */}
          <div className="bg-gradient-to-br from-[#FAF8F5] to-[#F3EDE2] border border-[#e7e1d9] rounded-2xl p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#167b5c] uppercase tracking-wider">
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>Permanent Project Archive</span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Completed &amp; Delivered Projects
                </h2>
                <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                  All approved final vector files, proofs, production packages, and commercial licenses remain
                  safely archived here. You can revisit any Project Room, download deliverables, or find assets in your Brand Vault anytime.
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                <Link
                  href="/business/vault"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-2xs transition-colors"
                >
                  <span>Brand Vault ({assetCount})</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <span className="text-[11px] font-semibold text-slate-500">
                  {completedCount} approved deliverable{completedCount === 1 ? "" : "s"}
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

                    {/* Project Title & Deliverable Summary */}
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
                          href={`/business/vault`}
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
                {searchQuery ? "No archived projects match your search." : "No completed projects in the archive yet."}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? "Try checking your search terms or switch back to Active Tasks."
                  : "Once active tasks reach final sign-off and approval, their complete deliverable rooms, vectors, and font kits will be organized here."}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleTabChange("active")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>View Active Tasks ({activeProjects.length})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ALL PROJECTS VIEW (Complete Workspace Index)                 */}
      {/* ============================================================== */}
      {activeTab === "all" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Complete Project Workspace
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every active and historical project created for {businessName}.
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
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
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
