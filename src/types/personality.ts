export type PersonalityType =
  | "Impulse Explorer"
  | "Silent Saver"
  | "Reward Spender"
  | "Future Builder"
  | "Comfort Buyer";

export interface PersonalityAnalysis {
  type: PersonalityType;
  score: number; // 0-100 indicating intensity/match to the archetype
  summary: string;
  strengths: string[];
  weaknesses: string[];
  emotionalTriggers: string[];
  savingsOpportunities: string[];
  coaching: string;
  motivationalAdvice: string;
}

export interface PersonalityDocument extends PersonalityAnalysis {
  createdAt: string;
  updatedAt: string;
  transactionCount: number; // to know when we might want to recalculate
}
