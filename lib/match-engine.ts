export type Level = "seed" | "sapling" | "tree" | "blossom" | "root";

const levelRank: Record<Level, number> = {
  seed: 1,
  sapling: 2,
  tree: 3,
  blossom: 4,
  root: 5
};

export type MatchCreative = {
  id: string;
  primary_specialty: string | null;
  secondary_specialty?: string | null;
  peach_level: Level | null;
  city?: string | null;
  state?: string | null;
  reliability_score?: number | string | null;
  available_for_projects: boolean;
  accepts_remote?: boolean;
  active_project_count?: number;
  max_active_projects?: number;
};

export type MatchProject = {
  recommended_specialty?: string | null;
  minimum_level?: Level | null;
  requires_in_person?: boolean;
  city?: string | null;
  state?: string | null;
};

export function scoreCreativeForProject(
  creative: MatchCreative,
  project: MatchProject
) {
  let score = 0;
  const reasons: string[] = [];

  if (!creative.available_for_projects) {
    return { eligible: false, score: 0, reasons: ["Not currently available"] };
  }

  const creativeLevel = creative.peach_level ? levelRank[creative.peach_level] : 0;
  const minimumLevel = project.minimum_level ? levelRank[project.minimum_level] : 1;

  if (creativeLevel < minimumLevel) {
    return { eligible: false, score: 0, reasons: ["Peach Level below project minimum"] };
  }

  const needed = (project.recommended_specialty ?? "").trim().toLowerCase();
  const primary = (creative.primary_specialty ?? "").trim().toLowerCase();
  const secondary = (creative.secondary_specialty ?? "").trim().toLowerCase();

  if (needed && primary === needed) {
    score += 45;
    reasons.push("Primary specialty matches");
  } else if (needed && secondary === needed) {
    score += 30;
    reasons.push("Secondary specialty matches");
  } else if (!needed) {
    score += 20;
    reasons.push("No specialty restriction");
  } else {
    score += 8;
    reasons.push("Adjacent specialty only");
  }

  if (creativeLevel === minimumLevel) {
    score += 18;
    reasons.push("Meets Peach Level");
  } else if (creativeLevel > minimumLevel) {
    score += 22;
    reasons.push("Exceeds Peach Level");
  }

  const reliability = Number(creative.reliability_score ?? 100);
  const reliabilityPoints = Math.max(0, Math.min(20, (reliability / 100) * 20));
  score += reliabilityPoints;
  reasons.push(`Reliability ${Math.round(reliability)}%`);

  const active = creative.active_project_count ?? 0;
  const max = creative.max_active_projects ?? 3;
  if (active >= max) {
    score -= 25;
    reasons.push("At project capacity");
  } else if (active === 0) {
    score += 8;
    reasons.push("High availability");
  } else {
    score += 4;
    reasons.push("Available capacity");
  }

  if (project.requires_in_person) {
    const sameCity =
      creative.city?.trim().toLowerCase() === project.city?.trim().toLowerCase();
    const sameState =
      creative.state?.trim().toLowerCase() === project.state?.trim().toLowerCase();

    if (sameCity) {
      score += 15;
      reasons.push("Local to project city");
    } else if (sameState) {
      score += 8;
      reasons.push("In project state");
    } else {
      return { eligible: false, score: 0, reasons: ["In-person location mismatch"] };
    }
  } else if (creative.accepts_remote !== false) {
    score += 5;
    reasons.push("Accepts remote work");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    eligible: score >= 40,
    score,
    reasons
  };
}
