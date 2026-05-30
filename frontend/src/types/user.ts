import type { OnboardingData } from "./onboarding";

/** Stored under Firestore `users/{uid}.profile` */
export type OnboardingProfile = OnboardingData;

export interface UserSettings {
  notifications?: {
    spendingAlerts?: boolean;
    savingsReminders?: boolean;
    streakReminders?: boolean;
    email?: boolean;
    push?: boolean;
  };
  privacy?: {
    dataVisibility?: "public" | "private" | "friends";
    analyticsOptIn?: boolean;
  };
  app?: {
    theme?: "light" | "dark" | "system";
    language?: string;
    currency?: string;
  };
}

export interface UserPreferences {
  language?: string;
  currency?: string;
}

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  upiId?: string;
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string;
  profile?: OnboardingProfile;
  settings?: UserSettings;
  preferences?: UserPreferences;
  balance?: number;
  streakDays?: number;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}
