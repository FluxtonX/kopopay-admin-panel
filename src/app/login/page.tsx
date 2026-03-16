"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import api from "@/lib/api";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const resp = await api.post("/auth/login", { email, password });
      const { admin, token } = resp.data.data;
      setAuth(admin, token);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-3xl relative animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Lock className="text-primary" size={32} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Portal</h2>
          <p className="text-foreground/40 text-sm mt-2">Secure access for KopoPay administrative team</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground/60 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-sidebar border border-dark-border rounded-xl pl-10 pr-4 py-3 text-sm focus:border-primary focus:outline-none transition-all"
                  placeholder="admin@kopopay.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground/60 uppercase tracking-widest px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-sidebar border border-dark-border rounded-xl pl-10 pr-4 py-3 text-sm focus:border-primary focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "LOGIN TO PORTAL"}
          </button>
        </form>

        <p className="text-center text-[10px] text-foreground/20 font-medium uppercase tracking-[0.2em]">
          KopoPay Infrastructure &bull; 2026
        </p>
      </div>
    </div>
  );
}
