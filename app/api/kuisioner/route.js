import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function POST(request) {
  try {
    const { user_id, jawaban } = await request.json()
    if (!user_id || !jawaban) {
      return NextResponse.json({ error: "user_id dan jawaban wajib diisi" }, { status: 400 })
    }
    // Cek apakah user sudah pernah submit kuisioner
    const { data: existing } = await supabaseAdmin
      .from("user_kuisioner")
      .select("id")
      .eq("user_id", user_id)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ error: "Kuisioner sudah pernah diisi." }, { status: 409 })
    }
    // Insert jawaban
    const { error } = await supabaseAdmin.from("user_kuisioner").insert([
      { user_id, jawaban }
    ])
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ message: "Jawaban kuisioner berhasil disimpan." }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
