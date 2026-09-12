export const DEFAULT_MARGIN_FLOOR = 0.35;

export function projectContributionMargin({
  estimatedCoinRevenueCents,
  creativePayoutCents,
  directFeeCents = 0
}: {
  estimatedCoinRevenueCents:number;
  creativePayoutCents:number;
  directFeeCents?:number;
}) {
  if (estimatedCoinRevenueCents <= 0) return 0;
  return (
    estimatedCoinRevenueCents -
    creativePayoutCents -
    directFeeCents
  ) / estimatedCoinRevenueCents;
}

export function requiresMarginReview(margin:number) {
  return margin < DEFAULT_MARGIN_FLOOR;
}
