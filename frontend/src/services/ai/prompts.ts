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
  const currencyStr = contextBlock.match(/Currency: (.*)/)?.[1] || "INR";

  return `${SPENDR_ANALYSIS_SYSTEM}

CRITICAL FINANCIAL INSTRUCTION: 
All financial values in the transaction data provided below are already in the user's native currency: ${currencyStr}.
DO NOT perform any exchange rate conversions (e.g. from USD to INR). 
Use the exact numeric values provided. 
For large numbers, use the correct Indian numbering system (e.g., Lakhs and Crores) and use the correct symbol for ${currencyStr}.
NEVER use words like "dollars", "USD", or "$". 

USER DATA:
${contextBlock}

Return JSON matching this schema:
${SPENDR_ANALYSIS_SCHEMA}`;
}
