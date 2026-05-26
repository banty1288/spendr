export const SPENDR_ANALYSIS_SYSTEM = `You are Spendr, a premium fintech AI coach. Analyze the user's real financial data.
Respond ONLY with valid JSON matching the schema exactly. No markdown outside JSON.
Be specific, empathetic, and actionable. Keep descriptions concise (1-3 sentences per field).`;

export const SPENDR_ANALYSIS_SCHEMA = `{
  "spendingAnalysis": {
    "summary": "string",
    "topCategories": ["string"],
    "trends": "string"
  },
  "emotionalSpending": {
    "summary": "string",
    "triggers": ["string"],
    "patterns": "string"
  },
  "savingsRecommendations": {
    "headline": "string",
    "recommendations": ["string", "string", "string"],
    "projectedAnnualSavings": "string optional"
  },
  "financialInsights": {
    "summary": "string (2-3 sentences for hero card)",
    "healthScore": number 0-100,
    "disciplinePercent": number 0-100,
    "cards": [
      { "type": "strength", "title": "string", "description": "string", "metric": "string" },
      { "type": "weakness", "title": "string", "description": "string", "metric": "string" },
      { "type": "trigger", "title": "string", "description": "string", "metric": "string" },
      { "type": "suggestion", "title": "string", "description": "string", "metric": "string" }
    ]
  },
  "weeklySummary": {
    "periodLabel": "string",
    "summary": "string",
    "highlights": ["string", "string"]
  },
  "coaching": {
    "title": "string",
    "message": "string",
    "actionStep": "string"
  }
}`;

export function buildAnalysisPrompt(contextBlock: string): string {
  // Extract currency from context block to inject rules
  const currencyStr = contextBlock.match(/Currency: (.*)/)?.[1] || "USD";

  return `${SPENDR_ANALYSIS_SYSTEM}

CRITICAL CURRENCY INSTRUCTION: 
The transaction data provided below is ALWAYS in USD (Base Currency).
However, the user wants to see their insights in: ${currencyStr}.
You MUST convert all monetary amounts from USD to ${currencyStr} using current approximate exchange rates before writing them into the JSON. Use the correct symbol for ${currencyStr}.

USER DATA:
${contextBlock}

Return JSON matching this schema:
${SPENDR_ANALYSIS_SCHEMA}`;
}
