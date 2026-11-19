"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Camera,
  Check,
  FileText,
  FolderOpen,
  Globe,
  KeyRound,
  MapPin,
  Palette,
  Printer,
  Smartphone,
} from "lucide-react";

interface DisciplineWorkspaceProps {
  projectId: string;
  category: string;
  projectTitle: string;
  description?: string | null;
  coins: number;
  status: string;
  role: "business" | "creative" | "admin";
  onOpenAddOnModal?: () => void;
  onRefresh?: () => void;
}

export function DisciplineWorkspace({
  projectId,
  category,
  projectTitle,
  description,
  coins,
  status,
  role,
  onOpenAddOnModal,
  onRefresh,
}: DisciplineWorkspaceProps) {
  const router = useRouter();
  const isBusiness = role === "business" || role === "admin";
  const isCreative = role === "creative" || role === "admin";

  // Determine discipline
  const textCombo = `${category} ${projectTitle} ${description || ""}`.toLowerCase();
  const isPhotography =
    textCombo.includes("photo") ||
    textCombo.includes("portrait") ||
    textCombo.includes("shoot") ||
    textCombo.includes("tabletop") ||
    textCombo.includes("culinary");

  const isWebsite =
    !isPhotography &&
    (textCombo.includes("web") ||
      textCombo.includes("site") ||
      textCombo.includes("landing") ||
      textCombo.includes("shopify") ||
      textCombo.includes("webflow") ||
      textCombo.includes("e-commerce") ||
      textCombo.includes("squarespace"));

  // Photography State
  const [shootSchedule, setShootSchedule] = useState<{
    venueAddress: string;
    sessionDatetime: string;
    parkingNotes: string;
    contactPerson: string;
    status: string;
  }>({
    venueAddress: "",
    sessionDatetime: "",
    parkingNotes: "",
    contactPerson: "",
    status: "confirmed",
  });
  const [isEditingShoot, setIsEditingShoot] = useState(false);
  const [cloudDriveUrl, setCloudDriveUrl] = useState("");
  const [cloudDriveLabel, setCloudDriveLabel] = useState("Google Drive Master Photo Gallery");
  const [cloudLinks, setCloudLinks] = useState<any[]>([]);

  // Website State
  const [stagingUrls, setStagingUrls] = useState<any[]>([]);
  const [newStagingUrl, setNewStagingUrl] = useState("");
  const [newStagingLabel, setNewStagingLabel] = useState("Desktop & Mobile Live Staging Link");
  const [newStagingNotes, setNewStagingNotes] = useState("");
  const [isAddingStaging, setIsAddingStaging] = useState(false);

  const [ownershipTransfer, setOwnershipTransfer] = useState<{
    platform: string;
    targetEmail: string;
    notes: string;
    transferred: boolean;
    transferredAt?: string;
    transferredBy?: string;
  }>({
    platform: "Webflow",
    targetEmail: "",
    notes: "",
    transferred: false,
  });
  const [isEditingTransfer, setIsEditingTransfer] = useState(false);

  // Common UI State
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Load discipline data from API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/projects/discipline?projectId=${projectId}`);
        const data = await res.json();
        if (res.ok && data) {
          if (data.shootSchedule) setShootSchedule(data.shootSchedule);
          if (data.cloudLinks) setCloudLinks(data.cloudLinks);
          if (data.stagingUrls) setStagingUrls(data.stagingUrls);
          if (data.ownershipTransfer) setOwnershipTransfer(data.ownershipTransfer);
        }
      } catch (err) {
        // use defaults
      }
    }
    loadData();
  }, [projectId]);

  // Calculate photography deliverable limit
  const photoDeliverableLimit = (() => {
    if (coins <= 8) return { count: 5, label: "5 Fully Retouched, Color-Graded Portraits", tier: "Executive / Portrait (6 Coins)" };
    if (coins <= 11) return { count: 15, label: "15 Retouched Commercial Product Images", tier: "Product Tabletop (10 Coins)" };
    return { count: 20, label: "20 Retouched On-Location Commercial Photos", tier: "Culinary / Restaurant (12 Coins)" };
  })();

  // Handlers
  const handleSaveShootSchedule = async () => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/projects/discipline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_shoot_schedule",
          projectId,
          ...shootSchedule,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update shoot schedule.");
      setIsEditingShoot(false);
      setMsg("✓ Shoot location and schedule updated and sent to project board.");
      router.refresh();
      onRefresh?.();
    } catch (e: any) {
      setMsg(e.message || "Could not save shoot schedule.");
    } finally {
      setBusy(false);
    }
  };

  const handleAddCloudLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloudDriveUrl.trim()) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/projects/discipline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_cloud_link",
          projectId,
          url: cloudDriveUrl.trim(),
          label: cloudDriveLabel.trim() || "Google Drive Master Photo Gallery",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save cloud gallery link.");
      setCloudLinks((prev) => [...prev, data.link]);
      setCloudDriveUrl("");
      setMsg("✓ Cloud delivery link posted for client review.");
      router.refresh();
      onRefresh?.();
    } catch (e: any) {
      setMsg(e.message || "Could not add cloud link.");
    } finally {
      setBusy(false);
    }
  };

  const handleAddStagingUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStagingUrl.trim()) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/projects/discipline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_staging_url",
          projectId,
          url: newStagingUrl.trim(),
          label: newStagingLabel.trim() || "Staging Link",
          notes: newStagingNotes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add staging link.");
      setStagingUrls((prev) => [...prev, data.staging]);
      setNewStagingUrl("");
      setNewStagingNotes("");
      setIsAddingStaging(false);
      setMsg("✓ Staging URL posted to client project room.");
      router.refresh();
      onRefresh?.();
    } catch (e: any) {
      setMsg(e.message || "Could not add staging link.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveStagingUrl = async (id: string) => {
    setBusy(true);
    try {
      await fetch("/api/projects/discipline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove_staging_url",
          projectId,
          stagingId: id,
        }),
      });
      setStagingUrls((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  };

  const handleSaveOwnershipTransfer = async (markTransferred?: boolean) => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/projects/discipline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_ownership_transfer",
          projectId,
          ...ownershipTransfer,
          markTransferred,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update ownership transfer.");
      if (data.ownershipTransfer) setOwnershipTransfer(data.ownershipTransfer);
      setIsEditingTransfer(false);
      setMsg(markTransferred ? "100% Administrative Ownership Transferred to Client." : "Transfer credentials recorded.");
      router.refresh();
      onRefresh?.();
    } catch (e: any) {
      setMsg(e.message || "Could not save transfer info.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 my-6">
      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900">
          {msg}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. COMMERCIAL PHOTOGRAPHY WORKSPACE */}
      {/* ========================================================================= */}
      {isPhotography && (
        <div className="space-y-4">
          {/* PACKAGE PHOTO LIMIT BANNER */}
          <div className="bg-gradient-to-r from-[#0B2D22] via-[#164E3F] to-[#0B2D22] text-white p-5 rounded-2xl shadow-sm border border-emerald-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#C84E2D] px-2.5 py-0.5 rounded-full text-white">
                  Photography Deliverable Limit
                </span>
                <span className="text-xs text-emerald-300 font-bold">
                  {photoDeliverableLimit.tier}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#FFD1BA] shrink-0" />
                <span>Package Deliverable Limit: <span className="text-[#FFD1BA]">{photoDeliverableLimit.label}</span></span>
              </h3>
              <p className="text-xs text-emerald-100/80 max-w-xl">
                All finished deliverables include full commercial licensing and high-resolution master color grading. Extra retouched photos can be requested via mid-project add-on (+2 Coins per 5 images).
              </p>
            </div>

            {isCreative && onOpenAddOnModal && (
              <button
                type="button"
                onClick={onOpenAddOnModal}
                className="px-4 py-2 bg-[#C84E2D] hover:bg-[#A33B1E] !text-white text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                + Request Extra Photos / Add-On
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SHOOT LOCATION & SCHEDULE CARD */}
            <div className="bg-white border-2 border-[#F2C2B2] rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#F2C2B2]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF5E3A] shrink-0" />
                  <strong className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Shoot Location &amp; Session Schedule
                  </strong>
                </div>
                {isBusiness && !isEditingShoot && (
                  <button
                    type="button"
                    onClick={() => setIsEditingShoot(true)}
                    className="text-xs font-bold text-[#C84E2D] hover:underline cursor-pointer"
                  >
                    Edit Details ✎
                  </button>
                )}
              </div>

              {isEditingShoot ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Venue / Studio Address:
                    </label>
                    <input
                      type="text"
                      value={shootSchedule.venueAddress}
                      onChange={(e) => setShootSchedule({ ...shootSchedule, venueAddress: e.target.value })}
                      placeholder="e.g. 1824 4th Ave N, Studio 2B, Birmingham, AL 35203"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#C84E2D]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Session Date &amp; Time:
                    </label>
                    <input
                      type="text"
                      value={shootSchedule.sessionDatetime}
                      onChange={(e) => setShootSchedule({ ...shootSchedule, sessionDatetime: e.target.value })}
                      placeholder="e.g. Saturday, Nov 22, 2026 at 2:00 PM CT (2 Hours)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#C84E2D]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Parking / Access &amp; Contact Notes:
                    </label>
                    <textarea
                      value={shootSchedule.parkingNotes}
                      onChange={(e) => setShootSchedule({ ...shootSchedule, parkingNotes: e.target.value })}
                      placeholder="e.g. Free street parking on 4th Ave. Buzz unit 2B upon arrival. Contact Mike at (205) 555-0123."
                      rows={2}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#C84E2D]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingShoot(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleSaveShootSchedule}
                      className="px-4 py-1.5 bg-[#0B2D22] !text-white text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      {busy ? "Saving..." : "Save Shoot Details"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  <div className="bg-[#FFF9F6] border border-[#F2C2B2] p-3 rounded-xl space-y-1.5">
                    <div className="text-slate-500 font-bold text-[10px] uppercase">Venue Address:</div>
                    <div className="font-extrabold text-slate-900 text-sm">
                      {shootSchedule.venueAddress || "Address not provided yet by client."}
                    </div>
                    {shootSchedule.venueAddress && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(shootSchedule.venueAddress)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-[11px] font-bold text-[#C84E2D] hover:underline"
                      >
                        Open in Google Maps ↗
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Session Timing</span>
                      <strong className="text-slate-900 text-xs">
                        {shootSchedule.sessionDatetime || "To be confirmed with photographer"}
                      </strong>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Status</span>
                      <strong className="text-emerald-700 text-xs">
                        {shootSchedule.venueAddress ? "Confirmed On-Site" : "Pending Client Entry"}
                      </strong>
                    </div>
                  </div>

                  {shootSchedule.parkingNotes && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700 text-[11px]">
                      <strong>Parking &amp; Arrival Notes:</strong> {shootSchedule.parkingNotes}
                    </div>
                  )}

                  {isBusiness && !shootSchedule.venueAddress && (
                    <button
                      type="button"
                      onClick={() => setIsEditingShoot(true)}
                      className="w-full py-2 bg-[#C84E2D] !text-white text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      + Enter Shoot Venue Address &amp; Time
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* GOOGLE DRIVE / CLOUD GALLERY DELIVERY CARD */}
            <div className="bg-white border-2 border-[#F2C2B2] rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#F2C2B2]">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[#FF5E3A] shrink-0" />
                  <strong className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Google Drive / Cloud Photo Gallery
                  </strong>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  High-Res Masters
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Photographers can paste their Google Drive, Dropbox, or Pixieset link here for client review and full-resolution uncompressed downloads.
              </p>

              {/* Display existing cloud links */}
              {cloudLinks.length > 0 ? (
                <div className="space-y-2">
                  {cloudLinks.map((link, idx) => (
                    <div
                      key={link.id || idx}
                      className="p-3 bg-[#F0FDF4] border border-emerald-300 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <strong className="text-xs text-slate-900 block truncate font-black">
                          {link.label || "Google Drive Master Gallery"}
                        </strong>
                        <span className="text-[11px] text-emerald-800 truncate block">
                          {link.url}
                        </span>
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#0B2D22] hover:bg-[#164E3F] !text-white text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 shadow-2xs"
                      >
                        Open Gallery ↗
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                  No cloud delivery link posted yet. Your photographer will share their high-res gallery link or upload directly.
                </div>
              )}

              {/* Photographer input to add/update link */}
              {isCreative && (
                <form onSubmit={handleAddCloudLink} className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-700">
                    Post Google Drive / Cloud Gallery Link:
                  </div>
                  <input
                    type="url"
                    value={cloudDriveUrl}
                    onChange={(e) => setCloudDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#C84E2D]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cloudDriveLabel}
                      onChange={(e) => setCloudDriveLabel(e.target.value)}
                      placeholder="Gallery title (optional)"
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#C84E2D]"
                    />
                    <button
                      type="submit"
                      disabled={busy || !cloudDriveUrl.trim()}
                      className="px-4 py-1.5 bg-[#0B2D22] hover:bg-[#164E3F] !text-white text-white text-xs font-bold rounded-lg disabled:opacity-50 cursor-pointer"
                    >
                      {busy ? "Saving..." : "Post Link"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. WEBSITE DESIGN WORKSPACE */}
      {/* ========================================================================= */}
      {isWebsite && (
        <div className="space-y-4">
          {/* DOMAIN & HOSTING POLICY BANNER (CRITICAL REQUIREMENT) */}
          <div className="bg-gradient-to-r from-[#FFF0EA] via-[#FFE5D9] to-[#FFF5F0] border-2 border-[#C84E2D] p-4 sm:p-5 rounded-2xl shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#FF5E3A] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-xs font-black uppercase tracking-wider text-[#A33B1E] block">
                  Domain Registration &amp; Website Hosting Policy
                </strong>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  <strong>Domain registration and website hosting are NOT included by default.</strong> The designer builds your site for 100% transfer to your Webflow, Shopify, or Squarespace account. If you need the designer to set up custom hosting, purchase a domain, or connect DNS records, please use the <strong>Request Add-On</strong> button below (Hosting Setup is available for <strong>4 Peach Coins / $200</strong>).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MULTIPLE STAGING / PREVIEW URLS CARD */}
            <div className="bg-white border-2 border-[#F2C2B2] rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#F2C2B2]">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#FF5E3A] shrink-0" />
                  <strong className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Live Staging &amp; Preview URLs ({stagingUrls.length})
                  </strong>
                </div>
                {isCreative && !isAddingStaging && (
                  <button
                    type="button"
                    onClick={() => setIsAddingStaging(true)}
                    className="text-xs font-bold text-[#C84E2D] hover:underline cursor-pointer"
                  >
                    + Add Staging Link
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600">
                Review desktop and mobile layouts across revision rounds. Click each staging link to test responsiveness, contact forms, and animations.
              </p>

              {/* Staging Links List */}
              <div className="space-y-2.5">
                {stagingUrls.map((stg) => (
                  <div
                    key={stg.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-[#C84E2D] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <strong className="text-xs font-black text-slate-900 block">
                          {stg.label || "Live Staging Link"}
                        </strong>
                        <span className="text-[11px] text-slate-500 font-mono block truncate">
                          {stg.url}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={stg.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-[#0B2D22] !text-white text-white font-bold text-[11px] rounded-lg hover:bg-[#164E3F]"
                        >
                          Open Staging ↗
                        </a>
                        {isCreative && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStagingUrl(stg.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 text-xs font-bold cursor-pointer"
                            title="Remove staging link"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    {stg.notes && (
                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                        <strong>Notes:</strong> {stg.notes}
                      </div>
                    )}
                  </div>
                ))}

                {stagingUrls.length === 0 && !isAddingStaging && (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                    No staging links posted yet. The designer will post a Webflow/Squarespace staging link when the first layout is ready.
                  </div>
                )}
              </div>

              {/* Add Staging Link Form (Designer) */}
              {isAddingStaging && (
                <form onSubmit={handleAddStagingUrl} className="space-y-2.5 bg-[#FFF9F6] p-3.5 rounded-xl border border-[#F2C2B2]">
                  <strong className="text-xs font-bold text-slate-900 block">
                    Post New Staging / Preview URL
                  </strong>
                  <div>
                    <input
                      type="url"
                      value={newStagingUrl}
                      onChange={(e) => setNewStagingUrl(e.target.value)}
                      placeholder="https://client-preview.webflow.io"
                      required
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#C84E2D]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newStagingLabel}
                      onChange={(e) => setNewStagingLabel(e.target.value)}
                      placeholder="e.g. Round 2 Staging Link (Desktop + Mobile)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#C84E2D]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newStagingNotes}
                      onChange={(e) => setNewStagingNotes(e.target.value)}
                      placeholder="Notes / password / what to test (optional)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#C84E2D]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingStaging(false)}
                      className="px-3 py-1 text-xs text-slate-600 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={busy || !newStagingUrl.trim()}
                      className="px-3 py-1 bg-[#0B2D22] !text-white text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      {busy ? "Saving..." : "Add Staging Link"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* WEBSITE OWNERSHIP TRANSFER CARD (FINAL MILESTONE STEP) */}
            <div className={`rounded-2xl p-5 space-y-4 shadow-2xs border-2 transition-all ${
              ownershipTransfer.transferred
                ? "bg-emerald-50/70 border-emerald-300"
                : "bg-white border-[#F2C2B2]"
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#FF5E3A] shrink-0" />
                  <strong className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Website Ownership Transfer
                  </strong>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                  ownershipTransfer.transferred
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-100 text-amber-900 border border-amber-300"
                }`}>
                  {ownershipTransfer.transferred ? "Transferred ✓" : "Final Milestone Step"}
                </span>
              </div>

              <p className="text-xs text-slate-600">
                {ownershipTransfer.transferred
                  ? "100% Administrative site ownership has been successfully transferred to the client."
                  : "The client enters their target account email below, and the designer transfers full site ownership before final sign-off."}
              </p>

              {ownershipTransfer.transferred ? (
                <div className="p-3 bg-white border border-emerald-300 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-black">
                    <span>✓</span> 100% Site Ownership Transferred!
                  </div>
                  <div className="text-slate-700">
                    <strong>Target Platform:</strong> {ownershipTransfer.platform} &bull; <strong>Recipient:</strong> {ownershipTransfer.targetEmail}
                  </div>
                  {ownershipTransfer.transferredAt && (
                    <div className="text-[10px] text-slate-500">
                      Transferred on {new Date(ownershipTransfer.transferredAt).toLocaleString()} by {ownershipTransfer.transferredBy || "Designer"}
                    </div>
                  )}
                </div>
              ) : isEditingTransfer ? (
                <div className="space-y-3 bg-[#FFF9F6] p-3 rounded-xl border border-[#F2C2B2]">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Website Platform:
                    </label>
                    <select
                      value={ownershipTransfer.platform}
                      onChange={(e) => setOwnershipTransfer({ ...ownershipTransfer, platform: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="Webflow">Webflow (Project Transfer)</option>
                      <option value="Shopify">Shopify (Collaborator / Store Transfer)</option>
                      <option value="Squarespace">Squarespace (Ownership Transfer)</option>
                      <option value="Framer">Framer (Workspace / Project Transfer)</option>
                      <option value="Custom Code / GitHub">Custom Code / GitHub Repository</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Target Account Email for Transfer:
                    </label>
                    <input
                      type="email"
                      value={ownershipTransfer.targetEmail}
                      onChange={(e) => setOwnershipTransfer({ ...ownershipTransfer, targetEmail: e.target.value })}
                      placeholder="owner@yourbusiness.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#C84E2D]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Transfer &amp; Domain Notes (Optional):
                    </label>
                    <input
                      type="text"
                      value={ownershipTransfer.notes}
                      onChange={(e) => setOwnershipTransfer({ ...ownershipTransfer, notes: e.target.value })}
                      placeholder="e.g. Domain registered on GoDaddy, DNS ready"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#C84E2D]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingTransfer(false)}
                      className="px-3 py-1 text-xs text-slate-600 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={busy || !ownershipTransfer.targetEmail.trim()}
                      onClick={() => handleSaveOwnershipTransfer(false)}
                      className="px-4 py-1.5 bg-[#0B2D22] !text-white text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      {busy ? "Saving..." : "Save Transfer Credentials"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div>
                      <span className="text-slate-500 font-bold">Platform:</span>{" "}
                      <strong>{ownershipTransfer.platform || "Webflow"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold">Target Account:</span>{" "}
                      <strong>{ownershipTransfer.targetEmail || "Not provided yet by client"}</strong>
                    </div>
                    {ownershipTransfer.notes && (
                      <div className="text-[11px] text-slate-600">
                        <span className="text-slate-500 font-bold">Notes:</span> {ownershipTransfer.notes}
                      </div>
                    )}
                  </div>

                  {isBusiness && (
                    <button
                      type="button"
                      onClick={() => setIsEditingTransfer(true)}
                      className="w-full py-2 bg-[#C84E2D] !text-white text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      {ownershipTransfer.targetEmail ? "Update Transfer Email / Details ✎" : "Enter Target Account Email for Transfer →"}
                    </button>
                  )}

                  {isCreative && ownershipTransfer.targetEmail && !ownershipTransfer.transferred && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleSaveOwnershipTransfer(true)}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 !text-white text-white font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>✓</span> Confirm 100% Ownership Transferred to Client
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. BRANDING, SOCIAL MEDIA & GRAPHIC DESIGN WORKSPACE */}
      {/* ========================================================================= */}
      {!isPhotography && !isWebsite && (
        <div className="bg-white border-2 border-[#F2C2B2] rounded-2xl p-5 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2C2B2]">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#C84E2D] px-2.5 py-0.5 rounded-full">
                Design Deliverable Hub
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Stage-by-Stage &amp; Master Vector Delivery
              </h3>
              <p className="text-xs text-slate-600">
                Creatives can deliver preliminary proofs, master vector suites (.AI, .SVG, .EPS), Brand Sheets, and social exports directly below or via Google Drive.
              </p>
            </div>

            {isCreative && onOpenAddOnModal && (
              <button
                type="button"
                onClick={onOpenAddOnModal}
                className="px-3.5 py-1.5 bg-[#0B2D22] hover:bg-[#164E3F] !text-white text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
              >
                + Request Add-On / Extra Coins
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl text-center space-y-1">
              <Palette className="w-4 h-4 text-[#FF5E3A] mx-auto" />
              <strong className="text-[11px] text-[#231714] font-bold block">Master Vector Suite</strong>
              <span className="text-[10px] text-[#4A3B36]">.AI &bull; .SVG &bull; .EPS</span>
            </div>
            <div className="p-3 bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl text-center space-y-1">
              <FileText className="w-4 h-4 text-[#FF5E3A] mx-auto" />
              <strong className="text-[11px] text-[#231714] font-bold block">Master Brand Sheet</strong>
              <span className="text-[10px] text-[#4A3B36]">Fonts, Hex &amp; Clearspace</span>
            </div>
            <div className="p-3 bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl text-center space-y-1">
              <Smartphone className="w-4 h-4 text-[#FF5E3A] mx-auto" />
              <strong className="text-[11px] text-[#231714] font-bold block">Social Launch Pack</strong>
              <span className="text-[10px] text-[#4A3B36]">Stories &bull; Posts &bull; Banners</span>
            </div>
            <div className="p-3 bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl text-center space-y-1">
              <Printer className="w-4 h-4 text-[#FF5E3A] mx-auto" />
              <strong className="text-[11px] text-[#231714] font-bold block">Print Press PDFs</strong>
              <span className="text-[10px] text-[#4A3B36]">300 DPI CMYK Bleeds</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
