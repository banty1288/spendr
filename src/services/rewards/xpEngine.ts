export const XP_VALUES = {
  TRANSACTION_LOGGED: 20,
  CHALLENGE_COMPLETED: 150,
  ACHIEVEMENT_UNLOCKED_COMMON: 50,
  ACHIEVEMENT_UNLOCKED_UNCOMMON: 100,
  ACHIEVEMENT_UNLOCKED_RARE: 200,
  ACHIEVEMENT_UNLOCKED_EPIC: 300,
  ACHIEVEMENT_UNLOCKED_LEGENDARY: 500,
  STREAK_MAINTAINED: 50,
  AI_IMPROVEMENT: 100,
  LEVEL_UP: 500, // Bonus XP for hitting a new milestone
} as const;

export const REWARD_ICONS = {
  transaction: "🧾",
  challenge: "🎯",
  achievement: "🏆",
  streak: "🔥",
  ai_insight: "🧠",
  level_up: "🚀",
} as const;
