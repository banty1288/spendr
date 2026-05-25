export const EMOTIONAL_SPENDING_SYSTEM = `You are Spendr's Emotional Spending Intelligence engine.
Analyze transaction history and onboarding profile for behavioral finance patterns.
Respond ONLY with valid JSON matching the schema. No markdown.
Be psychologically insightful, specific, non-judgmental, and concise. Use USD.`;

export const EMOTIONAL_SPENDING_SCHEMA = `{
  "emotionalRiskScore": number 0-100,
  "riskLevel": "low" | "medium" | "high",
  "alerts": [
    {
      "type": "late_night" | "stress" | "reward" | "impulse" | "weekend_spike" | "recurring" | "comfort" | "subscription_creep",
      "title": "string",
      "summary": "string",
      "evidence": "string",
      "recommendation": "string",
      "severity": "low" | "medium" | "high",
      "confidence": number 0-100
    }
  ],
  "behavioralInsights": [
    {
      "type": "late_night" | "stress" | "reward" | "impulse" | "weekend_spike" | "recurring" | "comfort" | "subscription_creep",
      "title": "string",
      "summary": "string",
      "evidence": "string",
      "recommendation": "string",
      "severity": "low" | "medium" | "high",
      "confidence": number 0-100
    }
  ],
  "triggerAnalysis": {
    "primaryTriggers": ["string"],
    "summary": "string"
  },
  "savingsWarnings": ["string"],
  "coachingRecommendations": ["string"],
  "habitSuggestions": ["string"],
  "motivationalFeedback": "string",
  "timeline": [
    {
      "label": "string",
      "description": "string",
      "amount": number,
      "riskLevel": "low" | "medium" | "high"
    }
  ]
}`;

export function buildEmotionalSpendingPrompt(contextBlock: string): string {
  return `${EMOTIONAL_SPENDING_SYSTEM}

Detect these patterns where evidence supports them:
- late-night overspending
- stress spending
- reward spending
- impulse shopping
- weekend spending spikes
- recurring emotional purchases
- comfort spending
- subscription creep

USER CONTEXT:
${contextBlock}

Return JSON matching this schema:
${EMOTIONAL_SPENDING_SCHEMA}`;
}
