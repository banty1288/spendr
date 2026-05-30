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

  // Fetch savings goals
  let goals: any[] = [];
  try {
    const goalsRef = collection(db, "financialGoals");
    const qGoals = query(goalsRef, where("userId", "==", userId));
    const goalsSnap = await getDocs(qGoals);
    goals = goalsSnap.docs.map(d => d.data());
  } catch (e) {
    console.error("Failed to fetch goals for voice context", e);
  }

  // Fetch financial wellness
  let wellness: any = null;
  try {
    const wellnessRef = collection(db, "financialWellness");
    const qWellness = query(wellnessRef, where("userId", "==", userId), orderBy("timestamp", "desc"), limit(1));
    const wellnessSnap = await getDocs(qWellness);
    if (!wellnessSnap.empty) {
      wellness = wellnessSnap.docs[0].data();
    }
  } catch (e) {
    console.error("Failed to fetch wellness for voice context", e);
  }

  const txSummary = transactions.map(t => `- ${t.date}: ${t.type === 'expense' ? '-' : '+'}${t.amount} ${currency} for ${t.category} (${t.title})`).join('\n');
  const budgetSummary = budgets.map(b => `- ${b.category}: ${b.limit} ${currency} (Spent: ${b.spent} ${currency})`).join('\n');
  const goalsSummary = goals.map(g => `- ${g.name}: ${g.currentAmount}/${g.targetAmount} ${currency}`).join('\n');
  
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return `You are Spendr's Voice AI Financial Assistant, named Aoede. You act as a proactive, friendly, and highly intelligent personal financial coach.
You are speaking to ${userName}. It is currently the ${timeOfDay}.
Current Balance: ${currentBalance} ${currency}
Wellness Score: ${wellness ? wellness.score + '/100 (' + wellness.status + ')' : 'Unknown'}

Recent Transactions:
${txSummary || "None recently."}

Active Budgets:
${budgetSummary || "No budgets set yet."}

Active Savings Goals:
${goalsSummary || "No active savings goals."}

Core Behaviors:
1. Speak concisely. You are a voice assistant, so avoid long lists or dense formatting. Speak naturally.
2. Be friendly, encouraging, and highly conversational.
3. INITIATE CONVERSATION: When you receive the trigger "INITIATE_GREETING", you MUST greet the user dynamically based on the time of day and their data (e.g. "Good morning! I noticed your dining expenses are high this week..."). Do NOT wait for them to ask a question.
4. ALWAYS FOLLOW UP: Never end your turn with just an answer. ALWAYS ask a relevant follow-up question to keep the conversation flowing.
5. Provide actionable insights using their Budgets, Goals, and Transactions.
6. If the user wants to add an expense, use the createExpense tool.
7. If the user wants to set a budget, use the createBudget tool.
8. If the user wants to set a goal, use the createGoal tool.
9. Always format monetary values in Indian Rupees (₹) unless the user specifically asks for another currency.
`;
}
