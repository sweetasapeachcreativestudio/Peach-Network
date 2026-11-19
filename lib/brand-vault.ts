import "server-only";
import { createAdminClient, isRealSupabaseEnv } from "@/lib/supabase/admin";
import { isApprovedProjectCollaborator } from "@/lib/collaborators";

export const BRAND_KINDS = ["logo", "color", "font", "photo", "guide", "other"] as const;

/**
 * Brand Vault assets are ONLY accessible to an assigned creative (or approved
 * project collaborator) while the mutual Design Contract is signed and active.
 * Access is closed before both parties sign (draft, matching, offer_sent) and
 * automatically revoked the moment the project is marked completed or cancelled.
 */
export const ACTIVE_CONTRACT_STATUSES = [
  "accepted",
  "in_progress",
  "waiting_on_client",
  "proof_uploaded",
  "revisions",
  "submitted",
  "approved",
] as const;

export function isSignedContractStatus(status?: string | null): boolean {
  return Boolean(status && (ACTIVE_CONTRACT_STATUSES as readonly string[]).includes(status));
}

export async function canReadBrandVault(
  userId: string,
  businessId: string,
  projectId?: string | null
) {
  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("owner_user_id")
    .eq("id", businessId)
    .maybeSingle();

  if (business?.owner_user_id === userId) return true;

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role === "admin") return true;
  if (!projectId) return false;

  const { data: project } = await admin
    .from("projects")
    .select("business_id,assigned_creative_id,status")
    .eq("id", projectId)
    .maybeSingle();

  if (
    !project ||
    project.business_id !== businessId ||
    !isSignedContractStatus(project.status)
  ) {
    return false;
  }

  if (project.assigned_creative_id) {
    const { data: creative } = await admin
      .from("creatives")
      .select("user_id")
      .eq("id", project.assigned_creative_id)
      .maybeSingle();

    if (creative?.user_id === userId) return true;
  }

  // Active signed collaborator on the active project
  if (await isApprovedProjectCollaborator(admin, projectId, userId, { requireSigned: true })) {
    return true;
  }

  // In preview/mock mode only, allow demo creative session (usr_creative_demo)
  // to access Brand Vault ONLY while the project contract is actively signed.
  if (!isRealSupabaseEnv() && userId === "usr_creative_demo") {
    return true;
  }

  return false;
}
