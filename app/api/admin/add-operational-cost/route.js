import { createSupabaseAdmin, isSupabaseAvailable } from '../../../../lib/supabase-admin';
import { NextResponse } from 'next/server';

const supabase = createSupabaseAdmin();

export async function POST(request) {
  if (!isSupabaseAvailable()) {
    return NextResponse.json({ error: 'Database service tidak tersedia' }, { status: 503 });
  }

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
