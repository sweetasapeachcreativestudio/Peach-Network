"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, MessageCircle, X } from "lucide-react";

interface AskArtDirectorButtonProps {
  businessName?: string | null;
  variant?: "inline" | "floating";
}

export function AskArtDirectorButton({
  businessName,
  variant = "inline",
}: AskArtDirectorButtonProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [topic, setTopic] = useState("Project Scoping");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const topics = [
    "Project Scoping",
    "Brand & Logo Direction",
    "Website & Shopify",
    "Print & Packaging Specs",
    "General Guidance",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/business/ask-art-director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          message: message.trim(),
          businessName: businessName || "My Business",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit message.");

      setSuccess(true);
      setMessage("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const modalContent =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[120] bg-[#231714]/65 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Ask an Art Director"
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-[0_24px_60px_rgba(35,23,20,0.22)] relative border border-[#F7DFD0] text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#F7DFD0]">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#231714] bg-[#FFD8BE] px-3 py-1 rounded-full inline-block mb-2">
                    Peach Concierge
                  </span>
                  <h3 className="text-xl font-extrabold text-[#231714] tracking-tight">
                    Ask an Art Director
                  </h3>
                  <p className="text-[15px] text-[#4A3B36] mt-1 leading-relaxed">
                    Need guidance on project scoping, brand direction, or deliverable specs? Message a senior art director directly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-full bg-[#FFF6EE] hover:bg-[#FFD8BE] border border-[#F7DFD0] text-[#231714] flex items-center justify-center cursor-pointer transition-colors shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {success ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#FF5E3A] text-white flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <h4 className="text-lg font-extrabold text-[#231714]">
                    Message Sent to Art Director
                  </h4>
                  <p className="text-[15px] text-[#4A3B36] max-w-sm mx-auto leading-relaxed">
                    Thank you. An art director from the Peach team will review your note and reply in your messages shortly.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="px-6 py-2.5 bg-[#231714] hover:bg-[#3A2722] text-white text-sm font-bold rounded-2xl transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="pt-4 space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-sm text-rose-900 rounded-2xl font-medium">
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#231714] block">
                      What would you like guidance on?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTopic(t)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                            topic === t
                              ? "bg-[#FF5E3A] text-white"
                              : "bg-[#FFD8BE] hover:bg-[#FFC7A2] text-[#231714]"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-[#231714] block">
                      Your Question or Project Note
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share what you are building, your questions on requirements, or what direction you need..."
                      className="w-full p-3.5 text-[15px] bg-[#FFF6EE] focus:bg-white text-[#231714] border border-[#F7DFD0] rounded-2xl focus:outline-none focus:border-[#FF5E3A] leading-relaxed resize-none"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="px-4 py-2.5 text-sm font-bold text-[#231714] bg-[#FFF6EE] hover:bg-[#FFD8BE] border border-[#F7DFD0] rounded-2xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !message.trim()}
                      className="px-5 py-2.5 text-sm font-bold bg-[#FF5E3A] hover:bg-[#E84D2B] text-white rounded-2xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "Send to Art Director"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {variant === "floating" ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setSuccess(false);
            setErrorMsg("");
          }}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[75] inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#231714] hover:bg-[#3A2722] text-white shadow-[0_12px_32px_rgba(35,23,20,0.28)] border border-[#FF5E3A]/40 transition-all cursor-pointer group"
          title="Message a Peach Art Director for creative direction or scoping help"
          aria-label="Ask an Art Director"
        >
          <span className="w-8 h-8 rounded-full bg-[#FF5E3A] text-white flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
          </span>
          <span className="text-sm font-bold tracking-tight whitespace-nowrap pr-1">
            Ask an Art Director
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setSuccess(false);
            setErrorMsg("");
          }}
          className="text-xs sm:text-sm font-bold bg-white hover:bg-[#FFF6EE] text-[#231714] hover:text-[#FF5E3A] border border-[#F7DFD0] hover:border-[#FF5E3A] rounded-full px-3.5 py-2 transition-colors cursor-pointer inline-flex items-center gap-2 whitespace-nowrap shrink-0"
          title="Message an art director from the Peach team for guidance"
        >
          <MessageCircle className="w-4 h-4 text-[#FF5E3A]" strokeWidth={1.5} />
          <span>Ask an Art Director</span>
        </button>
      )}
      {modalContent}
    </>
  );
}
