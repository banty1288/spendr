import React, { useEffect, useState } from 'react';
import { Plus, Users, ArrowRight } from 'lucide-react';
import { useGroups } from '../../hooks/useGroups';
import { useQueryClient } from '@tanstack/react-query';
import { groupsQueryKey } from '../../hooks/useGroups';
import { useAuthStore } from '../../store/authStore';
import { CreateGroupModal } from '../components/groups/CreateGroupModal';
import { useNavigate } from 'react-router';
import { PageShell } from '../components/ui/PageShell';
import { useGlobalBalances } from '../../hooks/useGlobalBalances';
import { IndianRupee, ArrowUpRight, ArrowDownRight, Bell } from 'lucide-react';

export function GroupsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { groups, isLoading: loading } = useGroups();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { owedToMe, iOwe, pendingRequestsCount } = useGlobalBalances(user?.uid);

  return (
    <PageShell extraPad>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-shrink-0 p-4 md:p-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Groups</h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1">Split expenses with friends</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Group</span>
          </button>
        </div>

        <div className="px-4 md:px-8 mb-6">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1 text-emerald-400">
                <ArrowDownRight className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Owed To You</span>
              </div>
              <p className="text-emerald-400 font-bold text-lg md:text-2xl flex items-center">
                <IndianRupee className="w-4 h-4 md:w-5 md:h-5 mr-0.5" />
                {owedToMe.toFixed(2)}
              </p>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1 text-rose-400">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">You Owe</span>
              </div>
              <p className="text-rose-400 font-bold text-lg md:text-2xl flex items-center">
                <IndianRupee className="w-4 h-4 md:w-5 md:h-5 mr-0.5" />
                {iOwe.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1 text-blue-400">
                <Bell className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Requests</span>
              </div>
              <p className="text-blue-400 font-bold text-lg md:text-2xl">
                {pendingRequestsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 pt-0 md:pt-0 overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-muted rounded-xl"></div>
                    <div className="w-5 h-5 bg-muted rounded"></div>
                  </div>
                  <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Users className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Groups Yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">Create a group to easily split bills with flatmates, trip friends, or family.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map(group => (
                <div 
                  key={group.id} 
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="bg-card border border-border hover:border-primary/50 transition-all rounded-2xl p-5 cursor-pointer group shadow-sm hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{group.name}</h3>
                  <p className="text-muted-foreground text-sm capitalize">{group.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateGroupModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={(id) => {
          queryClient.invalidateQueries({ queryKey: groupsQueryKey(user?.uid) });
          navigate(`/groups/${id}`);
        }}
      />
    </PageShell>
  );
}
