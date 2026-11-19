"use client";

import React, { useState } from "react";
import { Sparkles, Send, ChevronDown, ChevronUp } from "lucide-react";

interface PeachyProjectHelperProps {
  projectId: string;
  projectTitle: string;
  currentBrief?: string | null;
}

interface HelperMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const quickQuestions = [
  "What should I put in my Creative Brief?",
  "How does contract signing & Brand Vault work?",
  "What happens if the creative declines?",
];

export function PeachyProjectHelper({
  projectId,
  projectTitle,
  currentBrief,
}: PeachyProjectHelperProps) {
  const [expanded, setExpanded] = useState(true);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<HelperMsg[]>([
    {
      id: "helper-welcome",
      role: "assistant",
      content: `Need a hand with **${projectTitle}**? Ask me anything about writing your Creative Brief, uploading brand files, or how the two-sided contract works.`,
    },
  ]);

  async function askHelper(questionText?: string) {
    const q = (questionText ?? input).trim();
    if (!q || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: q }]);
    setLoading(true);

    try {
      const res = await fetch("/api/projects/peachy-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          message: q,
          currentBrief,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.answer || "I'm here! Try asking about your brief, contract signatures, or Brand Vault.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "I had a quick hiccup — try asking again in a second!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-[#FFFDFB] border border-[#E8D8CF] rounded-2xl overflow-hidden shadow-2xs">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-3.5 bg-[#173328] !text-white text-white flex items-center justify-between gap-3 cursor-pointer"
      >
        <div className="flex items-center gap-2.5 text-left">
          <span className="w-7 h-7 rounded-full bg-[#C84E2D] !text-white text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <div>
            <strong className="text-xs sm:text-sm font-black block">
              Peachy™ Project Helper
            </strong>
            <span className="text-[11px] text-emerald-200 block">
              Quick answers while you set up your brief or manage this project
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-3">
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`text-xs leading-relaxed p-3 rounded-xl whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[#173328] !text-white text-white ml-8 font-semibold"
                    : "bg-[#FAF8F5] border border-stone-200 text-stone-800 mr-6"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="text-xs text-stone-500 italic px-2">Peachy™ is thinking…</div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => askHelper(q)}
                disabled={loading}
                className="px-2.5 py-1 rounded-full bg-[#FFF5F0] hover:bg-[#FFE3D6] border border-[#F2C2B2] text-[#8C341B] text-[11px] font-bold cursor-pointer transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  askHelper();
                }
              }}
              placeholder="Ask Peachy™ a quick question about this project..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 focus:outline-none focus:border-[#173328]"
            />
            <button
              type="button"
              onClick={() => askHelper()}
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C84E2D] hover:bg-[#ad4023] !text-white text-white text-xs font-black cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
