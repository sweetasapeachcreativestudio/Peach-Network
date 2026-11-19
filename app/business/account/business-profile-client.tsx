"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bell,
  Camera,
  Check,
  ChevronDown,
  Globe,
  HelpCircle,
  Layers,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import {
  BUSINESS_INDUSTRY_OPTIONS,
  DAILY_CREATIVE_NEEDS_OPTIONS,
  formatCityHub,
} from "@/lib/hubs";
import { PHOTO_GUIDE_SPEC, validatePhotoFileMeta } from "@/lib/photo-upload-guide";
import { PhotoUploadGuide } from "@/app/components/photo-upload-guide";
import type { BusinessBrandReadinessResult } from "@/lib/readiness";

export interface ShowcasePhoto {
  id: string;
  label: string;
  notes?: string | null;
  value?: string | null;
  storage_path?: string | null;
  original_name?: string | null;
}

export interface SocialHandlesData {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  assetId?: string | null;
}

interface BusinessProfileClientProps {
  initialProfile: {
    fullName: string;
    email: string;
    phone: string;
    businessName: string;
    industry: string;
    description: string;
    businessPhone: string;
    website: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    logoUrl: string;
    preferredContact: string;
    commonNeeds: string[];
  };
  initialPhotos: ShowcasePhoto[];
  initialSocials: SocialHandlesData;
  initialReadiness: BusinessBrandReadinessResult;
  brandAssetCount: number;
}

export function BusinessProfileClient({
  initialProfile,
  initialPhotos,
  initialSocials,
  initialReadiness,
  brandAssetCount,
}: BusinessProfileClientProps) {
  const router = useRouter();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const showcaseInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(initialProfile);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(initialProfile.commonNeeds);
  const [customNeed, setCustomNeed] = useState("");
  const [photos, setPhotos] = useState<ShowcasePhoto[]>(initialPhotos);
  const [photoCaption, setPhotoCaption] = useState("");
  const [socials, setSocials] = useState<SocialHandlesData>(initialSocials);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [showcaseError, setShowcaseError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const cityHub = formatCityHub(form.city, form.state);

  const toggleNeed = (need: string) => {
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((item) => item !== need) : [...prev, need]
    );
  };

  const handleAddCustomNeed = () => {
    const clean = customNeed.trim();
    if (!clean) return;
    if (!selectedNeeds.includes(clean)) {
      setSelectedNeeds((prev) => [...prev, clean]);
    }
    setCustomNeed("");
  };

  const persistProfile = async (overrideLogoUrl?: string) => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-peach-role": "business" },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          businessName: form.businessName,
          industry: form.industry,
          description: form.description,
          businessPhone: form.businessPhone,
          website: form.website,
          addressLine1: form.addressLine1,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          logoUrl: overrideLogoUrl ?? form.logoUrl,
          preferredContact: form.preferredContact,
          commonNeeds: selectedNeeds.join(", "),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save business profile.");

      const socialValue = JSON.stringify({
        instagram: (socials.instagram || "").trim(),
        tiktok: (socials.tiktok || "").trim(),
        facebook: (socials.facebook || "").trim(),
      });
      const hasSocialContent =
        Boolean(socials.instagram?.trim()) ||
        Boolean(socials.tiktok?.trim()) ||
        Boolean(socials.facebook?.trim());

      if (hasSocialContent || socials.assetId) {
        const socialRes = await fetch("/api/brand-vault", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-peach-role": "business" },
          body: JSON.stringify({
            id: socials.assetId || undefined,
            label: "Social Handles",
            kind: "other",
            value: socialValue,
            notes: "Connected business social media handles",
          }),
        });
        const socialData = await socialRes.json();
        if (socialRes.ok && socialData?.id) {
          setSocials((prev) => ({ ...prev, assetId: socialData.id }));
        }
      }

      setFeedback({
        type: "ok",
        text: "Profile saved. Peachy™ now tailors matches and briefs to your studio details.",
      });
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "err", text: err?.message || "Could not save changes." });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError(null);
    setFeedback(null);

    const check = validatePhotoFileMeta(file, "logo");
    if (!check.ok) {
      const msg = check.error || "Unsupported logo image.";
      setLogoError(msg);
      setFeedback({ type: "err", text: msg });
      if (logoInputRef.current) logoInputRef.current.value = "";
      return;
    }

    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "logo");
      fd.append("label", `${form.businessName || "Business"} Logo`);
      fd.append("notes", "Uploaded via Business Profile");

      const saveRes = await fetch("/api/brand-vault", {
        method: "POST",
        headers: { "x-peach-role": "business" },
        body: fd,
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData?.id) {
        throw new Error(saveData?.error || "Could not upload business logo.");
      }

      const inlineUrl = saveData.inlineUrl || `/api/brand-vault/${saveData.id}?inline=1`;
      setForm((prev) => ({ ...prev, logoUrl: inlineUrl }));
      await persistProfile(inlineUrl);
    } catch (err: any) {
      const msg = err?.message || "Logo upload failed. Please try again.";
      setLogoError(msg);
      setFeedback({ type: "err", text: msg });
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleShowcaseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowcaseError(null);
    setFeedback(null);

    if (photos.length >= PHOTO_GUIDE_SPEC.maxShowcaseCount) {
      const msg = `Showcase supports up to ${PHOTO_GUIDE_SPEC.maxShowcaseCount} featured photos. Remove one to add another.`;
      setShowcaseError(msg);
      setFeedback({ type: "err", text: msg });
      if (showcaseInputRef.current) showcaseInputRef.current.value = "";
      return;
    }

    const check = validatePhotoFileMeta(file, "showcase");
    if (!check.ok) {
      const msg = check.error || "Unsupported showcase photo.";
      setShowcaseError(msg);
      setFeedback({ type: "err", text: msg });
      if (showcaseInputRef.current) showcaseInputRef.current.value = "";
      return;
    }

    setUploadingPhoto(true);
    try {
      const caption =
        photoCaption.trim() || file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");

      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "photo");
      fd.append("label", caption);
      fd.append("notes", photoCaption.trim() || "Showcase photo for Peachy™ & creatives");

      const saveRes = await fetch("/api/brand-vault", {
        method: "POST",
        headers: { "x-peach-role": "business" },
        body: fd,
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData?.id) {
        throw new Error(saveData?.error || "Could not save showcase photo.");
      }

      setPhotos((prev) => [
        {
          id: saveData.id,
          label: caption,
          notes: photoCaption.trim() || "Showcase photo",
          storage_path: saveData.storage_path || "uploaded",
          original_name: file.name,
        },
        ...prev,
      ]);
      setPhotoCaption("");
      setFeedback({ type: "ok", text: "Showcase photo added to your visual studio profile." });
      router.refresh();
    } catch (err: any) {
      const msg = err?.message || "Photo upload failed. Please try again.";
      setShowcaseError(msg);
      setFeedback({ type: "err", text: msg });
    } finally {
      setUploadingPhoto(false);
      if (showcaseInputRef.current) showcaseInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    setDeletingPhotoId(photoId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/brand-vault/${photoId}`, {
        method: "DELETE",
        headers: { "x-peach-role": "business" },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Could not delete photo.");
      }
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setFeedback({ type: "ok", text: "Showcase photo removed." });
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "err", text: err?.message || "Could not delete photo." });
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const combinedNeeds = Array.from(
    new Set([...DAILY_CREATIVE_NEEDS_OPTIONS, ...selectedNeeds])
  );

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-semibold border ${
            feedback.type === "ok"
              ? "bg-white border-[#FF5E3A] text-[#231714]"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
          role="status"
        >
          {feedback.text}
        </div>
      )}

      {/* EYE-CANDY HERO HEADER */}
      <section
        className="rounded-3xl p-6 sm:p-8 text-white shadow-[0_12px_32px_rgba(232,93,59,0.16)]"
        style={{ background: "linear-gradient(135deg, #FF7350 0%, #FFAE78 100%)" }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 flex-1 min-w-0">
            {/* Circular Business Logo / Profile Photo Upload */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative w-24 h-24">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  aria-label="Choose profile photo or business logo"
                  className="w-24 h-24 rounded-full bg-white border-4 border-white/80 shadow-md overflow-hidden flex items-center justify-center text-[#231714] font-extrabold text-3xl cursor-pointer disabled:opacity-70"
                >
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt={form.businessName || "Business Logo"}
                      className="w-full h-full object-contain p-1.5 bg-white"
                    />
                  ) : (
                    <span>{(form.businessName?.[0] || "P").toUpperCase()}</span>
                  )}
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  aria-label="Upload business logo"
                  className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#231714] hover:bg-[#3A2722] text-white border-2 border-white flex items-center justify-center shadow cursor-pointer disabled:opacity-60"
                >
                  <Camera className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="px-3 py-1 rounded-full bg-[#231714] hover:bg-[#3A2722] text-white text-[11px] font-bold cursor-pointer disabled:opacity-60 inline-flex items-center gap-1"
              >
                <Upload className="w-3 h-3" strokeWidth={2} />
                <span>{uploadingLogo ? "Uploading..." : form.logoUrl ? "Change Photo" : "Upload Logo"}</span>
              </button>
              <a
                href="#photo-upload-guide"
                className="text-[11px] font-bold text-white/95 hover:text-white underline underline-offset-2 inline-flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3" strokeWidth={2} />
                <span>PNG/JPG/WEBP/SVG &middot; 15 MB</span>
              </a>
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-xs text-white text-xs font-extrabold tracking-wide">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{cityHub}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#231714]/85 text-white text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFAE78]" strokeWidth={1.75} />
                  <span>Brand Readiness {initialReadiness.score}%</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="Your Business Name"
                  aria-label="Business name"
                  className="bg-white/95 text-[#231714] placeholder:text-[#4A3B36]/60 rounded-2xl px-4 py-2.5 text-lg font-extrabold focus:outline-none border border-white"
                />
                <select
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  aria-label="Business industry"
                  className="bg-white/95 text-[#231714] rounded-2xl px-4 py-2.5 text-sm font-bold focus:outline-none border border-white cursor-pointer"
                >
                  <option value="">Select Industry / Business Type</option>
                  {BUSINESS_INDUSTRY_OPTIONS.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                  {form.industry &&
                    !(BUSINESS_INDUSTRY_OPTIONS as readonly string[]).includes(form.industry) && (
                      <option value={form.industry}>{form.industry}</option>
                    )}
                </select>
              </div>

              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Write a 2-line bio about your business vibe, customers, and aesthetic so Peachy™ & creatives hit the mark..."
                aria-label="Business bio and vibe"
                className="w-full bg-white/95 text-[#231714] placeholder:text-[#4A3B36]/60 rounded-2xl px-4 py-2.5 text-sm font-medium focus:outline-none border border-white resize-none"
              />
            </div>
          </div>

          <div className="flex sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => persistProfile()}
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-[#231714] hover:bg-[#3A2722] text-white text-sm font-extrabold shadow-sm transition-colors cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" strokeWidth={2} />
              <span>{saving ? "Saving Studio..." : "Save Studio Profile"}</span>
            </button>
            <Link
              href="/account?edit=1&tab=sms#sms-settings"
              className="px-4 py-2.5 rounded-2xl bg-white/25 hover:bg-white/35 text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>SMS &amp; Alert Settings</span>
            </Link>
          </div>
        </div>
        {logoError && (
          <div className="mt-4 rounded-2xl bg-white text-red-900 border border-red-200 px-4 py-2.5 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" strokeWidth={2} />
            <span>{logoError}</span>
          </div>
        )}
      </section>

      {/* SECTION 1: DAILY & ONGOING CREATIVE NEEDS */}
      <section className="bg-white border border-[#F7DFD0] rounded-3xl p-6 shadow-[0_12px_32px_rgba(232,93,59,0.08)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF5E3A]">
              Section 1 &middot; Active Creative Goals
            </span>
            <h2 className="text-xl font-extrabold text-[#231714] mt-0.5">
              Daily &amp; Ongoing Creative Needs
            </h2>
            <p className="text-[15px] text-[#4A3B36] mt-0.5">
              Tap what you regularly need designed. Peachy™ automatically uses these to scope faster and suggest ready-to-launch packs.
            </p>
          </div>
          <span className="text-xs font-extrabold text-[#231714] bg-[#FFF6EE] border border-[#F7DFD0] px-3 py-1 rounded-full self-start sm:self-auto tabular-nums">
            {selectedNeeds.length} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {combinedNeeds.map((need) => {
            const active = selectedNeeds.includes(need);
            return (
              <button
                key={need}
                type="button"
                onClick={() => toggleNeed(need)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-colors cursor-pointer inline-flex items-center gap-2 ${
                  active
                    ? "bg-[#FF5E3A] text-white shadow-xs"
                    : "bg-[#FFD8BE] hover:bg-[#FFC7A2] text-[#231714]"
                }`}
              >
                {active && <Check className="w-4 h-4 shrink-0" strokeWidth={2.25} />}
                <span>{need}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <input
            type="text"
            value={customNeed}
            onChange={(e) => setCustomNeed(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomNeed();
              }
            }}
            placeholder="Add another recurring need (e.g. Table Tents, Merchandise Tags)..."
            className="flex-1 bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl px-4 py-2.5 text-sm text-[#231714] placeholder:text-[#4A3B36]/60 focus:outline-none focus:border-[#FF5E3A]"
          />
          <button
            type="button"
            onClick={handleAddCustomNeed}
            className="px-4 py-2.5 rounded-2xl bg-[#231714] hover:bg-[#3A2722] text-white text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Add Need</span>
          </button>
        </div>
      </section>

      {/* SECTION 2: PRODUCT & SPACE SHOWCASE (3-COLUMN PHOTO GRID) */}
      <section className="bg-white border border-[#F7DFD0] rounded-3xl p-6 shadow-[0_12px_32px_rgba(232,93,59,0.08)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF5E3A]">
              Section 2 &middot; Visual Identity
            </span>
            <h2 className="text-xl font-extrabold text-[#231714] mt-0.5">
              Product &amp; Space Showcase
            </h2>
            <p className="text-[15px] text-[#4A3B36] mt-0.5">
              Upload 3–6 photos of your storefront, signature dishes, or products so matched creatives see your real aesthetic right inside every project room.
            </p>
          </div>
          <span className="text-xs font-extrabold text-[#231714] bg-[#FFD8BE] px-3 py-1 rounded-full self-start sm:self-auto tabular-nums">
            {photos.length} / 6 photos
          </span>
        </div>

        {/* Upload Bar */}
        <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={photoCaption}
            onChange={(e) => setPhotoCaption(e.target.value)}
            placeholder="Optional photo label (e.g. Dining Room Interior, Best-Selling Latte)..."
            className="flex-1 bg-white border border-[#F7DFD0] rounded-2xl px-4 py-2.5 text-sm text-[#231714] placeholder:text-[#4A3B36]/60 focus:outline-none focus:border-[#FF5E3A]"
          />
          <input
            ref={showcaseInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleShowcaseUpload}
          />
          <button
            type="button"
            onClick={() => showcaseInputRef.current?.click()}
            disabled={uploadingPhoto || photos.length >= PHOTO_GUIDE_SPEC.maxShowcaseCount}
            className="px-5 py-2.5 rounded-2xl bg-[#FF5E3A] hover:bg-[#E84D2B] disabled:opacity-55 text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Upload className="w-4 h-4" strokeWidth={1.75} />
            <span>{uploadingPhoto ? "Uploading Photo..." : "Add Showcase Photo"}</span>
          </button>
        </div>

        {showcaseError && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" strokeWidth={2} />
            <span>{showcaseError}</span>
          </div>
        )}

        <PhotoUploadGuide defaultOpen={true} variant="full" />

        {/* 3-Column Photo Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => {
              const imgSrc = photo.storage_path
                ? `/api/brand-vault/${photo.id}?inline=1`
                : photo.value || "/brand/business-owner.jpg";

              return (
                <article
                  key={photo.id}
                  className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl overflow-hidden flex flex-col justify-between group"
                >
                  <div className="relative h-48 bg-white overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={photo.label}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={deletingPhotoId === photo.id}
                      aria-label={`Remove ${photo.label}`}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[#231714]/85 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                  </div>
                  <div className="p-3.5">
                    <strong className="text-sm font-extrabold text-[#231714] block truncate">
                      {photo.label}
                    </strong>
                    {photo.notes && (
                      <span className="text-xs text-[#4A3B36] block truncate mt-0.5">
                        {photo.notes}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#FFF6EE] border border-dashed border-[#F7DFD0] rounded-2xl p-8 text-center space-y-2">
            <Camera className="w-8 h-8 text-[#FF5E3A] mx-auto" strokeWidth={1.5} />
            <p className="text-sm font-bold text-[#231714]">
              No showcase photos uploaded yet
            </p>
            <p className="text-xs text-[#4A3B36] max-w-md mx-auto">
              Add photos of your physical space, packaging, or best-sellers so creatives immediately grasp your visual look.
            </p>
          </div>
        )}
      </section>

      {/* SECTION 3: COLLAPSIBLE BUSINESS DETAILS & BRAND VAULT */}
      <section className="bg-white border border-[#F7DFD0] rounded-3xl p-6 shadow-[0_12px_32px_rgba(232,93,59,0.08)]">
        <button
          type="button"
          onClick={() => setDetailsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
        >
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF5E3A]">
              Section 3 &middot; Studio Credentials &amp; Brand Vault
            </span>
            <h2 className="text-xl font-extrabold text-[#231714] mt-0.5">
              Website, Social Handles, City Hub &amp; Brand Readiness ({initialReadiness.score}%)
            </h2>
          </div>
          <span className="w-10 h-10 rounded-2xl bg-[#FFF6EE] border border-[#F7DFD0] flex items-center justify-center text-[#231714] shrink-0">
            <ChevronDown
              className={`w-5 h-5 transition-transform ${detailsOpen ? "rotate-180" : ""}`}
              strokeWidth={1.75}
            />
          </span>
        </button>

        {detailsOpen && (
          <div className="pt-5 mt-5 border-t border-[#F7DFD0] space-y-6">
            {/* Brand Readiness Strip */}
            <div className="bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <strong className="font-extrabold text-[#231714] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#FF5E3A]" strokeWidth={1.75} />
                    <span>Brand Readiness Meter</span>
                  </strong>
                  <strong className="font-extrabold text-[#FF5E3A] tabular-nums">
                    {initialReadiness.score}% ({brandAssetCount} Brand Vault assets)
                  </strong>
                </div>
                <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#F7DFD0]">
                  <div
                    className="h-full bg-[#FF5E3A] rounded-full transition-all"
                    style={{ width: `${initialReadiness.score}%` }}
                  />
                </div>
                <p className="text-xs text-[#4A3B36]">
                  {initialReadiness.missingLabels.length > 0
                    ? `Missing essentials: ${initialReadiness.missingLabels.join(", ")}`
                    : "All core Brand Vault essentials complete — ready for seamless creative handoffs."}
                </p>
              </div>
              <Link
                href="/business/vault"
                className="px-4 py-2.5 rounded-2xl bg-[#231714] hover:bg-[#3A2722] text-white text-xs font-bold shrink-0 text-center"
              >
                Open Brand Vault ({brandAssetCount})
              </Link>
            </div>

            {/* Website & Social Handles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1.5 block">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#4A3B36] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#FF5E3A]" strokeWidth={1.75} />
                  <span>Website URL</span>
                </span>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://yourbusiness.com"
                  className="w-full bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl px-4 py-2.5 text-sm text-[#231714] focus:outline-none focus:border-[#FF5E3A]"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#4A3B36]">
                  Instagram Handle
                </span>
                <input
                  type="text"
                  value={socials.instagram || ""}
                  onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                  placeholder="@yourbusiness"
                  className="w-full bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl px-4 py-2.5 text-sm text-[#231714] focus:outline-none focus:border-[#FF5E3A]"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#4A3B36]">
                  TikTok Handle
                </span>
                <input
                  type="text"
                  value={socials.tiktok || ""}
                  onChange={(e) => setSocials({ ...socials, tiktok: e.target.value })}
                  placeholder="@yourbusiness"
                  className="w-full bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl px-4 py-2.5 text-sm text-[#231714] focus:outline-none focus:border-[#FF5E3A]"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#4A3B36]">
                  Facebook / Other Social
                </span>
                <input
                  type="text"
                  value={socials.facebook || ""}
                  onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
                  placeholder="facebook.com/yourbusiness"
                  className="w-full bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl px-4 py-2.5 text-sm text-[#231714] focus:outline-none focus:border-[#FF5E3A]"
                />
              </label>
            </div>

            {/* City Hub & Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="space-y-1.5 block md:col-span-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#4A3B36]">
                  Street Address
                </span>
                <input
                  type="text"
                  value={form.addressLine1}
                  onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                  placeholder="123 Main St"
                  className="w-full bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl px-4 py-2.5 text-sm text-[#231714] focus:outline-none focus:border-[#FF5E3A]"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#4A3B36]">
                  ZIP Code
                </span>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  placeholder="35203"
                  className="w-full bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl px-4 py-2.5 text-sm text-[#231714] focus:outline-none focus:border-[#FF5E3A]"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#4A3B36]">
                  City (Auto-assigns {cityHub})
                </span>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Birmingham"
                  className="w-full bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl px-4 py-2.5 text-sm text-[#231714] focus:outline-none focus:border-[#FF5E3A]"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#4A3B36]">
                  State
                </span>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="AL"
                  maxLength={20}
                  className="w-full bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl px-4 py-2.5 text-sm text-[#231714] focus:outline-none focus:border-[#FF5E3A]"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#4A3B36]">
                  Business Owner Name
                </span>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Your full name"
                  className="w-full bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl px-4 py-2.5 text-sm text-[#231714] focus:outline-none focus:border-[#FF5E3A]"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1.5 block">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#4A3B36]">
                  Business Phone
                </span>
                <input
                  type="tel"
                  value={form.businessPhone}
                  onChange={(e) => setForm({ ...form, businessPhone: e.target.value })}
                  placeholder="(205) 555-0199"
                  className="w-full bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl px-4 py-2.5 text-sm text-[#231714] focus:outline-none focus:border-[#FF5E3A]"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#4A3B36]">
                  Preferred Contact Method
                </span>
                <select
                  value={form.preferredContact}
                  onChange={(e) => setForm({ ...form, preferredContact: e.target.value })}
                  className="w-full bg-[#FFF6EE] border border-[#F7DFD0] rounded-2xl px-4 py-2.5 text-sm text-[#231714] focus:outline-none focus:border-[#FF5E3A] cursor-pointer"
                >
                  <option value="">Select preference</option>
                  <option value="Peach Room Chat + SMS">Peach Room Chat + SMS</option>
                  <option value="Email">Email</option>
                  <option value="Phone / Text">Phone / Text</option>
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F7DFD0]">
              <Link
                href="/account?edit=1&tab=sms#sms-settings"
                className="text-sm font-bold text-[#FF5E3A] hover:text-[#231714] inline-flex items-center gap-1.5"
              >
                <Bell className="w-4 h-4" strokeWidth={1.75} />
                <span>Manage SMS &amp; Notification Alerts</span>
              </Link>

              <button
                type="button"
                onClick={() => persistProfile()}
                disabled={saving}
                className="px-6 py-2.5 rounded-2xl bg-[#FF5E3A] hover:bg-[#E84D2B] text-white text-sm font-bold cursor-pointer disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save All Details"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
