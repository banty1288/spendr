import { motion } from "motion/react";
import type { ChatMessage as ChatMessageType } from "../../../store/assistantStore";
import { Sparkles, User, CheckCircle, XCircle } from "lucide-react";

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
          isUser
            ? "bg-white/10"
            : "bg-gradient-to-br from-[#00d9ff]/30 to-[#9d4edd]/30 border border-[#9d4edd]/30"
        }`}
      >
        {isUser ? (
          <User size={14} className="text-white/60" />
        ) : (
          <Sparkles size={14} className="text-[#9d4edd]" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-[#00d9ff]/15 to-[#9d4edd]/15 border border-[#9d4edd]/20 text-white rounded-tr-sm"
            : "bg-white/5 border border-white/8 text-white/90 rounded-tl-sm"
        }`}
      >
        {/* Action result badge */}
        {message.isAction && message.actionResult && (
          <div
            className={`flex items-center gap-1 text-xs mb-1.5 font-medium ${
              message.actionResult === "success"
                ? "text-[#00ff88]"
                : "text-[#ff3366]"
            }`}
          >
            {message.actionResult === "success" ? (
              <CheckCircle size={12} />
            ) : (
              <XCircle size={12} />
            )}
            <span>
              {message.actionResult === "success" ? "Done" : "Failed"}
            </span>
          </div>
        )}

        {/* Message text — preserve newlines */}
        {message.content.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            {i < message.content.split("\n").length - 1 && <br />}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
