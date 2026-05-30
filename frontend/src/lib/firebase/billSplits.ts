import {
  collection,
  doc,
  writeBatch,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { BillSplit, BillParticipant, Settlement, BillActivity } from "../../types/billSplit";

const BILLS_COLLECTION = "billSplits";
const PARTICIPANTS_COLLECTION = "billParticipants";
const SETTLEMENTS_COLLECTION = "settlements";
const ACTIVITIES_COLLECTION = "billActivities";

export async function createBillSplitData(
  bill: Omit<BillSplit, "id" | "createdAt" | "status">,
  participants: Omit<BillParticipant, "id" | "billId" | "joinedAt">[]
): Promise<string> {
  const batch = writeBatch(db);

  // 1. Create BillSplit
  const billRef = doc(collection(db, BILLS_COLLECTION));
  batch.set(billRef, {
    ...bill,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  // 2. Create Participants
  participants.forEach(p => {
    const pRef = doc(collection(db, PARTICIPANTS_COLLECTION));
    batch.set(pRef, {
      ...p,
      billId: billRef.id,
      joinedAt: serverTimestamp(),
    });
  });

  // 3. Create Activity
  const activityRef = doc(collection(db, ACTIVITIES_COLLECTION));
  batch.set(activityRef, {
    billId: billRef.id,
    type: "created",
    actorId: bill.createdBy,
    actorName: bill.createdByName,
    timestamp: serverTimestamp(),
    message: "Created a new bill split",
  });

  await batch.commit();
  return billRef.id;
}

export function subscribeToUserBillSplits(
  userId: string,
  onUpdate: (bills: BillSplit[]) => void
): () => void {
  // To get bills a user is part of, we first need to query participants where userId == userId.
  // Then we can fetch those bills. Or better, we can listen to participants and fetch bills.
  // Because Firebase doesn't support JOINs, we listen to participants:
  
  const pQuery = query(
    collection(db, PARTICIPANTS_COLLECTION),
    where("userId", "==", userId)
  );

  return onSnapshot(pQuery, async (snapshot) => {
    const billIds = new Set<string>();
    snapshot.docs.forEach(d => {
      billIds.add(d.data().billId);
    });

    if (billIds.size === 0) {
      onUpdate([]);
      return;
    }

    // Fetch bills (could also be a listener, but this works for simpler queries. 
    // To be perfectly real-time, we should set up a listener for the bills where id in billIds)
    // For simplicity and to avoid too many listeners, we'll use `in` query if size <= 30.
    const chunks = Array.from(billIds).reduce((resultArray, item, index) => { 
      const chunkIndex = Math.floor(index/30);
      if(!resultArray[chunkIndex]) resultArray[chunkIndex] = [];
      resultArray[chunkIndex].push(item);
      return resultArray;
    }, [] as string[][]);
    
    let allBills: BillSplit[] = [];
    for (const chunk of chunks) {
      const bQuery = query(collection(db, BILLS_COLLECTION), where("__name__", "in", chunk));
      const bSnap = await getDocs(bQuery);
      allBills = allBills.concat(bSnap.docs.map(d => ({ id: d.id, ...d.data() } as BillSplit)));
    }
    
    allBills.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(allBills);
  });
}

export function subscribeToBillParticipants(
  billId: string,
  onUpdate: (participants: BillParticipant[]) => void
): () => void {
  const pQuery = query(
    collection(db, PARTICIPANTS_COLLECTION),
    where("billId", "==", billId)
  );
  return onSnapshot(pQuery, (snapshot) => {
    const participants = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as BillParticipant));
    onUpdate(participants);
  });
}

export function subscribeToBillActivities(
  billId: string,
  onUpdate: (activities: BillActivity[]) => void
): () => void {
  const aQuery = query(
    collection(db, ACTIVITIES_COLLECTION),
    where("billId", "==", billId),
    orderBy("timestamp", "desc")
  );
  return onSnapshot(aQuery, (snapshot) => {
    const acts = snapshot.docs.map(d => {
      const data = d.data();
      return { 
        id: d.id, 
        ...data,
        timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString()
      } as BillActivity;
    });
    onUpdate(acts);
  });
}

export async function createSettlement(
  settlement: Omit<Settlement, "id" | "createdAt" | "status">
): Promise<void> {
  const batch = writeBatch(db);

  const setRef = doc(collection(db, SETTLEMENTS_COLLECTION));
  batch.set(setRef, {
    ...settlement,
    status: "completed",
    createdAt: serverTimestamp(),
  });

  // Ideally, we'd also update the participant records to reflect the new amountPaid/amountOwed.
  // For this to be safe, we'd use a transaction. But for now, we write the settlement 
  // and recalculate derived states on the client or via a Cloud Function.
  
  if (settlement.billId) {
    const activityRef = doc(collection(db, ACTIVITIES_COLLECTION));
    batch.set(activityRef, {
      billId: settlement.billId,
      type: "paid",
      actorId: settlement.payerId,
      actorName: "User", // Can be passed in
      targetId: settlement.receiverId,
      amount: settlement.amount,
      timestamp: serverTimestamp(),
      message: `Paid ₹${settlement.amount} via UPI`,
    });
  }

  await batch.commit();
}
