import { motion } from "motion/react";
import {
  ArrowLeft,
  User,
  Bell,
  Lock,
  CreditCard,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  Crown,
  Loader2,
} from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../store/authStore";
import { useUserData } from "../../hooks/useUserData";
import { useLogout } from "../../hooks/useLogout";
import { formatCurrency, getInitials } from "../../lib/userDisplay";

export function Profile() {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const { data: userData, isLoading: isProfileLoading } = useUserData();
  const { logout, isLoggingOut } = useLogout();

  const displayName =
    userData?.displayName ?? authUser?.displayName ?? "Spendr User";
  const email = userData?.email ?? authUser?.email ?? "";
  const initials = getInitials(displayName);
  const balance = userData?.balance ?? 0;

  const stats = [
    { label: "Balance", value: isProfileLoading ? "—" : formatCurrency(balance) },
    { label: "Plan", value: "Free" },
    {
      label: "Setup",
      value: userData?.onboardingCompleted ? "Complete" : "Pending",
    },
  ];

  const menuSections = [
    {
      items: [
        { icon: User, label: "Personal Information", path: "#" },
        { icon: Bell, label: "Notifications", path: "#" },
        { icon: Lock, label: "Security & Privacy", path: "#" },
        { icon: CreditCard, label: "Linked Accounts", path: "#" },
      ],
    },
    {
      items: [
        { icon: Crown, label: "Upgrade to Premium", path: "/premium", highlight: true },
        { icon: Settings, label: "App Settings", path: "#" },
        { icon: HelpCircle, label: "Help & Support", path: "#" },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00d9ff]/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/home")}
            className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#00d9ff]/10 to-[#00ff88]/10 backdrop-blur-sm p-6 rounded-3xl border border-white/10 mb-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00d9ff]/5 to-transparent" />
          <div className="relative flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#00d9ff] to-[#00ff88] rounded-full flex items-center justify-center text-black text-2xl font-black">
              {isProfileLoading ? "…" : initials}
            </div>
            <div className="flex-1">
              <h2 className="text-white text-xl font-bold mb-1">
                {isProfileLoading ? "Loading…" : displayName}
              </h2>
              <p className="text-white/60 text-sm truncate">
                {isProfileLoading ? "…" : email || "No email on file"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="bg-white/10 px-3 py-1 rounded-full">
                  <span className="text-white/80 text-xs">Free Plan</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
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
                  } ${item.highlight ? "bg-gradient-to-r from-[#ffd60a]/10 to-transparent" : "hover:bg-white/5"}`}
                >
                  <div
                    className={`p-2.5 rounded-xl ${
                      item.highlight
                        ? "bg-gradient-to-br from-[#ffd60a] to-[#ff9500]"
                        : "bg-white/10"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={item.highlight ? "text-black" : "text-white/80"}
                    />
                  </div>
                  <span
                    className={`flex-1 text-left ${
                      item.highlight ? "text-white font-semibold" : "text-white/80"
                    }`}
                  >
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
            {isLoggingOut ? "Signing out…" : "Log Out"}
          </span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/40 text-xs text-center mt-8"
        >
          Spendr v1.0.0
        </motion.p>
      </div>

      <BottomNav />
    </div>
  );
}
