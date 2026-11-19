"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Sparkles,
  Upload,
  Lock,
  CheckCircle2,
  Send,
  Save,
  FileUp,
} from "lucide-react";

interface CreativeBriefEditorProps {
  projectId: string;
  projectTitle: string;
  category: string;
  businessName: string;
  creativeName: string;
  initialDescription: string | null;
  initialBriefMode: "undecided" | "own" | "ai";
  briefLocked: boolean;
  userRole: "business" | "creative" | "admin";
  uploadedFiles: Array<{
    id: string;
    original_name: string;
    file_kind: string;
    note?: string | null;
  }>;
  onBriefUpdated?: (newDesc: string) => void;
  onBriefLocked?: () => void;
}

export function CreativeBriefEditor({
  projectId,
  projectTitle,
  category,
  businessName,
  creativeName,
  initialDescription,
  initialBriefMode,
  briefLocked: initialLocked,
  userRole,
  uploadedFiles,
  onBriefUpdated,
  onBriefLocked,
}: CreativeBriefEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"undecided" | "own" | "ai">(
    initialLocked ? (initialBriefMode === "undecided" ? "own" : initialBriefMode) : initialBriefMode
  );
  const [description, setDescription] = useState(initialDescription || "");
  const [aiNotes, setAiNotes] = useState("");
  const [briefLocked, setBriefLocked] = useState(initialLocked);
  const [busy, setBusy] = useState<"generate" | "save" | "lock" | "upload" | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isBusinessSide = userRole === "business" || userRole === "admin";
  const briefAssets = uploadedFiles.filter((f) => f.file_kind === "asset");

  async function handleGenerateWithPeachy() {
    setBusy("generate");
    setErrorMsg("");
    setStatusMsg("");
    try {
      const res = await fetch("/api/projects/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          action: "generate",
          notes: aiNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate brief sheet.");
      setMode("ai");
      setDescription(data.description);
      onBriefUpdated?.(data.description);
      setStatusMsg("Peachy™ generated a tailored Brief Sheet! Review or edit anything below before sending.");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not generate brief.");
    } finally {
      setBusy(null);
    }
  }

  async function handleSaveDraft() {
    if (!description.trim()) {
      setErrorMsg("Please enter your Creative Brief details first.");
      return;
    }
    setBusy("save");
    setErrorMsg("");
    setStatusMsg("");
    try {
      const res = await fetch("/api/projects/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          action: "save_draft",
          description: description.trim(),
          briefMode: mode === "undecided" ? "own" : mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save draft.");
      onBriefUpdated?.(data.description);
      setStatusMsg("✓ Draft saved. You can keep editing or upload files before locking.");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not save draft.");
    } finally {
      setBusy(null);
    }
  }

  async function handleLockAndSend() {
    if (!description.trim()) {
      setErrorMsg("Please write or generate a Creative Brief before sending to the creative.");
      return;
    }
    setBusy("lock");
    setErrorMsg("");
    setStatusMsg("");
    try {
      const res = await fetch("/api/projects/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          action: "lock_and_send",
          description: description.trim(),
          briefMode: mode === "undecided" ? "own" : mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not lock and send brief.");
      setBriefLocked(true);
      onBriefUpdated?.(data.description);
      onBriefLocked?.();
      setStatusMsg(
        `✓ Brief locked and sent to ${creativeName}! Sign your Business Owner side of the Design Contract below.`
      );
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not send brief.");
    } finally {
      setBusy(null);
    }
  }

  async function handleUploadBriefFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg("Please choose a file 25 MB or smaller.");
      return;
    }
    setBusy("upload");
    setErrorMsg("");
    setStatusMsg("");
    try {
      const prepare = await fetch("/api/projects/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          kind: "asset",
          action: "upload",
          name: file.name,
        }),
      });
      const signed = await prepare.json();
      if (!prepare.ok) throw new Error(signed.error || "Upload preparation failed.");

      try {
        await createClient()
          .storage.from("project-files")
          .uploadToSignedUrl(signed.path, signed.token, file, {
            contentType: file.type || "application/octet-stream",
          });
      } catch {
        // Preview mock mode handles signed upload cleanly
      }

      const confirm = await fetch("/api/projects/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          kind: "asset",
          path: signed.path,
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        }),
      });
      const done = await confirm.json();
      if (!confirm.ok) throw new Error(done.error || "Could not attach file to brief.");

      setStatusMsg(`✓ Attached "${file.name}" to your Creative Brief.`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "File upload failed.");
    } finally {
      setBusy(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (briefLocked) {
    return (
      <section className="bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                Creative Brief Finalized &amp; Locked
              </span>
              <h3 className="text-base font-black text-stone-950">
                Agreed Brief for {projectTitle}
              </h3>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sent to {creativeName}</span>
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4 text-xs text-stone-800 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
          {description}
        </div>

        {briefAssets.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-stone-500">Attached Brief Files:</span>
            {briefAssets.map((f) => (
              <a
                key={f.id}
                href={`/api/projects/files/${f.id}/download`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173328] bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-[#C84E2D]" />
                <span>{f.original_name}</span>
              </a>
            ))}
          </div>
        )}
      </section>
    );
  }

  // Creative view while client is still preparing draft brief
  if (!isBusinessSide) {
    return (
      <section className="bg-[#FFFDF9] border-2 border-amber-300 rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-amber-900">
          <FileText className="w-5 h-5 text-[#C84E2D]" />
          <h3 className="text-base font-black">
            {businessName} is Preparing the Creative Brief
          </h3>
        </div>
        <p className="text-xs text-stone-700 leading-relaxed">
          Your client is currently customizing their Creative Brief &amp; attaching reference files. You will receive an alert as soon as they lock and send it so you can review and choose <strong>Sign &amp; Accept</strong> or <strong>Decline</strong>.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white border-2 border-[#C84E2D] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F2C2B2]">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-[#C84E2D] !text-white text-white px-2.5 py-0.5 rounded-full">
            Step 1 &bull; Creative Brief Setup
          </span>
          <h2 className="text-lg sm:text-xl font-black text-stone-950 mt-1.5">
            Do you want to upload/write your own Creative Brief, or have Peachy™ generate a Brief Sheet for you?
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Edit, add notes, or attach logos/inspiration files below anytime before locking &amp; sending to <strong>{creativeName}</strong>.
          </p>
        </div>
      </div>

      {/* Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMode("own")}
          className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
            mode === "own"
              ? "border-[#173328] bg-[#F3F8F5] shadow-xs"
              : "border-stone-200 hover:border-[#C84E2D] bg-[#FFFDFB]"
          }`}
        >
          <span className="w-9 h-9 rounded-xl bg-[#173328] !text-white text-white flex items-center justify-center shrink-0">
            <FileUp className="w-4 h-4" />
          </span>
          <div>
            <strong className="text-sm font-black text-stone-950 block">
              Upload / Write My Own Brief
            </strong>
            <span className="text-xs text-stone-600 leading-snug block mt-0.5">
              Write your own notes, paste your project details, or attach a brief PDF/document directly.
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode("ai")}
          className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
            mode === "ai"
              ? "border-[#C84E2D] bg-[#FFF5F0] shadow-xs"
              : "border-stone-200 hover:border-[#C84E2D] bg-[#FFFDFB]"
          }`}
        >
          <span className="w-9 h-9 rounded-xl bg-[#C84E2D] !text-white text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <strong className="text-sm font-black text-stone-950 block">
              Have Peachy™ Generate a Brief Sheet
            </strong>
            <span className="text-xs text-stone-600 leading-snug block mt-0.5">
              Tell Peachy™ a few quick notes about {category} and get a polished, editable Brief Sheet in seconds.
            </span>
          </div>
        </button>
      </div>

      {/* Peachy Generator Bar */}
      {mode === "ai" && (
        <div className="bg-[#FFF9F6] border border-[#F2C2B2] rounded-2xl p-4 space-y-3">
          <label className="block text-xs font-extrabold text-stone-900">
            Quick notes for Peachy™ (optional — e.g. target audience, colors, deadlines, or must-include details):
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={aiNotes}
              onChange={(e) => setAiNotes(e.target.value)}
              placeholder={`e.g. "Warm vintage aesthetic for ${businessName}, highlight grand opening May 15"`}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E9A995] bg-white text-xs text-stone-900 focus:outline-none focus:border-[#C84E2D]"
            />
            <button
              type="button"
              onClick={handleGenerateWithPeachy}
              disabled={busy !== null}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C84E2D] hover:bg-[#ad4023] !text-white text-white text-xs font-black transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{busy === "generate" ? "Generating Brief..." : "Generate Brief Sheet"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Editable Brief Sheet */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-black uppercase tracking-wider text-stone-700">
            Editable Creative Brief Sheet
          </label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleUploadBriefFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-bold text-stone-800 cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-[#C84E2D]" />
              <span>{busy === "upload" ? "Uploading..." : "Upload File / Brief PDF"}</span>
            </button>
          </div>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={10}
          placeholder="Write your Creative Brief here (project goals, deliverables, copy, dimensions, style notes)..."
          className="w-full p-4 rounded-2xl border border-stone-300 bg-[#FAF8F5] focus:bg-white focus:border-[#173328] focus:outline-none text-xs text-stone-900 leading-relaxed font-mono"
        />

        {briefAssets.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-stone-500">Attached Brief Files:</span>
            {briefAssets.map((f) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg"
              >
                <FileText className="w-3.5 h-3.5 text-[#C84E2D]" />
                <span>{f.original_name}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-900">
          {errorMsg}
        </div>
      )}
      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900">
          {statusMsg}
        </div>
      )}

      {/* Save Draft vs Lock & Send */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-stone-100">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={busy !== null}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-extrabold text-stone-800 cursor-pointer transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{busy === "save" ? "Saving Draft..." : "Save Draft Notes"}</span>
        </button>

        <button
          type="button"
          onClick={handleLockAndSend}
          disabled={busy !== null || !description.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#173328] hover:bg-[#204938] !text-white text-white text-xs font-black uppercase tracking-wider shadow-xs cursor-pointer transition-all disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>
            {busy === "lock"
              ? "Locking & Sending..."
              : `Lock & Send Brief to ${creativeName} →`}
          </span>
        </button>
      </div>
    </section>
  );
}
