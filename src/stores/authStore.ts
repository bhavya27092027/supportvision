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
  createProfile: (userId: string, email: string, name?: string) => Promise<Profile | null>;
}

// Helper to create a fallback user from Supabase auth user
const createFallbackUser = (authUser: import('@supabase/supabase-js').User): User => {
  const metadata = authUser.user_metadata || {};
  return {
    id: authUser.id,
    name: metadata.name || metadata.full_name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    role: metadata.role || 'agent',
    avatar_url: metadata.avatar_url || metadata.picture,
    created_at: authUser.created_at,
    updated_at: authUser.last_sign_in_at || authUser.created_at,
  };
};

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

      createProfile: async (userId: string, email: string, name?: string): Promise<Profile | null> => {
        console.log('[Auth] Creating profile for:', email);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              name: name || email.split('@')[0] || 'User',
              email: email,
              role: 'agent',
            })
            .select()
            .single();

          if (error) {
            console.error('[Auth] Profile creation error:', error);
            return null;
          }

          console.log('[Auth] Profile created:', data);
          return data as Profile;
        } catch (error) {
          console.error('[Auth] Profile creation exception:', error);
          return null;
        }
      },

      initialize: async () => {
        if (get().isInitialized) {
          console.log('[Auth] Already initialized');
          return;
        }

        console.log('[Auth] Initializing...');
        set({ isLoading: true });

        try {
          const { data: { session } } = await supabase.auth.getSession();
          console.log('[Auth] Session check:', session ? 'Session found' : 'No session');

          if (session?.user) {
            const authUser = session.user;
            console.log('[Auth] User authenticated:', authUser.email);

            // Try to fetch existing profile
            let { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .maybeSingle();

            if (profileError) {
              console.error('[Auth] Profile fetch error:', profileError);
            }

            // If no profile exists, create one
            if (!profile) {
              console.log('[Auth] No profile found, creating...');
              const metadata = authUser.user_metadata || {};
              profile = await get().createProfile(
                authUser.id,
                authUser.email || '',
                metadata.name || metadata.full_name
              );
            }

            // Create user object - prefer profile data, fallback to auth user
            const user: User = profile ? {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as 'agent' | 'admin',
              avatar_url: profile.avatar_url,
              created_at: profile.created_at,
              updated_at: profile.updated_at,
            } : createFallbackUser(authUser);

            console.log('[Auth] User set:', user.email, '| Role:', user.role);
            set({ session, profile, user });
          }

          // Listen for auth state changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('[Auth] State changed:', event);

              if (event === 'SIGNED_OUT') {
                console.log('[Auth] User signed out');
                set({ user: null, profile: null, session: null });
              } else if (session?.user) {
                const authUser = session.user;
                console.log('[Auth] User signed in:', authUser.email);

                // Try to fetch profile
                let { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', authUser.id)
                  .maybeSingle();

                // Create profile if missing
                if (!profile) {
                  console.log('[Auth] No profile on state change, creating...');
                  const metadata = authUser.user_metadata || {};
                  profile = await get().createProfile(
                    authUser.id,
                    authUser.email || '',
                    metadata.name || metadata.full_name
                  );
                }

                const user: User = profile ? {
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  role: profile.role as 'agent' | 'admin',
                  avatar_url: profile.avatar_url,
                  created_at: profile.created_at,
                  updated_at: profile.updated_at,
                } : createFallbackUser(authUser);

                console.log('[Auth] User set:', user.email, '| Role:', user.role);
                set({ session, profile, user });
              } else if (event === 'TOKEN_REFRESHED') {
                console.log('[Auth] Token refreshed');
                set({ session });
              }
            }
          );

          // Keep subscription active; cleanup should be handled elsewhere if needed
          // (do not return a cleanup function so initialize matches Promise<void>)
          void subscription;
        } catch (error) {
          console.error('[Auth] Initialization error:', error);
        } finally {
          console.log('[Auth] Initialization complete');
          set({ isLoading: false, isInitialized: true });
        }
      },

      signOut: async () => {
        console.log('[Auth] Signing out...');
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('[Auth] Sign out error:', error);
        }
        set({ user: null, profile: null, session: null });
        console.log('[Auth] Signed out');
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
