import type { OnboardingData } from "./onboarding";

/** Stored under Firestore `users/{uid}.profile` */
export type OnboardingProfile = OnboardingData;

export interface UserData {
  displayName: string;
  email: string;
  balance: number;
  createdAt: string;
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string;
  profile?: OnboardingProfile;
}
