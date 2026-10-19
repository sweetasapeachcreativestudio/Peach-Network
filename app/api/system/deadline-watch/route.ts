import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request:Request){
  if(request.headers.get("x-peach-cron-secret")!==process.env.PEACH_CRON_SECRET)
    return NextResponse.json({error:"Unauthorized."},{status:401});

  const admin=createAdminClient();
  const now=Date.now();
  const threeDays=new Date(now+72*60*60*1000).toISOString();
  const oneDay=new Date(now+24*60*60*1000).toISOString();
  const stale=new Date(now-48*60*60*1000).toISOString();

  const {data:projects}=await admin.from("projects")
    .select("id,title,due_at,last_progress_at,status,assigned_creative_id,business_id")
    .in("status",["accepted","in_progress","proof_uploaded","revisions"])
    .lte("due_at",threeDays);

  let alerts=0;
  for(const p of projects??[]){
    const due=new Date(p.due_at).getTime();
    let text:string|null=null;
    if(due<=now) text="Deadline alert: project is overdue.";
    else if(p.due_at<=oneDay) text="Deadline alert: less than 24 hours remain.";
    else text="Deadline reminder: 3 days or less remain.";

    if(!p.last_progress_at || p.last_progress_at<=stale)
      text += " No progress check-in has been recorded in the last 48 hours.";

    await admin.from("project_messages").insert({
      project_id:p.id,
      sender_user_id:(await admin.from("profiles").select("id").eq("role","admin").limit(1).single()).data?.id,
      is_system_event:true,body:text
    });
    alerts++;
  }
  return NextResponse.json({ok:true,alerts});
}
