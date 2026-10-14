import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const personaDetails: Record<string, { role: string; business: string }> = {
  maya: { role: "website designer", business: "Bloom & Root Plant Shop" },
  jordan: { role: "graphic designer", business: "Fresh Press Juice Bar" },
  alex: { role: "logo designer", business: "Golden Hour Candle Co." },
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to try live Peach AI." }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      error: "Live AI isn't configured yet. Guided demos work now; add OPENAI_API_KEY to the Vercel environment to enable live responses.",
    }, { status: 503 });
  }

  let body: { personaId?: string; prompt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please send a valid project prompt." }, { status: 400 });
  }

  const persona = body.personaId ? personaDetails[body.personaId] : undefined;
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!persona || !prompt || prompt.length > 1200) {
    return NextResponse.json({ error: "Choose a demo persona and enter a prompt under 1,200 characters." }, { status: 400 });
  }

  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.6,
        max_tokens: 650,
        messages: [
          {
            role: "system",
            content: "You are Peach AI, a practical creative-project planning assistant inside Peach Network. Help turn the user's fictional demo request into a clear, useful brief for a creative professional. Return plain text with concise headings: Goal, Audience, Deliverables, Creative direction, Questions to confirm, Next step. Do not claim you created artwork, published a website, or took an external action. Never request passwords, payment details, or sensitive personal data. This is a demo; do not create or imply a real project.",
          },
          {
            role: "user",
            content: `Demo persona: ${persona.role}. Fictional client: ${persona.business}.\nClient request: ${prompt}`,
          },
        ],
      }),
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Peach AI couldn't generate a response. Please try again in a moment." }, { status: 502 });
    }
    const payload = await upstream.json();
    const answer = payload?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json({ error: "Peach AI returned an empty response. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ answer: answer.trim() });
  } catch {
    return NextResponse.json({ error: "Peach AI is temporarily unavailable. Please try again." }, { status: 502 });
  }
}
