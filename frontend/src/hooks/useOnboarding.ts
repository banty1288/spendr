import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setDoc, serverTimestamp } from "firebase/firestore";
import { useAuthStore } from "../store/authStore";
import { useOnboardingStore } from "../store/onboardingStore";
import { ensureUserDocument } from "../lib/firebase/users";
import { userDocRef } from "../lib/firebase/paths";
import { waitForFirestoreAuth } from "../lib/firebase/assertAuth";
import { userDataQueryKey } from "./useUserData";
import type { OnboardingData } from "../types/onboarding";
import type { OnboardingProfile } from "../types/user";

function toProfile(data: OnboardingData): OnboardingProfile {
  return { ...data };
}

export const useSaveOnboarding = () => {
  const user = useAuthStore((s) => s.user);
  const reset = useOnboardingStore((s) => s.reset);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OnboardingData) => {
      if (!user) throw new Error("You must be signed in to save onboarding.");

      const authed = await waitForFirestoreAuth(user.uid, true);
      await ensureUserDocument(authed, true);

      await setDoc(
        userDocRef(authed.uid),
        {
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString(),
          profile: toProfile(data),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: userDataQueryKey(user?.uid) });
    },
  });
};
