import { motion } from "motion/react";
import { ArrowLeft, Crown, Check, Sparkles, Brain, TrendingUp, Lock } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { useNavigate } from "react-router";

export function Premium() {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Monthly",
      price: 9.99,
      period: "month",
      badge: null,
    },
    {
      name: "Yearly",
      price: 79.99,
      period: "year",
      badge: "Save 33%",
      popular: true,
    },
  ];

  const features = [
    {
      icon: Brain,
      title: "Advanced AI Insights",
      description: "Deep psychological spending analysis with predictive modeling",
      color: "#9d4edd",
    },
    {
      icon: TrendingUp,
      title: "Unlimited Goals",
      description: "Track unlimited savings goals and get personalized recommendations",
      color: "#00ff88",
    },
    {
      icon: Sparkles,
      title: "Priority Support",
      description: "24/7 premium support with financial advisors",
      color: "#00d9ff",
    },
    {
      icon: Lock,
      title: "Enhanced Security",
      description: "Bank-level encryption and biometric authentication",
      color: "#ffd60a",
    },
  ];

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#ffd60a]/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#9d4edd]/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/home")}
            className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Go Premium</h1>
            <p className="text-white/60 text-sm">Unlock unlimited potential</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#ffd60a]/20 to-[#ff9500]/20 backdrop-blur-sm p-8 rounded-3xl border border-[#ffd60a]/30 mb-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffd60a]/10 to-transparent" />
          <div className="relative">
            <div className="inline-block bg-gradient-to-br from-[#ffd60a] to-[#ff9500] p-4 rounded-3xl mb-4">
              <Crown size={40} className="text-black" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Spendr Premium</h2>
            <p className="text-white/70 max-w-sm mx-auto">
              Transform your financial future with AI-powered insights and unlimited features
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 gap-4">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`relative p-5 rounded-3xl border cursor-pointer transition-all ${
                  plan.popular
                    ? "bg-gradient-to-br from-[#00d9ff]/20 to-[#00ff88]/20 border-[#00d9ff] scale-105"
                    : "bg-white/5 backdrop-blur-sm border-white/10"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00d9ff] to-[#00ff88] px-3 py-1 rounded-full">
                    <span className="text-black text-xs font-bold">{plan.badge}</span>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-white/60 text-xs mb-1">{plan.name}</p>
                  <div className="mb-2">
                    <span className="text-white text-3xl font-black">${plan.price}</span>
                    <span className="text-white/60 text-sm">/{plan.period}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-white font-semibold mb-4">Premium Features</h3>
          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm p-5 rounded-3xl border border-white/10 relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10"
                    style={{ backgroundColor: feature.color }}
                  />
                  <div className="relative flex items-start gap-4">
                    <div
                      className="p-3 rounded-2xl shrink-0"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <Icon size={24} style={{ color: feature.color }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                      <p className="text-white/60 text-sm">{feature.description}</p>
                    </div>
                    <div
                      className="shrink-0 p-1 rounded-full"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <Check size={16} style={{ color: feature.color }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <button className="w-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88] text-black py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-[#00d9ff]/20">
            Start 7-Day Free Trial
          </button>
          <p className="text-white/40 text-xs text-center">
            Cancel anytime. No commitment required.
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
