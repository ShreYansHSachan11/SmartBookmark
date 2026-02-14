import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client lazily to handle missing env vars during build
let clientInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient<Database>>, {
  get(target, prop) {
    if (!clientInstance) {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase environment variables are not configured');
      }
      clientInstance = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
    }
    return (clientInstance as any)[prop];
  }
});
