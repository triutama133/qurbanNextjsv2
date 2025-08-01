import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { Resend } from "resend"
import crypto from "crypto"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function POST(request) {
  try {
    const { Email } = await request.json()
    if (!Email) {
      return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 })
    }

    // Cari user
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("UserId, Nama, Email")
      .eq("Email", Email)
      .single()
    if (!user) {
      return NextResponse.json({ error: "Email tidak ditemukan." }, { status: 404 })
    }

    // Generate token dan expiry
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 1000 * 60 * 30).toISOString() // 30 menit, format ISO UTC

    // Simpan token dan expiry di database
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ reset_token: token, reset_token_expiry: expires })
      .eq("UserId", user.UserId)
    if (updateError) {
      return NextResponse.json({ error: "Gagal menyimpan token reset password." }, { status: 500 })
    }

    // Kirim email reset password via Resend
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`
    const resend = new Resend(process.env.RESEND_API_KEY)
    try {
      await resend.emails.send({
        from: "noreply@newmo.space",
        to: Email,
        subject: "Reset Password Tabungan Qurban",
        html: `<p>Halo ${user.Nama},</p>
          <p>Klik link berikut untuk reset password Anda:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Link berlaku 30 menit.</p>`
      })
    } catch (mailErr) {
      console.error("Gagal mengirim email reset password:", mailErr)
      return NextResponse.json({ error: "Gagal mengirim email reset password." }, { status: 500 })
    }

    return NextResponse.json({ message: "Email reset password telah dikirim." }, { status: 200 })
  } catch (error) {
    console.error("Kesalahan di API forgot-password:", error.message)
    return NextResponse.json({ error: `Terjadi kesalahan internal server: ${error.message}` }, { status: 500 })
  }
}
