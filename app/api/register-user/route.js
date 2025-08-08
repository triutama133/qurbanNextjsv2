
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { Resend } from "resend"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function POST(request) {
  try {
    const {
      UserId,
      Nama,
      NamaPequrban,
      JumlahPequrban,
      Email,
      MetodeTabungan,
      QurbanMethod,
      TargetPribadi,
      phone_number,
      Password
    } = await request.json()

    // Validasi data wajib
    if (!UserId || !Nama || !NamaPequrban || !Array.isArray(NamaPequrban) || NamaPequrban.length < 1 || !JumlahPequrban || !Email || !MetodeTabungan || !Password) {
      return NextResponse.json({ error: "Data yang dibutuhkan tidak lengkap atau format salah." }, { status: 400 })
    }
    if (NamaPequrban.length !== Number(JumlahPequrban)) {
      return NextResponse.json({ error: "Jumlah nama pequrban harus sesuai dengan jumlah pequrban." }, { status: 400 })
    }

    // Cek apakah email sudah terdaftar di public.users sebelum insert
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("Email")
      .eq("Email", Email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "Email ini sudah terdaftar." }, { status: 409 })
    }

    // Hash password
    const bcrypt = require("bcryptjs")
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(Password, salt)

    // Generate token verifikasi
    function generateToken(length = 32) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let token = "";
      for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return token;
    }
    const verifyToken = generateToken();
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 jam

    // TargetPribadi sudah dihitung di frontend, cukup gunakan saja
    // Insert user dengan password hash dan token verifikasi
    const { data, error: insertError } = await supabaseAdmin.from("users").insert([
      {
        UserId,
        Nama,
        NamaPequrban,
        JumlahPequrban,
        Email,
        Role: "User",
        MetodeTabungan,
        QurbanMethod: QurbanMethod || (MetodeTabungan === "Qurban di Tim" ? "Tim" : "Sendiri"),
        StatusSetoran: "Belum Setor",
        TargetPribadi,
        TanggalDaftar: new Date().toISOString(),
        IsInitialDepositMade: false,
        InitialDepositStatus: "Pending",
        StatusPequrban: ["Normal"],
        phone_number: phone_number || null,
        PasswordHash: passwordHash,
        verify_token: verifyToken,
        verify_token_expiry: verifyTokenExpiry,
        is_verified: false,
      },
    ])

    if (insertError) {
      console.error("Error inserting user to public.users:", insertError.message)
      return NextResponse.json({ error: `Gagal menyimpan data user: ${insertError.message}` }, { status: 500 })
    }

    // Kirim email verifikasi via Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/verify-email?token=${verifyToken}`;
    try {
      await resend.emails.send({
        from: "noreply@newmo.space",
        to: Email,
        subject: "Verifikasi Akun Tabungan Qurban",
        html: `<p>Halo ${Nama},</p>
          <p>Terima kasih telah mendaftar. Silakan klik link berikut untuk verifikasi akun Anda:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>Link berlaku 24 jam. Jika Anda tidak mendaftar, abaikan email ini.</p>`
      })
    } catch (mailErr) {
      console.error("Gagal mengirim email verifikasi:", mailErr)
      // Email error tidak menghalangi pendaftaran
    }

    // Beri notifikasi berhasil register dan sertakan link verifikasi email
    return NextResponse.json({ 
      message: "Pendaftaran berhasil! Silakan cek email untuk verifikasi akun.", 
      verifyUrl 
    }, { status: 200 })
  } catch (error) {
    console.error("Kesalahan di API register-user:", error.message)
    return NextResponse.json({ error: `Terjadi kesalahan internal server: ${error.message}` }, { status: 500 })
  }
}
