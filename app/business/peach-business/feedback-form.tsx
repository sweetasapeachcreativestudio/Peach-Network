"use client";

import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";

export function BusinessFeedbackForm({ businessName }: { businessName: string }) {
  const [category, setCategory] = useState("Feature Request");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const categories = [
    "Feature Request",
    "Creative Matching & Quality",
    "Scoping & Rates",
    "Dashboard & Usability",
    "General Idea / Feedback",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || loading) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/business/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          feedback: feedback.trim(),
          rating,
          businessName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit feedback.");

      setSubmitted(true);
      setFeedback("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 text-xl flex items-center justify-center mx-auto">
          ✓
        </div>
        <h4 className="text-base font-black text-emerald-950">
          Feedback Received!
        </h4>
        <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
          Thank you for helping us shape Peach Network. Our product and executive team reviews every submission weekly.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="text-xs font-bold text-emerald-900 underline hover:text-emerald-950 pt-1"
        >
          Submit another thought
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
        <MessageSquare className="w-4 h-4 text-[#C84E2D]" />
        <h3 className="text-sm font-black text-stone-950 uppercase tracking-tight">
          Submit Feature Requests &amp; App Feedback
        </h3>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-900 rounded-xl font-medium">
          {errorMsg}
        </div>
      )}

      {/* Category selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-stone-700 block">
          Feedback Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                category === c
                  ? "bg-[#173328] !text-white text-white font-extrabold shadow-2xs"
                  : "bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Rating */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-stone-700 block">
          Overall Platform Experience (1–5)
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer ${
                rating >= star
                  ? "bg-[#FFF2EB] text-[#C84E2D] border border-[#F2C2B2]"
                  : "bg-stone-50 text-stone-400 border border-stone-200"
              }`}
            >
              ★ {star}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-stone-700 block">
          Your Suggestion, Feature Request, or Notes
        </label>
        <textarea
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tell us what feature you'd love to see, what would make hiring creatives faster, or any feedback on pricing and process..."
          className="w-full p-3 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#173328] leading-relaxed resize-none"
          required
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-stone-400">
          Direct link to Peach product engineering team
        </span>
        <button
          type="submit"
          disabled={loading || !feedback.trim()}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-black bg-[#C84E2D] hover:bg-[#A33B1E] text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{loading ? "Submitting..." : "Send Feedback"}</span>
        </button>
      </div>
    </form>
  );
}
