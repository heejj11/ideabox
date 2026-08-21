import { create } from 'zustand';

export type AuthStatus = 'unconfigured' | 'signed-out' | 'signing-in' | 'signed-in' | 'renewing' | 'error';

interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  expiresAt: number;
  error: string | null;
  setStatus: (status: AuthStatus) => void;
  setToken: (accessToken: string, expiresInSeconds: number) => void;
  setError: (message: string) => void;
  clear: (status?: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'signed-out' : 'unconfigured',
  accessToken: null,
  expiresAt: 0,
  error: null,
  setStatus: (status) => set({ status, error: null }),
  setToken: (accessToken, expiresInSeconds) =>
    set({
      accessToken,
      expiresAt: Date.now() + expiresInSeconds * 1000,
      status: 'signed-in',
      error: null,
    }),
  setError: (error) => set({ status: 'error', accessToken: null, expiresAt: 0, error }),
  clear: (status = 'signed-out') => set({ status, accessToken: null, expiresAt: 0, error: null }),
}));
