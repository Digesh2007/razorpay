import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = serviceKey && !serviceKey.startsWith("paste_your_") ? serviceKey : anonKey;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables. Check your .env.local file.");
  }

  return createSupabaseClient(url, key);
}

export function createClient() {
  return getServerSupabase();
}