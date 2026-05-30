/**
 * chatService.ts
 * Calls Gemini REST API directly from the client — no Vercel backend needed.
 * This avoids CORS issues, auth token failures, and rate limit mismatches
 * that occur when proxying through the Vercel /api/generateInsight endpoint.
 */
import { getCategoryBreakdown, getMonthTotals } from "../../lib/transactions/analytics";
import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";
import { format } from "date-fns";

const GEMINI_REST_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

const SYSTEM_PROMPT = `You are Aoede, a friendly AI financial assistant inside Spendr — a personal finance app for Indian users.
Keep replies SHORT: 2-4 sentences max. Use ₹ for currency.
If user wants to CREATE an expense, budget, or goal, include a JSON block at the VERY START like:
\`\`\`action
{"action":"createExpense","amount":200,"category":"food","merchant":"Lunch"}
\`\`\`
Then add a 1-sentence confirmation AFTER the block.
Available actions: createExpense (needs amount, category, merchant), createBudget (needs category, limit), createGoal (needs name, targetAmount).
Be warm, friendly, and proactive. Today is ${format(new Date(), "dd MMM yyyy")}.`;

export interface ChatAction {
  action: "createExpense" | "createBudget" | "createGoal";
  amount?: number;
  category?: string;
  merchant?: string;
  limit?: number;
  name?: string;
  targetAmount?: number;
}

export interface ChatResponse {
  text: string;
  action?: ChatAction;
}

function buildFinancialContext(
  userData: UserData | null | undefined,
  transactions: Transaction[]
): string {
  const currency = userData?.settings?.app?.currency || "INR";
  const displayName = userData?.displayName ?? "User";
  const balance = userData?.balance ?? 0;
  const monthKey = format(new Date(), "yyyy-MM");

  const totals = getMonthTotals(transactions, monthKey);
  const breakdown = getCategoryBreakdown(transactions, monthKey)
    .slice(0, 5)
    .map((b) => `${b.name}: ₹${b.value.toFixed(0)}`)
    .join(", ");

  const recent = transactions
    .slice(0, 5)
    .map(
      (t) =>
        `${t.date.slice(5)}: ${t.type === "expense" ? "-" : "+"}₹${t.amount} (${t.categoryId}) at ${t.merchant}`
    )
    .join("; ");

  const lines = [
    `User: ${displayName} | Balance: ₹${balance.toFixed(0)} | Currency: ${currency}`,
    `This month → Income: ₹${totals.income.toFixed(0)}, Expenses: ₹${totals.expenses.toFixed(0)}, Net: ₹${totals.net.toFixed(0)}`,
    breakdown ? `Top spending categories: ${breakdown}` : "No transactions this month yet.",
    recent ? `Recent transactions: ${recent}` : "",
  ];

  return lines.filter(Boolean).join("\n");
}

function parseResponse(raw: string): ChatResponse {
  // Extract action block if present
  const actionMatch = raw.match(/```action\s*([\s\S]*?)```/);
  let action: ChatAction | undefined;
  let text = raw;

  if (actionMatch) {
    try {
      action = JSON.parse(actionMatch[1].trim()) as ChatAction;
      // Remove the action block from display text
      text = raw.replace(/```action\s*[\s\S]*?```/, "").trim();
    } catch {
      // Parse failed — treat as plain text
    }
  }

  // Clean up any remaining code fences
  text = text.replace(/```[\s\S]*?```/g, "").trim();

  return { text: text || raw, action };
}

export async function sendChatMessage(
  userMessage: string,
  userData: UserData | null | undefined,
  transactions: Transaction[],
  conversationHistory: Array<{ role: string; content: string }>
): Promise<ChatResponse> {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.VITE_GEMINI_API_KEY;

  const financialContext = buildFinancialContext(userData, transactions);

  // Build conversation turns for Gemini multi-turn format
  // Last 6 messages (3 exchanges) for context
  const historyTurns = conversationHistory.slice(-6).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content.slice(0, 300) }],
  }));

  // Gemini expects alternating user/model turns — ensure we start with user
  const filteredHistory = historyTurns.filter((_, i) => {
    if (i === 0) return historyTurns[0].role === "user";
    return true;
  });

  const systemContent = `${SYSTEM_PROMPT}\n\nFINANCIAL CONTEXT:\n${financialContext}`;

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemContent }],
    },
    contents: [
      ...filteredHistory,
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };

  const response = await fetch(`${GEMINI_REST_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const status = response.status;
    if (status === 429) {
      throw new Error("Too many requests — please wait a moment and try again.");
    }
    if (status === 400) {
      throw new Error("Invalid request: " + (err?.error?.message || "bad request"));
    }
    throw new Error(
      err?.error?.message || `Gemini API error: ${status}`
    );
  }

  const result = await response.json();
  const rawText: string =
    result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!rawText.trim()) {
    throw new Error("Empty response from Gemini.");
  }

  return parseResponse(rawText);
}
