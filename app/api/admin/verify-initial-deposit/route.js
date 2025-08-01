import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
  try {
    const { userId, status } = await req.json();
    if (!userId || !status) {
      return Response.json({ success: false, message: 'userId and status are required' }, { status: 400 });
    }

    // 1. Update InitialDepositStatus di tabel users
    const { error: userError } = await supabase
      .from('users')
      .update({ InitialDepositStatus: status })
      .eq('UserId', userId);
    if (userError) {
      return Response.json({ success: false, message: userError.message }, { status: 500 });
    }

    // 2. Update VerificationStatus di tabel tabungan untuk setoran awal milik user ini
    const { error: tabunganError } = await supabase
      .from('tabungan')
      .update({ VerificationStatus: status })
      .eq('UserId', userId)
      .eq('Metode', 'Setoran Awal')
      .eq('VerificationStatus', 'Pending');
    if (tabunganError) {
      return Response.json({ success: false, message: tabunganError.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}
