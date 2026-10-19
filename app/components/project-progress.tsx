const stages = [
  { key: "matched", label: "Matched" },
  { key: "accepted", label: "Accepted" },
  { key: "in_progress", label: "Creating" },
  { key: "proof_uploaded", label: "Proof" },
  { key: "revisions", label: "Revisions" },
  { key: "approved", label: "Approved" },
  { key: "completed", label: "Complete" },
];

const statusIndex: Record<string, number> = {
  draft: 0,
  matching: 0,
  offer_sent: 0,
  accepted: 1,
  in_progress: 2,
  waiting_on_client: 2,
  proof_uploaded: 3,
  revisions: 4,
  submitted: 5,
  approved: 5,
  completed: 6,
  cancel_requested: 2,
  dispute: 2,
  dispute_review: 2,
  cancelled: 0,
};

export function projectPercent(status: string) {
  const idx = statusIndex[status] ?? 0;
  return [12, 24, 48, 72, 84, 94, 100][idx];
}

export function ProjectProgress({ status, compact = false }: { status: string; compact?: boolean }) {
  const current = statusIndex[status] ?? 0;
  return (
    <div className={`progress-system ${compact ? "compact" : ""}`}>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${(current / (stages.length - 1)) * 100}%` }} />
      </div>
      <div className="progress-steps">
        {stages.map((stage, index) => (
          <div key={stage.key} className={`progress-step ${index <= current ? "done" : ""} ${index === current ? "current" : ""}`}>
            <span className="progress-node" />
            {!compact && <span>{stage.label}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
