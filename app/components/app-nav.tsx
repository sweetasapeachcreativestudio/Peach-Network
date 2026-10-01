import type { ReactNode } from "react";
import Link from "next/link";
import { BellIcon, FolderIcon, HomeIcon, MessageIcon, UserIcon, WalletIcon } from "./icons";
import { PeachBrand } from "./brand";

export function AppHeader({ name, role, coinCount }: { name?: string | null; role: "business" | "creative"; coinCount?: number | null }) {
  return (
    <header className="app-header">
      <PeachBrand href={role === "business" ? "/business" : "/creative"} />
      <div className="app-header-actions">
        <Link className="pn-network-link" href="/network">Network</Link>
        {role === "business" && typeof coinCount === "number" && (
          <Link className="wallet-chip" href="/business/wallet"><span className="peach-dot" />{coinCount} Coins</Link>
        )}
        <Link className="round-action" href="/notifications" aria-label="Notifications"><BellIcon /></Link>
        <form action="/auth/signout" method="post" style={{margin:0}}><button type="submit" className="pn-network-link" style={{background:"none",border:0,cursor:"pointer"}}>Log Out</button></form>\n        <Link className="profile-chip" href="/account?edit=1" aria-label="Profile">
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
