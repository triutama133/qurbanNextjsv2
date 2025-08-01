
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function POST(request) {
  try {
    const { token, password } = await request.json()
    console.log('DEBUG reset-password: token dari frontend:', token)
    if (!token || !password) {
      return NextResponse.json({ error: "Token dan password baru wajib diisi." }, { status: 400 })
    }


    // Cari user dengan token (reset_token)
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("UserId, reset_token_expiry, reset_token")
      .eq("reset_token", token)
      .single()
    console.log('DEBUG reset-password: hasil query user:', user)
    if (!user) {
      return NextResponse.json({ error: "Token tidak valid." }, { status: 400 })
    }

    // Cek expiry (reset_token_expiry)
    if (!user.reset_token_expiry || new Date(user.reset_token_expiry) < new Date()) {
      return NextResponse.json({ error: "Token sudah kadaluarsa." }, { status: 400 })
    }

    // Hash password baru
    const bcrypt = require("bcryptjs")
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Update password dan hapus token
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ PasswordHash: passwordHash, reset_token: null, reset_token_expiry: null })
      .eq("UserId", user.UserId)
    if (updateError) {
      return NextResponse.json({ error: "Gagal update password." }, { status: 500 })
    }

    return NextResponse.json({ message: "Password berhasil direset. Silakan login dengan password baru." }, { status: 200 })
  } catch (error) {
    console.error("Kesalahan di API reset-password:", error.message)
    return NextResponse.json({ error: `Terjadi kesalahan internal server: ${error.message}` }, { status: 500 })
  }
}
