"use client";

import React, { useState, useRef } from "react";
import {
  MessageSquare,
  Send,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  Paperclip,
  CheckCircle2,
} from "lucide-react";

interface BusinessFeedbackFormProps {
  businessName: string;
}

export function BusinessFeedbackForm({ businessName }: BusinessFeedbackFormProps) {
  const [category, setCategory] = useState("Feature Request");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAttachmentName, setSubmittedAttachmentName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "Feature Request",
    "Creative Matching & Quality",
    "Scoping & Rates",
    "Dashboard & Usability",
    "General Idea / Feedback",
  ];

  const handleFileChange = (file: File | null) => {
    setErrorMsg("");
    if (!file) return;

    // 15 MB max
    const MAX_BYTES = 15 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setErrorMsg("Attached file must be 15 MB or smaller.");
      return;
    }

    setAttachment(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setAttachmentPreview(url);
    } else {
      setAttachmentPreview(null);
    }
  };

  const handleRemoveAttachment = () => {
    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview);
    }
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || loading) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("feedback", feedback.trim());
      formData.append("rating", String(rating));
      formData.append("businessName", businessName);

      if (attachment) {
        formData.append("attachment", attachment);
      }

      const res = await fetch("/api/business/feedback", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit feedback.");

      setSubmittedAttachmentName(attachment ? attachment.name : null);
      setSubmitted(true);
      setFeedback("");
      handleRemoveAttachment();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 text-center space-y-3 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white text-xl flex items-center justify-center mx-auto shadow-xs font-black">
          ✓
        </div>
        <h4 className="text-base sm:text-lg font-black text-emerald-950">
          Feedback &amp; Suggestions Received!
        </h4>
        <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
          Thank you for helping us shape Peach Network. Our product engineering and executive team reviews every submission weekly.
        </p>
        {submittedAttachmentName && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-[11px] font-bold text-emerald-900 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Attachment received: {submittedAttachmentName}</span>
          </div>
        )}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-xs font-extrabold text-emerald-950 underline hover:text-emerald-800 cursor-pointer"
          >
            Submit another thought or feature request &rarr;
          </button>
        </div>
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

      {/* FILE ATTACHMENT FIELD */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5 text-[#C84E2D]" />
            <span>Attachment / Screenshot (Optional)</span>
          </label>
          <span className="text-[11px] text-stone-400">
            PNG, JPG, PDF, DOCX up to 15 MB
          </span>
        </div>

        {/* Hidden native input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,application/pdf,.doc,.docx,.txt"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileChange(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {!attachment ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-[#C84E2D] bg-[#FFF9F6]"
                : "border-stone-200 hover:border-[#173328] bg-stone-50/70 hover:bg-stone-50"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-1 text-stone-600">
              <UploadCloud className="w-5 h-5 text-stone-400 mb-0.5" />
              <div className="text-xs font-semibold">
                <span className="text-[#C84E2D] font-bold underline">Click to upload</span> or drag and drop screenshots or reference documents
              </div>
              <span className="text-[11px] text-stone-400">
                Helps our engineering team visualize your feature request or bug report
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {attachmentPreview ? (
                <img
                  src={attachmentPreview}
                  alt={attachment.name}
                  className="w-11 h-11 rounded-lg object-cover border border-stone-200 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-stone-200 text-stone-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-stone-500" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 truncate">
                  {attachment.name}
                </p>
                <p className="text-[11px] text-stone-500">
                  {formatFileSize(attachment.size)} &bull; Ready to upload
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveAttachment}
              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Remove attachment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
        <span className="text-[11px] text-stone-400">
          Direct link to Peach product engineering team
        </span>
        <button
          type="submit"
          disabled={loading || !feedback.trim()}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-black bg-[#C84E2D] hover:bg-[#A33B1E] text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{loading ? "Submitting..." : "Send Feedback"}</span>
        </button>
      </div>
    </form>
  );
}
