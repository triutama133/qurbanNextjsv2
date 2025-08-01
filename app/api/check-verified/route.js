import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req) {
  try {
    const { email } = await req.json()
    if (!email) {
      return Response.json({ error: "Email wajib diisi." }, { status: 400 })
    }
    // Query ke tabel public.users (atau nama tabel custom Anda)
    const { data, error } = await supabase
      .from("users")
      .select("is_verified")
      .eq("email", email)
      .single()
    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }
    if (!data) {
      return Response.json({ error: "User tidak ditemukan." }, { status: 404 })
    }
    return Response.json({ is_verified: data.is_verified }, { status: 200 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
