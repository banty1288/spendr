import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, Sparkles, Loader2 } from "lucide-react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth, googleProvider } from "../../lib/firebase";
import { ensureUserDocument } from "../../lib/firebase/users";
import { waitForAuthUser } from "../../store/authStore";
import { toast } from "sonner";
import { trackLogin, trackSignup, trackPasswordReset, identifyUser } from "../../services/analytics";

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError && error.code === "auth/unauthorized-domain") {
    const host =
      typeof window !== "undefined" ? window.location.hostname : "localhost";
    return (
      `Firebase Auth is not authorized for "${host}". ` +
      "Add this domain in Firebase Console > Authentication > Settings > Authorized domains."
    );
  }

  return error instanceof Error ? error.message : "Authentication failed.";
}

export function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const resolveRedirect = async () => {
    const profile = await ensureUserDocument(undefined, true);
    return profile.onboardingCompleted ? "/home" : "/setup";
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    
    setIsLoading(true);
    try {
      let cred;
      if (isLogin) {
        cred = await signInWithEmailAndPassword(auth, email, password);
        trackLogin("email");
        toast.success("Successfully logged in!");
      } else {
        cred = await createUserWithEmailAndPassword(auth, email, password);
        trackSignup("email");
        toast.success("Account created successfully!");
      }
      await waitForAuthUser();
      identifyUser(cred.user.uid);
      const dest = await resolveRedirect();
      navigate(dest, { replace: true });
    } catch (error: unknown) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address to reset your password.");
      return;
    }
    
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      trackPasswordReset();
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: unknown) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      trackLogin("google");
      identifyUser(cred.user.uid);
      toast.success("Successfully logged in with Google!");
      await waitForAuthUser();
      const dest = await resolveRedirect();
      navigate(dest, { replace: true });
    } catch (error: unknown) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a14] to-black" />

      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-card rounded-full hidden" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-card rounded-full hidden" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-br from-[#00d9ff] to-[#00ff88] p-3 rounded-2xl">
              <Sparkles size={24} className="text-black" />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-[#00d9ff] to-[#00ff88] bg-clip-text text-transparent">
              Spendr
            </h1>
          </div>
          <p className="text-white/60 text-sm ml-1">Welcome back! Let's dive into your finances.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex-1 flex flex-col"
        >
          <h2 className="text-3xl font-bold text-white mb-8">
            {isLogin ? "Sign In" : "Create Account"}
          </h2>

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-card shadow-sm border border-border rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:border-[#00d9ff] focus:outline-none transition-colors"
              />
            </div>

            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-card shadow-sm border border-border rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:border-[#00d9ff] focus:outline-none transition-colors"
              />
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  disabled={isLoading || isGoogleLoading}
                  className="text-[#00d9ff] text-sm mb-4 hover:underline disabled:opacity-50"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88] text-black py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-[#00d9ff]/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-black" /> : (isLogin ? "Sign In" : "Sign Up")}
            </button>
          </form>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/40 text-sm">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-card shadow-sm border border-border py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
               <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-white font-medium">Google</span>
              </>
            )}
          </button>

          <div className="mt-auto pt-8 text-center">
            <span className="text-white/40">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#00d9ff] font-medium hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
