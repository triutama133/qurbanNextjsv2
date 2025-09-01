
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
  try {

    const body = await req.json();

    // normalize keys and accept multiple casings
    const userId = body.userId || body.UserId || body.userid
    const Email = body.Email || body.email
    const Nickname = body.Nickname || body.nickname
    const RangePendapatan = body.RangePendapatan || body.rangePendapatan
    const Provinsi = body.Provinsi || body.provinsi
    const Kota = body.Kota || body.kota
    const Pekerjaan = body.Pekerjaan || body.pekerjaan
    const StatusPernikahan = body.StatusPernikahan || body.statusPernikahan
    const JumlahAnak = body.JumlahAnak || body.jumlahAnak
    const Nama = body.Nama || body.nama
    const phone_number = body.phone_number || body.phoneNumber || body.nohp

    // Logging data masuk (for debugging)
    console.log('[settings-update-profile] Data masuk:', {
      userId, Email, Nickname, RangePendapatan, Provinsi, Kota, Pekerjaan, StatusPernikahan, JumlahAnak, Nama, phone_number
    });

    // If request is email-only, update email and return early
    if (Email && !Nickname && !Nama && !Provinsi && !Kota && !Pekerjaan && !StatusPernikahan && RangePendapatan === undefined) {
      if (!userId) {
        return NextResponse.json({ error: 'userId wajib disertakan untuk update email.' }, { status: 400 })
      }
      const { error: updateErr } = await supabase
        .from('users')
        .update({ Email })
        .eq('UserId', userId)

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

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
  RangePendapatan,
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
