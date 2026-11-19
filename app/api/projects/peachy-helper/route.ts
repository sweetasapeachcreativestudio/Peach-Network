import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeGenerateContent } from "@/lib/gemini";

function fallbackHelperAnswer(question: string, projectTitle: string, status: string, category: string): string {
  const q = question.toLowerCase();
  if (q.includes("brief") || q.includes("write") || q.includes("include")) {
    return `For **${projectTitle}** (${category}), a great Creative Brief covers 3 quick things:\n• **Your goal:** Who is seeing this and what action should they take?\n• **Must-have text or specs:** Names, dates, menu items, dimensions, or URLs.\n• **Visual vibe:** Any colors, fonts, or reference images you love.\n\nOnce you're happy with it, click **Lock & Send Brief to Creative** so both sides can sign!`;
  }
  if (q.includes("sign") || q.includes("contract") || q.includes("vault")) {
    return `Here is how signing and Brand Vault access work on Peach:\n1. You sign the **Business Owner** side of the Design Contract.\n2. Your creative reviews the brief and clicks **Sign & Accept** (or **Decline** for a full Coin refund).\n3. Once **both signatures** are complete, live chat, uploads, and your **Brand Vault** automatically unlock for your creative — and Brand Vault access closes automatically the moment the project is marked completed.`;
  }
  if (q.includes("refund") || q.includes("decline") || q.includes("coin")) {
    return `Your Coins are covered by Peach Project Protection! If your assigned creative declines the brief, 100% of your reserved Coins are automatically refunded to your Peach Wallet so you can pick another creative right away.`;
  }
  return `You're currently in the **${status.replaceAll("_", " ")}** stage for **${projectTitle}**. ${
    status === "draft"
      ? "Review or edit your Creative Brief above (or let me generate one for you), attach any reference files, then click **Lock & Send Brief to Creative**."
      : status === "offer_sent"
      ? "Make sure your Business Owner signature is signed on the Design Contract. As soon as your creative signs too, the full Active Workspace and Brand Vault unlock automatically!"
      : "Your workspace is active! You can message your creative, track deliverables, review proofs, and mark the project completed once final deliverables look great."
  }`;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const { projectId, message, currentBrief } = await request.json();
    if (!projectId || !message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("id,title,category,status,coin_amount,description")
      .eq("id", projectId)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const prompt = `You are Peachy™, a friendly, concise Creative Director AI embedded inside a Peach Network Project Workspace helping a non-technical business owner.
Answer their question clearly in 2-5 short sentences or clean bullet points. Never use confusing agency jargon.

Project: ${project.title} (${project.category}, ${project.coin_amount} Peach Coins, Status: ${project.status})
Current Brief Excerpt: ${(currentBrief || project.description || "").slice(0, 700)}

Lifecycle Rules to keep accurate:
- Brief must be locked & sent before signatures.
- Two-sided Design Contract: Business owner signs ONLY their own side; Creative reviews and clicks Sign & Accept or Decline (which auto-refunds Coins).
- Active Workspace (live chat, uploads, staging, add-ons) & Brand Vault read access unlock ONLY after BOTH signatures complete, and Brand Vault closes automatically when marked Completed.

Business Owner's Question: ${message.trim()}`;

    const aiReply = await safeGenerateContent({
      contents: prompt,
      timeoutMs: 12000,
    });

    const answer =
      aiReply?.trim() ||
      fallbackHelperAnswer(message.trim(), project.title, project.status, project.category);

    return NextResponse.json({ ok: true, answer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Peachy helper unavailable." }, { status: 500 });
  }
}
