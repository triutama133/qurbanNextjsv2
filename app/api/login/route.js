import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function POST(request) {
  try {
    const { Email, Password } = await request.json()
    if (!Email || !Password) {
      return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 })
    }
    // Cari user berdasarkan email
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("UserId, Email, PasswordHash, Role, Nama, is_verified")
      .eq("Email", Email)
      .single()
    if (userError || !user) {
      return NextResponse.json({ error: "Email tidak ditemukan." }, { status: 404 })
    }
    if (!user.is_verified) {
      return NextResponse.json({ error: "Akun belum diverifikasi. Silakan cek email Anda untuk verifikasi akun." }, { status: 403 })
    }
    // Bandingkan password
    const isMatch = await bcrypt.compare(Password, user.PasswordHash)
    if (!isMatch) {
      return NextResponse.json({ error: "Password salah." }, { status: 401 })
    }
    // Login sukses, kirim data user (tanpa password hash)
    return NextResponse.json({ message: "Login berhasil.", user: {
      UserId: user.UserId,
      Email: user.Email,
      Role: user.Role,
      Nama: user.Nama,
    } }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
