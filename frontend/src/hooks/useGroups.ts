import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGroupsForUser, getGroupDetails, getGroupMembers } from "../lib/firebase/groups";
import { useAuthStore } from "../store/authStore";
import { Group, GroupMember } from "../types/groups";

export const groupsQueryKey = (uid?: string) => ["groups", uid] as const;
export const groupDetailsQueryKey = (groupId: string) => ["groupDetails", groupId] as const;
export const groupMembersQueryKey = (groupId: string) => ["groupMembers", groupId] as const;

export function useGroups() {
  const user = useAuthStore((s) => s.user);
  const uid = user?.uid;

  const query = useQuery({
    queryKey: groupsQueryKey(uid),
    queryFn: () => getGroupsForUser(uid!),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5, // 5 minutes cache (stale-while-revalidate)
  });

  return {
    groups: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useGroupDetails(groupId?: string) {
  const groupQuery = useQuery({
    queryKey: groupDetailsQueryKey(groupId!),
    queryFn: () => getGroupDetails(groupId!),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 5,
  });

  const membersQuery = useQuery({
    queryKey: groupMembersQueryKey(groupId!),
    queryFn: () => getGroupMembers(groupId!),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    group: groupQuery.data,
    members: membersQuery.data ?? [],
    isLoading: groupQuery.isLoading || membersQuery.isLoading,
    isError: groupQuery.isError || membersQuery.isError,
    refetch: () => {
      groupQuery.refetch();
      membersQuery.refetch();
    }
  };
}
