"use client";

import { 
  User, 
  MapPin, 
  Calendar, 
  Wallet, 
  ShieldCheck, 
  ExternalLink,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { clsx } from "clsx";
import { format } from "date-fns";

export function UserPanel({ userId }: { userId: string }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const resp = await api.get(`/users/${userId}`);
      return resp.data.data;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-foreground/40">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) return null;
  return (
    <div className="flex flex-col h-full p-6 space-y-8 animate-in slide-in-from-right duration-300 overflow-y-auto custom-scrollbar">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 rounded-3xl bg-primary/10 mx-auto flex items-center justify-center font-bold text-primary text-3xl border border-primary/20 overflow-hidden">
          {user.profilePhoto ? (
            <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            `${user.firstName?.[0]}${user.lastName?.[0]}`
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold">{user.firstName} {user.lastName}</h3>
          <p className="text-xs text-foreground/40 font-medium tracking-wider uppercase">ID: {user.userId.substring(0, 8)}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Profile Information</h4>
        <div className="space-y-3">
          <InfoItem icon={MapPin} label="Location" value={user.country || 'N/A'} />
          <InfoItem icon={Calendar} label="Member Since" value={user.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently'} />
          <InfoItem icon={ShieldCheck} label="KYC Status" value={user.isVerified ? 'Verified' : 'Pending'} color={user.isVerified ? "text-green-500" : "text-amber-500"} />
          <InfoItem icon={User} label="Agent Status" value={user.agentStatus} color={user.agentStatus !== 'NONE' ? "text-primary" : "text-foreground/40"} />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] px-1">Financial Overview</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark-surface/40 border border-dark-border p-4 rounded-2xl shadow-xl shadow-black/10 transition-all hover:bg-dark-surface/60">
            <Wallet size={18} className="text-primary mb-3" />
            <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-wider mb-1">Balance</p>
            <p className="font-bold text-base text-foreground">{user.currency} {user.balance.toLocaleString()}</p>
          </div>
          <div className="bg-dark-surface/40 border border-dark-border p-4 rounded-2xl border-l-amber-500 shadow-xl shadow-black/10 transition-all hover:bg-dark-surface/60">
            <AlertTriangle size={18} className="text-amber-500 mb-3" />
            <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-wider mb-1">Escrow</p>
            <p className="font-bold text-base text-foreground">$450.00</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] px-1">Recent Activity</h4>
        <div className="space-y-1 bg-dark-surface/20 rounded-2xl border border-dark-border/30 p-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between text-xs p-3 rounded-xl hover:bg-dark-surface/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                <span className="text-foreground/70 font-medium group-hover:text-foreground">Card Deposit</span>
              </div>
              <span className="text-foreground/40 font-mono group-hover:text-foreground">-$200.00</span>
            </div>
          ))}
        </div>
        <button className="w-full text-[10px] font-black text-primary/60 py-2 hover:text-primary hover:tracking-[0.25em] transition-all flex items-center justify-center gap-2 uppercase tracking-widest bg-primary/5 rounded-xl border border-primary/10">
          View Full Ledger <ExternalLink size={12} />
        </button>
      </div>

      <div className="pt-4">
        <button className="w-full bg-red-500/5 text-red-500/60 border border-red-500/10 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-lg hover:shadow-red-500/20 active:translate-y-0.5">
          SUSPEND USER ACCOUNT
        </button>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color?: string }) {
  return (
    <div className="flex items-center gap-4 bg-dark-surface/20 p-3 rounded-2xl border border-dark-border/30 hover:bg-dark-surface/40 transition-colors">
      <div className="p-2.5 bg-dark-surface border border-dark-border rounded-xl text-primary shadow-inner">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className={clsx("text-sm font-bold tracking-tight", color || "text-foreground")}>{value}</p>
      </div>
    </div>
  );
}
