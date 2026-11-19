import type { ReactNode } from "react";
import Link from "next/link";
import { BellIcon, FolderIcon, HomeIcon, MessageIcon, UserIcon, WalletIcon } from "./icons";
import { PeachBrand } from "./brand";
import { AskArtDirectorButton } from "./ask-art-director-modal";
import { PeachMobileDrawer } from "./peach-mobile-drawer";
import { LogoutButton } from "./logout-button";

const businessNavItems = [
  { key: "home", href: "/business", label: "Peach Home" },
  { key: "peach_business", href: "/business/peach-business", label: "Peach Business" },
  { key: "projects", href: "/business/projects", label: "Projects" },
  { key: "messages", href: "/business/messages", label: "Messages" },
  { key: "vault", href: "/business/vault", label: "Brand Vault" },
  { key: "wallet", href: "/business/wallet", label: "Wallet & Billing" },
  { key: "notifications", href: "/notifications#sms-settings", label: "Alerts & SMS" },
  { key: "account", href: "/account?edit=1", label: "Account" },
];

const creativeNavItems = [
  { key: "home", href: "/creative", label: "Peach Hub" },
  { key: "studio_ai", href: "/creative/studio-ai", label: "Creative Director AI" },
  { key: "opportunities", href: "/creative/offers", label: "Opportunities" },
  { key: "projects", href: "/creative/projects", label: "Projects" },
  { key: "messages", href: "/creative/messages", label: "Messages" },
  { key: "portfolio", href: "/account?edit=1", label: "Profile & Portfolio" },
  { key: "academy", href: "/creative/academy", label: "Academy & Resources" },
  { key: "social", href: "/network", label: "Peach Social" },
  { key: "earnings", href: "/creative/payouts", label: "Earnings & Payouts" },
  { key: "notifications", href: "/notifications#sms-settings", label: "Alerts & SMS" },
  { key: "account", href: "/account?edit=1", label: "Account" },
];

export function AppHeader({ name, role, coinCount }: { name?: string | null; role: "business" | "creative"; coinCount?: number | null }) {
  const displayName = name?.trim() || (role === "business" ? "Business Partner" : "Peach Creative");
  return (
    <header className="app-header flex-wrap">
      <div className="flex items-center gap-2.5">
        <div className="lg:hidden">
          <PeachMobileDrawer
            role={role}
            active="home"
            navItems={role === "business" ? businessNavItems : creativeNavItems}
            displayOrgName={displayName}
            subtitle={role === "business" ? "Business profile" : "Peach creative"}
          />
        </div>
        <PeachBrand href={role === "business" ? "/business" : "/creative"} />
      </div>
      <div className="app-header-actions flex-wrap">
        <AskArtDirectorButton businessName={name} />
        <Link className="pn-network-link" href="/network">Network</Link>
        {role === "business" && typeof coinCount === "number" && (
          <Link className="wallet-chip" href="/business/wallet"><span className="peach-dot" />{coinCount} Coins</Link>
        )}
        <Link className="round-action" href="/notifications#sms-settings" aria-label="Notifications and SMS Settings"><BellIcon /></Link>
        <LogoutButton label="Log Out" className="pn-network-link" style={{ background: "none", border: 0, cursor: "pointer" }} />
        <Link className="profile-chip" href="/account?edit=1" aria-label="Profile">
          <span className="profile-avatar">{(name?.trim()?.[0] ?? "P").toUpperCase()}</span>
        </Link>
      </div>
    </header>
  );
}

export function BottomNav({ role, active }: { role: "business" | "creative"; active: "home" | "projects" | "messages" | "wallet" | "profile" | "matches" }) {
  const items = role === "business"
    ? [
        ["home", "/business", "Home", <HomeIcon key="i" />],
        ["projects", "/business/projects", "Projects", <FolderIcon key="i" />],
        ["messages", "/business/messages", "Messages", <MessageIcon key="i" />],
        ["wallet", "/business/wallet", "Wallet", <WalletIcon key="i" />],
        ["profile", "/account?edit=1", "Profile", <UserIcon key="i" />],
      ]
    : [
        ["home", "/creative", "Home", <HomeIcon key="i" />],
        ["matches", "/creative/offers", "Matches", <FolderIcon key="i" />],
        ["projects", "/creative/projects", "Projects", <FolderIcon key="i" />],
        ["messages", "/creative/messages", "Messages", <MessageIcon key="i" />],
        ["profile", "/account", "Profile", <UserIcon key="i" />],
      ];

  return (
    <nav className="bottom-nav" aria-label={`${role} navigation`}>
      {items.map(([key, href, label, icon]) => (
        <Link key={String(key)} href={String(href)} className={active === key ? "active" : ""}>
          {icon as ReactNode}
          <span>{String(label)}</span>
        </Link>
      ))}
    </nav>
  );
}
