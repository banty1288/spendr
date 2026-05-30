import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

export async function buildSystemInstruction(userId: string, userName: string, currentBalance: number, currency: string) {
  // Fetch recent transactions (last 10)
  let transactions: any[] = [];
  try {
    const txRef = collection(db, "transactions");
    const qTx = query(txRef, where("userId", "==", userId), orderBy("date", "desc"), limit(10));
    const txSnap = await getDocs(qTx);
    transactions = txSnap.docs.map(d => d.data());
  } catch (e) {
    console.error("Failed to fetch transactions for voice context", e);
  }

  // Fetch active budgets
  let budgets: any[] = [];
  try {
    const budgetRef = collection(db, "budgets");
    const qBudget = query(budgetRef, where("userId", "==", userId));
    const budgetSnap = await getDocs(qBudget);
    budgets = budgetSnap.docs.map(d => d.data());
  } catch (e) {
    console.error("Failed to fetch budgets for voice context", e);
  }

  const txSummary = transactions.map(t => `- ${t.date}: ${t.type === 'expense' ? '-' : '+'}${t.amount} ${currency} for ${t.category} (${t.title})`).join('\n');
  const budgetSummary = budgets.map(b => `- ${b.category}: ${b.limit} ${currency} (Spent: ${b.spent} ${currency})`).join('\n');

  return `You are Spendr's Voice AI Financial Assistant, named Aoede. You act as a proactive, friendly, and casual personal financial coach. 
You are speaking to ${userName}.
Current Balance: ${currentBalance} ${currency}

Recent Transactions:
${txSummary || "None recently."}

Active Budgets:
${budgetSummary || "No budgets set yet."}

Core Behaviors:
1. Speak concisely. Since you are speaking out loud, avoid long lists or dense formatting.
2. Be friendly and conversational.
3. If the user wants to add an expense, ask for amount and category, then use the createExpense tool.
4. If the user wants to set a budget, ask for category and limit, then use the createBudget tool.
5. If the user wants to set a goal, use the createGoal tool.
6. Proactively offer advice based on their spending. e.g. "I noticed you spent a lot on food lately..."
`;
}
