"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Award,
  Bell,
  Briefcase,
  Coins,
  Compass,
  FolderKanban,
  Globe,
  Home,
  Layers,
  Menu,
  MessageSquare,
  Sparkles,
  User,
  Wallet,
  X,
} from "lucide-react";
import { LogoutButton } from "./logout-button";

interface NavItem {
  key: string;
  href: string;
  label: string;
}

interface PeachMobileDrawerProps {
  role: "business" | "creative";
  active: string;
  navItems: readonly NavItem[];
  displayOrgName: string;
  subtitle: string;
}

function renderDrawerIcon(key: string) {
  const cls = "w-4 h-4 shrink-0";
  switch (key) {
    case "home":
      return <Home className={cls} strokeWidth={1.5} />;
    case "peach_business":
      return <Briefcase className={cls} strokeWidth={1.5} />;
    case "projects":
      return <FolderKanban className={cls} strokeWidth={1.5} />;
    case "messages":
      return <MessageSquare className={cls} strokeWidth={1.5} />;
    case "vault":
      return <Layers className={cls} strokeWidth={1.5} />;
    case "wallet":
      return <Wallet className={cls} strokeWidth={1.5} />;
    case "studio_ai":
      return <Sparkles className={cls} strokeWidth={1.5} />;
    case "opportunities":
      return <Compass className={cls} strokeWidth={1.5} />;
    case "academy":
      return <Award className={cls} strokeWidth={1.5} />;
    case "social":
      return <Globe className={cls} strokeWidth={1.5} />;
    case "earnings":
      return <Coins className={cls} strokeWidth={1.5} />;
    case "notifications":
      return <Bell className={cls} strokeWidth={1.5} />;
    default:
      return <User className={cls} strokeWidth={1.5} />;
  }
}

export function PeachMobileDrawer({
  role,
  active,
  navItems,
  displayOrgName,
  subtitle,
}: PeachMobileDrawerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const drawerOverlay =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] h-dvh overflow-y-auto bg-[#231714]/60 backdrop-blur-xs flex"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <aside
              className="w-72 max-w-[85vw] h-dvh overflow-y-auto bg-[#FFF6EE] text-[#231714] border-r border-[#F7DFD0] p-5 flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#F7DFD0] shrink-0">
                <Link
                  href={role === "business" ? "/business" : "/creative"}
                  onClick={() => setOpen(false)}
                  className="block"
                  aria-label="Peach Network home"
                >
                  <img
                    src="/brand/peach-wordmark.png"
                    alt="Peach Network"
                    className="h-8 w-auto object-contain"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-9 h-9 rounded-xl bg-white hover:bg-[#FFD8BE] text-[#231714] border border-[#F7DFD0] flex items-center justify-center cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              <div className="mt-4 mb-2 px-1 text-[11px] font-extrabold tracking-widest uppercase text-[#FF5E3A]">
                {role === "business" ? "Peach Studio" : "Creative Studio"}
              </div>

              <nav className="grid gap-1.5 flex-1 content-start" aria-label="Drawer navigation">
                {navItems.map((item) => {
                  const isActive = active === item.key;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm transition-colors ${
                        isActive
                          ? "bg-white text-[#231714] font-extrabold border border-[#F7DFD0] shadow-[0_6px_18px_rgba(232,93,59,0.08)]"
                          : "bg-transparent hover:bg-white/80 text-[#4A3B36] font-semibold"
                      }`}
                    >
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#FF5E3A]"
                        />
                      )}
                      <span className={isActive ? "text-[#FF5E3A]" : "text-[#4A3B36]"}>
                        {renderDrawerIcon(item.key)}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 pt-4 border-t border-[#F7DFD0] space-y-3 shrink-0">
                <Link
                  href="/account?edit=1"
                  onClick={() => setOpen(false)}
                  className="block p-3.5 rounded-2xl bg-white border border-[#F7DFD0] hover:border-[#FF5E3A] transition-colors"
                >
                  <strong className="block text-sm font-extrabold text-[#231714] truncate">
                    {displayOrgName}
                  </strong>
                  <span className="block text-xs text-[#4A3B36] truncate">{subtitle}</span>
                </Link>

                <LogoutButton
                  label="Log out"
                  className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-[#FFD8BE] border border-[#F7DFD0] text-[#FF5E3A] text-sm font-extrabold text-left cursor-pointer transition-colors"
                />
              </div>
            </aside>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#FFD8BE] text-[#231714] border border-[#F7DFD0] text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap shrink-0 transition-colors"
      >
        <Menu className="w-4 h-4 shrink-0" strokeWidth={1.5} />
        <span>Menu</span>
      </button>
      {drawerOverlay}
    </>
  );
}
