"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export interface ProjectAddOnItem {
  id: string;
  project_id: string;
  title: string;
  description: string;
  coins: number;
  status: "pending" | "approved" | "declined";
  requested_by?: string;
  requested_at: string;
  resolved_at?: string;
  decline_reason?: string;
}

interface ProjectAddOnsProps {
  projectId: string;
  projectTitle: string;
  category: string;
  role: "business" | "creative" | "admin";
  availableCoins?: number;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
  onRefresh?: () => void;
}

const PRESET_ADD_ONS = [
  {
    title: "Website Hosting Setup & Domain DNS Hookup",
    coins: 4,
    description: "Full hosting configuration on Webflow/Shopify/Squarespace, custom domain purchase/transfer assistance, SSL certificate provisioning, and DNS A/CNAME record verification.",
  },
  {
    title: "Additional Custom Web Page (Desktop + Mobile)",
    coins: 3,
    description: "1 extra custom responsive web page (e.g. Gallery, Detailed Case Study, Team Directory, or Custom Booking form) matching existing brand tokens.",
  },
  {
    title: "5 Extra Retouched Commercial Photos",
    coins: 2,
    description: "5 additional high-resolution commercial images with master color grading, blemishes retouching, and print/web deliverable exports.",
  },
  {
    title: "Rush 48-Hour Turnaround",
    coins: 4,
    description: "Expedited turnaround guarantee: Designer prioritizes milestone deliverable reviews and produces final outputs within 48 business hours.",
  },
  {
    title: "Social Media Profile & Banner Kit",
    coins: 2,
    description: "Cohesive multi-platform header banners, square avatars, and launch highlight covers formatted for Instagram, LinkedIn, and Facebook.",
  },
];

export function ProjectAddOns({
  projectId,
  projectTitle,
  category,
  role,
  availableCoins = 0,
  isOpenModal = false,
  onCloseModal,
  onRefresh,
}: ProjectAddOnsProps) {
  const router = useRouter();
  const isBusiness = role === "business" || role === "admin";
  const isCreative = role === "creative" || role === "admin";

  const [addOns, setAddOns] = useState<ProjectAddOnItem[]>([]);
  const [showModal, setShowModal] = useState(isOpenModal);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [topUpModal, setTopUpModal] = useState<{ needed: number; available: number } | null>(null);

  // Form State
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");
  const [formTitle, setFormTitle] = useState("");
  const [formCoins, setFormCoins] = useState<number>(2);
  const [formDescription, setFormDescription] = useState("");

  useEffect(() => {
    setShowModal(isOpenModal);
  }, [isOpenModal]);

  const loadAddOns = async () => {
    try {
      const res = await fetch(`/api/projects/add-ons?projectId=${projectId}`);
      const data = await res.json();
      if (res.ok && data.addOns) {
        setAddOns(data.addOns);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    loadAddOns();
  }, [projectId]);

  const handleSelectPreset = (indexStr: string) => {
    setSelectedPreset(indexStr);
    if (indexStr === "custom") {
      setFormTitle("");
      setFormCoins(2);
      setFormDescription("");
    } else {
      const p = PRESET_ADD_ONS[Number(indexStr)];
      if (p) {
        setFormTitle(p.title);
        setFormCoins(p.coins);
        setFormDescription(p.description);
      }
    }
  };

  const handleCreateAddOn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    setMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/projects/add-ons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request",
          projectId,
          title: formTitle.trim(),
          coins: formCoins,
          description: formDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create add-on proposal.");

      setMsg(`✓ Add-on proposal "${formTitle}" sent to client for review!`);
      setShowModal(false);
      onCloseModal?.();
      setFormTitle("");
      setFormDescription("");
      loadAddOns();
      router.refresh();
      onRefresh?.();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not propose add-on.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveAddOn = async (addOn: ProjectAddOnItem) => {
    setBusyId(addOn.id);
    setMsg("");
    setErrorMsg("");
    setTopUpModal(null);

    try {
      const res = await fetch("/api/projects/add-ons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          projectId,
          addOnId: addOn.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.needsTopUp) {
          setTopUpModal({ needed: data.requiredCoins, available: data.availableCoins });
          throw new Error(data.error);
        }
        throw new Error(data.error || "Failed to approve add-on.");
      }

      setMsg(`Approved "${addOn.title}" — ${addOn.coins} Peach Coins reserved under Peach Project Protection.`);
      loadAddOns();
      router.refresh();
      onRefresh?.();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not approve add-on.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeclineAddOn = async (addOn: ProjectAddOnItem) => {
    const reason = prompt("Enter a brief note for why you are declining this add-on (optional):", "Scope not needed at this time.");
    if (reason === null) return; // user cancelled prompt

    setBusyId(addOn.id);
    setMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/projects/add-ons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "decline",
          projectId,
          addOnId: addOn.id,
          title: addOn.title,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to decline add-on.");

      setMsg(`Add-on "${addOn.title}" declined.`);
      loadAddOns();
      router.refresh();
      onRefresh?.();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not decline add-on.");
    } finally {
      setBusyId(null);
    }
  };

  const pendingAddOns = addOns.filter((a) => a.status === "pending");
  const resolvedAddOns = addOns.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-4 my-6">
      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950">
          {msg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-950">
          {errorMsg}
        </div>
      )}

      {/* TOP-UP MODAL PROMPT IF CLIENT IS SHORT ON COINS */}
      {topUpModal && (
        <div className="p-5 bg-[#FFF2EB] border-2 border-[#C84E2D] rounded-2xl space-y-3 shadow-md">
          <div className="flex items-center gap-2 text-[#C84E2D]">
            <strong className="text-sm font-black uppercase">
              Peach Coin Top-Up Required
            </strong>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            This add-on requires <strong>{topUpModal.needed} Peach Coins</strong> (${topUpModal.needed * 50} USD), but you currently have <strong>{topUpModal.available} Coins</strong> available in your wallet.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <Link
              href="/business/wallet"
              className="px-4 py-2 bg-[#C84E2D] hover:bg-[#A33B1E] !text-white text-white font-black text-xs rounded-xl shadow-xs transition-colors"
            >
              Top Up Coins in Wallet →
            </Link>
            <button
              type="button"
              onClick={() => setTopUpModal(null)}
              className="text-xs text-slate-600 hover:text-slate-900 font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* PENDING ADD-ON APPROVAL CARDS (BUSINESS / CREATIVE) */}
      {pendingAddOns.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#C84E2D] text-white px-2.5 py-0.5 rounded-full">
              Mid-Project Scope Add-On
            </span>
            <span className="text-xs text-slate-600 font-bold">
              {isBusiness ? "Action Required: Client Approval" : "Pending Client Review"}
            </span>
          </div>

          {pendingAddOns.map((addOn) => (
            <div
              key={addOn.id}
              className="bg-white border-2 border-[#C84E2D] rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F2C2B2]">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {addOn.title}
                  </h3>
                  <div className="text-xs text-slate-500 font-semibold mt-0.5">
                    Requested on {new Date(addOn.requested_at).toLocaleDateString()} &bull; 1 Coin = $50 USD
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 bg-[#FFF0EA] px-3.5 py-1.5 rounded-xl border border-[#F2C2B2] shrink-0 self-start sm:self-auto">
                  <span className="text-xs text-slate-700 font-bold">Price:</span>
                  <strong className="text-sm font-black text-[#C84E2D]">
                    {addOn.coins} Peach Coin{addOn.coins === 1 ? "" : "s"} (${addOn.coins * 50} USD)
                  </strong>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium bg-[#FFF9F6] p-3 rounded-xl border border-[#F2C2B2]">
                {addOn.description}
              </p>

              {/* Action Buttons for Client */}
              {isBusiness ? (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500 font-bold">
                    Wallet Balance: <strong>{availableCoins} Coins available</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === addOn.id}
                      onClick={() => handleDeclineAddOn(addOn)}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-rose-700 border border-rose-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      disabled={busyId === addOn.id}
                      onClick={() => handleApproveAddOn(addOn)}
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 !text-white text-white font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      {busyId === addOn.id ? "Approving & Funding..." : `✓ Approve & Pay ${addOn.coins} Coins ($${addOn.coins * 50})`}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-medium italic pt-1">
                  Awaiting client approval. Once approved, {addOn.coins} Coins will be reserved under Peach Project Protection and added to your project payout.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* RESOLVED ADD-ONS HISTORY (APPROVED OR DECLINED) */}
      {resolvedAddOns.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Add-On History ({resolvedAddOns.length})
          </span>
          <div className="space-y-2">
            {resolvedAddOns.map((addOn) => (
              <div
                key={addOn.id}
                className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  addOn.status === "approved"
                    ? "bg-[#F0FDF4] border-emerald-300 text-emerald-950"
                    : "bg-slate-100 border-slate-300 text-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="font-bold">{addOn.title}</strong>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        addOn.status === "approved"
                          ? "bg-emerald-200 text-emerald-900"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {addOn.status === "approved" ? "Approved ✓" : "Declined"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 block">
                    {addOn.coins} Coins (${addOn.coins * 50} USD)
                    {addOn.decline_reason ? ` &bull; Reason: ${addOn.decline_reason}` : ""}
                  </span>
                </div>
                {addOn.resolved_at && (
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(addOn.resolved_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATIVE ADD-ON REQUEST BUTTON (ALWAYS PROMINENT TO DESIGNER) */}
      {isCreative && !showModal && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full py-2.5 bg-[#231714] hover:bg-[#3A2823] text-white font-bold text-xs rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>+ Request Add-On / Extra Coins (Mid-Project Scope)</span>
          </button>
        </div>
      )}

      {/* CREATIVE ADD-ON REQUEST MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-[#C84E2D] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2C2B2]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#C84E2D] px-2.5 py-0.5 rounded-full">
                  Peach 2026 Scope Engine
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Request Add-On / Extra Coins
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  onCloseModal?.();
                }}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 font-bold flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Need extra hours, hosting setup, or additional deliverables? Propose an add-on with clear deliverables. Once the client approves, the coins are deducted and added directly to your project payout.
            </p>

            <form onSubmit={handleCreateAddOn} className="space-y-3.5">
              {/* Presets Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Choose a Common Add-On or Custom:
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#C84E2D]"
                >
                  <option value="custom">-- Custom Add-On Scope --</option>
                  {PRESET_ADD_ONS.map((p, idx) => (
                    <option key={idx} value={String(idx)}>
                      {p.title} ({p.coins} Coins / ${p.coins * 50})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Add-On Title:
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Website Hosting Setup & Domain Hookup"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#C84E2D]"
                />
              </div>

              {/* Coins Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Coins Amount:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formCoins}
                    onChange={(e) => setFormCoins(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#C84E2D]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    USD Equivalent:
                  </label>
                  <div className="px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-extrabold">
                    ${formCoins * 50} USD (at $50/coin)
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Deliverable Scope &amp; Details:
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explain exactly what will be created, configured, or delivered for this add-on..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#C84E2D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    onCloseModal?.();
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formTitle.trim()}
                  className="px-5 py-2 bg-[#C84E2D] hover:bg-[#A33B1E] !text-white text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Proposal to Client →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
