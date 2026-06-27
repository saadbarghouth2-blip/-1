import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig, getSupabaseConfigError, isSupabaseConfigured } from './supabaseConfig';

let client: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(getSupabaseConfigError());
  }

  if (!client) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'riq-web-auth',
      },
    });
  }

  return client;
}

export { getSupabaseConfigError, isSupabaseConfigured };
