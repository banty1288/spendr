import { generateJsonText } from "./client";
import { toAiError } from "./errors";
import type { DailyHubContent } from "./types";
import type { Transaction } from "../../types/transaction";

export async function generateDailyHubContent(transactions: Transaction[]): Promise<DailyHubContent> {
  const recentTransactions = transactions.slice(0, 15).map(tx => `- ${tx.type === 'expense' ? 'Spent' : 'Earned'} ${tx.amount} on ${tx.merchant}`).join('\n');
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `You are a financial advisor generating the daily feed for the Spendr app.
Current Date: ${dateStr}
Recent User Activity:
${recentTransactions || "No recent activity."}

Generate the Daily Hub content strictly as a JSON object matching the following structure.
Rules:
- News must sound like real, current financial headlines. Keep them short. Provide realistic sources (e.g., "Economic Times", "Mint", "TechCrunch") and times (e.g., "2 hours ago").
- Make the news fascinating and engaging by adding a 2-3 sentence 'description' explaining what it means for the user or the economy.
- "savingTip" must be a very short, actionable tip (e.g. "Carry a water bottle instead of buying one outside.").
- "aiMoneyTip" must be personalized based on the Recent User Activity. Keep it encouraging, simple English, max 2 sentences.
- "trendingTopics" must be 4 short, relevant topics (e.g., "UPI Safety", "Budget Planning").
- "market" must have 4 basic snapshots (Gold, Silver, Nifty, Bitcoin) with realistic mock data.

Expected JSON structure:
{
  "news": [
    { "title": "string", "source": "string", "time": "string", "description": "string" }
  ],
  "savingTip": "string",
  "aiMoneyTip": "string",
  "trendingTopics": [
    { "title": "string", "description": "string" }
  ],
  "market": [
    { "label": "string", "value": "string", "trend": "up" | "down" | "flat", "percentChange": "string" }
  ]
}

Only output valid JSON without any markdown block quotes. Use extremely simple English without jargon.`;

  try {
    const raw = await generateJsonText({ prompt });
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

    // Fallback if AI fails to return arrays
    if (!parsed.news) parsed.news = [];
    if (!parsed.trendingTopics) parsed.trendingTopics = [];
    if (!parsed.market) parsed.market = [];

    return parsed as DailyHubContent;
  } catch (err) {
    throw toAiError(err);
  }
}
