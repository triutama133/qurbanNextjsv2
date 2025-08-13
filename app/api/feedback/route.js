import { createClient } from "@supabase/supabase-js";

// You can use env variables or hardcode for demo
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { message, user_id } = await request.json();
    if (!message || !user_id) {
      return new Response(JSON.stringify({ error: "Message and user_id required" }), { status: 400 });
    }
    const { error } = await supabase.from("feedback").insert([{ message, user_id }]);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export async function GET() {
  // For admin: get all feedback (simple, no auth)
  const { data, error } = await supabase
    .from("feedback")
    .select("id, user_id, message, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify(data), { status: 200 });
}
