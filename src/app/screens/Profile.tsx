import { motion } from "motion/react";
import {
  User,
  Bell,
  Lock,
  CreditCard,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../store/authStore";
import { useUserData } from "../../hooks/useUserData";
import { useLogout } from "../../hooks/useLogout";
import { useTranslation } from "react-i18next";
import { getInitials } from "../../lib/userDisplay";
import { useCurrency } from "../../hooks/useCurrency";
import { PageShell } from "../components/ui/PageShell";
import { BackButton } from "../components/ui/BackButton";

export function Profile() {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const { data: userData, isLoading: isProfileLoading } = useUserData();
  const { logout, isLoggingOut } = useLogout();
  const { t } = useTranslation();
  const { convertAndFormat } = useCurrency();

  const displayName =
    userData?.displayName ?? authUser?.displayName ?? "Spendr User";
  const email = userData?.email ?? authUser?.email ?? "";
  const initials = getInitials(displayName);
  const balance = userData?.balance ?? 0;

  const stats = [
    { label: t("home.totalBalance", "Balance"), value: isProfileLoading ? "—" : convertAndFormat(balance) },
    {
      label: t("settings.title", "Setup"),
      value: userData?.onboardingCompleted ? t("common.success", "Complete") : t("common.loading", "Pending"),
    },
  ];

  const menuSections = [
    {
      items: [
        { icon: User, label: t("settings.personalInfo", "Personal Information"), path: "/settings/personal-info" },
        { icon: Bell, label: t("settings.notifications", "Notifications"), path: "/settings/notifications" },
        { icon: Lock, label: t("settings.security", "Security & Privacy"), path: "/settings/security" },
        { icon: CreditCard, label: t("settings.linkedAccounts", "Linked Accounts"), path: "/settings/linked-accounts" },
      ],
    },
    {
      items: [
        { icon: Settings, label: t("settings.appSettings", "App Settings"), path: "/settings/app" },
        { icon: HelpCircle, label: t("settings.helpSupport", "Help & Support"), path: "/settings/support" },
      ],
    },
  ];

  return (
    <PageShell orbs={[{ color: "#00d9ff", position: "top-right" }]}>
      <div className="relative px-4 sm:px-6 pt-12 pb-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-7"
        >
          <BackButton onClick={() => navigate("/home")} />
          <h1 className="text-2xl font-bold text-white">Profile</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#00d9ff]/10 to-[#00ff88]/10 backdrop-blur-sm p-6 rounded-3xl border border-white/10 mb-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00d9ff]/5 to-transparent" />
          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex flex-col items-center mt-6">
              <div className="relative">
                {userData?.profile?.avatarUrl ? (
                  <img 
                    src={userData.profile.avatarUrl} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#00d9ff]/30 shadow-[0_0_30px_rgba(0,217,255,0.2)]"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-[#00d9ff] to-[#00ff88] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,217,255,0.2)] relative z-10">
                    <span className="text-3xl font-black text-black">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white text-xl font-bold mb-0.5 truncate">
                {isProfileLoading ? t("common.loading", "Loading…") : displayName}
              </h2>
              <p className="text-white/50 text-sm truncate">
                {isProfileLoading ? "…" : email || t("profile.noEmail", "No email on file")}
              </p>
            </div>
          </div>

          <div className="flex justify-around">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-white text-xl font-black mb-1">{stat.value}</p>
                <p className="text-white/60 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {menuSections.map((section, sectionIndex) => (
          <motion.div
            key={sectionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + sectionIndex * 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 mb-4 overflow-hidden"
          >
            {section.items.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + sectionIndex * 0.1 + index * 0.05 }}
                  onClick={() => item.path && navigate(item.path)}
                  className={`w-full flex items-center gap-4 p-5 transition-colors ${
                    index !== section.items.length - 1 ? "border-b border-white/10" : ""
                  } hover:bg-white/5`}
                >
                  <div className="p-2.5 rounded-xl bg-white/10">
                    <Icon size={20} className="text-white/80" />
                  </div>
                  <span className="flex-1 text-left text-white/80">
                    {item.label}
                  </span>
                  <ChevronRight size={20} className="text-white/40" />
                </motion.button>
              );
            })}
          </motion.div>
        ))}

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="w-full bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-5 flex items-center gap-4 hover:bg-white/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="p-2.5 rounded-xl bg-[#ff3366]/20">
            {isLoggingOut ? (
              <Loader2 size={20} className="text-[#ff3366] animate-spin" />
            ) : (
              <LogOut size={20} className="text-[#ff3366]" />
            )}
          </div>
          <span className="flex-1 text-left text-[#ff3366] font-medium">
            {isLoggingOut ? t("common.loading", "Signing out…") : t("settings.logout", "Log Out")}
          </span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/40 text-xs text-center mt-8"
        >
          Spendr MVP
        </motion.p>
      </div>
    </PageShell>
  );
}
