import { NextResponse } from "next/server";
import { getMockStorageFile } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const bucket = url.searchParams.get("bucket") || "";
  const path = url.searchParams.get("path") || "";

  if (!bucket || !path) {
    return NextResponse.json({ error: "Missing bucket or path." }, { status: 400 });
  }

  const entry = getMockStorageFile(bucket, path);
  if (entry) {
    return new NextResponse(new Uint8Array(entry.buffer), {
      status: 200,
      headers: {
        "Content-Type": entry.contentType || "application/octet-stream",
        "Cache-Control": "private, max-age=300",
      },
    });
  }

  // Fallback placeholder SVG for seeded demo entries that have no stored binary
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="48" fill="#FFF6EE"/>
    <circle cx="256" cy="256" r="140" fill="#FF7350"/>
    <text x="256" y="280" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="96" fill="#FFFFFF">P</text>
  </svg>`;
  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
}
