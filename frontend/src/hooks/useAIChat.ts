import { useState, useCallback, useRef } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import { useUserData } from "./useUserData";
import { useTransactions } from "./useTransactions";
import { useAssistantStore } from "../store/assistantStore";
import { sendChatMessage, type ChatAction } from "../services/ai/chatService";
import { format } from "date-fns";

export function useAIChat() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const { data: userData } = useUserData();
  const { transactions } = useTransactions();
  const { messages, addMessage } = useAssistantStore();
  const abortRef = useRef<boolean>(false);

  const executeAction = useCallback(
    async (action: ChatAction): Promise<string> => {
      if (!user) return "Not signed in.";
      try {
        if (action.action === "createExpense") {
          await addDoc(collection(db, "transactions"), {
            userId: user.uid,
            merchant: action.merchant || "Voice Expense",
            amount: Math.abs(action.amount || 0),
            type: "expense",
            categoryId: action.category?.toLowerCase() || "other",
            notes: "",
            date: format(new Date(), "yyyy-MM-dd"),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          return `✅ Expense of ₹${action.amount} added for ${action.merchant || action.category}`;
        }

        if (action.action === "createBudget") {
          await addDoc(collection(db, "budgets"), {
            userId: user.uid,
            category: action.category || "Other",
            limit: action.limit || 0,
            spent: 0,
            month: format(new Date(), "yyyy-MM"),
            createdAt: new Date().toISOString(),
          });
          return `✅ Budget of ₹${action.limit} set for ${action.category}`;
        }

        if (action.action === "createGoal") {
          await addDoc(collection(db, "financialGoals"), {
            userId: user.uid,
            name: action.name || "New Goal",
            targetAmount: action.targetAmount || 0,
            currentAmount: 0,
            targetDate: new Date(
              Date.now() + 90 * 24 * 60 * 60 * 1000
            ).toISOString(),
            createdAt: new Date().toISOString(),
          });
          return `✅ Goal "${action.name}" created with target ₹${action.targetAmount}`;
        }

        return "";
      } catch (e: any) {
        console.error("Action failed", e);
        return `❌ Failed: ${e.message}`;
      }
    },
    [user]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      abortRef.current = false;

      // Add user message
      addMessage({ role: "user", content: text });
      setIsLoading(true);

      // Build history for context
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const response = await sendChatMessage(
          text,
          userData,
          transactions,
          history
        );

        if (abortRef.current) return;

        // Execute any action
        let actionResultText = "";
        if (response.action) {
          actionResultText = await executeAction(response.action);
        }

        const finalText = [response.text, actionResultText]
          .filter(Boolean)
          .join("\n\n");

        addMessage({
          role: "assistant",
          content: finalText,
          isAction: !!response.action,
          actionResult: response.action
            ? actionResultText.startsWith("✅")
              ? "success"
              : "error"
            : undefined,
        });
      } catch (err: any) {
        if (!abortRef.current) {
          addMessage({
            role: "assistant",
            content:
              "Sorry, I couldn't process that right now. Please try again.",
          });
        }
      } finally {
        if (!abortRef.current) setIsLoading(false);
      }
    },
    [isLoading, messages, userData, transactions, addMessage, executeAction]
  );

  const cancel = useCallback(() => {
    abortRef.current = true;
    setIsLoading(false);
  }, []);

  return { sendMessage, isLoading, cancel };
}
