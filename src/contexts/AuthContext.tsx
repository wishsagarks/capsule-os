import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  first_name: string;
  last_name: string;
  display_name: string;
  phone?: string | null;
  country: string;
  provider_type: string;
}

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, profile?: UserProfile) => Promise<{ data: any; error: any }>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureUserProfile = async (session: Session) => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      if (!existingUser) {
        const metadata = session.user.user_metadata;
        const provider = session.user.app_metadata?.provider || 'email';

        const profileData = {
          auth_user_id: session.user.id,
          email: session.user.email,
          display_name: metadata?.display_name || metadata?.full_name || metadata?.name || session.user.email?.split('@')[0] || 'User',
          first_name: metadata?.first_name || metadata?.given_name || '',
          last_name: metadata?.last_name || metadata?.family_name || '',
          provider_type: metadata?.provider_type || provider,
          avatar_url: metadata?.avatar_url || metadata?.picture || null,
          phone: metadata?.phone || null,
          country: metadata?.country || null,
        };

        const { error } = await supabase
          .from('users')
          .insert(profileData);

        if (error) {
          console.error('Error creating user profile:', error);
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session) {
          await ensureUserProfile(session);
        }

        setSession(session);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (!isMounted) return;

        try {
          if (session) {
            await ensureUserProfile(session);
          }
          setSession(session);
        } catch (error) {
          console.error('Error handling auth state change:', error);
        }
      })();
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/setup`,
      },
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, profile?: UserProfile) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/setup`,
        data: profile ? {
          first_name: profile.first_name,
          last_name: profile.last_name,
          display_name: profile.display_name,
          phone: profile.phone,
          country: profile.country,
          provider_type: profile.provider_type,
        } : undefined,
      },
    });

    return { data, error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, updatePassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
