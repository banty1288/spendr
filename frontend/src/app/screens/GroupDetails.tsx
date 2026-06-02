import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Plus, Users, Receipt, Activity, UserPlus } from 'lucide-react';
import { PageShell } from '../components/ui/PageShell';
import { getGroupDetails, getGroupMembers } from '../../lib/firebase/groups';
import { subscribeToGroupBillSplits, subscribeToBillParticipants, createBillSplitData } from '../../lib/firebase/billSplits';
import { useGroupDetails } from '../../hooks/useGroups';
import { Group, GroupMember } from '../../types/groups';
import { BillSplit, BillParticipant } from '../../types/billSplit';
import { useAuthStore } from '../../store/authStore';
import { AddMemberModal } from '../components/groups/AddMemberModal';
import { AddGroupExpenseModal } from '../components/groups/AddGroupExpenseModal';
import { computeGroupSettlements, computeSettlements } from '../../lib/settlementEngine';
import { SettlementCard } from '../components/billsplit/SettlementCard';
import { PaymentRequestCard } from '../components/billsplit/PaymentRequestCard';
import { PaymentRequest } from '../../types/paymentRequest';
import { subscribeToGroupPaymentRequests, createPaymentRequest } from '../../lib/firebase/paymentRequests';
import { toast } from 'sonner';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { createSettlement } from '../../lib/firebase/billSplits';

export function GroupDetails() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { group, members, isLoading: loading, refetch: fetchMembers } = useGroupDetails(groupId);

  const [bills, setBills] = useState<BillSplit[]>([]);
  const [allParticipants, setAllParticipants] = useState<BillParticipant[]>([]);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'members'>('expenses');
  
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  useEffect(() => {
    if (!groupId) return;

    // Subscribe to bills
    const unsubBills = subscribeToGroupBillSplits(groupId, (fetchedBills) => {
      setBills(fetchedBills);
    });

    const unsubRequests = subscribeToGroupPaymentRequests(groupId, (fetchedRequests) => {
      setRequests(fetchedRequests);
    });

    return () => {
      unsubBills();
      unsubRequests();
    };
  }, [groupId]);

  // We need to fetch participants for all bills to compute balances
  useEffect(() => {
    if (bills.length === 0) {
      setAllParticipants([]);
      return;
    }

    let unsubs: Array<() => void> = [];
    let participantsMap: Record<string, BillParticipant[]> = {};

    bills.forEach(bill => {
      const unsub = subscribeToBillParticipants(bill.id, (p) => {
        participantsMap[bill.id] = p;
        // Flatten and update state
        const flat = Object.values(participantsMap).flat();
        setAllParticipants(flat);
      });
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach(u => u());
    };
  }, [bills]);

  const handleCreateExpense = async (billData: Omit<BillSplit, "id" | "createdAt" | "status">, parts: Omit<BillParticipant, "id" | "billId" | "joinedAt">[]) => {
    try {
      await createBillSplitData(billData, parts);
      toast.success("Expense added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add expense");
    }
  };

  const groupSettlements = useMemo(() => {
    if (allParticipants.length === 0) return [];
    return computeGroupSettlements(allParticipants);
  }, [allParticipants]);

  // Handler for settling a debt inside the group
  const handleMarkPaid = async (debt: any) => {
    try {
      // Find a participant record where payer owes money to receiver to decrement.
      // Since debts are aggregated, this is tricky. We'd ideally create a "settlement" bill.
      // For this implementation, we create a dummy "settlement" expense that cancels the debt out!
      
      const billData: Omit<BillSplit, "id" | "createdAt" | "status"> = {
        groupId,
        title: `Settlement: ${debt.payerName} paid ${debt.receiverName}`,
        totalAmount: debt.amount,
        currency: "INR",
        category: "settlement",
        splitMethod: "custom",
        createdBy: user!.uid,
        createdByName: user!.displayName || "User",
        date: new Date().toISOString()
      };

      // In a settlement, the receiver "pays" the bill (they receive money), and the payer "owes" it.
      const parts: Omit<BillParticipant, "id" | "billId" | "joinedAt">[] = [
        {
          userId: debt.receiverId,
          name: debt.receiverName,
          amountOwed: 0,
          amountPaid: debt.amount,
          status: "paid"
        },
        {
          userId: debt.payerId,
          name: debt.payerName,
          amountOwed: debt.amount,
          amountPaid: 0,
          status: "pending"
        }
      ];

      await createBillSplitData(billData, parts);
      
      // Also log the actual settlement
      await createSettlement({
        payerId: debt.payerId,
        receiverId: debt.receiverId,
        amount: debt.amount,
      });

      toast.success("Settlement recorded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to settle debt");
    }
  };

  const handleRequestPayment = async (debt: any) => {
    try {
      await createPaymentRequest({
        groupId: groupId!,
        senderId: user!.uid,
        senderName: user!.displayName || "User",
        receiverId: debt.payerId,
        receiverName: debt.payerName,
        amount: debt.amount,
        note: `Payment request for group balances`
      });
      toast.success("Payment request sent!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send payment request");
    }
  };

  if (loading || !group) {
    return (
      <PageShell extraPad>
        <div className="flex-1 flex flex-col min-h-0 animate-pulse">
          <div className="p-4 md:p-8 bg-card border-b border-border">
            <div className="w-24 h-4 bg-muted rounded mb-6"></div>
            <div className="w-48 h-8 bg-muted rounded mb-2"></div>
            <div className="w-20 h-4 bg-muted rounded mb-8"></div>
            <div className="flex gap-4">
              <div className="w-16 h-4 bg-muted rounded"></div>
              <div className="w-16 h-4 bg-muted rounded"></div>
              <div className="w-16 h-4 bg-muted rounded"></div>
            </div>
          </div>
          <div className="p-4 md:p-8 space-y-4">
            <div className="h-20 bg-card border border-border rounded-2xl"></div>
            <div className="h-20 bg-card border border-border rounded-2xl"></div>
            <div className="h-20 bg-card border border-border rounded-2xl"></div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell extraPad>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-shrink-0 p-4 md:p-8 bg-card border-b border-border sticky top-0 z-20">
          <button 
            onClick={() => navigate('/groups')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Groups
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{group.name}</h1>
              <p className="text-muted-foreground capitalize mt-1">{group.type}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsAddMemberOpen(true)}
                className="h-10 px-4 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Member</span>
              </button>
              <button 
                onClick={() => setIsAddExpenseOpen(true)}
                className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Expense</span>
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-6 border-b border-border">
            <button 
              onClick={() => setActiveTab('expenses')}
              className={`pb-3 font-medium transition-colors relative ${activeTab === 'expenses' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Expenses
              {activeTab === 'expenses' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('balances')}
              className={`pb-3 font-medium transition-colors relative ${activeTab === 'balances' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Balances
              {activeTab === 'balances' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('members')}
              className={`pb-3 font-medium transition-colors relative ${activeTab === 'members' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Members
              {activeTab === 'members' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8 overflow-y-auto">
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {bills.length === 0 ? (
                <div className="text-center bg-card border border-border rounded-2xl p-8 shadow-sm">
                  <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-foreground font-medium">No expenses yet</p>
                  <p className="text-sm text-muted-foreground">Add an expense to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bills.map(bill => (
                    <div key={bill.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-foreground font-medium">{bill.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(bill.createdAt).toLocaleDateString()} • Paid by {bill.createdByName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground font-bold">₹{bill.totalAmount.toFixed(2)}</p>
                        <span className="text-[10px] uppercase tracking-wider text-primary font-medium px-2 py-0.5 rounded-full bg-primary/10">
                          {bill.category === 'settlement' ? 'Settlement' : bill.splitMethod}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'balances' && (
            <div className="space-y-8">
              {groupSettlements.length === 0 ? (
                <div className="text-center bg-card border border-border rounded-2xl p-8 shadow-sm">
                  <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-foreground font-medium">All Settled Up!</p>
                  <p className="text-sm text-muted-foreground">There are no pending balances in this group.</p>
                </div>
              ) : (
                <>
                  {/* Money Owed To You */}
                  <div>
                    <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Money Owed To You
                    </h3>
                    <div className="space-y-3">
                      {groupSettlements.filter(s => s.receiverId === user?.uid).length === 0 ? (
                        <p className="text-muted-foreground text-sm italic">No one owes you money.</p>
                      ) : (
                        groupSettlements.filter(s => s.receiverId === user?.uid).map((s, idx) => (
                          <SettlementCard 
                            key={idx}
                            debt={s}
                            onMarkPaid={handleMarkPaid}
                            onRequestPayment={handleRequestPayment}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Money You Owe */}
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div> Money You Owe
                    </h3>
                    <div className="space-y-3">
                      {groupSettlements.filter(s => s.payerId === user?.uid).length === 0 ? (
                        <p className="text-muted-foreground text-sm italic">You don't owe anyone.</p>
                      ) : (
                        groupSettlements.filter(s => s.payerId === user?.uid).map((s, idx) => (
                          <SettlementCard 
                            key={idx}
                            debt={s}
                            onMarkPaid={handleMarkPaid}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Pending Requests */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Pending Requests
                </h3>
                <div className="space-y-3">
                  {requests.filter(r => r.status === 'PENDING').length === 0 ? (
                    <p className="text-muted-foreground text-sm italic">No pending requests.</p>
                  ) : (
                    requests.filter(r => r.status === 'PENDING').map(r => (
                      <PaymentRequestCard
                        key={r.id}
                        request={r}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {members.map(member => (
                  <div key={member.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-foreground font-medium">
                        {member.name}
                        {member.userId === user?.uid && <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">You</span>}
                      </h3>
                      <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {groupId && (
        <>
          <AddMemberModal 
            isOpen={isAddMemberOpen}
            onClose={() => setIsAddMemberOpen(false)}
            groupId={groupId}
            onSuccess={fetchMembers}
          />
          <AddGroupExpenseModal 
            isOpen={isAddExpenseOpen}
            onClose={() => setIsAddExpenseOpen(false)}
            groupId={groupId}
            members={members}
            onSubmit={handleCreateExpense}
          />
        </>
      )}
    </PageShell>
  );
}
