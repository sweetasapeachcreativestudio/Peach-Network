"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCircle2, MessageSquare, Smartphone } from "lucide-react";

interface PhoneAlertsCardProps {
  initialPhone?: string;
  role?: "business" | "creative" | "admin";
  onSaved?: () => void;
}

type SmsSchedule = "instant" | "business_hours" | "urgent_only";

const SCHEDULE_OPTIONS: Array<{
  id: SmsSchedule;
  title: string;
  subtitle: string;
}> = [
  {
    id: "instant",
    title: "Instant Alerts",
    subtitle: "Text immediately when messages or proofs arrive",
  },
  {
    id: "business_hours",
    title: "Business Hours (8 AM–8 PM)",
    subtitle: "Hold overnight messages until morning",
  },
  {
    id: "urgent_only",
    title: "Urgent Proofs Only",
    subtitle: "Text only when deliverables or sign-offs need you",
  },
];

export function PhoneAlertsCard({
  initialPhone = "",
  role = "business",
  onSaved,
}: PhoneAlertsCardProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [smsSchedule, setSmsSchedule] = useState<SmsSchedule>("instant");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyProofs, setNotifyProofs] = useState(true);
  const [notifyOffers, setNotifyOffers] = useState(true);
  const [notifyAddons, setNotifyAddons] = useState(true);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [testPushMsg, setTestPushMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushPermission(Notification.permission);
      setPushEnabled(Notification.permission === "granted");
    }
  }, []);

  useEffect(() => {
    async function loadPrefs() {
      try {
        const res = await fetch("/api/notifications/preferences");
        const data = await res.json();
        if (res.ok && data.preferences) {
          const p = data.preferences;
          if (p.phone) setPhone(p.phone);
          if (p.sms_enabled !== undefined) setSmsEnabled(Boolean(p.sms_enabled));
          if (
            p.sms_schedule === "instant" ||
            p.sms_schedule === "business_hours" ||
            p.sms_schedule === "urgent_only"
          ) {
            setSmsSchedule(p.sms_schedule);
          }
          if (
            p.push_enabled !== undefined &&
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            setPushEnabled(Boolean(p.push_enabled));
          }
          if (p.notify_messages !== undefined) setNotifyMessages(Boolean(p.notify_messages));
          if (p.notify_proofs !== undefined) setNotifyProofs(Boolean(p.notify_proofs));
          if (p.notify_offers !== undefined) setNotifyOffers(Boolean(p.notify_offers));
          if (p.notify_addons !== undefined) setNotifyAddons(Boolean(p.notify_addons));
        }
      } catch {
        // Keep defaults
      }
    }
    loadPrefs();
  }, []);

  const handleEnablePush = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setTestPushMsg("Browser push notifications are not supported in this browser.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === "granted") {
        setPushEnabled(true);
        setTestPushMsg(
          "Browser push notifications enabled. You will now receive instant desktop and mobile alerts."
        );

        try {
          new Notification("Peach Network Alerts Active", {
            body: "You are all set to receive instant alerts for new chat messages and project proofs.",
            icon: "/icons/icon-192x192.png",
          });
        } catch {
          // Ignore constructor issues inside restricted iframes
        }

        await fetch("/api/notifications/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            sms_enabled: smsEnabled,
            sms_schedule: smsSchedule,
            push_enabled: true,
            notify_messages: notifyMessages,
            notify_proofs: notifyProofs,
            notify_offers: notifyOffers,
            notify_addons: notifyAddons,
          }),
        });
      } else if (permission === "denied") {
        setTestPushMsg(
          "Notifications were blocked by your browser. Click the site settings icon in your address bar to allow alerts."
        );
      }
    } catch {
      setTestPushMsg("Could not request notification permission in this browser.");
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setTestPushMsg("");

    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          sms_enabled: smsEnabled,
          sms_schedule: smsSchedule,
          push_enabled: pushEnabled && pushPermission === "granted",
          notify_messages: notifyMessages,
          notify_proofs: notifyProofs,
          notify_offers: notifyOffers,
          notify_addons: notifyAddons,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save preferences.");

      setMsg("SMS and alert preferences saved.");
      onSaved?.();
    } catch (err: any) {
      setMsg(err.message || "Could not save preferences.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      id="sms-settings"
      aria-labelledby="sms-settings-heading"
      className="bg-white border border-[#D6CFC7] rounded-3xl p-6 sm:p-7 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D6CFC7]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-white bg-[#17251E] px-3 py-1 rounded-full">
              <Smartphone className="w-3.5 h-3.5" />
              SMS Settings Menu
            </span>
            <span className="text-xs font-bold text-[#17251E] bg-[#FFF8F3] border border-[#D6CFC7] px-3 py-1 rounded-full">
              {smsEnabled ? "SMS Alerts Enabled" : "SMS Alerts Paused"}
            </span>
          </div>
          <h2 id="sms-settings-heading" className="text-xl sm:text-2xl font-extrabold text-[#17251E] pt-1">
            SMS &amp; Notification Settings
          </h2>
          <p className="text-sm text-[#3C4A42]">
            {role === "creative"
              ? "Choose how and when Peach texts you about new creative matches, messages, and proof feedback."
              : "Choose how and when Peach texts you about creative messages, uploaded proofs, and project approvals."}
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 bg-[#FFF8F3] border border-[#17251E] rounded-xl text-sm font-bold text-[#17251E] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#17251E] shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {testPushMsg && (
        <div className="p-3.5 bg-[#FFF8F3] border border-[#D9532F] rounded-xl text-sm font-bold text-[#17251E]">
          {testPushMsg}
        </div>
      )}

      {/* 1. SMS SETTINGS MENU FORM */}
      <form onSubmit={handleSavePreferences} className="space-y-5">
        {/* Master SMS Status Toggle Menu */}
        <div className="p-4 bg-[#FFF8F3] border border-[#D6CFC7] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#D9532F]" />
              <strong className="text-sm font-extrabold text-[#17251E]">
                SMS Text Message Alerts
              </strong>
            </div>
            <p className="text-xs sm:text-sm text-[#3C4A42]">
              Receive direct text alerts when a creative uploads proofs or sends a project message.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-[#D6CFC7] bg-white p-1 shrink-0">
            <button
              type="button"
              onClick={() => setSmsEnabled(true)}
              className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                smsEnabled
                  ? "bg-[#17251E] text-white"
                  : "bg-white text-[#17251E] hover:bg-[#FFF8F3]"
              }`}
            >
              Enabled
            </button>
            <button
              type="button"
              onClick={() => setSmsEnabled(false)}
              className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                !smsEnabled
                  ? "bg-[#17251E] text-white"
                  : "bg-white text-[#17251E] hover:bg-[#FFF8F3]"
              }`}
            >
              Paused
            </button>
          </div>
        </div>

        {/* Mobile Phone Number */}
        <div className="space-y-1.5">
          <label
            htmlFor="sms-phone-input"
            className="text-xs font-extrabold uppercase text-[#17251E] tracking-wider block"
          >
            Mobile Phone Number for SMS
          </label>
          <div className="relative">
            <input
              id="sms-phone-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(205) 555-0199"
              className="w-full px-4 py-3 text-sm bg-white text-[#17251E] border border-[#D6CFC7] rounded-xl focus:outline-none focus:border-[#17251E] font-mono"
            />
            <span className="absolute right-3.5 top-3 text-xs text-[#3C4A42] font-bold">
              US / Canada
            </span>
          </div>
          <p className="text-xs text-[#3C4A42]">
            We only text you for project actions that need your review. Standard carrier rates may apply.
          </p>
        </div>

        {/* SMS Delivery Schedule Menu */}
        <div className="space-y-2">
          <strong className="text-xs font-extrabold uppercase text-[#17251E] tracking-wider block">
            SMS Delivery Schedule
          </strong>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {SCHEDULE_OPTIONS.map((option) => {
              const selected = smsSchedule === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSmsSchedule(option.id)}
                  className={`text-left p-3.5 rounded-2xl border transition-colors cursor-pointer ${
                    selected
                      ? "bg-[#17251E] border-[#17251E] text-white"
                      : "bg-white hover:bg-[#FFF8F3] border-[#D6CFC7] text-[#17251E]"
                  }`}
                >
                  <span className="block text-sm font-extrabold">
                    {selected ? "✓ " : ""}
                    {option.title}
                  </span>
                  <span
                    className={`block text-xs mt-1 ${
                      selected ? "text-[#DCE7E1]" : "text-[#3C4A42]"
                    }`}
                  >
                    {option.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alert Categories Menu */}
        <div className="space-y-2 pt-1">
          <strong className="text-xs font-extrabold text-[#17251E] uppercase tracking-wider block">
            Alert Categories (SMS &amp; Push)
          </strong>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
            <label className="flex items-center gap-3 p-3 bg-[#FFF8F3] rounded-xl border border-[#D6CFC7] cursor-pointer hover:border-[#17251E]">
              <input
                type="checkbox"
                checked={notifyMessages}
                onChange={(e) => setNotifyMessages(e.target.checked)}
                className="w-4 h-4 accent-[#17251E] rounded"
              />
              <span className="font-bold text-[#17251E]">New Chat Messages</span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#FFF8F3] rounded-xl border border-[#D6CFC7] cursor-pointer hover:border-[#17251E]">
              <input
                type="checkbox"
                checked={notifyProofs}
                onChange={(e) => setNotifyProofs(e.target.checked)}
                className="w-4 h-4 accent-[#17251E] rounded"
              />
              <span className="font-bold text-[#17251E]">Proofs &amp; Revision Reviews</span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#FFF8F3] rounded-xl border border-[#D6CFC7] cursor-pointer hover:border-[#17251E]">
              <input
                type="checkbox"
                checked={notifyOffers}
                onChange={(e) => setNotifyOffers(e.target.checked)}
                className="w-4 h-4 accent-[#17251E] rounded"
              />
              <span className="font-bold text-[#17251E]">Peach Matches &amp; Scoped Offers</span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#FFF8F3] rounded-xl border border-[#D6CFC7] cursor-pointer hover:border-[#17251E]">
              <input
                type="checkbox"
                checked={notifyAddons}
                onChange={(e) => setNotifyAddons(e.target.checked)}
                className="w-4 h-4 accent-[#17251E] rounded"
              />
              <span className="font-bold text-[#17251E]">Mid-Project Add-Ons &amp; Approvals</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-1 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-extrabold transition-colors ${
              busy
                ? "bg-[#E7E2DC] text-[#17251E] border border-[#D6CFC7] cursor-not-allowed"
                : "bg-[#17251E] hover:bg-[#23392E] text-white cursor-pointer"
            }`}
          >
            {busy ? "Saving SMS Settings..." : "Save SMS & Alert Settings"}
          </button>
        </div>
      </form>

      {/* 2. BROWSER / MOBILE WEB PUSH NOTIFICATIONS */}
      <div className="p-4 sm:p-5 bg-[#FFF8F3] border border-[#D6CFC7] rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#D9532F]" />
              <strong className="text-sm font-extrabold text-[#17251E]">
                Browser &amp; Mobile Push Alerts
              </strong>
            </div>
            <p className="text-xs sm:text-sm text-[#3C4A42] leading-relaxed">
              Get instant notification banners on your phone or computer when a message arrives or a proof is uploaded.
            </p>
          </div>

          <div className="shrink-0">
            {pushPermission === "granted" && pushEnabled ? (
              <span className="inline-flex items-center px-3.5 py-2 bg-[#17251E] text-white font-extrabold text-xs rounded-xl">
                Push Active
              </span>
            ) : (
              <button
                type="button"
                onClick={handleEnablePush}
                className="px-4 py-2.5 bg-[#D9532F] hover:bg-[#B84323] text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
              >
                Enable Push Alerts
              </button>
            )}
          </div>
        </div>

        {pushPermission === "denied" && (
          <div className="text-xs text-[#17251E] bg-white p-3 rounded-xl border border-[#D9532F] font-semibold">
            Notifications are currently blocked by your browser. Allow notifications in your site settings to receive browser push alerts.
          </div>
        )}
      </div>
    </section>
  );
}
