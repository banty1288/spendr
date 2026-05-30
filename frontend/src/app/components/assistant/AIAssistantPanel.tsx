import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  Mic,
  MicOff,
  Send,
  MessageSquare,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useAssistantStore } from "../../../store/assistantStore";
import { useAIChat } from "../../../hooks/useAIChat";
import { useVoiceAssistant } from "../../../hooks/useVoiceAssistant";
import { ChatMessage } from "./ChatMessage";
import { InlineVoiceOrb } from "./InlineVoiceOrb";

const QUICK_CHIPS = [
  { label: "📊 Analyze Spending", prompt: "Analyze my spending patterns this month" },
  { label: "💰 Create Budget", prompt: "Help me create a budget for food this month" },
  { label: "🎯 Saving Tips", prompt: "Give me 3 personalized saving tips based on my expenses" },
  { label: "📅 Weekly Summary", prompt: "Summarize my spending for this week" },
];

const VOICE_STATE_LABELS: Record<string, string> = {
  idle: "Tap to speak",
  connecting: "Connecting...",
  listening: "Listening...",
  thinking: "Thinking...",
  speaking: "Speaking...",
  error: "Voice failed",
};

export function AIAssistantPanel() {
  const { isOpen, close, inputMode, setInputMode, messages, clearMessages } =
    useAssistantStore();
  const { sendMessage, isLoading } = useAIChat();
  const [inputText, setInputText] = useState("");
  const [fallbackNotice, setFallbackNotice] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFallbackToText = useCallback(
    (reason: string) => {
      setInputMode("text");
      setFallbackNotice(reason);
      setTimeout(() => setFallbackNotice(""), 5000);
    },
    [setInputMode]
  );

  const { state: voiceState, startSession: startVoice, stopSession: stopVoice, sendText } = useVoiceAssistant();

  // Watch for voice errors and fallback
  useEffect(() => {
    if (voiceState === "error") {
      handleFallbackToText("Voice connection failed. Using chat mode.");
    }
  }, [voiceState, handleFallbackToText]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens in text mode
  useEffect(() => {
    if (isOpen && inputMode === "text") {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen, inputMode]);

  // Stop voice when panel closes
  useEffect(() => {
    if (!isOpen) {
      stopVoice();
    }
  }, [isOpen, stopVoice]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text && inputMode === "text") return;
    setInputText("");
    
    if (voiceState === "listening" || voiceState === "thinking" || voiceState === "speaking") {
      // Send text over the live voice websocket
      sendText(text || "Please respond now.");
    } else {
      // Fallback to normal text chat
      sendMessage(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChip = (prompt: string) => {
    setInputMode("text");
    if (voiceState === "listening" || voiceState === "thinking" || voiceState === "speaking") {
      sendText(prompt);
    } else {
      sendMessage(prompt);
    }
  };

  const forceReply = () => {
    if (voiceState === "listening") {
      sendText("Respond to what I just said.");
    }
  };

  const toggleVoice = () => {
    if (voiceState === "idle" || voiceState === "error") {
      setInputMode("voice");
      startVoice();
    } else {
      stopVoice();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — mobile only */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[55] md:hidden"
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            id="ai-assistant-panel"
            role="dialog"
            aria-label="AI Financial Assistant"
            aria-modal="true"
            // Mobile: bottom sheet
            // Desktop: side drawer from right
            className={[
              "fixed z-[60] flex flex-col overflow-hidden",
              "bg-[#0d0d10]/98 backdrop-blur-xl",
              "border border-white/10",
              // Mobile: full-width bottom sheet, 78vh tall
              "bottom-0 left-0 right-0 rounded-t-3xl",
              "md:bottom-6 md:right-6 md:left-auto md:rounded-2xl md:w-[400px]",
              // Heights
              "h-[78vh] md:h-[600px] max-h-[90vh]",
            ].join(" ")}
            style={{
              boxShadow:
                "0 -4px 60px rgba(0,217,255,0.08), 0 -2px 30px rgba(157,78,221,0.08), 0 0 0 1px rgba(255,255,255,0.06)",
            }}
            initial={{ opacity: 0, y: "100%", scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "100%", scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 30,
            }}
          >
            {/* Top gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00d9ff]/60 to-transparent" />

            {/* Handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/6">
              {/* Logo */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00d9ff]/20 to-[#9d4edd]/20 border border-[#9d4edd]/30 flex items-center justify-center shrink-0">
                <Sparkles size={15} className="text-[#9d4edd]" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-none">
                  Aoede
                </p>
                <p className="text-white/40 text-[11px] mt-0.5">
                  AI Financial Assistant
                </p>
              </div>

              {/* Mode toggle */}
              <div className="flex items-center bg-white/5 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setInputMode("text")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    inputMode === "text"
                      ? "bg-[#9d4edd]/30 text-[#9d4edd]"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <MessageSquare size={12} />
                  Text
                </button>
                <button
                  onClick={() => setInputMode("voice")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    inputMode === "voice"
                      ? "bg-[#00d9ff]/20 text-[#00d9ff]"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <Mic size={12} />
                  Voice
                </button>
              </div>

              {/* Clear + Close */}
              {messages.length > 0 && (
                <button
                  onClick={clearMessages}
                  className="p-2 text-white/30 hover:text-white/60 transition-colors rounded-xl hover:bg-white/5"
                  aria-label="Clear conversation"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                onClick={close}
                className="p-2 text-white/40 hover:text-white/80 transition-colors rounded-xl hover:bg-white/5"
                aria-label="Close assistant"
              >
                <X size={16} />
              </button>
            </div>

            {/* Fallback notice */}
            <AnimatePresence>
              {fallbackNotice && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-2 bg-[#ff6b35]/10 border-b border-[#ff6b35]/20 flex items-center gap-2"
                >
                  <AlertCircle size={13} className="text-[#ff6b35] shrink-0" />
                  <p className="text-[#ff6b35] text-xs">{fallbackNotice}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 overscroll-contain">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-4 pb-4"
                >
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d9ff]/10 to-[#9d4edd]/20 border border-[#9d4edd]/20 flex items-center justify-center">
                    <Sparkles size={28} className="text-[#9d4edd]" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-base">
                      Hi! I'm Aoede 👋
                    </p>
                    <p className="text-white/40 text-sm mt-1 max-w-[220px]">
                      Your AI financial assistant. Ask me anything about your
                      money.
                    </p>
                  </div>

                  {/* Quick chips */}
                  <div className="w-full flex flex-wrap gap-2 justify-center">
                    {QUICK_CHIPS.map((chip) => (
                      <button
                        key={chip.label}
                        onClick={() => handleChip(chip.prompt)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-white/70 hover:text-white text-xs font-medium transition-all"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 items-center"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00d9ff]/30 to-[#9d4edd]/30 border border-[#9d4edd]/30 flex items-center justify-center">
                    <Sparkles size={14} className="text-[#9d4edd]" />
                  </div>
                  <div className="flex gap-1 px-3.5 py-3 bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-white/40"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom input area */}
            <div className="border-t border-white/6 px-4 py-3">
              {inputMode === "voice" ? (
                /* Voice mode */
                <div className="flex flex-col items-center gap-3">
                  <InlineVoiceOrb state={voiceState} size="md" />
                  <p className="text-white/50 text-xs font-medium tracking-widest uppercase">
                    {VOICE_STATE_LABELS[voiceState]}
                  </p>
                  <div className="flex gap-2">
                    {voiceState === "listening" && (
                      <button
                        onClick={forceReply}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all bg-[#9d4edd]/15 text-[#9d4edd] border border-[#9d4edd]/30 hover:bg-[#9d4edd]/25"
                      >
                        <Send size={15} /> Send
                      </button>
                    )}
                    <button
                      onClick={toggleVoice}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                        voiceState === "idle" || voiceState === "error"
                          ? "bg-[#00d9ff]/15 text-[#00d9ff] border border-[#00d9ff]/30 hover:bg-[#00d9ff]/25"
                          : "bg-[#ff3366]/15 text-[#ff3366] border border-[#ff3366]/30 hover:bg-[#ff3366]/25"
                      }`}
                    >
                      {voiceState === "idle" || voiceState === "error" ? (
                        <>
                          <Mic size={15} /> Start Listening
                        </>
                      ) : (
                        <>
                          <MicOff size={15} /> Stop
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Text mode */
                <div className="flex gap-2 items-center">
                  <input
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your finances..."
                    disabled={isLoading}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#9d4edd]/50 focus:bg-white/8 transition-all disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || isLoading}
                    className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00d9ff] to-[#9d4edd] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_12px_rgba(0,217,255,0.4)] transition-all shrink-0"
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="text-white animate-spin" />
                    ) : (
                      <Send size={16} className="text-white" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Bottom safe area */}
            <div
              className="shrink-0"
              style={{
                height: "env(safe-area-inset-bottom, 0px)",
                minHeight: 0,
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
