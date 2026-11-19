import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, ensureStorageBucket } from "@/lib/supabase/admin";
import { BRAND_KINDS } from "@/lib/brand-vault";
import { validatePhotoFileMeta } from "@/lib/photo-upload-guide";

const VAULT_FILE_REGEX =
  /\.(png|jpg|jpeg|webp|svg|pdf|ai|eps|zip|otf|ttf|woff2?|ase|txt|docx)$/i;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!business) return NextResponse.json({ error: "Business account required." }, { status: 403 });

  const reqContentType = request.headers.get("content-type") || "";

  // 1) Direct multipart/form-data server-side upload (reliable across real Supabase & preview mode)
  if (reqContentType.includes("multipart/form-data")) {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Could not read uploaded file." }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please select a file to upload." }, { status: 400 });
    }

    const kind = String(formData.get("kind") ?? "other").trim();
    const rawLabel = String(formData.get("label") ?? "").trim();
    const fallbackLabel = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
    const label = (rawLabel || fallbackLabel || "Uploaded Asset").slice(0, 120);
    const notes = String(formData.get("notes") ?? "").trim().slice(0, 2000) || null;
    const value = String(formData.get("value") ?? "").trim().slice(0, 2000) || null;
    const existingId = String(formData.get("id") ?? "").trim();

    if (!BRAND_KINDS.includes(kind as (typeof BRAND_KINDS)[number])) {
      return NextResponse.json({ error: "Invalid asset category." }, { status: 400 });
    }

    let uploadContentType = file.type || "application/octet-stream";

    if (kind === "logo" || kind === "photo") {
      const check = validatePhotoFileMeta(file, kind === "logo" ? "logo" : "showcase");
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
      uploadContentType = check.contentType;
    } else {
      const safeExtCheck = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      if (!VAULT_FILE_REGEX.test(safeExtCheck)) {
        return NextResponse.json(
          {
            error:
              "Unsupported Brand Vault file. Upload PNG, JPG, WEBP, SVG, PDF, AI, EPS, ZIP, OTF, TTF, WOFF/WOFF2, ASE, TXT, or DOCX.",
          },
          { status: 400 }
        );
      }
      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Brand Vault files must be 25 MB or smaller." },
          { status: 400 }
        );
      }
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-150) || "upload.png";
    const storagePath = `${business.id}/${crypto.randomUUID()}/${safeName}`;

    await ensureStorageBucket(admin, "brand-vault", false);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadErr } = await admin.storage
      .from("brand-vault")
      .upload(storagePath, fileBuffer, {
        contentType: uploadContentType,
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json(
        { error: uploadErr.message || "Storage upload failed. Please try again." },
        { status: 500 }
      );
    }

    if (existingId) {
      const { data: old } = await admin
        .from("business_brand_assets")
        .select("id,storage_path")
        .eq("id", existingId)
        .eq("business_id", business.id)
        .maybeSingle();

      if (!old) {
        return NextResponse.json({ error: "Asset not found." }, { status: 404 });
      }

      const { error: updErr } = await admin
        .from("business_brand_assets")
        .update({
          label,
          kind,
          value,
          notes,
          storage_path: storagePath,
          original_name: file.name,
          size_bytes: file.size,
          updated_at: new Date().toISOString(),
        })
        .eq("id", old.id)
        .eq("business_id", business.id);

      if (updErr) {
        return NextResponse.json({ error: "Could not replace asset." }, { status: 500 });
      }

      if (old.storage_path && old.storage_path !== storagePath) {
        await admin.storage.from("brand-vault").remove([old.storage_path]);
      }

      return NextResponse.json({
        ok: true,
        id: old.id,
        storage_path: storagePath,
        original_name: file.name,
        inlineUrl: `/api/brand-vault/${old.id}?inline=1`,
      });
    }

    const { data: inserted, error: insErr } = await admin
      .from("business_brand_assets")
      .insert({
        business_id: business.id,
        label,
        kind,
        value,
        notes,
        storage_path: storagePath,
        original_name: file.name,
        size_bytes: file.size,
      })
      .select("id")
      .single();

    if (insErr || !inserted?.id) {
      return NextResponse.json(
        { error: "Could not save your uploaded asset. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: inserted.id,
      storage_path: storagePath,
      original_name: file.name,
      inlineUrl: `/api/brand-vault/${inserted.id}?inline=1`,
    });
  }

  // 2) JSON handler (for text/color assets, social handles, or legacy signed-upload preparation)
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.action === "upload") {
    const name = String(body.name ?? "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(-150);
    if (!VAULT_FILE_REGEX.test(name)) {
      return NextResponse.json(
        { error: "Choose a logo, image, PDF, font, color palette, document or ZIP file." },
        { status: 400 }
      );
    }
    await ensureStorageBucket(admin, "brand-vault", false);
    const path = `${business.id}/${crypto.randomUUID()}/${name}`;
    const { data, error } = await admin.storage.from("brand-vault").createSignedUploadUrl(path);
    if (error || !data) {
      return NextResponse.json(
        { error: "Could not prepare upload. Please try again." },
        { status: 500 }
      );
    }
    return NextResponse.json({ path, token: data.token });
  }

  const label = String(body.label ?? "").trim().slice(0, 120);
  const kind = String(body.kind ?? "");
  if (!label || !BRAND_KINDS.includes(kind as (typeof BRAND_KINDS)[number])) {
    return NextResponse.json({ error: "Add an asset name and category." }, { status: 400 });
  }
  const value = String(body.value ?? "").trim().slice(0, 2000);
  if (kind === "color" && !/^#[0-9a-f]{6}$/i.test(value)) {
    return NextResponse.json(
      { error: "Use a six-digit HEX color such as #E85D3F." },
      { status: 400 }
    );
  }

  let path: string | null = null;
  let originalName: string | null = null;
  let size = 0;

  if (body.path) {
    path = String(body.path);
    if (!new RegExp(`^${business.id}/[0-9a-f-]{36}/[a-zA-Z0-9._-]+$`).test(path)) {
      return NextResponse.json({ error: "Invalid asset upload." }, { status: 400 });
    }
    originalName = path.split("/").pop()!;
    const { data, error } = await admin.storage
      .from("brand-vault")
      .list(path.slice(0, path.lastIndexOf("/")), { search: originalName });
    const file = data?.find((f: any) => f.name === originalName);
    if (error || !file) {
      return NextResponse.json(
        { error: "Upload not found. Please upload the file again." },
        { status: 400 }
      );
    }
    size = Number(file.metadata?.size ?? 0);
    if (size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "Files must be 25 MB or smaller." }, { status: 400 });
    }
    const { data: existing } = await admin
      .from("business_brand_assets")
      .select("id")
      .eq("storage_path", path)
      .maybeSingle();
    if (existing) return NextResponse.json({ ok: true, id: existing.id });
  }

  if (!path && !value) {
    return NextResponse.json(
      { error: "Upload a file or add a color, font name or reference." },
      { status: 400 }
    );
  }

  if (body.id) {
    const { data: old } = await admin
      .from("business_brand_assets")
      .select("id,storage_path")
      .eq("id", body.id)
      .eq("business_id", business.id)
      .maybeSingle();
    if (!old) return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    const { error } = await admin
      .from("business_brand_assets")
      .update({
        label,
        kind,
        value: value || null,
        notes: String(body.notes ?? "").trim().slice(0, 2000) || null,
        storage_path: path,
        original_name: originalName,
        size_bytes: size,
        updated_at: new Date().toISOString(),
      })
      .eq("id", old.id)
      .eq("business_id", business.id);
    if (error) return NextResponse.json({ error: "Could not replace asset." }, { status: 500 });
    if (old.storage_path && old.storage_path !== path) {
      await admin.storage.from("brand-vault").remove([old.storage_path]);
    }
    return NextResponse.json({ ok: true, id: old.id });
  }

  const { data, error } = await admin
    .from("business_brand_assets")
    .insert({
      business_id: business.id,
      label,
      kind,
      value: value || null,
      notes: String(body.notes ?? "").trim().slice(0, 2000) || null,
      storage_path: path,
      original_name: originalName,
      size_bytes: size,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Could not save your asset. Please try again." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, id: data.id });
}
