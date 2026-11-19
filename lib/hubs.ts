export function formatCityHub(city?: string | null, state?: string | null): string {
  const cleanCity = (city ?? "").trim();
  const cleanState = (state ?? "").trim().toUpperCase();

  if (!cleanCity) {
    return "US Remote";
  }

  const normalized = cleanCity.toLowerCase();
  if (normalized.endsWith(" hub")) {
    return cleanCity;
  }

  const stateSuffix = cleanState && cleanState.length === 2 ? ` (${cleanState})` : "";
  if (normalized === "birmingham" || normalized === "atlanta" || normalized === "huntsville" || normalized === "montgomery" || normalized === "nashville" || normalized === "charlotte") {
    return `${cleanCity} Hub`;
  }

  return `${cleanCity}${stateSuffix} Hub`;
}

export const DAILY_CREATIVE_NEEDS_OPTIONS = [
  "Social Media Posts",
  "Seasonal Flyers & Menus",
  "Product Photography",
  "Website Updates",
  "Event Graphics",
  "Email Campaigns",
  "Packaging & Labels",
  "Short-Form Video Reels",
] as const;

export const BUSINESS_INDUSTRY_OPTIONS = [
  "Restaurant & Hospitality",
  "Coffee Shop & Bakery",
  "Retail & Boutique",
  "Beauty, Salon & Wellness",
  "Real Estate & Architecture",
  "Fitness & Health",
  "Professional Services",
  "Events & Entertainment",
  "Home & Local Services",
  "E-Commerce & Consumer Goods",
  "Nonprofit & Community",
  "Other Local Business",
] as const;
