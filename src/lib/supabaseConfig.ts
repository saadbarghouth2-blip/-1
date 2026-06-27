const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseConfigError() {
  if (import.meta.env.DEV) {
    return 'Saved web accounts are unavailable because VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing.';
  }

  return 'Saved web accounts are not available on this website right now.';
}

export function getSupabaseConfig() {
  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}
