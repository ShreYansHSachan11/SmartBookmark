import { createClient } from '../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient();
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${origin}/login?error=auth_failed`);
      }
      
      // Successful authentication - redirect to dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    } catch (err) {
      console.error('Unexpected error during auth callback:', err);
      return NextResponse.redirect(`${origin}/login?error=unexpected_error`);
    }
  }

  // If no code but we have tokens in URL (implicit flow), redirect to dashboard
  // The client-side Supabase will handle the hash fragment tokens
  return NextResponse.redirect(`${origin}/dashboard`);
}
