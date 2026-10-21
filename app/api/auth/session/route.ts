import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, role, provider, fullName, businessName } = body;

    const assignedRole = role === "creative" ? "creative" : "business";
    const user = {
      id: assignedRole === "creative" ? "usr_creative_demo" : "usr_business_demo",
      email: email || (assignedRole === "creative" ? "creative@peachnetwork.com" : "partner@peachnetwork.com"),
      app_metadata: { provider: provider || "google" },
      user_metadata: {
        full_name: fullName || (assignedRole === "creative" ? "Peach Creative" : "Peach Partner"),
        role: assignedRole,
        business_name: businessName || (assignedRole === "business" ? "Magic City Brands" : null),
      },
      aud: "authenticated",
      created_at: new Date().toISOString(),
    };

    const res = NextResponse.json({ success: true, user, role: assignedRole });

    // Set auth cookie with SameSite=None and Secure for iframe embedding
    const isProduction = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
    
    res.cookies.set("peach_session", JSON.stringify(user), {
      path: "/",
      httpOnly: false,
      sameSite: "none",
      secure: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    res.cookies.set("peach_role", assignedRole, {
      path: "/",
      httpOnly: false,
      sameSite: "none",
      secure: true,
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to establish session" },
      { status: 500 }
    );
  }
}
