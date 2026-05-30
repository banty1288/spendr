import { Bell } from "lucide-react";
import { motion } from "motion/react";

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}

export function NotificationBell({ unreadCount, onClick }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      aria-label="Notifications"
    >
      <Bell size={20} className="text-white" />
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1 right-1 w-4 h-4 bg-[#ff3366] rounded-full border-2 border-black flex items-center justify-center"
        >
          <span className="text-[9px] font-bold text-white leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        </motion.div>
      )}
    </button>
  );
}
