import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  try {
    const { costId, description, amount } = await request.json();

    // Simpan data ke tabel biayaoperasional
    const { error } = await supabase
      .from('biayaoperasional')
      .insert([
        {
          CostId: costId,
          Deskripsi: description,
          Jumlah: amount,
          Tanggal: new Date().toISOString(),
        },
      ]);

    if (error) throw error;

    return NextResponse.json({ message: 'Biaya operasional berhasil ditambahkan.' });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Gagal menambahkan biaya operasional.' }, { status: 500 });
  }
}
