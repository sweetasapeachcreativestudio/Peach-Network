"use client";

import React, { useState } from "react";

interface BannerManagerClientProps {
  initialBanners: any[];
  initialEvents: any[];
}

export function BannerManagerClient({
  initialBanners,
  initialEvents,
}: BannerManagerClientProps) {
  const [banners, setBanners] = useState<any[]>(initialBanners);
  const [events, setEvents] = useState<any[]>(initialEvents);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Banner form
  const [bTitle, setBTitle] = useState("");
  const [bSubtitle, setBSubtitle] = useState("");
  const [bDesktopUrl, setBDesktopUrl] = useState("");
  const [bMobileUrl, setBMobileUrl] = useState("");
  const [bCtaLabel, setBCtaLabel] = useState("Learn More");
  const [bCtaHref, setBCtaHref] = useState("/business/peach-business");

  // Event / Special form
  const [eBadge, setEBadge] = useState("Upcoming Event");
  const [eTitle, setETitle] = useState("");
  const [eSubtitle, setESubtitle] = useState("");
  const [eLocation, setELocation] = useState("");
  const [eDate, setEDate] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [eCtaLabel, setECtaLabel] = useState("View Details");
  const [eCtaHref, setECtaHref] = useState("/business/peach-business");

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setStatusMsg("");
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "banner",
          title: bTitle,
          subtitle: bSubtitle,
          desktopImageUrl: bDesktopUrl,
          mobileImageUrl: bMobileUrl || bDesktopUrl,
          ctaLabel: bCtaLabel,
          ctaHref: bCtaHref,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create banner");
      setBanners((prev) => [data.banner, ...prev]);
      setBTitle("");
      setBSubtitle("");
      setBDesktopUrl("");
      setBMobileUrl("");
      setStatusMsg("Custom banner added to the /business carousel.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save banner.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setStatusMsg("");
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "event",
          badge: eBadge,
          title: eTitle,
          subtitle: eSubtitle,
          location: eLocation,
          eventDate: eDate || null,
          description: eDescription,
          ctaLabel: eCtaLabel,
          ctaHref: eCtaHref,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not publish event");
      setEvents((prev) => [data.event, ...prev]);
      setETitle("");
      setESubtitle("");
      setELocation("");
      setEDate("");
      setEDescription("");
      setStatusMsg("Event / special published for Peach Business & /business carousel.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save event.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (kind: "banner" | "event", id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id, isActive: !currentActive }),
      });
      if (!res.ok) return;
      if (kind === "banner") {
        setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, is_active: !currentActive } : b)));
      } else {
        setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, is_active: !currentActive } : ev)));
      }
    } catch {}
  };

  const handleDelete = async (kind: "banner" | "event", id: string) => {
    try {
      const res = await fetch("/api/admin/banners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id }),
      });
      if (!res.ok) return;
      if (kind === "banner") {
        setBanners((prev) => prev.filter((b) => b.id !== id));
      } else {
        setEvents((prev) => prev.filter((ev) => ev.id !== id));
      }
    } catch {}
  };

  return (
    <div className="space-y-8">
      {statusMsg && (
        <div className="p-4 rounded-xl bg-white border border-[#17251E] text-sm font-bold text-[#17251E]">
          {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-sm font-bold text-rose-900">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form 1: Custom Image Banner */}
        <form
          onSubmit={handleCreateBanner}
          className="bg-white border border-[#D6CFC7] rounded-2xl p-6 space-y-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-[#17251E]">
                Add Custom Image Banner
              </h2>
              <p className="text-sm text-[#3C4A42]">
                Recommended dimensions: 1600×460 px (Desktop) and 1080×560 px (Mobile).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setBTitle("Welcome to the Beta Test, Business Owners!");
                setBSubtitle(
                  "Check out the Peach Business section to submit feedback on anything broken or share your suggestions."
                );
                setBDesktopUrl("/assets/aistudio/Code_Generated_Image_e26f9006.png");
                setBMobileUrl("/assets/aistudio/Code_Generated_Image_e26f9006.png");
                setBCtaLabel("Go to Peach Business");
                setBCtaHref("/business/peach-business#feedback");
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF8F3] border border-[#D6CFC7] text-[#17251E] text-xs font-extrabold cursor-pointer"
            >
              Load Beta Test Banner
            </button>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-[#17251E]">
              Banner Title
              <input
                type="text"
                required
                value={bTitle}
                onChange={(e) => setBTitle(e.target.value)}
                placeholder="e.g. Summer Brand & Packaging Launch"
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC7] bg-white text-sm text-[#17251E]"
              />
            </label>

            <label className="block text-sm font-bold text-[#17251E]">
              Subtitle (Optional)
              <input
                type="text"
                value={bSubtitle}
                onChange={(e) => setBSubtitle(e.target.value)}
                placeholder="Short supporting line"
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC7] bg-white text-sm text-[#17251E]"
              />
            </label>

            <label className="block text-sm font-bold text-[#17251E]">
              Desktop Image URL (1600×460)
              <input
                type="text"
                required
                value={bDesktopUrl}
                onChange={(e) => setBDesktopUrl(e.target.value)}
                placeholder="/images/banner-desktop.jpg"
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC7] bg-white text-sm text-[#17251E]"
              />
            </label>

            <label className="block text-sm font-bold text-[#17251E]">
              Mobile Image URL (1080×560)
              <input
                type="text"
                value={bMobileUrl}
                onChange={(e) => setBMobileUrl(e.target.value)}
                placeholder="/images/banner-mobile.jpg (optional)"
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC7] bg-white text-sm text-[#17251E]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-bold text-[#17251E]">
                CTA Label
                <input
                  type="text"
                  value={bCtaLabel}
                  onChange={(e) => setBCtaLabel(e.target.value)}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC7] bg-white text-sm text-[#17251E]"
                />
              </label>
              <label className="block text-sm font-bold text-[#17251E]">
                CTA Link
                <input
                  type="text"
                  value={bCtaHref}
                  onChange={(e) => setBCtaHref(e.target.value)}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC7] bg-white text-sm text-[#17251E]"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-[#17251E] hover:bg-[#23392E] text-white text-sm font-bold cursor-pointer disabled:bg-[#E7E2DC] disabled:text-[#17251E] disabled:cursor-not-allowed"
          >
            Publish Custom Banner
          </button>
        </form>

        {/* Form 2: Peach Business Event or Special */}
        <form
          onSubmit={handleCreateEvent}
          className="bg-white border border-[#D6CFC7] rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-extrabold text-[#17251E]">
            Post Peach Business Event / Special
          </h2>
          <p className="text-sm text-[#3C4A42]">
            Past events are automatically hidden from the /business carousel once their event date passes.
          </p>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-bold text-[#17251E]">
                Type Badge
                <select
                  value={eBadge}
                  onChange={(e) => setEBadge(e.target.value)}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC7] bg-white text-sm text-[#17251E]"
                >
                  <option value="Upcoming Event">Upcoming Event</option>
                  <option value="Partner Special">Partner Special</option>
                  <option value="Coin Bonus">Coin Bonus</option>
                </select>
              </label>
              <label className="block text-sm font-bold text-[#17251E]">
                Event Date (Optional)
                <input
                  type="datetime-local"
                  value={eDate}
                  onChange={(e) => setEDate(e.target.value)}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC7] bg-white text-sm text-[#17251E]"
                />
              </label>
            </div>

            <label className="block text-sm font-bold text-[#17251E]">
              Title
              <input
                type="text"
                required
                value={eTitle}
                onChange={(e) => setETitle(e.target.value)}
                placeholder="e.g. Birmingham Brand & Dining Mixer"
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC7] bg-white text-sm text-[#17251E]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-bold text-[#17251E]">
                Location
                <input
                  type="text"
                  value={eLocation}
                  onChange={(e) => setELocation(e.target.value)}
                  placeholder="Birmingham, AL"
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC7] bg-white text-sm text-[#17251E]"
                />
              </label>
              <label className="block text-sm font-bold text-[#17251E]">
                Subtitle (Optional)
                <input
                  type="text"
                  value={eSubtitle}
                  onChange={(e) => setESubtitle(e.target.value)}
                  placeholder="Free for Peach Partners"
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC7] bg-white text-sm text-[#17251E]"
                />
              </label>
            </div>

            <label className="block text-sm font-bold text-[#17251E]">
              Description
              <textarea
                rows={2}
                required
                value={eDescription}
                onChange={(e) => setEDescription(e.target.value)}
                placeholder="Plain-English summary for business owners..."
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC7] bg-white text-sm text-[#17251E]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-bold text-[#17251E]">
                Button Label
                <input
                  type="text"
                  value={eCtaLabel}
                  onChange={(e) => setECtaLabel(e.target.value)}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC7] bg-white text-sm text-[#17251E]"
                />
              </label>
              <label className="block text-sm font-bold text-[#17251E]">
                Button Link
                <input
                  type="text"
                  value={eCtaHref}
                  onChange={(e) => setECtaHref(e.target.value)}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D6CFC7] bg-white text-sm text-[#17251E]"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-[#D9532F] hover:bg-[#B84323] text-white text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            Publish Event / Special
          </button>
        </form>
      </div>

      {/* Existing Banners List */}
      <section className="bg-white border border-[#D6CFC7] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-extrabold text-[#17251E]">
          Custom Image Banners ({banners.length})
        </h2>
        {banners.length === 0 ? (
          <p className="text-sm text-[#3C4A42]">
            No custom image banners uploaded yet. Active Peach Business events and specials appear automatically in the /business carousel.
          </p>
        ) : (
          <div className="space-y-3">
            {banners.map((b) => (
              <div
                key={b.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#D6CFC7] bg-[#FFF8F3]"
              >
                <div className="min-w-0">
                  <strong className="text-base font-bold text-[#17251E] block truncate">
                    {b.title}
                  </strong>
                  <p className="text-sm text-[#3C4A42] truncate">
                    Desktop: {b.desktop_image_url}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggle("banner", b.id, b.is_active)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#D6CFC7] text-[#17251E] text-sm font-bold cursor-pointer"
                  >
                    {b.is_active ? "Pause" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete("banner", b.id)}
                    className="px-3.5 py-2 rounded-xl bg-[#17251E] text-white text-sm font-bold cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Existing Events List */}
      <section className="bg-white border border-[#D6CFC7] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-extrabold text-[#17251E]">
          Peach Business Events &amp; Specials ({events.length})
        </h2>
        {events.length === 0 ? (
          <p className="text-sm text-[#3C4A42]">No custom events posted yet.</p>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#D6CFC7] bg-[#FFF8F3]"
              >
                <div className="min-w-0">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#D9532F]">
                    {ev.badge}
                  </span>
                  <strong className="text-base font-bold text-[#17251E] block">
                    {ev.title}
                  </strong>
                  <p className="text-sm text-[#3C4A42]">
                    {ev.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggle("event", ev.id, ev.is_active)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#D6CFC7] text-[#17251E] text-sm font-bold cursor-pointer"
                  >
                    {ev.is_active ? "Pause" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete("event", ev.id)}
                    className="px-3.5 py-2 rounded-xl bg-[#17251E] text-white text-sm font-bold cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
