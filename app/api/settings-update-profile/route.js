
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
  try {

    const {
      userId,
      Nickname,
      Provinsi,
      Kota,
      Pekerjaan,
      StatusPernikahan,
      JumlahAnak,
      Nama,
      phone_number
    } = await req.json();

    // Logging data masuk
    console.log('[settings-update-profile] Data masuk:', {
      userId, Nickname, Provinsi, Kota, Pekerjaan, StatusPernikahan, JumlahAnak, Nama, phone_number
    });

    // Cek field kosong
    const missingFields = [];
    if (!userId) missingFields.push('userId');
    if (!Nama) missingFields.push('Nama');
    if (!Nickname) missingFields.push('Nickname');
    if (!Provinsi) missingFields.push('Provinsi');
    if (!Kota) missingFields.push('Kota');
    if (!Pekerjaan) missingFields.push('Pekerjaan');
    if (!StatusPernikahan) missingFields.push('StatusPernikahan');
    if (phone_number === undefined || phone_number === null || phone_number === '') missingFields.push('phone_number');

    if (missingFields.length > 0) {
      console.log('[settings-update-profile] Field kosong:', missingFields);
      return NextResponse.json({ error: 'Semua field wajib diisi.', missingFields }, { status: 400 });
    }

    // Update data profil di tabel users
    const { error } = await supabase
      .from('users')
      .update({
        Nickname,
        Provinsi,
        Kota,
        Pekerjaan,
        StatusPernikahan,
        JumlahAnak: StatusPernikahan === 'Sudah Menikah' ? (JumlahAnak || 0) : 0,
        Nama,
        phone_number
      })
      .eq('UserId', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
