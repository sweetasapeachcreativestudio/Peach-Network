export interface ReadinessCheckItem {
  key: string;
  label: string;
  completed: boolean;
  points: number;
  detail: string;
  href: string;
  actionLabel: string;
}

export interface BusinessBrandReadinessResult {
  score: number;
  completedCount: number;
  totalCount: number;
  checks: ReadinessCheckItem[];
  missingKeys: string[];
  missingLabels: string[];
  suggestedServices: Array<{
    serviceKey: string;
    serviceName: string;
    packageTitle: string;
    category: string;
    coins: number;
    usd: number;
    estimatedTurnaround: string;
    reason: string;
    deliverables: string[];
  }>;
}

export interface CreativeBusinessReadinessResult {
  score: number;
  completedCount: number;
  totalCount: number;
  isEligibleForMatching: boolean;
  checks: ReadinessCheckItem[];
  featuredWorkCount: number;
}

export function computeBusinessBrandReadiness(
  business: {
    industry?: string | null;
    description?: string | null;
    logo_url?: string | null;
    common_needs?: string[] | null;
  } | null | undefined,
  brandAssets: Array<{
    kind?: string | null;
    label?: string | null;
    value?: string | null;
    original_name?: string | null;
    notes?: string | null;
  }> = []
): BusinessBrandReadinessResult {
  const assets = Array.isArray(brandAssets) ? brandAssets : [];

  const hasLogoAsset = assets.some((a) => {
    const kind = String(a.kind || "").toLowerCase();
    const label = String(a.label || "").toLowerCase();
    return kind === "logo" || kind === "vector" || label.includes("logo");
  });
  const hasLogo = Boolean(business?.logo_url?.trim()) || hasLogoAsset;

  const hasColorAsset = assets.some((a) => {
    const kind = String(a.kind || "").toLowerCase();
    const value = String(a.value || "").trim();
    const label = String(a.label || "").toLowerCase();
    return kind === "color" || value.startsWith("#") || label.includes("color") || label.includes("palette");
  });

  const hasFontAsset = assets.some((a) => {
    const kind = String(a.kind || "").toLowerCase();
    const label = String(a.label || "").toLowerCase();
    const notes = String(a.notes || "").toLowerCase();
    return kind === "font" || label.includes("font") || label.includes("type") || notes.includes("font");
  });

  const hasColorsAndFonts = hasColorAsset && hasFontAsset;

  const hasBrandSheet = assets.some((a) => {
    const kind = String(a.kind || "").toLowerCase();
    const blob = `${a.label || ""} ${a.original_name || ""} ${a.notes || ""}`.toLowerCase();
    return (
      kind === "guide" ||
      kind === "brand_sheet" ||
      kind === "style_guide" ||
      /(brand sheet|style guide|brand guide|guideline|brand book)/.test(blob)
    );
  });

  const hasIndustryAndNiche =
    Boolean(business?.industry?.trim()) &&
    (Boolean(business?.description?.trim()) ||
      (Array.isArray(business?.common_needs) && business!.common_needs!.length > 0));

  const checks: ReadinessCheckItem[] = [
    {
      key: "primary_logo",
      label: "Primary Logo Uploaded",
      completed: hasLogo,
      points: 25,
      detail: hasLogo ? "Vector or high-res mark ready in Vault" : "Upload your logo so creatives can apply it",
      href: "/business/vault#logo",
      actionLabel: hasLogo ? "View Logo" : "Upload Logo",
    },
    {
      key: "colors_fonts",
      label: "Brand Colors & Fonts Saved",
      completed: hasColorsAndFonts,
      points: 25,
      detail: hasColorsAndFonts
        ? "Hex codes and font pairings saved"
        : !hasColorAsset && !hasFontAsset
        ? "Save brand colors and typefaces"
        : !hasColorAsset
        ? "Add your HEX brand colors"
        : "Add your brand font pairings",
      href: "/business/vault#color",
      actionLabel: hasColorsAndFonts ? "Edit Palette" : "Add Colors & Fonts",
    },
    {
      key: "brand_sheet",
      label: "Brand Sheet or Style Guide Uploaded",
      completed: hasBrandSheet,
      points: 25,
      detail: hasBrandSheet ? "Style guide ready for kickoff" : "Upload a 1-page brand sheet or guide",
      href: "/business/vault#guide",
      actionLabel: hasBrandSheet ? "Open Guide" : "Upload Guide",
    },
    {
      key: "industry_niche",
      label: "Business Industry & Niche Selected",
      completed: hasIndustryAndNiche,
      points: 25,
      detail: hasIndustryAndNiche ? `${business?.industry}` : "Add your industry and business overview",
      href: "/account?edit=1",
      actionLabel: hasIndustryAndNiche ? "Update Info" : "Complete Profile",
    },
  ];

  const completedCount = checks.filter((c) => c.completed).length;
  const score = completedCount * 25;
  const missingChecks = checks.filter((c) => !c.completed);

  const suggestedServices: BusinessBrandReadinessResult["suggestedServices"] = [];
  if (!hasLogo) {
    suggestedServices.push({
      serviceKey: "branding_design",
      serviceName: "Core Logo & Vector Kit",
      packageTitle: "Option A: Core Logo & Vector Kit",
      category: "Brand & Illustration",
      coins: 4,
      usd: 200,
      estimatedTurnaround: "3–4 Business Days",
      reason: "Your Brand Vault is missing a Primary Logo—add a scalable vector logo first.",
      deliverables: [
        "Primary logo design + secondary icon mark",
        "100% scalable vector artwork (.AI, .SVG, .EPS, .PNG)",
        "Full commercial ownership rights",
      ],
    });
  } else if (!hasColorsAndFonts || !hasBrandSheet) {
    suggestedServices.push({
      serviceKey: "branding_design",
      serviceName: "Brand Identity Starter & Brand Sheet",
      packageTitle: "Option B: Brand Identity Starter & Brand Sheet",
      category: "Brand & Illustration",
      coins: 6,
      usd: 300,
      estimatedTurnaround: "4–5 Business Days",
      reason: "Your Brand Vault is missing saved Colors/Fonts or a 1-Page Brand Sheet.",
      deliverables: [
        "1-Page Master Brand Sheet with Hex/CMYK palette & typography pairings",
        "Primary & secondary mark clearspace guide",
        "Brand Vault automatic sync",
      ],
    });
  }

  return {
    score,
    completedCount,
    totalCount: checks.length,
    checks,
    missingKeys: missingChecks.map((c) => c.key),
    missingLabels: missingChecks.map((c) => c.label),
    suggestedServices,
  };
}

export function computeCreativeBusinessReadiness(
  creative: {
    primary_specialty?: string | null;
    industries?: string[] | null;
    availability_text?: string | null;
    available_for_projects?: boolean | null;
    stripe_connect_account_id?: string | null;
    mentorship_notes?: string | null;
    bio?: string | null;
    portfolio_url?: string | null;
    application_status?: string | null;
  } | null | undefined,
  featuredWorkCount: number
): CreativeBusinessReadinessResult {
  const hasSpecialtyAndNiches =
    Boolean(creative?.primary_specialty?.trim()) &&
    Array.isArray(creative?.industries) &&
    creative!.industries!.length > 0;

  const hasThreePieces = featuredWorkCount >= 3;

  const availText = String(creative?.availability_text || "");
  const hasFiveHourCommitment =
    creative?.available_for_projects !== false &&
    /(5-hour|5 hour|5h|within 5 hours|commitment active)/i.test(availText);

  const notesAndBio = `${creative?.mentorship_notes || ""} ${creative?.bio || ""}`;
  const hasDeliverableStandards = /(deliverable standards verified|peach academy standards|standards verified)/i.test(
    notesAndBio
  );
  const hasPayoutAccount = Boolean(creative?.stripe_connect_account_id?.trim());
  const hasPayoutAndStandards = hasPayoutAccount && hasDeliverableStandards;

  const checks: ReadinessCheckItem[] = [
    {
      key: "specialty_niches",
      label: "V1 Specialty & Industry Niches Selected",
      completed: hasSpecialtyAndNiches,
      points: 25,
      detail: hasSpecialtyAndNiches
        ? `${creative?.primary_specialty} · ${(creative?.industries || []).slice(0, 2).join(", ")}`
        : "Choose your primary specialty and target industries",
      href: "/account?edit=1",
      actionLabel: hasSpecialtyAndNiches ? "Edit" : "Set Niches",
    },
    {
      key: "portfolio_3",
      label: "3+ Real Commercial Portfolio Pieces Uploaded",
      completed: hasThreePieces,
      points: 25,
      detail: `${Math.min(featuredWorkCount, 3)} / 3 pieces uploaded`,
      href: "/creative/profile",
      actionLabel: hasThreePieces ? "Manage" : "Upload Work",
    },
    {
      key: "response_5h",
      label: "5-Hour Client Response Commitment Active",
      completed: hasFiveHourCommitment,
      points: 25,
      detail: hasFiveHourCommitment
        ? "Committed to 5-hour client replies"
        : "Activate your 5-hour response SLA",
      href: "/account?edit=1",
      actionLabel: hasFiveHourCommitment ? "Active" : "Activate",
    },
    {
      key: "payout_standards",
      label: "Payout Account & Deliverable Standards Verified",
      completed: hasPayoutAndStandards,
      points: 25,
      detail: hasPayoutAndStandards
        ? "Stripe Connect & standards verified"
        : !hasPayoutAccount && !hasDeliverableStandards
        ? "Connect payouts and verify Peach Academy standards"
        : !hasPayoutAccount
        ? "Connect your Stripe payout account"
        : "Verify deliverable standards in Peach Academy",
      href: !hasPayoutAccount ? "/creative/payouts" : "/creative/academy",
      actionLabel: hasPayoutAndStandards
        ? "Verified"
        : !hasPayoutAccount
        ? "Connect Payouts"
        : "Verify Standards",
    },
  ];

  const completedCount = checks.filter((c) => c.completed).length;
  const score = completedCount * 25;
  const isEligibleForMatching =
    score === 100 && creative?.application_status === "approved";

  return {
    score,
    completedCount,
    totalCount: checks.length,
    isEligibleForMatching,
    checks,
    featuredWorkCount,
  };
}
