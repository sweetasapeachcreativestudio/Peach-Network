import React from "react";
import { Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export interface CreativeStatusBadgeProps {
  status: string | null | undefined;
  size?: "sm" | "md";
}

export function getStatusDetails(status: string | null | undefined): {
  label: "Pending Review" | "Approved" | "Needs More Work" | "Rejected" | string;
  key: "pending" | "approved" | "needs_more_work" | "rejected" | "other";
  badgeClass: string;
  dotClass: string;
  Icon: React.ComponentType<{ className?: string }>;
} {
  const norm = (status || "").toLowerCase().trim();

  if (norm === "approved") {
    return {
      label: "Approved",
      key: "approved",
      badgeClass: "bg-emerald-50 text-emerald-900 border-emerald-300 ring-1 ring-emerald-200/50",
      dotClass: "bg-emerald-600",
      Icon: CheckCircle2,
    };
  }

  if (norm === "needs_more_work") {
    return {
      label: "Needs More Work",
      key: "needs_more_work",
      badgeClass: "bg-orange-50 text-orange-950 border-orange-300 ring-1 ring-orange-200/50",
      dotClass: "bg-orange-600",
      Icon: AlertCircle,
    };
  }

  if (
    norm === "submitted" ||
    norm === "under_review" ||
    norm === "pending" ||
    norm === "pending_review" ||
    norm === "in_review" ||
    !norm
  ) {
    return {
      label: "Pending Review",
      key: "pending",
      badgeClass: "bg-amber-50 text-amber-950 border-amber-300 ring-1 ring-amber-200/50",
      dotClass: "bg-amber-600 animate-pulse",
      Icon: Clock,
    };
  }

  if (norm === "rejected") {
    return {
      label: "Rejected",
      key: "rejected",
      badgeClass: "bg-stone-100 text-stone-700 border-stone-300",
      dotClass: "bg-stone-500",
      Icon: XCircle,
    };
  }

  return {
    label: norm.replaceAll("_", " "),
    key: "other",
    badgeClass: "bg-stone-100 text-stone-700 border-stone-300",
    dotClass: "bg-stone-500",
    Icon: Clock,
  };
}

export function CreativeStatusBadge({ status, size = "md" }: CreativeStatusBadgeProps) {
  const { label, badgeClass, dotClass, Icon } = getStatusDetails(status);

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[11px] gap-1"
      : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-extrabold rounded-full border shadow-2xs ${sizeClasses} ${badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
      <Icon className={size === "sm" ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} />
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}
