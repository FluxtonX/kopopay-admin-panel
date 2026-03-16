"use client";

import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function Dashboard() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const resp = await api.get('/stats');
      return resp.data.data;
    }
  });

  const stats = [
    { label: "Total Users", value: statsData?.totalUsers || "...", change: statsData?.trends?.users || "+0%", trending: "up", icon: Users },
    { label: "Active Tickets", value: statsData?.activeTickets || "0", change: statsData?.trends?.tickets || "0%", trending: "down", icon: MessageSquare },
    { label: "Daily Volume", value: `$${statsData?.dailyVolume?.toLocaleString() || "..."}`, change: statsData?.trends?.volume || "+0%", trending: "up", icon: TrendingUp },
    { label: "Avg Response", value: statsData?.avgResponse || "...", change: statsData?.trends?.response || "0%", trending: "down", icon: Clock },
  ];
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-foreground/60">Welcome back, KopoPay Administrator.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-sidebar border border-dark-border p-6 rounded-2xl space-y-4 hover:border-primary/30 transition-all cursor-default group">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-primary/10 rounded-xl">
                <stat.icon className="text-primary" size={24} />
              </div>
              <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                stat.trending === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {stat.change}
                {stat.trending === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <div>
              <p className="text-foreground/40 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-sidebar border border-dark-border rounded-2xl p-6 min-h-[300px] flex flex-col justify-center items-center text-foreground/40">
          <TrendingUp size={48} className="mb-4 opacity-20" />
          <p className="font-medium text-lg">Transaction Volume Analytics</p>
          <p className="text-sm">Graph will be populated with real-time data.</p>
        </div>
        
        <div className="bg-sidebar border border-dark-border rounded-2xl p-6 space-y-6">
          <h4 className="font-bold flex items-center justify-between">
            Active Tickets
            <span className="text-xs font-normal text-primary hover:underline cursor-pointer">View All</span>
          </h4>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-border transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {i === 1 ? 'JM' : i === 2 ? 'AO' : 'SK'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">John Musa</p>
                  <p className="text-xs text-foreground/50 truncate">Failed card deposit in Lagos...</p>
                </div>
                <div className="text-[10px] text-foreground/30">
                  {i * 2}m ago
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
