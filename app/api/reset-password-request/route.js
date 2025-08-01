import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function generateToken(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
    }

    // Cari user berdasarkan email
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("UserId, Nama")
      .eq("Email", email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "Email tidak ditemukan." }, { status: 404 });
    }

    // Generate token dan expiry (1 jam)
    const token = generateToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Simpan token dan expiry di tabel users
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ reset_token: token, reset_token_expiry: expiry })
      .eq("UserId", user.UserId);

    if (updateError) {
      return NextResponse.json({ error: "Gagal menyimpan token reset." }, { status: 500 });
    }

    // Kirim email via Resend
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "noreply@newmo.space",
      to: email,
      subject: "Reset Password Tabungan Qurban",
      html: `<p>Halo ${user.Nama || ""},<br/>Klik link berikut untuk reset password Anda:<br/><a href='${resetUrl}'>Reset Password</a><br/>Link ini berlaku 1 jam.</p>`
    });

    return NextResponse.json({ message: "Email reset password telah dikirim." }, { status: 200 });
  } catch (err) {
    console.error("Error reset-password-request:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
