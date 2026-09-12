import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { scoreCreativeForProject } from "@/lib/match-engine";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const { projectId } = await request.json();
  const { data: project } = await admin.from("projects").select("id,title,category,status,assigned_creative_id").eq("id", projectId).single();
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const { data: creatives, error } = await admin.from("creatives")
    .select("id,user_id,primary_specialty,peach_level,city,state,reliability_score,available_for_projects")
    .eq("application_status", "approved").eq("available_for_projects", true);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: activeProjects } = await admin.from("projects").select("assigned_creative_id").in("status", ["accepted","in_progress","waiting_on_client","proof_uploaded","revisions","submitted"]);
  const counts = new Map<string, number>();
  for (const p of activeProjects ?? []) if (p.assigned_creative_id) counts.set(p.assigned_creative_id, (counts.get(p.assigned_creative_id) ?? 0) + 1);

  const userIds=(creatives??[]).map((c:any)=>c.user_id);
  const {data:profiles}=userIds.length?await admin.from("profiles").select("id,full_name,email").in("id",userIds):{data:[]} as any;
  const profileMap=new Map<string,any>();(profiles??[]).forEach((p:any)=>profileMap.set(p.id,p));

  const ranked=(creatives??[]).map((creative:any)=>{
    const result=scoreCreativeForProject({...creative,active_project_count:counts.get(creative.id)??0},{recommended_specialty:project.category,minimum_level:"seed"} as any);
    const p=profileMap.get(creative.user_id);
    return {creativeId:creative.id,name:p?.full_name??"Creative",email:p?.email??null,level:creative.peach_level,primarySpecialty:creative.primary_specialty,city:creative.city,state:creative.state,reliability:Number(creative.reliability_score??100),activeProjects:counts.get(creative.id)??0,score:result.score,eligible:result.eligible,reasons:result.reasons};
  }).filter((x:any)=>x.eligible).sort((a:any,b:any)=>b.score-a.score);

  return NextResponse.json({ project, ranked });
}
