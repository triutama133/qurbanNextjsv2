export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token verifikasi tidak ditemukan." }, { status: 400 });
    }

    // Cari user dengan token
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("UserId, verify_token_expiry, is_verified")
      .eq("verify_token", token)
      .single();
    if (!user) {
      return NextResponse.json({ error: "Token verifikasi tidak valid." }, { status: 400 });
    }
    if (user.is_verified) {
      return NextResponse.json({ message: "Akun sudah diverifikasi." }, { status: 200 });
    }
    if (!user.verify_token_expiry || new Date(user.verify_token_expiry) < new Date()) {
      return NextResponse.json({ error: "Token verifikasi sudah kadaluarsa." }, { status: 400 });
    }

    // Update user: set is_verified true, hapus token
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ is_verified: true, verify_token: null, verify_token_expiry: null })
      .eq("UserId", user.UserId);
    if (updateError) {
      return NextResponse.json({ error: "Gagal memverifikasi akun." }, { status: 500 });
    }

    return NextResponse.json({ message: "Akun berhasil diverifikasi. Silakan login." }, { status: 200 });
  } catch (err) {
    console.error("Error verify-email:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Token verifikasi wajib diisi." }, { status: 400 });
    }

    // Cari user berdasarkan token dan cek expiry
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("UserId, verify_token_expiry")
      .eq("verify_token", token)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "Token tidak valid." }, { status: 400 });
    }
    if (new Date(user.verify_token_expiry) < new Date()) {
      return NextResponse.json({ error: "Token sudah kadaluarsa." }, { status: 400 });
    }

    // Update status email terverifikasi
    await supabaseAdmin
      .from("users")
      .update({ verify_token: null, verify_token_expiry: null, is_verified: true })
      .eq("UserId", user.UserId);

    return NextResponse.json({ message: "Email berhasil diverifikasi." }, { status: 200 });
  } catch (err) {
    console.error("Error verify-email:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
