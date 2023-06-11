const glicko2Constants = {
  // Glicko-2 System Constants
  DEFAULT_RATING: 1500,
  DEFAULT_RD: 350,
  DEFAULT_VOL: 0.06,
} as const;

const rankGameConstants = {
  // Rank Game Constants
  PROVISION_GAMES: 20,
  LEAVE_PENALTY: 100,
} as const;

const rankBracketConstants = {
  //
  BRONZE_BASE: 1300,
  SILVER_BASE: 1400,
  GOLD_BASE: 1550,
  PLATINUM_BASE: 1700,
  DIAMOND_BASE: 1800,
  CHAMPION_BASE: 1900,
} as const;

export { glicko2Constants, rankBracketConstants, rankGameConstants };

