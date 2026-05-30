import { ArrowLeft, Lock, LogOut, Shield, Trash2, Key } from "lucide-react";
import { useNavigate } from "react-router";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import { useUpdateUser } from "../../../hooks/useUpdateUser";
import { useUserData } from "../../../hooks/useUserData";
import { Switch } from "../../components/ui/switch";
import { useState } from "react";

export function Security() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: userData } = useUserData();
  const { updateSettings } = useUpdateUser();
  const [isResetting, setIsResetting] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(getAuth(), user.email);
      toast.success("Password reset email sent to " + user.email);
    } catch (err: any) {
      toast.error(`Failed to send reset email: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggleAnalytics = async (checked: boolean) => {
    try {
      await updateSettings({
        privacy: { ...userData?.settings?.privacy, analyticsOptIn: checked, dataVisibility: userData?.settings?.privacy?.dataVisibility || "private" }
      });
      toast.success("Privacy settings updated");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-safe-nav relative overflow-hidden">
      <div className="relative z-10">
        <div className="px-6 pt-12 pb-6 sticky top-0 z-50  bg-background/30 border-b border-border">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="bg-card shadow-sm p-3 rounded-full border border-border hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Security & Privacy</h1>
          </div>
        </div>

        <div className="px-6 mt-6 max-w-2xl mx-auto space-y-6">
          <div className="space-y-3">
            <h2 className="text-white/80 font-semibold px-2">Account Security</h2>
            
            <button 
              onClick={handlePasswordReset}
              disabled={isResetting}
              className="w-full flex items-center justify-between p-5 bg-card shadow-sm border border-border rounded-2xl hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-card">
                  <Key size={20} className="text-[#00d9ff]" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-medium">
                    {isResetting ? "Sending Email..." : "Change Password"}
                  </h3>
                  <p className="text-white/50 text-xs mt-0.5">We'll send a reset link to your email</p>
                </div>
              </div>
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="text-white/80 font-semibold px-2 mt-4">Privacy Preferences</h2>
            
            <div className="flex items-center justify-between p-5 bg-card shadow-sm border border-border rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-card">
                  <Shield size={20} className="text-[#00ff88]" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Analytics & Crash Reports</h3>
                  <p className="text-white/50 text-xs mt-0.5">Help us improve Spendr</p>
                </div>
              </div>
              <Switch 
                checked={userData?.settings?.privacy?.analyticsOptIn ?? true} 
                onCheckedChange={handleToggleAnalytics}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-[#ff3366]/80 font-semibold px-2 mt-8">Danger Zone</h2>
            
            <button className="w-full flex items-center justify-between p-5 bg-card border border-[#ff3366]/30 rounded-2xl hover:bg-card transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-card">
                  <LogOut size={20} className="text-[#ff3366]" />
                </div>
                <div className="text-left">
                  <h3 className="text-[#ff3366] font-medium">Log out all sessions</h3>
                  <p className="text-[#ff3366]/70 text-xs mt-0.5">Sign out from all other devices</p>
                </div>
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-5 bg-transparent border border-[#ff3366]/30 rounded-2xl hover:bg-card transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-card">
                  <Trash2 size={20} className="text-[#ff3366]" />
                </div>
                <div className="text-left">
                  <h3 className="text-[#ff3366] font-medium">Delete Account</h3>
                  <p className="text-[#ff3366]/70 text-xs mt-0.5">Permanently remove your data</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
