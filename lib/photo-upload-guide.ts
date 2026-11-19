export type PhotoUploadSlot = "logo" | "showcase" | "avatar";

export const PHOTO_MAX_BYTES = 15 * 1024 * 1024; // 15 MB
export const PHOTO_MAX_MB = 15;

export const ALLOWED_LOGO_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "svg"] as const;
export const ALLOWED_RASTER_EXTENSIONS = ["png", "jpg", "jpeg", "webp"] as const;

export const ALLOWED_LOGO_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/webp",
  "image/svg+xml",
]);

export const ALLOWED_RASTER_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/webp",
]);

export interface PhotoValidationResult {
  ok: boolean;
  error?: string;
  extension: string;
  contentType: string;
}

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
};

export function getFileExtension(name: string): string {
  const parts = String(name || "").toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
}

export function validatePhotoFileMeta(
  file: { name: string; type?: string; size: number },
  slot: PhotoUploadSlot
): PhotoValidationResult {
  const ext = getFileExtension(file.name);
  const rawType = String(file.type || "").toLowerCase().trim();

  if (!file.size || file.size <= 0) {
    return {
      ok: false,
      extension: ext,
      contentType: rawType || "application/octet-stream",
      error: "This file appears to be empty (0 bytes). Please choose a valid image file.",
    };
  }

  if (file.size > PHOTO_MAX_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      ok: false,
      extension: ext,
      contentType: rawType || "application/octet-stream",
      error: `File is ${sizeMb} MB, which exceeds the ${PHOTO_MAX_MB} MB limit. Please compress or resize it before uploading.`,
    };
  }

  // Helpful rejection messages for common unsupported formats
  if (ext === "heic" || ext === "heif" || rawType.includes("heic") || rawType.includes("heif")) {
    return {
      ok: false,
      extension: ext,
      contentType: rawType,
      error:
        "HEIC/HEIF iPhone files cannot be uploaded directly. Please save/export as JPG or PNG (or set iPhone Camera > Formats > Most Compatible).",
    };
  }

  if (["raw", "dng", "cr2", "cr3", "nef", "arw", "orf", "rw2", "tiff", "tif", "psd"].includes(ext)) {
    return {
      ok: false,
      extension: ext,
      contentType: rawType,
      error: `${ext.toUpperCase()} camera/working files cannot be uploaded here. Please export as JPG, PNG, or WEBP.`,
    };
  }

  if (["gif", "mp4", "mov", "avi", "webm", "m4v"].includes(ext) || rawType.startsWith("video/") || rawType === "image/gif") {
    return {
      ok: false,
      extension: ext,
      contentType: rawType,
      error: "Animated GIFs and videos cannot be uploaded to photo slots. Please choose a still PNG, JPG, or WEBP image.",
    };
  }

  if (["pdf", "ai", "eps", "zip", "doc", "docx", "otf", "ttf", "woff", "woff2", "ase"].includes(ext)) {
    return {
      ok: false,
      extension: ext,
      contentType: rawType,
      error: `${ext.toUpperCase()} documents and source files belong in Brand Vault—please upload a PNG, JPG, or WEBP photo here.`,
    };
  }

  const allowSvg = slot === "logo";
  if ((ext === "svg" || rawType === "image/svg+xml") && !allowSvg) {
    return {
      ok: false,
      extension: ext,
      contentType: rawType,
      error: "SVG vector files are accepted for Business Logos only. Please upload a PNG, JPG, or WEBP photo.",
    };
  }

  const allowedExts: readonly string[] = allowSvg ? ALLOWED_LOGO_EXTENSIONS : ALLOWED_RASTER_EXTENSIONS;
  const allowedMimes = allowSvg ? ALLOWED_LOGO_MIME_TYPES : ALLOWED_RASTER_MIME_TYPES;

  const extOk = Boolean(ext && allowedExts.includes(ext));
  const mimeOk = Boolean(rawType && allowedMimes.has(rawType));

  if (!extOk && !mimeOk) {
    return {
      ok: false,
      extension: ext,
      contentType: rawType,
      error: allowSvg
        ? "Unsupported file format. Profile Logos accept PNG, JPG/JPEG, WEBP, or SVG files up to 15 MB."
        : "Unsupported file format. Photo slots accept PNG, JPG/JPEG, or WEBP images up to 15 MB.",
    };
  }

  const resolvedMime =
    (rawType && allowedMimes.has(rawType) ? rawType : MIME_BY_EXT[ext]) ||
    (allowSvg && ext === "svg" ? "image/svg+xml" : "image/jpeg");

  return {
    ok: true,
    extension: ext || (resolvedMime === "image/png" ? "png" : resolvedMime === "image/webp" ? "webp" : "jpg"),
    contentType: resolvedMime,
  };
}

export const PHOTO_GUIDE_SPEC = {
  maxMb: PHOTO_MAX_MB,
  maxShowcaseCount: 6,
  logoAllowed: [
    "Formats: PNG (transparent recommended), JPG/JPEG, WEBP, or SVG",
    "Size & Ratio: Square 1:1, at least 512 × 512 px recommended",
    `File Limit: Up to ${PHOTO_MAX_MB} MB per file`,
    "Best for: Your studio logo, shop sign mark, or owner headshot",
  ],
  showcaseAllowed: [
    "Formats: PNG, JPG/JPEG, or WEBP",
    "Size & Ratio: Landscape (4:3 / 16:9) or Square (1:1), 1000 × 750 px+",
    `Count & Limit: Up to 6 photos, max ${PHOTO_MAX_MB} MB each`,
    "Best for: Storefront, interior vibe, signature dishes, or product packaging",
  ],
  notAllowed: [
    "HEIC / HEIF iPhone raw files (export as JPG/PNG or switch Camera format to Most Compatible)",
    "RAW, DNG, TIFF, or layered PSD camera/editing files",
    "Animated GIFs or video clips (MP4, MOV, WebM)",
    "PDFs, Word docs, AI/EPS, fonts, or ZIP archives (upload those inside Brand Vault instead)",
    "SVG files inside Showcase Photo or personal portrait slots (SVG is for Business Logos only)",
    "Tiny screenshots under 300 px, watermarked stock photos, or imagery you do not own rights to",
  ],
} as const;
