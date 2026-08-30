import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HFUser {
  username: string;
  fullname?: string;
  avatarUrl?: string;
  email?: string;
  datasetPath: string;
  creditBalance: number;
}

interface AuthState {
  user: HFUser | null;
  isAuthenticated: boolean;
  hfToken: string | null;

  setAuthUser: (user: HFUser, token?: string) => void;
  loginWithToken: (token: string) => Promise<{ success: boolean; user?: HFUser; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hfToken: null,

      setAuthUser: (user, token) =>
        set({
          user,
          isAuthenticated: true,
          ...(token ? { hfToken: token } : {}),
        }),

      loginWithToken: async (token: string) => {
        try {
          const res = await fetch('https://huggingface.co/api/whoami-v2', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            return { success: false, error: 'Invalid Hugging Face Access Token' };
          }

          const data = await res.json();
          const username = data.name || data.preferred_username || 'hf_user';
          const avatarUrl = data.avatarUrl || 'https://huggingface.co/avatars/2cf001.png';
          const datasetPath = `datasets/${username}/hf-workflow-data`;

          const user: HFUser = {
            username,
            fullname: data.fullname || username,
            avatarUrl,
            email: data.email,
            datasetPath,
            creditBalance: 1500,
          };

          set({
            user,
            isAuthenticated: true,
            hfToken: token,
          });

          return { success: true, user };
        } catch (err: any) {
          return { success: false, error: err.message || 'Hugging Face API connection error' };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, hfToken: null });
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },
    }),
    {
      name: 'hf_workflow_auth_store',
    }
  )
);
