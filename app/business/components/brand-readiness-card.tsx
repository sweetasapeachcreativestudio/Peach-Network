import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Layers } from "lucide-react";
import type { BusinessBrandReadinessResult } from "@/lib/readiness";

export function BrandReadinessCard({
  readiness,
}: {
  readiness: BusinessBrandReadinessResult;
}) {
  const isComplete = readiness.score === 100;

  return (
    <section className="bg-white border border-[#F7DFD0] rounded-3xl p-5 shadow-[0_12px_32px_rgba(232,93,59,0.08)] space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-[18px] h-[18px] text-[#FF5E3A] shrink-0" strokeWidth={1.5} />
          <h2 className="text-base font-extrabold text-[#231714] truncate">Brand Readiness</h2>
        </div>
        <span
          className={`text-xs font-extrabold px-2.5 py-1 rounded-full tabular-nums shrink-0 ${
            isComplete
              ? "bg-[#FF5E3A] text-white"
              : "bg-[#FFD8BE] text-[#231714]"
          }`}
        >
          {readiness.score}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2.5 rounded-full bg-[#FFD8BE]/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#FF5E3A] transition-all duration-500"
            style={{ width: `${Math.max(4, readiness.score)}%` }}
          />
        </div>
        <p className="text-[13px] text-[#4A3B36] leading-snug">
          {isComplete
            ? "Your Brand Vault is 100% ready for instant creative kickoff."
            : `${readiness.completedCount} of ${readiness.totalCount} essentials complete. Peachy™ can also bundle missing assets into any quote.`}
        </p>
      </div>

      {/* 4 Checklist Items */}
      <ul className="space-y-2.5 pt-1 border-t border-[#F7DFD0]">
        {readiness.checks.map((check) => (
          <li key={check.key} className="flex items-start justify-between gap-2.5">
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
                <div
                  className={`text-xs font-bold leading-snug ${
                    check.completed ? "text-[#231714]" : "text-[#231714]"
                  }`}
                >
                  {check.label}
                </div>
                <div className="text-[12px] text-[#4A3B36] leading-snug truncate">
                  {check.detail}
                </div>
              </div>
            </div>

            {!check.completed ? (
              <Link
                href={check.href}
                className="shrink-0 text-[11px] font-bold text-[#FF5E3A] hover:text-[#231714] inline-flex items-center gap-0.5 whitespace-nowrap mt-0.5"
              >
                <span>+{check.points}%</span>
                <ArrowRight className="w-3 h-3" strokeWidth={1.75} />
              </Link>
            ) : (
              <span className="shrink-0 text-[11px] font-bold text-[#4A3B36]/75 tabular-nums mt-0.5">
                +{check.points}%
              </span>
            )}
          </li>
        ))}
      </ul>

      <Link
        href={readiness.checks.find((c) => !c.completed)?.href || "/business/vault"}
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-[#231714] bg-[#FFD8BE] hover:bg-[#FFC7A2] rounded-2xl transition-colors"
      >
        <span>
          {isComplete
            ? "Manage Brand Vault"
            : readiness.checks.find((c) => !c.completed)?.actionLabel || "Complete Brand Readiness"}
        </span>
        <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
      </Link>
    </section>
  );
}
