const eloConstants = {
  // ELO System Constants
  DEFAULT_RATING: 1500,
  DEFAULT_RD: 350,
  DEFAULT_VOL: 0.06,
  PROVISION_GAMES: 20,
  BRONZE_BASE: 1300,
  SILVER_BASE: 1400,
  GOLD_BASE: 1550,
  PLATINUM_BASE: 1700,
  DIAMOND_BASE: 1800,
  CHAMPION_BASE: 1900,
} as const;

export default eloConstants;
