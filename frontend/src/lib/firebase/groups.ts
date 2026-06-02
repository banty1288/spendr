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
  
  // 'in' queries are limited to 30 items per chunk in Firestore.
  // We'll chunk them safely and use Promise.all to fetch concurrently.
  const chunks = groupIds.reduce((resultArray, item, index) => { 
    const chunkIndex = Math.floor(index / 30);
    if (!resultArray[chunkIndex]) resultArray[chunkIndex] = [];
    resultArray[chunkIndex].push(item);
    return resultArray;
  }, [] as string[][]);

  const promises = chunks.map((chunk: string[]) => {
    return getDocs(query(collection(db, GROUPS_COLLECTION), where("__name__", "in", chunk)));
  });

  const snapshots = await Promise.all(promises);
  const groups: Group[] = [];
  
  snapshots.forEach(snap => {
    snap.docs.forEach((d: any) => {
      groups.push(d.data() as Group);
    });
  });

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

export async function getGroupDetails(groupId: string): Promise<Group | null> {
  const gSnap = await getDoc(doc(db, GROUPS_COLLECTION, groupId));
  if (!gSnap.exists()) return null;
  return gSnap.data() as Group;
}

export async function addGroupMember(
  groupId: string,
  userId: string,
  name: string,
  role: "admin" | "member" = "member"
): Promise<void> {
  const memberRef = doc(collection(db, GROUP_MEMBERS_COLLECTION));
  const member: GroupMember = {
    id: memberRef.id,
    groupId,
    userId,
    name,
    role,
    joinedAt: new Date().toISOString()
  };
  await setDoc(memberRef, member);
}
