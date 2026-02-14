import { supabase } from '../supabase/client';
import type { Session } from '../../types/database';

export interface AuthService {
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  getSession(): Promise<Session | null>;
  onAuthStateChange(callback: (session: Session | null) => void): { unsubscribe: () => void };
}

/**
 * Sign in with Google OAuth provider
 * Redirects to Google authentication page
 */
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

/**
 * Sign out the current user
 * Clears session and authentication state
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Sign out failed: ${error.message}`);
  }
}

/**
 * Get the current user session
 * Returns null if no active session
 */
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Failed to get session: ${error.message}`);
  }

  if (!data.session) {
    return null;
  }

  return {
    user: {
      id: data.session.user.id,
      email: data.session.user.email!,
      user_metadata: {
        avatar_url: data.session.user.user_metadata?.avatar_url,
        full_name: data.session.user.user_metadata?.full_name,
      },
    },
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at || 0,
  };
}

/**
 * Subscribe to authentication state changes
 * Callback is invoked whenever the auth state changes
 * Returns an object with unsubscribe method
 */
export function onAuthStateChange(
  callback: (session: Session | null) => void
): { unsubscribe: () => void } {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, supabaseSession) => {
    if (!supabaseSession) {
      callback(null);
      return;
    }

    const session: Session = {
      user: {
        id: supabaseSession.user.id,
        email: supabaseSession.user.email!,
        user_metadata: {
          avatar_url: supabaseSession.user.user_metadata?.avatar_url,
          full_name: supabaseSession.user.user_metadata?.full_name,
        },
      },
      access_token: supabaseSession.access_token,
      refresh_token: supabaseSession.refresh_token,
      expires_at: supabaseSession.expires_at || 0,
    };

    callback(session);
  });

  return {
    unsubscribe: () => subscription.unsubscribe(),
  };
}
