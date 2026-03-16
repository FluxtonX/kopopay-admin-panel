import { create } from 'zustand';
import Cookies from 'js-cookie';

interface Admin {
  adminId: string;
  email: string;
  role: 'super_admin' | 'support' | 'finance';
  name: string;
}

interface AuthState {
  admin: Admin | null;
  token: string | null;
  setAuth: (admin: Admin, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  token: Cookies.get('admin_token') || null,
  setAuth: (admin, token) => {
    Cookies.set('admin_token', token, { expires: 1 });
    set({ admin, token });
  },
  logout: () => {
    Cookies.remove('admin_token');
    set({ admin: null, token: null });
  },
}));
