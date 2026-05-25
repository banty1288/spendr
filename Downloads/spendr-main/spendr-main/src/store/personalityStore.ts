import { create } from "zustand";
import { runPersonalityAnalysis } from "../services/ai/personalityGateway";
import { getPersonalityDocument } from "../lib/firebase/personality";
import type { PersonalityAnalysis } from "../types/personality";
import type { UserData } from "../types/user";
import type { Transaction } from "../types/transaction";
import { useAuthStore } from "./authStore";

interface PersonalityState {
  personality: PersonalityAnalysis | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  fetchPersonality: (uid: string, force?: boolean) => Promise<void>;
  generatePersonality: (uid: string, userData: UserData, transactions: Transaction[], force?: boolean) => Promise<void>;
  clear: () => void;
}

export const usePersonalityStore = create<PersonalityState>((set, get) => ({
  personality: null,
  loading: false,
  error: null,
  initialized: false,

  fetchPersonality: async (uid: string, force = false) => {
    if (get().loading) return;
    
    set({ loading: true, error: null });
    try {
      const doc = await getPersonalityDocument(uid);
      if (doc) {
        set({ personality: doc, initialized: true, loading: false });
      } else {
        set({ initialized: true, loading: false }); // Needs generation
      }
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to fetch personality", 
        loading: false,
        initialized: true 
      });
    }
  },

  generatePersonality: async (uid: string, userData: UserData, transactions: Transaction[], force = false) => {
    if (get().loading) return;
    
    set({ loading: true, error: null });
    try {
      const analysis = await runPersonalityAnalysis({ uid, userData, transactions, force });
      set({ personality: analysis, loading: false, initialized: true });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to generate personality", 
        loading: false 
      });
    }
  },

  clear: () => set({ personality: null, loading: false, error: null, initialized: false }),
}));
