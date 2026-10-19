export const PEACH_TARGET_MARGIN_MIN = 0.35;

export function estimatedProcessingFee(amountCents: number) {
  // Placeholder for planning only.
  // Production should use actual Stripe balance transaction fees.
  return Math.round(amountCents * 0.029 + 30);
}

export function contributionMargin({
  projectRevenueCents,
  creativePayoutCents,
  directFeesCents
}: {
  projectRevenueCents: number;
  creativePayoutCents: number;
  directFeesCents: number;
}) {
  if (projectRevenueCents <= 0) return 0;
  return (
    projectRevenueCents -
    creativePayoutCents -
    directFeesCents
  ) / projectRevenueCents;
}

export function requiresMarginReview(margin: number) {
  return margin < PEACH_TARGET_MARGIN_MIN;
}
