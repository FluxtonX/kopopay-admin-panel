"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useAuthStore } from "@/lib/auth-store";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, token, setAuth, logout } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    async function init() {
      if (token && !admin) {
        try {
          const resp = await api.get("/auth/me");
          setAuth(resp.data.data.admin, token);
        } catch (err) {
          logout();
          router.push("/login");
        }
      }
      setInitializing(false);
    }
    init();
  }, [token, admin, setAuth, logout, router]);

  if (initializing && !isLoginPage && token) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-dark-bg gap-4">
        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center animate-pulse border border-primary/20">
          <div className="w-6 h-6 bg-primary rounded-lg"></div>
        </div>
        <div className="flex items-center gap-2 text-foreground/40 text-sm font-medium">
          <Loader2 className="animate-spin" size={16} />
          Verifying session...
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden bg-background">
        {children}
      </main>
    </div>
  );
}
