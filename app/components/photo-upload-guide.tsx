"use client";

import React, { useState } from "react";
import { CheckCircle2, ChevronDown, HelpCircle, Image as ImageIcon, XCircle } from "lucide-react";
import { PHOTO_GUIDE_SPEC } from "@/lib/photo-upload-guide";

interface PhotoUploadGuideProps {
  defaultOpen?: boolean;
  variant?: "full" | "avatar-only";
}

export function PhotoUploadGuide({
  defaultOpen = true,
  variant = "full",
}: PhotoUploadGuideProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      id="photo-upload-guide"
      className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#FFEFE2]/70 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-white border border-[#F7DFD0] flex items-center justify-center text-[#FF5E3A] shrink-0">
            <HelpCircle className="w-4 h-4" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <strong className="text-sm font-extrabold text-[#231714] block">
              Photo Upload Guide — What Works &amp; What Is Rejected
            </strong>
            <span className="text-xs text-[#4A3B36] block">
              Accepted formats, recommended dimensions, and file types to avoid (max {PHOTO_GUIDE_SPEC.maxMb} MB)
            </span>
          </div>
        </div>
        <span className="w-8 h-8 rounded-xl bg-white border border-[#F7DFD0] flex items-center justify-center text-[#231714] shrink-0">
          <ChevronDown
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-[#F7DFD0] bg-white/80 space-y-4">
          <div
            className={`grid grid-cols-1 ${
              variant === "full" ? "lg:grid-cols-2" : "md:grid-cols-2"
            } gap-3.5`}
          >
            {/* WHAT YOU CAN UPLOAD */}
            <div className="bg-white border border-[#F7DFD0] rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" strokeWidth={2} />
                <h3 className="text-sm font-extrabold text-[#231714]">
                  What You Can Upload
                </h3>
              </div>

              <div className="space-y-2.5">
                <div className="bg-[#FFF6EE] rounded-xl p-3 space-y-1">
                  <strong className="text-xs font-extrabold uppercase tracking-wider text-[#FF5E3A] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{variant === "full" ? "Profile Photo / Business Logo" : "Profile Photo"}</span>
                  </strong>
                  <ul className="space-y-1 text-xs text-[#4A3B36] leading-relaxed">
                    {(variant === "full"
                      ? PHOTO_GUIDE_SPEC.logoAllowed
                      : [
                          "Formats: PNG, JPG/JPEG, or WEBP",
                          "Size & Ratio: Square 1:1, at least 512 × 512 px recommended",
                          `File Limit: Up to ${PHOTO_GUIDE_SPEC.maxMb} MB per image`,
                          "Best for: Clear well-lit headshot, studio portrait, or brand mark",
                        ]
                    ).map((line) => (
                      <li key={line} className="flex items-start gap-1.5">
                        <span className="text-emerald-700 font-bold mt-0.5">&bull;</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {variant === "full" && (
                  <div className="bg-[#FFF6EE] rounded-xl p-3 space-y-1">
                    <strong className="text-xs font-extrabold uppercase tracking-wider text-[#FF5E3A] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Showcase Photos (Up to {PHOTO_GUIDE_SPEC.maxShowcaseCount})</span>
                    </strong>
                    <ul className="space-y-1 text-xs text-[#4A3B36] leading-relaxed">
                      {PHOTO_GUIDE_SPEC.showcaseAllowed.map((line) => (
                        <li key={line} className="flex items-start gap-1.5">
                          <span className="text-emerald-700 font-bold mt-0.5">&bull;</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* WHAT CANNOT BE UPLOADED */}
            <div className="bg-white border border-[#F7DFD0] rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-[#C84E2D] shrink-0" strokeWidth={2} />
                <h3 className="text-sm font-extrabold text-[#231714]">
                  What Cannot Be Uploaded
                </h3>
              </div>

              <ul className="space-y-1.5 text-xs text-[#4A3B36] leading-relaxed">
                {PHOTO_GUIDE_SPEC.notAllowed.map((line) => (
                  <li key={line} className="flex items-start gap-2 bg-[#FFF6EE]/70 rounded-xl px-3 py-2">
                    <span className="text-[#C84E2D] font-extrabold shrink-0">&times;</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
