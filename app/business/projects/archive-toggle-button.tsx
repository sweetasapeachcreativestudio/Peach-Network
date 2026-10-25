"use client";

import React from "react";
import { FolderArchive } from "lucide-react";

export function ArchiveToggleButton() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("peach:switch-project-view", { detail: "archived" }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3.5 text-xs font-bold text-slate-800 bg-[#FAF8F5] hover:bg-[#F3EDE2] border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-[0.99]"
      title="Switch to Archived Projects tab without page reload"
    >
      <FolderArchive className="w-3.5 h-3.5 text-[#167b5c]" />
      <span>Switch to Archived Projects</span>
    </button>
  );
}
