import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Buat Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const KUOTA_SETOR_TIM = 10; // Sesuaikan dengan nilai konstanta Anda

export async function GET(request) {
  try {
    // Hitung jumlah user dengan MetodeTabungan 'Setor ke Tim'
    const { count, error } = await supabaseAdmin
      .from('users')
      .select('UserId', { count: 'exact' })
      .eq('MetodeTabungan', 'Setor ke Tim');

    if (error) {
      console.error('Error counting users for quota:', error.message);
      return NextResponse.json(
        { error: `Gagal mengambil data kuota: ${error.message}` },
        { status: 500 }
      );
    }

    const setorTimCount = count || 0;
    const isSetorTimAvailable = setorTimCount < KUOTA_SETOR_TIM;
    const availableSlots = KUOTA_SETOR_TIM - setorTimCount;

    return NextResponse.json(
      {
        success: true,
        isSetorTimAvailable: isSetorTimAvailable,
        availableSlots: availableSlots,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Kesalahan di API get-registration-options:', error.message);
    return NextResponse.json(
      { error: `Terjadi kesalahan internal server: ${error.message}` },
      { status: 500 }
    );
  }
}
