import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Plus, History, ArrowUpRight, ArrowDownLeft, Activity } from 'lucide-react';
import { useBillSplits, useBillSplitDetails } from '../../hooks/useBillSplits';
import { CreateBillModal } from '../components/billsplit/CreateBillModal';
import { SettlementCard } from '../components/billsplit/SettlementCard';
import { PageShell } from '../components/ui/PageShell';
import { computeSettlements } from '../../lib/settlementEngine';
import { useAuthStore } from '../../store/authStore';

export function BillSplit() {
  const { user } = useAuthStore();
  const { bills, isLoading, createSplit } = useBillSplits();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

  // Active vs Settled
  const activeBills = bills.filter(b => b.status !== 'settled');
  const settledBills = bills.filter(b => b.status === 'settled');

  // Simple aggregation for dashboard (Wait for individual details for full settlements)
  // For now, we will just pass down a SelectedBill details view when a bill is clicked.

  return (
    <PageShell>
      <div className="space-y-6 px-4 md:px-8 pt-8">
        <h1 className="text-2xl font-bold text-white mb-6">Bill Split</h1>
        
        {/* Quick Actions & Summary */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="col-span-2 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-semibold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create New Split
          </button>
        </div>

        {/* Active Bills */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Active Bills
          </h2>
          
          {isLoading ? (
            <div className="text-center text-white/50 py-8">Loading bills...</div>
          ) : activeBills.length === 0 ? (
            <div className="text-center bg-white/5 border border-white/10 rounded-2xl p-8">
              <Receipt className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white font-medium">No active bills</p>
              <p className="text-sm text-white/50">You're all settled up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBills.map(bill => (
                <div 
                  key={bill.id} 
                  onClick={() => setSelectedBillId(selectedBillId === bill.id ? null : bill.id)}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-medium">{bill.title}</h3>
                      <p className="text-xs text-white/50">{new Date(bill.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold flex items-center justify-end">
                        ₹{bill.totalAmount.toFixed(2)}
                      </p>
                      <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10">
                        {bill.splitMethod}
                      </span>
                    </div>
                  </div>
                  
                  {/* Expandable Details */}
                  {selectedBillId === bill.id && (
                    <BillDetailsView billId={bill.id} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settled Bills */}
        {settledBills.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-white/50" />
              Recent History
            </h2>
            <div className="space-y-3">
              {settledBills.slice(0, 3).map(bill => (
                <div key={bill.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 opacity-75">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-medium">{bill.title}</h3>
                      <p className="text-xs text-white/40">{new Date(bill.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 font-semibold">₹{bill.totalAmount.toFixed(2)}</p>
                      <p className="text-xs text-emerald-400">Settled</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <CreateBillModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createSplit}
      />
    </PageShell>
  );
}

// Subcomponent to fetch and render details for a specific expanded bill
function BillDetailsView({ billId }: { billId: string }) {
  const { participants, activities, markParticipantPaid } = useBillSplitDetails(billId);
  const { user } = useAuthStore();

  const settlements = useMemo(() => computeSettlements(participants), [participants]);
  const userSettlements = settlements.filter(s => s.payerId === user?.uid || s.receiverId === user?.uid);

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="mt-4 pt-4 border-t border-white/10"
      onClick={e => e.stopPropagation()} // Prevent closing when interacting inside
    >
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Settlements</h4>
        {settlements.length === 0 ? (
          <p className="text-sm text-emerald-400 font-medium bg-emerald-500/10 p-2 rounded-lg text-center">
            All settled!
          </p>
        ) : (
          <div className="space-y-2">
            {settlements.map((s, idx) => {
              // Find the participant doc ID for the payer so we can update their amountPaid
              const payerParticipant = participants.find(p => p.userId === s.payerId);
              
              return (
                <SettlementCard 
                  key={idx}
                  debt={s}
                  receiverUpiId={participants.find(p => p.userId === s.receiverId)?.upiId}
                  onMarkPaid={async (debt) => {
                    if (!payerParticipant) return;
                    await markParticipantPaid({
                      payerId: debt.payerId,
                      receiverId: debt.receiverId,
                      amount: debt.amount,
                      billId: billId,
                    }, payerParticipant.id, debt.amount);
                  }}
                />
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Activity Log</h4>
        <div className="space-y-2">
          {activities.slice(0, 5).map(act => (
            <div key={act.id} className="text-xs text-white/60 bg-black/20 p-2 rounded-lg">
              <span className="font-semibold text-white/80">{act.actorName}</span> {act.message}
              <span className="block text-[10px] text-white/30 mt-0.5">
                {new Date(act.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
