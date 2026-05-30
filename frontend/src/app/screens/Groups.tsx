import React, { useEffect, useState } from 'react';
import { Plus, Users, ArrowRight } from 'lucide-react';
import { getGroupsForUser } from '../../lib/firebase/groups';
import { Group } from '../../types/groups';
import { useAuthStore } from '../../store/authStore';

export function GroupsPage() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      getGroupsForUser(user.uid).then((g) => {
        setGroups(g);
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0A]">
      <div className="flex-shrink-0 p-4 md:p-8 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-xl z-20">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Groups</h1>
          <p className="text-white/60 text-sm md:text-base mt-1">Split expenses with friends</p>
        </div>
        <button className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">New Group</span>
        </button>
      </div>

      <div className="p-4 md:p-8 overflow-y-auto">
        {loading ? (
          <div className="text-center py-10 text-white/50">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Groups Yet</h3>
            <p className="text-white/60 max-w-sm mx-auto mb-6">Create a group to easily split bills with flatmates, trip friends, or family.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(group => (
              <div key={group.id} className="bg-white/5 border border-white/10 hover:border-white/20 transition-all rounded-2xl p-5 cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-white/10">
                    <Users className="w-6 h-6 text-emerald-400" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{group.name}</h3>
                <p className="text-white/50 text-sm">{group.type}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
