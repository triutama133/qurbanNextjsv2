import { createClient } from '@supabase/supabase-js';

// Ambil variabel lingkungan dari .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Pastikan variabel lingkungan sudah diatur
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables');
}

// Buat dan ekspor instance Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);