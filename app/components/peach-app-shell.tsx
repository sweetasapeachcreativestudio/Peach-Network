import type { ReactNode } from "react";
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
  MessageSquare,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { AskArtDirectorButton } from "./ask-art-director-modal";
import { PeachMobileDrawer } from "./peach-mobile-drawer";
import { SidebarAvatar } from "./sidebar-avatar";
import { LogoutButton } from "./logout-button";

type Role = "business" | "creative";

const businessNav = [
  ["home", "/business", "Peach Home"],
  ["peach_business", "/business/peach-business", "Peach Business"],
  ["projects", "/business/projects", "Projects"],
  ["messages", "/business/messages", "Messages"],
  ["vault", "/business/vault", "Brand Vault"],
  ["wallet", "/business/wallet", "Wallet & Billing"],
  ["notifications", "/notifications#sms-settings", "Alerts & SMS"],
  ["account", "/business/account", "Account"],
] as const;

const creativeNav = [
  ["home", "/creative", "Peach Hub"],
  ["studio_ai", "/creative/studio-ai", "Creative Director AI"],
  ["opportunities", "/creative/offers", "Opportunities"],
  ["projects", "/creative/projects", "Projects"],
  ["messages", "/creative/messages", "Messages"],
  ["portfolio", "/creative/profile", "Profile & Portfolio"],
  ["academy", "/creative/academy", "Academy & Resources"],
  ["social", "/network", "Peach Social"],
  ["earnings", "/creative/payouts", "Earnings & Payouts"],
  ["notifications", "/notifications#sms-settings", "Alerts & SMS"],
  ["account", "/account?edit=1", "Account"],
] as const;

function NavIcon({ itemKey }: { itemKey: string }) {
  const cls = "w-[18px] h-[18px] shrink-0";
  switch (itemKey) {
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

export function PeachAppShell({
  role,
  active,
  name,
  coinCount,
  businessName,
  logoUrl,
  children,
}: {
  role: Role;
  active: string;
  name?: string | null;
  coinCount?: number | null;
  businessName?: string | null;
  logoUrl?: string | null;
  children: ReactNode;
}) {
  const nav = role === "business" ? businessNav : creativeNav;
  const navItems = nav.map(([key, href, label]) => ({ key, href, label }));
  const first = name?.trim()?.split(" ")[0] || (role === "business" ? "Partner" : "Creative");
  const displayOrgName = businessName?.trim() || name?.trim() || first;
  const userSubtitle = role === "business" ? `${first} · Business owner` : "Peach creative";

  return (
    <div className={`peach-workspace ${role === "business" ? "peach-business-workspace" : "peach-creative-workspace"}`}>
      {/* Fixed 240px Desktop Left Sidebar */}
      <aside className="peach-sidebar">
        <Link
          href={role === "business" ? "/business" : "/creative"}
          className="peach-sidebar-brand"
          aria-label="Peach Network home"
        >
          <img src="/brand/peach-wordmark.png" alt="Peach Network" />
        </Link>

        <div className="peach-sidebar-role">
          {role === "business" ? "PEACH STUDIO" : "CREATIVE STUDIO"}
        </div>

        <nav
          className="peach-sidebar-nav"
          aria-label={role === "business" ? "Business navigation" : "Creative navigation"}
        >
          {nav.map(([key, href, label]) => {
            const isActive = active === key;
            return (
              <Link key={key} href={href} className={isActive ? "active" : ""}>
                <span className="peach-nav-icon">
                  <NavIcon itemKey={key} />
                </span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="peach-sidebar-bottom">
          <Link
            href={role === "business" ? "/business/account" : "/account?edit=1"}
            className="peach-user-badge"
            aria-label="Edit your business or profile"
          >
            <SidebarAvatar logoUrl={logoUrl} label={displayOrgName} />
            <div>
              <strong>{displayOrgName}</strong>
              <small>{userSubtitle}</small>
            </div>
          </Link>
          <LogoutButton label="Log out" />
        </div>
      </aside>

      <div className="peach-workspace-main">
        {/* Clean Sticky Topbar for Mobile Drawer Trigger & Quick Wallet */}
        <header className="peach-workspace-topbar">
          <div className="peach-mobile-left">
            <PeachMobileDrawer
              role={role}
              active={active}
              navItems={navItems}
              displayOrgName={displayOrgName}
              subtitle={userSubtitle}
            />
            <Link
              href={role === "business" ? "/business" : "/creative"}
              className="peach-mobile-brand"
              aria-label="Peach Home"
            >
              <img src="/brand/peach-wordmark.png" alt="Peach Network" />
            </Link>
          </div>

          <div className="peach-topbar-actions">
            {role === "business" && typeof coinCount === "number" && (
              <Link href="/business/wallet" className="peach-coin-chip tabular-nums">
                {coinCount} Peach Coins
              </Link>
            )}
            <Link
              href={role === "business" ? "/business/account" : "/account?edit=1"}
              className="peach-avatar"
              aria-label="Account"
            >
              {(displayOrgName[0] || first[0] || "P").toUpperCase()}
            </Link>
          </div>
        </header>

        <div className="peach-workspace-content">{children}</div>
      </div>

      {/* Floating Bottom-Right Concierge Button (Accessible on All Screens) */}
      <AskArtDirectorButton businessName={displayOrgName} variant="floating" />

      {/* Mobile Bottom Tab Bar */}
      <nav className="peach-mobile-nav" aria-label="Mobile navigation">
        {nav.slice(0, 5).map(([key, href, label]) => {
          const isActive = active === key;
          return (
            <Link key={key} href={href} className={isActive ? "active" : ""}>
              <NavIcon itemKey={key} />
              <span>
                {label
                  .replace("Peach Business", "Business")
                  .replace("Brand Vault", "Vault")
                  .replace("Profile & Portfolio", "Profile")
                  .replace("Creative Director AI", "Studio AI")}
              </span>
            </Link>
          );
        })}
      </nav>

      <style>{`
        .peach-workspace{min-height:100vh;background:#FFF6EE;color:#231714;font-family:var(--font-plus-jakarta),"Plus Jakarta Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .peach-sidebar{position:fixed;inset:0 auto 0 0;width:240px;background:#FFFFFF;color:#231714;border-right:1px solid #F7DFD0;padding:24px 14px 20px;display:flex;flex-direction:column;z-index:50}
        .peach-sidebar-brand{display:block;padding:0 10px}
        .peach-sidebar-brand img{width:118px;max-height:42px;object-fit:contain;object-position:left}
        .peach-sidebar-role{margin:24px 10px 10px;color:#FF5E3A;font-size:11px;font-weight:800;letter-spacing:.14em}
        .peach-sidebar-nav{display:grid;gap:4px}
        .peach-sidebar-nav a{position:relative;display:flex;align-items:center;gap:11px;color:#4A3B36;text-decoration:none;padding:10px 12px;border-radius:14px;font-size:14px;font-weight:600;transition:background .16s ease,color .16s ease}
        .peach-sidebar-nav a .peach-nav-icon{color:#4A3B36;display:inline-flex;align-items:center}
        .peach-sidebar-nav a:hover{background:#FFF6EE;color:#231714}
        .peach-sidebar-nav a:hover .peach-nav-icon{color:#FF5E3A}
        .peach-sidebar-nav a.active{background:#FFF6EE;color:#231714;font-weight:800}
        .peach-sidebar-nav a.active .peach-nav-icon{color:#FF5E3A}
        .peach-sidebar-nav a.active::before{content:"";position:absolute;left:0;top:8px;bottom:8px;width:3px;border-radius:0 4px 4px 0;background:#FF5E3A}
        .peach-sidebar-bottom{margin-top:auto;border-top:1px solid #F7DFD0;padding:16px 8px 0}
        .peach-user-badge{display:flex;align-items:center;gap:10px;text-decoration:none;color:#231714}
        .peach-user-avatar,.peach-avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#231714;color:#FFFFFF;font-weight:800;font-size:14px;text-decoration:none;flex:0 0 auto;overflow:hidden;border:1px solid #F7DFD0}
        .peach-user-avatar img{width:100%;height:100%;object-fit:contain;background:#FFFFFF;padding:3px}
        .peach-user-badge div{display:grid;min-width:0}
        .peach-user-badge strong{font-size:14px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#231714}
        .peach-user-badge small{font-size:12px;color:#4A3B36}
        .peach-sidebar-bottom button{border:0;background:transparent;color:#FF5E3A;padding:12px 2px 0;font-size:13px;font-weight:700;cursor:pointer}
        .peach-workspace-main{margin-left:240px;min-height:100vh}
        .peach-workspace-topbar{min-height:64px;border-bottom:1px solid #F7DFD0;background:rgba(255,246,238,.92);display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:8px 32px;position:sticky;top:0;z-index:30;backdrop-filter:blur(12px)}
        .peach-mobile-left{display:none}.peach-mobile-brand{display:none}
        .peach-topbar-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}
        .peach-coin-chip{border:1px solid #F7DFD0;background:#FFFFFF;color:#231714;text-decoration:none;border-radius:999px;padding:7px 14px;font-size:13px;font-weight:700;white-space:nowrap;box-shadow:0 4px 12px rgba(232,93,59,0.06)}
        .peach-workspace-content{max-width:1340px;margin:0 auto;padding:24px 32px 96px}
        .peach-mobile-nav{display:none}
        @media(max-width:960px){
          .peach-sidebar{display:none}
          .peach-workspace-main{margin-left:0}
          .peach-workspace-topbar{min-height:60px;padding:10px 16px;justify-content:space-between;flex-wrap:wrap;gap:8px}
          .peach-mobile-left{display:flex;align-items:center;gap:10px;flex:0 0 auto}
          .peach-mobile-brand{display:block;flex:0 0 auto}
          .peach-mobile-brand img{width:82px;max-height:30px;object-fit:contain}
          .peach-topbar-actions{gap:8px}
          .peach-coin-chip{padding:6px 11px;font-size:12px}
          .peach-workspace-content{padding:18px 16px 110px}
          .peach-mobile-nav{display:grid;grid-template-columns:repeat(5,1fr);position:fixed;left:0;right:0;bottom:0;z-index:60;background:#FFFFFF;border-top:1px solid #F7DFD0;padding:9px 4px calc(9px + env(safe-area-inset-bottom))}
          .peach-mobile-nav a{display:grid;justify-items:center;gap:4px;text-decoration:none;color:#4A3B36;font-size:11px;font-weight:700;text-align:center}
          .peach-mobile-nav a.active{color:#FF5E3A;font-weight:800}
        }
      `}</style>
    </div>
  );
}
