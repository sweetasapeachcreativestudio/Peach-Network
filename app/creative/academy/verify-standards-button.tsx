"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function VerifyStandardsButton({
  alreadyVerified,
}: {
  alreadyVerified: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(alreadyVerified);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/creative/readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_deliverable_standards" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not verify deliverable standards.");
      setVerified(true);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FFD8BE] text-[#231714] text-sm font-extrabold">
        <CheckCircle2 className="w-4 h-4 text-[#FF5E3A]" strokeWidth={2} />
        <span>Deliverable Standards Verified</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleVerify}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#FF5E3A] hover:bg-[#E84D2B] disabled:opacity-50 text-white text-sm font-bold transition-colors cursor-pointer"
      >
        <span>{loading ? "Verifying Standards..." : "Verify Deliverable Standards"}</span>
        <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
      </button>
      {error && <p className="text-xs font-bold text-rose-800">{error}</p>}
    </div>
  );
}
