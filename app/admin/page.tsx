"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "partner" | "creative";
  coins: number;
  plan: string;
  joined: string;
}

interface Transaction {
  id: string;
  customerName: string;
  customerEmail: string;
  type: "purchase" | "subscription" | "adjustment";
  amount: number;
  coinsAdded: number;
  date: string;
  status: "completed" | "refunded";
  stripeId: string;
}

interface ProjectBrief {
  id: string;
  title: string;
  client: string;
  clientEmail: string;
  creativeAssigned: string;
  coinsLocked: number;
  status: "in_progress" | "review" | "approved";
  dueIn: string;
}

const INITIAL_USERS: UserAccount[] = [
  { id: "usr_1", name: "Red Mountain BBQ", email: "orders@redmountainbbq.com", role: "partner", coins: 8, plan: "Growth Member", joined: "Sep 18, 2026" },
  { id: "usr_2", name: "New Joy Baptist Church", email: "office@newjoybham.org", role: "partner", coins: 2, plan: "À La Carte", joined: "Sep 22, 2026" },
  { id: "usr_3", name: "Bessemer Chamber of Commerce", email: "info@bessemerchamber.com", role: "partner", coins: 14, plan: "Partner Tier", joined: "Sep 10, 2026" },
  { id: "usr_4", name: "Sarah Jenkins Cafe", email: "sarah@sweetpeachcafe.com", role: "partner", coins: 0, plan: "None", joined: "Sep 28, 2026" },
  { id: "usr_5", name: "Jose M.", email: "jose.design@peachstudio.internal", role: "creative", coins: 0, plan: "Senior Mentor", joined: "Aug 15, 2026" },
  { id: "usr_6", name: "Maya R.", email: "maya@visualarts.internal", role: "creative", coins: 0, plan: "Verified Pro", joined: "Sep 01, 2026" },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "tx_101", customerName: "Red Mountain BBQ", customerEmail: "orders@redmountainbbq.com", type: "subscription", amount: 1099, coinsAdded: 28, date: "Sep 28, 2026", status: "completed", stripeId: "ch_3N8zXpL1" },
  { id: "tx_102", customerName: "New Joy Baptist Church", customerEmail: "office@newjoybham.org", type: "purchase", amount: 100, coinsAdded: 2, date: "Sep 27, 2026", status: "completed", stripeId: "ch_3N7yWkK2" },
  { id: "tx_103", customerName: "Bessemer Chamber", customerEmail: "info@bessemerchamber.com", type: "purchase", amount: 300, coinsAdded: 6, date: "Sep 25, 2026", status: "completed", stripeId: "ch_3N6vUjJ3" },
  { id: "tx_104", customerName: "Sarah Jenkins Cafe", customerEmail: "sarah@sweetpeachcafe.com", type: "purchase", amount: 50, coinsAdded: 1, date: "Sep 24, 2026", status: "completed", stripeId: "ch_3N5tThH4" },
];

const INITIAL_BRIEFS: ProjectBrief[] = [
  { id: "brf_501", title: "Sunday Service Event Program & Digital Cards", client: "New Joy Baptist Church", clientEmail: "office@newjoybham.org", creativeAssigned: "Jose M.", coinsLocked: 4, status: "review", dueIn: "Tomorrow 5:00 PM" },
  { id: "brf_502", title: "Fall Smoked Wings Menu Flyer Kit", client: "Red Mountain BBQ", clientEmail: "orders@redmountainbbq.com", creativeAssigned: "Maya R.", coinsLocked: 2, status: "in_progress", dueIn: "24 Hours" },
  { id: "brf_503", title: "Annual Civic Expo Invitation Suite", client: "Bessemer Chamber of Commerce", clientEmail: "info@bessemerchamber.com", creativeAssigned: "Jose M.", coinsLocked: 6, status: "approved", dueIn: "Completed" },
];

export default function AdminDashboardPage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminEmailInput, setAdminEmailInput] = useState<string>("kantana0495@gmail.com");
  const [adminPasscodeInput, setAdminPasscodeInput] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"coins" | "refunds" | "projects" | "creatives">("coins");
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [briefs, setBriefs] = useState<ProjectBrief[]>(INITIAL_BRIEFS);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Coin Adjustment Modal
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [coinsToAdd, setCoinsToAdd] = useState<number>(5);
  const [coinReason, setCoinReason] = useState<string>("Manual Admin Grant");

  // Refund Confirmation Modal
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [revokeCoins, setRevokeCoins] = useState<boolean>(true);

  // Persistent session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("peach_super_admin");
      if (stored === "kantana0495@gmail.com") {
        setIsAdminAuthenticated(true);
      }
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = adminEmailInput.trim().toLowerCase();
    
    // Unlocks for kantana0495@gmail.com or passcode peach2026
    if (cleanEmail === "kantana0495@gmail.com" || adminPasscodeInput.trim() === "peach2026") {
      setIsAdminAuthenticated(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("peach_super_admin", "kantana0495@gmail.com");
      }
      triggerToast("Welcome, Super Admin Kantana! Admin access unlocked.");
    } else {
      setAuthError("Unauthorized. Please verify your admin email or enter the master passcode.");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("peach_super_admin");
    }
  };

  // Add or Deduct Coins
  const handleApplyCoinAdjustment = () => {
    if (!selectedUser) return;

    const delta = coinsToAdd;
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, coins: Math.max(0, u.coins + delta) } : u))
    );

    const newTx: Transaction = {
      id: `adj_${Date.now().toString().slice(-4)}`,
      customerName: selectedUser.name,
      customerEmail: selectedUser.email,
      type: "adjustment",
      amount: 0,
      coinsAdded: delta,
      date: "Just Now",
      status: "completed",
      stripeId: `admin_${coinReason.replace(/\s+/g, "_").toLowerCase()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    triggerToast(`Added ${delta} Peach Coins to ${selectedUser.name}!`);
    setSelectedUser(null);
  };

  // Issue Refund
  const handleProcessRefund = () => {
    if (!selectedTx) return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === selectedTx.id ? { ...t, status: "refunded" } : t))
    );

    if (revokeCoins && selectedTx.coinsAdded > 0) {
      setUsers((prev) =>
        prev.map((u) =>
          u.email === selectedTx.customerEmail
            ? { ...u, coins: Math.max(0, u.coins - selectedTx.coinsAdded) }
            : u
        )
      );
    }

    triggerToast(`Refund processed for $${selectedTx.amount} (${selectedTx.customerName}).`);
    setSelectedTx(null);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = transactions.filter(
    (t) =>
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Secure Gate Screen (Zero auto-redirects)
  if (!isAdminAuthenticated) {
    return (
      <div className="pn-admin-gate">
        <style>{`
          .pn-admin-gate {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #182820 0%, #0F1E16 100%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 24px;
            box-sizing: border-box;
          }
          .pn-gate-card {
            width: 100%;
            max-width: 440px;
            background: #FFFFFF;
            border-radius: 28px;
            padding: 36px 32px;
            box-shadow: 0 24px 60px rgba(0,0,0,0.4);
            border: 2px solid #E85D3F;
          }
          .pn-gate-center {
            text-align: center;
            margin-bottom: 16px;
          }
          .pn-gate-logo {
            height: 46px;
            width: auto;
          }
          .pn-gate-title {
            font-size: 22px;
            font-weight: 850;
            color: #17271E;
            margin: 0 0 6px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .pn-gate-sub {
            font-size: 13.5px;
            color: #556B60;
            margin: 0 0 20px 0;
            line-height: 1.5;
          }
          .pn-gate-field {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 14px;
          }
          .pn-gate-label {
            font-size: 12.5px;
            font-weight: 800;
            color: #17271E;
          }
          .pn-gate-input {
            height: 48px;
            border-radius: 12px;
            border: 1.5px solid #CBD5E1;
            padding: 0 14px;
            font-size: 14.5px;
            outline: none;
            box-sizing: border-box;
          }
          .pn-gate-input:focus {
            border-color: #E85D3F;
          }
          .pn-gate-hint {
            display: block;
            font-size: 11px;
            color: #64748B;
            margin-top: 2px;
          }
          .pn-gate-btn {
            width: 100%;
            height: 50px;
            border-radius: 99px;
            background: linear-gradient(135deg, #E85D3F 0%, #D44B2D 100%);
            color: #FFFFFF;
            font-size: 15px;
            font-weight: 800;
            border: none;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(232, 93, 63, 0.35);
            margin-top: 8px;
          }
          .pn-gate-return {
            margin-top: 18px;
            text-align: center;
          }
          .pn-gate-link {
            color: #E85D3F;
            font-size: 12.5px;
            font-weight: 700;
            text-decoration: none;
          }
          .pn-error-box {
            background: #FEF2F2;
            border: 1px solid #FECACA;
            color: #B91C1C;
            font-size: 12.5px;
            padding: 10px 12px;
            border-radius: 10px;
            margin-bottom: 14px;
          }
        `}</style>
        <div className="pn-gate-card">
          <div className="pn-gate-center">
            <img src="/peach-app-logo.png" alt="Peach Network" className="pn-gate-logo" />
          </div>
          <h1 className="pn-gate-title">
            <span>🛡</span> Peach Super Admin
          </h1>
          <p className="pn-gate-sub">
            Direct executive access for <strong>kantana0495@gmail.com</strong>. Manage Peach Coins, customer refunds, and platform deliverables.
          </p>

          {authError && <div className="pn-error-box">⚠ {authError}</div>}

          <form onSubmit={handleAdminLogin}>
            <div className="pn-gate-field">
              <label className="pn-gate-label">Admin Email Address</label>
              <input
                type="email"
                required
                className="pn-gate-input"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
              />
            </div>

            <div className="pn-gate-field">
              <label className="pn-gate-label">Master Passcode or PIN</label>
              <input
                type="password"
                placeholder="Enter passcode (default: peach2026)"
                className="pn-gate-input"
                value={adminPasscodeInput}
                onChange={(e) => setAdminPasscodeInput(e.target.value)}
              />
              <span className="pn-gate-hint">
                Default unlock key: <code>peach2026</code>
              </span>
            </div>

            <button type="submit" className="pn-gate-btn">
              Unlock Admin Command Center
            </button>
          </form>

          <div className="pn-gate-return">
            <Link href="/" className="pn-gate-link">
              ← Return to Main Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pn-admin-app">
      <style>{`
        .pn-admin-app {
          min-height: 100vh;
          background: #F8FAFC;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0F172A;
          display: flex;
          flex-direction: column;
        }

        .pn-admin-nav {
          background: #182820;
          color: #FFFFFF;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #E85D3F;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .pn-admin-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pn-admin-tag {
          background: #E85D3F;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 850;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 99px;
        }
        .pn-admin-user-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
        }
        .pn-admin-badge {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 6px 14px;
          border-radius: 99px;
          color: #FFA585;
          font-weight: 700;
        }
        .pn-live-link {
          color: #E2ECE5;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }
        .pn-logout-btn {
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #FFFFFF;
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .pn-admin-body {
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 24px 20px;
          box-sizing: border-box;
          flex: 1;
        }

        .pn-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .pn-metric-card {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 20px;
          border: 1.5px solid #E2E8F0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pn-mc-label {
          font-size: 12px;
          font-weight: 800;
          color: #64748B;
          text-transform: uppercase;
        }
        .pn-mc-val {
          font-size: 28px;
          font-weight: 850;
          color: #0F172A;
        }
        .pn-mc-sub {
          font-size: 12px;
          color: #16A34A;
          font-weight: 700;
        }

        .pn-tabs-bar {
          display: flex;
          gap: 8px;
          border-bottom: 2px solid #E2E8F0;
          margin-bottom: 20px;
          overflow-x: auto;
        }
        .pn-tab-btn {
          background: none;
          border: none;
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 800;
          color: #64748B;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pn-tab-btn.is-active {
          color: #C2410C;
          border-bottom-color: #E85D3F;
        }

        .pn-search-wrap {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .pn-search-input {
          height: 44px;
          border-radius: 12px;
          border: 1.5px solid #CBD5E1;
          padding: 0 16px;
          font-size: 14px;
          width: 100%;
          max-width: 360px;
          outline: none;
          background: #FFFFFF;
        }

        .pn-table-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1.5px solid #E2E8F0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.03);
          overflow-x: auto;
        }
        .pn-admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .pn-admin-table th {
          background: #F8FAFC;
          padding: 14px 18px;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          border-bottom: 1.5px solid #E2E8F0;
        }
        .pn-admin-table td {
          padding: 16px 18px;
          font-size: 13.5px;
          border-bottom: 1px solid #F1F5F9;
          color: #1E293B;
          vertical-align: middle;
        }
        .pn-admin-table tr:hover td {
          background: #FFFDFB;
        }

        .pn-coin-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FFF0E6;
          color: #C2410C;
          border: 1px solid #FDBA74;
          padding: 4px 12px;
          border-radius: 99px;
          font-weight: 850;
        }

        .pn-action-btn-sm {
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          border: none;
        }
        .pn-act-add-coins {
          background: #E85D3F;
          color: #FFFFFF;
        }
        .pn-act-refund {
          background: #FEF2F2;
          border: 1px solid #FCA5A5;
          color: #B91C1C;
        }

        .pn-refund-notice-box {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          padding: 12px;
          border-radius: 10px;
          font-size: 13px;
          color: #991B1B;
          margin-bottom: 14px;
        }

        .pn-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #17271E;
          color: #FFFFFF;
          border-left: 4px solid #E85D3F;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 750;
          box-shadow: 0 14px 36px rgba(0,0,0,0.3);
          z-index: 100;
        }

        .pn-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .pn-modal-card {
          background: #FFFFFF;
          border-radius: 24px;
          max-width: 480px;
          width: 100%;
          padding: 28px;
          border: 2px solid #E85D3F;
        }
        .pn-m-title {
          font-size: 18px;
          font-weight: 850;
          color: #0F172A;
          margin: 0 0 8px 0;
        }
        .pn-m-sub {
          font-size: 13.5px;
          color: #64748B;
          margin: 0 0 18px 0;
        }
        .pn-m-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .pn-m-btn-confirm {
          flex: 1;
          height: 44px;
          border-radius: 99px;
          background: #E85D3F;
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 800;
          border: none;
          cursor: pointer;
        }
        .pn-m-btn-danger {
          flex: 1;
          height: 44px;
          border-radius: 99px;
          background: #DC2626;
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 800;
          border: none;
          cursor: pointer;
        }
        .pn-m-btn-cancel {
          height: 44px;
          padding: 0 20px;
          border-radius: 99px;
          background: #F1F5F9;
          color: #475569;
          font-size: 14px;
          font-weight: 750;
          border: none;
          cursor: pointer;
        }

        .pn-status-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 11.5px;
          font-weight: 800;
        }
        .pn-status-paid {
          background: #ECFDF5;
          color: #065F46;
        }
        .pn-status-refunded {
          background: #FEF2F2;
          color: #991B1B;
        }
        .pn-status-approved {
          background: #ECFDF5;
          color: #065F46;
        }
        .pn-status-review {
          background: #FEF3C7;
          color: #92400E;
        }
        .pn-status-active {
          background: #EFF6FF;
          color: #1E40AF;
        }

        .pn-modal-form-fields {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pn-modal-field-label {
          font-size: 12.5px;
          font-weight: 800;
          display: block;
          margin-bottom: 4px;
        }
        .pn-modal-input {
          width: 100%;
          height: 44px;
          border-radius: 10px;
          border: 1.5px solid #CBD5E1;
          padding: 0 12px;
          font-size: 15px;
          box-sizing: border-box;
        }
        .pn-modal-select {
          width: 100%;
          height: 44px;
          border-radius: 10px;
          border: 1.5px solid #CBD5E1;
          padding: 0 12px;
          font-size: 14px;
          box-sizing: border-box;
          background: #FFFFFF;
        }
        .pn-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          cursor: pointer;
        }
      `}</style>

      {/* Top Navbar */}
      <header className="pn-admin-nav">
        <div className="pn-admin-brand">
          <Link href="/">
            <img src="/peach-app-logo.png" alt="Peach Network" style={{ height: "36px", width: "auto" }} />
          </Link>
          <span className="pn-admin-tag">Command Center</span>
        </div>

        <div className="pn-admin-user-pill">
          <span className="pn-admin-badge">👑 Super Admin: kantana0495@gmail.com</span>
          <Link href="/" className="pn-live-link">
            Live Site ↗
          </Link>
          <button className="pn-logout-btn" onClick={handleAdminLogout}>
            Exit Admin
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="pn-admin-body">
        {/* KPI Summary Cards */}
        <div className="pn-metrics-grid">
          <div className="pn-metric-card">
            <span className="pn-mc-label">Active Peach Coins in Vaults</span>
            <span className="pn-mc-val">
              {users.reduce((acc, u) => acc + u.coins, 0)} 🪙
            </span>
            <span className="pn-mc-sub">Across 4 Active Partner Accounts</span>
          </div>

          <div className="pn-metric-card">
            <span className="pn-mc-label">Gross Processed Volume</span>
            <span className="pn-mc-val">
              ${transactions.reduce((acc, t) => acc + (t.status === "completed" ? t.amount : 0), 0).toLocaleString()}
            </span>
            <span className="pn-mc-sub">100% On-Time Turnaround SLA</span>
          </div>

          <div className="pn-metric-card">
            <span className="pn-mc-label">Active Briefs In Queue</span>
            <span className="pn-mc-val">{briefs.length} Projects</span>
            <span className="pn-mc-sub">Supervised by Senior Art Directors</span>
          </div>

          <div className="pn-metric-card">
            <span className="pn-mc-label">Refund Rate</span>
            <span className="pn-mc-val" style={{ color: "#16A34A" }}>
              0.0%
            </span>
            <span className="pn-mc-sub">Full Client Satisfaction Guarantee</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="pn-tabs-bar">
          <button
            className={`pn-tab-btn ${activeTab === "coins" ? "is-active" : ""}`}
            onClick={() => setActiveTab("coins")}
          >
            <span>🪙</span> Client Accounts & Coins
          </button>
          <button
            className={`pn-tab-btn ${activeTab === "refunds" ? "is-active" : ""}`}
            onClick={() => setActiveTab("refunds")}
          >
            <span>💸</span> Transactions & Refunds
          </button>
          <button
            className={`pn-tab-btn ${activeTab === "projects" ? "is-active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            <span>📋</span> Active Deliverables Queue
          </button>
          <button
            className={`pn-tab-btn ${activeTab === "creatives" ? "is-active" : ""}`}
            onClick={() => setActiveTab("creatives")}
          >
            <span>🎨</span> Creative Roster & 75% Payouts
          </button>
        </div>

        {/* Search */}
        <div className="pn-search-wrap">
          <input
            type="text"
            className="pn-search-input"
            placeholder="Search by name, organization, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span style={{ fontSize: "13px", color: "#64748B" }}>
            Showing {activeTab === "coins" ? filteredUsers.length : filteredTransactions.length} records
          </span>
        </div>

        {/* TAB 1: COINS & CLIENT ACCOUNTS */}
        {activeTab === "coins" && (
          <div className="pn-table-card">
            <table className="pn-admin-table">
              <thead>
                <tr>
                  <th>Client / Organization</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Plan</th>
                  <th>Coin Balance</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        style={{
                          textTransform: "capitalize",
                          fontWeight: 700,
                          color: u.role === "partner" ? "#C2410C" : "#0284C7",
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>{u.plan}</td>
                    <td>
                      <span className="pn-coin-pill">🪙 {u.coins} Coins</span>
                    </td>
                    <td>{u.joined}</td>
                    <td>
                      <button
                        className="pn-action-btn-sm pn-act-add-coins"
                        onClick={() => setSelectedUser(u)}
                      >
                        + Add / Adjust Coins
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: REFUNDS & TRANSACTIONS */}
        {activeTab === "refunds" && (
          <div className="pn-table-card">
            <table className="pn-admin-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Client Name</th>
                  <th>Amount</th>
                  <th>Coins Credited</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <code>{tx.id}</code>
                    </td>
                    <td>
                      <strong>{tx.customerName}</strong>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>{tx.customerEmail}</div>
                    </td>
                    <td>
                      <strong>${tx.amount.toLocaleString()}</strong>
                    </td>
                    <td>+{tx.coinsAdded} Coins</td>
                    <td>{tx.date}</td>
                    <td>
                      <span
                        className={`pn-status-badge ${
                          tx.status === "completed" ? "pn-status-paid" : "pn-status-refunded"
                        }`}
                      >
                        {tx.status === "completed" ? "✓ Paid" : "↩ Refunded"}
                      </span>
                    </td>
                    <td>
                      {tx.status === "completed" && tx.amount > 0 ? (
                        <button
                          className="pn-action-btn-sm pn-act-refund"
                          onClick={() => setSelectedTx(tx)}
                        >
                          Issue Refund
                        </button>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#94A3B8" }}>No action needed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: ACTIVE BRIEFS QUEUE */}
        {activeTab === "projects" && (
          <div className="pn-table-card">
            <table className="pn-admin-table">
              <thead>
                <tr>
                  <th>Project Brief</th>
                  <th>Client</th>
                  <th>Assigned Creative</th>
                  <th>Escrowed Coins</th>
                  <th>Turnaround Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {briefs.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.title}</strong>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>ID: {b.id}</div>
                    </td>
                    <td>{b.client}</td>
                    <td>
                      <span style={{ fontWeight: 750, color: "#0284C7" }}>🎨 {b.creativeAssigned}</span>
                    </td>
                    <td>
                      <span className="pn-coin-pill">🪙 {b.coinsLocked} Coins</span>
                    </td>
                    <td>{b.dueIn}</td>
                    <td>
                      <span
                        className={`pn-status-badge ${
                          b.status === "approved"
                            ? "pn-status-approved"
                            : b.status === "review"
                            ? "pn-status-review"
                            : "pn-status-active"
                        }`}
                      >
                        {b.status === "approved"
                          ? "✓ Delivered & Approved"
                          : b.status === "review"
                          ? "⏳ In Review"
                          : "⚡ Active Drafting"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: CREATIVES & 75% PAYOUTS */}
        {activeTab === "creatives" && (
          <div className="pn-table-card" style={{ padding: "24px" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 850 }}>
              Southern Creative Roster & Payout Approvals
            </h3>
            <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 20px 0" }}>
              Creatives receive 75% direct deliverable payouts once a business approves the final files.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div style={{ border: "1.5px solid #CBD5E1", borderRadius: "16px", padding: "18px", background: "#FFFFFF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>Jose M.</h4>
                  <span style={{ fontSize: "11px", background: "#E0F2FE", color: "#0369A1", padding: "3px 8px", borderRadius: "99px", fontWeight: 800 }}>Senior Mentor</span>
                </div>
                <div style={{ fontSize: "13px", color: "#64748B", marginTop: 4 }}>Birmingham & Troy, AL Area</div>
                <div style={{ marginTop: 14, fontSize: "13.5px" }}>
                  <strong>Pending Payout:</strong> $450.00 (6 Finished Deliverables)
                </div>
                <button
                  className="pn-action-btn-sm"
                  style={{ marginTop: 12, width: "100%", background: "#16A34A", color: "#FFFFFF", height: 38 }}
                  onClick={() => triggerToast("Direct 75% payout of $450.00 approved for Jose M.!")}
                >
                  Approve & Release Payout
                </button>
              </div>

              <div style={{ border: "1.5px solid #CBD5E1", borderRadius: "16px", padding: "18px", background: "#FFFFFF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>Maya R.</h4>
                  <span style={{ fontSize: "11px", background: "#E0F2FE", color: "#0369A1", padding: "3px 8px", borderRadius: "99px", fontWeight: 800 }}>Verified Pro</span>
                </div>
                <div style={{ fontSize: "13px", color: "#64748B", marginTop: 4 }}>Atlanta & Huntsville Area</div>
                <div style={{ marginTop: 14, fontSize: "13.5px" }}>
                  <strong>Pending Payout:</strong> $150.00 (2 Finished Deliverables)
                </div>
                <button
                  className="pn-action-btn-sm"
                  style={{ marginTop: 12, width: "100%", background: "#16A34A", color: "#FFFFFF", height: 38 }}
                  onClick={() => triggerToast("Direct 75% payout of $150.00 approved for Maya R.!")}
                >
                  Approve & Release Payout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* COIN ADJUSTMENT MODAL */}
      {selectedUser && (
        <div className="pn-modal-backdrop">
          <div className="pn-modal-card">
            <h3 className="pn-m-title">🪙 Adjust Coins for {selectedUser.name}</h3>
            <p className="pn-m-sub">
              Current balance: <strong>{selectedUser.coins} Peach Coins</strong> ({selectedUser.email})
            </p>

            <div className="pn-modal-form-fields">
              <div>
                <label className="pn-modal-field-label">Coins to Add (use minus to deduct)</label>
                <input
                  type="number"
                  className="pn-modal-input"
                  value={coinsToAdd}
                  onChange={(e) => setCoinsToAdd(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="pn-modal-field-label">Reason for adjustment</label>
                <select
                  className="pn-modal-select"
                  value={coinReason}
                  onChange={(e) => setCoinReason(e.target.value)}
                >
                  <option value="Manual Admin Grant">Manual Admin Grant / Promotional</option>
                  <option value="Subscription Rollover Bonus">Subscription Rollover Bonus</option>
                  <option value="Customer Support Resolution">Customer Support Resolution</option>
                  <option value="Offline Check Payment">Offline Check / Invoice Payment</option>
                </select>
              </div>
            </div>

            <div className="pn-m-actions">
              <button className="pn-m-btn-cancel" onClick={() => setSelectedUser(null)}>
                Cancel
              </button>
              <button className="pn-m-btn-confirm" onClick={handleApplyCoinAdjustment}>
                Save & Update Coin Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {selectedTx && (
        <div className="pn-modal-backdrop">
          <div className="pn-modal-card">
            <h3 className="pn-m-title">💸 Issue Refund: ${selectedTx.amount}</h3>
            <p className="pn-m-sub">
              Client: <strong>{selectedTx.customerName}</strong> ({selectedTx.customerEmail})<br />
              Original Transaction ID: <code>{selectedTx.id}</code>
            </p>

            <div className="pn-refund-notice-box">
              Issuing this refund will mark the transaction as refunded in your accounting ledger.
            </div>

            <label className="pn-checkbox-label">
              <input
                type="checkbox"
                checked={revokeCoins}
                onChange={(e) => setRevokeCoins(e.target.checked)}
              />
              Also revoke the <strong>{selectedTx.coinsAdded} Peach Coins</strong> credited to their vault
            </label>

            <div className="pn-m-actions">
              <button className="pn-m-btn-cancel" onClick={() => setSelectedTx(null)}>
                Cancel
              </button>
              <button
                className="pn-m-btn-danger"
                onClick={handleProcessRefund}
              >
                Confirm Full Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="pn-toast">
          <span>✓</span> {toastMessage}
        </div>
      )}
    </div>
  );
}
