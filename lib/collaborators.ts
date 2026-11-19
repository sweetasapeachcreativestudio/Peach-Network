import "server-only";
import { isRealSupabaseEnv } from "@/lib/supabase/admin";

export interface CollaboratorRecord {
  id: string;
  project_id: string;
  specialty: string;
  coins: number;
  usd_amount: number;
  note: string;
  status: "pending" | "approved_awaiting_signature" | "active" | "declined";
  creative_id: string | null;
  creative_name: string | null;
  creative_avatar?: string | null;
  creative_hub?: string | null;
  creative_user_id?: string | null;
  requested_by: string;
  requested_by_name?: string;
  requested_at: string;
  resolved_at?: string | null;
  signed_at?: string | null;
  decline_reason?: string | null;
}

export interface LinkedProjectSummary {
  project_id: string;
  title: string;
  category: string;
  creative_id?: string | null;
  creative_name?: string | null;
  coins: number;
}

export interface ProjectPodInfo {
  podSupervision: boolean;
  combinedCoins: number;
  linkedProjects: LinkedProjectSummary[];
}

export async function getProjectCollaboratorsAndPod(
  admin: any,
  projectId: string
): Promise<{ collaborators: CollaboratorRecord[]; podInfo: ProjectPodInfo | null }> {
  const { data: logs } = await admin
    .from("audit_log")
    .select("id,actor_user_id,action,metadata,created_at")
    .eq("entity_id", projectId)
    .in("action", [
      "collaborator_requested",
      "collaborator_approved",
      "collaborator_declined",
      "collaborator_contract_signed",
      "collaborator_contract_declined",
      "project_linked_pod",
    ])
    .order("created_at", { ascending: true });

  const collabMap = new Map<string, CollaboratorRecord>();
  let podInfo: ProjectPodInfo | null = null;

  for (const log of logs ?? []) {
    const meta = log.metadata || {};

    if (log.action === "project_linked_pod") {
      podInfo = {
        podSupervision: Boolean(meta.pod_supervision),
        combinedCoins: Number(meta.combined_coins || 0),
        linkedProjects: Array.isArray(meta.linked_projects) ? meta.linked_projects : [],
      };
      continue;
    }

    const reqId = meta.collaborator_request_id || log.id;
    if (log.action === "collaborator_requested") {
      collabMap.set(reqId, {
        id: reqId,
        project_id: projectId,
        specialty: meta.specialty || "Creative Specialist",
        coins: Number(meta.coins || 2),
        usd_amount: Number(meta.usd_amount || (meta.coins || 2) * 50),
        note: meta.note || "",
        status: "pending",
        creative_id: meta.creative_id || null,
        creative_name: meta.creative_name || null,
        creative_avatar: meta.creative_avatar || null,
        creative_hub: meta.creative_hub || null,
        creative_user_id: meta.creative_user_id || null,
        requested_by: meta.requested_by || log.actor_user_id,
        requested_by_name: meta.requested_by_name || "Lead Creative",
        requested_at: meta.requested_at || log.created_at,
      });
    } else if (log.action === "collaborator_approved") {
      const existing = collabMap.get(reqId);
      if (existing) {
        collabMap.set(reqId, {
          ...existing,
          status: "approved_awaiting_signature",
          creative_id: meta.creative_id || existing.creative_id,
          creative_name: meta.creative_name || existing.creative_name,
          creative_avatar: meta.creative_avatar || existing.creative_avatar,
          creative_hub: meta.creative_hub || existing.creative_hub,
          creative_user_id: meta.creative_user_id || existing.creative_user_id,
          resolved_at: meta.resolved_at || log.created_at,
        });
      }
    } else if (log.action === "collaborator_declined") {
      const existing = collabMap.get(reqId);
      if (existing) {
        collabMap.set(reqId, {
          ...existing,
          status: "declined",
          resolved_at: meta.resolved_at || log.created_at,
          decline_reason: meta.decline_reason || "Declined by business owner.",
        });
      }
    } else if (log.action === "collaborator_contract_signed") {
      const existing = collabMap.get(reqId);
      if (existing) {
        collabMap.set(reqId, {
          ...existing,
          status: "active",
          signed_at: meta.signed_at || log.created_at,
        });
      }
    } else if (log.action === "collaborator_contract_declined") {
      const existing = collabMap.get(reqId);
      if (existing) {
        collabMap.set(reqId, {
          ...existing,
          status: "declined",
          resolved_at: meta.declined_at || log.created_at,
          decline_reason: meta.decline_reason || "Invited creative declined collaboration.",
        });
      }
    }
  }

  return {
    collaborators: Array.from(collabMap.values()).reverse(),
    podInfo,
  };
}

export async function isApprovedProjectCollaborator(
  admin: any,
  projectId: string,
  userId: string,
  options?: { requireSigned?: boolean }
): Promise<boolean> {
  const { collaborators } = await getProjectCollaboratorsAndPod(admin, projectId);
  const participating = collaborators.filter((c) =>
    options?.requireSigned
      ? c.status === "active"
      : c.status === "approved_awaiting_signature" || c.status === "active"
  );
  if (participating.length === 0) return false;

  if (participating.some((c) => c.creative_user_id === userId)) {
    return true;
  }

  if (!isRealSupabaseEnv() && userId === "usr_creative_demo") {
    return true;
  }

  return false;
}

export async function getCollaboratorProjectIdsForCreative(
  admin: any,
  creativeId: string,
  userId: string
): Promise<string[]> {
  const { data: logs } = await admin
    .from("audit_log")
    .select("entity_id,action,metadata")
    .in("action", [
      "collaborator_approved",
      "collaborator_contract_signed",
      "collaborator_contract_declined",
    ]);

  const activeByProject = new Map<string, boolean>();
  for (const log of logs ?? []) {
    const meta = log.metadata || {};
    const pId = log.entity_id;
    if (!pId) continue;

    const matchesCreative =
      meta.creative_id === creativeId ||
      meta.creative_user_id === userId ||
      (!isRealSupabaseEnv() && userId === "usr_creative_demo");

    if (!matchesCreative) continue;

    if (log.action === "collaborator_approved" || log.action === "collaborator_contract_signed") {
      activeByProject.set(pId, true);
    } else if (log.action === "collaborator_contract_declined") {
      activeByProject.set(pId, false);
    }
  }

  return Array.from(activeByProject.entries())
    .filter(([, isActive]) => isActive)
    .map(([pId]) => pId);
}
