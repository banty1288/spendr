import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X } from "lucide-react";
import { useAssistantStore } from "../../../store/assistantStore";

export function AIAssistantTrigger() {
  const { isOpen, toggle } = useAssistantStore();

  return (
    <motion.button
      id="ai-assistant-trigger"
      aria-label="Open AI Assistant"
      onClick={toggle}
      className="fixed bottom-[88px] right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9d4edd]"
      style={{
        background: isOpen
          ? "linear-gradient(135deg, #ff3366, #9d4edd)"
          : "linear-gradient(135deg, #00d9ff, #9d4edd)",
        boxShadow: isOpen
          ? "0 0 24px rgba(157,78,221,0.6), 0 4px 16px rgba(0,0,0,0.4)"
          : "0 0 24px rgba(0,217,255,0.4), 0 4px 16px rgba(0,0,0,0.4)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      {/* Subtle pulse ring when closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,217,255,0.3), rgba(157,78,221,0.3))",
            }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <X size={22} className="text-white" />
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Sparkles size={22} className="text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
