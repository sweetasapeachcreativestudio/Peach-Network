"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    router.replace(`/signin${params ? `?${params}` : ""}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-8 text-sm font-semibold text-slate-600">
      Loading Peach Network Portal...
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-8 text-sm font-semibold text-slate-600">
          Loading Peach Network Portal...
        </div>
      }
    >
      <AuthRedirectContent />
    </Suspense>
  );
}
