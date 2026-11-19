"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  FileSignature,
  Layers,
  Lock,
  ShieldCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

export interface CollaboratorItem {
  id: string;
  project_id: string;
  specialty: string;
  coins: number;
  usd_amount: number;
  note: string;
  status: "pending" | "approved_awaiting_signature" | "active" | "declined";
  creative_id: string | null;
  creative_name: string | null;
  creative_avatar?: string | null;
  creative_hub?: string | null;
  creative_user_id?: string | null;
  requested_by: string;
  requested_by_name?: string;
  requested_at: string;
  resolved_at?: string | null;
  signed_at?: string | null;
  decline_reason?: string | null;
}

export interface PodInfo {
  podSupervision: boolean;
  combinedCoins: number;
  linkedProjects: Array<{
    project_id: string;
    title: string;
    category: string;
    creative_id?: string | null;
    creative_name?: string | null;
    coins: number;
  }>;
}

interface ApprovedCreativeOption {
  id: string;
  user_id: string;
  name: string;
  primary_specialty: string;
  peach_level: string;
  hub: string;
}

interface ProjectCollaboratorsProps {
  projectId: string;
  projectTitle: string;
  projectStatus: string;
  role: "business" | "creative" | "admin";
  isLeadCreative: boolean;
  currentUserId: string;
  availableCoins?: number;
  initialCollaborators?: CollaboratorItem[];
  initialPodInfo?: PodInfo | null;
  hidePodBanner?: boolean;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
  onRefresh?: () => void;
}

const SPECIALTY_OPTIONS = [
  { label: "Commercial Photography", defaultCoins: 6 },
  { label: "Website Design", defaultCoins: 8 },
  { label: "Branding Design", defaultCoins: 4 },
  { label: "Social Media Design", defaultCoins: 3 },
  { label: "Graphic Design", defaultCoins: 2 },
];

export function ProjectCollaborators({
  projectId,
  projectTitle,
  projectStatus,
  role,
  isLeadCreative,
  currentUserId,
  availableCoins = 0,
  initialCollaborators = [],
  initialPodInfo = null,
  hidePodBanner = false,
  isOpenModal = false,
  onCloseModal,
  onRefresh,
}: ProjectCollaboratorsProps) {
  const router = useRouter();
  const isBusiness = role === "business" || role === "admin";
  const isClosed = ["completed", "cancelled"].includes(projectStatus);

  const [collaborators, setCollaborators] = useState<CollaboratorItem[]>(initialCollaborators);
  const [podInfo, setPodInfo] = useState<PodInfo | null>(initialPodInfo);
  const [approvedCreatives, setApprovedCreatives] = useState<ApprovedCreativeOption[]>([]);

  const [showModal, setShowModal] = useState(isOpenModal);
  const [specialty, setSpecialty] = useState("Commercial Photography");
  const [suggestedCreativeId, setSuggestedCreativeId] = useState("");
  const [coins, setCoins] = useState<number>(6);
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [topUpShortage, setTopUpShortage] = useState<{ needed: number; available: number } | null>(null);
  const [topUpBusy, setTopUpBusy] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setShowModal(isOpenModal);
  }, [isOpenModal]);

  const loadCollaboratorData = async () => {
    try {
      const res = await fetch(`/api/projects/collaborators?projectId=${projectId}`);
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data.collaborators)) setCollaborators(data.collaborators);
        if (data.podInfo) setPodInfo(data.podInfo);
        if (Array.isArray(data.approvedCreatives)) setApprovedCreatives(data.approvedCreatives);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    loadCollaboratorData();
  }, [projectId]);

  const handleRequestCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setSubmitting(true);
    setErrorMsg("");
    setFeedbackMsg("");

    try {
      const res = await fetch("/api/projects/collaborators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request",
          projectId,
          specialty,
          suggestedCreativeId: suggestedCreativeId || null,
          coins,
          note: note.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit collaborator invite.");

      setFeedbackMsg(`✓ Collaborator invite for ${specialty} (${coins} Coins) sent to the business owner for approval!`);
      setShowModal(false);
      onCloseModal?.();
      setNote("");
      setSuggestedCreativeId("");
      await loadCollaboratorData();
      router.refresh();
      onRefresh?.();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not submit collaborator invite.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveCollaborator = async (item: CollaboratorItem) => {
    setBusyId(item.id);
    setErrorMsg("");
    setFeedbackMsg("");
    setTopUpShortage(null);

    try {
      const res = await fetch("/api/projects/collaborators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          projectId,
          collaboratorRequestId: item.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsTopUp) {
          setTopUpShortage({ needed: data.requiredCoins, available: data.availableCoins });
        }
        throw new Error(data.error || "Failed to approve collaborator.");
      }

      setFeedbackMsg(
        `✓ Approved & funded ${item.coins} Coins! Invitation & brief dispatched to ${data.invitedCreativeName}.`
      );
      await loadCollaboratorData();
      router.refresh();
      onRefresh?.();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not approve collaborator.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeclineCollaborator = async (item: CollaboratorItem) => {
    setBusyId(item.id);
    setErrorMsg("");
    setFeedbackMsg("");

    try {
      const res = await fetch("/api/projects/collaborators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "decline",
          projectId,
          collaboratorRequestId: item.id,
          reason: declineReason.trim() || "Scope adjustment not needed at this time.",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to decline collaborator.");

      setDecliningId(null);
      setDeclineReason("");
      setFeedbackMsg(`Collaborator request for ${item.specialty} declined.`);
      await loadCollaboratorData();
      router.refresh();
      onRefresh?.();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not decline collaborator.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCollaboratorContractAction = async (
    item: CollaboratorItem,
    contractAction: "accept_contract" | "decline_contract"
  ) => {
    setBusyId(item.id);
    setErrorMsg("");
    setFeedbackMsg("");

    try {
      const res = await fetch("/api/projects/collaborators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: contractAction,
          projectId,
          collaboratorRequestId: item.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not process invitation.");

      setFeedbackMsg(
        contractAction === "accept_contract"
          ? `✓ Collaboration agreement signed! You now have full Project Portal and Brand Vault access for "${projectTitle}".`
          : `Invitation declined. ${data.refundedCoins || item.coins} Coins refunded to client wallet.`
      );
      await loadCollaboratorData();
      router.refresh();
      onRefresh?.();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not update collaboration invitation.");
    } finally {
      setBusyId(null);
    }
  };

  const handleQuickTopUp = async (deficit: number) => {
    setTopUpBusy(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/wallet/top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins: deficit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Top-up failed.");
      setTopUpShortage(null);
      setFeedbackMsg(`✓ Added ${data.coinsAdded} Peach Coins! You can now approve the collaborator request.`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Top-up failed.");
    } finally {
      setTopUpBusy(false);
    }
  };

  const pendingRequests = collaborators.filter((c) => c.status === "pending");
  const awaitingSignature = collaborators.filter((c) => c.status === "approved_awaiting_signature");
  const activeCollaborators = collaborators.filter((c) => c.status === "active");
  const declinedCollaborators = collaborators.filter((c) => c.status === "declined");

  const hasAnythingToShow =
    Boolean(podInfo) ||
    collaborators.length > 0 ||
    (isLeadCreative && !isClosed);

  if (!hasAnythingToShow) return null;

  return (
    <div className="space-y-4 my-6">
      {/* LINKED MULTI-SERVICE POD BANNER */}
      {!hidePodBanner && podInfo && (
        <section className="bg-gradient-to-r from-[#173328] to-[#204938] text-white rounded-2xl p-5 shadow-sm border border-emerald-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F2C2B2]" />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Linked Multi-Service Pod ({podInfo.combinedCoins} Combined Coins)
              </span>
            </div>
            {podInfo.podSupervision && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-[#C84E2D] text-white px-3 py-1 rounded-full self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Art Director Pod Supervision Included Free</span>
              </span>
            )}
          </div>

          {podInfo.linkedProjects.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {podInfo.linkedProjects.map((lp) => {
                const isCurrent = lp.project_id === projectId;
                return (
                  <Link
                    key={lp.project_id}
                    href={`/projects/${lp.project_id}`}
                    className={`rounded-xl p-3 border transition-all flex items-center justify-between gap-2 ${
                      isCurrent
                        ? "bg-white/15 border-white/40 text-white"
                        : "bg-white/5 hover:bg-white/15 border-white/20 text-white"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#F2C2B2] block">
                        {isCurrent ? "Current Workspace" : "Companion Linked Project"} &bull; {lp.category}
                      </span>
                      <strong className="text-xs font-black text-white block truncate">{lp.title}</strong>
                      <span className="text-[11px] text-emerald-100">
                        {lp.creative_name || "Assigned Specialist"} &bull; {lp.coins} Coins
                      </span>
                    </div>
                    <span className="text-xs font-black text-[#F2C2B2] shrink-0">
                      {isCurrent ? "Active" : "Open →"}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950">
          {feedbackMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-950">
          {errorMsg}
        </div>
      )}

      {topUpShortage && (
        <div className="p-4 bg-[#FFF2EB] border-2 border-[#C84E2D] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-800">
            <strong className="text-[#C84E2D] block font-black uppercase">
              Coin Top-Up Needed ({topUpShortage.needed - topUpShortage.available} More Coins)
            </strong>
            <span>
              You have {topUpShortage.available} Coins available; this collaborator requires {topUpShortage.needed} Coins.
            </span>
          </div>
          <button
            type="button"
            disabled={topUpBusy}
            onClick={() => handleQuickTopUp(topUpShortage.needed - topUpShortage.available)}
            className="px-4 py-2 rounded-xl bg-[#173328] hover:bg-[#204938] !text-white text-white text-xs font-black shrink-0 cursor-pointer disabled:opacity-50"
          >
            {topUpBusy ? "Processing..." : `Top Up ${topUpShortage.needed - topUpShortage.available} Coins`}
          </button>
        </div>
      )}

      {/* COLLABORATORS & INVITES PANEL */}
      <section className="bg-white border-2 border-[#E8D8CF] rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C84E2D]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#173328] px-2.5 py-0.5 rounded-full">
                Multi-Creative Collaboration
              </span>
            </div>
            <h2 className="text-base font-black text-slate-950 mt-1">
              Project Collaborators &amp; Specialist Invites
            </h2>
            <p className="text-xs text-slate-600">
              Lead creatives can bring in vetted Peach specialists when a project needs another discipline. Collaborators receive Brand Vault access only until completion.
            </p>
          </div>

          {isLeadCreative && !isClosed && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C84E2D] hover:bg-[#A33B1E] !text-white text-white text-xs font-black shrink-0 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite / Hire Another Peach Creative</span>
            </button>
          )}
        </div>

        {/* 1. PENDING BUSINESS APPROVAL CARDS */}
        {pendingRequests.map((item) => (
          <div
            key={item.id}
            className="bg-[#FFF9F6] border-2 border-[#C84E2D] rounded-2xl p-4 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#C84E2D]">
                  <Clock className="w-3 h-3" />
                  <span>Pending Business Owner Approval</span>
                </span>
                <h3 className="text-sm font-black text-slate-950 mt-0.5">
                  Collaborator Needed: {item.specialty}
                  {item.creative_name ? ` (Suggested: ${item.creative_name})` : ""}
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Requested by {item.requested_by_name || "Lead Creative"} &bull;{" "}
                  {new Date(item.requested_at).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-white border border-[#F2C2B2] px-3 py-1.5 rounded-xl self-start sm:self-auto">
                <strong className="text-sm font-black text-[#C84E2D]">
                  {item.coins} Coins (${item.usd_amount} USD)
                </strong>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-white border border-[#F2C2B2] rounded-xl p-3 leading-relaxed">
              {item.note}
            </p>

            {isBusiness ? (
              <div className="space-y-2.5 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-600 font-semibold">
                    Your Wallet: <strong>{availableCoins} Coins available</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => setDecliningId(decliningId === item.id ? null : item.id)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-rose-300 text-rose-700 text-xs font-bold cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => handleApproveCollaborator(item)}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 !text-white text-white text-xs font-black cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {busyId === item.id
                        ? "Reserving Coins..."
                        : `Approve & Pay ${item.coins} Coins ($${item.usd_amount})`}
                    </button>
                  </div>
                </div>

                {decliningId === item.id && (
                  <div className="bg-white border border-rose-200 rounded-xl p-3 space-y-2">
                    <label className="text-[11px] font-bold text-rose-900 block">
                      Optional note for declining this collaborator invite:
                    </label>
                    <input
                      type="text"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="e.g., Let's keep current scope for now..."
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDecliningId(null)}
                        className="text-xs font-bold text-stone-600 px-3 py-1.5 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => handleDeclineCollaborator(item)}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-700 !text-white text-white text-xs font-black cursor-pointer"
                      >
                        Confirm Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-amber-800 font-semibold italic">
                Awaiting {role === "creative" ? "business owner" : "client"} approval and Coin reservation ({item.coins} Coins).
              </div>
            )}
          </div>
        ))}

        {/* 2. INVITED CREATIVE CONTRACT ACCEPTANCE CARDS */}
        {awaitingSignature.map((item) => {
          const canSign =
            role === "admin" ||
            item.creative_user_id === currentUserId ||
            (role === "creative" && !isLeadCreative);
          const payoutUsd = Math.round(item.coins * 50 * 0.75);

          return (
            <div
              key={item.id}
              className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-900">
                    <FileSignature className="w-3.5 h-3.5" />
                    <span>Coins Reserved &bull; Awaiting Collaborator Signature</span>
                  </span>
                  <h3 className="text-sm font-black text-slate-950 mt-0.5">
                    {item.creative_name || "Matched Peach Specialist"} &mdash; {item.specialty}
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    {item.creative_hub || "Birmingham Hub"} &bull; Guaranteed Collaborator Payout: ${payoutUsd} USD ({item.coins} Coins)
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-white border border-amber-200 rounded-xl p-3">
                {item.note}
              </p>

              {canSign && !isClosed && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => handleCollaboratorContractAction(item, "accept_contract")}
                    className="px-4 py-2 rounded-xl bg-[#173328] hover:bg-[#204938] !text-white text-white text-xs font-black cursor-pointer disabled:opacity-50"
                  >
                    {busyId === item.id ? "Joining..." : "Sign & Join Project Workspace →"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => handleCollaboratorContractAction(item, "decline_contract")}
                    className="px-3.5 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 text-xs font-bold cursor-pointer"
                  >
                    Decline Invite
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* 3. ACTIVE COLLABORATORS */}
        {activeCollaborators.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeCollaborators.map((item) => (
              <div
                key={item.id}
                className="bg-[#F0FDF4] border border-emerald-300 rounded-xl p-3.5 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Collaborator</span>
                  </div>
                  <strong className="text-sm font-black text-slate-950 block">
                    {item.creative_name || "Peach Specialist"}
                  </strong>
                  <span className="text-xs text-slate-700 block">
                    {item.specialty} &bull; {item.creative_hub || "Birmingham Hub"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 pt-0.5">
                    {isClosed ? <Lock className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                    <span>
                      {isClosed
                        ? "Brand Vault Access Closed (Project Completed)"
                        : "Brand Vault Active Until Completion"}
                    </span>
                  </span>
                </div>
                <span className="text-xs font-black text-[#173328] bg-white border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">
                  {item.coins} Coins
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 4. DECLINED HISTORY */}
        {declinedCollaborators.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {declinedCollaborators.map((item) => (
              <div
                key={item.id}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-600 flex items-center justify-between gap-2"
              >
                <span className="inline-flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    <strong>{item.specialty}</strong> ({item.coins} Coins) — Declined:{" "}
                    {item.decline_reason || "Not needed"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        {collaborators.length === 0 && (
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-3.5 text-xs text-stone-600">
            No extra collaborators added yet.{" "}
            {isLeadCreative
              ? 'Use "Invite / Hire Another Peach Creative" whenever this project needs a second specialty.'
              : "If your lead creative recommends adding a specialist (like Photography or Copy/Branding), their invite card will appear right here for your approval."}
          </div>
        )}
      </section>

      {/* LEAD CREATIVE INVITE COLLABORATOR MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => {
            setShowModal(false);
            onCloseModal?.();
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-[#173328] space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#C84E2D] text-white px-2.5 py-0.5 rounded-full">
                  Creative-to-Creative Collaboration
                </span>
                <h3 className="text-lg font-black text-slate-950 mt-1">
                  Invite / Hire Another Peach Creative
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  onCloseModal?.();
                }}
                className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Submit a Collaborator Request Card to the business owner. Once they click <strong>Approve &amp; Pay Coins</strong>, Peach Project Protection reserves the Coins and the invited specialist receives the brief, contract, and Brand Vault access until project completion.
            </p>

            <form onSubmit={handleRequestCollaborator} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Needed Creative Specialty:
                </label>
                <select
                  value={specialty}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSpecialty(next);
                    const found = SPECIALTY_OPTIONS.find((s) => s.label === next);
                    if (found) setCoins(found.defaultCoins);
                  }}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
                >
                  {SPECIALTY_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label} (Recommended: {opt.defaultCoins} Coins)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Preferred Vetted Peach Creative (Optional):
                </label>
                <select
                  value={suggestedCreativeId}
                  onChange={(e) => setSuggestedCreativeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
                >
                  <option value="">Auto-match best vetted specialist for {specialty}</option>
                  {approvedCreatives.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.primary_specialty} ({c.hub})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Collaborator Coin Cost:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={coins}
                    onChange={(e) => setCoins(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    required
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Client Cost / Creative Payout:
                  </label>
                  <div className="px-3 py-2 text-xs bg-stone-100 border border-stone-200 rounded-xl font-bold text-slate-800">
                    ${coins * 50} USD (${Math.round(coins * 50 * 0.75)} payout)
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Deliverables &amp; Why They&apos;re Needed:
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  required
                  placeholder="e.g., Need 12 retouched hero dish and interior photos to embed on the website hero & menu pages..."
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    onCloseModal?.();
                  }}
                  className="px-4 py-2 text-xs font-bold text-stone-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !note.trim()}
                  className="px-5 py-2 rounded-xl bg-[#173328] hover:bg-[#204938] !text-white text-white text-xs font-black cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Sending Request..." : "Send Collaborator Card to Client →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
