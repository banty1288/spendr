import { Loader2 } from "lucide-react";

interface AuthLoadingScreenProps {
  message?: string;
}

export function AuthLoadingScreen({
  message = "Loading…",
}: AuthLoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-black">
      <Loader2 className="w-8 h-8 text-[#00d9ff] animate-spin" />
      <p className="text-white/50 text-sm">{message}</p>
    </div>
  );
}
