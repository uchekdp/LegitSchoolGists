import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration keys for local override (allows admin to connect live Supabase project directly from Admin Settings)
const STORAGE_KEY_URL = 'lsg_supabase_url';
const STORAGE_KEY_ANON_KEY = 'lsg_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  // Check localStorage first (admin UI configuration)
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON_KEY) : null;

  // Fallback to environment variables
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const url = (localUrl || envUrl || '').trim();
  const anonKey = (localKey || envKey || '').trim();

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    anonKey.length > 20
  );

  return { url, anonKey, isConfigured };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (anonKey) localStorage.setItem(STORAGE_KEY_ANON_KEY, anonKey.trim());
    else localStorage.removeItem(STORAGE_KEY_ANON_KEY);

    // Reset cached client
    cachedClient = null;
    cachedConfigKey = '';
  }
}

export function clearSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON_KEY);
    cachedClient = null;
    cachedConfigKey = '';
  }
}

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  const currentKey = `${url}:${anonKey}`;
  if (cachedClient && cachedConfigKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedConfigKey = currentKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
      return { success: false, message: 'Invalid Supabase URL format. It must start with https:// and end with .supabase.co' };
    }
    if (!anonKey || anonKey.length < 20) {
      return { success: false, message: 'Invalid Supabase Anon key length.' };
    }

    const testClient = createClient(url, anonKey);
    // Ping categories or test query
    const { error } = await testClient.from('categories').select('id').limit(1);

    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it still reached the API!
      if (error.message.includes('relation "public.categories" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase project! Note: Tables have not been created yet. Please execute the generated SQL script in your Supabase SQL Editor.',
        };
      }
      return { success: false, message: `Supabase responded: ${error.message}` };
    }

    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection attempt failed.' };
  }
}
