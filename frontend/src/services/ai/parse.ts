import { AiError } from "./errors";
import type { InsightCard, InsightCardType, SpendrAIAnalysis } from "./types";

const CARD_TYPES: InsightCardType[] = [
  "strength",
  "weakness",
  "trigger",
  "suggestion",
];

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNumber(v: unknown, fallback: number): number {
  return typeof v === "number" && !Number.isNaN(v) ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string") as string[];
}

function parseCards(raw: unknown): InsightCard[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const type = asString(o.type) as InsightCardType;
      if (!CARD_TYPES.includes(type)) return null;
      return {
        type,
        title: asString(o.title, "Insight"),
        description: asString(o.description),
        metric: asString(o.metric, "—"),
      };
    })
    .filter((x): x is InsightCard => x !== null)
    .slice(0, 4);
}

export function parseSpendrAnalysis(rawText: string): SpendrAIAnalysis {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(extractJson(rawText)) as Record<string, unknown>;
  } catch {
    throw new AiError(
      "PARSE",
      "Could not parse AI response. Please try again.",
      true
    );
  }

  const spending = (parsed.spendingAnalysis ?? {}) as Record<string, unknown>;
  const emotional = (parsed.emotionalSpending ?? {}) as Record<string, unknown>;
  const savings = (parsed.savingsRecommendations ?? {}) as Record<
    string,
    unknown
  >;
  const insights = (parsed.financialInsights ?? {}) as Record<string, unknown>;
  const weekly = (parsed.weeklySummary ?? {}) as Record<string, unknown>;
  const coaching = (parsed.coaching ?? {}) as Record<string, unknown>;

  const cards = parseCards(insights.cards);
  if (cards.length === 0) {
    throw new AiError("PARSE", "AI returned no insight cards.", true);
  }

  return {
    spendingAnalysis: {
      summary: asString(spending.summary),
      topCategories: asStringArray(spending.topCategories),
      trends: asString(spending.trends),
    },
    emotionalSpending: {
      summary: asString(emotional.summary),
      triggers: asStringArray(emotional.triggers),
      patterns: asString(emotional.patterns),
    },
    savingsRecommendations: {
      headline: asString(savings.headline, "Savings opportunities"),
      recommendations: asStringArray(savings.recommendations),
      projectedAnnualSavings: asString(savings.projectedAnnualSavings) || undefined,
    },
    financialInsights: {
      summary: asString(insights.summary),
      healthScore: Math.min(100, Math.max(0, asNumber(insights.healthScore, 75))),
      disciplinePercent: Math.min(
        100,
        Math.max(0, asNumber(insights.disciplinePercent, 70))
      ),
      cards,
    },
    weeklySummary: {
      periodLabel: asString(weekly.periodLabel, "This week"),
      summary: asString(weekly.summary),
      highlights: asStringArray(weekly.highlights),
    },
    coaching: {
      title: asString(coaching.title, "Coach's tip"),
      message: asString(coaching.message),
      actionStep: asString(coaching.actionStep),
    },
  };
}
