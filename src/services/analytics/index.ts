/**
 * Centralized Firebase Analytics service for Spendr.
 *
 * Design principles:
 * - Never crashes the app — every call is wrapped in try/catch.
 * - Never logs sensitive data — no emails, passwords, amounts, or descriptions.
 * - Lazy-initializes analytics to avoid blocking app startup.
 * - Works in both web and Capacitor/APK builds.
 */
import { getAnalytics, logEvent, setUserProperties, setUserId, isSupported, type Analytics } from "firebase/analytics";
import { app } from "../../lib/firebase";

let analytics: Analytics | null = null;
let initPromise: Promise<Analytics | null> | null = null;

/**
 * Lazily initialize Firebase Analytics.
 * Returns null if analytics is not supported (e.g., SSR, some WebViews).
 */
function getAnalyticsInstance(): Promise<Analytics | null> {
  if (initPromise) return initPromise;

  initPromise = isSupported()
    .then((supported) => {
      if (!supported) {
        console.info("[Spendr Analytics] Not supported in this environment.");
        return null;
      }
      analytics = getAnalytics(app);
      return analytics;
    })
    .catch((err) => {
      console.warn("[Spendr Analytics] Init failed:", err);
      return null;
    });

  return initPromise;
}

// Kick off initialization immediately (non-blocking)
void getAnalyticsInstance();

// ─── Safe wrappers ────────────────────────────────────────────

function safeLog(eventName: string, params?: Record<string, string | number | boolean>) {
  try {
    if (!analytics) return;
    logEvent(analytics, eventName, params);
  } catch {
    // Silently swallow — analytics must never crash the app
  }
}

// ─── Identity ─────────────────────────────────────────────────

export function identifyUser(uid: string) {
  try {
    if (!analytics) return;
    setUserId(analytics, uid);
  } catch { /* noop */ }
}

export function setUserProperty(key: string, value: string) {
  try {
    if (!analytics) return;
    setUserProperties(analytics, { [key]: value });
  } catch { /* noop */ }
}

// ─── Authentication Events ────────────────────────────────────

export function trackLogin(method: string) {
  safeLog("login", { method });
}

export function trackSignup(method: string) {
  safeLog("sign_up", { method });
}

export function trackLogout() {
  safeLog("logout");
}

export function trackPasswordReset() {
  safeLog("password_reset");
}

// ─── Navigation / Screens ─────────────────────────────────────

export function trackScreenView(screenName: string) {
  safeLog("screen_view", { screen_name: screenName });
}

// ─── Dashboard ────────────────────────────────────────────────

export function trackDashboardOpened() {
  safeLog("dashboard_opened");
}

export function trackAiDashboardOpened() {
  safeLog("ai_dashboard_opened");
}

export function trackReportGenerated(reportType: string) {
  safeLog("report_generated", { report_type: reportType });
}

// ─── Transactions ─────────────────────────────────────────────

export function trackTransactionAdded(type: string, categoryId: string) {
  safeLog("transaction_added", { transaction_type: type, category_id: categoryId });
}

export function trackTransactionDeleted() {
  safeLog("transaction_deleted");
}

export function trackCategoryUsed(categoryId: string) {
  safeLog("category_used", { category_id: categoryId });
}

// ─── Gamification ─────────────────────────────────────────────

export function trackBadgeUnlocked(badgeId: string) {
  safeLog("badge_unlocked", { badge_id: badgeId });
}

export function trackLevelUp(level: number) {
  safeLog("level_up", { new_level: level });
}

export function trackRewardEarned(rewardType: string, xp: number) {
  safeLog("reward_earned", { reward_type: rewardType, xp_amount: xp });
}

export function trackChallengeCompleted(challengeId: string) {
  safeLog("challenge_completed", { challenge_id: challengeId });
}

export function trackStreakUpdated(days: number) {
  safeLog("streak_updated", { streak_days: days });
}

// ─── AI Features ──────────────────────────────────────────────

export function trackAiInsightGenerated() {
  safeLog("ai_insight_generated");
}

export function trackEmotionalReportGenerated() {
  safeLog("emotional_report_generated");
}

export function trackWeeklyReportGenerated() {
  safeLog("weekly_report_generated");
}

// ─── Settings ─────────────────────────────────────────────────

export function trackThemeChanged(theme: string) {
  safeLog("theme_changed", { theme });
  setUserProperty("theme_preference", theme);
}

export function trackCurrencyChanged(currency: string) {
  safeLog("currency_changed", { currency });
  setUserProperty("selected_currency", currency);
}

// ─── Sharing ──────────────────────────────────────────────────

export function trackReportShared(method: string) {
  safeLog("report_shared", { share_method: method });
}

export function trackAchievementShared(achievementId: string) {
  safeLog("achievement_shared", { achievement_id: achievementId });
}

// ─── Support ──────────────────────────────────────────────────

export function trackSupportRequestSent() {
  safeLog("support_request_sent");
}

export function trackFeedbackSubmitted() {
  safeLog("feedback_submitted");
}
