import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Receipt, ArrowRight, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useBillSplits, useBillSplitDetails } from '../../../hooks/useBillSplits';
import { useAuthStore } from '../../../store/authStore';

export function BillSplitWidget({ onCreateClick }: { onCreateClick: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { bills, isLoading } = useBillSplits();

  const activeBills = bills.filter(b => b.status !== 'settled');

  // To provide a real "Amount to Receive" and "Amount to Pay", we would need to know the settlements across all active bills.
  // For the dashboard widget, we can compute a naive approximation based on whether the user created the bill or not.
  // Or we can just show the number of active bills. Let's just show active bills count and the most recent one for now.
  
  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-5 border border-white/5 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
        <div className="h-16 bg-white/5 rounded-xl"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 border border-white/5 relative overflow-hidden"
    >
      <div className="flex justify-between items-center mb-4 relative z-10">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Receipt className="w-5 h-5 text-emerald-400" />
          Bill Splits
        </h2>
        <button 
          onClick={() => navigate('/bill-split')}
          className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors flex items-center gap-1"
        >
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="relative z-10">
        {activeBills.length === 0 ? (
          <div className="text-center py-4 bg-white/5 rounded-xl border border-white/5">
            <p className="text-white/60 text-sm">All settled up! No active bills.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-white/60">Active Splits</span>
              <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold">
                {activeBills.length}
              </span>
            </div>
            
            {activeBills.slice(0, 2).map(bill => (
              <div key={bill.id} onClick={() => navigate('/bill-split')} className="bg-white/5 hover:bg-white/10 transition-colors cursor-pointer p-3 rounded-xl border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-white font-medium text-sm">{bill.title}</p>
                  <p className="text-xs text-white/50">{new Date(bill.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold text-sm">₹{bill.totalAmount.toFixed(2)}</p>
                  <p className="text-[10px] text-emerald-400 uppercase tracking-wider">{bill.splitMethod}</p>
                </div>
              </div>
            ))}
            <button 
              onClick={onCreateClick}
              className="w-full mt-2 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              Create Smart Split
            </button>
          </div>
        )}
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
    </motion.div>
  );
}
