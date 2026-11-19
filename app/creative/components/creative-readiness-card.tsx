"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  ShieldCheck,
} from "lucide-react";
import type { CreativeBusinessReadinessResult } from "@/lib/readiness";

export function CreativeReadinessCard({
  readiness,
  hasPayoutAccount,
  hasDeliverableStandards,
  applicationStatus,
}: {
  readiness: CreativeBusinessReadinessResult;
  hasPayoutAccount: boolean;
  hasDeliverableStandards: boolean;
  applicationStatus?: string | null;
}) {
  const router = useRouter();
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const handleAction = async (
    action: "activate_5h_commitment" | "verify_deliverable_standards"
  ) => {
    setBusyAction(action);
    setNotice("");
    setError("");

    try {
      const res = await fetch("/api/creative/readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update readiness.");

      setNotice(
        action === "activate_5h_commitment"
          ? "5-Hour Client Response Commitment activated."
          : "Deliverable Standards verified."
      );
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Update failed. Please try again.");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <section className="bg-white border border-[#F7DFD0] rounded-3xl p-5 shadow-[0_12px_32px_rgba(232,93,59,0.08)] space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Award className="w-[18px] h-[18px] text-[#FF5E3A] shrink-0" strokeWidth={1.5} />
          <h2 className="text-base font-extrabold text-[#231714] truncate">
            Business Readiness
          </h2>
        </div>
        <span
          className={`text-xs font-extrabold px-2.5 py-1 rounded-full tabular-nums shrink-0 ${
            readiness.score === 100
              ? "bg-[#FF5E3A] text-white"
              : "bg-[#FFD8BE] text-[#231714]"
          }`}
        >
          {readiness.score}%
        </span>
      </div>

      {/* Matching Eligibility Status Banner */}
      <div
        className={`rounded-2xl p-3.5 border text-xs leading-snug ${
          readiness.isEligibleForMatching
            ? "bg-[#FFF6EE] border-[#FF5E3A] text-[#231714]"
            : "bg-[#FFF6EE] border-[#F7DFD0] text-[#4A3B36]"
        }`}
      >
        <div className="flex items-center gap-1.5 font-extrabold text-[#231714] mb-1">
          <ShieldCheck className="w-4 h-4 text-[#FF5E3A] shrink-0" strokeWidth={1.5} />
          <span>
            {readiness.isEligibleForMatching
              ? "Eligible for Peachy™ Client Matches"
              : applicationStatus !== "approved" && readiness.score === 100
              ? "100% Ready · Pending Network Approval"
              : "100% Readiness Required for Peachy™ Matches"}
          </span>
        </div>
        <p>
          {readiness.isEligibleForMatching
            ? "Your profile is active in Peachy™ matching and ready for commercial briefs."
            : "Complete all 4 milestones (+25% each) to appear in verified business owner shortlists."}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-[#FFD8BE]/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#FF5E3A] transition-all duration-500"
          style={{ width: `${Math.max(4, readiness.score)}%` }}
        />
      </div>

      {notice && (
        <div className="text-xs font-bold text-[#231714] bg-[#FFD8BE] px-3 py-2 rounded-xl">
          {notice}
        </div>
      )}
      {error && (
        <div className="text-xs font-bold text-rose-900 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
          {error}
        </div>
      )}

      {/* 4 Checks */}
      <ul className="space-y-3 pt-1 border-t border-[#F7DFD0]">
        {readiness.checks.map((check) => {
          const isResponseCheck = check.key === "response_5h";
          const isPayoutStandardsCheck = check.key === "payout_standards";

          return (
            <li key={check.key} className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  {check.completed ? (
                    <CheckCircle2
                      className="w-4 h-4 text-[#FF5E3A] shrink-0 mt-0.5"
                      strokeWidth={1.75}
                    />
                  ) : (
                    <Circle
                      className="w-4 h-4 text-[#4A3B36]/50 shrink-0 mt-0.5"
                      strokeWidth={1.5}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#231714] leading-snug">
                      {check.label}
                    </div>
                    <div className="text-[12px] text-[#4A3B36] leading-snug">
                      {check.detail}
                    </div>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-bold text-[#4A3B36]/75 tabular-nums">
                  +{check.points}%
                </span>
              </div>

              {!check.completed && (
                <div className="pl-6 flex flex-wrap gap-2">
                  {isResponseCheck ? (
                    <button
                      type="button"
                      onClick={() => handleAction("activate_5h_commitment")}
                      disabled={busyAction !== null}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FF5E3A] hover:bg-[#E84D2B] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <span>
                        {busyAction === "activate_5h_commitment"
                          ? "Activating..."
                          : "Activate 5-Hour Commitment"}
                      </span>
                      <ArrowRight className="w-3 h-3" strokeWidth={1.75} />
                    </button>
                  ) : isPayoutStandardsCheck ? (
                    <>
                      {!hasPayoutAccount && (
                        <Link
                          href="/creative/payouts"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#231714] hover:bg-[#3A2722] text-white text-xs font-bold transition-colors"
                        >
                          <span>Connect Payouts</span>
                          <ArrowRight className="w-3 h-3" strokeWidth={1.75} />
                        </Link>
                      )}
                      {!hasDeliverableStandards && (
                        <button
                          type="button"
                          onClick={() => handleAction("verify_deliverable_standards")}
                          disabled={busyAction !== null}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FFD8BE] hover:bg-[#FFC7A2] text-[#231714] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <span>
                            {busyAction === "verify_deliverable_standards"
                              ? "Verifying..."
                              : "Verify Deliverable Standards"}
                          </span>
                          <ArrowRight className="w-3 h-3" strokeWidth={1.75} />
                        </button>
                      )}
                    </>
                  ) : (
                    <Link
                      href={check.href}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FFD8BE] hover:bg-[#FFC7A2] text-[#231714] text-xs font-bold transition-colors"
                    >
                      <span>{check.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" strokeWidth={1.75} />
                    </Link>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Link
        href="/creative/academy"
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-[#231714] bg-[#FFF6EE] hover:bg-[#FFD8BE] border border-[#F7DFD0] rounded-2xl transition-colors"
      >
        <span>Open Academy &amp; Standards</span>
        <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
      </Link>
    </section>
  );
}
