import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Profile } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: import('@supabase/supabase-js').Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: import('@supabase/supabase-js').Session | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      isLoading: true,
      isInitialized: false,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),

      initialize: async () => {
        if (get().isInitialized) return;

        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            set({
              session,
              profile,
              user: profile ? {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: profile.role,
                avatar_url: profile.avatar_url,
                created_at: profile.created_at,
                updated_at: profile.updated_at,
              } : null,
            });
          }

          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
              set({ user: null, profile: null, session: null });
            } else if (session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              set({
                session,
                profile,
                user: profile ? {
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  role: profile.role,
                  avatar_url: profile.avatar_url,
                  created_at: profile.created_at,
                  updated_at: profile.updated_at,
                } : null,
              });
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null, session: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);
