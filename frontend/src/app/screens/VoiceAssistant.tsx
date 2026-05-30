import { useEffect, useRef } from "react";
import { X, MicOff, Mic } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useVoiceAssistant } from "../../hooks/useVoiceAssistant";
import { VoiceOrb } from "../components/voice/VoiceOrb";

export function VoiceAssistant() {
  const navigate = useNavigate();
  const { state, transcripts, startSession, stopSession } = useVoiceAssistant();
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startSession();
    return () => stopSession();
  }, [startSession, stopSession]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  const stateMessages = {
    idle: "Ready to start",
    connecting: "Connecting to Gemini...",
    listening: "Listening...",
    thinking: "Thinking...",
    speaking: "Speaking...",
    error: "Connection failed"
  };

  return (
    <div className="fixed inset-0 bg-[#09090b] z-[100] flex flex-col items-center justify-between p-6 overflow-hidden">
      {/* Header */}
      <div className="w-full flex justify-between items-center z-10 pt-safe">
        <div className="bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
          <span className="text-white/80 text-sm font-medium tracking-wide">Aoede Assistant</span>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white backdrop-blur-md"
        >
          <X size={24} />
        </button>
      </div>

      {/* Transcript Area */}
      <div className="flex-1 w-full max-w-lg mt-8 mb-4 overflow-y-auto scrollbar-hide relative z-10 flex flex-col gap-4 px-2"
           style={{ maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }}>
        {transcripts.length === 0 && (
          <div className="text-white/40 text-center m-auto text-lg font-light max-w-[250px]">
            Try saying: "Create a budget for food" or "What did I spend this week?"
          </div>
        )}
        <AnimatePresence>
          {transcripts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-lg font-medium leading-relaxed ${
                t.isUser ? "text-right text-white/60" : "text-left text-white"
              }`}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={transcriptEndRef} className="h-20 shrink-0" />
      </div>

      {/* Interactive Orb */}
      <div className="relative z-10 mb-8 flex flex-col items-center">
        <VoiceOrb state={state} />
        
        <motion.p 
          className="mt-8 text-white/50 text-sm font-medium uppercase tracking-widest"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {stateMessages[state]}
        </motion.p>
      </div>

      {/* Controls */}
      <div className="w-full flex justify-center pb-safe mb-8 z-10">
        <button 
          onClick={() => state === 'listening' ? stopSession() : startSession()}
          className={`p-6 rounded-full transition-colors backdrop-blur-md shadow-lg ${
            state === 'listening' 
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {state === 'listening' || state === 'speaking' || state === 'thinking' ? <Mic size={32} /> : <MicOff size={32} />}
        </button>
      </div>
    </div>
  );
}
