import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase client configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart the dev server.'
  );
}

if (!supabaseUrl.startsWith('http')) {
  throw new Error(
    'Invalid NEXT_PUBLIC_SUPABASE_URL. It must start with https:// and point to your Supabase project URL.'
  );
}

if (!supabaseAnonKey.startsWith('eyJ')) {
  throw new Error(
    'Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY format. Make sure you copied the anon key exactly from your Supabase project settings.'
  );
}

if (process.env.NODE_ENV !== 'production') {
  console.debug('Supabase client ready', {
    supabaseUrl,
    anonKeyHint: `${supabaseAnonKey.slice(0, 10)}...`,
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});