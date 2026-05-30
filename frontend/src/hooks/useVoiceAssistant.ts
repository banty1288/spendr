import { useState, useRef, useCallback, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { AudioRecorder } from "../services/voice/AudioRecorder";
import { AudioPlayer } from "../services/voice/AudioPlayer";
import { GeminiLiveClient } from "../services/voice/GeminiLiveClient";
import { buildSystemInstruction } from "../lib/firebase/voiceContext";
import { useAuthStore } from "../store/authStore";
import { useUserData } from "./useUserData";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAssistantStore } from "../store/assistantStore";

export type AssistantState = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "error";

interface Transcript {
  id: string;
  text: string;
  isUser: boolean;
}

export function useVoiceAssistant() {
  const [state, setState] = useState<AssistantState>("idle");
  const addMessage = useAssistantStore(s => s.addMessage);
  
  const { user } = useAuthStore();
  const { data: userData } = useUserData();
  
  const recorderRef = useRef<AudioRecorder | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const clientRef = useRef<GeminiLiveClient | null>(null);
  const currentBotText = useRef("");
  const userDataRef = useRef(userData);

  // Keep ref synced without triggering useCallback rebuilds
  useEffect(() => { userDataRef.current = userData; }, [userData]);

  const handleToolCall = async (name: string, args: any) => {
    if (!user) return { success: false, error: "Not logged in" };
    
    try {
      if (name === "createExpense") {
        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          amount: args.amount,
          category: args.category,
          title: args.description || "Voice Expense",
          type: "expense",
          date: new Date().toISOString()
        });
        return { success: true, message: `Added ₹${args.amount} to ${args.category}` };
      }
      
      if (name === "createBudget") {
        await addDoc(collection(db, "budgets"), {
          userId: user.uid,
          category: args.category,
          limit: args.limit,
          spent: 0,
          month: new Date().toISOString().slice(0, 7)
        });
        return { success: true, message: `Budget set for ${args.category} at ₹${args.limit}` };
      }
      
      if (name === "createGoal") {
        await addDoc(collection(db, "financialGoals"), {
          userId: user.uid,
          name: args.name,
          targetAmount: args.targetAmount,
          targetDate: args.targetDate || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
          currentAmount: 0,
          createdAt: new Date().toISOString()
        });
        return { success: true, message: `Goal created: ${args.name} for ₹${args.targetAmount}` };
      }

      return { success: false, error: "Unknown tool" };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message };
    }
  };

  const startSession = useCallback(async () => {
    if (!user) return;
    const currentData = userDataRef.current;
    try {
      setState("connecting");
      
      // IMMEDIATELY initialize recorder to capture user gesture
      recorderRef.current = new AudioRecorder((base64Pcm) => {
        clientRef.current?.sendAudio(base64Pcm);
      });
      await recorderRef.current.start();

      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("No auth token");

      // Get API Key
      const baseUrl = import.meta.env.VITE_API_URL || 'https://spendr-main.vercel.app';
      let apiKey = "";
      try {
        const res = await fetch(`${baseUrl}/api/getVoiceToken`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        apiKey = data.token;
      } catch (e) {
        console.warn("Failed to fetch from backend, using fallback token", e);
        // Fallback for local development if the Vercel backend rejects the token due to Project ID mismatch
        apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
      }
      
      if (!apiKey) throw new Error("Could not get voice token");

      playerRef.current = new AudioPlayer();
      
      clientRef.current = new GeminiLiveClient(apiKey, {
        onStateChange: (newState) => {
          if (newState === "connected") {
            setState("listening");
          } else {
            setState(newState as AssistantState);
          }
        },
        onAudioReceived: (base64Pcm) => {
          playerRef.current?.playBase64Pcm(base64Pcm);
        },
        onTextReceived: (text, isFinal) => {
          if (text) {
            currentBotText.current += text;
          }
          if (isFinal && currentBotText.current) {
            addMessage({ role: "assistant", content: currentBotText.current });
            currentBotText.current = "";
          }
        },
        onToolCall: handleToolCall
      });

      const sysInstruction = await buildSystemInstruction(
        user.uid, 
        currentData?.displayName || "there", 
        currentData?.balance || 0, 
        currentData?.settings?.app?.currency || currentData?.preferences?.currency || "₹"
      );
      
      clientRef.current.connect(sysInstruction);

    } catch (err) {
      console.error("Failed to start voice session", err);
      setState("error");
    }
  }, [user]);

  const stopSession = useCallback(() => {
    recorderRef.current?.stop();
    playerRef.current?.stop();
    playerRef.current?.close();
    clientRef.current?.disconnect();
    setState("idle");
  }, []);

  const sendText = useCallback((text: string) => {
    if (clientRef.current) {
      // Optimistically add user text to transcript
      addMessage({ role: "user", content: text });
      clientRef.current.sendText(text);
    }
  }, [addMessage]);

  return {
    state,
    startSession,
    stopSession,
    sendText
  };
}
