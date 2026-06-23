"use client";

import Link from "next/link";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Settings, 
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  LogOut,
  ClipboardCheck
} from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", roles: ['super_admin', 'support', 'finance'] },
  { icon: MessageSquare, label: "Live Support", href: "/support", badge: 3, roles: ['super_admin', 'support'] },
  { icon: Users, label: "Users", href: "/users", roles: ['super_admin', 'finance'] },
  { icon: ClipboardCheck, label: "Driver Approvals", href: "/driver-approvals", roles: ['super_admin', 'support'] },
  { icon: TrendingUp, label: "Analytics", href: "/analytics", roles: ['super_admin', 'finance'] },
  { icon: ShieldCheck, label: "Security", href: "/security", roles: ['super_admin'] },
];

const secondaryNav = [
  { icon: Settings, label: "Settings", href: "/settings", roles: ['super_admin'] },
  { icon: HelpCircle, label: "Help Center", href: "/help", roles: ['super_admin', 'support', 'finance'] },
];

import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const filteredNav = navItems.filter(item => !admin || item.roles.includes(admin.role));
  const filteredSecondary = secondaryNav.filter(item => !admin || item.roles.includes(admin.role));

  return (
    <aside className="w-68 bg-sidebar border-r border-dark-border flex flex-col h-full transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-primary/20">
            K
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">KopoPay</h1>
            <p className="text-xs text-primary font-medium uppercase tracking-tighter">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-foreground/60 hover:bg-dark-border hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className={cn(isActive ? "text-white" : "text-primary group-hover:text-primary")} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {item.badge && !isActive && (
                <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-6 border-t border-dark-border space-y-1">
        {admin && (
          <div className="px-3 py-4 mb-4 bg-foreground/[0.03] rounded-xl border border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                {admin.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{admin.name}</p>
                <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">{admin.role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        )}

        {filteredSecondary.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-foreground/60 hover:bg-dark-border hover:text-foreground rounded-lg transition-all"
            >
              <Icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all mt-2"
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
