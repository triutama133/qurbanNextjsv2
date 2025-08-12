import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
  try {
    const { userId, NamaPequrban, JumlahPequrban } = await req.json();
    if (!userId || !NamaPequrban || !Array.isArray(NamaPequrban) || NamaPequrban.length === 0 || !JumlahPequrban) {
      return NextResponse.json({ error: 'userId, NamaPequrban (array), dan JumlahPequrban wajib diisi.' }, { status: 400 });
    }

    // Update data pequrban di tabel users
    const { error } = await supabase
      .from('users')
      .update({ NamaPequrban, JumlahPequrban })
      .eq('UserId', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
