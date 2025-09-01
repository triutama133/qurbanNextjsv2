import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { Resend } from "resend"

// Pastikan runtime Node (bcrypt butuh Node)
export const runtime = "nodejs"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function normStr(v) {
  if (v === undefined || v === null) return ""
  return String(v).trim()
}

function firstDefined(...vals) {
  for (const v of vals) {
    if (v !== undefined && v !== null) return v
  }
  return undefined
}

export async function POST(request) {
  try {
    // --- Baca body & headers (debug maksimal)
    const contentType = request.headers.get("content-type") || ""
    let body = {}
    try {
      if (contentType.includes("application/json")) {
        body = await request.json()
      } else {
        const raw = await request.text()
        try {
          body = JSON.parse(raw)
        } catch {
          body = {}
        }
      }
    } catch (e) {
      console.error("[Register] Gagal membaca body:", e)
      return NextResponse.json({ error: "Payload bukan JSON valid" }, { status: 400 })
    }

    console.log("[Register] body keys:", Object.keys(body))
    console.log("[Register] raw body (pretty):", JSON.stringify(body, null, 2))

    // --- Ambil field (dengan fallback alias/casing)
    const UserId           = firstDefined(body.UserId, body.userId, body.userid)
    const Nama             = firstDefined(body.Nama, body.nama, body.fullName)
    const Nickname         = firstDefined(body.Nickname, body.nickname)
    const Provinsi         = firstDefined(body.Provinsi, body.provinsi, body.province)
    const Kota             = firstDefined(body.Kota, body.kota, body.city)
    const Pekerjaan        = firstDefined(body.Pekerjaan, body.pekerjaan, body.job)
    const PosisiRaw        = firstDefined(
      body.PosisiPekerjaan,
      body.posisiPekerjaan,
      body.posisi_pekerjaan,
      body.posisi
    )
    const StatusPernikahan = firstDefined(body.StatusPernikahan, body.statusPernikahan, body.maritalStatus)
    const JumlahAnak       = firstDefined(body.JumlahAnak, body.jumlahAnak, body.childrenCount)
    const NamaPequrban     = firstDefined(body.NamaPequrban, body.namaPequrban, body.pequrbanNames)
    const JumlahPequrban   = firstDefined(body.JumlahPequrban, body.jumlahPequrban, body.jumlah_pequrban)
    const Email            = firstDefined(body.Email, body.email)
    const MetodeTabungan   = firstDefined(body.MetodeTabungan, body.metodeTabungan)
    const QurbanMethod     = firstDefined(body.QurbanMethod, body.qurbanMethod)
    const TargetPribadi    = firstDefined(body.TargetPribadi, body.targetPribadi, body.target_per_peserta)
    const phone_number     = firstDefined(body.phone_number, body.phoneNumber, body.nohp)
  const RangePendapatan  = firstDefined(body.RangePendapatan, body.rangePendapatan, body.range_pendapatan, body.pendapatanRange)
    const Password         = firstDefined(body.Password, body.password)

    // --- Normalisasi string
    const pekerjaanNorm = normStr(Pekerjaan)
    const posisiNorm    = normStr(PosisiRaw)
  const rangeNorm      = normStr(RangePendapatan)
    const statusNorm    = normStr(StatusPernikahan)
    const emailNorm     = normStr(Email)

    // --- Debug nilai penting
    console.log("[Register][DEBUG] Pekerjaan:", pekerjaanNorm)
    console.log("[Register][DEBUG] PosisiPekerjaan(raw):", PosisiRaw)
    console.log("[Register][DEBUG] PosisiPekerjaan(norm):", posisiNorm)
  console.log("[Register][DEBUG] RangePendapatan:", rangeNorm)
    console.log("[Register][DEBUG] StatusPernikahan:", statusNorm)

    // --- Validasi adil & informatif
    const missing = []
    const req = (val, name) => {
      if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
        missing.push(name)
      }
    }

    // Wajib umum
    req(UserId, "UserId")
    req(Nama, "Nama")
    req(Nickname, "Nickname")
    req(Provinsi, "Provinsi")
    req(Kota, "Kota")
  req(rangeNorm, "RangePendapatan")
    req(pekerjaanNorm, "Pekerjaan")
    req(statusNorm, "StatusPernikahan")
    req(emailNorm, "Email")
    req(MetodeTabungan, "MetodeTabungan")
    req(Password, "Password")

    // Posisi wajib jika bukan "Tidak Bekerja"
    const isTidakBekerja = pekerjaanNorm.toLowerCase() === "tidak bekerja"
    if (!isTidakBekerja) {
      req(posisiNorm, "PosisiPekerjaan")
    }

    // Anak wajib jika menikah/previously
    const needsAnak = ["married", "previously married", "sudah menikah"].includes(statusNorm.toLowerCase())
    if (needsAnak) {
      if (JumlahAnak === undefined || JumlahAnak === null || Number.isNaN(Number(JumlahAnak))) {
        missing.push("JumlahAnak")
      }
    }

    // Pequrban
    if (!Array.isArray(NamaPequrban) || NamaPequrban.length < 1) {
      missing.push("NamaPequrban[]")
    }
    if (Number(JumlahPequrban) < 1) {
      missing.push("JumlahPequrban")
    }

    if (missing.length) {
      console.warn("[Register] Missing fields:", missing)
      return NextResponse.json(
        { error: `Data yang dibutuhkan tidak lengkap/salah: ${missing.join(", ")}` },
        { status: 400 }
      )
    }

    if (NamaPequrban.length !== Number(JumlahPequrban)) {
      return NextResponse.json(
        { error: "Jumlah nama pequrban harus sesuai dengan jumlah pequrban." },
        { status: 400 }
      )
    }

    // --- Cek email sudah ada?
    const { data: existingUser, error: existErr } = await supabaseAdmin
      .from("users")
      .select("Email")
      .eq("Email", emailNorm)
      .maybeSingle()
    if (existErr) console.error("[Register] cek existing err:", existErr)
    if (existingUser) {
      return NextResponse.json({ error: "Email ini sudah terdaftar." }, { status: 409 })
    }

    // --- Hash password
    const bcrypt = require("bcryptjs")
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(Password, salt)

    // --- Token verifikasi
    function generateToken(length = 32) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
      let token = ""
      for (let i = 0; i < length; i++) token += chars.charAt(Math.floor(Math.random() * chars.length))
      return token
    }
    const verifyToken = generateToken()
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 jam

    const finalQurbanMethod = QurbanMethod || (MetodeTabungan === "Qurban di Tim" ? "Tim" : "Sendiri")
    const finalJumlahAnak = needsAnak ? Number(JumlahAnak) || 0 : 0

    // --- Insert ke users
    const { error: insertError } = await supabaseAdmin.from("users").insert([
      {
        UserId,
        Nama,
        Nickname,
        Provinsi,
        Kota,
  RangePendapatan: rangeNorm,
        Pekerjaan: pekerjaanNorm,
        PosisiPekerjaan: isTidakBekerja ? "" : posisiNorm,
        StatusPernikahan,
        JumlahAnak: finalJumlahAnak,
        NamaPequrban,
        JumlahPequrban,
        Email: emailNorm,
        Role: "User",
        MetodeTabungan,
        QurbanMethod: finalQurbanMethod,
        StatusSetoran: "Belum Setor",
        TargetPribadi: body.TargetPribadi,
        TanggalDaftar: new Date().toISOString(),
        IsInitialDepositMade: false,
        InitialDepositStatus: "Belum Setor",
        StatusPequrban: ["Normal"],
        phone_number: phone_number || null,
        PasswordHash: passwordHash,
        verify_token: verifyToken,
        verify_token_expiry: verifyTokenExpiry,
        is_verified: false,
      },
    ])

    if (insertError) {
      console.error("[Register] insert error:", insertError)
      return NextResponse.json(
        { error: `Gagal menyimpan data user: ${insertError.message}` },
        { status: 500 }
      )
    }

    // --- Email verifikasi (best-effort)
    const resend = new Resend(process.env.RESEND_API_KEY)
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/qurban/verify-email?token=${verifyToken}`
    try {
      await resend.emails.send({
        from: "noreply@newmo.space",
        to: emailNorm,
        subject: "Verifikasi Akun Tabungan Qurban",
        html: `<p>Halo ${Nama},</p>
          <p>Silakan klik link berikut untuk verifikasi akun Anda:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>Link berlaku 24 jam.</p>`,
      })
    } catch (mailErr) {
      console.error("[Register] kirim email gagal:", mailErr)
    }

    return NextResponse.json(
      { message: "Pendaftaran berhasil! Silakan cek email untuk verifikasi.", verifyUrl },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Register] unhandled:", error)
    return NextResponse.json({ error: `Terjadi kesalahan internal: ${error.message}` }, { status: 500 })
  }
}
