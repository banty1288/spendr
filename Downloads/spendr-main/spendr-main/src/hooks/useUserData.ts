import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { fetchUserDocument } from "../lib/firebase/users";
import type { UserData } from "../types/user";

export type { UserData } from "../types/user";

export const userDataQueryKey = (uid?: string) => ["userData", uid] as const;

export const useUserData = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: userDataQueryKey(user?.uid),
    queryFn: async (): Promise<UserData | null> => {
      if (!user) return null;
      return fetchUserDocument();
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });
};

export const useOnboardingCompleted = () => {
  const { user, initialized, bootstrapping } = useAuthStore();
  const {
    data,
    isLoading: isQueryLoading,
    isFetching,
    isError,
    isPending,
  } = useUserData();

  const profileLoading =
    !!user &&
    (isPending || isQueryLoading || (isFetching && data === undefined));

  const isLoading =
    !initialized || bootstrapping || profileLoading;

  return {
    isCompleted: Boolean(data?.onboardingCompleted),
    isLoading,
    isError,
    userData: data,
  };
};
