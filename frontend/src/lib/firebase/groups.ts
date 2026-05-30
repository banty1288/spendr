import { collection, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Group, GroupMember } from "../../types/groups";

const GROUPS_COLLECTION = "groups";
const GROUP_MEMBERS_COLLECTION = "groupMembers";

export async function createGroup(
  groupData: Omit<Group, "id" | "createdAt">,
  creatorUserId: string,
  creatorName: string
): Promise<string> {
  const groupRef = doc(collection(db, GROUPS_COLLECTION));
  
  const group: Group = {
    ...groupData,
    id: groupRef.id,
    createdAt: new Date().toISOString()
  };

  await setDoc(groupRef, group);

  // Add the creator as the first member (admin)
  const memberRef = doc(collection(db, GROUP_MEMBERS_COLLECTION));
  const member: GroupMember = {
    id: memberRef.id,
    groupId: groupRef.id,
    userId: creatorUserId,
    name: creatorName,
    role: "admin",
    joinedAt: new Date().toISOString()
  };

  await setDoc(memberRef, member);

  return groupRef.id;
}

export async function getGroupsForUser(userId: string): Promise<Group[]> {
  const membersQuery = query(
    collection(db, GROUP_MEMBERS_COLLECTION),
    where("userId", "==", userId)
  );

  const memberSnaps = await getDocs(membersQuery);
  if (memberSnaps.empty) return [];

  const groupIds = memberSnaps.docs.map(d => d.data().groupId);
  
  // Since 'in' queries are limited to 10, chunk if necessary.
  // Assuming a user isn't in > 10 groups right now for simplicity, or we do individual gets.
  const groups: Group[] = [];
  
  for (const gid of groupIds) {
    const gSnap = await getDoc(doc(db, GROUPS_COLLECTION, gid));
    if (gSnap.exists()) {
      groups.push(gSnap.data() as Group);
    }
  }

  return groups;
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const membersQuery = query(
    collection(db, GROUP_MEMBERS_COLLECTION),
    where("groupId", "==", groupId)
  );
  
  const memberSnaps = await getDocs(membersQuery);
  return memberSnaps.docs.map(d => d.data() as GroupMember);
}
