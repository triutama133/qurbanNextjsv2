import { createSupabaseAdmin, isSupabaseAvailable } from "../../../lib/supabase-admin";

const supabase = createSupabaseAdmin();

export async function POST(request) {
  if (!isSupabaseAvailable()) {
    return new Response(JSON.stringify({ error: "Database service tidak tersedia" }), { status: 503 });
  }

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
  if (!isSupabaseAvailable()) {
    return new Response(JSON.stringify({ error: "Database service tidak tersedia" }), { status: 503 });
  }

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
