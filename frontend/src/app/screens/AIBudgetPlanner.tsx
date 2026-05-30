import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  ArrowLeft,
  BrainCircuit,
  TrendingDown,
  Activity,
  Target
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAIBudget } from "../../hooks/useAIBudget";
import { useTransactions } from "../../hooks/useTransactions";
import { useCurrency } from "../../hooks/useCurrency";
import { format } from "date-fns";
import { getCategoryById } from "../../lib/transactions/constants";

export function AIBudgetPlanner() {
  const navigate = useNavigate();
  const { convertAndFormat } = useCurrency();
  const [currentMonth] = useState(format(new Date(), "yyyy-MM"));
  
  const { transactions } = useTransactions();
  const { data: budget, isGenerating, generateBudget, isLoading } = useAIBudget(currentMonth);

  const handleGenerate = async () => {
    // Only pass expenses from this month to the AI to prevent massive payloads
    const thisMonthTx = transactions.filter(t => t.date.startsWith(currentMonth) && t.type === 'expense');
    await generateBudget(thisMonthTx);
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-3xl mx-auto w-full h-screen overflow-y-auto pb-32">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl">
            <BrainCircuit className="text-indigo-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Budget Planner</h1>
            <p className="text-white/40 text-sm">Powered by Gemini</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-white/40">Loading budget...</div>
        </div>
      ) : !budget && !isGenerating ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-3xl p-8 text-center flex flex-col items-center justify-center flex-1"
        >
          <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
            <Sparkles size={40} className="text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Ready to plan {format(new Date(), "MMMM")}?</h2>
          <p className="text-white/60 mb-8 max-w-md">
            Our AI will analyze your spending habits, income, and past transactions to generate a highly personalized, realistic budget limit for each category.
          </p>
          <button
            onClick={handleGenerate}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Sparkles size={20} />
            Generate Smart Budget
          </button>
        </motion.div>
      ) : isGenerating ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6" />
          <p className="text-white font-medium animate-pulse">Analyzing your spending DNA...</p>
          <p className="text-white/40 text-sm mt-2">Gemini is crunching the numbers</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <Target size={16} /> Total Budget
              </div>
              <div className="text-2xl font-bold text-white">
                {convertAndFormat(budget?.totalBudgetLimit || 0)}
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <Activity size={16} /> Health Score
              </div>
              <div className="text-2xl font-bold text-[#00ff88]">
                {budget?.healthScore || 0}/100
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <TrendingDown size={16} /> Saving Goal
              </div>
              <div className="text-2xl font-bold text-indigo-400">
                {convertAndFormat(budget?.savingGoalSuggestion || 0)}
              </div>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <BrainCircuit size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-indigo-400 font-bold flex items-center gap-2 mb-3">
                <Sparkles size={18} /> AI Insight
              </h3>
              <p className="text-white/80 leading-relaxed text-sm md:text-base">
                {budget?.aiExplanation}
              </p>
            </div>
          </div>

          {/* Categories */}
          <h3 className="text-lg font-bold text-white mt-8 mb-4">Recommended Limits</h3>
          <div className="space-y-3">
            {budget?.categories.map((cat, idx) => {
              const categoryDetails = getCategoryById(cat.categoryId);
              const progress = Math.min((cat.currentSpending / cat.recommendedLimit) * 100, 100) || 0;
              const isOver = cat.currentSpending > cat.recommendedLimit;

              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={cat.categoryId} 
                  className="bg-card border border-border rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl">
                        {categoryDetails.icon}
                      </div>
                      <div>
                        <div className="font-medium text-white">{categoryDetails.label}</div>
                        <div className="text-xs text-white/40">
                          {convertAndFormat(cat.currentSpending)} spent
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{convertAndFormat(cat.recommendedLimit)}</div>
                      <div className="text-xs text-white/40">limit</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-indigo-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="pt-6 flex justify-center">
             <button
              onClick={handleGenerate}
              className="text-white/40 text-sm hover:text-white flex items-center gap-2"
            >
              <Sparkles size={14} /> Regenerate Budget
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
