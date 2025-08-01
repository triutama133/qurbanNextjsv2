import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function POST(request) {
  try {
    const { userId, currentPassword, newPassword } = await request.json()
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 })
    }

    // Ambil hash password lama
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("PasswordHash")
      .eq("UserId", userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 })
    }

    // Verifikasi password lama
    const bcrypt = require("bcryptjs")
    const match = await bcrypt.compare(currentPassword, user.PasswordHash)
    if (!match) {
      return NextResponse.json({ error: "Password lama salah." }, { status: 400 })
    }

    // Hash password baru
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    // Update password
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ PasswordHash: passwordHash })
      .eq("UserId", userId)
    if (updateError) {
      return NextResponse.json({ error: "Gagal update password." }, { status: 500 })
    }

    return NextResponse.json({ message: "Password berhasil diperbarui." }, { status: 200 })
  } catch (error) {
    console.error("Kesalahan di API settings-update-password:", error.message)
    return NextResponse.json({ error: `Terjadi kesalahan internal server: ${error.message}` }, { status: 500 })
  }
}
