import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Briefcase, Plane, Home, Coffee } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { createGroup } from '../../../lib/firebase/groups';
import { toast } from 'sonner';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (groupId: string) => void;
}

const GROUP_TYPES = [
  { id: 'flatmates', label: 'Flatmates', icon: Home, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { id: 'trip', label: 'Trip', icon: Plane, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { id: 'office', label: 'Office', icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  { id: 'other', label: 'Other', icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-500/20' },
] as const;

export function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<'trip' | 'flatmates' | 'office' | 'other'>('other');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const groupId = await createGroup(
        {
          name: name.trim(),
          type,
          currency: 'INR',
          createdBy: user.uid,
        },
        user.uid,
        user.displayName || 'Anonymous'
      );
      toast.success('Group created successfully!');
      onSuccess?.(groupId);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl z-50 overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Create New Group</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Group Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Goa Trip 2024"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Group Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {GROUP_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id as any)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border bg-card hover:bg-muted/50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? t.bg : 'bg-muted'}`}>
                          <Icon className={`w-5 h-5 ${isSelected ? t.color : 'text-muted-foreground'}`} />
                        </div>
                        <span className={`font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3 rounded-xl transition-all"
              >
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
