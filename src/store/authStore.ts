import { create } from "zustand";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, authReady } from "../lib/firebase";
import { ensureUserDocument } from "../lib/firebase/users";
import { identifyUser } from "../services/analytics";

interface AuthState {
  user: User | null;
  /** False until Firebase emits the first auth state (including persisted sessions). */
  initialized: boolean;
  /** True while bootstrapping the Firestore user profile for the signed-in user. */
  bootstrapping: boolean;
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  initialized: false,
  bootstrapping: false,
}));

/** Resolves when Firebase auth has initialized and a user is present. */
export function waitForAuthUser(timeoutMs = 15_000): Promise<User> {
  const current = useAuthStore.getState();
  if (current.initialized && current.user) {
    return Promise.resolve(current.user);
  }

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      unsubscribe();
      reject(new Error("Timed out waiting for authentication."));
    }, timeoutMs);

    const unsubscribe = useAuthStore.subscribe((state) => {
      if (!state.initialized) return;
      if (state.user) {
        window.clearTimeout(timer);
        unsubscribe();
        resolve(state.user);
      }
    });
  });
}

let authListenerStarted = false;

function startAuthListener() {
  if (authListenerStarted) return;
  authListenerStarted = true;

  void authReady.then(() => {
    try {
      onAuthStateChanged(
        auth, 
        async (user) => {
          // Sync user immediately so route guards never see a stale null during sign-in.
          useAuthStore.setState({ user, initialized: true });

          if (!user) {
            useAuthStore.setState({ bootstrapping: false });
            return;
          }

          identifyUser(user.uid);

          useAuthStore.setState({ bootstrapping: true });
          try {
            await ensureUserDocument(undefined, true);
          } catch (err) {
            console.error("Failed to bootstrap user document:", err);
          } finally {
            useAuthStore.setState({ bootstrapping: false });
          }
        },
        (error) => {
          console.error("Firebase auth listener error (e.g., invalid API key):", error);
          useAuthStore.setState({ user: null, initialized: true, bootstrapping: false });
        }
      );
    } catch (err) {
      console.error("Failed to start auth listener:", err);
      useAuthStore.setState({ user: null, initialized: true, bootstrapping: false });
    }
  });
}

startAuthListener();
