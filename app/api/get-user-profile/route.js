import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// GET /api/get-user-profile?userId=xxx
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "userId wajib diisi" }, { status: 400 })
  }
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("UserId", userId)
    .single()
  if (error || !user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
  }
  // Hilangkan hash password jika ada
  if (user.PasswordHash) delete user.PasswordHash
  return NextResponse.json(user)
}
