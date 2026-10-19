import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const BRAND_KINDS = ["logo", "color", "font", "photo", "guide", "other"] as const;
export async function canReadBrandVault(userId: string, businessId: string, projectId?: string | null) {
  const admin = createAdminClient();
  const {data:business} = await admin.from("businesses").select("owner_user_id").eq("id",businessId).maybeSingle();
  if (business?.owner_user_id === userId) return true;
  const {data:profile} = await admin.from("profiles").select("role").eq("id",userId).maybeSingle();
  if (profile?.role === "admin") return true;
  if (!projectId) return false;
  const {data:project} = await admin.from("projects").select("business_id,assigned_creative_id,status").eq("id",projectId).maybeSingle();
  if (!project || project.business_id !== businessId || !project.assigned_creative_id || ["completed","cancelled"].includes(project.status)) return false;
  const {data:creative} = await admin.from("creatives").select("user_id").eq("id",project.assigned_creative_id).maybeSingle();
  return creative?.user_id === userId;
}
