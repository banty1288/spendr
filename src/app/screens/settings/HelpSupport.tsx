import { useState } from "react";
import { ArrowLeft, MessageSquare, Send, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuthStore } from "../../../store/authStore";
import { toast } from "sonner";

export function HelpSupport() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!user?.uid) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "users", user.uid, "support_requests"), {
        email: user?.email,
        message,
        status: "open",
        createdAt: serverTimestamp(),
      });
      toast.success("Support ticket submitted! We'll be in touch soon.");
      setMessage("");
    } catch (err: any) {
      console.error("Support submission error:", err);
      toast.error(`Failed to submit ticket: ${err.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-safe-nav relative overflow-hidden">
      <div className="relative z-10">
        <div className="px-6 pt-12 pb-6 sticky top-0 z-50 backdrop-blur-md bg-background/30 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="bg-white/5 p-3 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Help & Support</h1>
          </div>
        </div>

        <div className="px-6 mt-6 max-w-2xl mx-auto space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-white/80 font-semibold px-2">Frequently Asked Questions</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/10">
              <div className="p-4">
                <h3 className="text-white font-medium">How is my data used by Gemini?</h3>
                <p className="text-white/60 text-sm mt-1">Your transaction data is anonymized before being sent to the AI model. No personal identifiers are shared.</p>
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium">Can I export my data?</h3>
                <p className="text-white/60 text-sm mt-1">Export functionality is currently under development and will be available soon.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <MessageSquare size={18} className="text-[#00d9ff]" />
              <h2 className="text-white/80 font-semibold">Contact Support</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or provide feedback..."
                className="w-full bg-background/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d9ff] min-h-[120px] resize-none"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88] text-black font-bold py-3 rounded-xl shadow-lg shadow-[#00d9ff]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
