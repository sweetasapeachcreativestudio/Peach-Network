"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { briefSections, roomStatus, type RoomFile, type VaultAsset } from "@/lib/project-room";
import styles from "./business-project-room.module.css";
import { ProofFilePreviewer } from "./proof-file-previewer";
import { ContractSignatureCard, type ContractPartySignature } from "./contract-signature-card";
import { DisciplineWorkspace } from "./discipline-workspace";
import { ProjectAddOns } from "./project-add-ons";
import { ProjectCollaborators, type CollaboratorItem, type PodInfo } from "./project-collaborators";
import { CreativeBriefEditor } from "./creative-brief-editor";
import { PeachyProjectHelper } from "./peachy-project-helper";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Coins,
  ExternalLink,
  FileText,
  Globe,
  Hand,
  Layers,
  Lock,
  MapPin,
  MessageSquare,
  PenLine,
  Plus,
  Send,
  ShieldCheck,
  TrendingUp,
  Upload,
  UserPlus,
} from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  assigned_creative_id: string | null;
  status: string;
  coin_amount: number;
  due_at: string | null;
  revision_rounds: number;
  current_revision_round: number | null;
};

type BusinessProfileSummary = {
  name: string;
  logoUrl: string | null;
  hub: string;
  industry: string | null;
  description: string | null;
  website: string | null;
  commonNeeds: string[];
  showcasePhotos: Array<{ id: string; label?: string | null; original_name?: string | null }>;
};

type Props = {
  role?: "business" | "creative" | "admin";
  isLeadCreative?: boolean;
  currentUserId?: string;
  initialCollaborators?: CollaboratorItem[];
  initialPodInfo?: PodInfo | null;
  coinBalance?: number;
  proofThumbnail?: string | null;
  project: Project;
  creative: { name: string; avatar: string | null; specialty: string | null; hub?: string | null } | null;
  businessName: string;
  businessProfile?: BusinessProfileSummary;
  files: RoomFile[];
  assets: VaultAsset[];
  messages: { id: string; message: string; sender: string; created_at: string }[];
  requests: { id: string; request_type: string; note: string }[];
  initialBrief: boolean;
  initialSection?: string;
  briefLocked?: boolean;
  briefMode?: "undecided" | "own" | "ai";
  initialClientSignature?: ContractPartySignature | null;
  initialCreativeSignature?: ContractPartySignature | null;
  initialCheckedPieces?: Record<number, boolean>;
  initialReadyPieces?: Record<number, boolean>;
  vaultAccessState?: "open_active" | "closed_completed" | "closed_pending_signatures";
  previewUrls?: Record<string, string>;
};

type StepKey = "step1" | "step2" | "step3" | "step4";
type Panel =
  | "proof"
  | "revision"
  | "upload"
  | "approve"
  | "dispute"
  | "checkin"
  | "client_request"
  | null;

export default function BusinessProjectRoom({
  project: p,
  creative,
  businessName,
  businessProfile,
  files,
  assets,
  messages,
  requests,
  initialBrief,
  initialSection,
  briefLocked = true,
  briefMode = "own",
  initialClientSignature = null,
  initialCreativeSignature = null,
  initialCheckedPieces = {},
  initialReadyPieces = {},
  vaultAccessState = "open_active",
  previewUrls = {},
  role = "business",
  isLeadCreative = false,
  currentUserId = "",
  initialCollaborators = [],
  initialPodInfo = null,
  coinBalance = 0,
}: Props) {
  const isBusinessOrAdmin = role === "business" || role === "admin";
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  const closed = ["completed", "cancelled"].includes(p.status);
  const isContractActive = [
    "accepted",
    "in_progress",
    "waiting_on_client",
    "proof_uploaded",
    "revisions",
    "submitted",
    "approved",
  ].includes(p.status);
  const workspaceUnlocked = isContractActive || closed;

  const computeDefaultStep = (): StepKey => {
    if (initialSection === "proofs") return "step3";
    if (initialBrief) return "step1";
    if (["proof_uploaded", "submitted", "waiting_on_client"].includes(p.status)) return "step3";
    if (p.status === "draft" && !briefLocked) return "step1";
    if (!workspaceUnlocked) return "step2";
    return "step3";
  };

  const [openStep, setOpenStep] = useState<StepKey | null>(computeDefaultStep);
  const [showBriefEditor, setShowBriefEditor] = useState<boolean>(!briefLocked);
  const [panel, setPanel] = useState<Panel>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState("");
  const [preview, setPreview] = useState<{ url: string; mime: string } | null>(null);
  const [disputeStatement, setDisputeStatement] = useState("");
  const [disputeResolution, setDisputeResolution] = useState<
    "full_refund" | "half_refund" | "send_new_creative"
  >("full_refund");

  const [isAddOnModalOpen, setIsAddOnModalOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);

  const [uploadKind, setUploadKind] = useState<string>(role === "creative" ? "proof" : "asset");
  const [checkinStage, setCheckinStage] = useState("designing");
  const [checkinProgress, setCheckinProgress] = useState(55);
  const [checkinNote, setCheckinNote] = useState("");
  const [clientRequestType, setClientRequestType] = useState("logo");
  const [clientRequestNote, setClientRequestNote] = useState("");

  const [revisionRounds, setRevisionRounds] = useState(p.revision_rounds || 3);
  const [buyingRevision, setBuyingRevision] = useState(false);

  const [checkedPieces, setCheckedPieces] = useState<Record<number, boolean>>(initialCheckedPieces);
  const [readyPieces, setReadyPieces] = useState<Record<number, boolean>>(initialReadyPieces);
  const [markingReadyIndex, setMarkingReadyIndex] = useState<number | null>(null);
  const [activeFeedbackIndex, setActiveFeedbackIndex] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [checkingIndex, setCheckingIndex] = useState<number | null>(null);

  const [completing, setCompleting] = useState(false);
  const [briefLockedState, setBriefLockedState] = useState(briefLocked);
  useEffect(() => {
    setBriefLockedState(briefLocked);
    if (!briefLocked) setShowBriefEditor(true);
  }, [briefLocked]);

  useEffect(() => {
    if (initialSection === "proofs") {
      setOpenStep("step3");
      setTimeout(() => {
        step3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [initialSection]);

  const brief = briefSections(p.description);
  const proofs = files.filter((f) => f.file_kind === "proof");
  const latest = proofs[0];
  const finals = files.filter((f) => f.file_kind === "final");
  const unlocked = ["approved", "completed"].includes(p.status);
  const canApprove = ["proof_uploaded", "submitted"].includes(p.status);
  const canRevise =
    ["proof_uploaded", "submitted"].includes(p.status) &&
    (p.current_revision_round ?? 0) < revisionRounds;

  const deliverableItems: string[] = (() => {
    if (!p.description)
      return [
        "Commercial design deliverable",
        "Production-ready vector assets",
        "Commercial rights release",
      ];
    const lines = p.description.split("\n");
    const items: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("•") || trimmed.startsWith("-") || /^\d+\.\s/.test(trimmed)) {
        const clean = trimmed.replace(/^[•\-\d\.]+\s*/, "").trim();
        if (
          clean &&
          !clean.toLowerCase().startsWith("category") &&
          !clean.toLowerCase().startsWith("pricing")
        ) {
          items.push(clean);
        }
      }
    }
    return items.length > 0
      ? items
      : [
          "Production-ready vector source assets (.AI, .SVG, .PDF)",
          "Web & social optimized exports (.PNG, .JPG)",
          "Commercial usage rights release",
        ];
  })();

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (panel && !el.open) el.showModal();
    if (!panel && el.open) el.close();
  }, [panel]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && !panel && !busy) router.refresh();
    }, 30000);
    return () => clearInterval(timer);
  }, [router, panel, busy]);

  async function post(url: string, body: unknown) {
    setBusy(true);
    setNotice("");
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Please try again.");
      setPanel(null);
      setMessage("");
      setRevision("");
      setNotice(
        d.vaultSynced === false
          ? "Approval saved. Your files are unlocked; use Save to Brand Vault below to retry syncing them."
          : "Saved. Your project is up to date."
      );
      router.refresh();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCompleteProject() {
    setCompleting(true);
    setNotice("");
    try {
      const r = await fetch("/api/projects/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: p.id }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not complete project.");
      setNotice("Project marked Completed. Creative access to your Brand Vault has been closed automatically.");
      router.refresh();
    } catch (e: any) {
      setNotice(e.message || "Could not complete project.");
    } finally {
      setCompleting(false);
    }
  }

  async function handleBuyRevision() {
    setBuyingRevision(true);
    setNotice("");
    try {
      const r = await fetch("/api/projects/buy-revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: p.id }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to purchase revision.");

      setRevisionRounds(d.newTotalRounds);
      setNotice(
        `Added 1 revision round (1 Peach Coin / $50 USD reserved under Peach Project Protection). You now have ${d.newTotalRounds} revision rounds.`
      );
      router.refresh();
    } catch (e: any) {
      setNotice(e.message || "Could not purchase revision.");
    } finally {
      setBuyingRevision(false);
    }
  }

  async function handleCheckPiece(index: number, text: string) {
    setCheckingIndex(index);
    setNotice("");
    try {
      const r = await fetch("/api/projects/check-deliverable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: p.id,
          deliverableIndex: index,
          deliverableText: text,
          approved: true,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to check deliverable.");

      setCheckedPieces((prev) => ({ ...prev, [index]: true }));
      setNotice(`Deliverable checked off: "${text}". Creative has been notified to proceed.`);
      router.refresh();
    } catch (e: any) {
      setNotice(e.message || "Could not check off piece.");
    } finally {
      setCheckingIndex(null);
    }
  }

  async function handleSendDeliverableFeedback(index: number, text: string) {
    if (!feedbackText.trim()) return;
    setCheckingIndex(index);
    setNotice("");
    try {
      const r = await fetch("/api/projects/check-deliverable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: p.id,
          deliverableIndex: index,
          deliverableText: text,
          approved: false,
          feedback: feedbackText.trim(),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to submit feedback.");

      setCheckedPieces((prev) => ({ ...prev, [index]: false }));
      setReadyPieces((prev) => ({ ...prev, [index]: false }));
      setActiveFeedbackIndex(null);
      setFeedbackText("");
      setNotice(`Revision note sent to creative for "${text}".`);
      router.refresh();
    } catch (e: any) {
      setNotice(e.message || "Could not send feedback.");
    } finally {
      setCheckingIndex(null);
    }
  }

  async function handleMarkPieceReady(index: number, text: string, ready: boolean) {
    setMarkingReadyIndex(index);
    setNotice("");
    try {
      const r = await fetch("/api/projects/deliverable-ready", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: p.id,
          deliverableIndex: index,
          deliverableText: text,
          ready,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not update deliverable status.");

      setReadyPieces((prev) => ({ ...prev, [index]: ready }));
      setNotice(
        ready
          ? `"${text}" marked Ready for Review. Only the business owner can approve items.`
          : `"${text}" moved back to In Progress.`
      );
      router.refresh();
    } catch (e: any) {
      setNotice(e.message || "Could not update deliverable status.");
    } finally {
      setMarkingReadyIndex(null);
    }
  }

  async function submitDispute() {
    if (!disputeStatement.trim()) {
      setNotice("Explain why you are requesting a dispute.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const r = await fetch("/api/disputes/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: p.id,
          statement: disputeStatement.trim(),
          requestedResolution: disputeResolution,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Could not submit dispute.");
      setPanel(null);
      setDisputeStatement("");
      setNotice("Dispute submitted to Peach Admins. Your Coins remain protected under Peach Project Protection.");
      router.refresh();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not submit dispute.");
    } finally {
      setBusy(false);
    }
  }

  async function showProof() {
    setPreview(null);
    setPanel("proof");
    if (!latest) return;
    try {
      const r = await fetch(`/api/projects/files/${latest.id}/download?preview=1`);
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Could not open proof.");
      setPreview({ url: d.url ?? "", mime: d.downloadOnly ? "" : latest.mime_type ?? "" });
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not open proof.");
    }
  }

  async function upload() {
    const file = fileInput.current?.files?.[0];
    if (!file) {
      setNotice("Choose a file first.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setNotice("Choose a file 25 MB or smaller.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const prepare = await fetch("/api/projects/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: p.id,
          kind: uploadKind,
          action: "upload",
          name: file.name,
        }),
      });
      const signed = await prepare.json();
      if (!prepare.ok) throw Error(signed.error || "Upload failed.");
      const { error } = await createClient()
        .storage.from("project-files")
        .uploadToSignedUrl(signed.path, signed.token, file, {
          contentType: file.type || "application/octet-stream",
        });
      if (error) throw Error(error.message);
      const r = await fetch("/api/projects/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: p.id,
          kind: uploadKind,
          path: signed.path,
          name: file.name,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Upload failed.");
      setPanel(null);
      setNotice(`File added to your project as ${uploadKind.replaceAll("_", " ")}.`);
      router.refresh();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckin() {
    if (!checkinNote.trim()) {
      setNotice("Enter a note for your check-in.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const r = await fetch("/api/projects/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: p.id,
          stage: checkinStage,
          progress: checkinProgress,
          note: checkinNote.trim(),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Check-in failed.");
      setPanel(null);
      setCheckinNote("");
      setNotice("Check-in submitted and project status updated.");
      router.refresh();
    } catch (e: any) {
      setNotice(e.message || "Check-in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleClientRequest() {
    if (!clientRequestNote.trim()) {
      setNotice("Enter what you need from the client.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const r = await fetch("/api/projects/client-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: p.id,
          requestType: clientRequestType,
          note: clientRequestNote.trim(),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Request failed.");
      setPanel(null);
      setClientRequestNote("");
      setNotice("Request sent to client and delivery clock paused.");
      router.refresh();
    } catch (e: any) {
      setNotice(e.message || "Request failed.");
    } finally {
      setBusy(false);
    }
  }

  const open = (value: Panel) => {
    setNotice("");
    setPanel(value);
  };

  const toggleStep = (step: StepKey) => {
    setOpenStep((prev) => (prev === step ? null : step));
  };

  const contractBothSigned =
    Boolean(initialClientSignature && initialCreativeSignature) || isContractActive || closed;

  const downloadRow = (f: RoomFile) => (
    <a
      key={f.id}
      href={`/api/projects/files/${f.id}/download`}
      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FFF6EE] border border-[#F7DFD0] hover:border-[#FF5E3A] transition-colors"
    >
      <div className="min-w-0">
        <strong className="text-xs font-bold text-[#231714] block truncate">{f.original_name}</strong>
        <small className="text-[11px] text-[#4A3B36]">
          {f.note || f.file_kind.replaceAll("_", " ")}
        </small>
      </div>
      <span className="text-xs font-bold text-[#FF5E3A] shrink-0">Download</span>
    </a>
  );

  const vaultRows = assets.map((a) => (
    <div
      key={a.id}
      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FFF6EE] border border-[#F7DFD0]"
    >
      <div className="min-w-0">
        <strong className="text-xs font-bold text-[#231714] block truncate">{a.label}</strong>
        <small className="text-[11px] text-[#4A3B36]">
          {a.value || a.original_name} &middot; Brand Vault{a.notes ? ` · ${a.notes}` : ""}
        </small>
      </div>
      {a.storage_path && (
        <a
          href={`/api/brand-vault/${a.id}?project=${p.id}`}
          className="text-xs font-bold text-[#FF5E3A] hover:underline shrink-0"
        >
          Download
        </a>
      )}
    </div>
  ));

  return (
    <div className="space-y-5 max-w-[1200px] mx-auto pb-12">
      {/* ROOM HEADER CARD */}
      <header className="bg-white border border-[#F7DFD0] rounded-3xl p-6 sm:p-7 shadow-[0_12px_32px_rgba(232,93,59,0.08)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={role === "creative" ? "/creative/projects" : "/business/projects"}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A3B36] hover:text-[#FF5E3A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                canApprove
                  ? "bg-[#FF5E3A] text-white"
                  : closed
                  ? "bg-emerald-100 text-emerald-900"
                  : "bg-[#FFD8BE] text-[#231714]"
              }`}
            >
              {roomStatus(p.status)}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#231714] tracking-tight">
              {p.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 text-sm text-[#4A3B36]">
              <span className="font-semibold text-[#231714]">{p.category}</span>
              <span className="text-[#E6C5B5]" aria-hidden="true">&middot;</span>
              <span className="inline-flex items-center gap-1 font-bold text-[#231714] tabular-nums">
                <Coins className="w-4 h-4 text-[#FF5E3A]" />
                {p.coin_amount} Coins (${p.coin_amount * 50})
              </span>
              {creative && (
                <>
                  <span className="text-[#E6C5B5]" aria-hidden="true">&middot;</span>
                  <span>
                    Creative: <strong className="text-[#231714]">{creative.name}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFF6EE] border border-[#F7DFD0] text-[#4A3B36]">
                    <MapPin className="w-3 h-3 text-[#FF5E3A]" />
                    {creative.hub || "Birmingham Hub"}
                  </span>
                </>
              )}
              <span className="text-[#E6C5B5]" aria-hidden="true">&middot;</span>
              <span>
                {p.due_at
                  ? `Due ${new Date(p.due_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      timeZone: "America/Chicago",
                    })}`
                  : "Flexible turnaround"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {latest && (
              <button
                type="button"
                onClick={() => {
                  setOpenStep("step3");
                  showProof();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FF5E3A] hover:bg-[#EB4D29] text-white text-xs font-bold cursor-pointer shadow-[0_8px_20px_rgba(255,94,58,0.22)] transition-colors"
              >
                <span>{isBusinessOrAdmin ? "Review Proof" : "View Latest Proof"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {(role === "business" || role === "admin") && isContractActive && !closed && (
              <button
                type="button"
                disabled={completing}
                onClick={handleCompleteProject}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{completing ? "Completing..." : "Mark Completed"}</span>
              </button>
            )}
            {!closed && isContractActive && p.status !== "dispute_review" && (
              <button
                type="button"
                onClick={() => open("dispute")}
                className="px-3.5 py-2.5 rounded-2xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Request Mediation
              </button>
            )}
          </div>
        </div>
      </header>

      {/* BRAND VAULT STATUS STRIP */}
      <div
        className={`rounded-2xl border px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
          vaultAccessState === "open_active"
            ? "bg-emerald-50 border-emerald-200 text-emerald-950"
            : vaultAccessState === "closed_completed"
            ? "bg-white border-[#F7DFD0] text-[#4A3B36]"
            : "bg-[#FFF6EE] border-[#F7DFD0] text-[#231714]"
        }`}
      >
        <div className="flex items-center gap-2 font-bold">
          {vaultAccessState === "open_active" ? (
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-[#FF5E3A] shrink-0" />
          )}
          <span>
            {vaultAccessState === "open_active"
              ? `Brand Vault Access: Open for ${creative?.name || "your creative"} while this contract is active.`
              : vaultAccessState === "closed_completed"
              ? "Brand Vault Access: Closed automatically upon project completion."
              : "Brand Vault Access: Locked until both parties sign the Step 2 Design Agreement."}
          </span>
        </div>
        {(role === "business" || role === "admin") && (
          <Link href="/business/vault" className="font-bold text-[#FF5E3A] hover:underline shrink-0">
            Manage Brand Vault &rarr;
          </Link>
        )}
      </div>

      {/* LINKED MULTI-SERVICE POD BANNER */}
      {initialPodInfo && (
        <section className="bg-[#231714] text-white rounded-3xl p-5 shadow-[0_12px_32px_rgba(35,23,20,0.12)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FFAE78]" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Linked Multi-Service Pod ({initialPodInfo.combinedCoins} Combined Coins)
              </span>
            </div>
            {initialPodInfo.podSupervision && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-[#FF5E3A] text-white px-3 py-1 rounded-full self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Art Director Pod Supervision Included Free</span>
              </span>
            )}
          </div>
          {initialPodInfo.linkedProjects.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {initialPodInfo.linkedProjects.map((lp) => {
                const isCurrent = lp.project_id === p.id;
                return (
                  <Link
                    key={lp.project_id}
                    href={`/projects/${lp.project_id}`}
                    className={`rounded-2xl p-3.5 border transition-all flex items-center justify-between gap-2 ${
                      isCurrent
                        ? "bg-white/15 border-white/40 text-white"
                        : "bg-white/5 hover:bg-white/15 border-white/20 text-white"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFAE78] block">
                        {isCurrent ? "Current Workspace" : "Companion Linked Project"} &middot; {lp.category}
                      </span>
                      <strong className="text-xs font-bold text-white block truncate">{lp.title}</strong>
                      <span className="text-[11px] text-white/80">
                        {lp.creative_name || "Assigned Specialist"} &middot; {lp.coins} Coins
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#FFAE78] shrink-0">
                      {isCurrent ? "Active" : "Open →"}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* DISPUTE REVIEW BANNER */}
      {p.status === "dispute_review" && (
        <div className="rounded-2xl bg-amber-50 border border-amber-300 px-5 py-3.5 text-sm font-semibold text-amber-950 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            This project is under administrative review. Your Coins remain secured under Peach Project Protection while Peach HQ reviews statements.
          </span>
        </div>
      )}

      {/* FEEDBACK NOTICE */}
      {notice && (
        <div
          role="status"
          className="rounded-2xl bg-[#FFF6EE] border border-[#FFAE78] px-5 py-3.5 text-sm font-semibold text-[#231714]"
        >
          {notice}
        </div>
      )}

      {/* OPEN CLIENT REQUESTS */}
      {requests.length > 0 && (
        <section className="rounded-3xl bg-[#FFF6EE] border-2 border-[#FF5E3A] p-5 space-y-3">
          <strong className="text-sm font-extrabold text-[#231714] block">
            Your creative requested an item to proceed:
          </strong>
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#F7DFD0] rounded-2xl p-4"
            >
              <p className="text-sm text-[#4A3B36]">
                <strong className="text-[#231714] capitalize">
                  {r.request_type.replaceAll("_", " ")}:
                </strong>{" "}
                {r.note}
              </p>
              {isBusinessOrAdmin ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    post("/api/projects/client-request/resolve", { projectId: p.id, requestId: r.id })
                  }
                  className="px-4 py-2 rounded-xl bg-[#FF5E3A] hover:bg-[#EB4D29] text-white text-xs font-bold cursor-pointer shrink-0"
                >
                  Mark Sent
                </button>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-[#FFD8BE] text-[#231714] text-xs font-bold shrink-0">
                  Awaiting client response
                </span>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ===================================================================== */}
      {/* 4-STEP COLLAPSIBLE ACCORDION PROJECT ROOM                            */}
      {/* ===================================================================== */}
      <div className="space-y-4">
        {/* STEP 1: VISUAL CREATIVE BRIEF */}
        <section className="bg-white border border-[#F7DFD0] rounded-3xl shadow-[0_12px_32px_rgba(232,93,59,0.08)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleStep("step1")}
            className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#FFF6EE]/60 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="w-9 h-9 rounded-2xl bg-[#FFD8BE] text-[#231714] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#FF5E3A]" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#FF5E3A]">
                  Step 1
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#231714] truncate">
                  Visual Creative Brief
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  briefLockedState ? "bg-emerald-100 text-emerald-900" : "bg-[#FFD8BE] text-[#231714]"
                }`}
              >
                {briefLockedState ? "Locked & Sent" : "Needs Setup"}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-[#4A3B36] transition-transform ${
                  openStep === "step1" ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {openStep === "step1" && (
            <div className="px-6 pb-6 pt-2 border-t border-[#F7DFD0] space-y-5">
              {/* Clean Visual Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-4 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5E3A] block">
                    Project Objective
                  </span>
                  <p className="text-sm text-[#4A3B36] leading-relaxed line-clamp-4">
                    {brief.objective || p.title}
                  </p>
                </div>

                <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-4 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5E3A] block">
                    Key Deliverables
                  </span>
                  <ul className="space-y-1 text-xs text-[#4A3B36]">
                    {deliverableItems.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#FF5E3A] shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-4 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5E3A] block">
                    Brand Assets &amp; Scope
                  </span>
                  <p className="text-sm text-[#231714] font-bold">
                    {assets.length} Brand Vault item{assets.length === 1 ? "" : "s"} linked
                  </p>
                  <p className="text-xs text-[#4A3B36]">
                    {revisionRounds} revision rounds included &middot; Full commercial ownership transfer
                  </p>
                </div>
              </div>

              {(role === "business" || role === "admin") && !briefLockedState && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowBriefEditor((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFD8BE] hover:bg-[#FFCBAA] text-[#231714] text-xs font-bold cursor-pointer transition-colors"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    <span>{showBriefEditor ? "Hide Brief Editor" : "Edit / Add Notes"}</span>
                  </button>
                </div>
              )}

              {(showBriefEditor || briefLockedState) && (
                <CreativeBriefEditor
                  projectId={p.id}
                  projectTitle={p.title}
                  category={p.category}
                  businessName={businessName}
                  creativeName={creative?.name || "your matched creative"}
                  initialDescription={p.description}
                  initialBriefMode={briefMode}
                  briefLocked={briefLockedState}
                  userRole={role}
                  uploadedFiles={files}
                  onBriefLocked={() => setBriefLockedState(true)}
                />
              )}

              {(role === "business" || role === "admin") && !closed && (
                <PeachyProjectHelper
                  projectId={p.id}
                  projectTitle={p.title}
                  currentBrief={p.description}
                />
              )}
            </div>
          )}
        </section>

        {/* STEP 2: 2-SIDED DESIGN AGREEMENT */}
        <section className="bg-white border border-[#F7DFD0] rounded-3xl shadow-[0_12px_32px_rgba(232,93,59,0.08)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleStep("step2")}
            className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#FFF6EE]/60 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="w-9 h-9 rounded-2xl bg-[#FFD8BE] text-[#231714] flex items-center justify-center shrink-0">
                <PenLine className="w-4 h-4 text-[#FF5E3A]" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#FF5E3A]">
                  Step 2
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#231714] truncate">
                  2-Sided Design Agreement
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  contractBothSigned
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-[#FF5E3A] text-white"
                }`}
              >
                {contractBothSigned ? "Signed by Both" : "Signature Needed"}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-[#4A3B36] transition-transform ${
                  openStep === "step2" ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {openStep === "step2" && (
            <div className="px-6 pb-6 pt-2 border-t border-[#F7DFD0]">
              <ContractSignatureCard
                projectId={p.id}
                projectTitle={p.title}
                category={p.category}
                coins={p.coin_amount}
                dueAt={p.due_at}
                businessName={businessName}
                creativeName={creative?.name || "Peach Creative"}
                creativeHub={creative?.hub || "Birmingham Hub"}
                creativeSpecialty={creative?.specialty || "Commercial Specialist"}
                description={p.description}
                currentStatus={p.status}
                userRole={role}
                briefLocked={briefLockedState}
                initialClientSignature={initialClientSignature}
                initialCreativeSignature={initialCreativeSignature}
                onBriefLocked={() => setBriefLockedState(true)}
              />
            </div>
          )}
        </section>

        {/* STEP 3: PROOFS & DELIVERABLES ROOM */}
        <section
          ref={step3Ref}
          id="step3-proofs"
          className="bg-white border border-[#F7DFD0] rounded-3xl shadow-[0_12px_32px_rgba(232,93,59,0.08)] overflow-hidden"
        >
          <button
            type="button"
            onClick={() => toggleStep("step3")}
            className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#FFF6EE]/60 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="w-9 h-9 rounded-2xl bg-[#FFD8BE] text-[#231714] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#FF5E3A]" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#FF5E3A]">
                  Step 3
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#231714] truncate">
                  Proofs &amp; Deliverables Room
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  canApprove
                    ? "bg-[#FF5E3A] text-white"
                    : unlocked
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-[#FFD8BE] text-[#231714]"
                }`}
              >
                {canApprove
                  ? "Proof Ready for Review"
                  : unlocked
                  ? "Approved"
                  : `${proofs.length} Proof${proofs.length === 1 ? "" : "s"}`}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-[#4A3B36] transition-transform ${
                  openStep === "step3" ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {openStep === "step3" && (
            <div className="px-6 pb-6 pt-4 border-t border-[#F7DFD0] space-y-6">
              {!workspaceUnlocked && (
                <div className="rounded-2xl bg-[#FFF6EE] border border-[#F7DFD0] p-4 flex items-center gap-3 text-sm text-[#4A3B36]">
                  <Lock className="w-4 h-4 text-[#FF5E3A] shrink-0" />
                  <span>
                    Proof uploads and live approvals unlock as soon as both parties complete Step 2 above.
                  </span>
                </div>
              )}

              {/* CREATIVE QUICK CONTROLS */}
              {role === "creative" && !closed && workspaceUnlocked && (
                <div className="bg-[#231714] text-white p-5 rounded-3xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FF5E3A] px-2.5 py-0.5 rounded-full text-white">
                        Creative Studio Suite
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-1">
                        Project Actions &amp; Deliverables
                      </h3>
                    </div>
                    <span className="text-xs text-[#FFAE78] font-semibold">
                      Reserved Payout: <strong>${Math.round(p.coin_amount * 50 * 0.75)} USD</strong> ({p.coin_amount} Coins)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => open("checkin")}
                      className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-[#FFAE78]" />
                      <span>Submit Check-In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => open("client_request")}
                      className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Hand className="w-3.5 h-3.5 text-[#FFAE78]" />
                      <span>Request Item from Client</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddOnModalOpen(true)}
                      className="px-3.5 py-2 bg-[#FF5E3A] hover:bg-[#EB4D29] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Request Add-On / Extra Coins</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadKind("proof");
                        open("upload");
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Proof / Deliverable</span>
                    </button>
                    {isLeadCreative && (
                      <button
                        type="button"
                        onClick={() => setIsCollabModalOpen(true)}
                        className="px-3.5 py-2 bg-white text-[#231714] hover:bg-[#FFD8BE] font-bold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#FF5E3A]" />
                        <span>Invite Collaborator</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* HIGH-RES PROOF PREVIEWER & PRIMARY APPROVAL BAR */}
              <ProofFilePreviewer
                projectId={p.id}
                files={files}
                initialPreviewUrls={previewUrls}
                title="Proofs & Deliverables Gallery"
                isOwnerOrClient={isBusinessOrAdmin}
                canApprove={isBusinessOrAdmin && canApprove}
                canRevise={isBusinessOrAdmin && canRevise}
                onApproveProof={() => open("approve")}
                onRequestRevision={() => open("revision")}
              />

              {/* BUSINESS APPROVAL & FINAL DELIVERY HANDOFF (Business) OR READ-ONLY STATUS (Creative) */}
              {(canApprove || canRevise || unlocked || finals.length > 0) && (
                <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {isBusinessOrAdmin ? (
                    <>
                      <div className="space-y-1">
                        <strong className="text-sm font-extrabold text-[#231714] block">
                          {canApprove
                            ? "Ready to sign off on this proof?"
                            : unlocked
                            ? "Proof approved and final assets unlocked"
                            : "Final Delivery & Brand Vault Handoff"}
                        </strong>
                        <p className="text-xs text-[#4A3B36]">
                          {canApprove
                            ? "Approve to unlock final files and sync to your Brand Vault, or request edits below."
                            : "Final source files appear here and can be synced straight into your Brand Vault."}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {canRevise && (
                          <button
                            type="button"
                            onClick={() => open("revision")}
                            className="px-4 py-2.5 rounded-2xl bg-[#FFD8BE] hover:bg-[#FFCBAA] text-[#231714] text-xs font-bold cursor-pointer transition-colors"
                          >
                            Request Revision
                          </button>
                        )}
                        {canApprove && (
                          <button
                            type="button"
                            onClick={() => open("approve")}
                            className="px-5 py-2.5 rounded-2xl bg-[#FF5E3A] hover:bg-[#EB4D29] text-white text-xs font-bold cursor-pointer shadow-[0_8px_20px_rgba(255,94,58,0.22)] transition-colors"
                          >
                            {p.status === "submitted" ? "Approve Final Delivery" : "Approve Proof"}
                          </button>
                        )}
                        {unlocked && finals.length > 0 && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => post("/api/projects/vault-sync", { projectId: p.id })}
                            className="px-4 py-2.5 rounded-2xl bg-[#231714] hover:bg-[#3A2823] text-white text-xs font-bold cursor-pointer transition-colors"
                          >
                            Save Final Files to Brand Vault
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <strong className="text-sm font-extrabold text-[#231714] block">
                          {unlocked
                            ? "Approved by Business Owner"
                            : canApprove
                            ? "Proof Submitted — Awaiting Client Approval"
                            : "Final Delivery Files Uploaded"}
                        </strong>
                        <p className="text-xs text-[#4A3B36]">
                          {unlocked
                            ? "Client has signed off on this proof. Approved status is locked."
                            : "Only the Business Owner can approve proofs, request revisions, or finalize project handoff."}
                        </p>
                      </div>
                      <span
                        className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 ${
                          unlocked
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-[#FFD8BE] text-[#231714]"
                        }`}
                      >
                        {unlocked ? "Client Approved" : "Awaiting Client Review"}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* DISCIPLINE-SPECIFIC TOOLS (Staging URLs / Shoot Address / Vector Pack) */}
              {workspaceUnlocked && (
                <DisciplineWorkspace
                  projectId={p.id}
                  category={p.category}
                  projectTitle={p.title}
                  description={p.description}
                  coins={p.coin_amount}
                  status={p.status}
                  role={role}
                  onOpenAddOnModal={() => setIsAddOnModalOpen(true)}
                  onRefresh={() => router.refresh()}
                />
              )}

              {/* DELIVERABLES CHECKLIST */}
              {workspaceUnlocked && (
                <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F7DFD0]">
                    <div>
                      <h3 className="text-base font-extrabold text-[#231714]">
                        Deliverables Checklist
                      </h3>
                      <p className="text-xs text-[#4A3B36]">
                        {isBusinessOrAdmin
                          ? "Check off each item as approved or leave targeted adjustment notes."
                          : "Mark items Ready for Review as you upload work. Only the business owner can approve deliverables."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold text-[#231714] bg-white px-3 py-1.5 rounded-xl border border-[#F7DFD0] tabular-nums">
                        Revisions: <strong className="text-[#FF5E3A]">{p.current_revision_round ?? 0} of {revisionRounds}</strong>
                      </span>
                      {isBusinessOrAdmin && (
                        <button
                          type="button"
                          onClick={handleBuyRevision}
                          disabled={buyingRevision}
                          className="px-3.5 py-1.5 rounded-xl bg-[#231714] hover:bg-[#3A2823] text-white text-xs font-bold cursor-pointer transition-colors"
                        >
                          {buyingRevision ? "Adding..." : "+ Buy 1 Revision (1 Coin)"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {deliverableItems.map((item, idx) => {
                      const isChecked = Boolean(checkedPieces[idx]);
                      const isReady = Boolean(readyPieces[idx]);
                      const isChecking = checkingIndex === idx;
                      const isMarkingReady = markingReadyIndex === idx;
                      const isFeedbackOpen = activeFeedbackIndex === idx;

                      return (
                        <div
                          key={idx}
                          className={`rounded-2xl border p-4 space-y-2 transition-colors ${
                            isChecked
                              ? "bg-emerald-50 border-emerald-200"
                              : isReady
                              ? "bg-[#FFFDFB] border-[#FFAE78]"
                              : "bg-white border-[#F7DFD0]"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isChecked
                                    ? "bg-emerald-600 text-white"
                                    : isReady
                                    ? "bg-[#FF5E3A] text-white"
                                    : "bg-[#FFD8BE] text-[#231714]"
                                }`}
                              >
                                {isChecked ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                              </span>
                              <div className="min-w-0">
                                <strong className="text-sm font-bold text-[#231714] block">
                                  {item}
                                </strong>
                                <span className="text-xs text-[#4A3B36]">
                                  {isChecked
                                    ? "Approved by Client"
                                    : isReady
                                    ? "Ready for Review"
                                    : "Awaiting Client Review"}
                                </span>
                              </div>
                            </div>

                            {isBusinessOrAdmin ? (
                              <div className="flex items-center gap-2 flex-wrap shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleCheckPiece(idx, item)}
                                  disabled={isChecking}
                                  className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                                    isChecked
                                      ? "bg-emerald-600 text-white"
                                      : "bg-[#FF5E3A] hover:bg-[#EB4D29] text-white"
                                  }`}
                                >
                                  {isChecked ? "Approved" : "Approve Piece"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveFeedbackIndex(isFeedbackOpen ? null : idx)
                                  }
                                  className="px-3.5 py-2 rounded-xl bg-white border border-[#F7DFD0] hover:border-[#FF5E3A] text-[#231714] text-xs font-bold cursor-pointer transition-colors"
                                >
                                  {isFeedbackOpen ? "Cancel" : "Request Adjustment"}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap shrink-0">
                                {isChecked ? (
                                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Approved by Client</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkPieceReady(idx, item, !isReady)}
                                    disabled={isMarkingReady}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                                      isReady
                                        ? "bg-[#FFD8BE] hover:bg-[#FFCBAA] text-[#231714]"
                                        : "bg-[#231714] hover:bg-[#3A2823] text-white"
                                    }`}
                                  >
                                    {isMarkingReady
                                      ? "Updating..."
                                      : isReady
                                      ? "Ready for Review"
                                      : "Mark Ready for Review"}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {isBusinessOrAdmin && isFeedbackOpen && (
                            <div className="pt-2 space-y-2 border-t border-[#F7DFD0]">
                              <textarea
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder={`Describe what should be updated on "${item}"...`}
                                rows={2}
                                className="w-full p-3 rounded-xl border border-[#F7DFD0] bg-[#FFF6EE] text-xs text-[#231714] focus:outline-none focus:border-[#FF5E3A]"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  disabled={isChecking || !feedbackText.trim()}
                                  onClick={() => handleSendDeliverableFeedback(idx, item)}
                                  className="px-4 py-2 rounded-xl bg-[#231714] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                                >
                                  {isChecking ? "Sending..." : "Send Feedback"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MID-PROJECT ADD-ONS */}
              {workspaceUnlocked && (
                <ProjectAddOns
                  projectId={p.id}
                  projectTitle={p.title}
                  category={p.category}
                  role={role}
                  availableCoins={coinBalance}
                  isOpenModal={isAddOnModalOpen}
                  onCloseModal={() => setIsAddOnModalOpen(false)}
                  onRefresh={() => router.refresh()}
                />
              )}
            </div>
          )}
        </section>

        {/* STEP 4: PROJECT CHAT & FILES */}
        <section className="bg-white border border-[#F7DFD0] rounded-3xl shadow-[0_12px_32px_rgba(232,93,59,0.08)] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleStep("step4")}
            className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#FFF6EE]/60 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="w-9 h-9 rounded-2xl bg-[#FFD8BE] text-[#231714] flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-[#FF5E3A]" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#FF5E3A]">
                  Step 4
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#231714] truncate">
                  Project Chat &amp; Files
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFD8BE] text-[#231714] tabular-nums">
                {messages.length} msg{messages.length === 1 ? "" : "s"} &middot; {files.length + assets.length} files
              </span>
              <ChevronDown
                className={`w-5 h-5 text-[#4A3B36] transition-transform ${
                  openStep === "step4" ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {openStep === "step4" && (
            <div className="px-6 pb-6 pt-4 border-t border-[#F7DFD0] space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* INLINE PROJECT CHAT */}
                <div className="lg:col-span-7 bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-[#231714]">
                      Direct Project Thread
                    </h3>
                    <span className="text-xs font-semibold text-[#4A3B36]">
                      {businessName} &middot; {creative?.name || "Matched Creative"}
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {messages.length > 0 ? (
                      messages.map((m) => {
                        const isMe = m.sender === "You";
                        return (
                          <div
                            key={m.id}
                            className={`rounded-2xl p-3.5 text-sm border ${
                              isMe
                                ? "bg-white border-[#FFAE78] ml-6"
                                : "bg-white border-[#F7DFD0] mr-6"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <strong className="text-xs font-bold text-[#231714]">
                                {m.sender}
                              </strong>
                              <span className="text-[11px] text-[#8E776E]">
                                {new Date(m.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-[#4A3B36] whitespace-pre-wrap leading-relaxed">
                              {m.message}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-white border border-[#F7DFD0] rounded-2xl p-5 text-center text-sm text-[#4A3B36]">
                        No messages yet. Say hello to kick off collaboration.
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-[#F7DFD0]">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && message.trim() && !busy) {
                          e.preventDefault();
                          post("/api/projects/messages", {
                            projectId: p.id,
                            body: message.trim(),
                          });
                        }
                      }}
                      placeholder="Write a message to your creative..."
                      maxLength={6000}
                      className="flex-1 px-4 py-3 rounded-2xl border border-[#F7DFD0] bg-white text-sm text-[#231714] focus:outline-none focus:border-[#FF5E3A]"
                    />
                    <button
                      type="button"
                      disabled={busy || !message.trim()}
                      onClick={() =>
                        post("/api/projects/messages", {
                          projectId: p.id,
                          body: message.trim(),
                        })
                      }
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#FF5E3A] hover:bg-[#EB4D29] text-white text-xs font-bold cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>

                {/* PROJECT FILES & BRAND VAULT */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-extrabold text-[#231714]">
                        Files &amp; Brand Vault
                      </h3>
                      {!closed && (
                        <button
                          type="button"
                          onClick={() => {
                            setUploadKind(role === "creative" ? "proof" : "asset");
                            open("upload");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#231714] hover:bg-[#3A2823] text-white text-xs font-bold cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {vaultRows}
                      {files.map(downloadRow)}
                      {assets.length === 0 && files.length === 0 && (
                        <p className="text-xs text-[#4A3B36] py-3">
                          No project files yet. Upload logos, inspiration, or proofs anytime.
                        </p>
                      )}
                    </div>

                    {isBusinessOrAdmin ? (
                      <Link
                        href="/business/vault"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5E3A] hover:underline pt-1"
                      >
                        <span>Open Brand Vault</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <p className="text-[11px] font-semibold text-[#4A3B36] pt-1">
                        {vaultAccessState === "open_active"
                          ? "Brand Vault assets shared above stay available inside this Project Room while your agreement is active."
                          : vaultAccessState === "closed_completed"
                          ? "Brand Vault access closed automatically upon project completion."
                          : "Brand Vault assets unlock inside this Project Room after both parties sign Step 2."}
                      </p>
                    )}
                  </div>

                  {/* BUSINESS STUDIO PROFILE CARD FOR COLLABORATION CONTEXT */}
                  {businessProfile && (
                    <div className="bg-white border border-[#F7DFD0] rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#FFF6EE] border border-[#F7DFD0] overflow-hidden flex items-center justify-center shrink-0">
                          {businessProfile.logoUrl ? (
                            <img
                              src={businessProfile.logoUrl}
                              alt={`${businessProfile.name} logo`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-[#FF5E3A]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <strong className="text-sm font-extrabold text-[#231714] block truncate">
                            {businessProfile.name}
                          </strong>
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFD8BE] text-[#231714]">
                              <MapPin className="w-3 h-3 text-[#FF5E3A]" />
                              {businessProfile.hub}
                            </span>
                            {businessProfile.industry && (
                              <span className="text-[11px] font-semibold text-[#4A3B36]">
                                {businessProfile.industry}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {businessProfile.description && (
                        <p className="text-xs text-[#4A3B36] leading-relaxed">
                          {businessProfile.description}
                        </p>
                      )}

                      {businessProfile.commonNeeds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {businessProfile.commonNeeds.slice(0, 6).map((need) => (
                            <span
                              key={need}
                              className="px-2.5 py-1 rounded-full bg-[#FFF6EE] border border-[#F7DFD0] text-[11px] font-bold text-[#231714]"
                            >
                              {need}
                            </span>
                          ))}
                        </div>
                      )}

                      {businessProfile.website && (
                        <a
                          href={
                            businessProfile.website.startsWith("http")
                              ? businessProfile.website
                              : `https://${businessProfile.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5E3A] hover:underline"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>{businessProfile.website}</span>
                        </a>
                      )}

                      {businessProfile.showcasePhotos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          {businessProfile.showcasePhotos.slice(0, 3).map((photo) => (
                            <div
                              key={photo.id}
                              className="aspect-square rounded-xl overflow-hidden bg-[#FFF6EE] border border-[#F7DFD0]"
                            >
                              <img
                                src={`/api/brand-vault/${photo.id}?inline=1`}
                                alt={photo.label || photo.original_name || "Business photo"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* MULTI-CREATIVE COLLABORATORS */}
              <ProjectCollaborators
                projectId={p.id}
                projectTitle={p.title}
                projectStatus={p.status}
                role={role}
                isLeadCreative={isLeadCreative}
                currentUserId={currentUserId}
                availableCoins={coinBalance}
                initialCollaborators={initialCollaborators}
                initialPodInfo={initialPodInfo}
                hidePodBanner={true}
                isOpenModal={isCollabModalOpen}
                onCloseModal={() => setIsCollabModalOpen(false)}
                onRefresh={() => router.refresh()}
              />
            </div>
          )}
        </section>
      </div>

      {/* ACTION DRAWERS / MODALS */}
      <dialog
        aria-label="Project action"
        ref={dialog}
        className={styles.dialog}
        onCancel={() => setPanel(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setPanel(null);
        }}
      >
        <div className={styles.drawer}>
          <button
            className={styles.close}
            aria-label="Close drawer"
            onClick={() => setPanel(null)}
          >
            ✕
          </button>
          <small className={styles.drawerLabel}>Project Room / {panel}</small>

          {panel === "proof" && (
            <>
              <h2>Proof Review</h2>
              {latest ? (
                <>
                  <p>{latest.original_name}</p>
                  {preview ? (
                    preview.mime === "application/pdf" ? (
                      <iframe
                        sandbox="allow-same-origin"
                        className={styles.preview}
                        src={preview.url}
                        title="Project proof preview"
                      />
                    ) : ["image/png", "image/jpeg", "image/webp"].includes(preview.mime) ? (
                      <img className={styles.preview} src={preview.url} alt="Project proof" />
                    ) : (
                      <p>This format is available as a download.</p>
                    )
                  ) : (
                    <p>Loading secure preview...</p>
                  )}
                  {downloadRow(latest)}
                  {isBusinessOrAdmin && (
                    <div className={styles.buttons}>
                      {canApprove && (
                        <button className={styles.primary} onClick={() => open("approve")}>
                          {p.status === "submitted" ? "Approve Final Delivery" : "Approve Proof"}
                        </button>
                      )}
                      {canRevise && (
                        <button onClick={() => open("revision")}>Request Revision</button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p>No proof has been uploaded yet.</p>
              )}
            </>
          )}

          {panel === "revision" && isBusinessOrAdmin && (
            <>
              <h2>Request a Revision</h2>
              <p>
                {revisionRounds - (p.current_revision_round ?? 0)} included rounds remaining. Put
                all edits for this round in one message.
              </p>
              <label>
                Your feedback
                <textarea
                  value={revision}
                  onChange={(e) => setRevision(e.target.value)}
                  placeholder="Tell your creative what should change."
                  maxLength={6000}
                />
              </label>
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  className={styles.primary}
                  disabled={busy || !revision.trim() || !canRevise}
                  onClick={() =>
                    post("/api/projects/revisions", {
                      projectId: p.id,
                      requestText: revision.trim(),
                    })
                  }
                >
                  Send Revision Request
                </button>
                <button onClick={handleBuyRevision} disabled={buyingRevision}>
                  + Buy 1 More Revision (1 Coin)
                </button>
              </div>
            </>
          )}

          {panel === "upload" && (
            <>
              <h2>
                {role === "creative"
                  ? "Upload Proof or Deliverable"
                  : "Send Brand Assets & References"}
              </h2>
              <p>
                {role === "creative"
                  ? "Upload high-res proofs, master vector files, or final deliverables for client review."
                  : "Send logos, video clips, style guidelines, or product photos."}
              </p>
              {!closed && (
                <>
                  {role === "creative" && (
                    <label>
                      File Kind / Purpose
                      <select
                        value={uploadKind}
                        onChange={(e) => setUploadKind(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: 10,
                          border: "1px solid #d1d5db",
                          marginTop: 4,
                          marginBottom: 8,
                        }}
                      >
                        <option value="proof">Proof for Review</option>
                        <option value="final">Final Master Delivery</option>
                        <option value="asset">Project Asset / Working File</option>
                      </select>
                    </label>
                  )}
                  <label>
                    Upload File (Image, Vector, PDF, Video)
                    <input ref={fileInput} type="file" />
                  </label>
                  <small>Up to 25 MB per file.</small>
                  <button disabled={busy} className={styles.primary} onClick={upload}>
                    {busy ? "Uploading..." : "Upload & Send to Project"}
                  </button>
                </>
              )}
            </>
          )}

          {panel === "checkin" && (
            <>
              <h2>Project Progress Check-In</h2>
              <p>Keep your client informed with milestone progress updates.</p>
              <label>
                Progress Stage
                <select
                  value={checkinStage}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCheckinStage(v);
                    setCheckinProgress(
                      v === "concept" ? 30 : v === "designing" ? 55 : v === "proof_ready" ? 80 : 100
                    );
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    marginTop: 4,
                  }}
                >
                  <option value="concept">Concept &amp; Research &middot; 30%</option>
                  <option value="designing">Active Designing &middot; 55%</option>
                  <option value="proof_ready">Proof Ready for Review &middot; 80%</option>
                  <option value="final_delivery">Final Delivery Complete &middot; 100%</option>
                </select>
              </label>
              <label>
                What did you complete or work on?
                <textarea
                  value={checkinNote}
                  onChange={(e) => setCheckinNote(e.target.value)}
                  placeholder="e.g. Completed initial layouts and color system..."
                  maxLength={4000}
                />
              </label>
              <div className={styles.buttons} style={{ marginTop: 14 }}>
                <button
                  className={styles.primary}
                  disabled={busy || !checkinNote.trim()}
                  onClick={handleCheckin}
                >
                  {busy ? "Submitting..." : "Submit Check-In"}
                </button>
                <button disabled={busy} onClick={() => setPanel(null)}>
                  Cancel
                </button>
              </div>
            </>
          )}

          {panel === "client_request" && (
            <>
              <h2>Request Item from Client</h2>
              <p>Pause the delivery clock while waiting for required assets or access.</p>
              <label>
                What item do you need?
                <select
                  value={clientRequestType}
                  onChange={(e) => setClientRequestType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    marginTop: 4,
                  }}
                >
                  <option value="logo">High-Res Vector Logo (.AI, .SVG, .PNG)</option>
                  <option value="photos">High-Res Photos / Imagery</option>
                  <option value="copy">Written Copy / Menu Details</option>
                  <option value="brand_guide">Brand Guidelines / Color Codes</option>
                  <option value="access">Account Login / Webflow Access</option>
                  <option value="other">Other Asset / Feedback</option>
                </select>
              </label>
              <label>
                Details for client
                <textarea
                  value={clientRequestNote}
                  onChange={(e) => setClientRequestNote(e.target.value)}
                  placeholder="Specify file formats or details needed..."
                  maxLength={4000}
                />
              </label>
              <div className={styles.buttons} style={{ marginTop: 14 }}>
                <button
                  className={styles.primary}
                  disabled={busy || !clientRequestNote.trim()}
                  onClick={handleClientRequest}
                >
                  {busy ? "Sending..." : "Send Request & Pause Clock"}
                </button>
                <button disabled={busy} onClick={() => setPanel(null)}>
                  Cancel
                </button>
              </div>
            </>
          )}

          {panel === "approve" && isBusinessOrAdmin && (
            <>
              <h2>{p.status === "submitted" ? "Approve Final Delivery?" : "Approve This Proof?"}</h2>
              <p>
                {p.status === "submitted"
                  ? "Confirm the delivery meets your agreed brief. Approval unlocks final downloads and syncs them to your Brand Vault."
                  : "Confirm this proof meets your brief so your creative can prepare final deliverables."}
              </p>
              <div className={styles.buttons}>
                <button
                  className={styles.primary}
                  disabled={busy || !canApprove}
                  onClick={() => post("/api/projects/approve", { projectId: p.id })}
                >
                  {busy ? "Saving..." : "Yes, Approve"}
                </button>
                <button disabled={busy} onClick={() => setPanel(null)}>
                  Keep Reviewing
                </button>
              </div>
            </>
          )}

          {panel === "dispute" && (
            <>
              <h2>Request Art Director Mediation</h2>
              <p>
                Active projects cannot be cancelled directly. Submit a mediation request and Peach
                Network Art Directors will review your brief and messages. Coins remain protected under
                Peach Project Protection.
              </p>
              <div style={{ background: "#FFF6EE", padding: 12, borderRadius: 12, margin: "10px 0", fontSize: 12 }}>
                <strong>Reserved Coins:</strong> {p.coin_amount} Peach Coins (${p.coin_amount * 50} USD)
              </div>
              <label>
                Reason for mediation request
                <textarea
                  value={disputeStatement}
                  onChange={(e) => setDisputeStatement(e.target.value)}
                  placeholder="Explain what happened..."
                  maxLength={4000}
                />
              </label>
              <label>
                Requested Resolution
                <select
                  value={disputeResolution}
                  onChange={(e) => setDisputeResolution(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    marginTop: 4,
                  }}
                >
                  <option value="full_refund">Full Refund (100% coins back to wallet)</option>
                  <option value="half_refund">Half Refund (50% to you, 50% to creative)</option>
                  <option value="send_new_creative">Assign a New Creative</option>
                </select>
              </label>
              <div className={styles.buttons} style={{ marginTop: 16 }}>
                <button
                  className={styles.primary}
                  style={{ background: "#b91c1c" }}
                  disabled={busy || !disputeStatement.trim()}
                  onClick={submitDispute}
                >
                  {busy ? "Submitting..." : "Submit Request"}
                </button>
                <button disabled={busy} onClick={() => setPanel(null)}>
                  Keep Working
                </button>
              </div>
            </>
          )}

          {notice && (
            <p role="status" className={styles.notice}>
              {notice}
            </p>
          )}
        </div>
      </dialog>
    </div>
  );
}
