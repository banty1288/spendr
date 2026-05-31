import React, { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Users, Receipt, PieChart, TrendingUp, IndianRupee } from 'lucide-react';
import { BillSplit, BillParticipant, SplitMethod } from '../../../types/billSplit';
import { calculateSplit, ParticipantDraft } from '../../../lib/settlementEngine';
import { useAuthStore } from '../../../store/authStore';

interface CreateBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bill: Omit<BillSplit, "id" | "createdAt" | "status">, participants: Omit<BillParticipant, "id" | "billId" | "joinedAt">[]) => Promise<string>;
}

export function CreateBillModal({ isOpen, onClose, onSubmit }: CreateBillModalProps) {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Dining');
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  
  const [draftParticipants, setDraftParticipants] = useState<ParticipantDraft[]>([
    { userId: user?.uid || 'temp-id', name: user?.displayName || 'You', amountPaid: 0, amountOwed: 0 }
  ]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantUpi, setNewParticipantUpi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = parseFloat(amount) || 0;

  // Recalculate splits whenever amount or method changes
  const computedParticipants = calculateSplit(totalAmount, draftParticipants, splitMethod);

  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) return;
    setDraftParticipants([...draftParticipants, {
      userId: `manual-${Date.now()}`,
      name: newParticipantName.trim(),
      upiId: newParticipantUpi.trim(),
      amountPaid: 0,
      amountOwed: 0,
      shares: 1,
      percentage: 0
    }]);
    setNewParticipantName('');
    setNewParticipantUpi('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || totalAmount <= 0 || computedParticipants.length === 0) return;
    
    setIsSubmitting(true);
    
    const bill: Omit<BillSplit, "id" | "createdAt" | "status"> = {
      title,
      description,
      totalAmount,
      currency: "INR",
      category,
      splitMethod,
      createdBy: user?.uid || 'unknown',
      createdByName: user?.displayName || 'Unknown',
      date: new Date().toISOString(),
    };

    const participantsData: Omit<BillParticipant, "id" | "billId" | "joinedAt">[] = computedParticipants.map(p => ({
      userId: p.userId,
      name: p.name,
      amountPaid: p.amountPaid,
      amountOwed: p.amountOwed,
      status: p.amountPaid >= p.amountOwed ? 'paid' : 'pending',
      shares: p.shares,
      percentage: p.percentage,
      upiId: p.upiId,
    }));

    try {
      await onSubmit(bill, participantsData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              Create Bill Split
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
            <form id="create-bill-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Bill Name</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    placeholder="e.g., Goa Trip, Dinner"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Amount</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        required
                        min="1"
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 [&>option]:bg-zinc-800"
                    >
                      <option value="Dining">Dining</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Travel">Travel</option>
                      <option value="Rent">Rent</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Entertainment">Entertainment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Split Method</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'equal', icon: Users, label: 'Equal' },
                      { id: 'percentage', icon: PieChart, label: '%' },
                      { id: 'custom', icon: IndianRupee, label: 'Custom' },
                      { id: 'share', icon: TrendingUp, label: 'Shares' },
                    ].map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSplitMethod(method.id as SplitMethod)}
                        className={`p-3 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                          splitMethod === method.id 
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        <method.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Participants</label>
                  
                  {/* Add Participant Input */}
                  <div className="flex gap-2 mb-4 bg-white/5 p-2 rounded-xl border border-white/10">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={newParticipantName}
                        onChange={e => setNewParticipantName(e.target.value)}
                        placeholder="Friend's Name"
                        className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                      />
                      <input
                        type="text"
                        value={newParticipantUpi}
                        onChange={e => setNewParticipantUpi(e.target.value)}
                        placeholder="UPI ID (optional)"
                        className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddParticipant}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* List Participants */}
                  <div className="space-y-2">
                    {computedParticipants.map((p, index) => (
                      <div key={p.userId} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-medium">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{p.name}</p>
                            {p.upiId && <p className="text-white/40 text-xs">{p.upiId}</p>}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Method Specific Inputs */}
                          {splitMethod === 'percentage' && (
                            <div className="flex items-center bg-black/20 rounded-lg px-2">
                              <input
                                type="number"
                                value={p.percentage || ''}
                                onChange={e => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const newDrafts = [...draftParticipants];
                                  newDrafts[index].percentage = val;
                                  setDraftParticipants(newDrafts);
                                }}
                                className="w-12 bg-transparent text-right text-sm text-white py-1 focus:outline-none"
                                placeholder="0"
                              />
                              <span className="text-white/40 text-sm ml-1">%</span>
                            </div>
                          )}
                          
                          {splitMethod === 'custom' && (
                            <div className="flex items-center bg-black/20 rounded-lg px-2">
                              <span className="text-white/40 text-sm mr-1">₹</span>
                              <input
                                type="number"
                                value={p.amountOwed || ''}
                                onChange={e => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const newDrafts = [...draftParticipants];
                                  newDrafts[index].amountOwed = val;
                                  setDraftParticipants(newDrafts);
                                }}
                                className="w-16 bg-transparent text-right text-sm text-white py-1 focus:outline-none"
                                placeholder="0"
                              />
                            </div>
                          )}

                          {splitMethod === 'share' && (
                            <div className="flex items-center bg-black/20 rounded-lg px-2">
                              <input
                                type="number"
                                value={p.shares || 1}
                                onChange={e => {
                                  const val = parseFloat(e.target.value) || 1;
                                  const newDrafts = [...draftParticipants];
                                  newDrafts[index].shares = val;
                                  setDraftParticipants(newDrafts);
                                }}
                                className="w-12 bg-transparent text-right text-sm text-white py-1 focus:outline-none"
                                placeholder="1"
                              />
                              <span className="text-white/40 text-sm ml-1">sh</span>
                            </div>
                          )}

                          {splitMethod === 'equal' && (
                            <div className="text-right">
                              <p className="text-white font-medium">₹{p.amountOwed.toFixed(2)}</p>
                            </div>
                          )}
                          
                          {/* Who Paid Checkbox / Input */}
                          <div className="ml-2 pl-2 border-l border-white/10 flex flex-col items-end">
                            <span className="text-[10px] text-white/40 uppercase mb-1">Paid</span>
                            <input
                              type="number"
                              value={p.amountPaid || ''}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0;
                                const newDrafts = [...draftParticipants];
                                newDrafts[index].amountPaid = val;
                                setDraftParticipants(newDrafts);
                              }}
                              className="w-16 bg-black/20 border border-white/10 rounded px-2 py-1 text-right text-sm text-emerald-400 focus:outline-none"
                              placeholder="0"
                            />
                          </div>
                          
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newDrafts = [...draftParticipants];
                                newDrafts.splice(index, 1);
                                setDraftParticipants(newDrafts);
                              }}
                              className="p-1 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors ml-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="p-5 border-t border-white/10 bg-black/20">
            <button
              type="submit"
              form="create-bill-form"
              disabled={isSubmitting || totalAmount <= 0}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Bill Split'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
