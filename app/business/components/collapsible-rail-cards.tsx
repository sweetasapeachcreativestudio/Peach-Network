"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, FolderLock, MessageSquare, ArrowRight } from "lucide-react";

interface RecentMessageItem {
  id: string;
  project_id: string;
  message: string;
  senderName: string;
}

export function CollapsibleRailCards({
  brandAssetCount,
  recentMessages,
}: {
  brandAssetCount: number;
  recentMessages: RecentMessageItem[];
}) {
  const [vaultOpen, setVaultOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(recentMessages.length > 0);

  return (
    <>
      {/* Collapsible Brand Vault Card */}
      <section className="bg-white border border-[#F7DFD0] rounded-3xl overflow-hidden shadow-[0_12px_32px_rgba(232,93,59,0.08)]">
        <button
          type="button"
          onClick={() => setVaultOpen((v) => !v)}
          aria-expanded={vaultOpen}
          className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#FFF6EE]/60 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <FolderLock className="w-[18px] h-[18px] text-[#FF5E3A] shrink-0" strokeWidth={1.5} />
            <span className="text-base font-extrabold text-[#231714] truncate">Brand Vault</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-[#231714] bg-[#FFD8BE] px-2.5 py-0.5 rounded-full tabular-nums">
              {brandAssetCount} saved
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[#4A3B36] transition-transform duration-200 ${
                vaultOpen ? "rotate-180" : ""
              }`}
              strokeWidth={1.5}
            />
          </div>
        </button>

        {vaultOpen && (
          <div className="px-5 pb-5 pt-1 border-t border-[#F7DFD0]/80 space-y-3.5">
            <p className="text-[14px] text-[#4A3B36] leading-relaxed pt-2">
              Your logos, vector marks, fonts, and color codes are automatically shared with matched creatives on project kickoff.
            </p>
            <Link
              href="/business/vault"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-white bg-[#231714] hover:bg-[#3A2722] rounded-2xl transition-colors"
            >
              <span>Open Brand Vault</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </Link>
          </div>
        )}
      </section>

      {/* Collapsible Recent Messages Card */}
      <section className="bg-white border border-[#F7DFD0] rounded-3xl overflow-hidden shadow-[0_12px_32px_rgba(232,93,59,0.08)]">
        <button
          type="button"
          onClick={() => setMessagesOpen((v) => !v)}
          aria-expanded={messagesOpen}
          className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#FFF6EE]/60 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <MessageSquare className="w-[18px] h-[18px] text-[#FF5E3A] shrink-0" strokeWidth={1.5} />
            <span className="text-base font-extrabold text-[#231714] truncate">Recent Messages</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-[#231714] bg-[#FFF6EE] border border-[#F7DFD0] px-2.5 py-0.5 rounded-full tabular-nums">
              {recentMessages.length}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[#4A3B36] transition-transform duration-200 ${
                messagesOpen ? "rotate-180" : ""
              }`}
              strokeWidth={1.5}
            />
          </div>
        </button>

        {messagesOpen && (
          <div className="px-5 pb-5 pt-2 border-t border-[#F7DFD0]/80 space-y-3">
            {recentMessages.length > 0 ? (
              <div className="space-y-2">
                {recentMessages.map((msg) => (
                  <Link
                    key={msg.id}
                    href={`/projects/${msg.project_id}#chat`}
                    className="block p-3 rounded-2xl bg-[#FFF6EE]/60 hover:bg-[#FFD8BE]/45 border border-[#F7DFD0] transition-colors"
                  >
                    <strong className="text-xs font-extrabold text-[#231714] block truncate">
                      {msg.senderName}
                    </strong>
                    <p className="text-xs text-[#4A3B36] line-clamp-1 mt-0.5">
                      {msg.message}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[14px] text-[#4A3B36] leading-relaxed">
                No active project messages yet. Messages appear here once a project starts.
              </p>
            )}

            <Link
              href="/business/messages"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-[#231714] bg-[#FFF6EE] hover:bg-[#FFD8BE] border border-[#F7DFD0] rounded-2xl transition-colors"
            >
              <span>View All Messages</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
