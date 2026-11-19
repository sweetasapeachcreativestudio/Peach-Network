"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface PhoneAlertsBannerProps {
  role?: "business" | "creative" | "admin";
}

export function PhoneAlertsBanner({ role = "business" }: PhoneAlertsBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [enabledNow, setEnabledNow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("peach_dismiss_alerts_banner");
      if (dismissed === "1") return;

      if ("Notification" in window) {
        if (Notification.permission !== "granted") {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("peach_dismiss_alerts_banner", "1");
    }
  };

  const handleEnableQuickPush = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setEnabledNow(true);
        try {
          new Notification("Peach Alerts Enabled", {
            body: "You will now receive alerts for project messages and proofs.",
          });
        } catch {}
        await fetch("/api/notifications/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ push_enabled: true }),
        });
        setTimeout(() => setIsVisible(false), 2500);
      }
    } catch {}
  };

  if (!isVisible) return null;

  return (
    <div className="bg-[#17251E] text-white px-4 py-3 sm:py-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border border-[#17251E]">
      <div className="flex items-start justify-between gap-2 min-w-0 flex-1">
        <p className="text-sm font-medium text-white leading-snug">
          {enabledNow
            ? "Alerts active! You will receive instant proof and message notifications."
            : "Never miss a message or proof — enable instant browser and SMS alerts."}
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="sm:hidden text-white hover:text-[#FFF8F3] p-1 rounded-lg transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss alert notice"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {!enabledNow && (
          <>
            <button
              type="button"
              onClick={handleEnableQuickPush}
              className="px-3.5 py-1.5 bg-[#D9532F] hover:bg-[#B84323] text-white font-bold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer"
            >
              Turn On Alerts
            </button>
            <Link
              href={role === "creative" ? "/account?edit=1&tab=sms#sms-settings" : "/account?edit=1&tab=sms#sms-settings"}
              className="px-3.5 py-1.5 bg-white hover:bg-[#FFF8F3] text-[#17251E] border border-[#D6CFC7] font-bold text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap"
            >
              SMS Settings
            </Link>
          </>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          className="hidden sm:inline-flex text-white hover:text-[#FFF8F3] p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Dismiss alert notice"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
