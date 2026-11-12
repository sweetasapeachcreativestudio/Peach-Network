"use client";

import React, { useState } from "react";

interface AskArtDirectorButtonProps {
  businessName?: string | null;
}

export function AskArtDirectorButton({ businessName }: AskArtDirectorButtonProps) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("Project Scoping");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setSuccess(false);
          setErrorMsg("");
        }}
        className="peach-topbar-button text-xs font-bold bg-white hover:bg-[#FFF5F0] text-[#173328] hover:text-[#C84E2D] border border-stone-300 hover:border-[#F2C2B2] rounded-full px-3 py-1.5 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
        title="Message an art director from the Peach team for guidance"
      >
        <span>Ask an Art Director</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-[#E8D8CF] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#C84E2D] bg-[#FFF2EB] px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                  Peach Creative Ecosystem
                </span>
                <h3 className="text-xl font-black text-stone-950 tracking-tight">
                  Ask an Art Director
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Need guidance on project scoping, brand direction, or asset specs? Drop a quick note to an art director from our team.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 text-2xl flex items-center justify-center mx-auto">
                  ✓
                </div>
                <h4 className="text-base font-black text-stone-950">
                  Message Sent to Art Director
                </h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                  Thank you! An art director from the Peach team will review your question and respond in your messages or notifications shortly.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-5 py-2 bg-[#173328] hover:bg-[#234b3c] text-white text-xs font-black rounded-xl transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="pt-4 space-y-4">
                {errorMsg && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-xs text-rose-900 rounded-xl font-medium">
                    {errorMsg}
                  </div>
                )}

                {/* Topic selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 block">
                    What would you like guidance on?
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {topics.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTopic(t)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          topic === t
                            ? "bg-[#173328] text-white shadow-2xs"
                            : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 block">
                    Your Question or Project Note
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you're trying to accomplish, any questions on requirements, or what direction you need..."
                    className="w-full p-3 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#173328] leading-relaxed resize-none"
                    required
                  />
                  <span className="text-[10px] text-stone-400 block">
                    Guidance is provided by senior creative directors on our platform.
                  </span>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="px-5 py-2 text-xs font-black bg-[#C84E2D] hover:bg-[#A33B1E] text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send to Art Director"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
