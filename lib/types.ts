export type UserRole = "business" | "creative" | "admin";

export type PeachLevel =
  | "seed"
  | "sapling"
  | "tree"
  | "blossom"
  | "root";

export type ProjectStatus =
  | "draft"
  | "matching"
  | "offer_sent"
  | "accepted"
  | "in_progress"
  | "waiting_on_client"
  | "proof_uploaded"
  | "revisions"
  | "submitted"
  | "approved"
  | "completed"
  | "cancel_requested"
  | "dispute"
  | "cancelled";

export type CoinLedgerType =
  | "issued"
  | "purchased"
  | "held"
  | "released"
  | "spent"
  | "refunded"
  | "expired"
  | "adjustment";

export type PayoutStatus =
  | "pending"
  | "ready"
  | "approved"
  | "paid"
  | "failed"
  | "reversed";
