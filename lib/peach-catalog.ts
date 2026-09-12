export const MEMBERSHIP_PLANS = {
  essentials: {
    key: "essentials",
    name: "Essentials",
    priceCents: 49900,
    monthlyCoins: 5,
    coinCap: 7
  },
  growth: {
    key: "growth",
    name: "Growth",
    priceCents: 109900,
    monthlyCoins: 10,
    coinCap: 14
  },
  partner: {
    key: "partner",
    name: "Partner",
    priceCents: 219900,
    monthlyCoins: 20,
    coinCap: 28
  }
} as const;

export const PEACH_PACKS = {
  pack3: {
    key: "pack3",
    name: "3 Peach Coins",
    priceCents: 42500,
    coins: 3
  },
  pack5: {
    key: "pack5",
    name: "5 Peach Coins",
    priceCents: 67500,
    coins: 5
  },
  pack10: {
    key: "pack10",
    name: "10 Peach Coins",
    priceCents: 125000,
    coins: 10
  }
} as const;

export const ONE_TIME_WALLET_CAP = 10;
