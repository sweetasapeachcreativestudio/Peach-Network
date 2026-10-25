"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Eye,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Clock,
  CheckCircle2,
  FolderDown,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export interface ProofFile {
  id: string;
  file_kind: string;
  original_name: string;
  mime_type: string | null;
  size_bytes?: number;
  note?: string | null;
  created_at: string;
  preview_url?: string | null;
}

interface ProofFilePreviewerProps {
  projectId: string;
  files: ProofFile[];
  initialPreviewUrls?: Record<string, string>;
  title?: string;
  isOwnerOrClient?: boolean;
  canApprove?: boolean;
  canRevise?: boolean;
  onApproveProof?: () => void;
  onRequestRevision?: () => void;
  compact?: boolean;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "File";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function isImageMime(mime?: string | null, filename?: string): boolean {
  if (mime?.startsWith("image/")) return true;
  if (!filename) return false;
  const ext = filename.split(".").pop()?.toLowerCase();
  return ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "avif"].includes(ext || "");
}

function isPdfMime(mime?: string | null, filename?: string): boolean {
  if (mime === "application/pdf") return true;
  return filename?.toLowerCase().endsWith(".pdf") || false;
}

export function ProofFilePreviewer({
  projectId,
  files,
  initialPreviewUrls = {},
  title = "Proofs & Deliverables",
  isOwnerOrClient = true,
  canApprove = false,
  canRevise = false,
  onApproveProof,
  onRequestRevision,
  compact = false,
}: ProofFilePreviewerProps) {
  // Filter tab: 'proofs' | 'all' | 'finals'
  const [activeTab, setActiveTab] = useState<"proofs" | "all" | "finals">("proofs");

  // Cached preview URLs for files { fileId: signedUrl }
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>(initialPreviewUrls);
  const [loadingUrls, setLoadingUrls] = useState<Record<string, boolean>>({});

  // Active expanded file in the Lightbox
  const [expandedFileIndex, setExpandedFileIndex] = useState<number | null>(null);

  // Lightbox view states (zoom, pan, rotation)
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Separate proofs, finals, and assets
  const proofs = useMemo(() => files.filter((f) => f.file_kind === "proof"), [files]);
  const finals = useMemo(() => files.filter((f) => f.file_kind === "final"), [files]);
  const displayFiles = useMemo(() => {
    if (activeTab === "proofs") return proofs.length > 0 ? proofs : files;
    if (activeTab === "finals") return finals;
    return files;
  }, [activeTab, proofs, finals, files]);

  // Image files eligible for expanded lightbox navigation
  const previewableFiles = useMemo(
    () => displayFiles.filter((f) => isImageMime(f.mime_type, f.original_name) || isPdfMime(f.mime_type, f.original_name)),
    [displayFiles]
  );

  const activeExpandedFile = expandedFileIndex !== null ? previewableFiles[expandedFileIndex] : null;

  // Fetch preview URL on demand if not preloaded
  const loadPreviewUrl = useCallback(
    async (fileId: string) => {
      if (previewUrls[fileId] || loadingUrls[fileId]) return previewUrls[fileId];

      setLoadingUrls((prev) => ({ ...prev, [fileId]: true }));
      try {
        const res = await fetch(`/api/projects/files/${fileId}/download?preview=1`);
        const data = await res.json();
        if (data?.url) {
          setPreviewUrls((prev) => ({ ...prev, [fileId]: data.url }));
          return data.url;
        }
      } catch (err) {
        console.error("Could not fetch proof preview URL:", err);
      } finally {
        setLoadingUrls((prev) => ({ ...prev, [fileId]: false }));
      }
      return null;
    },
    [previewUrls, loadingUrls]
  );

  // Pre-load URLs for visible images
  useEffect(() => {
    displayFiles.forEach((file) => {
      if (isImageMime(file.mime_type, file.original_name) && !previewUrls[file.id]) {
        loadPreviewUrl(file.id);
      }
    });
  }, [displayFiles, loadPreviewUrl, previewUrls]);

  // Reset zoom & pan when opening or switching files in lightbox
  const resetTransform = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  const openLightbox = (file: ProofFile) => {
    const idx = previewableFiles.findIndex((f) => f.id === file.id);
    if (idx !== -1) {
      setExpandedFileIndex(idx);
      resetTransform();
      loadPreviewUrl(file.id);
    }
  };

  const closeLightbox = () => {
    setExpandedFileIndex(null);
    resetTransform();
  };

  const handlePrev = useCallback(() => {
    if (expandedFileIndex === null || previewableFiles.length <= 1) return;
    const nextIdx = (expandedFileIndex - 1 + previewableFiles.length) % previewableFiles.length;
    setExpandedFileIndex(nextIdx);
    resetTransform();
    loadPreviewUrl(previewableFiles[nextIdx].id);
  }, [expandedFileIndex, previewableFiles, resetTransform, loadPreviewUrl]);

  const handleNext = useCallback(() => {
    if (expandedFileIndex === null || previewableFiles.length <= 1) return;
    const nextIdx = (expandedFileIndex + 1) % previewableFiles.length;
    setExpandedFileIndex(nextIdx);
    resetTransform();
    loadPreviewUrl(previewableFiles[nextIdx].id);
  }, [expandedFileIndex, previewableFiles, resetTransform, loadPreviewUrl]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (expandedFileIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(z + 0.25, 4));
      } else if (e.key === "-") {
        setZoom((z) => Math.max(z - 0.25, 0.5));
      } else if (e.key === "0") {
        resetTransform();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedFileIndex, handlePrev, handleNext, resetTransform]);

  // Pan dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoom <= 1) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div className="space-y-4">
      {/* Header & Segmented Filter Bar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-0.5">
              <span>Project Proofs</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-bold">Interactive Inspection</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-stone-950 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Click any proof thumbnail to expand and inspect high-resolution details without downloading.
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="inline-flex p-1 bg-stone-100 rounded-xl self-start sm:self-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("proofs")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "proofs"
                  ? "bg-white text-stone-950 shadow-xs"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              Proofs ({proofs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("finals")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "finals"
                  ? "bg-white text-stone-950 shadow-xs"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              Finals ({finals.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-white text-stone-950 shadow-xs"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              All Files ({files.length})
            </button>
          </div>
        </div>

        {/* Content Body: Empty State or Proofs Grid */}
        {displayFiles.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#EB6244] mx-auto flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">
              {activeTab === "proofs" ? "No proofs uploaded yet" : "No files in this view"}
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              When your creative submits design drafts, proof images will appear here for full-screen inspection,
              feedback, and approval.
            </p>
          </div>
        ) : (
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {displayFiles.map((file) => {
              const isImage = isImageMime(file.mime_type, file.original_name);
              const isPdf = isPdfMime(file.mime_type, file.original_name);
              const previewUrl = previewUrls[file.id];
              const isLoading = loadingUrls[file.id];

              return (
                <div
                  key={file.id}
                  className="group bg-[#FAF8F5] border border-stone-200/80 hover:border-stone-300 rounded-xl overflow-hidden transition-all flex flex-col justify-between hover:shadow-xs"
                >
                  {/* Thumbnail / Preview Area */}
                  {isImage ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => openLightbox(file)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openLightbox(file);
                        }
                      }}
                      className="relative aspect-4/3 bg-stone-900 overflow-hidden cursor-zoom-in flex items-center justify-center"
                      title="Click to expand high-resolution proof (no immediate download)"
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={file.original_name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center p-4 space-y-1 text-stone-400">
                          <ImageIcon className="w-6 h-6 mx-auto animate-pulse" />
                          <span className="text-[11px] block font-medium">
                            {isLoading ? "Loading proof…" : "Click to view preview"}
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay with Clear Expand Icon */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white p-3 text-center pointer-events-none">
                        <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-xs">
                          <Maximize2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-bold tracking-tight">Click to Expand Proof</span>
                        <span className="text-[10px] text-white/80">Full size · No download required</span>
                      </div>

                      {/* Proof Tag Overlay */}
                      <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {file.file_kind === "proof"
                          ? "Design Proof"
                          : file.file_kind === "final"
                          ? "Final Asset"
                          : "Project File"}
                      </span>
                    </div>
                  ) : isPdf ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => openLightbox(file)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openLightbox(file);
                        }
                      }}
                      className="relative aspect-4/3 bg-red-50/60 border-b border-stone-200/70 p-4 flex flex-col items-center justify-center text-center cursor-pointer group-hover:bg-red-50 transition-colors"
                      title="Click to preview PDF proof in browser"
                    >
                      <FileText className="w-10 h-10 text-red-600 mb-1.5" />
                      <span className="text-xs font-bold text-stone-900 line-clamp-1">
                        PDF Document Proof
                      </span>
                      <span className="text-[11px] text-stone-500">Click to view in browser</span>

                      <div className="absolute inset-0 bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-stone-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-red-600" />
                          <span>Preview PDF</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-4/3 bg-stone-100 border-b border-stone-200/70 p-4 flex flex-col items-center justify-center text-center">
                      <Layers className="w-8 h-8 text-stone-400 mb-1.5" />
                      <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                        {file.original_name.split(".").pop() || "FILE"}
                      </span>
                      <span className="text-[11px] text-stone-500 mt-0.5">Source Deliverable</span>
                    </div>
                  )}

                  {/* Metadata & Actions */}
                  <div className="p-3 bg-white space-y-2">
                    <div>
                      <h5
                        className="text-xs font-bold text-stone-950 truncate"
                        title={file.original_name}
                      >
                        {file.original_name}
                      </h5>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium pt-0.5">
                        <span className="tabular-nums">{formatBytes(file.size_bytes)}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {new Date(file.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {file.note && (
                      <p className="text-[11px] text-stone-600 line-clamp-2 bg-[#FAF8F5] p-2 rounded-lg border border-stone-100">
                        {file.note}
                      </p>
                    )}

                    {/* Dual Action Buttons: Expand (no download) vs Explicit Download */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 text-xs">
                      {isImage || isPdf ? (
                        <button
                          type="button"
                          onClick={() => openLightbox(file)}
                          className="flex items-center gap-1.5 text-[#173328] hover:text-[#EB6244] font-bold py-1 px-2 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                          <span>Expand Proof</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-400">Download to view</span>
                      )}

                      <a
                        href={`/api/projects/files/${file.id}/download`}
                        download={file.original_name}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-stone-600 hover:text-stone-950 font-semibold py-1 px-2 rounded-lg hover:bg-stone-100 transition-colors ml-auto"
                        title="Download file to device"
                      >
                        <Download className="w-3.5 h-3.5 shrink-0 text-stone-500" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* HIGH-RESOLUTION EXPANDED LIGHTBOX PREVIEW MODAL                */}
      {/* ============================================================== */}
      {activeExpandedFile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Expanded preview of ${activeExpandedFile.original_name}`}
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col animate-in fade-in duration-150 select-none"
        >
          {/* Top Control Bar */}
          <div className="px-4 py-3 bg-stone-950/80 border-b border-white/10 flex items-center justify-between gap-3 text-white shrink-0">
            {/* Left: File Title & Details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                  {activeExpandedFile.file_kind === "proof"
                    ? "Proof Preview"
                    : activeExpandedFile.file_kind === "final"
                    ? "Final Deliverable"
                    : "File"}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{formatBytes(activeExpandedFile.size_bytes)}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {new Date(activeExpandedFile.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold truncate text-white">
                {activeExpandedFile.original_name}
              </h4>
            </div>

            {/* Center: Pagination when multiple proofs */}
            {previewableFiles.length > 1 && (
              <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1 hover:bg-white/20 rounded-md transition-colors cursor-pointer"
                  title="Previous proof (Left Arrow)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="tabular-nums">
                  {expandedFileIndex! + 1} of {previewableFiles.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1 hover:bg-white/20 rounded-md transition-colors cursor-pointer"
                  title="Next proof (Right Arrow)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Right: Zoom, Rotate, Download, and Close Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Zoom Controls (only for images) */}
              {isImageMime(activeExpandedFile.mime_type, activeExpandedFile.original_name) && (
                <div className="flex items-center gap-1 bg-white/10 px-1.5 py-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                    className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="px-1 text-[11px] tabular-nums font-mono text-white/90">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
                    className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Rotate 90 degrees"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  {zoom !== 1 && (
                    <button
                      type="button"
                      onClick={resetTransform}
                      className="px-1.5 py-0.5 text-[10px] text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                      title="Reset Zoom (0)"
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}

              {/* Explicit Download Action (only if user chooses to download) */}
              <a
                href={`/api/projects/files/${activeExpandedFile.id}/download`}
                download={activeExpandedFile.original_name}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Download this file to your device"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeLightbox}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer ml-1"
                title="Close expanded view (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Visual Display Stage */}
          <div
            className="flex-1 relative overflow-hidden flex items-center justify-center p-4 cursor-default"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeLightbox();
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Image Preview Canvas */}
            {isImageMime(activeExpandedFile.mime_type, activeExpandedFile.original_name) ? (
              previewUrls[activeExpandedFile.id] ? (
                <div
                  className="transition-transform duration-100 ease-out flex items-center justify-center max-w-full max-h-full"
                  style={{
                    transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                    cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default",
                  }}
                >
                  <img
                    src={previewUrls[activeExpandedFile.id]}
                    alt={activeExpandedFile.original_name}
                    className="max-h-[82vh] max-w-[90vw] object-contain shadow-2xl rounded-lg select-none"
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="text-center text-white space-y-2">
                  <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-white/70 font-medium">Loading high-resolution proof…</p>
                </div>
              )
            ) : isPdfMime(activeExpandedFile.mime_type, activeExpandedFile.original_name) ? (
              <div className="w-full h-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl">
                {previewUrls[activeExpandedFile.id] ? (
                  <iframe
                    src={previewUrls[activeExpandedFile.id]}
                    className="w-full h-full border-0"
                    title={activeExpandedFile.original_name}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-6 space-y-2">
                    <FileText className="w-10 h-10 text-red-500 mx-auto animate-pulse" />
                    <p className="text-xs text-stone-600 font-medium">Opening PDF proof viewer…</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/10 rounded-2xl p-8 text-center text-white space-y-3 max-w-md">
                <Layers className="w-12 h-12 text-white/60 mx-auto" />
                <h4 className="text-base font-bold">{activeExpandedFile.original_name}</h4>
                <p className="text-xs text-white/70">
                  This file format requires downloading for inspection in specialized design software.
                </p>
                <a
                  href={`/api/projects/files/${activeExpandedFile.id}/download`}
                  download={activeExpandedFile.original_name}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-stone-950 font-bold rounded-xl text-xs hover:bg-stone-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File ({formatBytes(activeExpandedFile.size_bytes)})</span>
                </a>
              </div>
            )}

            {/* Left & Right Floating Navigation Arrows on Large Screens */}
            {previewableFiles.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white transition-all cursor-pointer backdrop-blur-xs shadow-lg"
                  title="Previous proof (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white transition-all cursor-pointer backdrop-blur-xs shadow-lg"
                  title="Next proof (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Information / Approval Ribbon */}
          <div className="px-4 py-3 bg-stone-950/80 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <span className="text-white/50">Shortcut keys:</span>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded-md text-[10px] font-mono">Esc</kbd>{" "}
              <span>Close</span>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded-md text-[10px] font-mono ml-2">←</kbd>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded-md text-[10px] font-mono">→</kbd>{" "}
              <span>Navigate</span>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded-md text-[10px] font-mono ml-2">+</kbd>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded-md text-[10px] font-mono">-</kbd>{" "}
              <span>Zoom</span>
            </div>

            {/* Quick Action when reviewing proofs */}
            {isOwnerOrClient && (canApprove || canRevise) && (
              <div className="flex items-center gap-2">
                {canRevise && onRequestRevision && (
                  <button
                    type="button"
                    onClick={() => {
                      closeLightbox();
                      onRequestRevision();
                    }}
                    className="px-3 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 text-white font-bold transition-colors cursor-pointer"
                  >
                    Request Revision
                  </button>
                )}
                {canApprove && onApproveProof && (
                  <button
                    type="button"
                    onClick={() => {
                      closeLightbox();
                      onApproveProof();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Approve This Proof
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
