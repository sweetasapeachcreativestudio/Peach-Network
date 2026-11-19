"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Coins,
  Plus,
  MapPin,
  Clock,
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
  creativeHubs?: Record<string, string>;
  initialView?: string;
  businessName: string;
  assetCount?: number;
}

const REVIEW_STATUSES = ["proof_uploaded", "submitted", "waiting_on_client"];

function getStatusBadge(status: string) {
  if (REVIEW_STATUSES.includes(status)) {
    return {
      label: status === "waiting_on_client" ? "Feedback Needed" : "Needs Your Review",
      isReview: true,
      priority: 1,
    };
  }
  if (status === "dispute_review") {
    return { label: "Under Review", isReview: false, priority: 2 };
  }
  if (status === "draft") {
    return { label: "Setup Brief", isReview: false, priority: 2 };
  }
  if (status === "offer_sent" || status === "matching") {
    return { label: "Awaiting Signatures", isReview: false, priority: 2 };
  }
  if (status === "revisions") {
    return { label: "In Revision", isReview: false, priority: 3 };
  }
  if (status === "completed") {
    return { label: "Completed", isReview: false, priority: 5 };
  }
  if (status === "cancelled") {
    return { label: "Cancelled", isReview: false, priority: 6 };
  }
  return {
    label: roomStatus(status) || "Active",
    isReview: false,
    priority: 3,
  };
}

export function ProjectViewManager({
  initialProjects,
  creativeNames,
  creativeHubs = {},
  initialView = "active",
}: ProjectViewManagerProps) {
  const searchParams = useSearchParams();

  const resolveInitialTab = (val?: string | null): "active" | "review" | "completed" => {
    if (val === "archived" || val === "archive" || val === "completed") return "completed";
    if (val === "review") return "review";
    return "active";
  };

  const [activeTab, setActiveTab] = useState<"active" | "review" | "completed">(
    resolveInitialTab(initialView)
  );

  useEffect(() => {
    const v = searchParams.get("view");
    if (v) {
      setActiveTab(resolveInitialTab(v));
    }
  }, [searchParams]);

  useEffect(() => {
    const handleCustomViewSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setActiveTab(resolveInitialTab(customEvent.detail));
      }
    };
    window.addEventListener("peach:switch-project-view", handleCustomViewSwitch);
    return () => {
      window.removeEventListener("peach:switch-project-view", handleCustomViewSwitch);
    };
  }, []);

  const handleSelectTab = (tab: "active" | "review" | "completed") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("view", tab === "completed" ? "archived" : tab);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    }
  };

  const activeProjects = useMemo(
    () => initialProjects.filter((p) => !["completed", "cancelled"].includes(p.status)),
    [initialProjects]
  );

  const reviewProjects = useMemo(
    () => activeProjects.filter((p) => REVIEW_STATUSES.includes(p.status)),
    [activeProjects]
  );

  const completedProjects = useMemo(
    () => initialProjects.filter((p) => ["completed", "cancelled"].includes(p.status)),
    [initialProjects]
  );

  const displayedProjects = useMemo(() => {
    const base =
      activeTab === "review"
        ? [...reviewProjects]
        : activeTab === "completed"
        ? [...completedProjects]
        : [...activeProjects];

    base.sort((a, b) => {
      const pA = getStatusBadge(a.status).priority;
      const pB = getStatusBadge(b.status).priority;
      if (pA !== pB) return pA - pB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return base;
  }, [activeTab, activeProjects, reviewProjects, completedProjects]);

  return (
    <div className="space-y-5">
      {/* SINGLE CLEAN PILL ROW */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => handleSelectTab("active")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
            activeTab === "active"
              ? "bg-[#FF5E3A] text-white shadow-[0_6px_16px_rgba(255,94,58,0.22)]"
              : "bg-[#FFD8BE] text-[#231714] hover:bg-[#FFCBAA]"
          }`}
        >
          <span>Active Projects</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full tabular-nums ${
              activeTab === "active" ? "bg-white/20 text-white" : "bg-white/70 text-[#231714]"
            }`}
          >
            {activeProjects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab("review")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
            activeTab === "review"
              ? "bg-[#FF5E3A] text-white shadow-[0_6px_16px_rgba(255,94,58,0.22)]"
              : "bg-[#FFD8BE] text-[#231714] hover:bg-[#FFCBAA]"
          }`}
        >
          <span>Needs Your Review</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full tabular-nums ${
              activeTab === "review" ? "bg-white/20 text-white" : "bg-white/70 text-[#231714]"
            }`}
          >
            {reviewProjects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab("completed")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
            activeTab === "completed"
              ? "bg-[#FF5E3A] text-white shadow-[0_6px_16px_rgba(255,94,58,0.22)]"
              : "bg-[#FFD8BE] text-[#231714] hover:bg-[#FFCBAA]"
          }`}
        >
          <span>Completed</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full tabular-nums ${
              activeTab === "completed" ? "bg-white/20 text-white" : "bg-white/70 text-[#231714]"
            }`}
          >
            {completedProjects.length}
          </span>
        </button>
      </div>

      {/* SPACIOUS PROJECT CARDS */}
      {displayedProjects.length > 0 ? (
        <div className="space-y-4">
          {displayedProjects.map((project) => {
            const badge = getStatusBadge(project.status);
            const creativeName = project.assigned_creative_id
              ? creativeNames[project.assigned_creative_id] || "Assigned Creative"
              : "Matching Local Creative";
            const creativeHub = project.assigned_creative_id
              ? creativeHubs[project.assigned_creative_id] || null
              : null;

            const isCompleted = project.status === "completed";
            const targetHref = badge.isReview
              ? `/projects/${project.id}?section=proofs`
              : `/projects/${project.id}`;

            return (
              <article
                key={project.id}
                className="bg-white border border-[#F7DFD0] rounded-3xl p-6 shadow-[0_12px_32px_rgba(232,93,59,0.08)] transition-all hover:border-[#FFAE78]"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          badge.isReview
                            ? "bg-[#FF5E3A] text-white"
                            : isCompleted
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-[#FFD8BE] text-[#231714]"
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{badge.label}</span>
                      </span>

                      <span className="text-xs font-semibold text-[#4A3B36]">
                        {project.category}
                      </span>

                      {project.due_at && !isCompleted && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#8E776E] font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          Due{" "}
                          {new Date(project.due_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>

                    <h3 className="text-[18px] font-extrabold text-[#231714] tracking-tight leading-snug">
                      <Link href={targetHref} className="hover:text-[#FF5E3A] transition-colors">
                        {project.title}
                      </Link>
                    </h3>

                    <div className="flex items-center gap-2.5 text-sm text-[#4A3B36] flex-wrap pt-0.5">
                      <span className="font-semibold text-[#231714]">{creativeName}</span>
                      {creativeHub && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFF6EE] border border-[#F7DFD0] text-[#4A3B36]">
                          <MapPin className="w-3 h-3 text-[#FF5E3A]" />
                          {creativeHub}
                        </span>
                      )}
                      <span className="text-[#E6C5B5]" aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 font-bold text-[#231714] tabular-nums">
                        <Coins className="w-3.5 h-3.5 text-[#FF5E3A]" />
                        {project.coin_amount} Coins
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Link
                      href={targetHref}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                        badge.isReview
                          ? "bg-[#FF5E3A] hover:bg-[#EB4D29] text-white shadow-[0_8px_20px_rgba(255,94,58,0.22)]"
                          : "bg-[#231714] hover:bg-[#3A2823] text-white"
                      }`}
                    >
                      <span>{badge.isReview ? "Review Proof" : "Open Project"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#F7DFD0] rounded-3xl p-10 text-center space-y-3 shadow-[0_12px_32px_rgba(232,93,59,0.08)]">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF6EE] border border-[#F7DFD0] text-[#FF5E3A] mx-auto flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-extrabold text-[#231714]">
            {activeTab === "review"
              ? "Nothing waiting for your review right now."
              : activeTab === "completed"
              ? "No completed projects yet."
              : "No active projects right now."}
          </h3>
          <p className="text-[15px] text-[#4A3B36] max-w-md mx-auto leading-relaxed">
            {activeTab === "review"
              ? "When your creative uploads a proof for review, it will show up right here."
              : activeTab === "completed"
              ? "Approved final projects and deliverables will be archived here automatically."
              : "Chat with Peachy™ on your home dashboard to scope your next project."}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {activeTab !== "active" ? (
              <button
                type="button"
                onClick={() => handleSelectTab("active")}
                className="px-5 py-2.5 bg-[#FFD8BE] hover:bg-[#FFCBAA] text-[#231714] text-sm font-bold rounded-2xl transition-colors cursor-pointer"
              >
                View Active Projects ({activeProjects.length})
              </button>
            ) : (
              <Link
                href="/business"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5E3A] hover:bg-[#EB4D29] text-white text-sm font-bold rounded-2xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Start Project with Peachy™</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
