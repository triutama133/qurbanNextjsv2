// app/api/register-user/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { userId, fullName, pequrbanName, email, metodeTabungan } = await request.json();

    if (!userId || !fullName || !pequrbanName || !email || !metodeTabungan) {
      return NextResponse.json(
        { error: 'Data yang dibutuhkan tidak lengkap.' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar di public.users sebelum insert
    // Ini memberikan pesan error yang lebih jelas dan spesifik
    const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('users')
        .select('Email')
        .eq('Email', email)
        .single();

    if (existingUser) {
        return NextResponse.json(
            { error: 'Email ini sudah terdaftar.' },
            { status: 409 } // 409 Conflict untuk resource yang sudah ada
        );
    }

    // Jika tidak ada error saat memeriksa dan user tidak ditemukan, lakukan insert
    const { data, error: insertError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          "UserId": userId,
          "Nama": fullName,
          "NamaPequrban": pequrbanName,
          "Email": email,
          "Role": "User",
          "MetodeTabungan": metodeTabungan,
          "StatusSetoran": "Belum Setor",
          "TargetPribadi": 2650000,
          "TanggalDaftar": new Date().toISOString(),
          "IsInitialDepositMade": false
        },
      ]);

    if (insertError) {
        // Ini akan menangani error lain selain duplikasi email
        console.error('Error inserting user to public.users:', insertError.message);
        return NextResponse.json(
            { error: `Gagal menyimpan data user: ${insertError.message}` },
            { status: 500 }
        );
    }

    return NextResponse.json(
      { message: 'Data user berhasil disimpan.', data },
      { status: 200 }
    );

  } catch (error) {
    console.error('Kesalahan di API register-user:', error.message);
    return NextResponse.json(
      { error: `Terjadi kesalahan internal server: ${error.message}` },
      { status: 500 }
    );
  }
}