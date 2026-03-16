"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { 
  Search, 
  MoreHorizontal, 
  MapPin, 
  Mail, 
  Phone,
  ShieldCheck,
  User as UserIcon,
  Loader2
} from "lucide-react";
import { clsx } from "clsx";

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  profilePhoto?: string;
  isVerified: boolean;
  balance: number;
  currency: string;
  agentStatus: string;
}

export default function UsersPage() {
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const resp = await api.get('/users');
      return resp.data.data;
    }
  });

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">User Management</h2>
          <p className="text-foreground/60">Manage and monitor all KopoPay users.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email..." 
              className="bg-sidebar border border-dark-border rounded-xl pl-10 pr-4 py-2 text-sm w-64 focus:border-primary/50 focus:outline-none"
            />
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
            Export CSV
          </button>
        </div>
      </header>

      <div className="bg-sidebar border border-dark-border rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-foreground/40">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-dark-border bg-foreground/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">User</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">Contact info</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">Location</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">Balance</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {users.map((user) => (
                  <tr key={user.userId} className="hover:bg-dark-surface transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary overflow-hidden border border-primary/5">
                          {user.profilePhoto ? (
                            <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm tracking-tight">{user.firstName} {user.lastName}</p>
                          <p className="text-[10px] text-foreground/40 font-mono">{user.userId.substring(0, 12)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-foreground/60">
                          <Mail size={12} className="shrink-0" />
                          <span className="truncate max-w-[150px]">{user.email}</span>
                        </div>
                        {user.phoneNumber && (
                          <div className="flex items-center gap-2 text-xs text-foreground/60">
                            <Phone size={12} className="shrink-0" />
                            <span>{user.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-foreground/60">
                        <MapPin size={12} className="text-primary/50" />
                        <span>{user.country || 'Not Set'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={clsx(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter w-fit",
                          user.isVerified ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                        )}>
                          {user.isVerified ? 'VERIFIED' : 'PENDING'}
                        </span>
                        {user.agentStatus !== 'NONE' && (
                          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter w-fit flex items-center gap-1">
                            <ShieldCheck size={8} /> AGENT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm">{user.currency} {user.balance.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-dark-border rounded-lg text-foreground/40">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
