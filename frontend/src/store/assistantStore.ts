import { create } from "zustand";

export type AssistantInputMode = "text" | "voice";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isAction?: boolean;
  actionResult?: "success" | "error";
}

interface AssistantState {
  isOpen: boolean;
  inputMode: AssistantInputMode;
  messages: ChatMessage[];
  open: () => void;
  close: () => void;
  toggle: () => void;
  setInputMode: (mode: AssistantInputMode) => void;
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearMessages: () => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  isOpen: false,
  inputMode: "text",
  messages: [],

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setInputMode: (mode) => set({ inputMode: mode }),
  addMessage: (msg) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { ...msg, id: `${Date.now()}-${Math.random()}`, timestamp: Date.now() },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
}));
