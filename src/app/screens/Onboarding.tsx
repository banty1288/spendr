import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Sparkles, TrendingUp, ChevronRight } from "lucide-react";

const slides = [
  {
    icon: Sparkles,
    gradient: "from-[#00d9ff] to-[#0099ff]",
    title: "AI-Powered Insights",
    description: "Get personalized spending analysis powered by advanced AI that understands your unique money habits",
  },
  {
    icon: Brain,
    gradient: "from-[#9d4edd] to-[#c77dff]",
    title: "Know Your Money Personality",
    description: "Discover your financial personality type and learn how emotions drive your spending decisions",
  },
  {
    icon: TrendingUp,
    gradient: "from-[#00ff88] to-[#00d9a5]",
    title: "Gamified Growth",
    description: "Level up your finances with streaks, rewards, and achievements that make saving fun and addictive",
  },
];

export function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/login");
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a14] to-black" />

      <div className="absolute inset-0 opacity-20">


      </div>

      <button
        onClick={() => navigate("/login")}
        className="absolute top-8 right-6 z-20 text-white/60 px-4 py-2"
      >
        Skip
      </button>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <div className={`relative mb-12`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} rounded-3xl blur-2xl opacity-40`} />
              <div className={`relative bg-gradient-to-br ${slide.gradient} p-8 rounded-3xl`}>
                <Icon size={64} className="text-black" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4 max-w-xs">
              {slide.title}
            </h2>

            <p className="text-white/60 text-lg leading-relaxed max-w-sm">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 px-8 pb-12">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? `w-8 bg-gradient-to-r ${slide.gradient}`
                  : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className={`w-full bg-gradient-to-r ${slide.gradient} text-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-${slide.gradient}/20`}
        >
          <span className="font-semibold text-lg">
            {currentSlide < slides.length - 1 ? "Next" : "Get Started"}
          </span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
