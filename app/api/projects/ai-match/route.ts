import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rankDemoCreatives, type DemoCreative } from "@/lib/beta-match";
import { ai } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const { projectId, batchRefresh } = await request.json();
    const admin = createAdminClient();

    const { data: project } = await admin
      .from("projects")
      .select("id,title,description,category,business_id,due_at,revision_rounds,coin_amount")
      .eq("id", projectId)
      .single();

    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    const safeProject = project;

    const { data: business } = await admin
      .from("businesses")
      .select("owner_user_id")
      .eq("id", safeProject.business_id)
      .single();

    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (business?.owner_user_id !== user.id && profile?.role !== "admin") {
      return NextResponse.json({ error: "Project owner required." }, { status: 403 });
    }

    const [{ data: demos }, { data: realRows }] = await Promise.all([
      admin.from("demo_creatives").select("*").eq("available_for_projects", true),
      admin
        .from("creatives")
        .select(
          "id,user_id,primary_specialty,secondary_specialties,tools,industries,city,state,peach_level,bio,education,portfolio_url,remote,mentor_name,reliability_score,available_for_projects"
        )
        .eq("application_status", "approved")
        .eq("available_for_projects", true),
    ]);

    const realIds = (realRows ?? []).map((c: any) => c.id);
    const userIds = (realRows ?? []).map((c: any) => c.user_id);

    const [{ data: realNames }, { data: realWork }, { data: realCerts }] = await Promise.all([
      userIds.length
        ? admin.from("profiles").select("id,full_name,avatar_url").in("id", userIds)
        : Promise.resolve({ data: [] }),
      realIds.length
        ? admin
            .from("creative_featured_work")
            .select("creative_id,title,description,tags,industry,role_detail,tools,image_url,created_at")
            .in("creative_id", realIds)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
      realIds.length
        ? admin.from("creative_certifications").select("creative_id,title").in("creative_id", realIds)
        : Promise.resolve({ data: [] }),
    ]);

    const nameMap = new Map((realNames ?? []).map((p: any) => [p.id, p.full_name]));
    const avatarMap = new Map((realNames ?? []).map((p: any) => [p.id, p.avatar_url]));

    const real: DemoCreative[] = (realRows ?? []).map((c: any) => ({
      id: c.id,
      name: nameMap.get(c.user_id) || "Peach Creative",
      peach_level: c.peach_level || "seed",
      headline: c.primary_specialty || "Commercial Designer",
      city: c.city || "Birmingham",
      state: c.state || "AL",
      remote_available: c.remote !== false,
      specialties: [c.primary_specialty, ...(c.secondary_specialties ?? [])].filter(Boolean),
      tools: c.tools ?? [],
      industries: c.industries ?? [],
      bio: c.bio || "Vetted Peach commercial designer with local studio experience.",
      portfolio_highlights: (realWork ?? [])
        .filter((w: any) => w.creative_id === c.id)
        .map((w: any) => [w.title, w.industry, ...(w.tags ?? [])].filter(Boolean).join(" · ")),
      certifications: (realCerts ?? []).filter((x: any) => x.creative_id === c.id).map((x: any) => x.title),
      education: c.education || "",
      mentor_name: c.mentor_name,
      reliability_score: c.reliability_score ?? 100,
      available_for_projects: c.available_for_projects,
      demo_only: false,
    }));

    const pool = [...real, ...((demos ?? []) as DemoCreative[])];
    const fallback = rankDemoCreatives(
      `${safeProject.category} ${safeProject.title} ${safeProject.description ?? ""}`,
      pool
    );

    // Save shortlisted candidates (3 at a time)
    async function saveShortlist(matches: any[], mode: string) {
      const { data: old } = await admin
        .from("project_match_shortlists")
        .select("creative_id,batch_number")
        .eq("project_id", safeProject.id);

      const used = new Set((old ?? []).map((x: any) => x.creative_id));
      
      // Filter for creatives not yet presented, or recycle if all have been shown
      let fresh = matches.filter((m: any) => !used.has(m.id));
      if (!fresh.length) {
        fresh = matches;
      }

      const chosen = fresh.slice(0, 3);
      const batch = Math.max(0, ...(old ?? []).map((x: any) => x.batch_number || 1)) + 1;

      const rows = chosen.map((m: any) => ({
        project_id: safeProject.id,
        creative_id: m.id,
        match_score: Math.round(m.score || 85),
        match_reason: m.reason || "Strong alignment with project specifications and brand requirements.",
        batch_number: batch,
        status: "candidate",
      }));

      if (rows.length) {
        await admin.from("project_match_shortlists").insert(rows);
      }

      return NextResponse.json({ ok: true, mode, matches: chosen, batch });
    }

    if (!process.env.GEMINI_API_KEY) {
      return saveShortlist(fallback, "smart-beta");
    }

    try {
      const compactSource: DemoCreative[] = [
        ...fallback,
        ...pool.filter((d) => !fallback.some((f) => f.id === d.id)).slice(0, 8),
      ];

      const compact = compactSource.map((c) => ({
        id: c.id,
        name: c.name,
        level: c.peach_level,
        headline: c.headline,
        specialties: c.specialties,
        bio: c.bio,
        portfolio: c.portfolio_highlights,
        city: c.city,
        state: c.state,
      }));

      const prompt = `You are Peach Match AI, an expert creative director matching the best local designers for a client's commercial brief.
Rank the 3 most qualified creatives for this project. Weight verified portfolio work, specialty fit, location, and relevant experience.

PROJECT BRIEF:
Title: ${safeProject.title}
Category: ${safeProject.category}
Budget: ${safeProject.coin_amount} Coins ($${safeProject.coin_amount * 50} USD)
Description: ${safeProject.description || "Commercial design deliverable"}

AVAILABLE CREATIVES:
${JSON.stringify(compact, null, 2)}

Return ONLY a JSON array of the top 3 matches:
[
  { "id": "creative_id", "score": 96, "reason": "1-sentence reason why this creative is an ideal match for this specific brief" }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "[]");
      const byId = new Map(pool.map((c) => [c.id, c]));

      const aiMatches = (Array.isArray(parsed) ? parsed : parsed.matches || [])
        .map((m: any) => {
          const c = byId.get(m.id);
          return c
            ? {
                ...c,
                score: Math.max(70, Math.min(99, Number(m.score) || 85)),
                reason: String(m.reason || "Strong portfolio and specialty fit for this project."),
              }
            : null;
        })
        .filter(Boolean)
        .slice(0, 3);

      if (aiMatches.length > 0) {
        return saveShortlist(aiMatches, "gemini-ai");
      }
    } catch (aiErr) {
      console.error("Gemini Match AI error:", aiErr);
    }

    return saveShortlist(fallback, "smart-beta");
  } catch (error: any) {
    console.error("Peach Match POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to find matches." }, { status: 500 });
  }
}
