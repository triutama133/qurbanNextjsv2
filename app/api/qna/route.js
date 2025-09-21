import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET() {
  console.log('QNA API GET called');
  const { data, error } = await supabase
    .from('qna')
    .select('*')
    .order('order', { ascending: true });
  console.log('QNA API GET result:', { data, error });
  return Response.json({ data, error });
}

export async function POST(req) {
  const { question, answer, order } = await req.json();
  if (!question || !answer) {
    return Response.json({ error: 'Question and answer required' }, { status: 400 });
  }
  const { error } = await supabase
    .from('qna')
    .insert([{ question, answer, order }]);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}

export async function DELETE(req) {
  const { id } = await req.json();
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 });
  const { error } = await supabase
    .from('qna')
    .delete()
    .eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}

export async function PUT(req) {
  const { id, question, answer, order } = await req.json();
  if (!id || !question || !answer) {
    return Response.json({ error: 'ID, question, and answer required' }, { status: 400 });
  }
  const { error } = await supabase
    .from('qna')
    .update({ question, answer, order })
    .eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
