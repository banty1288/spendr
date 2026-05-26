import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { updateUserDocument, updateUserSettings } from "../lib/firebase/users";
import { userDataQueryKey, type UserData } from "./useUserData";
import { type UserPreferences } from "../types/user";
import { useAuthStore } from "../store/authStore";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const updateUserMutation = useMutation({
    mutationFn: async (updates: Partial<UserData>) => {
      await updateUserDocument(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userDataQueryKey(user?.uid) });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<UserData["settings"]>) => {
      await updateUserSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userDataQueryKey(user?.uid) });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<UserPreferences>) => {
      if (!user) throw new Error("Not authenticated");
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, {
        preferences,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userDataQueryKey(user?.uid) });
    },
  });

  return {
    updateUser: updateUserMutation.mutateAsync,
    updateSettings: updateSettingsMutation.mutateAsync,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    isUpdating: updateUserMutation.isPending || updateSettingsMutation.isPending || updatePreferencesMutation.isPending,
  };
};
