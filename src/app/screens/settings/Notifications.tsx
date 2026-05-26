import { useState, useEffect } from "react";
import { ArrowLeft, Bell, Brain, Calendar, Flame, Moon, Wallet } from "lucide-react";
import { useNavigate } from "react-router";
import { useUserData } from "../../../hooks/useUserData";
import { useUpdateUser } from "../../../hooks/useUpdateUser";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";

export function Notifications() {
  const navigate = useNavigate();
  const { data: userData, isLoading } = useUserData();
  const { updateSettings } = useUpdateUser();

  const [settings, setSettings] = useState({
    spendingAlerts: true,
    savingsReminders: true,
    streakReminders: true,
    weeklyReports: true,
    aiCoaching: true,
    quietHours: false,
  });

  useEffect(() => {
    if (userData?.settings?.notifications) {
      setSettings(userData.settings.notifications);
    }
  }, [userData]);

  const handleToggle = async (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newValue }));
    
    try {
      await updateSettings({
        notifications: { ...settings, [key]: newValue }
      });
    } catch (err) {
      // Revert on failure
      setSettings((prev) => ({ ...prev, [key]: !newValue }));
      toast.error("Failed to update notification settings");
    }
  };

  const NotificationItem = ({ icon: Icon, title, description, id, color }: any) => (
    <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl`} style={{ backgroundColor: `${color}20` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <h3 className="text-white font-medium">{title}</h3>
          <p className="text-white/50 text-xs mt-0.5">{description}</p>
        </div>
      </div>
      <Switch 
        checked={settings[id as keyof typeof settings]} 
        onCheckedChange={() => handleToggle(id as keyof typeof settings)} 
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-safe-nav relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00d9ff]/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <div className="px-6 pt-12 pb-6 sticky top-0 z-50 backdrop-blur-md bg-background/30 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="bg-white/5 p-3 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
          </div>
        </div>

        <div className="px-6 mt-6 max-w-2xl mx-auto space-y-3">
          <NotificationItem 
            id="spendingAlerts"
            icon={Wallet}
            color="#ff3366"
            title="Spending Alerts"
            description="Get notified about unusual spending patterns."
          />
          <NotificationItem 
            id="savingsReminders"
            icon={Bell}
            color="#00ff88"
            title="Savings Reminders"
            description="Helpful nudges to reach your financial goals."
          />
          <NotificationItem 
            id="streakReminders"
            icon={Flame}
            color="#ff9500"
            title="Streak Reminders"
            description="Don't lose your savings streak!"
          />
          <NotificationItem 
            id="weeklyReports"
            icon={Calendar}
            color="#00d9ff"
            title="Weekly Reports"
            description="Your financial summary every Monday."
          />
          <NotificationItem 
            id="aiCoaching"
            icon={Brain}
            color="#9d4edd"
            title="AI Coaching"
            description="Personalized insights from Gemini."
          />
          
          <div className="pt-6">
            <h2 className="text-white/80 font-semibold mb-3 px-2">Preferences</h2>
            <NotificationItem 
              id="quietHours"
              icon={Moon}
              color="#5e60ce"
              title="Quiet Hours"
              description="Mute non-essential alerts from 10 PM to 8 AM."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
