import type {
  EmotionalInsightCard,
  EmotionalPatternType,
  EmotionalRiskLevel,
  EmotionalSpendingInsights,
  SpendingBehaviorTimelineItem,
} from "../../types/emotionalInsight";
import { AiError } from "./errors";

const PATTERN_TYPES: EmotionalPatternType[] = [
  "late_night",
  "stress",
  "reward",
  "impulse",
  "weekend_spike",
  "recurring",
  "comfort",
  "subscription_creep",
];

const RISK_LEVELS: EmotionalRiskLevel[] = ["low", "medium", "high"];

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string") as string[];
}

function asRiskLevel(value: unknown, fallback: EmotionalRiskLevel): EmotionalRiskLevel {
  return typeof value === "string" && RISK_LEVELS.includes(value as EmotionalRiskLevel)
    ? (value as EmotionalRiskLevel)
    : fallback;
}

function asPatternType(value: unknown): EmotionalPatternType {
  return typeof value === "string" && PATTERN_TYPES.includes(value as EmotionalPatternType)
    ? (value as EmotionalPatternType)
    : "impulse";
}

function clampScore(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)));
}

function parseCards(value: unknown): EmotionalInsightCard[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      return {
        type: asPatternType(raw.type),
        title: asString(raw.title, "Behavior pattern"),
        summary: asString(raw.summary),
        evidence: asString(raw.evidence),
        recommendation: asString(raw.recommendation),
        severity: asRiskLevel(raw.severity, "medium"),
        confidence: clampScore(asNumber(raw.confidence, 65)),
      };
    })
    .filter((item): item is EmotionalInsightCard => item !== null)
    .filter((item) => item.summary || item.evidence || item.recommendation)
    .slice(0, 6);
}

function parseTimeline(value: unknown): SpendingBehaviorTimelineItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      return {
        label: asString(raw.label, "Pattern"),
        description: asString(raw.description),
        amount: Math.max(0, asNumber(raw.amount, 0)),
        riskLevel: asRiskLevel(raw.riskLevel, "medium"),
      };
    })
    .filter((item): item is SpendingBehaviorTimelineItem => item !== null)
    .filter((item) => item.description)
    .slice(0, 6);
}

export function parseEmotionalSpendingInsights(
  rawText: string,
  fingerprint: string
): EmotionalSpendingInsights {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(extractJson(rawText)) as Record<string, unknown>;
  } catch {
    throw new AiError(
      "PARSE",
      "Could not parse emotional spending analysis. Please try again.",
      true
    );
  }

  const triggerAnalysis = (parsed.triggerAnalysis ?? {}) as Record<string, unknown>;
  const alerts = parseCards(parsed.alerts);
  const behavioralInsights = parseCards(parsed.behavioralInsights);

  if (alerts.length === 0 && behavioralInsights.length === 0) {
    throw new AiError("PARSE", "AI returned no emotional spending patterns.", true);
  }

  const score = clampScore(asNumber(parsed.emotionalRiskScore, 50));

  return {
    emotionalRiskScore: score,
    riskLevel: asRiskLevel(
      parsed.riskLevel,
      score >= 70 ? "high" : score >= 42 ? "medium" : "low"
    ),
    alerts,
    behavioralInsights,
    triggerAnalysis: {
      primaryTriggers: asStringArray(triggerAnalysis.primaryTriggers).slice(0, 5),
      summary: asString(triggerAnalysis.summary),
    },
    savingsWarnings: asStringArray(parsed.savingsWarnings).slice(0, 4),
    coachingRecommendations: asStringArray(parsed.coachingRecommendations).slice(0, 4),
    habitSuggestions: asStringArray(parsed.habitSuggestions).slice(0, 4),
    motivationalFeedback: asString(
      parsed.motivationalFeedback,
      "You are building awareness. Small pauses before emotional purchases can change the whole month."
    ),
    timeline: parseTimeline(parsed.timeline),
    generatedAt: new Date().toISOString(),
    fingerprint,
  };
}
