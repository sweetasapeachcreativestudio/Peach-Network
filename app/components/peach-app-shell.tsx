import type { ReactNode } from "react";
import Link from "next/link";

type Role = "business" | "creative";

const businessNav = [
  ["home", "/business", "Peach Home"],
  ["new", "/business/new-project", "Start a Project"],
  ["projects", "/business/projects", "Projects"],
  ["messages", "/business/messages", "Messages"],
  ["vault", "/business#brand-vault", "Brand Vault"],
  ["wallet", "/business/wallet", "Wallet & Billing"],
  ["account", "/account?edit=1", "Account"],
] as const;

const creativeNav = [
  ["home", "/creative", "Peach Hub"],
  ["opportunities", "/creative/offers", "Opportunities"],
  ["projects", "/creative/projects", "Projects"],
  ["messages", "/creative/messages", "Messages"],
  ["portfolio", "/account?edit=1", "Profile & Portfolio"],
  ["academy", "/creative/academy", "Academy & Resources"],
  ["social", "/network", "Peach Social"],
  ["earnings", "/creative/payouts", "Earnings & Payouts"],
  ["account", "/account?edit=1", "Account"],
] as const;

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
  const first = name?.trim()?.split(" ")[0] || (role === "business" ? "Partner" : "Creative");

  return <div className={`peach-workspace ${role === "business" ? "peach-business-workspace" : ""}`}>
    <aside className="peach-sidebar">
      <Link href={role === "business" ? "/business" : "/creative"} className="peach-sidebar-brand" aria-label="Peach Network home">
        <img src="/brand/peach-wordmark.png" alt="Peach Network"/>
      </Link>
      <div className="peach-sidebar-role">{role === "business" ? "BUSINESS PORTAL" : "CREATIVE PORTAL"}</div>
      <nav className="peach-sidebar-nav" aria-label={role === "business" ? "Business navigation" : "Creative navigation"}>
        {nav.map(([key, href, label]) => <Link key={key} href={href} className={active === key ? "active" : ""}><span className="peach-nav-dot"/>{label}</Link>)}
      </nav>
      <div className="peach-sidebar-bottom">
        <Link href="/account?edit=1" className="peach-user-badge" aria-label="Edit your business or profile"><span>{logoUrl ? <img src={logoUrl} alt=""/> : (businessName || first)[0]?.toUpperCase()}</span><div><strong>{businessName || name || first}</strong><small>{role === "business" ? `${first} · Edit business profile` : "Peach creative"}</small></div></Link>
        <form action="/auth/signout" method="post"><button type="submit">Log out</button></form>
      </div>
    </aside>

    <div className="peach-workspace-main">
      <header className="peach-workspace-topbar">
        <div className="peach-mobile-brand"><img src="/brand/peach-wordmark.png" alt="Peach Network"/></div>
        <div className="peach-topbar-actions">
          {role === "business" && typeof coinCount === "number" && <Link href="/business/wallet" className="peach-coin-chip"><span/> {coinCount} Coins</Link>}
          <Link href="/notifications" className="peach-topbar-button" aria-label="Notifications">Notifications</Link>
          <Link href="/account?edit=1" className="peach-avatar" aria-label="Account">{first[0]?.toUpperCase()}</Link>
        </div>
      </header>
      <div className="peach-workspace-content">{children}</div>
    </div>

    <nav className="peach-mobile-nav" aria-label="Mobile navigation">
      {nav.slice(0,5).map(([key, href, label]) => <Link key={key} href={href} className={active === key ? "active" : ""}><span className="peach-nav-dot"/>{label.replace("Start a Project","Start").replace("Brand Vault","Vault").replace("Profile & Portfolio","Profile")}</Link>)}
    </nav>

    <style>{`
      .peach-workspace{min-height:100vh;background:#f8f6f0;color:#183126;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .peach-sidebar{position:fixed;inset:0 auto 0 0;width:248px;background:#173328;color:#fff;padding:26px 18px 22px;display:flex;flex-direction:column;z-index:50}
      .peach-sidebar-brand{display:block;padding:0 10px}.peach-sidebar-brand img{width:122px;max-height:44px;object-fit:contain;object-position:left}
      .peach-sidebar-role{margin:28px 12px 10px;color:#f2a07e;font-size:10px;font-weight:850;letter-spacing:.16em}
      .peach-sidebar-nav{display:grid;gap:4px}.peach-sidebar-nav a{display:flex;align-items:center;gap:10px;color:#dce7e1;text-decoration:none;padding:11px 12px;border-radius:12px;font-size:13px;font-weight:700;transition:.18s ease}
      .peach-sidebar-nav a:hover,.peach-sidebar-nav a.active{background:#294b3d;color:#fff}.peach-nav-dot{width:7px;height:7px;border:1.5px solid currentColor;border-radius:50%;opacity:.75;flex:0 0 auto}.peach-sidebar-nav a.active .peach-nav-dot{background:#f37a59;border-color:#f37a59;opacity:1}
      .peach-sidebar-bottom{margin-top:auto;border-top:1px solid #36564a;padding:18px 8px 0}.peach-user-badge{display:flex;align-items:center;gap:10px}.peach-user-badge>span,.peach-avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#f4a07e;color:#173328;font-weight:900;text-decoration:none}.peach-user-badge div{display:grid;min-width:0}.peach-user-badge strong{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.peach-user-badge small{font-size:10px;color:#9fb3aa}.peach-sidebar-bottom button{border:0;background:transparent;color:#f4c0ad;padding:13px 0 0;font-weight:750;cursor:pointer}
      .peach-workspace-main{margin-left:248px;min-height:100vh}.peach-workspace-topbar{height:70px;border-bottom:1px solid #e4e5df;background:rgba(248,246,240,.94);display:flex;align-items:center;justify-content:flex-end;padding:0 34px;position:sticky;top:0;z-index:30;backdrop-filter:blur(12px)}
      .peach-mobile-brand{display:none}.peach-topbar-actions{display:flex;align-items:center;gap:10px}.peach-coin-chip,.peach-topbar-button{border:1px solid #d9ded9;background:#fff;color:#244235;text-decoration:none;border-radius:999px;padding:8px 12px;font-size:11px;font-weight:800}.peach-coin-chip span{display:inline-block;width:7px;height:7px;border-radius:50%;background:#f37a59;margin-right:5px}
      .peach-workspace-content{max-width:1280px;margin:0 auto;padding:30px 34px 70px}.peach-mobile-nav{display:none}
      .peach-user-badge{text-decoration:none;color:inherit}.peach-user-badge>span{overflow:hidden}.peach-user-badge img{width:100%;height:100%;object-fit:contain;background:white;padding:3px}
      .peach-business-workspace .peach-sidebar{background:#fff0e7;color:#263f36;border-right:1px solid #efdfd4}
      .peach-business-workspace .peach-sidebar-role{color:#a84c32}
      .peach-business-workspace .peach-sidebar-nav a{color:#52645d;font-size:14px}
      .peach-business-workspace .peach-sidebar-nav a:hover{background:#ffe1d0;color:#263f36}
      .peach-business-workspace .peach-sidebar-nav a.active{background:#fff;color:#263f36;box-shadow:0 2px 8px #a85a2e0a;border:1px solid #efd7c8}
      .peach-business-workspace .peach-sidebar-bottom{border-color:#e7d7cc}.peach-business-workspace .peach-user-badge small{color:#65766e}.peach-business-workspace .peach-sidebar-bottom button{color:#a84c32}
      @media(max-width:900px){.peach-sidebar{display:none}.peach-workspace-main{margin-left:0}.peach-workspace-topbar{height:62px;padding:0 16px;justify-content:space-between}.peach-mobile-brand{display:block}.peach-mobile-brand img{width:100px;max-height:34px;object-fit:contain}.peach-topbar-button{display:none}.peach-workspace-content{padding:20px 16px 88px}.peach-mobile-nav{display:grid;grid-template-columns:repeat(5,1fr);position:fixed;left:0;right:0;bottom:0;z-index:60;background:#fff;border-top:1px solid #dde2dd;padding:7px 4px calc(7px + env(safe-area-inset-bottom))}.peach-mobile-nav a{display:grid;justify-items:center;gap:4px;text-decoration:none;color:#738078;font-size:9px;font-weight:750;text-align:center}.peach-mobile-nav a.active{color:#173328}.peach-mobile-nav a.active .peach-nav-dot{background:#f37a59;border-color:#f37a59}}
    `}</style>
  </div>;
}
