import { useState } from "react";
import { ArrowLeft, Globe, Moon, Palette } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useUserData } from "../../../hooks/useUserData";
import { useUpdateUser } from "../../../hooks/useUpdateUser";
import { toast } from "sonner";
import { invalidateSpendrAnalysisCache } from "../../../services/ai/gateway";
import { useAuthStore } from "../../../store/authStore";
import i18next from "../../../lib/i18n";
import { trackThemeChanged, trackCurrencyChanged } from "../../../services/analytics";

export function AppSettings() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: userData } = useUserData();
  const { updateSettings, updatePreferences } = useUpdateUser();
  const { t, i18n } = useTranslation();

  const [theme, setTheme] = useState(userData?.settings?.app?.theme || "dark");
  const [currency, setCurrency] = useState(userData?.preferences?.currency || userData?.settings?.app?.currency || "USD");
  const [language, setLanguage] = useState(userData?.preferences?.language || userData?.settings?.app?.language || "en");

  const saveSetting = async (key: string, value: string) => {
    try {
      if (key === "theme") {
        updateSettings({ app: { theme: value as any } });
        trackThemeChanged(value);
      } else {
        updatePreferences({ [key]: value });
        if (key === "currency") trackCurrencyChanged(value);
        if (user) {
          invalidateSpendrAnalysisCache(user.uid);
        }
      }
      toast.success(t("settings.appSettings", "Settings") + " updated");
    } catch (err: any) {
      toast.error("Failed to update settings: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-safe-nav relative overflow-hidden">
      <div className="relative z-10">
        <div className="px-6 pt-12 pb-6 sticky top-0 z-50 backdrop-blur-md bg-background/30 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="bg-white/5 p-3 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">App Settings</h1>
          </div>
        </div>

        <div className="px-6 mt-6 max-w-2xl mx-auto space-y-6">
          <div className="space-y-4">
            
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="p-2.5 rounded-xl bg-[#9d4edd]/20">
                  <Palette size={20} className="text-[#9d4edd]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">Theme Appearance</h3>
                  <select 
                    value={theme} 
                    onChange={(e) => { setTheme(e.target.value); saveSetting("theme", e.target.value); }}
                    className="mt-2 w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-[#9d4edd]"
                  >
                    <option value="dark">Dark Mode (Premium)</option>
                    <option value="light">Light Mode</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="p-2.5 rounded-xl bg-[#ff3366]/20">
                  <Globe size={20} className="text-[#ff3366]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">Default Currency</h3>
                  <select 
                    value={currency} 
                    onChange={(e) => { setCurrency(e.target.value); saveSetting("currency", e.target.value); }}
                    className="mt-2 w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-[#ff3366]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
