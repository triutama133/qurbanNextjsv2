import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');
  if (!user_id) {
    return new Response(JSON.stringify({ error: 'user_id is required' }), { status: 400 });
  }
  const { data, error } = await supabase
    .from('user_documents')
    .select('*')
    .eq('UserId', user_id)
    .order('created_at', { ascending: false });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ documents: data }), { status: 200 });
}
