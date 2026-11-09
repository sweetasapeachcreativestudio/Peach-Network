import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { CreativeStatusBadge, getStatusDetails } from "../components/creative-status-badge";
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Users, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

function prettyLevel(level?: string | null) {
  if (!level) return "Seed";
  return level[0].toUpperCase() + level.slice(1);
}

export default async function CreativeReviewQueue({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams?.status || "all";

  const supabase = createAdminClient();

  // Query all creatives so we can calculate counts for all status states
  const { data: allCreatives } = await supabase
    .from("creatives")
    .select(`
      id,
      primary_specialty,
      city,
      state,
      peach_level,
      application_status,
      reliability_score,
      created_at,
      profiles:user_id(full_name,email,avatar_url),
      creative_applications(
        id,
        experience,
        tools,
        portfolio_url,
        submitted_at,
        reviewed_at
      )
    `)
    .order("created_at", { ascending: false });

  const creativesList = allCreatives ?? [];

  // Compute counts for each status
  const pendingCount = creativesList.filter((c: any) => {
    const s = (c.application_status || "").toLowerCase();
    return s === "submitted" || s === "under_review" || s === "pending" || s === "pending_review" || !s;
  }).length;

  const approvedCount = creativesList.filter(
    (c: any) => (c.application_status || "").toLowerCase() === "approved"
  ).length;

  const needsWorkCount = creativesList.filter(
    (c: any) => (c.application_status || "").toLowerCase() === "needs_more_work"
  ).length;

  // Filter based on active tab
  const filteredCreatives = creativesList.filter((c: any) => {
    const s = (c.application_status || "").toLowerCase();
    if (currentTab === "pending") {
      return s === "submitted" || s === "under_review" || s === "pending" || s === "pending_review" || !s;
    }
    if (currentTab === "approved") {
      return s === "approved";
    }
    if (currentTab === "needs_more_work") {
      return s === "needs_more_work";
    }
    return true; // "all"
  });

  return (
    <main className="shell" style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 20px 100px" }}>
      {/* Top Breadcrumb & Brand */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Link
          href="/admin"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 700,
            color: "#5f6964",
            textDecoration: "none",
          }}
        >
          <ArrowLeft style={{ width: 15, height: 15 }} />
          <span>Back to HQ Command Center</span>
        </Link>

        <div className="brand" style={{ fontSize: 24 }}>
          PE<span className="brand-accent">≡</span>CH <span style={{ fontSize: 11, letterSpacing: ".16em", color: "#f5a27f", verticalAlign: "middle", marginLeft: 6 }}>HQ</span>
        </div>
      </div>

      <header style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 850, letterSpacing: ".14em", color: "#e85d3f", textTransform: "uppercase" }}>
          HQ &bull; TALENT ROSTER &amp; APPLICATIONS
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "6px 0 8px", letterSpacing: "-.03em", color: "#0b2d22" }}>
          Creative Roster &amp; Review Queue
        </h1>
        <p style={{ margin: 0, color: "#5f6964", fontSize: 14 }}>
          Review pending applications, inspect vetted local commercial talent, and identify statuses at a glance.
        </p>
      </header>

      {/* STATUS FILTER TABS WITH COUNTERS */}
      <section style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <Link
          href="/admin/creatives?status=all"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 14,
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
            backgroundColor: currentTab === "all" ? "#0b2d22" : "#ffffff",
            color: currentTab === "all" ? "#ffffff" : "#14211b",
            border: currentTab === "all" ? "1px solid #0b2d22" : "1px solid #ded6ce",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            transition: "all .15s ease",
          }}
        >
          <Users style={{ width: 14, height: 14 }} />
          <span>All Creatives</span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 7px",
              borderRadius: 99,
              backgroundColor: currentTab === "all" ? "#173f32" : "#f1ece6",
              color: currentTab === "all" ? "#ffd4c3" : "#5f6964",
            }}
          >
            {creativesList.length}
          </span>
        </Link>

        <Link
          href="/admin/creatives?status=pending"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 14,
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
            backgroundColor: currentTab === "pending" ? "#92400e" : "#fffbeb",
            color: currentTab === "pending" ? "#ffffff" : "#78350f",
            border: currentTab === "pending" ? "1px solid #92400e" : "1px solid #fcd34d",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            transition: "all .15s ease",
          }}
        >
          <Clock style={{ width: 14, height: 14 }} />
          <span>Pending Review</span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 7px",
              borderRadius: 99,
              backgroundColor: currentTab === "pending" ? "#b45309" : "#fef3c7",
              color: currentTab === "pending" ? "#ffffff" : "#92400e",
              fontWeight: 900,
            }}
          >
            {pendingCount}
          </span>
        </Link>

        <Link
          href="/admin/creatives?status=approved"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 14,
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
            backgroundColor: currentTab === "approved" ? "#065f46" : "#ecfdf5",
            color: currentTab === "approved" ? "#ffffff" : "#064e3b",
            border: currentTab === "approved" ? "1px solid #065f46" : "1px solid #6ee7b7",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            transition: "all .15s ease",
          }}
        >
          <CheckCircle2 style={{ width: 14, height: 14 }} />
          <span>Approved</span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 7px",
              borderRadius: 99,
              backgroundColor: currentTab === "approved" ? "#047857" : "#d1fae5",
              color: currentTab === "approved" ? "#ffffff" : "#065f46",
              fontWeight: 900,
            }}
          >
            {approvedCount}
          </span>
        </Link>

        <Link
          href="/admin/creatives?status=needs_more_work"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 14,
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
            backgroundColor: currentTab === "needs_more_work" ? "#9a3412" : "#fff7ed",
            color: currentTab === "needs_more_work" ? "#ffffff" : "#7c2d12",
            border: currentTab === "needs_more_work" ? "1px solid #9a3412" : "1px solid #fdba74",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            transition: "all .15s ease",
          }}
        >
          <AlertCircle style={{ width: 14, height: 14 }} />
          <span>Needs More Work</span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 7px",
              borderRadius: 99,
              backgroundColor: currentTab === "needs_more_work" ? "#c2410c" : "#ffedd5",
              color: currentTab === "needs_more_work" ? "#ffffff" : "#9a3412",
              fontWeight: 900,
            }}
          >
            {needsWorkCount}
          </span>
        </Link>
      </section>

      {/* CREATIVES GRID / LIST WITH STATUS BADGES */}
      <section style={{ display: "grid", gap: 14 }}>
        {filteredCreatives.map((creative: any) => {
          const application = creative.creative_applications?.[0];
          const isPending =
            !creative.application_status ||
            ["submitted", "under_review", "pending", "pending_review"].includes(creative.application_status);

          return (
            <div
              key={creative.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #ded6ce",
                borderRadius: 20,
                padding: "20px 24px",
                boxShadow: "0 4px 16px rgba(18, 40, 31, 0.04)",
                transition: "border-color .18s ease, transform .18s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                {/* Left: Creative Info */}
                <div style={{ flex: "1 1 300px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 900,
                        color: "#0b2d22",
                        letterSpacing: "-.02em",
                      }}
                    >
                      {creative.profiles?.full_name ?? "Unnamed Creative"}
                    </h2>

                    {/* STATUS BADGE - HIGH VISIBILITY AT A GLANCE */}
                    <CreativeStatusBadge status={creative.application_status} size="md" />

                    {/* Level Pill */}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        backgroundColor: "#f5ede5",
                        color: "#5f6964",
                        padding: "3px 9px",
                        borderRadius: 99,
                      }}
                    >
                      Peach {prettyLevel(creative.peach_level)}
                    </span>
                  </div>

                  <p style={{ margin: "0 0 6px", fontSize: 13, color: "#14211b", fontWeight: 700 }}>
                    {creative.primary_specialty ?? "Specialty not set"}
                    {creative.city ? ` · ${creative.city}, ${creative.state ?? ""}` : ""}
                  </p>

                  <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#5f6964", flexWrap: "wrap" }}>
                    <span>{creative.profiles?.email}</span>
                    {application?.submitted_at && (
                      <>
                        <span>&bull;</span>
                        <span>
                          Applied: {new Date(application.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </>
                    )}
                    {creative.reliability_score && (
                      <>
                        <span>&bull;</span>
                        <span style={{ color: "#065f46", fontWeight: 700 }}>
                          Reliability: {creative.reliability_score}%
                        </span>
                      </>
                    )}
                  </div>

                  {application?.portfolio_url && (
                    <div style={{ marginTop: 8 }}>
                      <a
                        href={
                          /^https?:\/\//i.test(application.portfolio_url)
                            ? application.portfolio_url
                            : `https://${application.portfolio_url}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#e85d3f",
                          textDecoration: "none",
                        }}
                      >
                        <span>Portfolio Link</span>
                        <ExternalLink style={{ width: 12, height: 12 }} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Right: Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, alignSelf: "center", flexShrink: 0 }}>
                  <Link
                    href={`/admin/creatives/${creative.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 18px",
                      borderRadius: 14,
                      fontSize: 13,
                      fontWeight: 800,
                      textDecoration: "none",
                      backgroundColor: isPending ? "#0b2d22" : "#f5ede5",
                      color: isPending ? "#ffffff" : "#0b2d22",
                      transition: "all .15s ease",
                      boxShadow: isPending ? "0 4px 12px rgba(11,45,34,0.18)" : "none",
                    }}
                  >
                    <span>{isPending ? "Review Application" : "View Application"}</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCreatives.length === 0 && (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px dashed #ded6ce",
              borderRadius: 20,
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🍑</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0b2d22", margin: "0 0 6px" }}>
              No creatives found under &quot;{currentTab.replaceAll("_", " ")}&quot;
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "#5f6964" }}>
              Try selecting another status tab above to view other applicants or approved creatives.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
