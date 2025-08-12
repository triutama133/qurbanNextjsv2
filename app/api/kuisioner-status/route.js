import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")
    if (!user_id) {
      return NextResponse.json({ error: "user_id wajib diisi" }, { status: 400 })
    }
    const { data, error } = await supabaseAdmin
      .from("user_kuisioner")
      .select("id")
      .eq("user_id", user_id)
      .maybeSingle()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ filled: !!data }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
