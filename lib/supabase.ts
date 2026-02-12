import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  "";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[HabitFlow] EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY devem estar definidos. Usando fallback em memória."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
