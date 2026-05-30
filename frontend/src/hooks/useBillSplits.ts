import { useState, useEffect } from "react";
import {
  subscribeToUserBillSplits,
  subscribeToBillParticipants,
  subscribeToBillActivities,
  createBillSplitData,
  createSettlement,
} from "../lib/firebase/billSplits";
import { BillSplit, BillParticipant, Settlement, BillActivity } from "../types/billSplit";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useBillSplits() {
  const { user } = useAuthStore();
  const [bills, setBills] = useState<BillSplit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setBills([]);
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserBillSplits(user.uid, (fetchedBills) => {
      setBills(fetchedBills);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const createSplit = async (
    bill: Omit<BillSplit, "id" | "createdAt" | "status">,
    participants: Omit<BillParticipant, "id" | "billId" | "joinedAt">[]
  ) => {
    try {
      const id = await createBillSplitData(bill, participants);
      toast.success("Bill split created successfully!");
      return id;
    } catch (error) {
      console.error(error);
      toast.error("Failed to create bill split");
      throw error;
    }
  };

  return {
    bills,
    isLoading,
    createSplit,
  };
}

export function useBillSplitDetails(billId: string) {
  const [participants, setParticipants] = useState<BillParticipant[]>([]);
  const [activities, setActivities] = useState<BillActivity[]>([]);
  const [bill, setBill] = useState<BillSplit | null>(null);

  // Fetch the bill metadata (could also be real-time if needed)
  useEffect(() => {
    if (!billId) return;
    const fetchBill = async () => {
      const docRef = doc(db, "billSplits", billId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setBill({ id: snap.id, ...snap.data() } as BillSplit);
      }
    };
    fetchBill();
  }, [billId]);

  useEffect(() => {
    if (!billId) return;
    const unsubParticipants = subscribeToBillParticipants(billId, setParticipants);
    const unsubActivities = subscribeToBillActivities(billId, setActivities);
    
    return () => {
      unsubParticipants();
      unsubActivities();
    };
  }, [billId]);

  const markParticipantPaid = async (
    settlement: Omit<Settlement, "id" | "createdAt" | "status">,
    payerParticipantId: string, // ID of the participant doc to update
    amount: number
  ) => {
    try {
      await createSettlement(settlement);
      
      // Update participant's amountPaid
      const pRef = doc(db, "billParticipants", payerParticipantId);
      const pSnap = await getDoc(pRef);
      if (pSnap.exists()) {
        const currentPaid = pSnap.data().amountPaid || 0;
        await updateDoc(pRef, {
          amountPaid: currentPaid + amount,
          status: (currentPaid + amount) >= pSnap.data().amountOwed ? "paid" : "partially_paid"
        });
      }
      toast.success("Payment recorded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to record payment");
    }
  };

  return {
    bill,
    participants,
    activities,
    markParticipantPaid,
  };
}
