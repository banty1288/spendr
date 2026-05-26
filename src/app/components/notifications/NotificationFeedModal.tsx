import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, AlertTriangle, TrendingUp, Zap, Target, Flame, Lightbulb, ShieldCheck, HeartPulse } from "lucide-react";
import { formatRelativeTime } from "../../../lib/transactions/format";
import type { SmartNotification, NotificationType } from "../../../types/notification";

interface NotificationFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SmartNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onGenerateCoaching: () => void;
  isGenerating: boolean;
}

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case "warning": return <AlertTriangle size={16} className="text-[#ff3366]" />;
    case "encouragement": return <HeartPulse size={16} className="text-[#00ff88]" />;
    case "streak": return <Flame size={16} className="text-[#ff6b35]" />;
    case "challenge": return <Target size={16} className="text-[#00d9ff]" />;
    case "emotional": return <TrendingUp size={16} className="text-[#9d4edd]" />;
    case "coaching": return <Lightbulb size={16} className="text-[#ffd60a]" />;
    case "milestone": return <ShieldCheck size={16} className="text-[#00ff88]" />;
    case "badge": return <Zap size={16} className="text-[#00d9ff]" />;
    case "insight":
    case "summary":
    default: return <Sparkles size={16} className="text-[#c77dff]" />;
  }
};

export function NotificationFeedModal({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onGenerateCoaching,
  isGenerating
}: NotificationFeedModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60  z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-zinc-900 border-l border-border z-50 flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Notifications</h2>
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={onMarkAllAsRead} className="text-xs text-white/50 hover:text-white transition-colors">
                    Mark all as read
                  </button>
                  <button 
                    onClick={onGenerateCoaching}
                    disabled={isGenerating}
                    className="text-xs text-[#00d9ff] hover:text-[#00ff88] transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? "Analyzing..." : "Generate Coaching"}
                  </button>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-card shadow-sm hover:bg-white/10 rounded-full transition-colors text-white/60"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center text-white/40 mt-10">
                  <Sparkles size={32} className="mx-auto mb-3 opacity-20" />
                  <p>You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border ${notif.status === 'unread' ? 'bg-white/10 border-white/20' : 'bg-card shadow-sm border-white/5'} cursor-pointer transition-colors`}
                    onClick={() => {
                      if (notif.status === 'unread') onMarkAsRead(notif.id);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-background/30 rounded-xl">
                        {getIconForType(notif.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-white font-semibold text-sm">{notif.title}</h4>
                          <span className="text-[10px] text-white/40 whitespace-nowrap">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${notif.status === 'unread' ? 'text-white/80' : 'text-white/50'}`}>
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
