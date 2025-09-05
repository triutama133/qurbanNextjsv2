import { createClient } from '@supabase/supabase-js';

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables not configured properly');
}

// Create Supabase client with error handling
export const createSupabaseAdmin = () => {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  
  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
};

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return !!(supabaseUrl && supabaseKey);
};

// Default export for backward compatibility
export default createSupabaseAdmin();